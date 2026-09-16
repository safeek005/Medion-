from fastapi import APIRouter, HTTPException, Query, Path
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field

from app.services.automation_service import automation_service, AUTOMATIONS
from app.services.mock_db import mock_db

router = APIRouter(prefix="/automations", tags=["Major Automations"])

class AutomationTriggerRequest(BaseModel):
    payload: Dict[str, Any] = Field(default_factory=dict, description="Input parameters for the automation workflow")

@router.get("", response_model=List[Dict[str, Any]])
def list_automations():
    """Returns the catalog of 20 MEDION major automations across all 5 portals."""
    return AUTOMATIONS

@router.get("/{automation_id}", response_model=Dict[str, Any])
def get_automation_details(automation_id: int = Path(..., ge=1, le=20)):
    """Retrieves metadata and specifications for a single automation by ID."""
    for auto in AUTOMATIONS:
        if auto["id"] == automation_id:
            return auto
    raise HTTPException(status_code=404, detail=f"Automation {automation_id} not found.")

@router.post("/{automation_id}/trigger", response_model=Dict[str, Any])
def trigger_automation(
    automation_id: int = Path(..., ge=1, le=20),
    request: Optional[AutomationTriggerRequest] = None
):
    """
    Triggers an end-to-end automation workflow:
    Trigger -> Intent/Parameter Extraction -> Specialized Agent -> Service/DB Operation -> Audit/Status -> UI Synchronization.
    """
    payload = request.payload if request else {}
    try:
        result = automation_service.execute_automation(automation_id, payload)
        return result
    except PermissionError as pe:
        raise HTTPException(status_code=403, detail=str(pe))
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Automation execution failed: {str(e)}")

@router.post("/run-all", response_model=Dict[str, Any])
def run_all_automations():
    """
    Executes all 20 MEDION automations in rapid sequence to verify end-to-end platform integrity.
    """
    results = []
    success_count = 0

    # Default payload context for realistic sequential execution
    default_payloads = {
        1: {"first_name": "TestAuto", "last_name": "Patient", "dob": "1990-05-15", "gender": "Female", "phone": "+91 99880 12345", "email": "testauto@medion.health"},
        2: {"patient_id": "PAT-1001", "doctor_id": "DOC-101", "appointment_date": "2026-09-20", "time_slot": "09:00 AM - 09:30 AM", "reason_for_visit": "Annual Health Check"},
        3: {"appointment_id": "APT-1001", "new_date": "2026-09-25", "new_time_slot": "10:00 AM - 10:30 AM"},
        4: {"patient_id": "PAT-1001", "caller_patient_id": "PAT-1001"},
        5: {"patient_id": "PAT-1001", "doctor_id": "DOC-101"},
        6: {"patient_id": "PAT-1001", "doctor_id": "DOC-101", "action": "EVALUATE_TITRATION"},
        7: {"patient_id": "PAT-1001", "doctor_id": "DOC-101", "approved_by": "Dr. Rajesh Mehta, MD"},
        8: {"patient_id": "PAT-1001", "doctor_id": "DOC-101", "appointment_date": "2026-09-30", "reason": "Follow-up Post Consultation"},
        9: {"patient_id": "PAT-1001", "nurse_id": "NURSE-01", "task_type": "POST_OP_VITALS", "priority": "HIGH"},
        10: {"patient_id": "PAT-1001", "nurse_id": "NURSE-01", "vitals": {"systolic": 185, "diastolic": 115, "spo2": 91}},
        11: {"patient_id": "PAT-1001", "medication_id": "MED-RX-101", "nurse_id": "NURSE-01"},
        12: {"patient_id": "PAT-1001", "discharged_by": "Dr. Rajesh Mehta, MD"},
        13: {"patient_id": "PAT-1001", "laboratory_id": "LAB-001", "test_type": "Renal Function Panel"},
        14: {"patient_id": "PAT-1001", "report_id": "LABR-1001"},
        15: {"patient_id": "PAT-1001", "doctor_id": "DOC-101", "critical_parameters": ["Serum Potassium 6.2 mEq/L"]},
        16: {"report_id": "LABR-1001", "approver_id": "LAB-DIR-01"},
        17: {"patient_id": "PAT-1025", "policy_id": "POL-725", "total_amount": 850.0},
        18: {"claim_id": "CLM-1025"},
        19: {"claim_id": "CLM-1025", "amount": 850.0},
        20: {"patient_id": "PAT-1025"}
    }

    import uuid
    for auto in AUTOMATIONS:
        auto_id = auto["id"]
        payload = dict(default_payloads.get(auto_id, {}))
        if auto_id == 1:
            rand_suffix = uuid.uuid4().hex[:6]
            payload["email"] = f"testauto_{rand_suffix}@medion.health"
            payload["phone"] = f"+91 99880 {int(rand_suffix[:4], 16) % 90000 + 10000}"
        elif auto_id == 2:
            date_to_use = payload.get("appointment_date", "2026-09-20")
            slots = mock_db.find_available_slots("DOC-101", date_to_use)
            if slots:
                payload["time_slot"] = slots[0]["time_slot"]
            else:
                payload["appointment_date"] = "2026-10-15"
                payload["time_slot"] = "10:00-10:30"
        try:
            res = automation_service.execute_automation(auto_id, payload)
            results.append({
                "id": auto_id,
                "slug": auto["slug"],
                "title": auto["title"],
                "portal": auto["portal"],
                "status": "SUCCESS",
                "summary": res.get("summary")
            })
            success_count += 1
        except Exception as err:
            results.append({
                "id": auto_id,
                "slug": auto["slug"],
                "title": auto["title"],
                "portal": auto["portal"],
                "status": "FAILED",
                "error": str(err)
            })

    return {
        "total_automations": len(AUTOMATIONS),
        "successful": success_count,
        "failed": len(AUTOMATIONS) - success_count,
        "all_passed": success_count == len(AUTOMATIONS),
        "results": results
    }
