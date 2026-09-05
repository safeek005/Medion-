from fastapi.testclient import TestClient
import pytest
import sys
from pathlib import Path

backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.main import app
from app.agents.medical import MedicalAgent
from app.agents.medical.utils import parse_reference_range, classify_result, calculate_trend
from app.services.mock_db import mock_db

client = TestClient(app)

@pytest.fixture(autouse=True)
def reset_mock_db():
    mock_db.reload_data()

def test_reference_range_parser():
    low, high = parse_reference_range("13.5 - 17.5")
    assert low == 13.5
    assert high == 17.5

    low, high = parse_reference_range("13 to 17")
    assert low == 13.0
    assert high == 17.0

    low, high = parse_reference_range("< 200")
    assert low is None
    assert high == 200.0

    low, high = parse_reference_range(">= 50")
    assert low == 50.0
    assert high is None

    low, high = parse_reference_range("invalid_range")
    assert low is None
    assert high is None

def test_classify_result():
    assert classify_result(10.4, 13.5, 17.5) == "LOW"
    assert classify_result(215.0, 70.0, 200.0) == "HIGH"
    assert classify_result(92.0, 70.0, 99.0) == "NORMAL"
    assert classify_result(100.0, None, None) == "UNKNOWN"

def test_calculate_trend_zero_division_safety():
    res = calculate_trend(0.0, 10.0)
    assert res["change"] == 10.0
    assert res["percentage_change"] is None  # Handled zero division safely
    assert res["trend"] == "INCREASING"

def test_extract_lab_report():
    agent = MedicalAgent()
    payload = {
        "patient_id": "PAT-1001",
        "report_id": "LABR-1001"
    }
    result = agent.execute("extract_lab_report", payload)
    assert result["success"] is True
    assert result["count"] >= 3
    assert result["tests"][0]["test_name"] == "Hemoglobin"
    assert result["tests"][0]["reference_low"] == 13.5
    assert result["tests"][0]["reference_high"] == 17.5

def test_analyze_lab_report():
    agent = MedicalAgent()
    payload = {
        "patient_id": "PAT-1001",
        "report_id": "LABR-1001"
    }
    result = agent.execute("analyze_lab_report", payload)
    assert result["success"] is True
    assert result["abnormal_count"] == 2  # Hemoglobin LOW, Total Cholesterol HIGH
    assert result["priority"] == "HIGH"
    assert result["doctor_review_recommended"] is True

def test_compare_lab_reports():
    agent = MedicalAgent()
    # Add a temporary second lab report to mock_db for PAT-1001
    mock_db._cache["lab_reports"].append({
        "report_id": "LABR-1001-B",
        "patient_id": "PAT-1001",
        "doctor_id": "DOC-101",
        "lab_id": "LAB-001",
        "test_name": "Follow-up Blood Panel",
        "collection_date": "2024-08-01T08:00:00Z",
        "result_date": "2024-08-01T16:00:00Z",
        "status": "COMPLETED",
        "test_results": [
            {
                "test_parameter": "Hemoglobin",
                "value": 11.2,
                "unit": "g/dL",
                "reference_range": "13.5 - 17.5",
                "status": "LOW",
                "flagged": True
            },
            {
                "test_parameter": "Total Cholesterol",
                "value": 195.0,
                "unit": "mg/dL",
                "reference_range": "< 200",
                "status": "NORMAL",
                "flagged": False
            }
        ],
        "lab_technician_notes": "Sample re-run.",
        "summary": "Hemoglobin improved slightly to 11.2."
    })

    payload = {
        "patient_id": "PAT-1001",
        "previous_report_id": "LABR-1001",
        "current_report_id": "LABR-1001-B"
    }
    result = agent.execute("compare_lab_reports", payload)
    assert result["success"] is True
    assert result["count"] >= 2
    hb_comp = next(item for item in result["comparisons"] if item["test_name"] == "Hemoglobin")
    assert hb_comp["previous_value"] == 10.4
    assert hb_comp["current_value"] == 11.2
    assert hb_comp["change"] == 0.8
    assert hb_comp["trend"] == "INCREASING"

def test_get_medical_summary():
    agent = MedicalAgent()
    result = agent.execute("get_medical_summary", {"patient_id": "PAT-1001"})
    assert result["success"] is True
    assert result["patient_name"] == "Arun Kumar"
    assert result["records_count"] >= 1
    assert result["lab_reports_count"] >= 1
    assert len(result["flagged_abnormalities"]) >= 2

def test_explain_lab_report_doctor_audience():
    agent = MedicalAgent()
    result = agent.execute("explain_lab_report", {
        "patient_id": "PAT-1001",
        "report_id": "LABR-1001",
        "audience": "doctor"
    })
    assert result["success"] is True
    assert result["audience"] == "doctor"
    assert "CLINICAL SUMMARY" in result["explanation"]
    assert "RECOMMENDED ACTION" in result["explanation"]

def test_explain_lab_report_patient_audience():
    agent = MedicalAgent()
    result = agent.execute("explain_lab_report", {
        "patient_id": "PAT-1001",
        "report_id": "LABR-1001",
        "audience": "patient"
    })
    assert result["success"] is True
    assert result["audience"] == "patient"
    assert "reference range" in result["explanation"]
    assert "discussing these results with your doctor" in result["explanation"]

def test_safety_boundary_no_autonomous_diagnosis():
    """
    Explicit safety test: Verify that Medical Agent output does not state definitive diagnoses.
    """
    agent = MedicalAgent()
    result = agent.execute("explain_lab_report", {
        "patient_id": "PAT-1001",
        "report_id": "LABR-1001",
        "audience": "patient"
    })
    explanation_lower = result["explanation"].lower()
    # Should contain disclaimer explicitly stating results do not establish diagnosis
    assert "alone do not establish a medical diagnosis" in explanation_lower

def test_workbench_dispatch_medical_agent():
    dispatch_payload = {
        "workflow_id": "WF-MED-TEST-001",
        "agent_target": "medical",
        "action": "analyze_lab_report",
        "portal_source": "doctor",
        "payload": {
            "patient_id": "PAT-1001",
            "report_id": "LABR-1001"
        }
    }
    response = client.post("/api/v1/workbench/dispatch", json=dispatch_payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["target_agent"] == "Medical Agent"
    assert data["action_performed"] == "analyze_lab_report"
    assert data["output"]["agent_id"] == "AGENT-MEDICAL-02"
    assert data["output"]["result_data"]["priority"] == "HIGH"
