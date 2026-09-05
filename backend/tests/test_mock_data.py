from fastapi.testclient import TestClient
import sys
from pathlib import Path

backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.main import app

client = TestClient(app)

def test_get_patients_collection():
    response = client.get("/api/v1/mock-data/patients")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert len(data["data"]) >= 1
    assert data["data"][0]["patient_id"] == "PAT-1001"

def test_get_single_patient_item():
    response = client.get("/api/v1/mock-data/patients/patient_id/PAT-1001")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["data"]["patient_id"] == "PAT-1001"
    assert data["data"]["first_name"] == "Arun"

def test_search_patients():
    response = client.get("/api/v1/mock-data/patients?search=Sneha")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert len(data["data"]) == 1
    assert data["data"][0]["first_name"] == "Sneha"

def test_unknown_collection_404():
    response = client.get("/api/v1/mock-data/non_existent_collection")
    assert response.status_code == 404
