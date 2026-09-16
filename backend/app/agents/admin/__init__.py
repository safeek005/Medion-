"""
Admin Agent Package (DATA / RULE)
Responsible for:
- Hospital operations summary
- Audit logs retrieval
"""
from app.agents.base import BaseAgent
from app.models.common import AgentType
from app.agents.admin.service import admin_service
from typing import Dict, Any

class AdminAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            agent_id="AGENT-ADMIN-01",
            agent_name="Admin Agent",
            agent_type=AgentType.DATA
        )

    def execute(self, action: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        action_clean = action.lower().strip()
        if action_clean == "get_operations_summary":
            return admin_service.get_operations_summary(payload)
        elif action_clean == "get_audit_logs":
            return admin_service.get_audit_logs(payload)
        else:
            raise ValueError(
                f"Action '{action}' is not supported by Admin Agent. "
                "Supported actions: get_operations_summary, get_audit_logs."
            )
