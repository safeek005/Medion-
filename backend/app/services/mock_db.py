import json
import os
from pathlib import Path
from typing import Dict, Any, List, Optional

class MockDatabaseService:
    def __init__(self, data_dir: Optional[str] = None):
        if data_dir:
            self.data_dir = Path(data_dir)
        else:
            # Default relative to this file: ../../../mock-data
            base_dir = Path(__file__).resolve().parent.parent.parent.parent
            self.data_dir = base_dir / "mock-data"
        
        self._cache: Dict[str, List[Dict[str, Any]]] = {}
        self.reload_data()

    def reload_data(self) -> None:
        """Loads all JSON mock datasets into memory."""
        datasets = [
            "patients", "doctors", "nurses", "hospitals", "laboratories",
            "insurance_providers", "insurance_policies", "appointments",
            "medical_records", "lab_reports", "prescriptions", "bills",
            "insurance_claims", "notifications"
        ]
        for ds in datasets:
            file_path = self.data_dir / f"{ds}.json"
            if file_path.exists():
                with open(file_path, "r", encoding="utf-8") as f:
                    self._cache[ds] = json.load(f)
            else:
                self._cache[ds] = []

    def get_collection(self, collection_name: str) -> List[Dict[str, Any]]:
        return self._cache.get(collection_name, [])

    def find_one(self, collection_name: str, key: str, value: Any) -> Optional[Dict[str, Any]]:
        collection = self.get_collection(collection_name)
        for item in collection:
            if item.get(key) == value:
                return item
        return None

    def find_many(self, collection_name: str, key: str, value: Any) -> List[Dict[str, Any]]:
        collection = self.get_collection(collection_name)
        return [item for item in collection if item.get(key) == value]

    def search_patients(self, query: str) -> List[Dict[str, Any]]:
        query_lower = query.lower()
        patients = self.get_collection("patients")
        results = []
        for p in patients:
            if (query_lower in p.get("patient_id", "").lower() or
                query_lower in p.get("first_name", "").lower() or
                query_lower in p.get("last_name", "").lower() or
                query_lower in p.get("email", "").lower() or
                query_lower in p.get("phone", "").lower()):
                results.append(p)
        return results

    def generate_patient_id(self) -> str:
        """Generates the next sequential PAT-xxxx patient ID."""
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
        """Adds a new patient to the in-memory patients collection."""
        if "patients" not in self._cache:
            self._cache["patients"] = []
        self._cache["patients"].append(patient)
        return patient

    def update_patient(self, patient_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Updates permitted patient profile fields.
        STRICT CONTROL: Does not modify patient_id or cross-domain collections.
        """
        patient = self.find_one("patients", "patient_id", patient_id)
        if not patient:
            return None
        
        # Permitted profile fields only
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
        """
        Aggregates a patient's full medical and administrative history across mock datasets.
        """
        patient = self.find_one("patients", "patient_id", patient_id)
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
        """Adds a new appointment to the in-memory collection."""
        if "appointments" not in self._cache:
            self._cache["appointments"] = []
        self._cache["appointments"].append(appointment)
        return appointment

    def update_appointment(self, appointment_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Updates status, date, or time_slot for an existing appointment."""
        apt = self.find_one("appointments", "appointment_id", appointment_id)
        if not apt:
            return None
        allowed_fields = {"status", "appointment_date", "time_slot", "reason_for_visit"}
        for field, val in updates.items():
            if field in allowed_fields and val is not None:
                apt[field] = val
        return apt

    def find_available_slots(self, doctor_id: str, date: str) -> List[Dict[str, Any]]:
        """
        Determines available slots for a doctor on a given date by inspecting doctor's master schedule
        and filtering out already booked/confirmed appointments.
        """
        doctor = self.find_one("doctors", "doctor_id", doctor_id)
        if not doctor:
            return []
        
        master_slots = doctor.get("available_slots", [])
        existing_apts = self.find_many("appointments", "doctor_id", doctor_id)
        
        # Booked slots for target date that are not CANCELLED
        booked_slots = {
            apt.get("time_slot") for apt in existing_apts
            if apt.get("appointment_date") == date and apt.get("status") in ["BOOKED", "CONFIRMED", "SCHEDULED"]
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
        """Adds a new insurance claim to the in-memory collection."""
        if "insurance_claims" not in self._cache:
            self._cache["insurance_claims"] = []
        self._cache["insurance_claims"].append(claim)
        return claim

    def update_claim(self, claim_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Updates adjudication status or notes for an existing claim."""
        clm = self.find_one("insurance_claims", "claim_id", claim_id)
        if not clm:
            return None
        allowed_fields = {"status", "approved_amount", "processed_date", "adjudication_notes"}
        for field, val in updates.items():
            if field in allowed_fields and val is not None:
                clm[field] = val
        return clm

# Singleton instance
mock_db = MockDatabaseService()
