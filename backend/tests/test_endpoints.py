import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

# -----------------------------------------------------------------------------
# 1. PATIENT ENDPOINTS TESTS
# -----------------------------------------------------------------------------

def test_register_patient_endpoint():
    payload = {
        "first_name": "Rohan",
        "last_name": "Verma",
        "dob": "1994-07-21",
        "gender": "Male",
        "phone": "+91 9887766554",
        "email": "rohan.verma@example.com",
        "blood_group": "B+",
        "primary_doctor_id": "DOC-101"
    }
    response = client.post(
        "/api/v1/patients/register",
        json=payload,
        headers={"X-User-Role": "receptionist"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["patient_id"].startswith("PAT-")

def test_register_patient_rbac_blocks_patient_role():
    payload = {
        "first_name": "Rohan",
        "last_name": "Verma",
        "phone": "+91 9887766554"
    }
    response = client.post(
        "/api/v1/patients/register",
        json=payload,
        headers={"X-User-Role": "patient"}
    )
    assert response.status_code == 403

def test_get_patient_profile():
    response = client.get(
        "/api/v1/patients/PAT-1001",
        headers={"X-User-Role": "doctor"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["patient"]["patient_id"] == "PAT-1001"

def test_get_patient_history_isolation():
    # Calling as PAT-1002 trying to view PAT-1025
    response = client.get(
        "/api/v1/patients/PAT-1025/history",
        headers={"X-User-Role": "patient", "X-Patient-Id": "PAT-1002"}
    )
    assert response.status_code == 403

    # Calling as PAT-1025 viewing PAT-1025
    response_ok = client.get(
        "/api/v1/patients/PAT-1025/history",
        headers={"X-User-Role": "patient", "X-Patient-Id": "PAT-1025"}
    )
    assert response_ok.status_code == 200
    assert response_ok.json()["patient_id"] == "PAT-1025"

# -----------------------------------------------------------------------------
# 2. APPOINTMENT ENDPOINTS TESTS
# -----------------------------------------------------------------------------

def test_appointment_availability():
    response = client.get("/api/v1/appointments/availability?doctor_id=DOC-101&date=2026-10-10")
    assert response.status_code == 200
    data = response.json()
    assert "available_slots" in data
    assert len(data["available_slots"]) > 0

def test_book_reschedule_cancel_appointment():
    # 1. Book
    book_payload = {
        "patient_id": "PAT-1001",
        "doctor_id": "DOC-101",
        "appointment_date": "2026-10-15",
        "time_slot": "10:00-10:30",
        "reason_for_visit": "Cardiology checkup"
    }
    book_resp = client.post(
        "/api/v1/appointments/book",
        json=book_payload,
        headers={"X-User-Role": "receptionist"}
    )
    assert book_resp.status_code == 200
    book_data = book_resp.json()
    assert book_data["success"] is True
    apt_id = book_data["appointment"]["appointment_id"]

    # 2. Reschedule
    resched_payload = {
        "new_date": "2026-10-16",
        "new_time_slot": "11:00-11:30",
        "reason": "Doctor request"
    }
    resched_resp = client.post(
        f"/api/v1/appointments/{apt_id}/reschedule",
        json=resched_payload,
        headers={"X-User-Role": "receptionist"}
    )
    assert resched_resp.status_code == 200
    assert resched_resp.json()["success"] is True

    # 3. Cancel
    cancel_resp = client.post(
        f"/api/v1/appointments/{apt_id}/cancel",
        json={"reason": "Patient conflict"},
        headers={"X-User-Role": "receptionist"}
    )
    assert cancel_resp.status_code == 200
    assert cancel_resp.json()["success"] is True

# -----------------------------------------------------------------------------
# 3. MEDICAL & LAB ANALYSIS ENDPOINTS TESTS
# -----------------------------------------------------------------------------

def test_medical_summary():
    response = client.get(
        "/api/v1/medical/history/PAT-1001",
        headers={"X-User-Role": "doctor"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["patient_id"] == "PAT-1001"

def test_analyze_lab_report():
    response = client.post(
        "/api/v1/medical/lab-reports/analyze",
        json={"report_id": "LABR-1001"},
        headers={"X-User-Role": "doctor"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True

def test_clinical_review_requires_doctor():
    # Nurse cannot perform clinical review
    resp_forbidden = client.post(
        "/api/v1/medical/clinical-review",
        json={"patient_id": "PAT-1001", "doctor_id": "DOC-101"},
        headers={"X-User-Role": "nurse"}
    )
    assert resp_forbidden.status_code == 403

    # Doctor can perform clinical review
    resp_ok = client.post(
        "/api/v1/medical/clinical-review",
        json={"patient_id": "PAT-1001", "doctor_id": "DOC-101"},
        headers={"X-User-Role": "doctor"}
    )
    assert resp_ok.status_code == 200
    assert resp_ok.json()["success"] is True

# -----------------------------------------------------------------------------
# 4. INSURANCE & CLAIMS ENDPOINTS TESTS
# -----------------------------------------------------------------------------

def test_verify_insurance_policy():
    response = client.get("/api/v1/insurance/policies/POL-701?patient_id=PAT-1001")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True

def test_insurance_claim_workflow():
    # 1. Submit claim
    claim_payload = {
        "patient_id": "PAT-1025",
        "policy_id": "POL-725",
        "claim_amount": 850.0,
        "bill_id": "BILL-1025"
    }
    submit_resp = client.post(
        "/api/v1/insurance/claims",
        json=claim_payload,
        headers={"X-User-Role": "receptionist"}
    )
    assert submit_resp.status_code == 200
    claim_id = submit_resp.json()["claim"]["claim_id"]

    # 2. Adjudicate claim (requires insurance auditor)
    adj_resp = client.post(
        f"/api/v1/insurance/claims/{claim_id}/adjudicate",
        json={"decision": "APPROVED", "adjudicator_id": "ADJ-882"},
        headers={"X-User-Role": "insurance"}
    )
    assert adj_resp.status_code == 200
    assert adj_resp.json()["success"] is True

    # 3. Settle claim
    settle_resp = client.post(
        f"/api/v1/insurance/claims/{claim_id}/settle",
        json={"amount": 850.0, "settled_by": "FIN-01"},
        headers={"X-User-Role": "insurance"}
    )
    assert settle_resp.status_code == 200
    assert settle_resp.json()["success"] is True

# -----------------------------------------------------------------------------
# 5. NURSE WORKFLOW ENDPOINTS TESTS
# -----------------------------------------------------------------------------

def test_nurse_tasks_and_vitals():
    # 1. Get tasks
    tasks_resp = client.get("/api/v1/nurse/tasks", headers={"X-User-Role": "nurse"})
    assert tasks_resp.status_code == 200

    # 2. Record vitals
    vitals_payload = {
        "patient_id": "PAT-1001",
        "nurse_id": "NURSE-01",
        "vitals": {"blood_pressure": "120/80", "heart_rate": 72, "temperature": 98.6}
    }
    vitals_resp = client.post(
        "/api/v1/nurse/vitals",
        json=vitals_payload,
        headers={"X-User-Role": "nurse"}
    )
    assert vitals_resp.status_code == 200
    assert vitals_resp.json()["success"] is True

    # 3. Administer medication
    med_payload = {
        "patient_id": "PAT-1001",
        "medication_id": "MED-RX-101",
        "nurse_id": "NURSE-01"
    }
    med_resp = client.post(
        "/api/v1/nurse/medications/administer",
        json=med_payload,
        headers={"X-User-Role": "nurse"}
    )
    assert med_resp.status_code == 200
    assert med_resp.json()["success"] is True

# -----------------------------------------------------------------------------
# 6. LABORATORY WORKFLOW ENDPOINTS TESTS
# -----------------------------------------------------------------------------

def test_laboratory_endpoints():
    # 1. Get queue
    q_resp = client.get("/api/v1/lab/queue", headers={"X-User-Role": "lab"})
    assert q_resp.status_code == 200

    # 2. Process specimen
    proc_payload = {
        "specimen_id": "SPEC-9011",
        "test_results": [{"parameter": "Hemoglobin", "value": "13.8 g/dL"}]
    }
    proc_resp = client.post(
        "/api/v1/lab/specimens/process",
        json=proc_payload,
        headers={"X-User-Role": "lab"}
    )
    assert proc_resp.status_code == 200

    # 3. Authorize release
    auth_resp = client.post(
        "/api/v1/lab/reports/LABR-1001/authorize",
        json={"approver_id": "LAB-DIR-01"},
        headers={"X-User-Role": "lab"}
    )
    assert auth_resp.status_code == 200
    assert auth_resp.json()["success"] is True

# -----------------------------------------------------------------------------
# 7. HOSPITAL ADMINISTRATION ENDPOINTS TESTS
# -----------------------------------------------------------------------------

def test_admin_operations_and_audit():
    # 1. Non-admin forbidden
    bad_resp = client.get("/api/v1/admin/operations", headers={"X-User-Role": "patient"})
    assert bad_resp.status_code == 403

    # 2. Admin operations
    ops_resp = client.get("/api/v1/admin/operations", headers={"X-User-Role": "admin"})
    assert ops_resp.status_code == 200
    assert "department_metrics" in ops_resp.json() or "summary" in ops_resp.json() or "total_patients" in ops_resp.json()

    # 3. Audit logs
    audit_resp = client.get("/api/v1/admin/audit-logs", headers={"X-User-Role": "admin"})
    assert audit_resp.status_code == 200
    assert "logs" in audit_resp.json() or "audit_logs" in audit_resp.json()
