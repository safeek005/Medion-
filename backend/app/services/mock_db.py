import json
import os
import logging
from pathlib import Path
from typing import Dict, Any, List, Optional

from app.services.supabase_db import supabase_db

logger = logging.getLogger("medion.database")

SUPABASE_TABLES = {
    "patients", "doctors", "appointments", "insurance_policies",
    "insurance_claims", "lab_reports", "medical_records", "prescriptions",
    "tasks", "vitals"
}

def get_database_mode() -> str:
    """
    Returns the configured database mode ('supabase' | 'mock').
    - In PRODUCTION / LIVE runtime, defaults to 'supabase' when configured or when DATABASE_MODE=supabase.
    - In TEST / MOCK runtime, returns 'mock' when DATABASE_MODE=mock or during pytest execution.
    """
    if ("PYTEST_CURRENT_TEST" in os.environ or os.getenv("APP_ENV") == "test") and os.getenv("USE_LIVE_DB_IN_TESTS", "false").lower() not in ["true", "1"]:
        return "mock"

    env_mode = os.getenv("DATABASE_MODE", "").lower().strip()
    if env_mode in ["supabase", "postgres", "cloud"]:
        return "supabase"
    if env_mode in ["mock", "local", "memory"]:
        return "mock"

    if supabase_db.is_configured():
        return "supabase"

    return "mock"

class MockDatabaseService:
    def __init__(self, data_dir: Optional[str] = None):
        if data_dir:
            self.data_dir = Path(data_dir)
        else:
            base_dir = Path(__file__).resolve().parent.parent.parent.parent
            self.data_dir = base_dir / "mock-data"
        
        self._cache: Dict[str, List[Dict[str, Any]]] = {}
        self.reload_data()

    def reload_data(self) -> None:
        """Loads all JSON mock datasets into local memory cache."""
        datasets = [
            "patients", "doctors", "nurses", "hospitals", "laboratories",
            "insurance_providers", "insurance_policies", "appointments",
            "medical_records", "lab_reports", "prescriptions", "bills",
            "insurance_claims", "notifications", "tasks", "vitals", 
            "lab_orders", "audit_logs"
        ]
        for ds in datasets:
            file_path = self.data_dir / f"{ds}.json"
            if file_path.exists():
                with open(file_path, "r", encoding="utf-8") as f:
                    self._cache[ds] = json.load(f)
            else:
                self._cache[ds] = []

    def get_collection(self, collection_name: str) -> List[Dict[str, Any]]:
        mode = get_database_mode()
        if mode == "supabase" and collection_name in SUPABASE_TABLES:
            if not supabase_db.is_configured():
                raise RuntimeError("Database unavailable: DATABASE_MODE is 'supabase' but Supabase credentials are not configured.")
            try:
                res = supabase_db.get_collection(collection_name)
                if res or collection_name in ["appointments", "patients", "doctors"]:
                    return res
            except Exception as e:
                logger.warning(f"Failed to fetch {collection_name} from Supabase, falling back to cache: {e}")
            return self._cache.get(collection_name, [])
        elif mode == "mock" or collection_name not in SUPABASE_TABLES:
            return self._cache.get(collection_name, [])
        return self._cache.get(collection_name, [])

    def find_one(self, collection_name: str, key: str, value: Any, skip_remote: bool = False) -> Optional[Dict[str, Any]]:
        mode = get_database_mode()
        if mode == "supabase" and not skip_remote and collection_name in SUPABASE_TABLES:
            if not supabase_db.is_configured():
                raise RuntimeError("Database unavailable: DATABASE_MODE is 'supabase' but Supabase credentials are not configured.")
            try:
                res = supabase_db.find_one(collection_name, key, value)
                if res is not None:
                    return res
            except Exception as e:
                logger.warning(f"Supabase find_one failed for {collection_name}.{key}={value}: {e}")
        
        # Mock mode or fallback to local memory cache if not found remotely
        collection = self._cache.get(collection_name, [])
        for item in collection:
            if item.get(key) == value:
                return item
        return None

    def find_many(self, collection_name: str, key: str, value: Any) -> List[Dict[str, Any]]:
        mode = get_database_mode()
        if mode == "supabase" and collection_name in SUPABASE_TABLES:
            if not supabase_db.is_configured():
                raise RuntimeError("Database unavailable: DATABASE_MODE is 'supabase' but Supabase credentials are not configured.")
            try:
                res = supabase_db.find_many(collection_name, key, value)
                if res:
                    return res
            except Exception as e:
                logger.warning(f"Supabase find_many failed for {collection_name}.{key}={value}: {e}")
        
        collection = self._cache.get(collection_name, [])
        return [item for item in collection if item.get(key) == value]

    def search_patients(self, query: str) -> List[Dict[str, Any]]:
        mode = get_database_mode()
        if mode == "supabase":
            if not supabase_db.is_configured():
                raise RuntimeError("Database unavailable: DATABASE_MODE is 'supabase' but Supabase credentials are not configured.")
            return supabase_db.search_patients(query)

        query_lower = query.lower()
        patients = self.get_collection("patients")
        results = []
        for p in patients:
            if (query_lower in (p.get("patient_id") or "").lower() or
                query_lower in (p.get("first_name") or "").lower() or
                query_lower in (p.get("last_name") or "").lower() or
                query_lower in (p.get("email") or "").lower() or
                query_lower in (p.get("phone") or "").lower()):
                results.append(p)
        return results

    def generate_patient_id(self) -> str:
        """Generates the next sequential PAT-xxxx patient ID."""
        mode = get_database_mode()
        if mode == "supabase":
            if not supabase_db.is_configured():
                raise RuntimeError("Database unavailable: DATABASE_MODE is 'supabase' but Supabase credentials are not configured.")
            return supabase_db.generate_patient_id()

        patients = self.get_collection("patients")
        max_id_num = 1000
        for p in patients:
            pid = p.get("patient_id", "")
            if pid.startswith("PAT-"):
                try:
                    num = int(pid.split("-")[1])
                    if num > max_id_num:
                        max_id_num = num
                except ValueError:
                    pass
        return f"PAT-{max_id_num + 1}"

    def add_patient(self, patient: Dict[str, Any]) -> Dict[str, Any]:
        """Adds a new patient to the authoritative database."""
        mode = get_database_mode()
        if mode == "supabase":
            if not supabase_db.is_configured():
                raise RuntimeError("Database unavailable: DATABASE_MODE is 'supabase' but Supabase credentials are not configured.")
            try:
                remote = supabase_db.add_patient(patient)
                if "patients" not in self._cache:
                    self._cache["patients"] = []
                self._cache["patients"].append(remote)
                return remote
            except Exception as e:
                logger.warning(f"Supabase add_patient error: {e}, caching locally.")

        if "patients" not in self._cache:
            self._cache["patients"] = []
        self._cache["patients"].append(patient)
        return patient

    def update_patient(self, patient_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Updates permitted patient profile fields."""
        mode = get_database_mode()
        if mode == "supabase":
            if not supabase_db.is_configured():
                raise RuntimeError("Database unavailable: DATABASE_MODE is 'supabase' but Supabase credentials are not configured.")
            remote = supabase_db.update_patient(patient_id, updates)
            if remote:
                cached = self.find_one("patients", "patient_id", patient_id, skip_remote=True)
                if cached:
                    cached.update(updates)
            return remote

        patient = self.find_one("patients", "patient_id", patient_id, skip_remote=True)
        if not patient:
            return None
        
        allowed_fields = {
            "first_name", "last_name", "dob", "gender", "blood_group",
            "phone", "email", "address", "emergency_contact",
            "primary_doctor_id", "insurance_policy_id"
        }
        for field, value in updates.items():
            if field in allowed_fields and value is not None:
                patient[field] = value
        
        return patient

    def get_patient_history(self, patient_id: str) -> Optional[Dict[str, Any]]:
        """Aggregates a patient's full medical and administrative history across datasets."""
        mode = get_database_mode()
        if mode == "supabase":
            if not supabase_db.is_configured():
                raise RuntimeError("Database unavailable: DATABASE_MODE is 'supabase' but Supabase credentials are not configured.")
            return supabase_db.get_patient_history(patient_id)

        patient = self.find_one("patients", "patient_id", patient_id, skip_remote=True)
        if not patient:
            return None

        medical_records = self.find_many("medical_records", "patient_id", patient_id)
        lab_reports = self.find_many("lab_reports", "patient_id", patient_id)
        appointments = self.find_many("appointments", "patient_id", patient_id)
        prescriptions = self.find_many("prescriptions", "patient_id", patient_id)
        insurance_policies = self.find_many("insurance_policies", "patient_id", patient_id)
        bills = self.find_many("bills", "patient_id", patient_id)
        insurance_claims = self.find_many("insurance_claims", "patient_id", patient_id)
        notifications = self.find_many("notifications", "recipient_id", patient_id)

        return {
            "patient": patient,
            "profile": patient,
            "medical_records": medical_records,
            "lab_reports": lab_reports,
            "appointments": appointments,
            "prescriptions": prescriptions,
            "insurance_policies": insurance_policies,
            "bills": bills,
            "insurance_claims": insurance_claims,
            "notifications": notifications
        }

    def generate_appointment_id(self) -> str:
        """Generates the next sequential APT-xxxx appointment ID."""
        mode = get_database_mode()
        if mode == "supabase":
            if not supabase_db.is_configured():
                raise RuntimeError("Database unavailable: DATABASE_MODE is 'supabase' but Supabase credentials are not configured.")
            return supabase_db.generate_appointment_id()

        appointments = self.get_collection("appointments")
        max_id_num = 1000
        for apt in appointments:
            aid = apt.get("appointment_id", "")
            if aid.startswith("APT-"):
                try:
                    num = int(aid.split("-")[1])
                    if num > max_id_num:
                        max_id_num = num
                except ValueError:
                    pass
        return f"APT-{max_id_num + 1}"

    def add_appointment(self, appointment: Dict[str, Any]) -> Dict[str, Any]:
        """Adds a new appointment to the collection."""
        mode = get_database_mode()
        if mode == "supabase":
            if not supabase_db.is_configured():
                raise RuntimeError("Database unavailable: DATABASE_MODE is 'supabase' but Supabase credentials are not configured.")
            remote = supabase_db.add_appointment(appointment)
            if "appointments" not in self._cache:
                self._cache["appointments"] = []
            self._cache["appointments"].append(remote)
            return remote

        if "appointments" not in self._cache:
            self._cache["appointments"] = []
        self._cache["appointments"].append(appointment)
        return appointment

    def update_appointment(self, appointment_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Updates status, date, or time_slot for an existing appointment."""
        mode = get_database_mode()
        if mode == "supabase":
            if not supabase_db.is_configured():
                raise RuntimeError("Database unavailable: DATABASE_MODE is 'supabase' but Supabase credentials are not configured.")
            try:
                remote = supabase_db.update_appointment(appointment_id, updates)
                if remote:
                    cached = self.find_one("appointments", "appointment_id", appointment_id, skip_remote=True)
                    if cached:
                        cached.update(updates)
                    return remote
            except Exception as e:
                logger.warning(f"Supabase update_appointment error: {e}")

        apt = self.find_one("appointments", "appointment_id", appointment_id, skip_remote=True)
        if not apt:
            return None
        allowed_fields = {"status", "appointment_date", "time_slot", "reason_for_visit"}
        for field, val in updates.items():
            if field in allowed_fields and val is not None:
                apt[field] = val
        return apt

    def update_appointment_status(self, appointment_id: str, status: str) -> Optional[Dict[str, Any]]:
        mode = get_database_mode()
        if mode == "supabase":
            if not supabase_db.is_configured():
                raise RuntimeError("Database unavailable: DATABASE_MODE is 'supabase' but Supabase credentials are not configured.")
            try:
                return supabase_db.update_appointment_status(appointment_id, status)
            except Exception as e:
                logger.warning(f"Supabase update_appointment_status error: {e}")
        return self.update_appointment(appointment_id, {"status": status})

    def find_available_slots(self, doctor_id: str, date: str) -> List[Dict[str, Any]]:
        """Determines available slots for a doctor on a given date."""
        mode = get_database_mode()
        if mode == "supabase":
            if not supabase_db.is_configured():
                raise RuntimeError("Database unavailable: DATABASE_MODE is 'supabase' but Supabase credentials are not configured.")
            return supabase_db.find_available_slots(doctor_id, date)

        doctor = self.find_one("doctors", "doctor_id", doctor_id, skip_remote=True)
        if not doctor:
            return []
        
        master_slots = doctor.get("available_slots", [])
        existing_apts = self.find_many("appointments", "doctor_id", doctor_id)
        
        booked_slots = {
            apt.get("time_slot") for apt in existing_apts
            if (apt.get("appointment_date") == date or apt.get("date") == date) and apt.get("status") in ["BOOKED", "CONFIRMED", "SCHEDULED"]
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

    def generate_claim_id(self) -> str:
        """Generates the next sequential CLM-xxxx claim ID."""
        mode = get_database_mode()
        if mode == "supabase":
            if not supabase_db.is_configured():
                raise RuntimeError("Database unavailable: DATABASE_MODE is 'supabase' but Supabase credentials are not configured.")
            return supabase_db.generate_claim_id()

        claims = self.get_collection("insurance_claims")
        max_id_num = 1000
        for clm in claims:
            cid = clm.get("claim_id", "")
            if cid.startswith("CLM-"):
                try:
                    num = int(cid.split("-")[1])
                    if num > max_id_num:
                        max_id_num = num
                except ValueError:
                    pass
        return f"CLM-{max_id_num + 1}"

    def add_claim(self, claim: Dict[str, Any]) -> Dict[str, Any]:
        """Adds a new insurance claim to the collection."""
        mode = get_database_mode()
        if mode == "supabase":
            if not supabase_db.is_configured():
                raise RuntimeError("Database unavailable: DATABASE_MODE is 'supabase' but Supabase credentials are not configured.")
            try:
                remote = supabase_db.add_claim(claim)
                if "insurance_claims" not in self._cache:
                    self._cache["insurance_claims"] = []
                self._cache["insurance_claims"].append(remote)
                return remote
            except Exception as e:
                logger.warning(f"Supabase add_claim error: {e}")

        if "insurance_claims" not in self._cache:
            self._cache["insurance_claims"] = []
        self._cache["insurance_claims"].append(claim)
        return claim

    def generate_prescription_id(self) -> str:
        """Generates the next sequential RX-xxxx prescription ID."""
        prescriptions = self.get_collection("prescriptions")
        max_id_num = 1000
        for rx in prescriptions:
            rid = rx.get("prescription_id", "")
            if rid.startswith("RX-"):
                try:
                    num = int(rid.split("-")[1])
                    if num > max_id_num:
                        max_id_num = num
                except ValueError:
                    pass
        return f"RX-{max_id_num + 1}"

    def add_prescription(self, prescription: Dict[str, Any]) -> Dict[str, Any]:
        """Persists a new prescription order to the collection."""
        if "prescriptions" not in self._cache:
            self._cache["prescriptions"] = self.get_collection("prescriptions")
        self._cache["prescriptions"].append(prescription)
        return prescription

    def update_claim(self, claim_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Updates claim status, approved amount, or adjudication notes."""
        mode = get_database_mode()
        if mode == "supabase":
            if not supabase_db.is_configured():
                raise RuntimeError("Database unavailable: DATABASE_MODE is 'supabase' but Supabase credentials are not configured.")
            try:
                remote = supabase_db.update_claim(claim_id, updates)
                if remote:
                    cached = self.find_one("insurance_claims", "claim_id", claim_id, skip_remote=True)
                    if cached:
                        cached.update(updates)
                    return remote
            except Exception as e:
                logger.warning(f"Supabase update_claim error: {e}")

        claim = self.find_one("insurance_claims", "claim_id", claim_id, skip_remote=True)
        if not claim:
            return None
        allowed_fields = {"status", "approved_amount", "adjudication_notes", "processed_date"}
        for field, val in updates.items():
            if field in allowed_fields and val is not None:
                claim[field] = val
        return claim

    # Additions for Core Automations
    def add_task(self, task: Dict[str, Any]) -> Dict[str, Any]:
        if "tasks" not in self._cache:
            self._cache["tasks"] = []
        self._cache["tasks"].append(task)
        return task

    def update_task(self, task_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        task = self.find_one("tasks", "task_id", task_id, skip_remote=True)
        if not task:
            return None
        task.update(updates)
        return task

    def add_vital(self, vital: Dict[str, Any]) -> Dict[str, Any]:
        if "vitals" not in self._cache:
            self._cache["vitals"] = []
        self._cache["vitals"].append(vital)
        return vital

    def add_lab_order(self, order: Dict[str, Any]) -> Dict[str, Any]:
        if "lab_orders" not in self._cache:
            self._cache["lab_orders"] = []
        self._cache["lab_orders"].append(order)
        return order

    def update_lab_order(self, order_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        order = self.find_one("lab_orders", "order_id", order_id, skip_remote=True)
        if not order:
            return None
        order.update(updates)
        return order

    # Prescriptions Management
    def generate_prescription_id(self) -> str:
        mode = get_database_mode()
        if mode == "supabase":
            if not supabase_db.is_configured():
                raise RuntimeError("Database unavailable: DATABASE_MODE is 'supabase' but Supabase credentials are not configured.")
            return supabase_db.generate_prescription_id()

        prescriptions = self.get_collection("prescriptions")
        max_id_num = 4000
        for rx in prescriptions:
            rid = rx.get("prescription_id", "")
            if rid.startswith("RX-"):
                try:
                    num = int(rid.split("-")[1])
                    if num > max_id_num:
                        max_id_num = num
                except ValueError:
                    pass
        return f"RX-{max_id_num + 1}"

    def add_prescription(self, prescription: Dict[str, Any]) -> Dict[str, Any]:
        mode = get_database_mode()
        if mode == "supabase":
            if not supabase_db.is_configured():
                raise RuntimeError("Database unavailable: DATABASE_MODE is 'supabase' but Supabase credentials are not configured.")
            remote = supabase_db.add_prescription(prescription)
            if "prescriptions" not in self._cache:
                self._cache["prescriptions"] = []
            self._cache["prescriptions"].append(remote)
            return remote

        if "prescriptions" not in self._cache:
            self._cache["prescriptions"] = []
        self._cache["prescriptions"].append(prescription)
        return prescription

    def update_prescription(self, prescription_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        mode = get_database_mode()
        if mode == "supabase":
            if not supabase_db.is_configured():
                raise RuntimeError("Database unavailable: DATABASE_MODE is 'supabase' but Supabase credentials are not configured.")
            remote = supabase_db.update_prescription(prescription_id, updates)
            if remote:
                cached = self.find_one("prescriptions", "prescription_id", prescription_id, skip_remote=True)
                if cached:
                    cached.update(updates)
            return remote

        rx = self.find_one("prescriptions", "prescription_id", prescription_id, skip_remote=True)
        if not rx:
            return None
        rx.update(updates)
        return rx

    def add_audit_log(self, log: Dict[str, Any]) -> Dict[str, Any]:
        if "audit_logs" not in self._cache:
            self._cache["audit_logs"] = []
        self._cache["audit_logs"].append(log)
        return log

mock_db = MockDatabaseService()
