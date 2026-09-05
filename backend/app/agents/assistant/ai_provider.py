import os
from typing import Dict, Any, List, Optional
from app.agents.assistant.parser import deterministic_parser
from app.agents.assistant.intent_registry import ACTION_REGISTRY

class AssistantAIProvider:
    def __init__(self):
        self.provider_mode = os.getenv("ASSISTANT_AI_PROVIDER", "mock").lower()
        self.openai_key = os.getenv("OPENAI_API_KEY")
        self.gemini_key = os.getenv("GEMINI_API_KEY")
        self.has_llm = self.provider_mode in ["openai", "gemini"] and bool(self.openai_key or self.gemini_key)

    def parse_intent(self, text: str, user_role: str = "doctor") -> Dict[str, Any]:
        """
        Parses user message into intent, target agent, action, parameters, missing params, and confidence score.
        Falls back to deterministic rule parser if LLM provider is unconfigured or offline.
        """
        extracted = deterministic_parser.extract_entities(text)
        intent, confidence, ambiguous = deterministic_parser.match_intent(text)

        if not intent:
            return {
                "intent": "unknown",
                "target_agent": "assistant",
                "target_action": "handle_clarification",
                "confidence": 0.0,
                "required_parameters": extracted,
                "missing_parameters": [],
                "is_ambiguous": False,
                "ambiguous_options": [],
                "summary": "Could not identify target intent."
            }

        action_meta = ACTION_REGISTRY[intent]
        target_agent = action_meta["agent"]
        target_action = action_meta["action"]
        required_keys = action_meta["required_params"]

        missing = [k for k in required_keys if k not in extracted or not extracted[k]]

        return {
            "intent": intent,
            "target_agent": target_agent,
            "target_action": target_action,
            "confidence": confidence,
            "required_parameters": extracted,
            "missing_parameters": missing,
            "is_ambiguous": bool(ambiguous),
            "ambiguous_options": ambiguous,
            "summary": f"Identified intent '{intent}' for target agent '{target_agent}'."
        }

assistant_ai_provider = AssistantAIProvider()
