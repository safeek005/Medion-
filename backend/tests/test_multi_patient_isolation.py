import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.mock_db import mock_db

client = TestClient(app)

def test_10_synthetic_patients_exist():
    """Verify that exactly 10 synthetic patients PAT-1001..PAT-1010 are loaded."""
    patients = mock_db.get_collection("patients")
    p_ids = [p.get("patient_id") for p in patients if p.get("patient_id")]
    for i in range(1, 11):
        expected_id = f"PAT-10{i:02d}"
        assert expected_id in p_ids, f"Expected synthetic patient {expected_id} to exist in database"

def test_patient_record_isolation():
    """Verify Patient 1 (PAT-1001) cannot query Patient 2 (PAT-1002) records."""
    # PAT-1001 requesting PAT-1002 history
    resp = client.post(
        "/api/v1/workbench/dispatch",
        json={
            "user_role": "patient",
            "caller_patient_id": "PAT-1001",
            "patient_id": "PAT-1002",
            "agent_target": "patient",
            "action": "get_patient",
            "payload": {
                "user_role": "patient",
                "caller_patient_id": "PAT-1001",
                "patient_id": "PAT-1002"
            }
        }
    )
    assert resp.status_code == 403, f"Expected 403 Forbidden for cross-patient lookup, got {resp.status_code}"
    assert "Access Denied" in resp.json()["detail"]

def test_patient_self_lookup_allowed():
    """Verify Patient 1 (PAT-1001) can query their own records."""
    resp = client.post(
        "/api/v1/workbench/dispatch",
        json={
            "user_role": "patient",
            "caller_patient_id": "PAT-1001",
            "patient_id": "PAT-1001",
            "agent_target": "patient",
            "action": "get_patient",
            "payload": {
                "user_role": "patient",
                "caller_patient_id": "PAT-1001",
                "patient_id": "PAT-1001"
            }
        }
    )
    assert resp.status_code == 200
    res_data = resp.json()
    assert res_data["success"] is True

def test_patient_specific_prescriptions():
    """Verify prescriptions belong strictly to matching patient."""
    rx_pat1 = mock_db.find_many("prescriptions", "patient_id", "PAT-1001")
    rx_pat2 = mock_db.find_many("prescriptions", "patient_id", "PAT-1002")
    
    for r in rx_pat1:
        assert r["patient_id"] == "PAT-1001"
    for r in rx_pat2:
        assert r["patient_id"] == "PAT-1002"

def test_patient_specific_lab_reports():
    """Verify lab reports belong strictly to matching patient."""
    lab_pat1 = mock_db.find_many("lab_reports", "patient_id", "PAT-1001")
    lab_pat2 = mock_db.find_many("lab_reports", "patient_id", "PAT-1002")
    
    for l in lab_pat1:
        assert l["patient_id"] == "PAT-1001"
    for l in lab_pat2:
        assert l["patient_id"] == "PAT-1002"

def test_doctor_appointment_filtering():
    """Verify Doctor Portal queries appointments by doctor_id and resolves human IDs."""
    doc_apts = mock_db.find_many("appointments", "doctor_id", "DOC-101")
    for apt in doc_apts:
        assert apt.get("doctor_id") == "DOC-101"
        assert not str(apt.get("patient_id", "")).startswith("19b"), "Raw UUID must not leak in patient_id"
        assert apt.get("patient_id", "").startswith("PAT-"), "patient_id must be human PAT-XXXX ID"

def test_patient_appointment_filtering():
    """Verify Patient Portal queries appointments strictly by patient_id."""
    pat1_apts = mock_db.find_many("appointments", "patient_id", "PAT-1001")
    for apt in pat1_apts:
        assert apt.get("patient_id") == "PAT-1001"

