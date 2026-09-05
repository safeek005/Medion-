from fastapi import APIRouter, HTTPException
from app.models.workbench import WorkbenchRequest, WorkbenchResponse
from app.agents.patient import PatientAgent
from app.agents.medical import MedicalAgent
from app.agents.appointment import AppointmentAgent
from app.agents.insurance import InsuranceAgent
from app.agents.assistant import AssistantAgent

router = APIRouter(prefix="/workbench", tags=["SNS Workbench Dispatcher"])

AGENTS = {
    "patient": PatientAgent(),
    "medical": MedicalAgent(),
    "appointment": AppointmentAgent(),
    "insurance": InsuranceAgent(),
    "assistant": AssistantAgent()
}

@router.post("/dispatch", response_model=WorkbenchResponse)
def dispatch_workbench_request(request: WorkbenchRequest):
    target = request.agent_target.lower()
    if target not in AGENTS:
        raise HTTPException(
            status_code=400,
            detail=f"Unknown target agent '{request.agent_target}'. Must be one of: {list(AGENTS.keys())}"
        )
    
    agent = AGENTS[target]
    response = agent.process(request)
    return response
