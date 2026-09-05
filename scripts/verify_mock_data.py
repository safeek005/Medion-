import json
from pathlib import Path
import sys

def verify_mock_data():
    base_dir = Path(__file__).resolve().parent.parent
    mock_dir = base_dir / "mock-data"
    
    required_files = [
        "patients.json", "doctors.json", "nurses.json", "hospitals.json",
        "laboratories.json", "insurance_providers.json", "insurance_policies.json",
        "appointments.json", "medical_records.json", "lab_reports.json",
        "prescriptions.json", "bills.json", "insurance_claims.json", "notifications.json"
    ]
    
    print("==================================================")
    print("MEDION AGENT - MOCK DATA RELATIONAL INTEGRITY TEST")
    print("==================================================\n")
    
    data = {}
    missing_files = []
    
    # 1. Load files
    for fname in required_files:
        fpath = mock_dir / fname
        if not fpath.exists():
            print(f"[FAIL] Missing required mock dataset: {fname}")
            missing_files.append(fname)
        else:
            with open(fpath, "r", encoding="utf-8") as f:
                try:
                    content = json.load(f)
                    key_name = fname.replace(".json", "")
                    data[key_name] = content
                    print(f"[PASS] Loaded {fname} ({len(content)} records)")
                except Exception as e:
                    print(f"[FAIL] Invalid JSON in {fname}: {e}")
                    missing_files.append(fname)

    if missing_files:
        print(f"\nVerification FAILED. {len(missing_files)} file errors detected.")
        sys.exit(1)

    # 2. Extract Key Sets
    patient_ids = {p["patient_id"] for p in data["patients"]}
    doctor_ids = {d["doctor_id"] for d in data["doctors"]}
    hospital_ids = {h["hospital_id"] for h in data["hospitals"]}
    provider_ids = {ip["provider_id"] for ip in data["insurance_providers"]}
    policy_ids = {pol["policy_id"] for pol in data["insurance_policies"]}
    lab_ids = {l["lab_id"] for l in data["laboratories"]}
    bill_ids = {b["bill_id"] for b in data["bills"]}

    errors = []

    # 3. Check Relationships
    for p in data["patients"]:
        if p["primary_doctor_id"] not in doctor_ids:
            errors.append(f"Patient {p['patient_id']} references unknown doctor {p['primary_doctor_id']}")
        if p["insurance_policy_id"] not in policy_ids:
            errors.append(f"Patient {p['patient_id']} references unknown policy {p['insurance_policy_id']}")

    for pol in data["insurance_policies"]:
        if pol["patient_id"] not in patient_ids:
            errors.append(f"Policy {pol['policy_id']} references unknown patient {pol['patient_id']}")
        if pol["provider_id"] not in provider_ids:
            errors.append(f"Policy {pol['policy_id']} references unknown provider {pol['provider_id']}")

    for apt in data["appointments"]:
        if apt["patient_id"] not in patient_ids:
            errors.append(f"Appointment {apt['appointment_id']} references unknown patient {apt['patient_id']}")
        if apt["doctor_id"] not in doctor_ids:
            errors.append(f"Appointment {apt['appointment_id']} references unknown doctor {apt['doctor_id']}")
        if apt["hospital_id"] not in hospital_ids:
            errors.append(f"Appointment {apt['appointment_id']} references unknown hospital {apt['hospital_id']}")

    for lr in data["lab_reports"]:
        if lr["patient_id"] not in patient_ids:
            errors.append(f"LabReport {lr['report_id']} references unknown patient {lr['patient_id']}")
        if lr["doctor_id"] not in doctor_ids:
            errors.append(f"LabReport {lr['report_id']} references unknown doctor {lr['doctor_id']}")
        if lr["lab_id"] not in lab_ids:
            errors.append(f"LabReport {lr['report_id']} references unknown lab {lr['lab_id']}")

    for clm in data["insurance_claims"]:
        if clm["patient_id"] not in patient_ids:
            errors.append(f"Claim {clm['claim_id']} references unknown patient {clm['patient_id']}")
        if clm["policy_id"] not in policy_ids:
            errors.append(f"Claim {clm['claim_id']} references unknown policy {clm['policy_id']}")
        if clm["provider_id"] not in provider_ids:
            errors.append(f"Claim {clm['claim_id']} references unknown provider {clm['provider_id']}")
        if clm["bill_id"] not in bill_ids:
            errors.append(f"Claim {clm['claim_id']} references unknown bill {clm['bill_id']}")

    print("\n--------------------------------------------------")
    if errors:
        print(f"[FAIL] Found {len(errors)} relational integrity issues:")
        for err in errors:
            print(f"  - {err}")
        sys.exit(1)
    else:
        print("[SUCCESS] All 14 mock datasets are valid and fully interconnected!")
        print("--------------------------------------------------")

if __name__ == "__main__":
    verify_mock_data()
