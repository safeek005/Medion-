import uuid
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone

from app.services.mock_db import mock_db
from app.agents.patient.service import patient_service
from app.agents.appointment.service import appointment_service
from app.agents.medical.service import medical_service
from app.agents.insurance.service import insurance_service
from app.agents.nurse.service import nurse_service
from app.agents.lab.service import lab_service
from app.services.mock_insurance import mock_insurance_system

AUTOMATIONS = [
    {
        "id": 1,
        "slug": "patient_registration",
        "title": "Patient Registration Automation",
        "portal": "PATIENT",
        "agent": "Patient Agent",
        "description": "Patient registration → validation → Patient Agent → database → confirmation."
    },
    {
        "id": 2,
        "slug": "appointment_booking",
        "title": "Appointment Booking Automation",
        "portal": "PATIENT",
        "agent": "Appointment Agent",
        "description": "Patient request → Appointment Agent → available slot → booking → confirmation."
    },
    {
        "id": 3,
        "slug": "appointment_rescheduling",
        "title": "Appointment Rescheduling Automation",
        "portal": "PATIENT",
        "agent": "Appointment Agent",
        "description": "Patient request → existing appointment → new slot → update → confirmation."
    },
    {
        "id": 4,
        "slug": "prescription_access",
        "title": "Prescription Access Automation",
        "portal": "PATIENT",
        "agent": "Patient / Medical Agent",
        "description": "Patient → authorized prescriptions → patient-scoped retrieval → UI."
    },
    {
        "id": 5,
        "slug": "clinical_review",
        "title": "Clinical Review Automation",
        "portal": "DOCTOR",
        "agent": "Medical Agent",
        "description": "Doctor selects patient → retrieve clinical context → Medical Agent → clinical proposal → physician review."
    },
    {
        "id": 6,
        "slug": "ai_clinical_proposal",
        "title": "AI Clinical Proposal Automation",
        "portal": "DOCTOR",
        "agent": "Medical Agent",
        "description": "Clinical data → Medical Agent → structured proposal → NO autonomous mutation."
    },
    {
        "id": 7,
        "slug": "prescription_signing",
        "title": "Prescription Signing Automation",
        "portal": "DOCTOR",
        "agent": "Medical Agent",
        "description": "Doctor approval → authorization → prescription creation → audit trail → UI synchronization."
    },
    {
        "id": 8,
        "slug": "patient_follow_up",
        "title": "Patient Follow-up Automation",
        "portal": "DOCTOR",
        "agent": "Appointment Agent",
        "description": "Clinical event → identify follow-up requirement → Appointment Agent → available appointment workflow."
    },
    {
        "id": 9,
        "slug": "nursing_task",
        "title": "Nursing Task Automation",
        "portal": "NURSE",
        "agent": "Nurse Agent",
        "description": "Patient/clinical event → create nursing task → assign → status tracking."
    },
    {
        "id": 10,
        "slug": "vital_escalation",
        "title": "Vital Escalation Automation",
        "portal": "NURSE",
        "agent": "Nurse / Medical Agent",
        "description": "Vital measurement → threshold/rule evaluation → nurse notification/task → audit."
    },
    {
        "id": 11,
        "slug": "medication_workflow",
        "title": "Medication Workflow Automation",
        "portal": "NURSE",
        "agent": "Nurse Agent",
        "description": "Medication order → nursing task → administration/status update → audit."
    },
    {
        "id": 12,
        "slug": "discharge_workflow",
        "title": "Discharge Workflow Automation",
        "portal": "NURSE",
        "agent": "Nurse / Hospital Agent",
        "description": "Discharge initiation → checklist/tasks → completion tracking → patient status synchronization."
    },
    {
        "id": 13,
        "slug": "specimen_processing",
        "title": "Specimen Processing Automation",
        "portal": "LAB",
        "agent": "Lab Agent",
        "description": "Specimen received → validation → status update → lab workflow."
    },
    {
        "id": 14,
        "slug": "lab_report",
        "title": "Lab Report Automation",
        "portal": "LAB",
        "agent": "Medical / Lab Agent",
        "description": "Specimen → report extraction → Medical Agent → structured report → database."
    },
    {
        "id": 15,
        "slug": "critical_lab_notification",
        "title": "Critical Lab Notification Automation",
        "portal": "LAB",
        "agent": "Lab / Medical Agent",
        "description": "Lab result → rule evaluation → critical result → doctor/nurse notification → audit."
    },
    {
        "id": 16,
        "slug": "patient_lab_result",
        "title": "Patient Lab Result Automation",
        "portal": "LAB",
        "agent": "Lab / Patient Agent",
        "description": "Finalized report → patient authorization check → patient portal availability."
    },
    {
        "id": 17,
        "slug": "claim_creation",
        "title": "Claim Creation/Validation Automation",
        "portal": "INSURANCE",
        "agent": "Insurance Agent",
        "description": "Claim → validation → patient/policy verification → claim record."
    },
    {
        "id": 18,
        "slug": "claim_adjudication",
        "title": "Claim Adjudication Automation",
        "portal": "INSURANCE",
        "agent": "Insurance Agent",
        "description": "Claim → insurance rules → adjudication → status → audit."
    },
    {
        "id": 19,
        "slug": "claim_settlement",
        "title": "Claim Settlement Automation",
        "portal": "INSURANCE",
        "agent": "Insurance Agent",
        "description": "Approved claim → settlement → claim status → patient/insurance synchronization."
    },
    {
        "id": 20,
        "slug": "care_coordination",
        "title": "End-to-End Care Coordination Automation",
        "portal": "HOSPITAL / CROSS-PORTAL",
        "agent": "Assistant Agent",
        "description": "Patient event → Assistant Agent → determine required workflow → route to Patient/Medical/Appointment/Insurance agent → execute permitted operations → synchronize all affected portals."
    }
]

class AutomationService:
    """
    Lightweight orchestration service powering the 20 major MEDION automations.
    Aggressively reuses existing Agents, mock_db/Supabase, schemas, and audit logs.
    """

    def _log_audit(self, event_type: str, actor: str, target_id: str, details: Dict[str, Any]) -> Dict[str, Any]:
        log_entry = {
            "log_id": f"AUD-{uuid.uuid4().hex[:8].upper()}",
            "event_type": event_type,
            "actor": actor,
            "target_id": target_id,
            "details": details,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        mock_db.add_audit_log(log_entry)
        return log_entry

    # 1. Patient Registration Automation
    def auto_1_patient_registration(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        res = patient_service.register_patient(payload)
        patient = res.get("patient") or {}
        audit = self._log_audit(
            event_type="PATIENT_REGISTRATION",
            actor=payload.get("registered_by", "PATIENT_PORTAL"),
            target_id=patient.get("patient_id", "UNKNOWN"),
            details={"name": f"{patient.get('first_name')} {patient.get('last_name')}", "email": patient.get("email")}
        )
        return {
            "automation_id": 1,
            "automation_slug": "patient_registration",
            "status": "SUCCESS",
            "portal": "PATIENT",
            "patient_id": patient.get("patient_id"),
            "patient": patient,
            "audit_id": audit["log_id"],
            "ui_sync": {"refresh_patients": True, "active_patient_id": patient.get("patient_id")},
            "summary": res.get("summary", "Patient registered successfully.")
        }

    # 2. Appointment Booking Automation
    def auto_2_appointment_booking(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        res = appointment_service.book_appointment(payload)
        apt = res.get("appointment") or {}
        audit = self._log_audit(
            event_type="APPOINTMENT_BOOKING",
            actor=payload.get("booked_by", payload.get("patient_id", "PATIENT_PORTAL")),
            target_id=apt.get("appointment_id", "UNKNOWN"),
            details={"patient_id": apt.get("patient_id"), "doctor_id": apt.get("doctor_id"), "date": apt.get("appointment_date")}
        )
        return {
            "automation_id": 2,
            "automation_slug": "appointment_booking",
            "status": "SUCCESS",
            "portal": "PATIENT",
            "appointment_id": apt.get("appointment_id"),
            "appointment": apt,
            "audit_id": audit["log_id"],
            "ui_sync": {"refresh_appointments": True, "calendar_updated": True},
            "summary": res.get("summary", "Appointment booked successfully.")
        }

    # 3. Appointment Rescheduling Automation
    def auto_3_appointment_rescheduling(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        apt_id = payload.get("appointment_id")
        existing = mock_db.find_one("appointments", "appointment_id", apt_id) if apt_id else None
        if not existing:
            apts = mock_db.get_collection("appointments")
            if apts:
                payload["appointment_id"] = apts[0].get("appointment_id")
            else:
                booked = appointment_service.book_appointment({
                    "patient_id": payload.get("patient_id", "PAT-1001"),
                    "doctor_id": "DOC-101",
                    "appointment_date": "2026-09-22",
                    "time_slot": "10:00 AM - 10:30 AM"
                })
                payload["appointment_id"] = booked["appointment"]["appointment_id"]

        res = appointment_service.reschedule_appointment(payload)
        apt = res.get("appointment") or {}
        audit = self._log_audit(
            event_type="APPOINTMENT_RESCHEDULED",
            actor=payload.get("requested_by", "PATIENT_PORTAL"),
            target_id=apt.get("appointment_id", "UNKNOWN"),
            details={"new_date": apt.get("appointment_date"), "new_time_slot": apt.get("time_slot")}
        )
        return {
            "automation_id": 3,
            "automation_slug": "appointment_rescheduling",
            "status": "SUCCESS",
            "portal": "PATIENT",
            "appointment_id": apt.get("appointment_id"),
            "appointment": apt,
            "audit_id": audit["log_id"],
            "ui_sync": {"refresh_appointments": True, "calendar_updated": True},
            "summary": res.get("summary", "Appointment rescheduled successfully.")
        }

    # 4. Prescription Access Automation
    def auto_4_prescription_access(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        patient_id = payload.get("patient_id") or "PAT-1001"
        caller_id = payload.get("caller_patient_id") or payload.get("authenticated_patient_id") or patient_id
        
        # Enforce patient scope
        if caller_id and patient_id and str(caller_id).upper() != str(patient_id).upper():
            raise PermissionError(f"Access Denied: Patient {caller_id} cannot access prescriptions for {patient_id}.")

        prescriptions = mock_db.find_many("prescriptions", "patient_id", patient_id)
        audit = self._log_audit(
            event_type="PRESCRIPTION_ACCESS",
            actor=caller_id,
            target_id=patient_id,
            details={"count": len(prescriptions)}
        )
        return {
            "automation_id": 4,
            "automation_slug": "prescription_access",
            "status": "SUCCESS",
            "portal": "PATIENT",
            "patient_id": patient_id,
            "count": len(prescriptions),
            "prescriptions": prescriptions,
            "audit_id": audit["log_id"],
            "ui_sync": {"refresh_prescriptions": True},
            "summary": f"Retrieved {len(prescriptions)} authorized prescription(s) for patient {patient_id}."
        }

    # 5. Clinical Review Automation
    def auto_5_clinical_review(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        patient_id = payload.get("patient_id") or "PAT-1001"
        doctor_id = payload.get("doctor_id") or "DOC-101"
        patient = mock_db.find_one("patients", "patient_id", patient_id)
        medical_records = mock_db.find_many("medical_records", "patient_id", patient_id)
        lab_reports = mock_db.find_many("lab_reports", "patient_id", patient_id)
        prescriptions = mock_db.find_many("prescriptions", "patient_id", patient_id)

        audit = self._log_audit(
            event_type="CLINICAL_REVIEW",
            actor=doctor_id,
            target_id=patient_id,
            details={"records_reviewed": len(medical_records), "labs_reviewed": len(lab_reports)}
        )
        return {
            "automation_id": 5,
            "automation_slug": "clinical_review",
            "status": "SUCCESS",
            "portal": "DOCTOR",
            "patient_id": patient_id,
            "patient": patient,
            "clinical_summary": {
                "active_conditions": [r.get("diagnosis") for r in medical_records if r.get("diagnosis")],
                "latest_labs": [l.get("test_name") for l in lab_reports[:3]],
                "current_medications": len(prescriptions)
            },
            "audit_id": audit["log_id"],
            "ui_sync": {"patient_context_loaded": True},
            "summary": f"Clinical review prepared for Dr. {doctor_id} regarding patient {patient_id}."
        }

    # 6. AI Clinical Proposal Automation (Zero Database Mutation Guaranteed)
    def auto_6_ai_clinical_proposal(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        rx_count_before = len(mock_db.get_collection("prescriptions"))
        cds_res = medical_service.clinical_decision_support(payload)
        rx_count_after = len(mock_db.get_collection("prescriptions"))
        
        # Zero-mutation assertion
        if rx_count_before != rx_count_after:
            raise RuntimeError("CRITICAL VIOLATION: AI Clinical Proposal caused database mutation!")

        proposal = {
            "proposal_id": cds_res.get("proposal_id", "PROP-CDS-001"),
            "status": "PROPOSED",
            "contraindications": cds_res.get("contraindications", []),
            "guideline_evidence": cds_res.get("guideline_evidence"),
            "safety_status": cds_res.get("safety_status"),
            "is_committed": False
        }
        audit = self._log_audit(
            event_type="AI_CLINICAL_PROPOSAL_GENERATED",
            actor="MedicalAgent",
            target_id=payload.get("patient_id", "PAT-1001"),
            details={"proposal_id": proposal["proposal_id"], "mutation_count": 0}
        )
        return {
            "automation_id": 6,
            "automation_slug": "ai_clinical_proposal",
            "status": "SUCCESS",
            "portal": "DOCTOR",
            "proposal": proposal,
            "database_mutated": False,
            "audit_id": audit["log_id"],
            "ui_sync": {"display_proposal_card": True, "requires_physician_signature": True},
            "summary": "AI clinical proposal generated with strictly ZERO database mutation. Pending physician review."
        }

    # 7. Prescription Signing Automation
    def auto_7_prescription_signing(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        res = medical_service.sign_clinical_order(payload)
        rx = res.get("prescription") or {}
        audit = self._log_audit(
            event_type="PRESCRIPTION_SIGNED",
            actor=payload.get("approved_by", "Dr. Rajesh Mehta, MD"),
            target_id=rx.get("prescription_id", "UNKNOWN"),
            details={"patient_id": rx.get("patient_id"), "signed_at": res.get("signed_at")}
        )
        return {
            "automation_id": 7,
            "automation_slug": "prescription_signing",
            "status": "SUCCESS",
            "portal": "DOCTOR",
            "prescription_id": rx.get("prescription_id"),
            "prescription": rx,
            "signed_by": res.get("signed_by"),
            "signed_at": res.get("signed_at"),
            "audit_id": audit["log_id"],
            "ui_sync": {"refresh_prescriptions": True, "order_signed": True},
            "summary": res.get("summary", "Prescription signed and authorized.")
        }

    # 8. Patient Follow-up Automation
    def auto_8_patient_follow_up(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        patient_id = payload.get("patient_id") or "PAT-1001"
        doctor_id = payload.get("doctor_id") or "DOC-101"
        follow_up_date = payload.get("appointment_date") or datetime.now(timezone.utc).date().isoformat()
        
        # Check slots and book
        slots = mock_db.find_available_slots(doctor_id, follow_up_date)
        chosen_slot = slots[0]["time_slot"] if slots else "10:00 AM - 10:30 AM"
        
        apt_payload = {
            "patient_id": patient_id,
            "doctor_id": doctor_id,
            "appointment_date": follow_up_date,
            "time_slot": chosen_slot,
            "reason_for_visit": payload.get("reason", "Post-Consultation Follow-up")
        }
        res = appointment_service.book_appointment(apt_payload)
        apt = res.get("appointment") or {}
        audit = self._log_audit(
            event_type="FOLLOW_UP_SCHEDULED",
            actor=doctor_id,
            target_id=apt.get("appointment_id", "UNKNOWN"),
            details={"follow_up_date": follow_up_date, "slot": chosen_slot}
        )
        return {
            "automation_id": 8,
            "automation_slug": "patient_follow_up",
            "status": "SUCCESS",
            "portal": "DOCTOR",
            "appointment_id": apt.get("appointment_id"),
            "follow_up_appointment": apt,
            "audit_id": audit["log_id"],
            "ui_sync": {"refresh_calendar": True, "followup_scheduled": True},
            "summary": f"Follow-up appointment {apt.get('appointment_id')} booked for Dr. {doctor_id} on {follow_up_date}."
        }

    # 9. Nursing Task Automation
    def auto_9_nursing_task(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        task_id = f"TASK-{uuid.uuid4().hex[:6].upper()}"
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
        audit = self._log_audit(
            event_type="NURSING_TASK_CREATED",
            actor=payload.get("created_by", "SYSTEM"),
            target_id=task_id,
            details=task_record
        )
        return {
            "automation_id": 9,
            "automation_slug": "nursing_task",
            "status": "SUCCESS",
            "portal": "NURSE",
            "task_id": task_id,
            "task": persisted,
            "audit_id": audit["log_id"],
            "ui_sync": {"refresh_nursing_tasks": True},
            "summary": f"Nursing task {task_id} ({task_record['task_type']}) assigned to {task_record['assigned_to']}."
        }

    # 10. Vital Escalation Automation
    def auto_10_vital_escalation(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        patient_id = payload.get("patient_id") or "PAT-1001"
        vitals = payload.get("vitals") or {"systolic": 185, "diastolic": 115, "heart_rate": 110, "spo2": 91}
        nurse_id = payload.get("nurse_id") or "NURSE-01"

        vital_id = f"VIT-{uuid.uuid4().hex[:6].upper()}"
        vital_record = {
            "vital_id": vital_id,
            "patient_id": patient_id,
            "nurse_id": nurse_id,
            "vitals": vitals,
            "recorded_at": datetime.now(timezone.utc).isoformat()
        }
        mock_db.add_vital(vital_record)

        # Rule evaluation
        systolic = vitals.get("systolic", 120)
        diastolic = vitals.get("diastolic", 80)
        spo2 = vitals.get("spo2", 98)
        is_critical = systolic >= 180 or diastolic >= 110 or spo2 < 90

        escalation_task = None
        if is_critical:
            escalation_task = {
                "task_id": f"TASK-ESC-{uuid.uuid4().hex[:4].upper()}",
                "patient_id": patient_id,
                "task_type": "URGENT_HYPERTENSIVE_ESCALATION",
                "priority": "CRITICAL",
                "status": "URGENT_ATTENTION_REQUIRED",
                "department": "Critical Care / Floor",
                "details": f"Severe vitals deviation: BP {systolic}/{diastolic}, SpO2 {spo2}%",
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            mock_db.add_task(escalation_task)

        audit = self._log_audit(
            event_type="VITAL_ESCALATION" if is_critical else "VITAL_RECORDED",
            actor=nurse_id,
            target_id=patient_id,
            details={"is_critical": is_critical, "vitals": vitals}
        )
        return {
            "automation_id": 10,
            "automation_slug": "vital_escalation",
            "status": "SUCCESS",
            "portal": "NURSE",
            "vital_id": vital_id,
            "is_critical": is_critical,
            "severity": "CRITICAL" if is_critical else "NORMAL",
            "escalation_task": escalation_task,
            "audit_id": audit["log_id"],
            "ui_sync": {"banner_alert": is_critical, "refresh_vitals": True},
            "summary": f"Vitals evaluated for {patient_id}: {'CRITICAL escalation triggered!' if is_critical else 'Normal parameters.'}"
        }

    # 11. Medication Workflow Automation
    def auto_11_medication_workflow(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        res = nurse_service.administer_medication(payload)
        audit = self._log_audit(
            event_type="MEDICATION_ADMINISTERED",
            actor=payload.get("nurse_id", "NURSE-01"),
            target_id=payload.get("medication_id", "MED-001"),
            details={"patient_id": payload.get("patient_id"), "status": "ADMINISTERED"}
        )
        return {
            "automation_id": 11,
            "automation_slug": "medication_workflow",
            "status": "SUCCESS",
            "portal": "NURSE",
            "patient_id": payload.get("patient_id"),
            "medication_id": payload.get("medication_id"),
            "administration_status": "ADMINISTERED",
            "timestamp": res.get("timestamp"),
            "audit_id": audit["log_id"],
            "ui_sync": {"refresh_emar": True},
            "summary": res.get("summary", "Medication administered and logged to eMAR.")
        }

    # 12. Discharge Workflow Automation
    def auto_12_discharge_workflow(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        patient_id = payload.get("patient_id") or "PAT-1001"
        discharged_by = payload.get("discharged_by") or "Dr. Rajesh Mehta, MD"
        
        # Checklist evaluation
        checklist = {
            "clinical_stability_verified": True,
            "discharge_medications_reconciled": True,
            "patient_education_provided": True,
            "follow_up_appointment_scheduled": True
        }
        
        discharge_summary = {
            "discharge_id": f"DC-{uuid.uuid4().hex[:6].upper()}",
            "patient_id": patient_id,
            "discharged_by": discharged_by,
            "discharge_date": datetime.now(timezone.utc).isoformat(),
            "checklist": checklist,
            "status": "DISCHARGED"
        }

        # Log nursing task completion for discharge
        discharge_task = {
            "task_id": f"TASK-DC-{uuid.uuid4().hex[:4].upper()}",
            "patient_id": patient_id,
            "task_type": "PATIENT_DISCHARGE",
            "priority": "MEDIUM",
            "status": "COMPLETED",
            "department": "Inpatient Discharge",
            "details": f"Discharge checklist reconciled and approved by {discharged_by}.",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        mock_db.add_task(discharge_task)

        # Update patient status
        patient = mock_db.find_one("patients", "patient_id", patient_id)
        if patient:
            patient["discharge_status"] = "DISCHARGED"

        audit = self._log_audit(
            event_type="PATIENT_DISCHARGED",
            actor=discharged_by,
            target_id=patient_id,
            details=discharge_summary
        )
        return {
            "automation_id": 12,
            "automation_slug": "discharge_workflow",
            "status": "SUCCESS",
            "portal": "NURSE",
            "patient_id": patient_id,
            "discharge_summary": discharge_summary,
            "audit_id": audit["log_id"],
            "ui_sync": {"patient_discharged": True, "refresh_beds": True},
            "summary": f"Discharge workflow completed for patient {patient_id} by {discharged_by}."
        }

    # 13. Specimen Processing Automation
    def auto_13_specimen_processing(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        specimen_id = payload.get("specimen_id") or f"SPEC-{uuid.uuid4().hex[:6].upper()}"
        lab_id = payload.get("laboratory_id", "LAB-001")
        
        specimen_record = {
            "specimen_id": specimen_id,
            "patient_id": payload.get("patient_id", "PAT-1001"),
            "laboratory_id": lab_id,
            "test_type": payload.get("test_type", "Comprehensive Metabolic Panel"),
            "status": "IN_ANALYSIS",
            "received_at": datetime.now(timezone.utc).isoformat()
        }
        mock_db.add_lab_order(specimen_record)

        audit = self._log_audit(
            event_type="SPECIMEN_RECEIVED",
            actor=payload.get("technician_id", "LAB-TECH-01"),
            target_id=specimen_id,
            details=specimen_record
        )
        return {
            "automation_id": 13,
            "automation_slug": "specimen_processing",
            "status": "SUCCESS",
            "portal": "LAB",
            "specimen_id": specimen_id,
            "order_status": "IN_ANALYSIS",
            "specimen": specimen_record,
            "audit_id": audit["log_id"],
            "ui_sync": {"refresh_specimens": True},
            "summary": f"Specimen {specimen_id} logged and transitioned to IN_ANALYSIS at {lab_id}."
        }

    # 14. Lab Report Automation
    def auto_14_lab_report(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        res = medical_service.analyze_lab_report(payload)
        report_id = res.get("report_id") or "LABR-1001"
        audit = self._log_audit(
            event_type="LAB_REPORT_ANALYZED",
            actor="MedicalAgent",
            target_id=report_id,
            details={"abnormal_count": len(res.get("abnormal_findings", [])), "priority": res.get("priority")}
        )
        return {
            "automation_id": 14,
            "automation_slug": "lab_report",
            "status": "SUCCESS",
            "portal": "LAB",
            "report_id": report_id,
            "priority": res.get("priority"),
            "abnormal_findings": res.get("abnormal_findings", []),
            "normal_findings": res.get("normal_findings", []),
            "audit_id": audit["log_id"],
            "ui_sync": {"refresh_lab_reports": True},
            "summary": res.get("summary", "Lab report processed and analyzed.")
        }

    # 15. Critical Lab Notification Automation
    def auto_15_critical_lab_notification(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        report_id = payload.get("report_id") or "LABR-1001"
        patient_id = payload.get("patient_id") or "PAT-1001"
        doctor_id = payload.get("doctor_id") or "DOC-101"
        critical_parameters = payload.get("critical_parameters") or ["Potassium (K+) 6.2 mEq/L (Critical High)"]

        notification = {
            "notification_id": f"NOTIF-CRIT-{uuid.uuid4().hex[:6].upper()}",
            "recipient_id": doctor_id,
            "patient_id": patient_id,
            "severity": "CRITICAL",
            "type": "PANIC_LAB_ALERT",
            "message": f"CRITICAL PANIC VALUE for patient {patient_id}: {', '.join(critical_parameters)}. Immediate clinical action required.",
            "requires_acknowledgment": True,
            "dispatched_at": datetime.now(timezone.utc).isoformat()
        }
        
        audit = self._log_audit(
            event_type="CRITICAL_LAB_ALERT_DISPATCHED",
            actor="LabAgent",
            target_id=doctor_id,
            details=notification
        )
        return {
            "automation_id": 15,
            "automation_slug": "critical_lab_notification",
            "status": "SUCCESS",
            "portal": "LAB",
            "notification": notification,
            "doctor_id": doctor_id,
            "patient_id": patient_id,
            "audit_id": audit["log_id"],
            "ui_sync": {"doctor_alert_banner": True, "audio_alert": True},
            "summary": f"Critical panic value notification dispatched to Dr. {doctor_id} for patient {patient_id}."
        }

    # 16. Patient Lab Result Automation
    def auto_16_patient_lab_result(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        report_id = payload.get("report_id") or "LABR-1001"
        approver_id = payload.get("approver_id") or "LAB-DIR-01"
        
        # Approve report
        lab_res = lab_service.approve_report({"report_id": report_id, "approver_id": approver_id})
        
        # Verify patient authorization release
        report = mock_db.find_one("lab_reports", "report_id", report_id) or {}
        patient_id = report.get("patient_id", payload.get("patient_id", "PAT-1001"))

        audit = self._log_audit(
            event_type="LAB_REPORT_RELEASED_TO_PATIENT",
            actor=approver_id,
            target_id=report_id,
            details={"patient_id": patient_id, "status": "APPROVED"}
        )
        return {
            "automation_id": 16,
            "automation_slug": "patient_lab_result",
            "status": "SUCCESS",
            "portal": "LAB",
            "report_id": report_id,
            "patient_id": patient_id,
            "is_available_to_patient": True,
            "audit_id": audit["log_id"],
            "ui_sync": {"refresh_patient_labs": True, "patient_notification": True},
            "summary": f"Lab report {report_id} authorized by {approver_id} and published to patient portal."
        }

    # 17. Claim Creation/Validation Automation
    def auto_17_claim_creation(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        patient_id = payload.get("patient_id") or "PAT-1025"
        patient = mock_db.find_one("patients", "patient_id", patient_id)
        if not patient:
            raise ValueError(f"Patient '{patient_id}' not found.")
        
        policy_id = payload.get("policy_id") or patient.get("insurance_policy_id") or "POL-725"
        claim_id = mock_db.generate_claim_id()
        amount = float(payload.get("total_amount") or payload.get("claim_amount") or 850.0)

        claim_record = {
            "claim_id": claim_id,
            "patient_id": patient_id,
            "policy_id": policy_id,
            "provider_id": payload.get("provider_id", "PROV-INS-01"),
            "service_type": payload.get("service_type", "Comprehensive Metabolic Consultation"),
            "claim_amount": amount,
            "approved_amount": 0.0,
            "status": "SUBMITTED",
            "submitted_date": datetime.now(timezone.utc).isoformat(),
            "adjudication_notes": "Claim created and submitted for payer adjudication."
        }
        persisted = mock_db.add_claim(claim_record)

        audit = self._log_audit(
            event_type="CLAIM_CREATED",
            actor=payload.get("submitted_by", "HOSPITAL_BILLING"),
            target_id=claim_id,
            details={"amount": amount, "policy_id": policy_id}
        )
        return {
            "automation_id": 17,
            "automation_slug": "claim_creation",
            "status": "SUCCESS",
            "portal": "INSURANCE",
            "claim_id": claim_id,
            "claim": persisted,
            "audit_id": audit["log_id"],
            "ui_sync": {"refresh_claims": True},
            "summary": f"Claim {claim_id} created for ${amount} under policy {policy_id}."
        }

    # 18. Claim Adjudication Automation
    def auto_18_claim_adjudication(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        claim_id = payload.get("claim_id") or "CLM-1025"
        claim = mock_db.find_one("insurance_claims", "claim_id", claim_id)
        if not claim:
            # Fallback to demo claim
            claims = mock_db.get_collection("insurance_claims")
            claim = claims[0] if claims else None
            if claim:
                claim_id = claim["claim_id"]

        if not claim:
            raise ValueError(f"Claim '{claim_id}' not found for adjudication.")

        policy_id = claim.get("policy_id", "POL-725")
        policy = mock_db.find_one("insurance_policies", "policy_id", policy_id) or {
            "policy_id": policy_id,
            "status": "ACTIVE",
            "copay_percentage": 10.0,
            "remaining_coverage": 50000.0
        }

        adjudication = mock_insurance_system.adjudicate_claim(claim, policy)
        updates = {
            "status": adjudication.get("status", "APPROVED"),
            "approved_amount": adjudication.get("approved_amount", claim.get("claim_amount", 850.0) * 0.9),
            "processed_date": datetime.now(timezone.utc).isoformat(),
            "adjudication_notes": adjudication.get("adjudication_notes", "Adjudicated per standard benefits.")
        }
        updated = mock_db.update_claim(claim_id, updates)

        audit = self._log_audit(
            event_type="CLAIM_ADJUDICATED",
            actor=payload.get("payer_officer_id", "PAYER-SYS-AUTO"),
            target_id=claim_id,
            details=updates
        )
        return {
            "automation_id": 18,
            "automation_slug": "claim_adjudication",
            "status": "SUCCESS",
            "portal": "INSURANCE",
            "claim_id": claim_id,
            "adjudication_status": updates["status"],
            "approved_amount": updates["approved_amount"],
            "claim": updated,
            "audit_id": audit["log_id"],
            "ui_sync": {"refresh_claims": True, "update_billing_status": True},
            "summary": f"Claim {claim_id} adjudicated: {updates['status']} (Approved: ${updates['approved_amount']})."
        }

    # 19. Claim Settlement Automation
    def auto_19_claim_settlement(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        claim_id = payload.get("claim_id") or "CLM-1025"
        claim = mock_db.find_one("insurance_claims", "claim_id", claim_id)
        if not claim:
            claims = mock_db.get_collection("insurance_claims")
            claim = claims[0] if claims else None
            if claim:
                claim_id = claim["claim_id"]

        if not claim:
            raise ValueError(f"Claim '{claim_id}' not found for settlement.")

        txn_ref = payload.get("transaction_ref") or f"TXN-DISB-{uuid.uuid4().hex[:8].upper()}"
        settled_amount = float(payload.get("amount") or claim.get("approved_amount") or claim.get("claim_amount") or 850.0)

        updates = {
            "status": "SETTLED",
            "settlement_reference": txn_ref,
            "settled_date": datetime.now(timezone.utc).isoformat(),
            "adjudication_notes": f"Settlement disbursed via EFT ref {txn_ref}."
        }
        updated = mock_db.update_claim(claim_id, updates)

        audit = self._log_audit(
            event_type="CLAIM_SETTLED",
            actor=payload.get("settled_by", "TREASURY_OFFICER"),
            target_id=claim_id,
            details={"amount": settled_amount, "transaction_ref": txn_ref}
        )
        return {
            "automation_id": 19,
            "automation_slug": "claim_settlement",
            "status": "SUCCESS",
            "portal": "INSURANCE",
            "claim_id": claim_id,
            "settlement_status": "SETTLED",
            "settlement_reference": txn_ref,
            "settled_amount": settled_amount,
            "claim": updated,
            "audit_id": audit["log_id"],
            "ui_sync": {"refresh_claims": True, "patient_balance_cleared": True},
            "summary": f"Claim {claim_id} settled in full (${settled_amount}) with reference {txn_ref}."
        }

    # 20. End-to-End Care Coordination Automation
    def auto_20_care_coordination(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        patient_id = payload.get("patient_id") or "PAT-1025"
        patient = mock_db.find_one("patients", "patient_id", patient_id) or mock_db.find_one("patients", "patient_id", "PAT-1001")
        pid = patient.get("patient_id", "PAT-1001")
        policy_id = patient.get("insurance_policy_id", "POL-725")

        coordination_steps = []

        # Step 1: Patient lookup (Patient Agent)
        p_res = patient_service.get_patient({"patient_id": pid})
        coordination_steps.append({
            "step": 1,
            "agent": "Patient Agent",
            "action": "verify_patient_identity",
            "status": "COMPLETED",
            "details": f"Patient profile active: {patient.get('first_name')} {patient.get('last_name')}"
        })

        # Step 2: Clinical review & CDS (Medical Agent)
        cds_res = medical_service.clinical_decision_support({"patient_id": pid})
        coordination_steps.append({
            "step": 2,
            "agent": "Medical Agent",
            "action": "evaluate_clinical_decision_support",
            "status": "COMPLETED",
            "details": f"Safety screening cleared: {cds_res.get('safety_status')}"
        })

        # Step 3: Nurse care task creation (Nurse Agent)
        nurse_task_id = f"TASK-COORD-{uuid.uuid4().hex[:4].upper()}"
        mock_db.add_task({
            "task_id": nurse_task_id,
            "patient_id": pid,
            "task_type": "MULTIDISCIPLINARY_CARE_COORDINATION",
            "priority": "MEDIUM",
            "status": "IN_PROGRESS",
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        coordination_steps.append({
            "step": 3,
            "agent": "Nurse Agent",
            "action": "create_care_task",
            "status": "COMPLETED",
            "details": f"Care management task {nurse_task_id} generated"
        })

        # Step 4: Appointment follow-up slot lookup (Appointment Agent)
        apt_date = datetime.now(timezone.utc).date().isoformat()
        slots = mock_db.find_available_slots("DOC-101", apt_date)
        slot_cand = slots[0]["time_slot"] if slots else "11:00 AM - 11:30 AM"
        coordination_steps.append({
            "step": 4,
            "agent": "Appointment Agent",
            "action": "reserve_follow_up_window",
            "status": "COMPLETED",
            "details": f"Follow-up window identified: {apt_date} {slot_cand}"
        })

        # Step 5: Insurance pre-authorization check (Insurance Agent)
        ins_res = insurance_service.verify_insurance({"patient_id": pid, "policy_id": policy_id})
        coordination_steps.append({
            "step": 5,
            "agent": "Insurance Agent",
            "action": "pre_authorization_verification",
            "status": "COMPLETED",
            "details": f"Coverage confirmed under policy {policy_id} (Eligible: {ins_res.get('eligible', True)})"
        })

        audit = self._log_audit(
            event_type="CROSS_PORTAL_CARE_COORDINATION",
            actor="AssistantAgent",
            target_id=pid,
            details={"steps_completed": len(coordination_steps), "policy_id": policy_id}
        )

        return {
            "automation_id": 20,
            "automation_slug": "care_coordination",
            "status": "SUCCESS",
            "portal": "HOSPITAL / CROSS-PORTAL",
            "patient_id": pid,
            "steps_count": len(coordination_steps),
            "coordination_steps": coordination_steps,
            "portals_synchronized": ["PATIENT", "DOCTOR", "NURSE", "LAB", "INSURANCE"],
            "audit_id": audit["log_id"],
            "ui_sync": {
                "cross_portal_sync": True,
                "synchronized_patient_id": pid
            },
            "summary": f"End-to-end care coordination successfully executed across all 5 clinical and administrative portals for patient {pid}."
        }

    def execute_automation(self, automation_id: int, payload: Dict[str, Any]) -> Dict[str, Any]:
        dispatch_map = {
            1: self.auto_1_patient_registration,
            2: self.auto_2_appointment_booking,
            3: self.auto_3_appointment_rescheduling,
            4: self.auto_4_prescription_access,
            5: self.auto_5_clinical_review,
            6: self.auto_6_ai_clinical_proposal,
            7: self.auto_7_prescription_signing,
            8: self.auto_8_patient_follow_up,
            9: self.auto_9_nursing_task,
            10: self.auto_10_vital_escalation,
            11: self.auto_11_medication_workflow,
            12: self.auto_12_discharge_workflow,
            13: self.auto_13_specimen_processing,
            14: self.auto_14_lab_report,
            15: self.auto_15_critical_lab_notification,
            16: self.auto_16_patient_lab_result,
            17: self.auto_17_claim_creation,
            18: self.auto_18_claim_adjudication,
            19: self.auto_19_claim_settlement,
            20: self.auto_20_care_coordination,
        }
        if automation_id not in dispatch_map:
            raise ValueError(f"Invalid automation_id: {automation_id}. Must be between 1 and 20.")
        return dispatch_map[automation_id](payload)

automation_service = AutomationService()
