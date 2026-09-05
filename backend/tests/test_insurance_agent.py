from fastapi.testclient import TestClient
import pytest
import sys
from pathlib import Path

backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.main import app
from app.agents.insurance import InsuranceAgent
from app.services.mock_db import mock_db

client = TestClient(app)

@pytest.fixture(autouse=True)
def reset_mock_db():
    mock_db.reload_data()

def test_verify_insurance_active():
    agent = InsuranceAgent()
    result = agent.execute("verify_insurance", {"patient_id": "PAT-1001"})
    assert result["success"] is True
    assert result["policy_id"] == "POL-701"
    assert result["eligible"] is True
    assert result["status"] == "ACTIVE"

def test_get_coverage():
    agent = InsuranceAgent()
    result = agent.execute("get_coverage", {
        "patient_id": "PAT-1001",
        "service_type": "CONSULTATION"
    })
    assert result["success"] is True
    assert result["covered"] is True
    assert result["copay_percentage"] == 10.0
    assert result["coverage_percentage"] == 90.0

def test_prepare_claim():
    agent = InsuranceAgent()
    payload = {
        "patient_id": "PAT-1001",
        "bill_id": "BILL-1001",
        "service_type": "CONSULTATION"
    }
    result = agent.execute("prepare_claim", payload)
    assert result["success"] is True
    assert result["claim_id"].startswith("CLM-")
    assert result["status"] == "DRAFT"
    assert result["claim"]["claim_amount"] == 5775.0

def test_submit_claim():
    agent = InsuranceAgent()
    result = agent.execute("submit_claim", {"claim_id": "CLM-1001"})
    assert result["success"] is True
    assert result["status"] == "APPROVED"
    assert result["approved_amount"] > 0.0
    assert "adjudication_notes" in result["mock_provider_response"]

def test_get_claim_status():
    agent = InsuranceAgent()
    result = agent.execute("get_claim_status", {"claim_id": "CLM-1001"})
    assert result["success"] is True
    assert result["claim_id"] == "CLM-1001"
    assert result["status"] == "APPROVED"

def test_insurance_agent_cross_domain_isolation():
    """
    Explicit safety test: Insurance Agent does not mutate non-insurance collections.
    """
    initial_patients = len(mock_db.get_collection("patients"))
    initial_medical = len(mock_db.get_collection("medical_records"))
    initial_apts = len(mock_db.get_collection("appointments"))

    agent = InsuranceAgent()
    agent.execute("submit_claim", {"claim_id": "CLM-1001"})

    assert len(mock_db.get_collection("patients")) == initial_patients
    assert len(mock_db.get_collection("medical_records")) == initial_medical
    assert len(mock_db.get_collection("appointments")) == initial_apts

def test_workbench_dispatch_insurance_agent():
    dispatch_payload = {
        "workflow_id": "WF-INS-TEST-001",
        "agent_target": "insurance",
        "action": "verify_insurance",
        "portal_source": "nurse",
        "payload": {
            "patient_id": "PAT-1001"
        }
    }
    response = client.post("/api/v1/workbench/dispatch", json=dispatch_payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["target_agent"] == "Insurance Agent"
    assert data["action_performed"] == "verify_insurance"
    assert data["output"]["agent_id"] == "AGENT-INSURANCE-04"
