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

# =========================================================================
# COMPREHENSIVE NATURAL LANGUAGE INTENT & ACTION TEST GROUPS
# =========================================================================

def test_natural_language_group_1_appointments():
    agent = AssistantAgent()

    # 1. "When is Dr Rajesh available?"
    r1 = agent.execute("interpret_request", {"message": "When is Dr Rajesh available?", "user_role": "patient"})
    assert r1["success"] is True
    assert r1["target_agent"] == "appointment"
    assert r1["target_action"] == "get_available_slots"
    assert r1["required_parameters"]["doctor_id"] == "DOC-101"

    # 2. "Show Dr Rajesh's available slots"
    r2 = agent.execute("interpret_request", {"message": "Show Dr Rajesh's available slots", "user_role": "patient"})
    assert r2["target_action"] == "get_available_slots"

    # 3. "Book me with Dr Rajesh tomorrow at 10 AM"
    r3 = agent.execute("interpret_request", {"message": "Book me with Dr Rajesh tomorrow at 10 AM", "user_role": "patient"})
    assert r3["target_action"] == "book_appointment"
    assert r3["required_parameters"]["doctor_id"] == "DOC-101"
    assert "10:00" in r3["required_parameters"]["time_slot"]

    # 4. "Cancel appointment APT-1001"
    r4 = agent.execute("interpret_request", {"message": "Cancel appointment APT-1001", "user_role": "patient"})
    assert r4["target_action"] == "cancel_appointment"
    assert r4["required_parameters"]["appointment_id"] == "APT-1001"

    # 5. "Move my appointment to Friday"
    r5 = agent.execute("interpret_request", {"message": "Move my appointment to Friday", "user_role": "patient"})
    assert r5["target_action"] == "reschedule_appointment"
    assert "date" in r5["required_parameters"] or "new_date" in r5["required_parameters"]


def test_natural_language_group_2_lab_reports():
    agent = AssistantAgent()

    # 1. "Analyze my latest lab report"
    r1 = agent.execute("interpret_request", {"message": "Analyze my latest lab report", "user_role": "patient"})
    assert r1["target_agent"] == "medical"
    assert r1["target_action"] == "analyze_lab_report"

    # 2. "Explain LABR-1001 simply"
    r2 = agent.execute("interpret_request", {"message": "Explain LABR-1001 simply", "user_role": "patient"})
    assert r2["target_action"] == "explain_lab_report"
    assert r2["required_parameters"]["report_id"] == "LABR-1001"

    # 3. "Compare LABR-1001 and LABR-1002"
    r3 = agent.execute("interpret_request", {"message": "Compare LABR-1001 and LABR-1002", "user_role": "doctor"})
    assert r3["target_action"] == "compare_lab_reports"
    assert r3["required_parameters"]["current_report_id"] == "LABR-1001"
    assert r3["required_parameters"]["previous_report_id"] == "LABR-1002"

    # 4. "What is abnormal in my blood report?"
    r4 = agent.execute("interpret_request", {"message": "What is abnormal in my blood report?", "user_role": "patient"})
    assert r4["target_action"] == "analyze_lab_report"


def test_natural_language_group_3_insurance():
    agent = AssistantAgent()

    # 1. "Is my insurance active?"
    r1 = agent.execute("interpret_request", {"message": "Is my insurance active?", "user_role": "patient"})
    assert r1["target_agent"] == "insurance"
    assert r1["target_action"] == "verify_insurance"

    # 2. "How much coverage do I have?"
    r2 = agent.execute("interpret_request", {"message": "How much coverage do I have?", "user_role": "patient"})
    assert r2["target_action"] == "get_coverage"

    # 3. "Prepare a claim"
    r3 = agent.execute("interpret_request", {"message": "Prepare a claim", "user_role": "nurse"})
    assert r3["target_action"] == "prepare_claim"

    # 4. "Submit claim CLM-1001"
    r4 = agent.execute("interpret_request", {"message": "Submit claim CLM-1001", "user_role": "nurse"})
    assert r4["target_action"] == "submit_claim"
    assert r4["required_parameters"]["claim_id"] == "CLM-1001"

    # 5. "What is my claim status?"
    r5 = agent.execute("interpret_request", {"message": "What is my claim status?", "user_role": "patient"})
    assert r5["target_action"] == "get_claim_status"


def test_natural_language_group_4_patients():
    agent = AssistantAgent()

    # 1. "Find Arun Kumar"
    r1 = agent.execute("interpret_request", {"message": "Find Arun Kumar", "user_role": "doctor"})
    assert r1["target_agent"] == "patient"
    assert r1["target_action"] in ["search_patient", "get_patient"]
    assert r1["required_parameters"]["patient_id"] == "PAT-1001"

    # 2. "Show patient PAT-1001"
    r2 = agent.execute("interpret_request", {"message": "Show patient PAT-1001", "user_role": "doctor"})
    assert r2["target_action"] == "get_patient"
    assert r2["required_parameters"]["patient_id"] == "PAT-1001"

    # 3. "Show Arun Kumar's medical history"
    r3 = agent.execute("interpret_request", {"message": "Show Arun Kumar's medical history", "user_role": "doctor"})
    assert r3["target_action"] == "get_patient_history"
    assert r3["required_parameters"]["patient_id"] == "PAT-1001"


def test_natural_language_group_5_ambiguous():
    agent = AssistantAgent()

    # 1. "Apply insurance for Sneha Sharma"
    r1 = agent.execute("interpret_request", {"message": "Apply insurance for Sneha Sharma", "user_role": "patient"})
    assert r1["is_ambiguous"] is True
    assert len(r1["ambiguous_options"]) > 1

    # Clarification generation for ambiguous insurance request
    clarification = agent.execute("handle_clarification", {
        "ambiguous_options": r1["ambiguous_options"],
        "target_action": "insurance_actions"
    })
    assert clarification["needs_clarification"] is True
    assert "verify" in clarification["clarification_question"].lower() or "claim" in clarification["clarification_question"].lower()

