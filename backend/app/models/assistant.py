from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field

class InterpretRequest(BaseModel):
    message: str
    user_role: Optional[str] = "doctor"  # doctor | nurse | patient

class ExtractParametersRequest(BaseModel):
    message: str

class CreateWorkbenchRequestPayload(BaseModel):
    intent: str
    target_agent: str
    target_action: str
    parameters: Dict[str, Any] = Field(default_factory=dict)
    portal_source: Optional[str] = "doctor"

class FormatResponseRequest(BaseModel):
    specialized_agent_result: Dict[str, Any]
    user_role: Optional[str] = "doctor"
    target_agent: Optional[str] = None
    target_action: Optional[str] = None

class HandleClarificationRequest(BaseModel):
    intent: Optional[str] = None
    target_agent: Optional[str] = None
    target_action: Optional[str] = None
    missing_parameters: List[str] = Field(default_factory=list)
    ambiguous_options: Optional[List[str]] = None

class IntentInterpretationResult(BaseModel):
    intent: str
    target_agent: str
    target_action: str
    confidence: float
    required_parameters: Dict[str, Any]
    missing_parameters: List[str]
    is_ambiguous: bool = False
    ambiguous_options: Optional[List[str]] = None
