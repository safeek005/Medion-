import pytest
import sys
from pathlib import Path
from fastapi.testclient import TestClient

backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.main import app
from app.services.mock_db import mock_db
from app.services.automation_service import automation_service, AUTOMATIONS

client = TestClient(app)

@pytest.fixture(autouse=True)
def reset_mock_db():
    mock_db.reload_data()

def test_automation_catalog_count():
    assert len(AUTOMATIONS) == 20
    response = client.get("/api/v1/automations")
    assert response.status_code == 200
    assert len(response.json()) == 20

def test_patient_registration_automation():
    import uuid
    rand_email = f"pat_{uuid.uuid4().hex[:6]}@testmedion.org"
    res = automation_service.execute_automation(1, {
        "first_name": "Kavya",
        "last_name": "TestAuto",
        "dob": "1994-06-12",
        "gender": "Female",
        "phone": "+91 98450 99881",
        "email": rand_email
    })
    assert res["status"] == "SUCCESS"
    assert res["patient_id"].startswith("PAT-")
    assert "audit_id" in res

def test_appointment_booking_and_rescheduling_automations():
    # 2. Booking
    slots = mock_db.find_available_slots("DOC-101", "2026-10-20")
    slot = slots[0]["time_slot"] if slots else "10:00-10:30"
    res_book = automation_service.execute_automation(2, {
        "patient_id": "PAT-1001",
        "doctor_id": "DOC-101",
        "appointment_date": "2026-10-20",
        "time_slot": slot,
        "reason_for_visit": "Cardiology Consultation"
    })
    assert res_book["status"] == "SUCCESS"
    apt_id = res_book["appointment_id"]

    # 3. Rescheduling
    res_resched = automation_service.execute_automation(3, {
        "appointment_id": apt_id,
        "new_date": "2026-10-22",
        "new_time_slot": "14:00-14:30"
    })
    assert res_resched["status"] == "SUCCESS"
    assert res_resched["appointment"]["appointment_date"] == "2026-10-22"

def test_prescription_access_patient_isolation():
    # 4. Patient-scoped retrieval
    res = automation_service.execute_automation(4, {
        "patient_id": "PAT-1025",
        "caller_patient_id": "PAT-1025"
    })
    assert res["status"] == "SUCCESS"
    assert res["patient_id"] == "PAT-1025"

    # Cross-patient access denied
    with pytest.raises(PermissionError):
        automation_service.execute_automation(4, {
            "patient_id": "PAT-1001",
            "caller_patient_id": "PAT-1025"
        })

def test_clinical_review_and_ai_proposal_safety():
    # 5. Clinical review
    res_rev = automation_service.execute_automation(5, {
        "patient_id": "PAT-1001",
        "doctor_id": "DOC-101"
    })
    assert res_rev["status"] == "SUCCESS"
    assert "clinical_summary" in res_rev

    # 6. AI clinical proposal - ZERO MUTATION GUARANTEE
    init_rx_count = len(mock_db.get_collection("prescriptions"))
    res_prop = automation_service.execute_automation(6, {
        "patient_id": "PAT-1001",
        "doctor_id": "DOC-101"
    })
    assert res_prop["status"] == "SUCCESS"
    assert res_prop["database_mutated"] is False
    assert len(mock_db.get_collection("prescriptions")) == init_rx_count

def test_prescription_signing_automation():
    # 7. Authorized signing creates mutation with audit
    res_sign = automation_service.execute_automation(7, {
        "patient_id": "PAT-1001",
        "doctor_id": "DOC-101",
        "approved_by": "Dr. Rajesh Mehta, MD"
    })
    assert res_sign["status"] == "SUCCESS"
    assert "prescription_id" in res_sign
    assert "audit_id" in res_sign

def test_patient_follow_up_automation():
    # 8. Follow-up
    res = automation_service.execute_automation(8, {
        "patient_id": "PAT-1001",
        "doctor_id": "DOC-101",
        "appointment_date": "2026-11-05",
        "reason": "Post-discharge review"
    })
    assert res["status"] == "SUCCESS"
    assert "appointment_id" in res

def test_nursing_automations():
    # 9. Nursing task
    res_task = automation_service.execute_automation(9, {
        "patient_id": "PAT-1001",
        "nurse_id": "NURSE-01",
        "task_type": "WOUND_CARE",
        "priority": "HIGH"
    })
    assert res_task["status"] == "SUCCESS"
    assert res_task["task_id"].startswith("TASK-")

    # 10. Vital escalation
    res_vital = automation_service.execute_automation(10, {
        "patient_id": "PAT-1001",
        "nurse_id": "NURSE-01",
        "vitals": {"systolic": 190, "diastolic": 120, "spo2": 88}
    })
    assert res_vital["status"] == "SUCCESS"
    assert res_vital["is_critical"] is True
    assert res_vital["severity"] == "CRITICAL"

    # 11. Medication workflow
    res_med = automation_service.execute_automation(11, {
        "patient_id": "PAT-1001",
        "medication_id": "MED-RX-101",
        "nurse_id": "NURSE-01"
    })
    assert res_med["status"] == "SUCCESS"
    assert res_med["administration_status"] == "ADMINISTERED"

    # 12. Discharge workflow
    res_dc = automation_service.execute_automation(12, {
        "patient_id": "PAT-1001",
        "discharged_by": "Dr. Rajesh Mehta, MD"
    })
    assert res_dc["status"] == "SUCCESS"
    assert res_dc["discharge_summary"]["status"] == "DISCHARGED"

def test_lab_automations():
    # 13. Specimen processing
    res_spec = automation_service.execute_automation(13, {
        "patient_id": "PAT-1001",
        "laboratory_id": "LAB-001",
        "test_type": "Renal Function Panel"
    })
    assert res_spec["status"] == "SUCCESS"
    assert res_spec["specimen"]["status"] == "IN_ANALYSIS"

    # 14. Lab report
    res_rep = automation_service.execute_automation(14, {
        "patient_id": "PAT-1001",
        "report_id": "LABR-1001"
    })
    assert res_rep["status"] == "SUCCESS"
    assert "CLINICAL SUMMARY" in res_rep["summary"]

    # 15. Critical lab notification
    res_crit = automation_service.execute_automation(15, {
        "patient_id": "PAT-1001",
        "doctor_id": "DOC-101",
        "critical_parameters": ["Serum Potassium 6.2 mEq/L"]
    })
    assert res_crit["status"] == "SUCCESS"
    assert "notification" in res_crit

    # 16. Patient lab result publication
    res_pub = automation_service.execute_automation(16, {
        "report_id": "LABR-1001",
        "approver_id": "LAB-DIR-01"
    })
    assert res_pub["status"] == "SUCCESS"
    assert res_pub["is_available_to_patient"] is True

def test_insurance_automations():
    # 17. Claim creation/validation under POL-725 for PAT-1025
    res_claim = automation_service.execute_automation(17, {
        "patient_id": "PAT-1025",
        "policy_id": "POL-725",
        "total_amount": 850.0
    })
    assert res_claim["status"] == "SUCCESS"
    assert res_claim["claim"]["policy_id"] == "POL-725"
    cid = res_claim["claim_id"]

    # 18. Claim adjudication
    res_adj = automation_service.execute_automation(18, {"claim_id": cid})
    assert res_adj["status"] == "SUCCESS"
    assert res_adj["adjudication_status"] in ["APPROVED", "SETTLED"]

    # 19. Claim settlement
    res_set = automation_service.execute_automation(19, {
        "claim_id": cid,
        "amount": 850.0
    })
    assert res_set["status"] == "SUCCESS"
    assert res_set["settlement_status"] == "SETTLED"

def test_cross_portal_care_coordination_automation():
    # 20. End-to-end Care Coordination across all 5 portals
    res_coord = automation_service.execute_automation(20, {"patient_id": "PAT-1025"})
    assert res_coord["status"] == "SUCCESS"
    assert len(res_coord["portals_synchronized"]) == 5
    assert "PATIENT" in res_coord["portals_synchronized"]
    assert "DOCTOR" in res_coord["portals_synchronized"]
    assert "NURSE" in res_coord["portals_synchronized"]
    assert "LAB" in res_coord["portals_synchronized"]
    assert "INSURANCE" in res_coord["portals_synchronized"]

def test_run_all_automations_api():
    response = client.post("/api/v1/automations/run-all")
    assert response.status_code == 200
    data = response.json()
    assert data["total_automations"] == 20
    assert data["successful"] == 20
    assert data["failed"] == 0
    assert data["all_passed"] is True
