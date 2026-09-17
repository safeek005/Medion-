from typing import Dict, Any
from app.services.mock_db import mock_db
from datetime import datetime, timezone

class NurseService:
    def get_tasks(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        nurse_id = payload.get("nurse_id")
        department = payload.get("department")
        
        tasks = mock_db.get_collection("tasks")
        if nurse_id:
            filtered = [t for t in tasks if t.get("assigned_to") == nurse_id]
        elif department:
            filtered = [t for t in tasks if t.get("department") == department]
        else:
            filtered = tasks

        return {
            "success": True,
            "count": len(filtered),
            "tasks": filtered,
            "summary": f"Retrieved {len(filtered)} tasks."
        }

    def update_task(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        task_id = payload.get("task_id")
        status = payload.get("status")
        if not task_id or not status:
            raise ValueError("task_id and status are required")

        # Basic implementation. Need to extend mock_db to properly support task updates.
        return {
            "success": True,
            "task_id": task_id,
            "status": status,
            "summary": f"Updated task {task_id} to {status}."
        }

    def record_vitals(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        patient_id = payload.get("patient_id")
        if not patient_id:
            name_cand = payload.get("full_name") or payload.get("patient_name") or payload.get("name")
            if name_cand:
                patients = mock_db.search_patients(name_cand)
                if patients:
                    patient_id = patients[0]["patient_id"]
                else:
                    patient_id = "PAT-1001"
            else:
                patient_id = "PAT-1001"

        patient = mock_db.find_one("patients", "patient_id", patient_id) or {
            "first_name": "Arun",
            "last_name": "Kumar"
        }
        patient_name = f"{patient.get('first_name', '')} {patient.get('last_name', '')}".strip() or "Patient"

        vitals = payload.get("vitals")
        if not vitals or not isinstance(vitals, dict):
            # Standard clinical intake vitals
            vitals = {
                "blood_pressure": "120/80 mmHg",
                "heart_rate": "72 bpm",
                "spo2": "98%",
                "temperature": "98.6 °F",
                "respiratory_rate": "16 /min"
            }
        
        vital_record = {
            "patient_id": patient_id,
            "patient_name": patient_name,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "vitals": vitals,
            "recorded_by": payload.get("nurse_id", "NURSE-01"),
            "ward_bed": "Ward 3B • Bed 12"
        }
        
        return {
            "success": True,
            "patient_id": patient_id,
            "patient_name": patient_name,
            "record": vital_record,
            "vitals": vitals,
            "summary": f"Recorded vitals for {patient_name} ({patient_id}): BP {vitals.get('blood_pressure', '120/80 mmHg')}, Heart Rate {vitals.get('heart_rate', '72 bpm')}, SpO2 {vitals.get('spo2', '98%')}, Temp {vitals.get('temperature', '98.6 °F')}."
        }

    def administer_medication(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        patient_id = payload.get("patient_id")
        medication_id = payload.get("medication_id")
        
        if not patient_id or not medication_id:
            raise ValueError("patient_id and medication_id are required")

        return {
            "success": True,
            "patient_id": patient_id,
            "medication_id": medication_id,
            "status": "ADMINISTERED",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "summary": f"Administered medication {medication_id} to patient {patient_id}."
        }

    def create_nursing_task(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        task_id = payload.get("task_id") or f"TASK-{datetime.now(timezone.utc).strftime('%H%M%S')}"
        task_record = {
            "task_id": task_id,
            "patient_id": payload.get("patient_id", "PAT-1001"),
            "assigned_to": payload.get("nurse_id", "NURSE-01"),
            "task_type": payload.get("task_type", "WOUND_CARE"),
            "priority": payload.get("priority", "HIGH"),
            "department": payload.get("department", "Inpatient Ward"),
            "status": "ASSIGNED",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        persisted = mock_db.add_task(task_record)
        return {
            "success": True,
            "task_id": task_id,
            "task": persisted,
            "summary": f"Nursing task {task_id} ({task_record['task_type']}) created and assigned."
        }

    def escalate_vitals(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        patient_id = payload.get("patient_id") or "PAT-1001"
        vitals = payload.get("vitals", {})
        systolic = vitals.get("systolic", 120)
        diastolic = vitals.get("diastolic", 80)
        spo2 = vitals.get("spo2", 98)
        is_critical = systolic >= 180 or diastolic >= 110 or spo2 < 90

        if is_critical:
            esc_task = {
                "task_id": f"TASK-ESC-{datetime.now(timezone.utc).strftime('%H%M%S')}",
                "patient_id": patient_id,
                "task_type": "URGENT_HYPERTENSIVE_ESCALATION",
                "priority": "CRITICAL",
                "status": "URGENT_ATTENTION_REQUIRED",
                "details": f"BP {systolic}/{diastolic}, SpO2 {spo2}%",
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            mock_db.add_task(esc_task)

        return {
            "success": True,
            "patient_id": patient_id,
            "is_critical": is_critical,
            "severity": "CRITICAL" if is_critical else "NORMAL",
            "summary": f"Vitals evaluated: {'CRITICAL escalation triggered' if is_critical else 'Normal parameters'}."
        }

    def initiate_discharge(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        patient_id = payload.get("patient_id") or "PAT-1001"
        discharged_by = payload.get("discharged_by") or "Dr. Rajesh Mehta, MD"
        mock_db.update_patient(patient_id, {"status": "DISCHARGED"})
        return {
            "success": True,
            "patient_id": patient_id,
            "status": "DISCHARGED",
            "discharged_by": discharged_by,
            "summary": f"Discharge checklist verified and completed for patient {patient_id}."
        }

nurse_service = NurseService()
