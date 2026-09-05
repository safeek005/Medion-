"""
Insurance Agent Package (RULE / HYBRID)
Responsible for:
- Insurance verification & eligibility checking
- Coverage & copay calculation
- Claim preparation & submission
- Claim status tracking & communication with Mock Insurance System
"""
from app.agents.base import BaseAgent
from app.models.common import AgentType
from app.agents.insurance.service import insurance_service
from typing import Dict, Any

class InsuranceAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            agent_id="AGENT-INSURANCE-04",
            agent_name="Insurance Agent",
            agent_type=AgentType.HYBRID
        )

    def execute(self, action: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        action_clean = action.lower().strip()
        if action_clean == "verify_insurance":
            return insurance_service.verify_insurance(payload)
        elif action_clean == "get_coverage":
            return insurance_service.get_coverage(payload)
        elif action_clean == "prepare_claim":
            return insurance_service.prepare_claim(payload)
        elif action_clean == "submit_claim":
            return insurance_service.submit_claim(payload)
        elif action_clean == "get_claim_status":
            return insurance_service.get_claim_status(payload)
        else:
            raise ValueError(
                f"Action '{action}' is not supported by Insurance Agent. "
                "Supported actions: verify_insurance, get_coverage, prepare_claim, submit_claim, get_claim_status."
            )

