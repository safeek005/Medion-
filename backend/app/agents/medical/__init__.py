"""
Medical Agent Package (AI / HYBRID)
Responsible for:
- Laboratory report processing & extraction
- Test identification & value extraction
- Reference range & abnormal value identification
- Report comparison & medical summary generation
- Clinical findings & abnormal flags (Extract -> Analyze -> Compare -> Summarize -> Flag)
"""
from app.agents.base import BaseAgent
from app.models.common import AgentType
from app.agents.medical.service import medical_service
from typing import Dict, Any

class MedicalAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            agent_id="AGENT-MEDICAL-02",
            agent_name="Medical Agent",
            agent_type=AgentType.HYBRID
        )

    def execute(self, action: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        action_clean = action.lower().strip()
        if action_clean == "extract_lab_report":
            return medical_service.extract_lab_report(payload)
        elif action_clean == "analyze_lab_report":
            return medical_service.analyze_lab_report(payload)
        elif action_clean == "compare_lab_reports":
            return medical_service.compare_lab_reports(payload)
        elif action_clean == "get_medical_summary":
            return medical_service.get_medical_summary(payload)
        elif action_clean == "explain_lab_report":
            return medical_service.explain_lab_report(payload)
        else:
            raise ValueError(
                f"Action '{action}' is not supported by Medical Agent. "
                "Supported actions: extract_lab_report, analyze_lab_report, compare_lab_reports, get_medical_summary, explain_lab_report."
            )

