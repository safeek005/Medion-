import re
from datetime import datetime, timezone, timedelta
from typing import Dict, Any, List, Tuple, Optional
from app.agents.assistant.intent_registry import ACTION_REGISTRY

DOCTOR_MAPPINGS = {
    "DOC-101": ["doc-101", "rajesh", "mehta", "cardiology", "cardiologist"],
    "DOC-102": ["doc-102", "anita", "deshmukh", "endocrinology", "endocrinologist"],
    "DOC-103": ["doc-103", "suresh", "rao", "general medicine", "internal medicine", "general physician"]
}

PATIENT_MAPPINGS = {
    "PAT-1001": ["pat-1001", "arun", "kumar"],
    "PAT-1002": ["pat-1002", "sneha", "snesha", "sharma"],
    "PAT-1003": ["pat-1003", "vikram", "singh"]
}

class DeterministicParser:
    def parse_relative_date(self, text: str) -> Optional[str]:
        text_lower = text.lower()
        base_date = datetime.now(timezone.utc).date()

        # Check explicit YYYY-MM-DD
        iso_match = re.search(r'\b\d{4}-\d{2}-\d{2}\b', text)
        if iso_match:
            return iso_match.group(0)

        if "today" in text_lower:
            return base_date.isoformat()
        if "tomorrow" in text_lower or "tmrw" in text_lower:
            return (base_date + timedelta(days=1)).isoformat()
        if "day after tomorrow" in text_lower:
            return (base_date + timedelta(days=2)).isoformat()

        days_of_week = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
        current_weekday = base_date.weekday() # 0 = Monday, 6 = Sunday

        for target_idx, day_name in enumerate(days_of_week):
            if day_name in text_lower:
                diff = target_idx - current_weekday
                if diff <= 0:
                    diff += 7
                return (base_date + timedelta(days=diff)).isoformat()

        return None

    def parse_time_slot(self, text: str) -> Optional[str]:
        text_lower = text.lower()
        # 1. First check explicit time slot: 10:00 or 10:00-10:30
        colon_match = re.search(r'\b\d{1,2}:\d{2}(?:-\d{1,2}:\d{2})?\b', text)
        if colon_match:
            return colon_match.group(0)

        # 2. Next check meridian times (10 AM, 2 PM, 10am, etc.)
        meridian_match = re.search(r'\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b', text, re.IGNORECASE)
        if meridian_match:
            hour = int(meridian_match.group(1))
            minute = int(meridian_match.group(2)) if meridian_match.group(2) else 0
            meridian = meridian_match.group(3).lower()

            if meridian == "pm" and hour < 12:
                hour += 12
            elif meridian == "am" and hour == 12:
                hour = 0

            start = f"{hour:02d}:{minute:02d}"
            end_min = minute + 30
            end_hour = hour
            if end_min >= 60:
                end_hour += 1
                end_min -= 60
            return f"{start}-{end_hour:02d}:{end_min:02d}"

        if "morning" in text_lower:
            return "09:00-09:30"
        if "afternoon" in text_lower:
            return "14:00-14:30"

        return None

    def extract_entities(self, text: str) -> Dict[str, Any]:
        """
        Extracts structured healthcare parameters (IDs, names, dates, times) using rules & regex.
        """
        entities: Dict[str, Any] = {}
        text_lower = text.lower()

        # 1. Patient ID / Patient Name
        pat_match = re.findall(r'\bPAT-\d+\b', text, re.IGNORECASE)
        if pat_match:
            entities["patient_id"] = pat_match[0].upper()
        else:
            for pid, aliases in PATIENT_MAPPINGS.items():
                if any(alias in text_lower for alias in aliases):
                    entities["patient_id"] = pid
                    break

        # 2. Doctor ID / Doctor Name
        doc_match = re.findall(r'\bDOC-\d+\b', text, re.IGNORECASE)
        if doc_match:
            entities["doctor_id"] = doc_match[0].upper()
        else:
            for did, aliases in DOCTOR_MAPPINGS.items():
                if any(alias in text_lower for alias in aliases):
                    entities["doctor_id"] = did
                    break

        # 3. Hospital ID
        hosp_match = re.findall(r'\bHOSP-\d+\b', text, re.IGNORECASE)
        if hosp_match:
            entities["hospital_id"] = hosp_match[0].upper()

        # 4. Report ID: LABR-xxxx
        labr_matches = re.findall(r'\bLABR-[\w\-]+\b', text, re.IGNORECASE)
        if len(labr_matches) >= 2:
            entities["current_report_id"] = labr_matches[0].upper()
            entities["previous_report_id"] = labr_matches[1].upper()
            entities["report_id"] = labr_matches[0].upper()
        elif len(labr_matches) == 1:
            entities["report_id"] = labr_matches[0].upper()
        elif "latest" in text_lower and ("lab" in text_lower or "report" in text_lower):
            entities["report_id"] = "LABR-1001"

        # 5. Appointment ID: APT-xxxx
        apt_match = re.findall(r'\bAPT-\d+\b', text, re.IGNORECASE)
        if apt_match:
            entities["appointment_id"] = apt_match[0].upper()

        # 6. Claim ID: CLM-xxxx
        clm_match = re.findall(r'\bCLM-\d+\b', text, re.IGNORECASE)
        if clm_match:
            entities["claim_id"] = clm_match[0].upper()

        # 7. Bill ID: BILL-xxxx
        bill_match = re.findall(r'\bBILL-\d+\b', text, re.IGNORECASE)
        if bill_match:
            entities["bill_id"] = bill_match[0].upper()

        # 8. Policy ID: POL-xxxx
        pol_match = re.findall(r'\bPOL-\d+\b', text, re.IGNORECASE)
        if pol_match:
            entities["policy_id"] = pol_match[0].upper()

        # 9. Dates
        resolved_date = self.parse_relative_date(text)
        if resolved_date:
            entities["date"] = resolved_date
            entities["new_date"] = resolved_date

        # 10. Time slots
        resolved_time = self.parse_time_slot(text)
        if resolved_time:
            entities["time_slot"] = resolved_time
            entities["new_time_slot"] = resolved_time

        # 11. Audience
        if "patient" in text_lower and "audience" not in entities:
            entities["audience"] = "patient"
        elif "doctor" in text_lower:
            entities["audience"] = "doctor"

        # 12. Registration Entity Extraction (Name, Phone, Gender, DOB)
        name_patterns = [
            r'(?:patient\s*name\s*:\s*)([A-Za-z]+(?:\s+[A-Za-z]+)?)',
            r'(?:patient\s*named\s+)([A-Za-z]+(?:\s+[A-Za-z]+)?)',
            r'(?:register|add|create|new)\s+(?:a\s+)?(?:new\s+)?patient\s+([A-Za-z]+(?:\s+[A-Za-z]+)?)',
            r'(?:patient\s+)([A-Za-z]+)'
        ]
        for pat in name_patterns:
            m = re.search(pat, text, re.IGNORECASE)
            if m and m.group(1).lower() not in ["a", "new", "patient", "named", "name"]:
                entities["full_name"] = m.group(1).strip().title()
                entities["first_name"] = m.group(1).strip().split()[0].title()
                break

        phone_match = re.search(r'\b(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b|\b\d{10}\b', text)
        if phone_match:
            entities["phone"] = phone_match.group(0).strip()

        gender_match = re.search(r'\b(male|female|other)\b', text, re.IGNORECASE)
        if gender_match:
            entities["gender"] = gender_match.group(0).capitalize()

        dob_match = re.search(r'\b(\d{1,2})[./-](\d{1,2})[./-](\d{4})\b|\b(\d{4})[./-](\d{1,2})[./-](\d{1,2})\b|\b\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4}\b', text, re.IGNORECASE)
        if dob_match:
            raw_dob = dob_match.group(0).strip()
            dmy = re.match(r'^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$', raw_dob)
            if dmy:
                iso_dob = f"{dmy.group(3)}-{int(dmy.group(2)):02d}-{int(dmy.group(1)):02d}"
            else:
                iso_dob = raw_dob
            entities["dob"] = iso_dob
            entities["date_of_birth"] = iso_dob

        # 13. Search query fallback
        if "search" in text_lower or "find" in text_lower or "lookup" in text_lower:
            if "patient_id" not in entities:
                parts = text.split("for ") if "for " in text else text.split("find ")
                if len(parts) > 1:
                    entities["query"] = parts[-1].strip()

        return entities

    def match_intent(self, text: str) -> Tuple[Optional[str], float, List[str]]:
        """
        Matches text against action keywords and semantic heuristics.
        Returns (matched_intent, confidence, ambiguous_options).
        """
        text_lower = text.lower()
        extracted = self.extract_entities(text)

        # Check for explicitly ambiguous queries (e.g. "Apply insurance")
        if "apply insurance" in text_lower or "use insurance" in text_lower:
            return "verify_insurance", 0.70, ["verify_insurance", "get_coverage", "prepare_claim", "submit_claim", "get_claim_status"]

        # Action-specific heuristics take precedence over single-word keyword collisions
        # Appointments
        if any(w in text_lower for w in ["cancel", "drop", "revoke"]) and ("appointment" in text_lower or "apt-" in text_lower):
            return "cancel_appointment", 0.95, []

        if any(w in text_lower for w in ["reschedule", "move", "postpone", "change date"]) and ("appointment" in text_lower or "apt-" in text_lower or "friday" in text_lower):
            return "reschedule_appointment", 0.95, []

        if any(w in text_lower for w in ["show my appointment", "appointment details", "view appointment", "get appointment"]) or (re.search(r'\bAPT-\d+\b', text, re.I) and not any(w in text_lower for w in ["cancel", "reschedule", "move"])):
            return "get_appointment", 0.95, []

        if any(w in text_lower for w in ["book", "schedule", "reserve", "want to see", "can you book"]):
            return "book_appointment", 0.95, []

        if any(w in text_lower for w in ["available", "slots", "availability", "when can i meet", "when can i see", "when is dr", "free tomorrow"]):
            return "get_available_slots", 0.95, []

        # Medical
        if any(w in text_lower for w in ["explain", "simple language", "simply", "patient-friendly"]):
            return "explain_lab_report", 0.95, []

        if any(w in text_lower for w in ["compare", "comparison", "trend", "versus", "vs"]):
            return "compare_lab_reports", 0.95, []

        if any(w in text_lower for w in ["medical summary", "summary of my medical", "clinical summary", "summarize my reports"]):
            return "get_medical_summary", 0.95, []

        if any(w in text_lower for w in ["extract", "parse lab", "test parameters"]):
            return "extract_lab_report", 0.95, []

        if any(w in text_lower for w in ["analyze", "abnormal", "blood report", "lab report", "findings", "metabolic panel", "lipid"]):
            return "analyze_lab_report", 0.95, []

        # Insurance
        if any(w in text_lower for w in ["how much coverage", "coverage do i have", "copay", "coverage limit"]):
            return "get_coverage", 0.95, []

        if any(w in text_lower for w in ["prepare claim", "prepare a claim", "draft claim", "create claim"]):
            return "prepare_claim", 0.95, []

        if any(w in text_lower for w in ["submit claim", "file claim", "process claim"]):
            return "submit_claim", 0.95, []

        if any(w in text_lower for w in ["claim status", "status of my claim", "status of claim", "track claim"]) or re.search(r'\bCLM-\d+\b', text, re.I):
            return "get_claim_status", 0.95, []

        if any(w in text_lower for w in ["is my insurance valid", "is my insurance active", "verify insurance", "insurance eligibility", "is insured"]):
            return "verify_insurance", 0.95, []

        # Patient
        if any(w in text_lower for w in ["medical history", "patient history", "full history", "clinical history"]):
            return "get_patient_history", 0.95, []

        if any(w in text_lower for w in ["find", "search", "lookup"]) and any(w in text_lower for w in ["patient", "arun", "sneha", "vikram"]):
            return "search_patient", 0.95, []

        if any(w in text_lower for w in ["register", "new patient", "sign up patient"]):
            return "register_patient", 0.95, []

        if any(w in text_lower for w in ["update patient", "modify patient"]):
            return "update_patient", 0.95, []

        if any(w in text_lower for w in ["profile", "show patient", "get patient"]) or re.search(r'\bPAT-\d+\b', text, re.I):
            return "get_patient", 0.90, []

        # Keyword matching fallback from ACTION_REGISTRY
        matches = []
        for intent_name, info in ACTION_REGISTRY.items():
            for kw in info["keywords"]:
                if kw in text_lower:
                    matches.append((intent_name, len(kw)))
                    break

        if matches:
            matches.sort(key=lambda x: x[1], reverse=True)
            best_intent = matches[0][0]
            ambiguous = [m[0] for m in matches if m[0] != best_intent] if len(matches) > 1 and matches[0][1] == matches[1][1] else []
            return best_intent, 0.95 if not ambiguous else 0.70, ambiguous

        return None, 0.0, []

deterministic_parser = DeterministicParser()
