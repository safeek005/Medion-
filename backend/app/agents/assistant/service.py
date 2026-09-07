from typing import Dict, Any, List, Optional
from app.agents.assistant.ai_provider import assistant_ai_provider
from app.agents.assistant.parser import deterministic_parser
from app.agents.assistant.intent_registry import ACTION_REGISTRY

class AssistantService:
    def interpret_request(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Action: interpret_request
        Understands natural language request, identifies intent, target agent/action, parameters, and missing fields.
        When a specialized agent intent is identified, executes that agent and returns the formatted clinical result.
        """
        message = payload.get("message") or payload.get("prompt") or payload.get("query", "")
        user_role = payload.get("user_role") or payload.get("portal_source", "doctor")

        if not message:
            raise ValueError("Field 'message' (or 'prompt') is required for interpret_request.")

        parsed = assistant_ai_provider.parse_intent(message, user_role=user_role)
        target_agent = parsed.get("target_agent", "assistant")
        target_action = parsed.get("target_action", "handle_clarification")

        # Merge extracted parameters with context payload
        params = {**payload, **parsed.get("required_parameters", {})}
        params.pop("message", None)
        params.pop("prompt", None)
        params.pop("query", None)
        params.pop("user_role", None)
        params.pop("portal_source", None)

        # If intent routes to a specialized agent (patient, medical, appointment, insurance), execute it
        if target_agent in ["medical", "patient", "appointment", "insurance"]:
            from app.agents.patient.service import patient_service
            from app.agents.medical.service import medical_service
            from app.agents.appointment.service import appointment_service
            from app.agents.insurance.service import insurance_service

            domain_services = {
                "patient": patient_service,
                "medical": medical_service,
                "appointment": appointment_service,
                "insurance": insurance_service
            }

            service = domain_services[target_agent]
            action_func = getattr(service, target_action, None)

            if action_func and callable(action_func):
                try:
                    agent_result = action_func(params)
                    # Format output using role-aware clinical brief formatter
                    formatted = self.format_response({
                        "specialized_agent_result": agent_result,
                        "user_role": user_role
                    })

                    full_summary = formatted.get("formatted_text") or agent_result.get("summary") or "Analysis complete."
                    if agent_result.get("explanation") and agent_result.get("explanation") not in full_summary:
                        full_summary = f"{full_summary}\n\n{agent_result.get('explanation')}"

                    return {
                        **parsed,
                        "success": True,
                        "intent": parsed.get("intent"),
                        "target_agent": target_agent,
                        "target_action": target_action,
                        "action_performed": target_action,
                        "summary": full_summary,
                        "formatted_text": formatted.get("formatted_text"),
                        "result_data": agent_result,
                        "explanation": agent_result.get("explanation"),
                        "parameters_used": params,
                        "parsed_intent": parsed
                    }

                except Exception as e:
                    # If specific parameters failed, return clarification or parsed metadata
                    pass

        result = parsed
        result["success"] = True
        return result


    def extract_parameters(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Action: extract_parameters
        Extracts structured IDs, dates, times, and entity fields from natural language text.
        """
        message = payload.get("message", "")
        if not message:
            raise ValueError("Field 'message' is required for extract_parameters.")

        entities = deterministic_parser.extract_entities(message)
        return {
            "success": True,
            "message": message,
            "count": len(entities),
            "parameters": entities,
            "summary": f"Extracted {len(entities)} parameter(s) from text."
        }

    def create_workbench_request(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Action: create_workbench_request
        Converts intent and parameters into a valid WorkbenchRequest dictionary payload.
        """
        intent = payload.get("intent")
        target_agent = payload.get("target_agent")
        target_action = payload.get("target_action")
        parameters = payload.get("parameters") or payload.get("required_parameters") or {}
        portal_source = payload.get("portal_source", "doctor")

        if intent and not (target_agent and target_action):
            meta = ACTION_REGISTRY.get(intent)
            if meta:
                target_agent = meta["agent"]
                target_action = meta["action"]

        if not target_agent or not target_action:
            raise ValueError("Both 'target_agent' and 'target_action' (or valid 'intent') are required.")

        workflow_id = payload.get("workflow_id", f"WF-AST-{target_agent.upper()}-001")

        workbench_request = {
            "workflow_id": workflow_id,
            "agent_target": target_agent,
            "action": target_action,
            "portal_source": portal_source,
            "payload": parameters
        }

        return {
            "success": True,
            "target_agent": target_agent,
            "target_action": target_action,
            "workbench_request": workbench_request,
            "summary": f"Created Workbench request for target agent '{target_agent}' action '{target_action}'."
        }

    def format_response(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Action: format_response
        Formats specialized agent result JSON into role-aware natural language for Doctor, Nurse, or Patient.
        FACT PRIMACY: Strictly grounded in specialized_agent_result.
        """
        agent_result = payload.get("specialized_agent_result") or payload.get("result_data") or payload
        user_role = (payload.get("user_role") or "doctor").lower().strip()

        if not agent_result:
            raise ValueError("Field 'specialized_agent_result' is required for format_response.")

        # Check operation success
        success = agent_result.get("success", True)
        if not success:
            error_msg = agent_result.get("error") or agent_result.get("message") or "Operation failed."
            return {
                "success": True,
                "user_role": user_role,
                "formatted_text": f"The requested operation could not be completed: {error_msg}",
                "summary": f"Reported failure to {user_role}."
            }

        summary_text = agent_result.get("summary") or agent_result.get("message") or "Operation completed successfully."
        
        # Details augmentation
        extra_details = []
        if "patient" in agent_result and isinstance(agent_result["patient"], dict):
            p = agent_result["patient"]
            extra_details.append(f"Gender: {p.get('gender')}, Blood Group: {p.get('blood_group')}, Primary Doctor: {p.get('primary_doctor_id')}, Policy: {p.get('insurance_policy_id')}")
        if "available_slots" in agent_result and isinstance(agent_result["available_slots"], list):
            slots_list = [
                s.get("time_slot") or s.get("start_time") if isinstance(s, dict) else str(s)
                for s in agent_result["available_slots"]
            ]
            extra_details.append(f"Available Slots: {', '.join(slots_list)}")

        if "policy" in agent_result and isinstance(agent_result["policy"], dict):
            pol = agent_result["policy"]
            extra_details.append(f"Provider: {pol.get('provider_name')}, Copay: {pol.get('copay_percentage')}%, Coverage Limit: ${pol.get('coverage_limit')}")
        if "claim" in agent_result and isinstance(agent_result["claim"], dict):
            c = agent_result["claim"]
            extra_details.append(f"Claim ID: {c.get('claim_id')}, Claim Amount: ${c.get('claim_amount')}, Status: {c.get('status')}")

        extra_str = f" ({'; '.join(extra_details)})" if extra_details else ""

        # Patient role formatting
        if user_role == "patient":
            explanation = agent_result.get("explanation")
            if explanation:
                formatted = explanation
            else:
                formatted = f"Hello! Here is your update: {summary_text}{extra_str}"
                if "disclaimer" in agent_result:
                    formatted += f"\n\nNote: {agent_result['disclaimer']}"

        # Nurse role formatting
        elif user_role == "nurse":
            formatted = f"[NURSE ACTION REPORT] {summary_text}{extra_str}"
            if "status" in agent_result:
                formatted += f" (Status: {agent_result['status']})"
            if "approved_amount" in agent_result:
                formatted += f" Approved Amount: ${agent_result['approved_amount']}"

        # Doctor role formatting (default)
        else:
            explanation = agent_result.get("explanation")
            if explanation and "CLINICAL SUMMARY" in explanation:
                formatted = explanation
            else:
                formatted = f"[CLINICAL BRIEF] {summary_text}{extra_str}"
                if "priority" in agent_result:
                    formatted += f" Priority: {agent_result['priority']}"
                if "abnormal_count" in agent_result:
                    formatted += f" (Abnormal items: {agent_result['abnormal_count']})"


        return {
            "success": True,
            "user_role": user_role,
            "formatted_text": formatted,
            "summary": f"Formatted response tailored for {user_role} role."
        }

    def handle_clarification(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Action: handle_clarification
        Generates focused clarification question for missing parameters or ambiguous options.
        """
        missing = payload.get("missing_parameters", [])
        ambiguous = payload.get("ambiguous_options", [])
        target_action = payload.get("target_action") or payload.get("intent") or "the requested action"

        if ambiguous:
            opts_str = ", ".join(ambiguous)
            clarification_text = f"Your request is ambiguous. Did you mean to {opts_str}?"
        elif missing:
            param_str = ", ".join(missing)
            clarification_text = f"To proceed with {target_action}, please provide: {param_str}."
        else:
            clarification_text = "Could you please clarify your request?"

        return {
            "success": True,
            "needs_clarification": True,
            "missing_parameters": missing,
            "ambiguous_options": ambiguous,
            "clarification_question": clarification_text,
            "summary": "Generated clarification prompt for missing or ambiguous inputs."
        }

assistant_service = AssistantService()
