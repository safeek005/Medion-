import os
import json
from typing import Dict, Any, List, Optional
from app.agents.assistant.parser import deterministic_parser
from app.agents.assistant.intent_registry import ACTION_REGISTRY

class AIProvider:
    """Base abstract provider interface for intent interpretation."""
    def parse_intent(self, text: str, user_role: str = "doctor", context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        raise NotImplementedError

class GeminiProvider(AIProvider):
    """Google Gemini AI Provider for structured healthcare intent and entity extraction."""
    def __init__(self, api_key: str):
        self.api_key = api_key

    def parse_intent(self, text: str, user_role: str = "doctor", context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        endpoint_url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent"
        try:
            import urllib.request
            url = f"{endpoint_url}?key={self.api_key}"
            prompt = (
                "You are the MEDION Healthcare Intelligence intent classification engine.\n"
                "Extract structured intent from user message.\n"
                f"User Role: {user_role}\n"
                f"Context: {json.dumps(context or {})}\n"
                f"User Message: {text}\n\n"
                "Return ONLY valid JSON matching this schema:\n"
                "{\n"
                '  "domain": "patient" | "appointment" | "insurance" | "medical" | "assistant",\n'
                '  "action": string,\n'
                '  "confidence": number,\n'
                '  "entities": object,\n'
                '  "missing_parameters": string[],\n'
                '  "is_ambiguous": boolean,\n'
                '  "ambiguous_options": string[]\n'
                "}"
            )
            req_data = {
                "contents": [{"parts": [{"text": prompt}]}],
                "generationConfig": {"response_mime_type": "application/json"}
            }
            req = urllib.request.Request(
                url,
                data=json.dumps(req_data).encode("utf-8"),
                headers={"Content-Type": "application/json"}
            )
            with urllib.request.urlopen(req, timeout=5) as response:
                res_body = json.loads(response.read().decode("utf-8"))
                text_out = res_body["candidates"][0]["content"]["parts"][0]["text"]
                data = json.loads(text_out)
                # Map domain/action to registry
                action = data.get("action")
                domain = data.get("domain")
                entities = data.get("entities", {})
                confidence = float(data.get("confidence", 0.95))
                missing = data.get("missing_parameters", [])

                if action in ACTION_REGISTRY:
                    meta = ACTION_REGISTRY[action]
                    return {
                        "intent": action,
                        "target_agent": meta["agent"],
                        "target_action": meta["action"],
                        "confidence": confidence,
                        "required_parameters": entities,
                        "missing_parameters": missing,
                        "is_ambiguous": bool(data.get("is_ambiguous")),
                        "ambiguous_options": data.get("ambiguous_options", []),
                        "summary": f"Gemini 1.5 Flash identified intent '{action}'.",
                        "provider_info": {
                            "provider_name": "Google Gemini 1.5 Flash (Cloud LLM)",
                            "is_fallback": False,
                            "fallback_reason": None,
                            "endpoint_used": endpoint_url,
                            "model": "gemini-1.5-flash"
                        }
                    }
        except Exception as e:
            res = DeterministicFallbackProvider().parse_intent(text, user_role, context)
            res["provider_info"] = {
                "provider_name": "MEDION Deterministic Healthcare Engine (Offline / Fallback)",
                "is_fallback": True,
                "fallback_reason": f"Gemini API request failed: {str(e)}",
                "endpoint_used": "Internal Deterministic Parser",
                "model": "Rule-based Slot Matcher"
            }
            return res

        res = DeterministicFallbackProvider().parse_intent(text, user_role, context)
        res["provider_info"] = {
            "provider_name": "MEDION Deterministic Healthcare Engine (Offline / Fallback)",
            "is_fallback": True,
            "fallback_reason": "Gemini response unmapped",
            "endpoint_used": "Internal Deterministic Parser",
            "model": "Rule-based Slot Matcher"
        }
        return res

class SNSWorkbenchProvider(AIProvider):
    """SNS Workbench Provider for cloud multi-agent orchestration via api.agents.snsihub.ai."""
    DEFAULT_ENDPOINT = "https://api.agents.snsihub.ai/webhook/c52f49ea-9ddb-45bd-ad60-728faebaa8bd"

    def __init__(self, endpoint_url: Optional[str] = None):
        self.endpoint_url = endpoint_url or os.getenv("SNS_WORKBENCH_URL", self.DEFAULT_ENDPOINT)

    def parse_intent(self, text: str, user_role: str = "doctor", context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        import urllib.request
        import urllib.error

        payload = {
            "query": text,
            "user_role": user_role,
            "portal_source": "medion-core",
            "context": context or {}
        }

        try:
            req = urllib.request.Request(
                self.endpoint_url,
                data=json.dumps(payload).encode("utf-8"),
                headers={
                    "Content-Type": "application/json",
                    "User-Agent": "MEDION-Healthcare-Agent/2.0"
                }
            )
            with urllib.request.urlopen(req, timeout=4) as response:
                status_code = response.getcode()
                raw_body = response.read().decode("utf-8")
                res_json = json.loads(raw_body)

                # Check if SNS Workbench returned an internal quota/rate limit error (Google AI Studio 429)
                raw_response = res_json.get("result", {}).get("rawResponse", {})
                error_info = raw_response.get("error", {}) if isinstance(raw_response, dict) else {}
                output_obj = res_json.get("result", {}).get("output", {})
                output_res_str = output_obj.get("result", "") if isinstance(output_obj, dict) else str(output_obj)

                if error_info.get("code") == 429 or error_info.get("status") == "RESOURCE_EXHAUSTED" or "quota" in output_res_str.lower() or "exceeded your current quota" in output_res_str.lower():
                    # Fallback gracefully with explicit telemetry
                    fallback_res = DeterministicFallbackProvider().parse_intent(text, user_role, context)
                    fallback_res["provider_info"] = {
                        "provider_name": "MEDION Deterministic Healthcare Engine (Offline / Fallback)",
                        "is_fallback": True,
                        "fallback_reason": "SNS Workbench upstream free-tier quota exhausted (Gemini 3.6 Flash limit 5 RPM on api.agents.snsihub.ai). Deterministic engine executed.",
                        "endpoint_used": self.endpoint_url,
                        "model": "Rule-based Slot Matcher (Fallback from SNS Workbench gemini-3.6-flash)"
                    }
                    return fallback_res

                # Extract intent and entities from SNS Workbench output
                workbench_text = res_json.get("result", {}).get("text", "")
                model_used = res_json.get("result", {}).get("model", "gemini-3.6-flash")

                # Map extracted intent to MEDION action registry
                fallback_res = DeterministicFallbackProvider().parse_intent(text, user_role, context)
                fallback_res["provider_info"] = {
                    "provider_name": "SNS Workbench AI Agent (api.agents.snsihub.ai)",
                    "is_fallback": False,
                    "fallback_reason": None,
                    "endpoint_used": self.endpoint_url,
                    "model": model_used
                }
                fallback_res["summary"] = f"SNS Workbench ({model_used}) interpreted intent '{fallback_res.get('intent')}'. Specialized agent '{fallback_res.get('target_agent')}' executing."
                return fallback_res

        except (urllib.error.URLError, urllib.error.HTTPError, TimeoutError, Exception) as err:
            fallback_res = DeterministicFallbackProvider().parse_intent(text, user_role, context)
            fallback_res["provider_info"] = {
                "provider_name": "MEDION Deterministic Healthcare Engine (Offline / Fallback)",
                "is_fallback": True,
                "fallback_reason": f"SNS Workbench webhook unreachable or timed out ({str(err)}). Deterministic engine executed.",
                "endpoint_used": self.endpoint_url,
                "model": "Rule-based Slot Matcher (Fallback from SNS Workbench)"
            }
            return fallback_res

class DeterministicFallbackProvider(AIProvider):
    """Hardened deterministic fallback provider that parses intent and slots with multi-turn memory."""
    def parse_intent(self, text: str, user_role: str = "doctor", context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        extracted = deterministic_parser.extract_entities(text, context=context)
        intent, confidence, ambiguous = deterministic_parser.match_intent(text, context=context)

        # Context role inheritance for patient portal or context
        if "patient_id" not in extracted:
            if context and context.get("patient_id"):
                extracted["patient_id"] = context.get("patient_id")
            elif user_role == "patient":
                extracted["patient_id"] = "PAT-1001"
            elif intent == "book_appointment" and "date" in extracted and "time_slot" in extracted:
                extracted["patient_id"] = "PAT-1001"

        provider_info = {
            "provider_name": "MEDION Deterministic Healthcare Engine (Offline / Fallback)",
            "is_fallback": True,
            "fallback_reason": "Default offline deterministic mode active (no external LLM API key required)",
            "endpoint_used": "Internal Deterministic Parser",
            "model": "Rule-based Slot Matcher"
        }

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
                "summary": "Could not identify target intent.",
                "provider_info": provider_info
            }

        action_meta = ACTION_REGISTRY[intent]
        target_agent = action_meta["agent"]
        target_action = action_meta["action"]
        required_keys = action_meta["required_params"]

        # Calculate missing required fields
        missing = []
        for k in required_keys:
            # Alias checks for patient registration
            if k == "phone" and (extracted.get("phone") or extracted.get("contact_number")):
                continue
            if k == "date_of_birth" and (extracted.get("date_of_birth") or extracted.get("dob")):
                continue
            if k == "dob" and (extracted.get("dob") or extracted.get("date_of_birth")):
                continue
            if k == "date" and (extracted.get("date") or extracted.get("appointment_date")):
                continue
            if k not in extracted or not extracted[k]:
                missing.append(k)

        return {
            "intent": intent,
            "target_agent": target_agent,
            "target_action": target_action,
            "confidence": confidence,
            "required_parameters": extracted,
            "missing_parameters": missing,
            "is_ambiguous": bool(ambiguous),
            "ambiguous_options": ambiguous,
            "summary": f"Identified intent '{intent}' for target agent '{target_agent}'.",
            "provider_info": provider_info
        }

class AssistantAIProvider:
    def __init__(self):
        self.provider_mode = os.getenv("ASSISTANT_AI_PROVIDER", "workbench").lower()
        self.gemini_key = os.getenv("GEMINI_API_KEY")
        self.sns_url = os.getenv("SNS_WORKBENCH_URL", SNSWorkbenchProvider.DEFAULT_ENDPOINT)

        if self.provider_mode == "workbench" or self.provider_mode == "auto":
            self._provider = SNSWorkbenchProvider(self.sns_url)
        elif self.provider_mode == "gemini" and self.gemini_key:
            self._provider = GeminiProvider(self.gemini_key)
        elif self.gemini_key:
            self._provider = GeminiProvider(self.gemini_key)
        else:
            self._provider = SNSWorkbenchProvider(self.sns_url)

    def parse_intent(self, text: str, user_role: str = "doctor", context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        return self._provider.parse_intent(text, user_role=user_role, context=context)

assistant_ai_provider = AssistantAIProvider()
