import re
from typing import Dict, Any, List, Tuple
from app.agents.assistant.intent_registry import ACTION_REGISTRY

class DeterministicParser:
    def extract_entities(self, text: str) -> Dict[str, Any]:
        """
        Extracts structured healthcare parameters (IDs, dates, times, audiences) using regex.
        """
        entities: Dict[str, Any] = {}

        # Patient ID: PAT-xxxx
        pat_match = re.findall(r'\bPAT-\d+\b', text, re.IGNORECASE)
        if pat_match:
            entities["patient_id"] = pat_match[0].upper()

        # Doctor ID: DOC-xxxx
        doc_match = re.findall(r'\bDOC-\d+\b', text, re.IGNORECASE)
        if doc_match:
            entities["doctor_id"] = doc_match[0].upper()

        # Hospital ID: HOSP-xxxx
        hosp_match = re.findall(r'\bHOSP-\d+\b', text, re.IGNORECASE)
        if hosp_match:
            entities["hospital_id"] = hosp_match[0].upper()

        # Report ID: LABR-xxxx
        labr_matches = re.findall(r'\bLABR-[\w\-]+\b', text, re.IGNORECASE)
        if len(labr_matches) >= 2:
            entities["current_report_id"] = labr_matches[0].upper()
            entities["previous_report_id"] = labr_matches[1].upper()
            entities["report_id"] = labr_matches[0].upper()
        elif len(labr_matches) == 1:
            entities["report_id"] = labr_matches[0].upper()

        # Appointment ID: APT-xxxx
        apt_match = re.findall(r'\bAPT-\d+\b', text, re.IGNORECASE)
        if apt_match:
            entities["appointment_id"] = apt_match[0].upper()

        # Claim ID: CLM-xxxx
        clm_match = re.findall(r'\bCLM-\d+\b', text, re.IGNORECASE)
        if clm_match:
            entities["claim_id"] = clm_match[0].upper()

        # Bill ID: BILL-xxxx
        bill_match = re.findall(r'\bBILL-\d+\b', text, re.IGNORECASE)
        if bill_match:
            entities["bill_id"] = bill_match[0].upper()

        # Policy ID: POL-xxxx
        pol_match = re.findall(r'\bPOL-\d+\b', text, re.IGNORECASE)
        if pol_match:
            entities["policy_id"] = pol_match[0].upper()

        # Dates: YYYY-MM-DD
        date_match = re.findall(r'\b\d{4}-\d{2}-\d{2}\b', text)
        if date_match:
            entities["date"] = date_match[0]
            entities["new_date"] = date_match[0]

        # Time slots: 10:00 or 10:00-10:30
        time_match = re.findall(r'\b\d{1,2}:\d{2}(?:-\d{1,2}:\d{2})?\b', text)
        if time_match:
            entities["time_slot"] = time_match[0]
            entities["new_time_slot"] = time_match[0]

        # Audience: doctor vs patient
        if "patient" in text.lower() and "audience" not in entities:
            entities["audience"] = "patient"
        elif "doctor" in text.lower():
            entities["audience"] = "doctor"

        # Search query fallback if searching without explicit ID
        if "search" in text.lower() or "find" in text.lower() or "lookup" in text.lower():
            # If no PAT-xxxx ID found, use query phrase
            if "patient_id" not in entities:
                parts = text.split("for ") if "for " in text else text.split("search ")
                if len(parts) > 1:
                    entities["query"] = parts[-1].strip()

        return entities

    def match_intent(self, text: str) -> Tuple[Optional[str], float, List[str]]:
        """
        Matches text against keyword patterns and extracted entity IDs.
        Returns (matched_intent, confidence, ambiguous_options).
        """
        text_lower = text.lower()
        extracted = self.extract_entities(text)
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

        # Entity-guided fallbacks if exact keyword phrase not found
        if "patient_id" in extracted:
            if "history" in text_lower:
                return "get_patient_history", 0.90, []
            elif "insurance" in text_lower or "insured" in text_lower or "verify" in text_lower:
                return "verify_insurance", 0.90, []
            elif "coverage" in text_lower or "copay" in text_lower:
                return "get_coverage", 0.90, []
            elif "analyze" in text_lower or "check lab" in text_lower:
                return "analyze_lab_report", 0.90, []
            elif "explain" in text_lower:
                return "explain_lab_report", 0.90, []
            elif "book" in text_lower or "appointment" in text_lower:
                return "book_appointment", 0.90, []
            elif "claim" in text_lower and "prepare" in text_lower:
                return "prepare_claim", 0.90, []
            else:
                return "get_patient", 0.85, []

        if "report_id" in extracted or "current_report_id" in extracted:
            if "previous_report_id" in extracted or "compare" in text_lower:
                return "compare_lab_reports", 0.90, []
            elif "explain" in text_lower:
                return "explain_lab_report", 0.90, []
            elif "extract" in text_lower:
                return "extract_lab_report", 0.90, []
            else:
                return "analyze_lab_report", 0.90, []

        if "doctor_id" in extracted:
            if "book" in text_lower or "schedule" in text_lower:
                return "book_appointment", 0.90, []
            else:
                return "get_available_slots", 0.90, []

        if "appointment_id" in extracted:
            if "cancel" in text_lower:
                return "cancel_appointment", 0.90, []
            elif "reschedule" in text_lower or "move" in text_lower or "change" in text_lower:
                return "reschedule_appointment", 0.90, []
            else:
                return "get_appointment", 0.90, []

        if "claim_id" in extracted:
            if "submit" in text_lower or "file" in text_lower:
                return "submit_claim", 0.90, []
            else:
                return "get_claim_status", 0.90, []

        if "bill_id" in extracted:
            return "prepare_claim", 0.90, []

        # Generic keyword fallbacks
        if "lab" in text_lower or "blood test" in text_lower or "report" in text_lower:
            if "explain" in text_lower:
                return "explain_lab_report", 0.85, []
            elif "compare" in text_lower:
                return "compare_lab_reports", 0.85, []
            elif "extract" in text_lower:
                return "extract_lab_report", 0.85, []
            else:
                return "analyze_lab_report", 0.80, []

        if "appointment" in text_lower or "slot" in text_lower or "doctor" in text_lower:
            if "book" in text_lower or "schedule" in text_lower:
                return "book_appointment", 0.85, []
            elif "cancel" in text_lower:
                return "cancel_appointment", 0.85, []
            elif "move" in text_lower or "reschedule" in text_lower:
                return "reschedule_appointment", 0.85, []
            elif "available" in text_lower or "free" in text_lower or "open" in text_lower:
                return "get_available_slots", 0.85, []

        if "insurance" in text_lower or "claim" in text_lower or "coverage" in text_lower:
            if "verify" in text_lower or ("status" in text_lower and "claim" not in text_lower):
                return "verify_insurance", 0.85, []
            elif "coverage" in text_lower or "copay" in text_lower:
                return "get_coverage", 0.85, []
            elif "prepare" in text_lower or "create" in text_lower:
                return "prepare_claim", 0.85, []
            elif "submit" in text_lower or "file" in text_lower:
                return "submit_claim", 0.85, []
            elif "claim" in text_lower:
                return "get_claim_status", 0.80, []

        if "patient" in text_lower or "history" in text_lower:
            if "history" in text_lower:
                return "get_patient_history", 0.85, []
            elif "register" in text_lower or "new" in text_lower:
                return "register_patient", 0.85, []
            elif "search" in text_lower or "find" in text_lower:
                return "search_patient", 0.85, []
            else:
                return "get_patient", 0.80, []

        return None, 0.0, []

deterministic_parser = DeterministicParser()
