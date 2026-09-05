"""
Patient Agent Package (DATA / RULE)
Responsible for:
- Patient registration
- Patient ID generation
- Patient search
- Patient profile
- Patient information retrieval
"""
from app.agents.base import BaseAgent
from app.models.common import AgentType
from app.agents.patient.service import patient_service
from typing import Dict, Any

class PatientAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            agent_id="AGENT-PATIENT-01",
            agent_name="Patient Agent",
            agent_type=AgentType.DATA
        )

    def execute(self, action: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        action_clean = action.lower().strip()
        if action_clean == "register_patient":
            return patient_service.register_patient(payload)
        elif action_clean == "get_patient":
            return patient_service.get_patient(payload)
        elif action_clean == "search_patient":
            return patient_service.search_patient(payload)
        elif action_clean == "update_patient":
            return patient_service.update_patient(payload)
        elif action_clean == "get_patient_history":
            return patient_service.get_patient_history(payload)
        else:
            raise ValueError(
                f"Action '{action}' is not supported by Patient Agent. "
                "Supported actions: register_patient, get_patient, search_patient, update_patient, get_patient_history."
            )
