from typing import Dict, Any, List, Optional
from app.agents.assistant.ai_provider import assistant_ai_provider
from app.agents.assistant.parser import deterministic_parser
from app.agents.assistant.intent_registry import ACTION_REGISTRY

class AssistantService:
    def interpret_request(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Action: interpret_request
        Understands natural language request, identifies intent, target agent/action, parameters, and missing fields.
        Maintains multi-turn context and executes the specialized agent only when all parameters are validated.
        """
        message = payload.get("message") or payload.get("prompt") or payload.get("query", "")
        user_role = (payload.get("user_role") or payload.get("portal_source") or "doctor").lower().strip()
        context = payload.get("conversation_context") or payload.get("previous_context") or {}

        if not message:
            raise ValueError("Field 'message' (or 'prompt') is required for interpret_request.")

        parsed = assistant_ai_provider.parse_intent(message, user_role=user_role, context=context)
        target_agent = parsed.get("target_agent", "assistant")
        target_action = parsed.get("target_action", "handle_clarification")
        missing_params = parsed.get("missing_parameters", [])
        is_ambiguous = parsed.get("is_ambiguous", False)

        # Merge extracted parameters with context payload
        params = {**payload, **parsed.get("required_parameters", {})}
        for k in ["message", "prompt", "query", "user_role", "portal_source", "conversation_context", "previous_context"]:
            params.pop(k, None)

        # If clarification is needed (ambiguous or missing required fields)
        if is_ambiguous or len(missing_params) > 0 or target_agent == "assistant":
            clarification = self.handle_clarification({
                "missing_parameters": missing_params,
                "ambiguous_options": parsed.get("ambiguous_options", []),
                "target_action": target_action,
                "intent": parsed.get("intent"),
                "target_agent": target_agent,
                "user_role": user_role,
                "extracted_parameters": params,
                "context": {
                    "pending_action": target_action,
                    "pending_domain": target_agent,
                    "collected_entities": params,
                    "missing_fields": missing_params,
                    "patient_id": params.get("patient_id"),
                    "doctor_id": params.get("doctor_id"),
                    "appointment_id": params.get("appointment_id")
                }
            })
            clarification["provider_info"] = parsed.get("provider_info")
            return {
                **parsed,
                "success": True,
                "target_agent": target_agent,
                "target_action": target_action,
                "action_performed": target_action,
                "needs_clarification": True,
                "clarification_question": clarification.get("clarification_question"),
                "summary": clarification.get("clarification_question"),
                "formatted_text": clarification.get("clarification_question"),
                "suggested_answers": clarification.get("suggested_answers", []),
                "ambiguous_options": clarification.get("ambiguous_options", []),
                "result_data": clarification,
                "context": clarification.get("context"),
                "provider_info": parsed.get("provider_info")
            }

        # If intent routes to a specialized domain agent, execute it with verified parameters
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
                    agent_result["provider_info"] = parsed.get("provider_info")
                    # Format output using role-aware clinical brief formatter
                    formatted = self.format_response({
                        "specialized_agent_result": agent_result,
                        "user_role": user_role
                    })

                    full_summary = agent_result.get("summary") or formatted.get("formatted_text") or "Operation complete."
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
                        "patient": agent_result.get("patient"),
                        "appointment": agent_result.get("appointment"),
                        "claim": agent_result.get("claim"),
                        "available_slots": agent_result.get("available_slots"),
                        "explanation": agent_result.get("explanation"),
                        "parameters_used": params,
                        "needs_clarification": False,
                        "context": None,
                        "provider_info": parsed.get("provider_info")
                    }

                except Exception as e:
                    # Return deterministic failure, NEVER claim fake success
                    err_msg = str(e)
                    return {
                        **parsed,
                        "success": False,
                        "target_agent": target_agent,
                        "target_action": target_action,
                        "action_performed": target_action,
                        "error": err_msg,
                        "message": err_msg,
                        "summary": f"Could not complete {target_action}: {err_msg}",
                        "formatted_text": f"The requested operation could not be completed: {err_msg}",
                        "result_data": {
                            "success": False,
                            "error": err_msg,
                            "action": target_action
                        },
                        "needs_clarification": False
                    }

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
        if "appointment" in agent_result and isinstance(agent_result["appointment"], dict):
            apt = agent_result["appointment"]
            extra_details.append(f"Appointment ID: {apt.get('appointment_id')}, Date: {apt.get('appointment_date')}, Time: {apt.get('time_slot')}, Status: {apt.get('status')}")
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
        Generates focused clarification question and context-aware suggested answers.
        """
        missing = payload.get("missing_parameters", [])
        ambiguous = payload.get("ambiguous_options", [])
        target_action = payload.get("target_action") or payload.get("intent") or "the requested action"
        extracted = payload.get("extracted_parameters") or {}
        context = payload.get("context") or {}

        suggested_answers: List[str] = []

        if ambiguous or "insurance" in target_action.lower():
            if ambiguous:
                clarification_text = "I can help verify eligibility, check coverage, prepare a claim, submit a claim, or check claim status. Which would you like to do?"
            else:
                clarification_text = f"Your request is ambiguous. Did you mean to {', '.join(ambiguous)}?"
            suggested_answers = ["Verify eligibility", "Check coverage", "Prepare claim", "Check claim status"]

        elif target_action == "register_patient":
            patient_name = extracted.get("full_name") or extracted.get("first_name") or "the new patient"
            missing_labels = []
            for m in missing:
                if m in ["dob", "date_of_birth"]:
                    missing_labels.append("date of birth")
                elif m == "gender":
                    missing_labels.append("gender")
                elif m in ["phone", "contact_number"]:
                    missing_labels.append("contact number")
                else:
                    missing_labels.append(m.replace("_", " "))

            if "gender" in missing and len(missing) == 1:
                clarification_text = f"Please provide the gender for {patient_name}."
                suggested_answers = ["Male", "Female", "Other"]
            elif "phone" in missing and len(missing) == 1:
                clarification_text = f"Please provide the contact number for {patient_name}."
                suggested_answers = ["+91 9876543210", "+91 9123456780"]
            else:
                clarification_text = f"I can register {patient_name} as a new patient. Please provide the {', '.join(missing_labels)}."
                suggested_answers = ["Male", "Female", "01.01.1990", "+91 9876543210"]

        elif target_action == "book_appointment":
            doctor_id = extracted.get("doctor_id") or "Dr. Rajesh Mehta"
            doc_name = "Dr. Rajesh Mehta" if "101" in str(doctor_id) else ("Dr. Anita Deshmukh" if "102" in str(doctor_id) else "Dr. Suresh Rao")
            if "date" in missing and "time_slot" in missing:
                clarification_text = f"Sure. What date and preferred time would you like for {doc_name}?"
                suggested_answers = ["Tomorrow at 10 AM", "Tomorrow at 2 PM", "Friday at 11 AM", "Next available slot"]
            elif "time_slot" in missing:
                clarification_text = f"What time would you prefer for {doc_name}?"
                suggested_answers = ["10:00 AM", "11:00 AM", "2:00 PM", "Next available slot"]
            else:
                clarification_text = f"To book with {doc_name}, please provide: {', '.join(missing)}."
                suggested_answers = ["Tomorrow at 10 AM", "Tomorrow at 2 PM"]

        elif target_action == "get_available_slots":
            clarification_text = "Which doctor or specialty would you like to check availability for?"
            suggested_answers = ["Dr. Rajesh Mehta (Cardiology)", "Dr. Anita Deshmukh (Endocrinology)", "Dr. Suresh Rao (General Medicine)"]

        elif target_action in ["analyze_lab_report", "explain_lab_report"]:
            clarification_text = "Which lab report or test would you like me to check?"
            suggested_answers = ["LABR-1001 (Blood & Lipid Panel)", "LABR-1002 (Thyroid Profile)", "Latest report"]

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
            "suggested_answers": suggested_answers,
            "context": context,
            "summary": clarification_text
        }

assistant_service = AssistantService()
