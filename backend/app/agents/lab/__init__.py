"""
Lab Agent Package (DATA / RULE)
Responsible for:
- Pending Lab Orders
- Dispatching Reports
"""
from app.agents.base import BaseAgent
from app.models.common import AgentType
from app.agents.lab.service import lab_service
from typing import Dict, Any

class LabAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            agent_id="AGENT-LAB-01",
            agent_name="Lab Agent",
            agent_type=AgentType.DATA
        )

    def execute(self, action: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        action_clean = action.lower().strip()
        if action_clean == "get_pending_orders":
            return lab_service.get_pending_orders(payload)
        elif action_clean == "approve_report":
            return lab_service.approve_report(payload)
        elif action_clean == "process_specimen":
            return lab_service.process_specimen(payload)
        elif action_clean == "notify_critical_lab":
            return lab_service.notify_critical_lab(payload)
        elif action_clean == "authorize_patient_lab_release":
            return lab_service.authorize_patient_lab_release(payload)
        else:
            raise ValueError(
                f"Action '{action}' is not supported by Lab Agent. "
                "Supported actions: get_pending_orders, approve_report, process_specimen, notify_critical_lab, authorize_patient_lab_release."
            )
