from fastapi.testclient import TestClient
import pytest
import sys
from pathlib import Path

backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.main import app
from app.agents.appointment import AppointmentAgent
from app.services.mock_db import mock_db

client = TestClient(app)

@pytest.fixture(autouse=True)
def reset_mock_db():
    mock_db.reload_data()

def test_get_available_slots():
    agent = AppointmentAgent()
    payload = {
        "doctor_id": "DOC-101",
        "date": "2024-09-10"
    }
    result = agent.execute("get_available_slots", payload)
    assert result["success"] is True
    assert result["count"] >= 1
    # 10:00-10:30 is already booked in APT-1001 for 2024-09-10, so it should not be in available_slots
    slots = [s["time_slot"] for s in result["available_slots"]]
    assert "10:00-10:30" not in slots
    assert "11:00-11:30" in slots

def test_book_appointment_success():
    agent = AppointmentAgent()
    payload = {
        "patient_id": "PAT-1002",
        "doctor_id": "DOC-101",
        "hospital_id": "HOSP-001",
        "date": "2024-09-10",
        "time_slot": "11:00-11:30",
        "reason": "Cardiology Consultation"
    }
    result = agent.execute("book_appointment", payload)
    assert result["success"] is True
    assert result["appointment_id"].startswith("APT-")
    assert result["status"] == "CONFIRMED"

def test_book_appointment_slot_conflict():
    agent = AppointmentAgent()
    # Try to book 10:00-10:30 on 2024-09-10 which is already occupied by APT-1001
    payload = {
        "patient_id": "PAT-1002",
        "doctor_id": "DOC-101",
        "hospital_id": "HOSP-001",
        "date": "2024-09-10",
        "time_slot": "10:00-10:30"
    }
    with pytest.raises(ValueError, match="already booked"):
        agent.execute("book_appointment", payload)

def test_get_appointment():
    agent = AppointmentAgent()
    result = agent.execute("get_appointment", {"appointment_id": "APT-1001"})
    assert result["success"] is True
    assert result["appointment"]["patient_id"] == "PAT-1001"
    assert result["appointment"]["doctor_id"] == "DOC-101"

def test_cancel_appointment():
    agent = AppointmentAgent()
    result = agent.execute("cancel_appointment", {"appointment_id": "APT-1001"})
    assert result["success"] is True
    assert result["status"] == "CANCELLED"
    assert result["appointment"]["status"] == "CANCELLED"

    # Verify record is preserved in mock_db and not deleted
    apt = mock_db.find_one("appointments", "appointment_id", "APT-1001")
    assert apt is not None
    assert apt["status"] == "CANCELLED"

def test_reschedule_appointment():
    agent = AppointmentAgent()
    payload = {
        "appointment_id": "APT-1001",
        "new_date": "2024-09-15",
        "new_time_slot": "11:00-11:30"
    }
    result = agent.execute("reschedule_appointment", payload)
    assert result["success"] is True
    assert result["status"] == "RESCHEDULED"
    assert result["appointment"]["appointment_date"] == "2024-09-15"
    assert result["appointment"]["time_slot"] == "11:00-11:30"

def test_appointment_agent_cross_domain_isolation():
    """
    Explicit safety test: Appointment Agent does not mutate non-appointment collections.
    """
    initial_patients = len(mock_db.get_collection("patients"))
    initial_medical = len(mock_db.get_collection("medical_records"))
    initial_claims = len(mock_db.get_collection("insurance_claims"))

    agent = AppointmentAgent()
    agent.execute("book_appointment", {
        "patient_id": "PAT-1001",
        "doctor_id": "DOC-101",
        "hospital_id": "HOSP-001",
        "date": "2024-09-20",
        "time_slot": "14:00-14:30"
    })

    assert len(mock_db.get_collection("patients")) == initial_patients
    assert len(mock_db.get_collection("medical_records")) == initial_medical
    assert len(mock_db.get_collection("insurance_claims")) == initial_claims

def test_workbench_dispatch_appointment_agent():
    dispatch_payload = {
        "workflow_id": "WF-APT-TEST-001",
        "agent_target": "appointment",
        "action": "get_available_slots",
        "portal_source": "patient",
        "payload": {
            "doctor_id": "DOC-101",
            "date": "2024-09-10"
        }
    }
    response = client.post("/api/v1/workbench/dispatch", json=dispatch_payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["target_agent"] == "Appointment Agent"
    assert data["action_performed"] == "get_available_slots"
    assert data["output"]["agent_id"] == "AGENT-APPOINTMENT-03"
