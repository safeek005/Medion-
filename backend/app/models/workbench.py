from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field
from datetime import datetime, timezone

class WorkbenchRequest(BaseModel):
    workflow_id: Optional[str] = Field(None, description="Unique SNS Workbench workflow session ID")
    agent_target: str = Field(..., description="Target core agent name: patient | medical | appointment | insurance | assistant")
    action: str = Field(..., description="Action or query command to perform")
    portal_source: Optional[str] = Field(None, description="Originating portal: doctor | nurse | patient | lab | hospital")
    payload: Dict[str, Any] = Field(default_factory=dict, description="Input data payload for the targeted agent")

class AgentOutput(BaseModel):
    agent_id: str
    agent_name: str
    agent_type: str
    summary: str
    result_data: Dict[str, Any] = Field(default_factory=dict)
    next_recommended_action: Optional[str] = None

class WorkbenchResponse(BaseModel):
    success: bool = True
    workflow_id: Optional[str] = None
    target_agent: str
    action_performed: str
    output: AgentOutput
    errors: Optional[List[str]] = None
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
