from fastapi.testclient import TestClient
import pytest
import sys
from pathlib import Path

backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.main import app
from app.agents.assistant import AssistantAgent
from app.services.mock_db import mock_db

client = TestClient(app)

@pytest.fixture(autouse=True)
def reset_mock_db():
    mock_db.reload_data()

def test_interpret_request_patient_intent():
    agent = AssistantAgent()
    payload = {
        "message": "Find PAT-1001",
        "user_role": "doctor"
    }
    result = agent.execute("interpret_request", payload)
    assert result["success"] is True
    assert result["target_agent"] == "patient"
    assert result["target_action"] == "get_patient"
    assert result["required_parameters"]["patient_id"] == "PAT-1001"
    assert len(result["missing_parameters"]) == 0

def test_interpret_request_medical_intent():
    agent = AssistantAgent()
    payload = {
        "message": "Analyze LABR-1001 for PAT-1001",
        "user_role": "doctor"
    }
    result = agent.execute("interpret_request", payload)
    assert result["success"] is True
    assert result["target_agent"] == "medical"
    assert result["target_action"] == "analyze_lab_report"
    assert result["required_parameters"]["report_id"] == "LABR-1001"

def test_interpret_request_appointment_intent():
    agent = AssistantAgent()
    payload = {
        "message": "Available slots for DOC-101 on 2024-09-10",
        "user_role": "patient"
    }
    result = agent.execute("interpret_request", payload)
    assert result["success"] is True
    assert result["target_agent"] == "appointment"
    assert result["target_action"] == "get_available_slots"
    assert result["required_parameters"]["doctor_id"] == "DOC-101"
    assert result["required_parameters"]["date"] == "2024-09-10"

def test_interpret_request_insurance_intent():
    agent = AssistantAgent()
    payload = {
        "message": "Verify insurance for PAT-1001",
        "user_role": "nurse"
    }
    result = agent.execute("interpret_request", payload)
    assert result["success"] is True
    assert result["target_agent"] == "insurance"
    assert result["target_action"] == "verify_insurance"
    assert result["required_parameters"]["patient_id"] == "PAT-1001"

def test_extract_parameters():
    agent = AssistantAgent()
    payload = {
        "message": "Book appointment for PAT-1001 with DOC-101 at HOSP-001 on 2024-09-10 at 10:00"
    }
    result = agent.execute("extract_parameters", payload)
    assert result["success"] is True
    params = result["parameters"]
    assert params["patient_id"] == "PAT-1001"
    assert params["doctor_id"] == "DOC-101"
    assert params["hospital_id"] == "HOSP-001"
    assert params["date"] == "2024-09-10"
    assert params["time_slot"] == "10:00"

def test_missing_parameters_detection():
    agent = AssistantAgent()
    # Booking without doctor or time
    payload = {
        "message": "Book appointment for PAT-1001",
        "user_role": "patient"
    }
    result = agent.execute("interpret_request", payload)
    assert result["success"] is True
    assert result["target_action"] == "book_appointment"
    assert "doctor_id" in result["missing_parameters"]
    assert "date" in result["missing_parameters"]

def test_handle_clarification():
    agent = AssistantAgent()
    payload = {
        "target_action": "book_appointment",
        "missing_parameters": ["doctor_id", "date"]
    }
    result = agent.execute("handle_clarification", payload)
    assert result["success"] is True
    assert result["needs_clarification"] is True
    assert "doctor_id, date" in result["clarification_question"]

def test_create_workbench_request():
    agent = AssistantAgent()
    payload = {
        "intent": "verify_insurance",
        "parameters": {"patient_id": "PAT-1001"},
        "portal_source": "nurse"
    }
    result = agent.execute("create_workbench_request", payload)
    assert result["success"] is True
    assert result["workbench_request"]["agent_target"] == "insurance"
    assert result["workbench_request"]["action"] == "verify_insurance"
    assert result["workbench_request"]["payload"]["patient_id"] == "PAT-1001"

def test_format_response_roles():
    agent = AssistantAgent()
    mock_result = {
        "success": True,
        "patient_id": "PAT-1001",
        "summary": "Insurance policy POL-701 is ACTIVE.",
        "status": "ACTIVE",
        "approved_amount": 5197.5
    }

    # Doctor role
    res_doc = agent.execute("format_response", {"specialized_agent_result": mock_result, "user_role": "doctor"})
    assert "[CLINICAL BRIEF]" in res_doc["formatted_text"]

    # Nurse role
    res_nurse = agent.execute("format_response", {"specialized_agent_result": mock_result, "user_role": "nurse"})
    assert "[NURSE ACTION REPORT]" in res_nurse["formatted_text"]
    assert "5197.5" in res_nurse["formatted_text"]

    # Patient role
    res_pat = agent.execute("format_response", {"specialized_agent_result": mock_result, "user_role": "patient"})
    assert "Hello! Here is your update:" in res_pat["formatted_text"]

def test_assistant_safety_no_diagnosis():
    """
    Explicit safety test: Assistant response formatting does not invent autonomous diagnoses.
    """
    agent = AssistantAgent()
    failed_result = {
        "success": False,
        "error": "Lab report not found."
    }
    res = agent.execute("format_response", {"specialized_agent_result": failed_result, "user_role": "patient"})
    assert "could not be completed" in res["formatted_text"]
    assert "successfully" not in res["formatted_text"].lower()

def test_assistant_read_only_isolation():
    """
    Explicit safety test: Assistant Agent operations do not mutate any domain datasets.
    """
    initial_patients = len(mock_db.get_collection("patients"))
    initial_apts = len(mock_db.get_collection("appointments"))
    initial_claims = len(mock_db.get_collection("insurance_claims"))

    agent = AssistantAgent()
    agent.execute("interpret_request", {"message": "Book appointment for PAT-1001 with DOC-101 tomorrow"})
    agent.execute("extract_parameters", {"message": "Analyze LABR-1001 for PAT-1001"})

    assert len(mock_db.get_collection("patients")) == initial_patients
    assert len(mock_db.get_collection("appointments")) == initial_apts
    assert len(mock_db.get_collection("insurance_claims")) == initial_claims

def test_workbench_dispatch_assistant_agent():
    dispatch_payload = {
        "workflow_id": "WF-AST-TEST-001",
        "agent_target": "assistant",
        "action": "interpret_request",
        "portal_source": "doctor",
        "payload": {
            "message": "Analyze LABR-1001 for PAT-1001",
            "user_role": "doctor"
        }
    }
    response = client.post("/api/v1/workbench/dispatch", json=dispatch_payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["target_agent"] == "Assistant Agent"
    assert data["action_performed"] == "interpret_request"
    assert data["output"]["agent_id"] == "AGENT-ASSISTANT-05"
    assert data["output"]["result_data"]["target_agent"] == "medical"
    assert data["output"]["result_data"]["target_action"] == "analyze_lab_report"
