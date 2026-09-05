from fastapi.testclient import TestClient
import pytest
import sys
from pathlib import Path

backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.main import app
from app.agents.patient import PatientAgent
from app.services.mock_db import mock_db

client = TestClient(app)

@pytest.fixture(autouse=True)
def reset_mock_db():
    """Reloads clean mock datasets before each test run."""
    mock_db.reload_data()

def test_register_patient_success():
    agent = PatientAgent()
    payload = {
        "full_name": "Rohan Verma",
        "date_of_birth": "1995-04-12",
        "gender": "Male",
        "phone": "+91 9111222333",
        "email": "rohan.verma@example.com",
        "address": "12 Residency Road, Bengaluru",
        "blood_group": "AB+"
    }
    result = agent.execute("register_patient", payload)
    assert result["success"] is True
    assert result["patient_id"].startswith("PAT-")
    assert result["patient"]["first_name"] == "Rohan"
    assert result["patient"]["last_name"] == "Verma"

    # Verify patient is retrievable from mock_db
    fetched = mock_db.find_one("patients", "patient_id", result["patient_id"])
    assert fetched is not None
    assert fetched["email"] == "rohan.verma@example.com"

def test_register_patient_validation_failure():
    agent = PatientAgent()
    # Missing required phone
    payload = {
        "full_name": "Invalid User",
        "email": "invalid@example.com",
        "gender": "Female"
    }
    with pytest.raises(ValueError, match="phone"):
        agent.execute("register_patient", payload)

def test_register_patient_duplicate_email():
    agent = PatientAgent()
    payload = {
        "first_name": "Arun",
        "last_name": "Kumar",
        "gender": "Male",
        "phone": "+91 9000000000",
        "email": "arun.kumar@example.com"  # Existing email from patients.json
    }
    with pytest.raises(ValueError, match="already exists"):
        agent.execute("register_patient", payload)

def test_get_patient_success():
    agent = PatientAgent()
    result = agent.execute("get_patient", {"patient_id": "PAT-1001"})
    assert result["success"] is True
    assert result["patient"]["first_name"] == "Arun"
    assert result["patient"]["last_name"] == "Kumar"

def test_get_patient_not_found():
    agent = PatientAgent()
    with pytest.raises(ValueError, match="not found"):
        agent.execute("get_patient", {"patient_id": "PAT-9999"})

def test_search_patient():
    agent = PatientAgent()
    
    # Search by name
    res_name = agent.execute("search_patient", {"name": "Sneha"})
    assert res_name["count"] >= 1
    assert res_name["results"][0]["first_name"] == "Sneha"

    # Search by phone
    res_phone = agent.execute("search_patient", {"phone": "+91 9876543210"})
    assert res_phone["count"] >= 1
    assert res_phone["results"][0]["patient_id"] == "PAT-1001"

    # Search by email
    res_email = agent.execute("search_patient", {"email": "vikram.singh@example.com"})
    assert res_email["count"] >= 1
    assert res_email["results"][0]["patient_id"] == "PAT-1003"

    # No match
    res_empty = agent.execute("search_patient", {"name": "NonExistentName"})
    assert res_empty["count"] == 0
    assert len(res_empty["results"]) == 0

def test_update_patient_permitted_fields():
    agent = PatientAgent()
    update_payload = {
        "patient_id": "PAT-1001",
        "updates": {
            "phone": "+91 9999999999",
            "email": "arun.new@example.com",
            "address": "New Address, Bengaluru"
        }
    }
    result = agent.execute("update_patient", update_payload)
    assert result["success"] is True
    assert result["patient"]["phone"] == "+91 9999999999"
    assert result["patient"]["email"] == "arun.new@example.com"
    assert result["patient"]["patient_id"] == "PAT-1001"  # ID preserved

def test_update_patient_prohibited_fields_protection():
    agent = PatientAgent()
    update_payload = {
        "patient_id": "PAT-1001",
        "updates": {
            "patient_id": "PAT-HACKED",
            "medical_records": ["MR-HACKED"],
            "phone": "+91 9888888888"
        }
    }
    result = agent.execute("update_patient", update_payload)
    assert result["success"] is True
    assert result["patient"]["patient_id"] == "PAT-1001"  # ID unchanged
    assert result["patient"]["phone"] == "+91 9888888888"

def test_get_patient_history():
    agent = PatientAgent()
    result = agent.execute("get_patient_history", {"patient_id": "PAT-1001"})
    assert result["success"] is True
    history = result["history"]
    assert history["profile"]["patient_id"] == "PAT-1001"
    assert len(history["medical_records"]) >= 1
    assert len(history["lab_reports"]) >= 1
    assert len(history["appointments"]) >= 1
    assert len(history["prescriptions"]) >= 1
    assert len(history["insurance_policies"]) >= 1
    assert len(history["bills"]) >= 1
    assert len(history["insurance_claims"]) >= 1
    assert len(history["notifications"]) >= 1

def test_workbench_dispatch_patient_agent():
    dispatch_payload = {
        "workflow_id": "WF-PATIENT-TEST-001",
        "agent_target": "patient",
        "action": "get_patient_history",
        "portal_source": "doctor",
        "payload": {
            "patient_id": "PAT-1001"
        }
    }
    response = client.post("/api/v1/workbench/dispatch", json=dispatch_payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["target_agent"] == "Patient Agent"
    assert data["action_performed"] == "get_patient_history"
    assert data["output"]["agent_id"] == "AGENT-PATIENT-01"
    assert "history" in data["output"]["result_data"]
