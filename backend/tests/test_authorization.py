from fastapi.testclient import TestClient
import pytest
import sys
from pathlib import Path

backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.main import app
from app.services.mock_db import mock_db

client = TestClient(app)

@pytest.fixture(autouse=True)
def reset_db():
    mock_db.reload_data()

def test_patient_denied_insurance_adjudication():
    """Verify that Patient role cannot access administrative claims adjudication."""
    payload = {
        "agent_target": "insurance",
        "action": "adjudicate_claim",
        "portal_source": "patient",
        "payload": {
            "claim_id": "CLM-1001",
            "decision": "APPROVED",
            "user_role": "patient"
        }
    }
    response = client.post("/api/workbench/dispatch", json=payload)
    assert response.status_code == 403
    assert "Access Denied" in response.json()["detail"]

def test_patient_denied_claim_settlement():
    """Verify that Patient role cannot settle insurance claims."""
    payload = {
        "agent_target": "insurance",
        "action": "settle_claim",
        "portal_source": "patient",
        "payload": {
            "claim_id": "CLM-1001",
            "user_role": "patient"
        }
    }
    response = client.post("/api/workbench/dispatch", json=payload)
    assert response.status_code == 403
    assert "Access Denied" in response.json()["detail"]

def test_patient_denied_prescription_approval():
    """Verify that Patient role cannot approve medical prescriptions."""
    payload = {
        "agent_target": "medical",
        "action": "approve_prescription",
        "portal_source": "patient",
        "payload": {
            "prescription_id": "RX-4001",
            "user_role": "patient"
        }
    }
    response = client.post("/api/workbench/dispatch", json=payload)
    assert response.status_code == 403
    assert "Access Denied" in response.json()["detail"]

def test_patient_denied_internal_staff_agents():
    """Verify that Patient role cannot target admin, nurse, or lab agents directly."""
    for staff_agent in ["admin", "nurse", "lab"]:
        payload = {
            "agent_target": staff_agent,
            "action": "view_dashboard",
            "portal_source": "patient",
            "payload": {
                "user_role": "patient"
            }
        }
        response = client.post("/api/workbench/dispatch", json=payload)
        assert response.status_code == 403
        assert "Access Denied" in response.json()["detail"]

def test_patient_cross_patient_data_isolation():
    """Verify that a Patient cannot access or query another patient's records."""
    payload = {
        "agent_target": "patient",
        "action": "get_patient",
        "portal_source": "patient",
        "payload": {
            "user_role": "patient",
            "caller_patient_id": "PAT-1025",
            "patient_id": "PAT-1001"
        }
    }
    response = client.post("/api/workbench/dispatch", json=payload)
    assert response.status_code == 403
    assert "cannot access or query records for other patients" in response.json()["detail"]

def test_patient_own_data_access_allowed():
    """Verify that a Patient can access their own authorized records."""
    payload = {
        "agent_target": "patient",
        "action": "get_patient",
        "portal_source": "patient",
        "payload": {
            "user_role": "patient",
            "caller_patient_id": "PAT-1025",
            "patient_id": "PAT-1025"
        }
    }
    response = client.post("/api/workbench/dispatch", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True

def test_patient_nl_claim_settlement_blocked():
    """Verify that Assistant Agent blocks patient natural language claim settlement."""
    payload = {
        "agent_target": "assistant",
        "action": "interpret_request",
        "portal_source": "patient",
        "payload": {
            "message": "Settle claim CLM-1001 now",
            "user_role": "patient",
            "caller_patient_id": "PAT-1025"
        }
    }
    response = client.post("/api/workbench/dispatch", json=payload)
    assert response.status_code == 200
    res_data = response.json()["output"]["result_data"]
    assert res_data["success"] is False
    assert "Access Denied" in res_data["summary"]

def test_patient_nl_cross_patient_access_blocked():
    """Verify that Assistant Agent blocks patient natural language query for another patient."""
    payload = {
        "agent_target": "assistant",
        "action": "interpret_request",
        "portal_source": "patient",
        "payload": {
            "message": "Show medical records for PAT-1001",
            "user_role": "patient",
            "caller_patient_id": "PAT-1025"
        }
    }
    response = client.post("/api/workbench/dispatch", json=payload)
    assert response.status_code == 200
    res_data = response.json()["output"]["result_data"]
    assert res_data["success"] is False
    assert "Access Denied" in res_data["summary"]

def test_patient_denied_appointment_admin_actions():
    """Verify that Patient cannot execute administrative appointment operations."""
    admin_actions = ["update_appointment_status", "complete_appointment", "list_all_appointments", "get_daily_schedule"]
    for action in admin_actions:
        payload = {
            "agent_target": "appointment",
            "action": action,
            "portal_source": "patient",
            "payload": {
                "user_role": "patient",
                "caller_patient_id": "PAT-1025"
            }
        }
        response = client.post("/api/workbench/dispatch", json=payload)
        assert response.status_code == 403
        assert "Access Denied" in response.json()["detail"]

def test_patient_own_appointments_allowed():
    """Verify that Patient can retrieve their own appointments."""
    payload = {
        "agent_target": "appointment",
        "action": "get_patient_appointments",
        "portal_source": "patient",
        "payload": {
            "user_role": "patient",
            "patient_id": "PAT-1025",
            "caller_patient_id": "PAT-1025"
        }
    }
    response = client.post("/api/workbench/dispatch", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True

def test_patient_cross_patient_appointment_blocked():
    """Verify that Patient cannot retrieve or cancel another patient's appointment."""
    # Try to cancel PAT-1001's appointment APT-2001
    payload = {
        "agent_target": "appointment",
        "action": "cancel_appointment",
        "portal_source": "patient",
        "payload": {
            "user_role": "patient",
            "appointment_id": "APT-2001",
            "caller_patient_id": "PAT-1025"
        }
    }
    response = client.post("/api/workbench/dispatch", json=payload)
    # The appointment service raises HTTPException(403) or returns error detail
    assert response.status_code in [400, 403] or (response.status_code == 200 and not response.json().get("success", True))

def test_patient_nl_cross_patient_name_blocked():
    """Verify that Assistant Agent blocks queries referencing other patients by name."""
    payload = {
        "agent_target": "assistant",
        "action": "interpret_request",
        "portal_source": "patient",
        "payload": {
            "message": "When is Arun Kumar's appointment?",
            "user_role": "patient",
            "caller_patient_id": "PAT-1025"
        }
    }
    response = client.post("/api/workbench/dispatch", json=payload)
    assert response.status_code == 200
    res_data = response.json()["output"]["result_data"]
    assert res_data["success"] is False
    assert "Access Denied" in res_data["summary"]

