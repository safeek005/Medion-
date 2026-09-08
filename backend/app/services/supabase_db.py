import os
import json
import logging
from pathlib import Path
from typing import Dict, Any, List, Optional
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

    # --------------------------------------------------------------------------
    # GENERIC COLLECTION METHODS
    # --------------------------------------------------------------------------

    def get_collection(self, table_name: str) -> List[Dict[str, Any]]:
        res = self._request(f"{table_name}?select=*" if "?" not in table_name else table_name)
        return res if isinstance(res, list) else []

    def get_patients(self) -> List[Dict[str, Any]]:
        return self.get_collection("patients?order=created_at.desc")

    def find_one(self, table_name: str, key: str, value: Any) -> Optional[Dict[str, Any]]:
        val_encoded = urllib.parse.quote(str(value))
        res = self._request(f"{table_name}?{key}=eq.{val_encoded}&limit=1")
        if isinstance(res, list) and len(res) > 0:
            return res[0]
        return None

    def find_many(self, table_name: str, key: str, value: Any) -> List[Dict[str, Any]]:
        val_encoded = urllib.parse.quote(str(value))
        res = self._request(f"{table_name}?{key}=eq.{val_encoded}")
        return res if isinstance(res, list) else []

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
        res = self._request(f"patients?patient_id=eq.{pid_enc}", method="PATCH", data=updates)
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
        res = self._request("appointments", method="POST", data=appointment_data)
        if isinstance(res, list) and len(res) > 0:
            return res[0]
        return appointment_data

    def update_appointment(self, appointment_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        aid_enc = urllib.parse.quote(appointment_id)
        res = self._request(f"appointments?appointment_id=eq.{aid_enc}", method="PATCH", data=updates)
        if isinstance(res, list) and len(res) > 0:
            return res[0]
        return self.find_one("appointments", "appointment_id", appointment_id)

    def find_available_slots(self, doctor_id: str, date: str) -> List[Dict[str, Any]]:
        doctor = self.find_one("doctors", "doctor_id", doctor_id)
        if not doctor:
            return []

        master_slots = doctor.get("available_slots", [])
        if isinstance(master_slots, str):
            try:
                master_slots = json.loads(master_slots)
            except Exception:
                master_slots = []

        doc_enc = urllib.parse.quote(doctor_id)
        date_enc = urllib.parse.quote(date)
        
        # Query active booked appointments for this doctor on target date
        existing_apts = self.get_collection(
            f"appointments?doctor_id=eq.{doc_enc}&or=(appointment_date.eq.{date_enc},date.eq.{date_enc})&status=in.(BOOKED,CONFIRMED,SCHEDULED)"
        )

        booked_slots = {
            apt.get("time_slot") for apt in existing_apts
            if apt.get("time_slot")
        }

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
        res = self._request("insurance_claims", method="POST", data=claim_data)
        if isinstance(res, list) and len(res) > 0:
            return res[0]
        return claim_data

    def update_claim(self, claim_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        cid_enc = urllib.parse.quote(claim_id)
        res = self._request(f"insurance_claims?claim_id=eq.{cid_enc}", method="PATCH", data=updates)
        if isinstance(res, list) and len(res) > 0:
            return res[0]
        return self.find_one("insurance_claims", "claim_id", claim_id)

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
