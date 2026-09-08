import re
from datetime import datetime, timezone, timedelta
from typing import Dict, Any, List, Tuple, Optional
from app.agents.assistant.intent_registry import ACTION_REGISTRY

DOCTOR_PATTERNS = [
    ("DOC-101", [
        r'\bdoc-101\b',
        r'\bdr\.?\s*rajesh(?:\s+mehta)?\b',
        r'\bdr\.?\s*mehta\b',
        r'\brajesh\s+mehta\b',
        r'\brajesh\b',
        r'\bcardiolog(?:y|ist)\b'
    ]),
    ("DOC-102", [
        r'\bdoc-102\b',
        r'\bdr\.?\s*anita(?:\s+deshmukh)?\b',
        r'\bdr\.?\s*deshmukh\b',
        r'\banita\s+deshmukh\b',
        r'\banita\b',
        r'\bendocrinolog(?:y|ist)\b'
    ]),
    ("DOC-103", [
        r'\bdoc-103\b',
        r'\bdr\.?\s*suresh(?:\s+rao)?\b',
        r'\bdr\.?\s*rao\b',
        r'\bsuresh\s+rao\b',
        r'\bsuresh\b',
        r'\bgeneral\s+(?:medicine|physician)\b',
        r'\binternal\s+medicine\b'
    ])
]

PATIENT_MAPPINGS = {
    "PAT-1001": ["pat-1001", "arun kumar", "arun"],
    "PAT-1002": ["pat-1002", "sneha sharma", "sneha", "snesha"],
    "PAT-1003": ["pat-1003", "vikram singh", "vikram"]
}

class DeterministicParser:
    def parse_relative_date(self, text: str) -> Optional[str]:
        text_lower = text.lower()
        base_date = datetime.now(timezone.utc).date()

        # Check explicit YYYY-MM-DD
        iso_match = re.search(r'\b(\d{4})-(\d{2})-(\d{2})\b', text)
        if iso_match:
            return iso_match.group(0)

        # Check explicit DD.MM.YYYY or DD/MM/YYYY or DD-MM-YYYY
        dmy_match = re.search(r'\b(\d{1,2})[./-](\d{1,2})[./-](\d{4})\b', text)
        if dmy_match and int(dmy_match.group(3)) >= base_date.year:
            return f"{dmy_match.group(3)}-{int(dmy_match.group(2)):02d}-{int(dmy_match.group(1)):02d}"

        if "today" in text_lower:
            return base_date.isoformat()
        if "day after tomorrow" in text_lower:
            return (base_date + timedelta(days=2)).isoformat()
        if "tomorrow" in text_lower or "tmrw" in text_lower:
            return (base_date + timedelta(days=1)).isoformat()

        days_of_week = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
        current_weekday = base_date.weekday()

        for target_idx, day_name in enumerate(days_of_week):
            if day_name in text_lower:
                diff = target_idx - current_weekday
                if diff <= 0:
                    diff += 7
                if "next " + day_name in text_lower and diff < 7:
                    diff += 7
                return (base_date + timedelta(days=diff)).isoformat()

        return None

    def parse_time_slot(self, text: str) -> Optional[str]:
        text_lower = text.lower()
        colon_match = re.search(r'\b\d{1,2}:\d{2}(?:-\d{1,2}:\d{2})?\b', text)
        if colon_match:
            return colon_match.group(0)

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
        if "evening" in text_lower:
            return "17:00-17:30"

        return None

    def extract_entities(self, text: str, context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Extracts structured healthcare parameters (IDs, names, dates, times) using rules & regex.
        Uses anti-collision logic to prevent patient names (e.g. 'Mehta Sharma') from matching doctors.
        """
        entities: Dict[str, Any] = {}
        text_lower = text.lower()

        # 1. Registration Intent and Patient Name extraction FIRST to prevent doctor collisions
        is_registration = bool(re.search(r'\b(register|sign\s*up|new\s+patient|add\s+patient|create\s+patient)\b', text, re.I))

        name_patterns = [
            r'(?:patient\s*name\s*:\s*)([A-Za-z]+(?:\s+[A-Za-z]+)?)',
            r'(?:patient\s*named\s+)([A-Za-z]+(?:\s+[A-Za-z]+)?)',
            r'(?:register|add|create|new)\s+(?:a\s+)?(?:new\s+)?patient\s+([A-Za-z]+(?:\s+[A-Za-z]+)?)',
            r'(?:register|add|create)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)'
        ]

        extracted_patient_name = None
        for pat in name_patterns:
            m = re.search(pat, text, re.IGNORECASE)
            if m:
                cand = m.group(1).strip()
                if cand.lower() not in ["a", "new", "patient", "named", "name", "an", "me", "my"]:
                    entities["full_name"] = cand.title()
                    parts = cand.title().split()
                    entities["first_name"] = parts[0]
                    if len(parts) > 1:
                        entities["last_name"] = " ".join(parts[1:])
                    extracted_patient_name = cand.lower()
                    break

        # 2. Patient ID / Patient aliases / Update targets / Book for targets
        book_for_match = re.search(r'\b(?:book|schedule)\s+(?:an?\s+appointment\s+)?(?:for\s+)?(?:patient\s+)?([A-Za-z]+)\s+with\b', text, re.I)
        if book_for_match and not is_registration:
            cand = book_for_match.group(1).strip()
            if cand.lower() not in ["me", "an", "the", "a", "appointment", "doctor", "us"]:
                entities["name"] = cand.title()
                entities["full_name"] = cand.title()
                entities["patient_id"] = cand.title()

        update_name_match = re.search(r'(?:update|modify|change)\s+([A-Za-z]+)(?:\'s)?\s+(?:phone|number|contact|address|details)?', text, re.I)
        if update_name_match and not is_registration:
            cand = update_name_match.group(1).strip()
            if cand.lower() not in ["patient", "the", "a", "my", "our", "an"]:
                entities["name"] = cand.title()
                entities["full_name"] = cand.title()
                entities["patient_id"] = cand.title()

        pat_match = re.findall(r'\bPAT-\d+\b', text, re.IGNORECASE)
        if pat_match:
            entities["patient_id"] = pat_match[0].upper()
        elif not is_registration and "patient_id" not in entities:
            for pid, aliases in PATIENT_MAPPINGS.items():
                if any(re.search(r'\b' + re.escape(alias) + r'\b', text_lower) for alias in aliases):
                    entities["patient_id"] = pid
                    break

        # 3. Doctor ID / Doctor Name (with Anti-Collision check)
        doc_match = re.findall(r'\bDOC-\d+\b', text, re.IGNORECASE)
        if doc_match:
            entities["doctor_id"] = doc_match[0].upper()
        else:
            for doc_id, regex_list in DOCTOR_PATTERNS:
                matched_doc = False
                for rgx in regex_list:
                    m = re.search(rgx, text_lower)
                    if m:
                        matched_str = m.group(0)
                        if extracted_patient_name and matched_str in extracted_patient_name and not ("dr" in matched_str or "doc-" in matched_str):
                            continue
                        matched_doc = True
                        break
                if matched_doc:
                    entities["doctor_id"] = doc_id
                    break

        # 4. Hospital ID
        hosp_match = re.findall(r'\bHOSP-\d+\b', text, re.IGNORECASE)
        if hosp_match:
            entities["hospital_id"] = hosp_match[0].upper()
        else:
            entities["hospital_id"] = "HOSP-001"

        # 5. Report ID: LABR-xxxx
        labr_matches = re.findall(r'\bLABR-[\w\-]+\b', text, re.IGNORECASE)
        if len(labr_matches) >= 2:
            entities["current_report_id"] = labr_matches[0].upper()
            entities["previous_report_id"] = labr_matches[1].upper()
            entities["report_id"] = labr_matches[0].upper()
        elif len(labr_matches) == 1:
            entities["report_id"] = labr_matches[0].upper()
        elif "latest" in text_lower and ("lab" in text_lower or "report" in text_lower):
            entities["report_id"] = "LABR-1001"

        # 6. Appointment ID: APT-xxxx
        apt_match = re.findall(r'\bAPT-\d+\b', text, re.IGNORECASE)
        if apt_match:
            entities["appointment_id"] = apt_match[0].upper()

        # 7. Claim ID: CLM-xxxx
        clm_match = re.findall(r'\bCLM-\d+\b', text, re.IGNORECASE)
        if clm_match:
            entities["claim_id"] = clm_match[0].upper()

        # 8. Bill ID: BILL-xxxx
        bill_match = re.findall(r'\bBILL-\d+\b', text, re.IGNORECASE)
        if bill_match:
            entities["bill_id"] = bill_match[0].upper()

        # 9. Policy ID: POL-xxxx
        pol_match = re.findall(r'\bPOL-\d+\b', text, re.IGNORECASE)
        if pol_match:
            entities["policy_id"] = pol_match[0].upper()

        # 10. Dates
        resolved_date = self.parse_relative_date(text)
        if resolved_date:
            entities["date"] = resolved_date
            entities["appointment_date"] = resolved_date
            entities["new_date"] = resolved_date

        # 11. Time slots
        resolved_time = self.parse_time_slot(text)
        if resolved_time:
            entities["time_slot"] = resolved_time
            entities["new_time_slot"] = resolved_time

        # 12. Audience
        if "patient" in text_lower and "audience" not in entities:
            entities["audience"] = "patient"
        elif "doctor" in text_lower:
            entities["audience"] = "doctor"

        # 13. Registration specifics: Phone, Gender, DOB
        phone_match = re.search(r'\b(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b|\b\d{10}\b', text)
        if phone_match:
            entities["phone"] = phone_match.group(0).strip()
            entities["contact_number"] = entities["phone"]

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

        # 14. Search query extraction
        if any(w in text_lower for w in ["search", "find", "lookup"]):
            for prefix in ["find patient ", "search patient ", "lookup patient ", "search for ", "find ", "search ", "lookup "]:
                if prefix in text_lower:
                    cand = text[text_lower.index(prefix) + len(prefix):].strip()
                    if cand:
                        entities["query"] = cand
                        entities["name"] = cand
                        break

        # 15. Merge context if multi-turn slot filling
        if context:
            pending_action = context.get("pending_action") or context.get("awaiting_action") or context.get("action")
            collected = context.get("collected_entities") or context.get("collected_data") or {}
            for k, v in collected.items():
                if k not in entities or not entities[k]:
                    entities[k] = v

            if pending_action == "register_patient":
                cleaned = text.strip()
                if "gender" not in entities and cleaned.lower() in ["male", "female", "other"]:
                    entities["gender"] = cleaned.capitalize()
                if ("phone" not in entities or not entities["phone"]) and re.match(r'^\d{10}$', cleaned):
                    entities["phone"] = cleaned
                    entities["contact_number"] = cleaned
                if ("dob" not in entities or not entities["dob"]) and re.match(r'^\d{1,2}[./-]\d{1,2}[./-]\d{4}$', cleaned):
                    dmy = re.match(r'^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$', cleaned)
                    if dmy:
                        entities["dob"] = f"{dmy.group(3)}-{int(dmy.group(2)):02d}-{int(dmy.group(1)):02d}"
                        entities["date_of_birth"] = entities["dob"]

        return entities

    def match_intent(self, text: str, context: Optional[Dict[str, Any]] = None) -> Tuple[Optional[str], float, List[str]]:
        """
        Matches text against action keywords and semantic heuristics.
        Considers conversation state for multi-turn continuations.
        Returns (matched_intent, confidence, ambiguous_options).
        """
        text_lower = text.lower().strip()
        extracted = self.extract_entities(text, context=context)

        # Check multi-turn continuation FIRST
        if context:
            pending_action = context.get("pending_action") or context.get("awaiting_action") or context.get("action")
            if pending_action and pending_action in ACTION_REGISTRY:
                req_params = ACTION_REGISTRY[pending_action]["required_params"]
                has_any_slot = any(k in extracted and extracted[k] for k in req_params)
                is_new_command = any(
                    kw in text_lower for kw in [
                        "book an appointment", "cancel appointment", "verify insurance",
                        "analyze report", "find patient", "when is dr", "medical summary"
                    ]
                )
                if has_any_slot and not is_new_command:
                    return pending_action, 0.95, []

        # Check for explicitly ambiguous queries (e.g. "Apply insurance")
        if "apply insurance" in text_lower or "use insurance" in text_lower:
            return "verify_insurance", 0.70, ["verify_insurance", "get_coverage", "prepare_claim", "submit_claim", "get_claim_status"]

        # Patient Registration has HIGHEST precedence to prevent name collision with doctor names
        if any(w in text_lower for w in ["register", "new patient", "sign up patient", "create patient", "add patient"]):
            return "register_patient", 0.95, []

        # Appointments
        if any(w in text_lower for w in ["cancel", "drop", "revoke"]) and any(w in text_lower for w in ["appointment", "apt-", "slot"]):
            return "cancel_appointment", 0.95, []

        if any(w in text_lower for w in ["reschedule", "move", "postpone", "change date"]) and any(w in text_lower for w in ["appointment", "apt-", "friday", "tomorrow", "slot", "date"]):
            return "reschedule_appointment", 0.95, []

        if any(w in text_lower for w in ["show my appointment", "appointment details", "view appointment", "get appointment", "my appointment details"]):
            return "get_appointment", 0.95, []

        if any(w in text_lower for w in ["book", "schedule", "reserve", "want to see", "can you book", "get me an appointment", "make an appointment"]):
            return "book_appointment", 0.95, []

        if any(w in text_lower for w in ["available", "slots", "availability", "when can i meet", "when can i see", "when is dr", "is dr", "free on", "free tomorrow", "check slots", "open slots", "is free"]):
            return "get_available_slots", 0.95, []

        # Medical / Lab
        if any(w in text_lower for w in ["explain", "simple language", "simply", "patient-friendly"]):
            return "explain_lab_report", 0.95, []

        if any(w in text_lower for w in ["compare", "comparison", "trend", "versus", "vs"]):
            return "compare_lab_reports", 0.95, []

        if any(w in text_lower for w in ["medical summary", "summary of my medical", "clinical summary", "summarize my reports", "summarize patient", "clinical brief"]):
            return "get_medical_summary", 0.95, []

        if any(w in text_lower for w in ["extract", "parse lab", "test parameters"]):
            return "extract_lab_report", 0.95, []

        if any(w in text_lower for w in ["analyze", "abnormal", "blood report", "blood test", "lab report", "lab test", "findings", "metabolic panel", "lipid", "check what's wrong", "check what is wrong", "look abnormal", "looks weird"]):
            return "analyze_lab_report", 0.95, []

        # Insurance
        if any(w in text_lower for w in ["how much coverage", "coverage do i have", "copay", "coverage limit", "actually cover", "does my insurance cover", "what does my insurance cover"]):
            return "get_coverage", 0.95, []

        if any(w in text_lower for w in ["prepare claim", "prepare a claim", "prepare an insurance claim", "draft claim", "create claim"]):
            return "prepare_claim", 0.95, []

        if any(w in text_lower for w in ["submit claim", "file claim", "process claim", "send claim"]):
            return "submit_claim", 0.95, []

        if any(w in text_lower for w in ["claim status", "status of my claim", "status of claim", "track claim"]) or re.search(r'\bCLM-\d+\b', text, re.I):
            return "get_claim_status", 0.95, []

        if any(w in text_lower for w in ["is my insurance valid", "is my insurance active", "verify insurance", "insurance eligibility", "is insured", "going on with my insurance"]):
            return "verify_insurance", 0.95, []

        # Patient Domain
        if any(w in text_lower for w in ["medical history", "patient history", "full history", "clinical history"]):
            return "get_patient_history", 0.95, []

        if (any(w in text_lower for w in ["update", "modify"]) and any(f in text_lower for f in ["phone", "number", "address", "contact", "details", "email", "patient", "profile", "safeek", "pat-"])) or any(w in text_lower for w in ["update patient", "modify patient", "update phone", "change address"]):
            return "update_patient", 0.95, []

        # Explicit Patient ID in text targets get_patient
        if re.search(r'\bPAT-\d+\b', text, re.I):
            return "get_patient", 0.95, []

        if any(w in text_lower for w in ["find", "search", "lookup"]):
            return "search_patient", 0.95, []

        if any(w in text_lower for w in ["profile", "show patient", "get patient", "show arun", "show sneha"]):
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
