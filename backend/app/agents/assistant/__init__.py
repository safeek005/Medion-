"""
Assistant Agent Package (AI / HYBRID)
Responsible for:
- Natural-language interface for Doctor, Nurse, and Patient portals
- Intent recognition and query parsing
- Routing queries via SNS Workbench to specialized agents
"""
from app.agents.base import BaseAgent
from app.models.common import AgentType
from app.agents.assistant.service import assistant_service
from typing import Dict, Any

class AssistantAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            agent_id="AGENT-ASSISTANT-05",
            agent_name="Assistant Agent",
            agent_type=AgentType.AI
        )

    def execute(self, action: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        action_clean = action.lower().strip()
        if action_clean == "interpret_request":
            return assistant_service.interpret_request(payload)
        elif action_clean == "extract_parameters":
            return assistant_service.extract_parameters(payload)
        elif action_clean == "create_workbench_request":
            return assistant_service.create_workbench_request(payload)
        elif action_clean == "format_response":
            return assistant_service.format_response(payload)
        elif action_clean == "handle_clarification":
            return assistant_service.handle_clarification(payload)
        else:
            raise ValueError(
                f"Action '{action}' is not supported by Assistant Agent. "
                "Supported actions: interpret_request, extract_parameters, create_workbench_request, format_response, handle_clarification."
            )

