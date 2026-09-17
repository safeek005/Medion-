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
def reset_mock_db():
    mock_db.reload_data()

def test_01_upload_synthetic_document_ocr_extraction():
    # 1. Upload valid synthetic identity document & OCR extract
    doc_text = "Name: Divya Ramesh\nDOB: 1993-07-19\nGender: Female\nPhone: +91 97654 32109\nEmail: divya.ramesh@example.com"
    resp = client.post("/api/v1/patients/ocr-extract", data={"raw_text": doc_text, "file_name": "divya_synthetic_id.png"})
    assert resp.status_code == 200
    data = resp.json()
    assert data["success"] is True
    assert data["extracted_data"]["first_name"] == "Divya"
    assert data["extracted_data"]["last_name"] == "Ramesh"
    assert data["extracted_data"]["dob"] == "1993-07-19"
    assert data["extracted_data"]["phone"] == "+91 97654 32109"

def test_02_duplicate_detection_against_supabase():
    # 2. Duplicate detection for existing patient (Sneha Sharma)
    resp = client.post("/api/v1/patients/check-duplicate", json={
        "first_name": "Sneha",
        "last_name": "Sharma",
        "phone": "+91 98123 45678",
        "email": "sneha.sharma@example.com"
    })
    assert resp.status_code == 200
    data = resp.json()
    assert data["has_duplicate"] is True
    assert data["existing_patient"]["patient_id"] == "PAT-1002"

def test_03_receptionist_confirmation_and_patient_registration():
    # 3. Receptionist confirmation & registration persistence
    payload = {
        "first_name": "Divya",
        "last_name": "Ramesh",
        "dob": "1993-07-19",
        "gender": "Female",
        "phone": "+91 97000 11111",
        "email": "divya.ramesh@example.com",
        "primary_doctor_id": "DOC-101",
        "insurance_policy_id": "POL-704"
    }
    resp = client.post("/api/v1/patients/register", headers={"X-User-Role": "receptionist"}, json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert data["success"] is True
    patient_id = data["patient_id"]
    assert patient_id.startswith("PAT-")

    # Verify retrieval from database
    fetched = mock_db.find_one("patients", "patient_id", patient_id)
    assert fetched is not None
    assert fetched["first_name"] == "Divya"

def test_04_manual_patient_registration():
    # 4. Manual patient registration entry
    payload = {
        "first_name": "Karan",
        "last_name": "Mehra",
        "dob": "1986-12-05",
        "gender": "Male",
        "phone": "+91 96000 22222",
        "email": "karan.mehra@example.com",
        "primary_doctor_id": "DOC-102"
    }
    resp = client.post("/api/v1/patients/register", headers={"X-User-Role": "receptionist"}, json=payload)
    assert resp.status_code == 200
    assert resp.json()["success"] is True

def test_05_appointment_booking_and_confirmation():
    # 5. Appointment availability & booking flow
    avail_resp = client.get("/api/v1/appointments/availability?doctor_id=DOC-101&date=Tomorrow")
    assert avail_resp.status_code == 200

    book_resp = client.post("/api/v1/appointments/book", headers={"X-User-Role": "receptionist"}, json={
        "patient_id": "PAT-1025",
        "doctor_id": "DOC-101",
        "appointment_date": "2026-09-18",
        "time_slot": "10:00 AM - 10:30 AM",
        "reason_for_visit": "Cardiology Titration Consultation"
    })
    assert book_resp.status_code == 200
    assert book_resp.json()["success"] is True

def test_06_medical_history_and_lab_report_analysis():
    # 6. Medical history & lab report analysis
    hist_resp = client.get("/api/v1/medical/history/PAT-1025", headers={"X-User-Role": "doctor"})
    assert hist_resp.status_code == 200
    assert "summary" in hist_resp.json()

    analyze_resp = client.post("/api/v1/medical/lab-reports/analyze", headers={"X-User-Role": "doctor"}, json={
        "report_id": "LABR-1025",
        "patient_id": "PAT-1025"
    })
    assert analyze_resp.status_code == 200
    assert analyze_resp.json()["success"] is True

def test_07_insurance_claims_and_settlement():
    # 7. Insurance policy verification & claims settlement
    policy_resp = client.get("/api/v1/insurance/policies/POL-725?patient_id=PAT-1025", headers={"X-User-Role": "insurance"})
    assert policy_resp.status_code == 200

    settle_resp = client.post("/api/v1/insurance/claims/CLM-1001/settle", headers={"X-User-Role": "insurance"}, json={
        "amount": 10800.0,
        "settled_by": "FIN-OFFICER-01"
    })
    assert settle_resp.status_code == 200
    assert settle_resp.json()["success"] is True

def test_08_nurse_vitals_recording_and_medication():
    # 8. Nurse vitals recording
    vitals_resp = client.post("/api/v1/nurse/vitals", headers={"X-User-Role": "nurse"}, json={
        "patient_id": "PAT-1025",
        "nurse_id": "NURSE-01",
        "vitals": {
            "blood_pressure": "120/80 mmHg",
            "heart_rate": 72,
            "spo2": "98%",
            "temperature": "98.6 F"
        }
    })
    assert vitals_resp.status_code == 200
    assert vitals_resp.json()["success"] is True

def test_09_laboratory_report_authorization_safety_gate():
    # 9. Pathologist authorization gate
    auth_resp = client.post("/api/v1/lab/reports/LABR-1001/authorize", headers={"X-User-Role": "lab"}, json={
        "approver_id": "LAB-DIR-01"
    })
    assert auth_resp.status_code == 200
    assert auth_resp.json()["success"] is True

def test_10_admin_operations_census_metrics():
    # 10. Admin operations metrics
    ops_resp = client.get("/api/v1/admin/operations?hospital_id=HOSP-001", headers={"X-User-Role": "admin"})
    assert ops_resp.status_code == 200
    assert "total_patients" in ops_resp.json() or "summary" in ops_resp.json()

def test_11_patient_data_isolation_security():
    # 11. Patient isolation RBAC protection
    iso_resp = client.get(
        "/api/v1/patients/PAT-1001",
        headers={"X-User-Role": "patient", "X-Patient-ID": "PAT-1025"}
    )
    assert iso_resp.status_code == 403
    assert "Access Denied" in iso_resp.json()["detail"]
