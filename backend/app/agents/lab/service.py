from typing import Dict, Any
from app.services.mock_db import mock_db
from datetime import datetime, timezone

class LabService:
    def get_pending_orders(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        lab_id = payload.get("laboratory_id", "LAB-001")
        
        # We assume a lab_orders collection
        orders = mock_db.get_collection("lab_orders")
        pending = [o for o in orders if o.get("status") == "PENDING" and o.get("laboratory_id") == lab_id]

        return {
            "success": True,
            "count": len(pending),
            "orders": pending,
            "summary": f"Retrieved {len(pending)} pending lab orders."
        }

    def approve_report(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        report_id = payload.get("report_id")
        approver_id = payload.get("approver_id")
        
        if not report_id or not approver_id:
            raise ValueError("report_id and approver_id are required")

        report = mock_db.find_one("lab_reports", "report_id", report_id)
        if not report:
            raise ValueError(f"Lab report '{report_id}' not found.")

        # Update report status to APPROVED
        report["status"] = "APPROVED"
        report["approved_by"] = approver_id
        report["approved_at"] = datetime.now(timezone.utc).isoformat()
        
        # If using real DB, update here
        # mock_db.update_report(...) # requires implementing update_report in mock_db

        return {
            "success": True,
            "report_id": report_id,
            "status": "APPROVED",
            "summary": f"Approved lab report {report_id}."
        }

    def process_specimen(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        specimen_id = payload.get("specimen_id") or f"SPEC-{datetime.now(timezone.utc).strftime('%H%M%S')}"
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
        return {
            "success": True,
            "specimen_id": specimen_id,
            "order_status": "IN_ANALYSIS",
            "specimen": specimen_record,
            "summary": f"Specimen {specimen_id} logged and transitioned to IN_ANALYSIS."
        }

    def notify_critical_lab(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        report_id = payload.get("report_id") or "LABR-1001"
        patient_id = payload.get("patient_id") or "PAT-1001"
        doctor_id = payload.get("doctor_id") or "DOC-101"
        critical_parameters = payload.get("critical_parameters") or ["Serum Potassium 6.2 mEq/L"]
        return {
            "success": True,
            "report_id": report_id,
            "patient_id": patient_id,
            "doctor_id": doctor_id,
            "severity": "CRITICAL",
            "critical_parameters": critical_parameters,
            "summary": f"Urgent panic value notification dispatched to Dr. {doctor_id}."
        }

    def authorize_patient_lab_release(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        report_id = payload.get("report_id") or "LABR-1001"
        approver_id = payload.get("approver_id") or "LAB-DIR-01"
        return self.approve_report({"report_id": report_id, "approver_id": approver_id})

lab_service = LabService()
