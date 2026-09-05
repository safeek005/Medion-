from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional
from datetime import datetime

from app.models.common import AgentType
from app.models.workbench import WorkbenchRequest, WorkbenchResponse, AgentOutput

class BaseAgent(ABC):
    def __init__(self, agent_id: str, agent_name: str, agent_type: AgentType):
        self.agent_id = agent_id
        self.agent_name = agent_name
        self.agent_type = agent_type

    @abstractmethod
    def execute(self, action: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute core domain logic for a given action.
        Subclasses must implement this method.
        """
        pass

    def process(self, request: WorkbenchRequest) -> WorkbenchResponse:
        """
        Standardized entrypoint for SNS Workbench orchestration requests.
        Ensures structured JSON output format for machine-to-machine communication.
        """
        try:
            result_data = self.execute(request.action, request.payload)
            summary = result_data.get("summary", f"{self.agent_name} executed {request.action} successfully.")
            
            output = AgentOutput(
                agent_id=self.agent_id,
                agent_name=self.agent_name,
                agent_type=self.agent_type.value,
                summary=summary,
                result_data=result_data,
                next_recommended_action=result_data.get("next_action")
            )
            
            return WorkbenchResponse(
                success=True,
                workflow_id=request.workflow_id,
                target_agent=self.agent_name,
                action_performed=request.action,
                output=output
            )
        except Exception as e:
            output = AgentOutput(
                agent_id=self.agent_id,
                agent_name=self.agent_name,
                agent_type=self.agent_type.value,
                summary=f"Execution error in {self.agent_name}: {str(e)}",
                result_data={}
            )
            return WorkbenchResponse(
                success=False,
                workflow_id=request.workflow_id,
                target_agent=self.agent_name,
                action_performed=request.action,
                output=output,
                errors=[str(e)]
            )
