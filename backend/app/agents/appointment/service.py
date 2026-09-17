from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
from app.services.mock_db import mock_db

def _format_doctor_name(doctor: Optional[Dict[str, Any]]) -> str:
    if not doctor:
        return "Dr. Rajesh Mehta"
    if doctor.get("doctor_name"):
        name = str(doctor["doctor_name"])
        return name if name.startswith("Dr.") else f"Dr. {name}"
    if doctor.get("name"):
        name = str(doctor["name"])
        return name if name.startswith("Dr.") else f"Dr. {name}"
    first = doctor.get("first_name") or ""
    last = doctor.get("last_name") or ""
    if first or last:
        return f"Dr. {first} {last}".strip()
    return "Dr. Rajesh Mehta"

def _format_patient_name(patient: Optional[Dict[str, Any]]) -> str:
    if not patient:
        return "Rahul Sharma"
    if patient.get("patient_name"):
        return str(patient["patient_name"])
    if patient.get("full_name"):
        return str(patient["full_name"])
    if patient.get("name"):
        return str(patient["name"])
    first = patient.get("first_name") or ""
    last = patient.get("last_name") or ""
    if first or last:
        return f"{first} {last}".strip()
    return "Patient"

class AppointmentService:
    def get_available_slots(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Action: get_available_slots
        Retrieves available doctor slots for a specified date.
        """
        doctor_id = payload.get("doctor_id") or "DOC-101"
        date = payload.get("date") or payload.get("appointment_date") or datetime.now(timezone.utc).date().isoformat()

        doctor = mock_db.find_one("doctors", "doctor_id", doctor_id)
        if not doctor:
            # Try finding doctor by name
            for d in mock_db.get_collection("doctors"):
                doc_full = f"{d.get('first_name', '')} {d.get('last_name', '')}".lower()
                if doctor_id.lower() in doc_full or doctor_id.lower() in d.get("doctor_id", "").lower():
                    doctor = d
                    doctor_id = d["doctor_id"]
                    break

        if not doctor:
            doctor = mock_db.find_one("doctors", "doctor_id", "DOC-101") or {
                "doctor_id": "DOC-101",
                "first_name": "Rajesh",
                "last_name": "Mehta",
                "specialty": "Cardiology"
            }
            doctor_id = "DOC-101"

        slots = mock_db.find_available_slots(doctor_id, date)
        doctor_full_name = _format_doctor_name(doctor)

        return {
            "success": True,
            "doctor_id": doctor_id,
            "doctor_name": doctor_full_name,
            "specialty": doctor.get("specialty", "Cardiology"),
            "date": date,
            "count": len(slots),
            "available_slots": slots,
            "summary": f"Found {len(slots)} available slot(s) for {doctor_full_name} on {date}."
        }

    def book_appointment(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Action: book_appointment
        Validates patient, doctor, hospital, checks slot availability, and creates appointment record.
        """
        patient_id = payload.get("patient_id")
        doctor_id = payload.get("doctor_id")
        hospital_id = payload.get("hospital_id", "HOSP-001")
        date = payload.get("date") or payload.get("appointment_date")
        time_slot = payload.get("time_slot") or payload.get("start_time")
        reason = payload.get("reason") or payload.get("reason_for_visit") or "General Clinical Consultation"

        # Patient resolution: if patient_id missing or given as name
        if not patient_id:
            name_cand = payload.get("full_name") or payload.get("patient_name") or payload.get("name")
            if name_cand:
                patients = mock_db.search_patients(name_cand)
                if patients:
                    patient_id = patients[0]["patient_id"]
                else:
                    # Default demo patient
                    patient_id = "PAT-1001"
            else:
                patient_id = "PAT-1001"

        patient = mock_db.find_one("patients", "patient_id", patient_id)
        if not patient:
            # Search by name in patient collection
            for p in mock_db.get_collection("patients"):
                if patient_id.lower() in f"{p.get('first_name')} {p.get('last_name')}".lower():
                    patient = p
                    patient_id = p["patient_id"]
                    break

        if not patient:
            patient = mock_db.find_one("patients", "patient_id", "PAT-1001")
            patient_id = "PAT-1001"

        if not doctor_id:
            doctor_id = "DOC-101"

        doctor = mock_db.find_one("doctors", "doctor_id", doctor_id)
        if not doctor:
            for d in mock_db.get_collection("doctors"):
                if doctor_id.lower() in f"{d.get('first_name')} {d.get('last_name')}".lower():
                    doctor = d
                    doctor_id = d["doctor_id"]
                    break

        if not doctor:
            raise ValueError(f"Doctor with ID/Name '{doctor_id}' not found.")

        if not date:
            raise ValueError("Field 'date' is required for booking.")
        if not time_slot:
            raise ValueError("Field 'time_slot' is required for booking.")

        hospital = mock_db.find_one("hospitals", "hospital_id", hospital_id) or {
            "hospital_id": "HOSP-001",
            "hospital_name": "Apollo Hospitals Greams Road"
        }

        # Normalize time_slot if only start_time was provided
        if "-" not in time_slot:
            clean_time = time_slot.upper().replace("AM", "").replace("PM", "").strip()
            parts = clean_time.split(":")
            if len(parts) >= 2:
                try:
                    hr = int(parts[0].strip())
                    mn = int(parts[1].strip()[:2])
                    if "PM" in time_slot.upper() and hr < 12:
                        hr += 12
                    end_hr = hr
                    end_mn = mn + 30
                    if end_mn >= 60:
                        end_hr += 1
                        end_mn -= 60
                    time_slot = f"{hr:02d}:{mn:02d}-{end_hr:02d}:{end_mn:02d}"
                except Exception:
                    time_slot = f"{time_slot}-11:00"
            else:
                time_slot = f"{time_slot}-10:30"

        # Check for slot conflict
        existing_apts = mock_db.find_many("appointments", "doctor_id", doctor_id)
        for apt in existing_apts:
            if (apt.get("appointment_date") == date and
                (apt.get("time_slot") == time_slot or time_slot in apt.get("time_slot", "")) and
                apt.get("status") in ["BOOKED", "CONFIRMED", "SCHEDULED"]):
                raise ValueError(f"Slot '{time_slot}' on {date} is already booked for Dr. {doctor.get('last_name')}.")

        appointment_id = mock_db.generate_appointment_id()

        doctor_full_name = _format_doctor_name(doctor)
        patient_full_name = _format_patient_name(patient)

        apt_record = {
            "appointment_id": appointment_id,
            "patient_id": patient_id,
            "patient_name": patient_full_name,
            "doctor_id": doctor_id,
            "doctor_name": doctor_full_name,
            "specialty": doctor.get("specialty", "Cardiology"),
            "hospital_id": hospital_id,
            "hospital_name": hospital.get("hospital_name", "Apollo Hospitals Greams Road"),
            "appointment_date": date,
            "date": date,
            "time_slot": time_slot,
            "status": "CONFIRMED",
            "reason_for_visit": reason,
            "created_at": datetime.now(timezone.utc).isoformat()
        }

        mock_db.add_appointment(apt_record)

        return {
            "success": True,
            "appointment_id": appointment_id,
            "status": "CONFIRMED",
            "appointment": apt_record,
            "summary": f"Appointment {appointment_id} successfully confirmed with {doctor_full_name} for {patient_full_name} on {date} at {time_slot}."
        }

    def get_appointment(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Action: get_appointment
        Retrieves appointment details by appointment_id.
        """
        appointment_id = payload.get("appointment_id")
        if not appointment_id:
            raise ValueError("Field 'appointment_id' is required.")

        apt = mock_db.find_one("appointments", "appointment_id", appointment_id)
        if not apt:
            raise ValueError(f"Appointment with ID '{appointment_id}' not found.")

        caller_id = payload.get("caller_patient_id") or payload.get("authenticated_patient_id")
        user_role = (payload.get("user_role") or payload.get("portal_source") or "").lower().strip()
        if user_role == "patient" and caller_id and apt.get("patient_id"):
            if str(caller_id).strip().upper() != str(apt.get("patient_id")).strip().upper():
                raise ValueError(f"Access Denied: You are not authorized to view or modify appointments for other patients.")

        return {
            "success": True,
            "appointment_id": appointment_id,
            "appointment": apt,
            "summary": f"Retrieved details for appointment {appointment_id}."
        }

    def get_patient_appointments(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Action: get_patient_appointments
        Retrieves all appointments strictly for a specific patient ID.
        """
        patient_id = payload.get("patient_id") or payload.get("caller_patient_id")
        if not patient_id:
            raise ValueError("Field 'patient_id' is required.")

        caller_id = payload.get("caller_patient_id") or payload.get("authenticated_patient_id")
        user_role = (payload.get("user_role") or payload.get("portal_source") or "").lower().strip()
        if user_role == "patient" and caller_id and str(caller_id).strip().upper() != str(patient_id).strip().upper():
            raise ValueError(f"Access Denied: Patient '{caller_id}' cannot view appointments for other patients ('{patient_id}').")

        all_apts = mock_db.get_collection("appointments")
        patient_apts = [a for a in all_apts if a.get("patient_id", "").strip().upper() == str(patient_id).strip().upper()]

        return {
            "success": True,
            "patient_id": patient_id,
            "count": len(patient_apts),
            "appointments": patient_apts,
            "summary": f"Found {len(patient_apts)} appointment(s) for patient {patient_id}."
        }

    def cancel_appointment(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Action: cancel_appointment
        Transitions status to CANCELLED while preserving record history.
        """
        appointment_id = payload.get("appointment_id")
        if not appointment_id:
            raise ValueError("Field 'appointment_id' is required.")

        apt = mock_db.find_one("appointments", "appointment_id", appointment_id)
        if not apt:
            raise ValueError(f"Appointment with ID '{appointment_id}' not found.")

        caller_id = payload.get("caller_patient_id") or payload.get("authenticated_patient_id")
        user_role = (payload.get("user_role") or payload.get("portal_source") or "").lower().strip()
        if user_role == "patient" and caller_id and apt.get("patient_id"):
            if str(caller_id).strip().upper() != str(apt.get("patient_id")).strip().upper():
                raise ValueError(f"Access Denied: You are not authorized to view or modify appointments for other patients.")

        if apt.get("status") == "CANCELLED":
            return {
                "success": True,
                "appointment_id": appointment_id,
                "status": "CANCELLED",
                "message": f"Appointment {appointment_id} was already cancelled.",
                "appointment": apt,
                "summary": f"Appointment {appointment_id} is already cancelled."
            }

        updated = mock_db.update_appointment(appointment_id, {"status": "CANCELLED"})

        return {
            "success": True,
            "appointment_id": appointment_id,
            "status": "CANCELLED",
            "appointment": updated,
            "summary": f"Cancelled appointment {appointment_id} successfully."
        }

    def reschedule_appointment(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Action: reschedule_appointment
        Validates new slot availability and updates appointment date/time.
        """
        appointment_id = payload.get("appointment_id")
        new_date = payload.get("new_date") or payload.get("appointment_date") or payload.get("date")
        new_time_slot = payload.get("new_time_slot") or payload.get("new_start_time") or payload.get("time_slot")

        if not appointment_id:
            raise ValueError("Field 'appointment_id' is required for rescheduling.")
        if not new_date:
            raise ValueError("Field 'new_date' is required for rescheduling.")
        if not new_time_slot:
            raise ValueError("Field 'new_time_slot' is required for rescheduling.")

        apt = mock_db.find_one("appointments", "appointment_id", appointment_id)
        if not apt:
            raise ValueError(f"Appointment with ID '{appointment_id}' not found.")

        caller_id = payload.get("caller_patient_id") or payload.get("authenticated_patient_id")
        user_role = (payload.get("user_role") or payload.get("portal_source") or "").lower().strip()
        if user_role == "patient" and caller_id and apt.get("patient_id"):
            if str(caller_id).strip().upper() != str(apt.get("patient_id")).strip().upper():
                raise ValueError(f"Access Denied: You are not authorized to view or modify appointments for other patients.")

        doctor_id = apt.get("doctor_id")

        if "-" not in new_time_slot:
            parts = new_time_slot.split(":")
            if len(parts) == 2:
                hr = int(parts[0])
                mn = int(parts[1]) + 30
                if mn >= 60:
                    hr += 1
                    mn -= 60
                new_time_slot = f"{new_time_slot}-{hr:02d}:{mn:02d}"
            else:
                new_time_slot = f"{new_time_slot}-11:30"

        # Check conflict on new slot
        existing_apts = mock_db.find_many("appointments", "doctor_id", doctor_id)
        for other in existing_apts:
            if other.get("appointment_id") != appointment_id:
                if (other.get("appointment_date") == new_date and
                    (other.get("time_slot") == new_time_slot or new_time_slot in other.get("time_slot", "")) and
                    other.get("status") in ["BOOKED", "CONFIRMED", "SCHEDULED"]):
                    raise ValueError(f"New slot '{new_time_slot}' on {new_date} is already occupied.")

        updates = {
            "appointment_date": new_date,
            "date": new_date,
            "time_slot": new_time_slot,
            "status": "RESCHEDULED"
        }
        updated = mock_db.update_appointment(appointment_id, updates)

        return {
            "success": True,
            "appointment_id": appointment_id,
            "status": "RESCHEDULED",
            "appointment": updated,
            "summary": f"Rescheduled appointment {appointment_id} to {new_date} at {new_time_slot}."
        }

    def update_appointment_status(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Action: update_appointment_status
        Updates status for an appointment (e.g. IN_CONSULTATION, COMPLETED, CANCELLED, SCHEDULED).
        """
        appointment_id = payload.get("appointment_id")
        status = payload.get("status")

        if not appointment_id:
            raise ValueError("Field 'appointment_id' is required.")
        if not status:
            raise ValueError("Field 'status' is required.")

        status = status.upper().strip()
        apt = mock_db.find_one("appointments", "appointment_id", appointment_id)
        if not apt:
            raise ValueError(f"Appointment with ID '{appointment_id}' not found.")

        updated = mock_db.update_appointment_status(appointment_id, status)

        return {
            "success": True,
            "appointment_id": appointment_id,
            "status": status,
            "appointment": updated,
            "summary": f"Appointment {appointment_id} status transitioned to {status}."
        }

    def complete_appointment(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Action: complete_appointment
        Transitions appointment status to COMPLETED upon clinician consultation finish.
        """
        payload["status"] = "COMPLETED"
        return self.update_appointment_status(payload)

    def schedule_follow_up(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Action: schedule_follow_up
        Finds slot and schedules post-consultation follow-up appointment.
        """
        doctor_id = payload.get("doctor_id") or "DOC-101"
        date = payload.get("date") or payload.get("appointment_date") or datetime.now(timezone.utc).date().isoformat()
        slots = mock_db.find_available_slots(doctor_id, date)
        time_slot = payload.get("time_slot") or (slots[0]["time_slot"] if slots else "10:00 AM - 10:30 AM")
        
        booking_payload = {
            "patient_id": payload.get("patient_id", "PAT-1001"),
            "doctor_id": doctor_id,
            "appointment_date": date,
            "time_slot": time_slot,
            "reason_for_visit": payload.get("reason", "Post-Consultation Follow-up")
        }
        return self.book_appointment(booking_payload)

appointment_service = AppointmentService()
