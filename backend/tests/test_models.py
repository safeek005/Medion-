import sys
from pathlib import Path

backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.models.patient import Patient, EmergencyContact
from app.models.medical import LabReport, TestResultItem
from app.models.workbench import WorkbenchRequest, WorkbenchResponse

def test_patient_model_validation():
    patient = Patient(
        patient_id="PAT-1001",
        first_name="Arun",
        last_name="Kumar",
        dob="1982-05-14",
        gender="Male",
        blood_group="O+",
        phone="+91 9876543210",
        email="arun.kumar@example.com",
        address="42 MG Road",
        emergency_contact=EmergencyContact(
            name="Priya Kumar",
            relationship="Spouse",
            phone="+91 9876543211"
        ),
        primary_doctor_id="DOC-101",
        insurance_policy_id="POL-701",
        created_at="2024-01-10T09:30:00Z"
    )
    assert patient.patient_id == "PAT-1001"
    assert patient.emergency_contact.relationship == "Spouse"

def test_workbench_request_validation():
    req = WorkbenchRequest(
        workflow_id="WF-101",
        agent_target="patient",
        action="get_patient",
        portal_source="doctor",
        payload={"patient_id": "PAT-1001"}
    )
    assert req.agent_target == "patient"
    assert req.payload["patient_id"] == "PAT-1001"
