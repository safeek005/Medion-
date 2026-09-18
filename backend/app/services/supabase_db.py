import os
import json
import logging
from pathlib import Path
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
import urllib.request
import urllib.error
import urllib.parse

try:
    from dotenv import load_dotenv
    base_dir = Path(__file__).resolve().parent.parent.parent.parent
    load_dotenv(base_dir / "backend" / ".env")
    load_dotenv(base_dir / ".env")
except Exception:
    pass

logger = logging.getLogger("medion.supabase")

class SupabaseDatabaseService:
    """
    Centralized Supabase Database Service using PostgREST HTTP REST API.
    Provides authoritative persistence for MEDION Healthcare AI Platform.
    """
    DEFAULT_SUPABASE_URL = "https://cvjjumwflwjwqyqgymqs.supabase.co"

    def __init__(self, supabase_url: Optional[str] = None, supabase_key: Optional[str] = None):
        self.supabase_url = supabase_url or os.getenv("SUPABASE_URL") or os.getenv("VITE_SUPABASE_URL") or self.DEFAULT_SUPABASE_URL
        self.supabase_key = (
            supabase_key or
            os.getenv("SUPABASE_SERVICE_ROLE_KEY") or
            os.getenv("SUPABASE_KEY") or
            os.getenv("SUPABASE_ANON_KEY") or
            os.getenv("VITE_SUPABASE_PUBLISHABLE_KEY") or
            ""
        )
        self.rest_url = f"{self.supabase_url.rstrip('/')}/rest/v1"

    def is_configured(self) -> bool:
        return bool(self.supabase_url and self.supabase_key and len(self.supabase_key) > 10)

    def _get_headers(self) -> Dict[str, str]:
        return {
            "apikey": self.supabase_key,
            "Authorization": f"Bearer {self.supabase_key}",
            "Content-Type": "application/json",
            "Prefer": "return=representation"
        }

    def _request(self, endpoint: str, method: str = "GET", data: Optional[Dict[str, Any]] = None) -> Any:
        if not self.is_configured():
            raise RuntimeError("Supabase credentials not configured.")

        url = f"{self.rest_url}/{endpoint}"
        body = json.dumps(data).encode("utf-8") if data is not None else None
        headers = self._get_headers()

        req = urllib.request.Request(url, data=body, headers=headers, method=method)
        with urllib.request.urlopen(req, timeout=8) as response:
            res_body = response.read().decode("utf-8")
            if res_body:
                return json.loads(res_body)
            return None

    def _flatten_relational_record(self, record: Dict[str, Any]) -> Dict[str, Any]:
        """
        Flatten PostgREST expanded objects ('patients', 'doctors') into clean top-level
        fields, replacing raw UUID foreign keys with human-readable IDs ('PAT-XXXX', 'DOC-XXXX')
        and full names.
        """
        if not isinstance(record, dict):
            return record
        res = dict(record)

        # 1. Expand patients join if present
        if "patients" in res and isinstance(res["patients"], dict):
            p = res.pop("patients")
            human_pid = p.get("patient_id")
            if human_pid:
                res["patient_human_id"] = human_pid
                # If top-level patient_id is UUID string, replace with human ID
                if isinstance(res.get("patient_id"), str) and len(res["patient_id"]) > 20:
                    res["patient_uuid"] = res["patient_id"]
                    res["patient_id"] = human_pid
            fname = (p.get("first_name") or "").strip()
            lname = (p.get("last_name") or "").strip()
            full_name = f"{fname} {lname}".strip()
            if full_name:
                res["patient_name"] = full_name
            elif p.get("name"):
                res["patient_name"] = p.get("name")

        # 2. Expand doctors join if present
        if "doctors" in res and isinstance(res["doctors"], dict):
            d = res.pop("doctors")
            human_did = d.get("doctor_id")
            if human_did:
                res["doctor_human_id"] = human_did
                if isinstance(res.get("doctor_id"), str) and len(res["doctor_id"]) > 20:
                    res["doctor_uuid"] = res["doctor_id"]
                    res["doctor_id"] = human_did
            if d.get("name"):
                res["doctor_name"] = d.get("name")

        # 3. Fallback resolution for raw patient UUIDs if join was not performed
        if isinstance(res.get("patient_id"), str) and len(res["patient_id"]) > 20 and not res.get("patient_name"):
            p_rec = self.find_one("patients", "id", res["patient_id"])
            if p_rec:
                res["patient_uuid"] = res["patient_id"]
                res["patient_id"] = p_rec.get("patient_id", res["patient_id"])
                fname = (p_rec.get("first_name") or "").strip()
                lname = (p_rec.get("last_name") or "").strip()
                res["patient_name"] = f"{fname} {lname}".strip()

        # 4. Fallback resolution for raw doctor UUIDs if join was not performed
        if isinstance(res.get("doctor_id"), str) and len(res["doctor_id"]) > 20 and not res.get("doctor_name"):
            d_rec = self.find_one("doctors", "id", res["doctor_id"])
            if d_rec:
                res["doctor_uuid"] = res["doctor_id"]
                res["doctor_id"] = d_rec.get("doctor_id", res["doctor_id"])
                res["doctor_name"] = d_rec.get("name", "")

        return res

    # --------------------------------------------------------------------------
    # GENERIC COLLECTION METHODS
    # --------------------------------------------------------------------------

    def get_collection(self, table_name: str) -> List[Dict[str, Any]]:
        raw_table = table_name.split("?")[0]
        query_params = table_name.split("?")[1] if "?" in table_name else ""

        if "select=" not in query_params:
            ep = f"{raw_table}?select=*"
            if query_params:
                ep += f"&{query_params}"
        else:
            ep = table_name

        res = self._request(ep)
        if isinstance(res, list):
            return [self._flatten_relational_record(r) for r in res]
        return []

    def get_patients(self) -> List[Dict[str, Any]]:
        return self.get_collection("patients?order=created_at.desc")

    def find_one(self, table_name: str, key: str, value: Any) -> Optional[Dict[str, Any]]:
        search_val = value
        # Resolve foreign key UUIDs if looking up by human ID on tables with UUID foreign keys
        if table_name in ["appointments", "medical_records", "prescriptions", "lab_reports", "insurance_claims"] and key == "doctor_id" and str(value).startswith("DOC-"):
            d = self.find_one("doctors", "doctor_id", value)
            if d and d.get("id"):
                search_val = d["id"]
        elif table_name in ["appointments", "medical_records", "prescriptions", "lab_reports", "insurance_claims"] and key == "patient_id" and str(value).startswith("PAT-"):
            p = self.find_one("patients", "patient_id", value)
            if p and p.get("id"):
                search_val = p["id"]

        val_encoded = urllib.parse.quote(str(search_val))
        try:
            select_str = "select=*"
            if table_name in ["appointments", "medical_records", "prescriptions"]:
                select_str = "select=*,patients(id,patient_id,first_name,last_name),doctors(id,doctor_id,name)"
            elif table_name in ["lab_reports", "insurance_claims"]:
                select_str = "select=*,patients(id,patient_id,first_name,last_name)"

            res = self._request(f"{table_name}?{key}=eq.{val_encoded}&{select_str}&limit=1")
            if isinstance(res, list) and len(res) > 0:
                return self._flatten_relational_record(res[0])
        except Exception as e:
            logger.warning(f"Supabase find_one error on {table_name}.{key}={value}: {e}")
        return None

    def find_many(self, table_name: str, key: str, value: Any) -> List[Dict[str, Any]]:
        search_val = value
        if table_name in ["appointments", "medical_records", "prescriptions", "lab_reports", "insurance_claims"] and key == "doctor_id" and str(value).startswith("DOC-"):
            d = self.find_one("doctors", "doctor_id", value)
            if d and d.get("id"):
                search_val = d["id"]
        elif table_name in ["appointments", "medical_records", "prescriptions", "lab_reports", "insurance_claims"] and key == "patient_id" and str(value).startswith("PAT-"):
            p = self.find_one("patients", "patient_id", value)
            if p and p.get("id"):
                search_val = p["id"]

        val_encoded = urllib.parse.quote(str(search_val))
        try:
            select_str = "select=*"
            if table_name in ["appointments", "medical_records", "prescriptions"]:
                select_str = "select=*,patients(id,patient_id,first_name,last_name),doctors(id,doctor_id,name)"
            elif table_name in ["lab_reports", "insurance_claims"]:
                select_str = "select=*,patients(id,patient_id,first_name,last_name)"

            res = self._request(f"{table_name}?{key}=eq.{val_encoded}&{select_str}")
            if isinstance(res, list):
                return [self._flatten_relational_record(r) for r in res]
            return []
        except Exception as e:
            logger.warning(f"Supabase find_many error on {table_name}.{key}={value}: {e}")
            return []

    # --------------------------------------------------------------------------
    # PATIENTS CRUD
    # --------------------------------------------------------------------------

    def search_patients(self, query: str) -> List[Dict[str, Any]]:
        q_enc = urllib.parse.quote(f"%{query}%")
        filter_str = f"or=(first_name.ilike.{q_enc},last_name.ilike.{q_enc},patient_id.ilike.{q_enc},phone.ilike.{q_enc},email.ilike.{q_enc})"
        res = self._request(f"patients?{filter_str}&select=*")
        return res if isinstance(res, list) else []

    def generate_patient_id(self) -> str:
        res = self._request("patients?select=patient_id&order=created_at.desc&limit=50")
        max_id = 1000
        if isinstance(res, list):
            for item in res:
                pid = item.get("patient_id", "")
                if pid.startswith("PAT-"):
                    try:
                        num = int(pid.split("-")[1])
                        if num > max_id:
                            max_id = num
                    except ValueError:
                        pass
        return f"PAT-{max_id + 1}"

    def add_patient(self, patient_data: Dict[str, Any]) -> Dict[str, Any]:
        res = self._request("patients", method="POST", data=patient_data)
        if isinstance(res, list) and len(res) > 0:
            return res[0]
        return patient_data

    def update_patient(self, patient_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        pid_enc = urllib.parse.quote(patient_id)
        allowed_fields = {
            "first_name", "last_name", "dob", "gender", "blood_group",
            "phone", "email", "address", "emergency_contact",
            "primary_doctor_id", "insurance_policy_id"
        }
        filtered = {k: v for k, v in updates.items() if k in allowed_fields and v is not None}
        if filtered:
            res = self._request(f"patients?patient_id=eq.{pid_enc}", method="PATCH", data=filtered)
            if isinstance(res, list) and len(res) > 0:
                return res[0]
        return self.find_one("patients", "patient_id", patient_id)

    # --------------------------------------------------------------------------
    # APPOINTMENTS CRUD & CONFLICT CHECKING
    # --------------------------------------------------------------------------

    def generate_appointment_id(self) -> str:
        res = self._request("appointments?select=appointment_id&order=created_at.desc&limit=50")
        max_id = 1000
        if isinstance(res, list):
            for item in res:
                aid = item.get("appointment_id", "")
                if aid.startswith("APT-"):
                    try:
                        num = int(aid.split("-")[1])
                        if num > max_id:
                            max_id = num
                    except ValueError:
                        pass
        return f"APT-{max_id + 1}"

    def add_appointment(self, appointment_data: Dict[str, Any]) -> Dict[str, Any]:
        # Translate to Supabase V2 schema
        # 1. Resolve patient UUID if PAT-xxxx provided
        patient_id = appointment_data.get("patient_id")
        patient_human_id = patient_id
        patient_name = appointment_data.get("patient_name", "")

        if patient_id and str(patient_id).startswith("PAT-"):
            p_rec = self.find_one("patients", "patient_id", patient_id)
            if p_rec and p_rec.get("id"):
                patient_uuid = p_rec["id"]
                if not patient_name:
                    patient_name = f"{p_rec.get('first_name', '')} {p_rec.get('last_name', '')}".strip()
            else:
                patient_uuid = "19beceb5-d6c0-4f59-9dea-642f0c8adeb6"
        else:
            p_rec = self.find_one("patients", "id", patient_id) if patient_id else None
            if p_rec:
                patient_uuid = patient_id
                patient_human_id = p_rec.get("patient_id", patient_id or "PAT-1001")
                if not patient_name:
                    patient_name = f"{p_rec.get('first_name', '')} {p_rec.get('last_name', '')}".strip()
            else:
                patient_uuid = patient_id

        # 2. Resolve doctor UUID if DOC-xxx provided
        doctor_id = appointment_data.get("doctor_id")
        if doctor_id and str(doctor_id).startswith("DOC-"):
            d_rec = self.find_one("doctors", "doctor_id", doctor_id)
            if d_rec and d_rec.get("id"):
                doctor_uuid = d_rec["id"]
            else:
                doctor_uuid = "527543fd-0b14-4596-b044-b1ff153958de" # Default DOC-101
        else:
            doctor_uuid = doctor_id or "527543fd-0b14-4596-b044-b1ff153958de"

        # 3. Resolve times
        time_slot = appointment_data.get("time_slot", "10:00-10:30")
        parts = time_slot.split("-")
        start_time = parts[0].strip() if len(parts) > 0 else "10:00"
        end_time = parts[1].strip() if len(parts) > 1 else "10:30"
        if len(start_time) == 5:
            start_time += ":00"
        if len(end_time) == 5:
            end_time += ":00"

        supabase_record = {
            "appointment_id": appointment_data.get("appointment_id") or self.generate_appointment_id(),
            "patient_id": patient_uuid,
            "doctor_id": doctor_uuid,
            "appointment_date": appointment_data.get("appointment_date") or appointment_data.get("date"),
            "start_time": start_time,
            "end_time": end_time,
            "appointment_type": appointment_data.get("appointment_type", "CONSULTATION"),
            "status": appointment_data.get("status", "CONFIRMED"),
            "reason": appointment_data.get("reason") or appointment_data.get("reason_for_visit", "Clinical Consultation")
        }

        try:
            res = self._request("appointments", method="POST", data=supabase_record)
            if isinstance(res, list) and len(res) > 0:
                inserted = res[0]
                inserted["patient_id"] = patient_human_id
                inserted["patient_name"] = patient_name
                return inserted
        except Exception as e:
            logger.warning(f"Failed to insert into Supabase appointments table: {e}")

        # Fallback return object
        supabase_record["patient_id"] = patient_human_id
        supabase_record["patient_name"] = patient_name
        return supabase_record

    def update_appointment(self, appointment_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        aid_enc = urllib.parse.quote(appointment_id)
        res = self._request(f"appointments?appointment_id=eq.{aid_enc}", method="PATCH", data=updates)
        if isinstance(res, list) and len(res) > 0:
            return res[0]
        return self.find_one("appointments", "appointment_id", appointment_id)

    def find_available_slots(self, doctor_id: str, date: str) -> List[Dict[str, Any]]:
        doctor = self.find_one("doctors", "doctor_id", doctor_id)
        if not doctor:
            doctor = self.find_one("doctors", "id", doctor_id)
        if not doctor:
            return []

        doc_uuid = doctor.get("id") or doctor.get("doctor_id") or doctor_id
        master_slots = doctor.get("available_slots", [])
        if isinstance(master_slots, str):
            try:
                master_slots = json.loads(master_slots)
            except Exception:
                master_slots = []
        if not master_slots:
            master_slots = [
                "09:00-09:30", "09:30-10:00", "10:00-10:30", "10:30-11:00",
                "11:00-11:30", "14:00-14:30", "14:30-15:00", "15:00-15:30"
            ]

        doc_enc = urllib.parse.quote(str(doc_uuid))
        date_enc = urllib.parse.quote(date)
        
        # Query active booked appointments for this doctor on target date
        existing_apts = self.get_collection(
            f"appointments?doctor_id=eq.{doc_enc}&appointment_date=eq.{date_enc}"
        )

        booked_slots = set()
        for apt in existing_apts:
            status_upper = str(apt.get("status") or "").upper()
            if status_upper not in ["CANCELLED", "CANCELLED_BY_DOCTOR", "CANCELLED_BY_PATIENT", "REJECTED"]:
                if apt.get("time_slot"):
                    booked_slots.add(apt.get("time_slot"))
                elif apt.get("start_time") and apt.get("end_time"):
                    st = str(apt.get("start_time"))[:5]
                    et = str(apt.get("end_time"))[:5]
                    booked_slots.add(f"{st}-{et}")

        available = []
        for idx, slot in enumerate(master_slots, 1):
            if slot not in booked_slots:
                times = slot.split("-")
                available.append({
                    "slot_id": f"SLOT-{idx:03d}",
                    "time_slot": slot,
                    "start_time": times[0] if len(times) > 0 else slot,
                    "end_time": times[1] if len(times) > 1 else ""
                })
        return available

    # --------------------------------------------------------------------------
    # INSURANCE CLAIMS CRUD
    # --------------------------------------------------------------------------

    def generate_claim_id(self) -> str:
        res = self._request("insurance_claims?select=claim_id&order=created_at.desc&limit=50")
        max_id = 1000
        if isinstance(res, list):
            for item in res:
                cid = item.get("claim_id", "")
                if cid.startswith("CLM-"):
                    try:
                        num = int(cid.split("-")[1])
                        if num > max_id:
                            max_id = num
                    except ValueError:
                        pass
        return f"CLM-{max_id + 1}"

    def add_claim(self, claim_data: Dict[str, Any]) -> Dict[str, Any]:
        allowed = {
            "claim_id", "patient_id", "policy_id", "provider_id", "bill_id",
            "claim_amount", "approved_amount", "status", "submitted_date",
            "processed_date", "adjudication_notes", "created_at", "updated_at"
        }
        filtered = {k: v for k, v in claim_data.items() if k in allowed}
        res = self._request("insurance_claims", method="POST", data=filtered)
        if isinstance(res, list) and len(res) > 0:
            return res[0]
        return claim_data

    def update_claim(self, claim_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        allowed = {
            "patient_id", "policy_id", "provider_id", "bill_id",
            "claim_amount", "approved_amount", "status", "submitted_date",
            "processed_date", "adjudication_notes", "updated_at"
        }
        filtered = {k: v for k, v in updates.items() if k in allowed}
        cid_enc = urllib.parse.quote(claim_id)
        res = self._request(f"insurance_claims?claim_id=eq.{cid_enc}", method="PATCH", data=filtered)
        if isinstance(res, list) and len(res) > 0:
            return res[0]
        return self.find_one("insurance_claims", "claim_id", claim_id)

    def update_appointment_status(self, appointment_id: str, status: str) -> Optional[Dict[str, Any]]:
        return self.update_appointment(appointment_id, {
            "status": status,
            "updated_at": datetime.now(timezone.utc).isoformat()
        })

    # --------------------------------------------------------------------------
    # PRESCRIPTIONS CRUD
    # --------------------------------------------------------------------------

    def generate_prescription_id(self) -> str:
        res = self._request("prescriptions?select=prescription_id&order=created_at.desc&limit=50")
        max_id = 4000
        if isinstance(res, list):
            for item in res:
                rx_id = item.get("prescription_id", "")
                if rx_id.startswith("RX-"):
                    try:
                        num = int(rx_id.split("-")[1])
                        if num > max_id:
                            max_id = num
                    except ValueError:
                        pass
        return f"RX-{max_id + 1}"

    def add_prescription(self, prescription_data: Dict[str, Any]) -> Dict[str, Any]:
        res = self._request("prescriptions", method="POST", data=prescription_data)
        if isinstance(res, list) and len(res) > 0:
            return res[0]
        return prescription_data

    def update_prescription(self, prescription_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        rx_enc = urllib.parse.quote(prescription_id)
        res = self._request(f"prescriptions?prescription_id=eq.{rx_enc}", method="PATCH", data=updates)
        if isinstance(res, list) and len(res) > 0:
            return res[0]
        return self.find_one("prescriptions", "prescription_id", prescription_id)

    def get_prescriptions(self, patient_id: Optional[str] = None) -> List[Dict[str, Any]]:
        if patient_id:
            return self.find_many("prescriptions", "patient_id", patient_id)
        return self.get_collection("prescriptions?order=created_at.desc")

    # --------------------------------------------------------------------------
    # PATIENT AGGREGATE HISTORY
    # --------------------------------------------------------------------------

    def get_patient_history(self, patient_id: str) -> Optional[Dict[str, Any]]:
        patient = self.find_one("patients", "patient_id", patient_id)
        if not patient:
            return None

        medical_records = self.find_many("medical_records", "patient_id", patient_id)
        lab_reports = self.find_many("lab_reports", "patient_id", patient_id)
        appointments = self.find_many("appointments", "patient_id", patient_id)
        prescriptions = self.find_many("prescriptions", "patient_id", patient_id)
        insurance_policies = self.find_many("insurance_policies", "patient_id", patient_id)
        insurance_claims = self.find_many("insurance_claims", "patient_id", patient_id)

        return {
            "patient": patient,
            "profile": patient,
            "medical_records": medical_records,
            "lab_reports": lab_reports,
            "appointments": appointments,
            "prescriptions": prescriptions,
            "insurance_policies": insurance_policies,
            "bills": [],
            "insurance_claims": insurance_claims,
            "notifications": []
        }

supabase_db = SupabaseDatabaseService()
