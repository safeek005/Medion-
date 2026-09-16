"""
Nurse Agent Package (DATA / RULE)
Responsible for:
- Task Management
- Vitals recording and triage
- Medication administration workflow
"""
from app.agents.base import BaseAgent
from app.models.common import AgentType
from app.agents.nurse.service import nurse_service
from typing import Dict, Any

class NurseAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            agent_id="AGENT-NURSE-01",
            agent_name="Nurse Agent",
            agent_type=AgentType.DATA
        )

    def execute(self, action: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        action_clean = action.lower().strip()
        if action_clean == "get_tasks":
            return nurse_service.get_tasks(payload)
        elif action_clean == "update_task":
            return nurse_service.update_task(payload)
        elif action_clean == "record_vitals":
            return nurse_service.record_vitals(payload)
        elif action_clean == "administer_medication":
            return nurse_service.administer_medication(payload)
        elif action_clean == "create_nursing_task":
            return nurse_service.create_nursing_task(payload)
        elif action_clean == "escalate_vitals":
            return nurse_service.escalate_vitals(payload)
        elif action_clean == "initiate_discharge":
            return nurse_service.initiate_discharge(payload)
        else:
            raise ValueError(
                f"Action '{action}' is not supported by Nurse Agent. "
                "Supported actions: get_tasks, update_task, record_vitals, administer_medication, create_nursing_task, escalate_vitals, initiate_discharge."
            )
