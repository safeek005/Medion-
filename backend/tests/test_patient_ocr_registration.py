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

def test_ocr_extract_synthetic_demo_id():
    # TEST 1: Synthetic demo ID (Priya Nair)
    response = client.post("/api/v1/patients/ocr-extract", json={"demo_specimen_id": "priya_nair"})
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "ocr_provider" in data
    assert data["extracted_data"]["first_name"] == "Priya"
    assert data["extracted_data"]["last_name"] == "Nair"
    assert data["extracted_data"]["phone"] == "+91 98765 43219"

def test_duplicate_check_existing_patient():
    # TEST 2: Existing patient (Sneha Sharma)
    ocr_resp = client.post("/api/v1/patients/ocr-extract", json={"demo_specimen_id": "sneha_sharma"})
    assert ocr_resp.status_code == 200
    extracted = ocr_resp.json()["extracted_data"]

    dup_resp = client.post("/api/v1/patients/check-duplicate", json={
        "first_name": extracted["first_name"],
        "last_name": extracted["last_name"],
        "phone": extracted["phone"],
        "email": extracted["email"]
    })
    assert dup_resp.status_code == 200
    dup_data = dup_resp.json()
    assert dup_data["has_duplicate"] is True
    assert dup_data["existing_patient"]["patient_id"] == "PAT-1002"

def test_ocr_extract_invalid_document():
    # TEST 3: Invalid/unreadable document
    response = client.post("/api/v1/patients/ocr-extract", json={"file_name": "invalid_corrupt_scan.png"})
    assert response.status_code == 422
    data = response.json()
    assert "OCR FAILED" in data["detail"]

def test_uploaded_synthetic_document_extraction():
    # TEST 4: Uploaded synthetic text file / image path
    raw_doc_text = "Name: Vikram Singh\nDOB: 1975-08-03\nGender: Male\nPhone: +91 9988776655\nEmail: vikram.singh@example.com"
    response = client.post("/api/v1/patients/ocr-extract", json={
        "file_name": "uploaded_synthetic_id.txt",
        "raw_text": raw_doc_text
    })
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["extracted_data"]["first_name"] == "Vikram"
    assert data["extracted_data"]["last_name"] == "Singh"

def test_registration_flow_and_persistence():
    # TEST 5: End-to-end registration persistence with non-duplicate patient
    # 1. OCR extract new patient text
    raw_text = "Name: Aarav Sen\nDOB: 1991-08-20\nGender: Male\nPhone: +91 99999 88888\nEmail: aarav.sen.test@example.com"
    ocr_resp = client.post("/api/v1/patients/ocr-extract", json={
        "file_name": "new_aarav_sen.txt",
        "raw_text": raw_text
    })
    extracted = ocr_resp.json()["extracted_data"]

    # 2. Check duplicate (should be False)
    dup_resp = client.post("/api/v1/patients/check-duplicate", json={
        "first_name": extracted["first_name"],
        "last_name": extracted["last_name"],
        "phone": extracted["phone"],
        "email": extracted["email"]
    })
    assert dup_resp.json()["has_duplicate"] is False

    # 3. Register patient via POST /api/v1/patients/register
    reg_resp = client.post("/api/v1/patients/register", headers={"X-User-Role": "receptionist"}, json={
        "first_name": extracted["first_name"],
        "last_name": extracted["last_name"],
        "dob": extracted["dob"],
        "gender": extracted["gender"],
        "phone": extracted["phone"],
        "email": extracted["email"],
        "primary_doctor_id": "DOC-101",
        "insurance_policy_id": "POL-704"
    })
    assert reg_resp.status_code == 200
    reg_data = reg_resp.json()
    assert reg_data["success"] is True
    new_pid = reg_data["patient_id"]
    assert new_pid.startswith("PAT-")

    # 4. Verify patient persistence in database
    fetched = mock_db.find_one("patients", "patient_id", new_pid)
    assert fetched is not None
    assert fetched["first_name"] == "Aarav"
    assert fetched["last_name"] == "Sen"
