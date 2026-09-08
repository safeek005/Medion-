from typing import Dict, Any, List

# Master registry mapping domain intents to target agents, target actions, and required parameters
ACTION_REGISTRY: Dict[str, Dict[str, Any]] = {
    # Patient Domain
    "register_patient": {
        "agent": "patient",
        "action": "register_patient",
        "required_params": ["full_name", "phone", "email", "gender"],
        "keywords": ["register patient", "new patient", "create patient", "sign up patient", "patient registration"]
    },
    "get_patient": {
        "agent": "patient",
        "action": "get_patient",
        "required_params": ["patient_id"],
        "keywords": [
            "find patient", "get patient", "show patient", "fetch patient", "view patient",
            "patient profile", "show profile", "view profile", "profile for", "show arun", "show sneha"
        ]
    },
    "search_patient": {
        "agent": "patient",
        "action": "search_patient",
        "required_params": ["query"],
        "keywords": [
            "search patient", "lookup patient", "find patients", "search for patient",
            "find arun kumar", "find sneha sharma", "find patient sneha", "find vikram", "lookup"
        ]
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
        "keywords": [
            "patient history", "full history", "medical history", "patient record history",
            "clinical history", "arun kumar's medical history", "medical history for", "history for patient"
        ]
    },

    # Medical Domain
    "extract_lab_report": {
        "agent": "medical",
        "action": "extract_lab_report",
        "required_params": ["report_id"],
        "keywords": ["extract report", "extract lab", "parse lab report", "extract test values", "extract lab report", "extract lab parameters"]
    },
    "analyze_lab_report": {
        "agent": "medical",
        "action": "analyze_lab_report",
        "required_params": ["report_id"],
        "keywords": [
            "analyze report", "analyze lab", "analyze laboratory report", "analyze lab report", "check lab report",
            "evaluate lab", "review lab", "laboratory report", "lab report", "analyze", "latest lab report",
            "what is abnormal", "abnormal in my blood", "check my lab", "blood report", "lipid panel", "metabolic panel"
        ]
    },
    "compare_lab_reports": {
        "agent": "medical",
        "action": "compare_lab_reports",
        "required_params": ["current_report_id", "previous_report_id"],
        "keywords": ["compare lab", "compare reports", "report trend", "lab comparison", "compare lab reports", "compare labr"]
    },
    "get_medical_summary": {
        "agent": "medical",
        "action": "get_medical_summary",
        "required_params": ["patient_id"],
        "keywords": [
            "medical summary", "clinical summary", "patient medical summary", "doctor summary",
            "summarize patient", "summarize lab", "summarize report", "summary of my medical",
            "summary of medical reports", "give me a summary of my medical reports"
        ]
    },
    "explain_lab_report": {
        "agent": "medical",
        "action": "explain_lab_report",
        "required_params": ["report_id"],
        "keywords": [
            "explain lab", "explain report", "explain blood test", "explain test results",
            "explain labr-1001", "explain in simple language", "explain simply", "in patient-friendly terms", "explain lab results"
        ]
    },

    # Appointment Domain
    "get_available_slots": {
        "agent": "appointment",
        "action": "get_available_slots",
        "required_params": ["doctor_id"],
        "keywords": [
            "available slots", "doctor availability", "check slots", "free slots", "open slots",
            "appointments available", "available for", "available appointments", "appointments are available",
            "slots for", "appointments for", "when is dr", "available slots for dr", "when can i meet",
            "when can i see", "is dr rajesh free", "check appointments for dr", "free tomorrow"
        ]
    },
    "book_appointment": {
        "agent": "appointment",
        "action": "book_appointment",
        "required_params": ["patient_id", "doctor_id", "date", "time_slot"],
        "keywords": [
            "book appointment", "schedule appointment", "make appointment", "reserve slot",
            "book me", "book an appointment", "i want to see dr", "schedule me", "can you book me",
            "book me with", "book for", "schedule an appointment"
        ]
    },
    "get_appointment": {
        "agent": "appointment",
        "action": "get_appointment",
        "required_params": ["appointment_id"],
        "keywords": ["get appointment", "view appointment", "show appointment", "appointment details", "show my appointment details", "show my appointment"]
    },
    "cancel_appointment": {
        "agent": "appointment",
        "action": "cancel_appointment",
        "required_params": ["appointment_id"],
        "keywords": ["cancel appointment", "drop appointment", "remove appointment", "cancel my appointment"]
    },
    "reschedule_appointment": {
        "agent": "appointment",
        "action": "reschedule_appointment",
        "required_params": ["appointment_id", "new_date", "new_time_slot"],
        "keywords": ["reschedule appointment", "move appointment", "change appointment date", "postpone appointment", "move my appointment"]
    },

    # Insurance Domain
    "verify_insurance": {
        "agent": "insurance",
        "action": "verify_insurance",
        "required_params": ["patient_id"],
        "keywords": ["verify insurance", "check insurance", "insurance status", "is insured", "insurance eligibility", "is my insurance valid", "is my insurance active"]
    },
    "get_coverage": {
        "agent": "insurance",
        "action": "get_coverage",
        "required_params": ["patient_id"],
        "keywords": ["check coverage", "get coverage", "policy coverage", "copay", "insurance coverage", "how much coverage", "how much insurance coverage"]
    },
    "prepare_claim": {
        "agent": "insurance",
        "action": "prepare_claim",
        "required_params": ["patient_id", "bill_id"],
        "keywords": ["prepare claim", "create claim", "draft claim", "build claim", "prepare an insurance claim", "prepare a claim"]
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
        "keywords": ["claim status", "check claim", "claim progress", "view claim", "what is the status of my claim", "what is my claim status"]
    }
}
