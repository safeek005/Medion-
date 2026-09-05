from fastapi.testclient import TestClient
import sys
from pathlib import Path

backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.main import app
from app.agents.patient import PatientAgent

client = TestClient(app)

def test_base_agent_process_contract():
    agent = PatientAgent()
    assert agent.agent_id == "AGENT-PATIENT-01"
    assert agent.agent_name == "Patient Agent"
    assert agent.agent_type.value == "DATA"

def test_workbench_dispatch_endpoint():
    payload = {
        "workflow_id": "WF-TEST-001",
        "agent_target": "patient",
        "action": "search_patient",
        "portal_source": "doctor",
        "payload": {"query": "Arun"}
    }
    response = client.post("/api/v1/workbench/dispatch", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["target_agent"] == "Patient Agent"
    assert data["output"]["agent_id"] == "AGENT-PATIENT-01"
    assert data["output"]["result_data"]["count"] >= 1
    assert len(data["output"]["result_data"]["results"]) >= 1
