from fastapi import APIRouter, HTTPException
from app.models.workbench import WorkbenchRequest, WorkbenchResponse
from app.agents.patient import PatientAgent
from app.agents.medical import MedicalAgent
from app.agents.appointment import AppointmentAgent
from app.agents.insurance import InsuranceAgent
from app.agents.assistant import AssistantAgent
from app.agents.admin import AdminAgent
from app.agents.nurse import NurseAgent
from app.agents.lab import LabAgent

router = APIRouter(prefix="/workbench", tags=["SNS Workbench Dispatcher"])

AGENTS = {
    "patient": PatientAgent(),
    "medical": MedicalAgent(),
    "appointment": AppointmentAgent(),
    "insurance": InsuranceAgent(),
    "assistant": AssistantAgent(),
    "admin": AdminAgent(),
    "nurse": NurseAgent(),
    "lab": LabAgent()
}

PATIENT_FORBIDDEN_ACTIONS = {
    "insurance": {"adjudicate_claim", "settle_claim", "reject_claim", "prepare_claim", "submit_claim", "query_claim", "process_preauthorization", "get_all_claims"},
    "medical": {"approve_prescription", "update_prescription", "create_prescription", "analyze_lab_report", "flag_abnormal_results", "clinical_decision_support", "sign_clinical_order"},
    "patient": {"list_all_patients", "delete_patient", "register_patient"},
    "appointment": {"update_appointment_status", "complete_appointment", "list_all_appointments", "get_daily_schedule"},
    "admin": {"*"},
    "nurse": {"*"},
    "lab": {"*"}
}

def enforce_role_authorization(request: WorkbenchRequest) -> None:
    """
    Enforces strict Role-Based Access Control (RBAC) and Patient Data Isolation.
    Prevents unauthorized cross-role execution and cross-patient data access.
    """
    payload = request.payload or {}
    role = (
        payload.get("user_role") or
        payload.get("portal_source") or
        request.portal_source or
        ""
    ).lower().strip()

    target = request.agent_target.lower().strip()
    action = request.action.lower().strip()

    # 1. Patient Role Security Boundaries
    if role == "patient":
        # Block access to entire admin/clinical internal agents
        if target in ["admin", "nurse", "lab"]:
            raise HTTPException(
                status_code=403,
                detail=f"Access Denied: Patient role is not authorized to access '{target}' workspace or workflows."
            )

        # Block administrative/clinical actions on allowed agents
        forbidden_for_target = PATIENT_FORBIDDEN_ACTIONS.get(target, set())
        if "*" in forbidden_for_target or action in forbidden_for_target:
            raise HTTPException(
                status_code=403,
                detail=f"Access Denied: Patient role is not authorized to execute '{action}' on '{target}'. Administrative/clinical credentials required."
            )

        # 2. Patient Data Scope Isolation (Zero Cross-Patient Access)
        caller_patient_id = (
            payload.get("caller_patient_id") or
            payload.get("authenticated_patient_id") or
            payload.get("user_id") or
            (payload.get("conversation_context") or {}).get("patient_id")
        )
        target_patient_id = payload.get("patient_id")

        if caller_patient_id and target_patient_id:
            if str(caller_patient_id).strip().upper() != str(target_patient_id).strip().upper():
                raise HTTPException(
                    status_code=403,
                    detail=f"Access Denied: Patient '{caller_patient_id}' cannot access or query records for other patients ('{target_patient_id}')."
                )

    # 3. Doctor/Nurse/Staff Cross-Boundary Checks
    if role in ["doctor", "nurse", "lab", "insurance"] and target == "admin":
        raise HTTPException(
            status_code=403,
            detail=f"Access Denied: Role '{role}' cannot access Hospital Administration workspace or manage executive operations."
        )

    if role in ["doctor", "nurse", "lab"]:
        if target == "insurance" and action in ["settle_claim", "reject_claim", "adjudicate_claim"]:
            raise HTTPException(
                status_code=403,
                detail=f"Access Denied: Role '{role}' cannot adjudicate or settle insurance claims. Payer officer credentials required."
            )

    if role in ["nurse", "insurance", "lab"]:
        if target == "medical" and action in ["approve_prescription", "sign_clinical_order", "clinical_decision_support"]:
            raise HTTPException(
                status_code=403,
                detail=f"Access Denied: Role '{role}' cannot approve or sign medical prescriptions. Attending physician authorization required."
            )

@router.post("/dispatch", response_model=WorkbenchResponse)
def dispatch_workbench_request(request: WorkbenchRequest):
    enforce_role_authorization(request)

    target = request.agent_target.lower()
    if target not in AGENTS:
        raise HTTPException(
            status_code=400,
            detail=f"Unknown target agent '{request.agent_target}'. Must be one of: {list(AGENTS.keys())}"
        )
    
    agent = AGENTS[target]
    response = agent.process(request)
    return response
