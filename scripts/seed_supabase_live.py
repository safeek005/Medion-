#!/usr/bin/env python3
"""
MEDION V2 — Live Supabase Seeding Script
Populates the 10 synthetic patients (PAT-1001 to PAT-1010 + PAT-1025) and associated domain data
directly into the live Supabase cloud database via PostgREST API using the Service Role Key.
Resolves foreign key UUIDs dynamically for relational integrity.
"""

import os
import json
import urllib.request
import urllib.parse
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
MOCK_DATA_DIR = BASE_DIR / "mock-data"

SUPABASE_URL = os.getenv("SUPABASE_URL", "https://cvjjumwflwjwqyqgymqs.supabase.co")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", os.getenv("SUPABASE_ANON_KEY", "sb_publishable_h1gg8lGZR7ABgbqaDoMkNw_qBoq_5IN"))

def load_json(filename: str):
    path = MOCK_DATA_DIR / filename
    if not path.exists():
        print(f"Warning: File {filename} not found.")
        return []
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

def rest_request(endpoint: str, method: str = "GET", data=None):
    url = f"{SUPABASE_URL.rstrip('/')}/rest/v1/{endpoint}"
    headers = {
        "apikey": SUPABASE_SERVICE_KEY,
        "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates,return=representation"
    }
    body = json.dumps(data).encode("utf-8") if data is not None else None
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as resp:
            res_body = resp.read().decode("utf-8")
            if res_body:
                return json.loads(res_body)
            return []
    except urllib.error.HTTPError as e:
        err_msg = e.read().decode("utf-8")
        if "409" in str(e.code) or "duplicate" in err_msg.lower():
            # Batch conflict: try item-by-item
            results = []
            if isinstance(data, list):
                for item in data:
                    try:
                        b = json.dumps(item).encode("utf-8")
                        r = urllib.request.Request(url, data=b, headers=headers, method=method)
                        with urllib.request.urlopen(r) as res2:
                            rb = res2.read().decode("utf-8")
                            if rb:
                                results.extend(json.loads(rb))
                    except Exception:
                        pass
            return results
        print(f"[{endpoint}] Error {e.code}: {err_msg}")
        return []

def seed_all():
    print("==========================================================")
    print("STARTING LIVE SUPABASE DATABASE SEEDING")
    print("==========================================================")

    # 1. Doctors
    raw_doctors = load_json("doctors.json")
    doctor_records = []
    for d in raw_doctors:
        doctor_records.append({
            "doctor_id": d.get("doctor_id"),
            "name": d.get("doctor_name") or f"Dr. {d.get('first_name', '')} {d.get('last_name', '')}".strip(),
            "specialization": d.get("department") or d.get("specialty") or "General Medicine",
            "department": d.get("department") or d.get("specialty") or "General Medicine",
            "status": "ACTIVE"
        })
    doctors_res = rest_request("doctors", method="POST", data=doctor_records)
    print(f"[doctors] Seeded {len(doctors_res)} doctors.")

    # Fetch doctor ID map
    all_doctors = rest_request("doctors?select=id,doctor_id")
    doc_map = {d["doctor_id"]: d["id"] for d in all_doctors if d.get("doctor_id")}

    # 2. Patients
    raw_patients = load_json("patients.json")
    patient_records = []
    for p in raw_patients:
        patient_records.append({
            "patient_id": p.get("patient_id"),
            "first_name": p.get("first_name"),
            "last_name": p.get("last_name"),
            "date_of_birth": p.get("dob") or p.get("date_of_birth"),
            "gender": p.get("gender"),
            "phone": p.get("phone"),
            "email": p.get("email"),
            "address": p.get("address"),
            "status": "ACTIVE"
        })
    patients_res = rest_request("patients", method="POST", data=patient_records)
    print(f"[patients] Seeded {len(patients_res)} patients.")

    # Fetch patient ID map
    all_patients = rest_request("patients?select=id,patient_id")
    pat_map = {p["patient_id"]: p["id"] for p in all_patients if p.get("patient_id")}

    default_doc_uuid = list(doc_map.values())[0] if doc_map else None

    # 3. Appointments
    raw_apts = load_json("appointments.json")
    apt_records = []
    for a in raw_apts:
        pid = a.get("patient_id")
        did = a.get("doctor_id")
        p_uuid = pat_map.get(pid)
        d_uuid = doc_map.get(did, default_doc_uuid)

        if p_uuid and d_uuid:
            apt_records.append({
                "appointment_id": a.get("appointment_id"),
                "patient_id": p_uuid,
                "doctor_id": d_uuid,
                "appointment_date": a.get("appointment_date") or "2026-09-18",
                "start_time": a.get("time_slot", "10:00-10:30").split("-")[0],
                "end_time": a.get("time_slot", "10:00-10:30").split("-")[1] if "-" in a.get("time_slot", "") else "10:30",
                "appointment_type": "Consultation",
                "status": a.get("status") or "CONFIRMED",
                "reason": a.get("reason") or "Clinical Consultation"
            })
    apts_res = rest_request("appointments", method="POST", data=apt_records)
    print(f"[appointments] Seeded {len(apts_res)} appointments.")

    # 4. Medical Records
    raw_records = load_json("medical_records.json")
    rec_records = []
    for r in raw_records:
        pid = r.get("patient_id")
        p_uuid = pat_map.get(pid)
        d_uuid = doc_map.get(r.get("primary_doctor_id"), default_doc_uuid)
        if p_uuid and d_uuid:
            rec_records.append({
                "patient_id": p_uuid,
                "doctor_id": d_uuid,
                "record_type": "Progress Note",
                "diagnosis_description": r.get("summary") or "Hypertension & Clinical Review",
                "notes": r.get("notes") or "Patient condition stable under current medication.",
                "record_date": r.get("recorded_at", "2026-09-16")[:10]
            })
    recs_res = rest_request("medical_records", method="POST", data=rec_records)
    print(f"[medical_records] Seeded {len(recs_res)} medical records.")

    # 5. Lab Reports
    raw_labs = load_json("lab_reports.json")
    lab_records = []
    for l in raw_labs:
        pid = l.get("patient_id")
        p_uuid = pat_map.get(pid)
        if p_uuid:
            lab_records.append({
                "report_id": l.get("report_id"),
                "patient_id": p_uuid,
                "doctor_id": default_doc_uuid,
                "test_name": l.get("test_name") or "Diagnostic Test",
                "status": l.get("status") or "COMPLETED"
            })
    labs_res = rest_request("lab_reports", method="POST", data=lab_records)
    print(f"[lab_reports] Seeded {len(labs_res)} lab reports.")

    # 6. Prescriptions
    raw_rx = load_json("prescriptions.json")
    rx_records = []
    for rx in raw_rx:
        pid = rx.get("patient_id")
        p_uuid = pat_map.get(pid)
        if p_uuid:
            items = rx.get("items", [])
            first_item = items[0] if items else {}
            rx_records.append({
                "prescription_id": rx.get("prescription_id"),
                "patient_id": p_uuid,
                "doctor_id": default_doc_uuid,
                "medication_name": first_item.get("medication", "Telmisartan"),
                "dosage": first_item.get("dosage", "40mg"),
                "frequency": first_item.get("frequency", "Once Daily"),
                "duration": first_item.get("duration", "30 Days"),
                "status": rx.get("status") or "ACTIVE"
            })
    rx_res = rest_request("prescriptions", method="POST", data=rx_records)
    print(f"[prescriptions] Seeded {len(rx_res)} prescriptions.")

    # 7. Insurance Policies
    raw_pols = load_json("insurance_policies.json")
    pol_records = []
    for pol in raw_pols:
        pid = pol.get("patient_id")
        p_uuid = pat_map.get(pid)
        if p_uuid:
            pol_records.append({
                "policy_id": pol.get("policy_id"),
                "patient_id": p_uuid,
                "provider_name": pol.get("provider_name") or "Star Health",
                "policy_number": pol.get("policy_number") or pol.get("policy_id"),
                "coverage_amount": float(pol.get("coverage_limit") or 500000),
                "remaining_coverage": float(pol.get("remaining_coverage") or 450000),
                "copay_percentage": float(pol.get("copay_percentage") or 10),
                "status": pol.get("status") or "ACTIVE"
            })
    pols_res = rest_request("insurance_policies", method="POST", data=pol_records)
    print(f"[insurance_policies] Seeded {len(pols_res)} insurance policies.")

    # Fetch policy ID map
    all_pols = rest_request("insurance_policies?select=id,policy_id")
    pol_map = {pol["policy_id"]: pol["id"] for pol in all_pols if pol.get("policy_id")}

    # 8. Insurance Claims
    raw_claims = load_json("insurance_claims.json")
    claim_records = []
    for clm in raw_claims:
        pid = clm.get("patient_id")
        pol_id = clm.get("policy_id")
        p_uuid = pat_map.get(pid)
        pol_uuid = pol_map.get(pol_id)
        if p_uuid:
            claim_records.append({
                "claim_id": clm.get("claim_id"),
                "patient_id": p_uuid,
                "policy_id": pol_uuid,
                "claim_amount": float(clm.get("claim_amount") or 15000),
                "status": clm.get("status") or "SUBMITTED",
                "adjudication_notes": clm.get("adjudication_notes") or "Pending verification"
            })
    claims_res = rest_request("insurance_claims", method="POST", data=claim_records)
    print(f"[insurance_claims] Seeded {len(claims_res)} insurance claims.")

    # 9. Vitals
    raw_vitals = load_json("vitals.json")
    vital_records = []
    for v in raw_vitals:
        pid = v.get("patient_id")
        p_uuid = pat_map.get(pid)
        if p_uuid:
            vital_records.append({
                "patient_id": p_uuid,
                "heart_rate": int(v.get("heart_rate") or 72),
                "temperature": float(v.get("temperature") or 98.6),
                "respiratory_rate": int(v.get("respiratory_rate") or 16),
                "recorded_at": v.get("recorded_at") or "2026-09-17T10:00:00Z"
            })
    vitals_res = rest_request("vitals", method="POST", data=vital_records)
    print(f"[vitals] Seeded {len(vitals_res)} vitals.")

    print("==========================================================")
    print("FINISHED LIVE SUPABASE DATABASE SEEDING")
    print("==========================================================")

if __name__ == "__main__":
    seed_all()
