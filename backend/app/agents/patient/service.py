from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
from app.services.mock_db import mock_db

class PatientService:
    def register_patient(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Action: register_patient
        Registers a new patient and generates a unique Patient ID (PAT-xxxx).
        """
        full_name = payload.get("full_name")
        first_name = payload.get("first_name")
        last_name = payload.get("last_name")

        if full_name and not (first_name and last_name):
            parts = full_name.strip().split(" ", 1)
            first_name = parts[0]
            last_name = parts[1] if len(parts) > 1 else ""

        if not first_name and full_name:
            first_name = full_name.strip()
            last_name = ""

        dob = payload.get("date_of_birth") or payload.get("dob")
        gender = payload.get("gender")
        phone = payload.get("phone") or payload.get("contact_number")
        blood_group = payload.get("blood_group")
        address = payload.get("address")
        email = payload.get("email")
        emergency_contact = payload.get("emergency_contact")
        primary_doctor_id = payload.get("primary_doctor_id")
        insurance_policy_id = payload.get("insurance_policy_id")

        # Validation
        if not first_name:
            raise ValueError("Patient name (first_name or full_name) is required.")
        if not phone:
            raise ValueError("Patient phone number is required.")

        # Duplicate check if explicit email provided
        if email:
            existing_email = mock_db.find_one("patients", "email", email)
            if existing_email:
                raise ValueError(f"Patient with email '{email}' already exists (ID: {existing_email['patient_id']}).")

        # Generate unique ID
        patient_id = mock_db.generate_patient_id()

        patient_record = {
            "patient_id": patient_id,
            "first_name": first_name,
            "last_name": last_name,
            "dob": dob,
            "gender": gender,
            "blood_group": blood_group,
            "phone": phone,
            "email": email,
            "address": address,
            "emergency_contact": emergency_contact,
            "primary_doctor_id": primary_doctor_id,
            "insurance_policy_id": insurance_policy_id,
            "created_at": datetime.now(timezone.utc).isoformat()
        }

        mock_db.add_patient(patient_record)

        return {
            "success": True,
            "patient_id": patient_id,
            "message": f"Patient {first_name} {last_name} registered successfully with ID {patient_id}.",
            "patient": patient_record,
            "summary": f"Registered new patient {patient_id} ({first_name} {last_name})."
        }

    def get_patient(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Action: get_patient
        Retrieves a single patient profile by patient_id or patient name.
        """
        patient_id = payload.get("patient_id")
        if not patient_id:
            name_cand = payload.get("full_name") or payload.get("name") or payload.get("query")
            if name_cand:
                res = self.search_patient({"query": name_cand})
                if res.get("results"):
                    return {
                        "success": True,
                        "patient_id": res["results"][0]["patient_id"],
                        "patient": res["results"][0],
                        "summary": f"Retrieved profile for patient {res['results'][0]['patient_id']} ({res['results'][0].get('first_name')} {res['results'][0].get('last_name')})."
                    }
            raise ValueError("Field 'patient_id' is required for get_patient.")

        patient = mock_db.find_one("patients", "patient_id", patient_id)
        if not patient:
            # Fallback search by patient name
            for p in mock_db.get_collection("patients"):
                if patient_id.lower() in f"{p.get('first_name')} {p.get('last_name')}".lower():
                    patient = p
                    patient_id = p["patient_id"]
                    break

        if not patient:
            raise ValueError(f"Patient with ID '{patient_id}' not found.")

        return {
            "success": True,
            "patient_id": patient_id,
            "patient": patient,
            "summary": f"Retrieved profile for patient {patient_id} ({patient.get('first_name')} {patient.get('last_name')})."
        }

    def search_patient(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Action: search_patient
        Deterministic, rule/data based search by ID, name, phone, or email.
        """
        patient_id = payload.get("patient_id")
        name = payload.get("name") or payload.get("full_name")
        phone = payload.get("phone")
        email = payload.get("email")
        query = payload.get("query")

        patients = mock_db.get_collection("patients")
        results = []

        for p in patients:
            matched = False
            if patient_id and patient_id.lower() in (p.get("patient_id") or "").lower():
                matched = True
            if name:
                full = f"{p.get('first_name') or ''} {p.get('last_name') or ''}".lower()
                if name.lower() in full or name.lower() in (p.get("first_name") or "").lower():
                    matched = True
            if phone and phone in (p.get("phone") or ""):
                matched = True
            if email and email.lower() in (p.get("email") or "").lower():
                matched = True
            if query:
                q_lower = query.lower()
                full = f"{p.get('first_name') or ''} {p.get('last_name') or ''}".lower()
                if (q_lower in (p.get("patient_id") or "").lower() or
                    q_lower in full or
                    q_lower in (p.get("phone") or "").lower() or
                    q_lower in (p.get("email") or "").lower()):
                    matched = True

            if matched and p not in results:
                results.append(p)

        return {
            "success": True,
            "count": len(results),
            "results": results,
            "patient": results[0] if len(results) == 1 else None,
            "summary": f"Search returned {len(results)} matching patient record(s)."
        }

    def update_patient(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Action: update_patient
        Updates permitted patient profile fields.
        STRICT BOUNDARY CONTROL: Does not permit updating patient_id, medical records,
        lab reports, prescriptions, insurance, appointments, bills, or claims.
        """
        patient_id = payload.get("patient_id")
        if not patient_id:
            name_cand = payload.get("full_name") or payload.get("name") or payload.get("first_name")
            if name_cand:
                p_res = self.search_patient({"query": name_cand})
                if p_res.get("results"):
                    patient_id = p_res["results"][0]["patient_id"]

        if not patient_id:
            raise ValueError("Field 'patient_id' is required for update_patient.")

        patient = mock_db.find_one("patients", "patient_id", patient_id)
        if not patient:
            # Fallback search by patient name in mock_db
            p_res = self.search_patient({"query": patient_id})
            if p_res.get("results"):
                patient = p_res["results"][0]
                patient_id = patient["patient_id"]

        if not patient:
            raise ValueError(f"Patient with ID/Name '{patient_id}' not found.")

        updates = payload.get("updates", {})
        if not updates:
            updates = {k: v for k, v in payload.items() if k not in ["patient_id", "full_name", "name", "first_name"]}

        if not updates:
            raise ValueError("No update fields provided.")

        # Reject any attempt to modify prohibited keys or cross-domain collections
        prohibited = {"patient_id", "medical_records", "lab_reports", "prescriptions", "insurance", "appointments", "bills", "claims", "notifications"}
        filtered_updates = {k: v for k, v in updates.items() if k not in prohibited}

        updated_patient = mock_db.update_patient(patient_id, filtered_updates)

        return {
            "success": True,
            "patient_id": patient_id,
            "patient": updated_patient,
            "summary": f"Updated profile for patient {patient_id} successfully."
        }

    def get_patient_history(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Action: get_patient_history
        Aggregates full medical and administrative history for a patient.
        """
        patient_id = payload.get("patient_id")
        if not patient_id:
            raise ValueError("Field 'patient_id' is required for get_patient_history.")

        history = mock_db.get_patient_history(patient_id)
        if not history:
            raise ValueError(f"Patient with ID '{patient_id}' not found.")

        return {
            "success": True,
            "patient_id": patient_id,
            "history": history,
            "summary": f"Aggregated full history for patient {patient_id} ({len(history['medical_records'])} medical records, {len(history['lab_reports'])} lab reports, {len(history['appointments'])} appointments)."
        }

patient_service = PatientService()
