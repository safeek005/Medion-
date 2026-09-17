from typing import Dict, Any, List, Optional
from fastapi import APIRouter, HTTPException, Header, Query, Path, File, UploadFile, Form
from pydantic import BaseModel, Field

from app.agents.patient.service import patient_service
from app.agents.appointment.service import appointment_service
from app.agents.medical.service import medical_service
from app.agents.insurance.service import insurance_service
from app.agents.nurse.service import nurse_service
from app.agents.lab.service import lab_service
from app.agents.admin.service import admin_service

router = APIRouter(tags=["MEDION Production REST Endpoints"])

def get_caller_role(x_user_role: Optional[str] = Header(None), user_role: Optional[str] = None) -> str:
    role = (x_user_role or user_role or "doctor").lower().strip()
    return role

def verify_patient_isolation(target_patient_id: str, caller_role: str, x_patient_id: Optional[str] = Header(None), caller_patient_id: Optional[str] = None):
    if caller_role == "patient":
        cid = (x_patient_id or caller_patient_id or "").strip().upper()
        tid = target_patient_id.strip().upper()
        if cid and cid != tid:
            raise HTTPException(
                status_code=403,
                detail=f"Access Denied: Patient '{cid}' cannot access records for patient '{tid}'."
            )

# ==============================================================================
# 1. PATIENT ENDPOINTS
# ==============================================================================

class PatientRegisterRequest(BaseModel):
    first_name: str
    last_name: Optional[str] = ""
    dob: Optional[str] = "1990-01-01"
    gender: Optional[str] = "Male"
    phone: str
    email: Optional[str] = None
    address: Optional[str] = None
    blood_group: Optional[str] = None
    primary_doctor_id: Optional[str] = "DOC-101"
    insurance_policy_id: Optional[str] = None

class PatientCheckDuplicateRequest(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    dob: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None

from fastapi import APIRouter, HTTPException, Header, Query, Path, File, UploadFile, Form, Request

class PatientOcrExtractRequest(BaseModel):
    demo_specimen_id: Optional[str] = None
    file_name: Optional[str] = None
    document_type: Optional[str] = "aadhaar"
    raw_text: Optional[str] = None

@router.post("/patients/register")
def register_patient(
    req: PatientRegisterRequest,
    x_user_role: Optional[str] = Header(None)
):
    role = get_caller_role(x_user_role)
    if role == "patient":
        raise HTTPException(status_code=403, detail="Access Denied: Patient role cannot register new patient accounts.")
    try:
        return patient_service.register_patient(req.model_dump())
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))

@router.post("/patients/check-duplicate")
def check_patient_duplicate(
    req: PatientCheckDuplicateRequest,
    x_user_role: Optional[str] = Header(None)
):
    return patient_service.check_duplicate(req.model_dump())

@router.post("/patients/ocr-extract")
async def ocr_extract_patient_document(
    request: Request,
    x_user_role: Optional[str] = Header(None)
):
    content_type = request.headers.get("content-type", "").lower()
    payload = {}
    if "multipart/form-data" in content_type or "application/x-www-form-urlencoded" in content_type:
        form = await request.form()
        if form.get("demo_specimen_id"):
            payload["demo_specimen_id"] = str(form.get("demo_specimen_id"))
        if form.get("raw_text"):
            payload["raw_text"] = str(form.get("raw_text"))
        if form.get("file_name"):
            payload["file_name"] = str(form.get("file_name"))
        file_obj = form.get("file")
        if file_obj and hasattr(file_obj, "filename"):
            payload["file_name"] = file_obj.filename
            content = await file_obj.read()
            try:
                payload["raw_text"] = content.decode("utf-8", errors="ignore")
            except Exception:
                pass
    else:
        try:
            payload = await request.json()
        except Exception:
            payload = {}

    result = patient_service.ocr_extract_document(payload)
    if not result.get("success"):
        raise HTTPException(status_code=422, detail=result.get("error", "OCR extraction failed."))
    return result

@router.get("/patients/{patient_id}")
def get_patient_profile(
    patient_id: str = Path(...),
    x_user_role: Optional[str] = Header(None),
    x_patient_id: Optional[str] = Header(None)
):
    role = get_caller_role(x_user_role)
    verify_patient_isolation(patient_id, role, x_patient_id)
    try:
        return patient_service.get_patient({"patient_id": patient_id})
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))

@router.get("/patients/{patient_id}/history")
def get_patient_history(
    patient_id: str = Path(...),
    x_user_role: Optional[str] = Header(None),
    x_patient_id: Optional[str] = Header(None)
):
    role = get_caller_role(x_user_role)
    verify_patient_isolation(patient_id, role, x_patient_id)
    try:
        return patient_service.get_patient_history({"patient_id": patient_id})
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))

# ==============================================================================
# 2. APPOINTMENT ENDPOINTS
# ==============================================================================

class AppointmentBookRequest(BaseModel):
    patient_id: str
    doctor_id: str = "DOC-101"
    appointment_date: str
    time_slot: str
    reason_for_visit: Optional[str] = "Clinical Consultation"

class AppointmentCancelRequest(BaseModel):
    reason: Optional[str] = "Patient requested cancellation"

class AppointmentRescheduleRequest(BaseModel):
    new_date: str
    new_time_slot: str
    reason: Optional[str] = "Schedule change"

@router.get("/appointments/availability")
def get_appointment_availability(
    doctor_id: str = Query("DOC-101"),
    date: str = Query(...)
):
    return appointment_service.get_available_slots({"doctor_id": doctor_id, "date": date})

@router.post("/appointments/book")
def book_appointment(
    req: AppointmentBookRequest,
    x_user_role: Optional[str] = Header(None),
    x_patient_id: Optional[str] = Header(None)
):
    role = get_caller_role(x_user_role)
    verify_patient_isolation(req.patient_id, role, x_patient_id)
    try:
        return appointment_service.book_appointment(req.model_dump())
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))

@router.post("/appointments/{appointment_id}/cancel")
def cancel_appointment(
    appointment_id: str = Path(...),
    req: Optional[AppointmentCancelRequest] = None,
    x_user_role: Optional[str] = Header(None)
):
    payload = {"appointment_id": appointment_id, "reason": req.reason if req else "Cancelled"}
    try:
        return appointment_service.cancel_appointment(payload)
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))

@router.post("/appointments/{appointment_id}/reschedule")
def reschedule_appointment(
    appointment_id: str = Path(...),
    req: AppointmentRescheduleRequest = ...,
    x_user_role: Optional[str] = Header(None)
):
    payload = {
        "appointment_id": appointment_id,
        "new_date": req.new_date,
        "new_time_slot": req.new_time_slot,
        "reason": req.reason
    }
    try:
        return appointment_service.reschedule_appointment(payload)
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))

# ==============================================================================
# 3. MEDICAL HISTORY & LAB ANALYSIS ENDPOINTS
# ==============================================================================

class LabAnalysisRequest(BaseModel):
    report_id: str
    patient_id: Optional[str] = None

class ClinicalReviewRequest(BaseModel):
    patient_id: str
    doctor_id: str = "DOC-101"
    clinical_notes: Optional[str] = "Clinical evaluation performed"

@router.get("/medical/history/{patient_id}")
def get_medical_summary(
    patient_id: str = Path(...),
    x_user_role: Optional[str] = Header(None),
    x_patient_id: Optional[str] = Header(None)
):
    role = get_caller_role(x_user_role)
    verify_patient_isolation(patient_id, role, x_patient_id)
    try:
        return medical_service.get_medical_summary({"patient_id": patient_id})
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))

@router.post("/medical/lab-reports/analyze")
def analyze_lab_report(
    req: LabAnalysisRequest,
    x_user_role: Optional[str] = Header(None)
):
    role = get_caller_role(x_user_role)
    if role == "patient":
        raise HTTPException(status_code=403, detail="Access Denied: Patient role cannot invoke clinical analyzer.")
    try:
        return medical_service.analyze_lab_report(req.model_dump())
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))

@router.post("/medical/clinical-review")
def perform_clinical_review(
    req: ClinicalReviewRequest,
    x_user_role: Optional[str] = Header(None)
):
    role = get_caller_role(x_user_role)
    if role not in ["doctor", "admin"]:
        raise HTTPException(status_code=403, detail="Access Denied: Attending physician authorization required for clinical review.")
    try:
        return medical_service.clinical_review(req.model_dump())
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))

# ==============================================================================
# 4. INSURANCE POLICY & CLAIM ADJUDICATION ENDPOINTS
# ==============================================================================

class ClaimSubmitRequest(BaseModel):
    patient_id: str
    policy_id: str = "POL-725"
    claim_amount: float = 850.0
    bill_id: Optional[str] = "BILL-1025"

class ClaimAdjudicateRequest(BaseModel):
    decision: str = "APPROVED"
    adjudicator_id: str = "ADJ-882"
    notes: Optional[str] = "Verified against policy coverage schedule"

class ClaimSettleRequest(BaseModel):
    amount: Optional[float] = 850.0
    settled_by: str = "FIN-OFFICER-01"

@router.get("/insurance/policies/{policy_id}")
def verify_insurance_policy(
    policy_id: str = Path(...),
    patient_id: Optional[str] = Query(None),
    x_user_role: Optional[str] = Header(None)
):
    return insurance_service.verify_insurance({"policy_id": policy_id, "patient_id": patient_id})

@router.post("/insurance/claims")
def submit_insurance_claim(
    req: ClaimSubmitRequest,
    x_user_role: Optional[str] = Header(None)
):
    role = get_caller_role(x_user_role)
    if role == "patient":
        raise HTTPException(status_code=403, detail="Access Denied: Patient cannot submit direct payer claims.")
    return insurance_service.create_insurance_claim(req.model_dump())

@router.post("/insurance/claims/{claim_id}/adjudicate")
def adjudicate_insurance_claim(
    claim_id: str = Path(...),
    req: ClaimAdjudicateRequest = ...,
    x_user_role: Optional[str] = Header(None)
):
    role = get_caller_role(x_user_role)
    if role not in ["insurance", "admin"]:
        raise HTTPException(status_code=403, detail="Access Denied: Claims auditor role required to adjudicate claims.")
    payload = {"claim_id": claim_id, **req.model_dump()}
    return insurance_service.adjudicate_claim(payload)

@router.post("/insurance/claims/{claim_id}/settle")
def settle_insurance_claim(
    claim_id: str = Path(...),
    req: Optional[ClaimSettleRequest] = None,
    x_user_role: Optional[str] = Header(None)
):
    role = get_caller_role(x_user_role)
    if role not in ["insurance", "admin"]:
        raise HTTPException(status_code=403, detail="Access Denied: Claims officer role required to settle claims.")
    payload = {"claim_id": claim_id, **(req.model_dump() if req else {})}
    return insurance_service.settle_claim(payload)

# ==============================================================================
# 5. NURSE TASKS, VITALS & MEDICATION ENDPOINTS
# ==============================================================================

class VitalsRecordRequest(BaseModel):
    patient_id: str
    nurse_id: str = "NURSE-01"
    vitals: Dict[str, Any]

class MedicationAdministerRequest(BaseModel):
    patient_id: str
    medication_id: str
    nurse_id: str = "NURSE-01"

@router.get("/nurse/tasks")
def get_nurse_tasks(
    nurse_id: Optional[str] = Query(None),
    x_user_role: Optional[str] = Header(None)
):
    role = get_caller_role(x_user_role)
    if role == "patient":
        raise HTTPException(status_code=403, detail="Access Denied: Patient role cannot view nurse task queue.")
    return nurse_service.get_tasks({"nurse_id": nurse_id})

@router.post("/nurse/vitals")
def record_patient_vitals(
    req: VitalsRecordRequest,
    x_user_role: Optional[str] = Header(None)
):
    role = get_caller_role(x_user_role)
    if role not in ["nurse", "doctor", "admin"]:
        raise HTTPException(status_code=403, detail="Access Denied: Clinical staff role required to record vitals.")
    return nurse_service.record_vitals(req.model_dump())

@router.post("/nurse/medications/administer")
def administer_patient_medication(
    req: MedicationAdministerRequest,
    x_user_role: Optional[str] = Header(None)
):
    role = get_caller_role(x_user_role)
    if role not in ["nurse", "doctor", "admin"]:
        raise HTTPException(status_code=403, detail="Access Denied: Clinical nurse role required to administer medication.")
    return nurse_service.administer_medication(req.model_dump())

# ==============================================================================
# 6. LABORATORY REPORT PROCESSING ENDPOINTS
# ==============================================================================

class LabSpecimenProcessRequest(BaseModel):
    specimen_id: str
    test_results: Optional[List[Dict[str, Any]]] = None

class LabReleaseRequest(BaseModel):
    approver_id: str = "LAB-DIR-01"

@router.get("/lab/queue")
def get_lab_queue(
    x_user_role: Optional[str] = Header(None)
):
    role = get_caller_role(x_user_role)
    if role == "patient":
        raise HTTPException(status_code=403, detail="Access Denied: Patient role cannot view laboratory queue.")
    return lab_service.get_pending_orders({})

@router.post("/lab/specimens/process")
def process_lab_specimen(
    req: LabSpecimenProcessRequest,
    x_user_role: Optional[str] = Header(None)
):
    role = get_caller_role(x_user_role)
    if role not in ["lab", "admin"]:
        raise HTTPException(status_code=403, detail="Access Denied: Laboratory role required to process specimens.")
    return lab_service.process_specimen(req.model_dump())

@router.post("/lab/reports/{report_id}/authorize")
def authorize_lab_report(
    report_id: str = Path(...),
    req: Optional[LabReleaseRequest] = None,
    x_user_role: Optional[str] = Header(None)
):
    role = get_caller_role(x_user_role)
    if role not in ["lab", "admin"]:
        raise HTTPException(status_code=403, detail="Access Denied: Chief pathologist authorization required to release lab reports.")
    payload = {"report_id": report_id, "approver_id": req.approver_id if req else "LAB-DIR-01"}
    return lab_service.authorize_patient_lab_release(payload)

# ==============================================================================
# 7. HOSPITAL ADMINISTRATION OPERATIONS ENDPOINTS
# ==============================================================================

@router.get("/admin/operations")
def get_hospital_operations(
    hospital_id: Optional[str] = Query("HOSP-001"),
    x_user_role: Optional[str] = Header(None)
):
    role = get_caller_role(x_user_role)
    if role != "admin" and role != "hospital":
        raise HTTPException(status_code=403, detail="Access Denied: Hospital executive or administrator role required.")
    return admin_service.get_operations_summary({"hospital_id": hospital_id})

@router.get("/admin/audit-logs")
def get_hospital_audit_logs(
    limit: int = Query(25, ge=1, le=100),
    x_user_role: Optional[str] = Header(None)
):
    role = get_caller_role(x_user_role)
    if role != "admin" and role != "hospital":
        raise HTTPException(status_code=403, detail="Access Denied: Hospital administrator role required to view audit logs.")
    return admin_service.get_audit_logs({"limit": limit})
