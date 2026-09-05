from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
from app.services.mock_db import mock_db

class AppointmentService:
    def get_available_slots(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Action: get_available_slots
        Retrieves available doctor slots for a specified date.
        """
        doctor_id = payload.get("doctor_id") or "DOC-101"
        date = payload.get("date") or payload.get("appointment_date") or "2024-09-10"

        doctor = mock_db.find_one("doctors", "doctor_id", doctor_id)
        if not doctor:
            raise ValueError(f"Doctor with ID '{doctor_id}' not found.")

        slots = mock_db.find_available_slots(doctor_id, date)

        return {
            "success": True,
            "doctor_id": doctor_id,
            "doctor_name": f"Dr. {doctor.get('first_name')} {doctor.get('last_name')}",
            "specialty": doctor.get("specialty"),
            "date": date,
            "count": len(slots),
            "available_slots": slots,
            "summary": f"Found {len(slots)} available slot(s) for Dr. {doctor.get('last_name')} on {date}."
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
        reason = payload.get("reason") or payload.get("reason_for_visit") or "General Consultation"

        if not patient_id:
            raise ValueError("Field 'patient_id' is required for booking.")
        if not doctor_id:
            raise ValueError("Field 'doctor_id' is required for booking.")
        if not date:
            raise ValueError("Field 'date' is required for booking.")
        if not time_slot:
            raise ValueError("Field 'time_slot' (or start_time) is required for booking.")

        patient = mock_db.find_one("patients", "patient_id", patient_id)
        if not patient:
            raise ValueError(f"Patient with ID '{patient_id}' not found.")

        doctor = mock_db.find_one("doctors", "doctor_id", doctor_id)
        if not doctor:
            raise ValueError(f"Doctor with ID '{doctor_id}' not found.")

        hospital = mock_db.find_one("hospitals", "hospital_id", hospital_id)
        if not hospital:
            raise ValueError(f"Hospital with ID '{hospital_id}' not found.")

        # Check for slot conflict
        existing_apts = mock_db.find_many("appointments", "doctor_id", doctor_id)
        for apt in existing_apts:
            if (apt.get("appointment_date") == date and
                (apt.get("time_slot") == time_slot or time_slot in apt.get("time_slot", "")) and
                apt.get("status") in ["BOOKED", "CONFIRMED", "SCHEDULED"]):
                raise ValueError(f"Slot '{time_slot}' on {date} is already booked for Dr. {doctor.get('last_name')}.")

        # Normalize time_slot if only start_time was provided
        if "-" not in time_slot:
            time_slot = f"{time_slot}-10:30" if "10:00" in time_slot else f"{time_slot}-11:30"

        appointment_id = mock_db.generate_appointment_id()

        apt_record = {
            "appointment_id": appointment_id,
            "patient_id": patient_id,
            "doctor_id": doctor_id,
            "hospital_id": hospital_id,
            "appointment_date": date,
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
            "summary": f"Booked appointment {appointment_id} with Dr. {doctor.get('last_name')} for patient {patient_id} on {date} at {time_slot}."
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

        return {
            "success": True,
            "appointment_id": appointment_id,
            "appointment": apt,
            "summary": f"Retrieved details for appointment {appointment_id}."
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

        if apt.get("status") == "CANCELLED":
            return {
                "success": True,
                "appointment_id": appointment_id,
                "status": "CANCELLED",
                "message": f"Appointment {appointment_id} was already cancelled.",
                "summary": f"Appointment {appointment_id} is cancelled."
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

        doctor_id = apt.get("doctor_id")

        # Check conflict on new slot
        existing_apts = mock_db.find_many("appointments", "doctor_id", doctor_id)
        for other in existing_apts:
            if other.get("appointment_id") != appointment_id:
                if (other.get("appointment_date") == new_date and
                    (other.get("time_slot") == new_time_slot or new_time_slot in other.get("time_slot", "")) and
                    other.get("status") in ["BOOKED", "CONFIRMED", "SCHEDULED"]):
                    raise ValueError(f"New slot '{new_time_slot}' on {new_date} is already occupied.")

        if "-" not in new_time_slot:
            new_time_slot = f"{new_time_slot}-11:30"

        updates = {
            "appointment_date": new_date,
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

appointment_service = AppointmentService()
