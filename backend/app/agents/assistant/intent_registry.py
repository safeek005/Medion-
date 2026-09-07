from typing import Dict, Any, List

# Master registry mapping domain intents to target agents, target actions, and required parameters
ACTION_REGISTRY: Dict[str, Dict[str, Any]] = {
    # Patient Domain
    "register_patient": {
        "agent": "patient",
        "action": "register_patient",
        "required_params": ["full_name", "phone", "email", "gender"],
        "keywords": ["register patient", "new patient", "create patient", "sign up patient"]
    },
    "get_patient": {
        "agent": "patient",
        "action": "get_patient",
        "required_params": ["patient_id"],
        "keywords": ["find patient", "get patient", "show patient", "fetch patient", "view patient"]
    },
    "search_patient": {
        "agent": "patient",
        "action": "search_patient",
        "required_params": ["query"],
        "keywords": ["search patient", "lookup patient", "find patients", "search for patient"]
    },
    "update_patient": {
        "agent": "patient",
        "action": "update_patient",
        "required_params": ["patient_id"],
        "keywords": ["update patient", "modify patient", "change patient phone", "change patient address", "update phone"]
    },
    "get_patient_history": {
        "agent": "patient",
        "action": "get_patient_history",
        "required_params": ["patient_id"],
        "keywords": ["patient history", "full history", "medical history", "patient record history"]
    },

    # Medical Domain
    "extract_lab_report": {
        "agent": "medical",
        "action": "extract_lab_report",
        "required_params": ["report_id"],
        "keywords": ["extract report", "extract lab", "parse lab report", "extract test values", "extract lab report"]
    },
    "analyze_lab_report": {
        "agent": "medical",
        "action": "analyze_lab_report",
        "required_params": ["report_id"],
        "keywords": ["analyze report", "analyze lab", "analyze laboratory report", "analyze lab report", "check lab report", "evaluate lab", "review lab", "laboratory report", "lab report", "analyze", "latest lab report"]
    },
    "compare_lab_reports": {
        "agent": "medical",
        "action": "compare_lab_reports",
        "required_params": ["current_report_id", "previous_report_id"],
        "keywords": ["compare lab", "compare reports", "report trend", "lab comparison", "compare lab reports"]
    },
    "get_medical_summary": {
        "agent": "medical",
        "action": "get_medical_summary",
        "required_params": ["patient_id"],
        "keywords": ["medical summary", "clinical summary", "patient medical summary", "doctor summary", "summarize patient", "summarize lab", "summarize report"]
    },
    "explain_lab_report": {
        "agent": "medical",
        "action": "explain_lab_report",
        "required_params": ["report_id"],
        "keywords": ["explain lab", "explain report", "explain blood test", "explain test results"]
    },

    # Appointment Domain
    "get_available_slots": {
        "agent": "appointment",
        "action": "get_available_slots",
        "required_params": ["doctor_id"],
        "keywords": ["available slots", "doctor availability", "check slots", "free slots", "open slots", "appointments available", "available for", "available appointments", "appointments are available", "slots for", "appointments for"]
    },
    "book_appointment": {
        "agent": "appointment",
        "action": "book_appointment",
        "required_params": ["patient_id", "doctor_id", "date", "time_slot"],
        "keywords": ["book appointment", "schedule appointment", "make appointment", "reserve slot"]
    },
    "get_appointment": {
        "agent": "appointment",
        "action": "get_appointment",
        "required_params": ["appointment_id"],
        "keywords": ["get appointment", "view appointment", "show appointment", "appointment details"]
    },
    "cancel_appointment": {
        "agent": "appointment",
        "action": "cancel_appointment",
        "required_params": ["appointment_id"],
        "keywords": ["cancel appointment", "drop appointment", "remove appointment"]
    },
    "reschedule_appointment": {
        "agent": "appointment",
        "action": "reschedule_appointment",
        "required_params": ["appointment_id", "new_date", "new_time_slot"],
        "keywords": ["reschedule appointment", "move appointment", "change appointment date", "postpone appointment"]
    },

    # Insurance Domain
    "verify_insurance": {
        "agent": "insurance",
        "action": "verify_insurance",
        "required_params": ["patient_id"],
        "keywords": ["verify insurance", "check insurance", "insurance status", "is insured", "insurance eligibility"]
    },
    "get_coverage": {
        "agent": "insurance",
        "action": "get_coverage",
        "required_params": ["patient_id"],
        "keywords": ["check coverage", "get coverage", "policy coverage", "copay", "insurance coverage"]
    },
    "prepare_claim": {
        "agent": "insurance",
        "action": "prepare_claim",
        "required_params": ["patient_id", "bill_id"],
        "keywords": ["prepare claim", "create claim", "draft claim", "build claim"]
    },
    "submit_claim": {
        "agent": "insurance",
        "action": "submit_claim",
        "required_params": ["claim_id"],
        "keywords": ["submit claim", "file claim", "process claim", "send claim"]
    },
    "get_claim_status": {
        "agent": "insurance",
        "action": "get_claim_status",
        "required_params": ["claim_id"],
        "keywords": ["claim status", "check claim", "claim progress", "view claim"]
    }
}
