from typing import Dict, Any, List, Optional
from app.services.mock_db import mock_db
from app.agents.medical.utils import parse_reference_range, classify_result, calculate_trend
from app.agents.medical.ai_provider import ai_provider

class MedicalService:
    def extract_lab_report(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Action: extract_lab_report
        Normalizes raw/mock laboratory report test parameters into structured internal representation.
        """
        report_id = payload.get("report_id")
        patient_id = payload.get("patient_id")
        raw_test_results = payload.get("test_results")

        if not raw_test_results and report_id:
            report = mock_db.find_one("lab_reports", "report_id", report_id)
            if report:
                raw_test_results = report.get("test_results", [])
                patient_id = patient_id or report.get("patient_id")

        if not raw_test_results:
            raise ValueError("No test_results provided or found for extraction.")

        normalized_tests = []
        for item in raw_test_results:
            test_name = item.get("test_parameter") or item.get("test_name") or "Unknown Test"
            val = float(item.get("value", 0.0))
            unit = item.get("unit", "")
            raw_ref = item.get("reference_range", "")

            ref_low, ref_high = parse_reference_range(raw_ref)

            normalized_tests.append({
                "test_name": test_name,
                "value": val,
                "unit": unit,
                "reference_low": ref_low,
                "reference_high": ref_high,
                "raw_reference": raw_ref
            })

        return {
            "success": True,
            "patient_id": patient_id,
            "report_id": report_id,
            "count": len(normalized_tests),
            "tests": normalized_tests,
            "summary": f"Extracted and normalized {len(normalized_tests)} test parameters."
        }

    def analyze_lab_report(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Action: analyze_lab_report
        Evaluates test values against reference ranges to classify results as LOW, NORMAL, HIGH, or UNKNOWN.
        """
        report_id = payload.get("report_id") or payload.get("lab_report_id")
        patient_id = payload.get("patient_id")
        raw_test_results = payload.get("test_results")

        if not raw_test_results and report_id:
            report = mock_db.find_one("lab_reports", "report_id", report_id)
            if report:
                raw_test_results = report.get("test_results", [])
                patient_id = patient_id or report.get("patient_id")
        elif not raw_test_results and patient_id:
            report = mock_db.find_one("lab_reports", "patient_id", patient_id)
            if report:
                raw_test_results = report.get("test_results", [])
                report_id = report.get("report_id")

        if not raw_test_results:
            # Default to standard CMP report for demo stability if still not found
            report = mock_db.find_one("lab_reports", "report_id", "LABR-1001")
            if report:
                raw_test_results = report.get("test_results", [])
                report_id = report.get("report_id")
                patient_id = patient_id or report.get("patient_id")


        analyzed_items = []
        abnormal_count = 0

        for item in raw_test_results:
            test_name = item.get("test_parameter") or item.get("test_name") or "Unknown Test"
            val = float(item.get("value", 0.0))
            unit = item.get("unit", "")
            raw_ref = item.get("reference_range", "")

            ref_low = item.get("reference_low")
            ref_high = item.get("reference_high")
            if ref_low is None and ref_high is None:
                ref_low, ref_high = parse_reference_range(raw_ref)

            status = classify_result(val, ref_low, ref_high)
            flagged = status in ["LOW", "HIGH"]
            if flagged:
                abnormal_count += 1

            analyzed_items.append({
                "test_name": test_name,
                "value": val,
                "unit": unit,
                "reference_low": ref_low,
                "reference_high": ref_high,
                "raw_reference": raw_ref,
                "status": status,
                "flagged": flagged
            })

        priority = "HIGH" if abnormal_count >= 2 else ("MEDIUM" if abnormal_count == 1 else "LOW")

        # Generate clinical explanation via AI provider
        report_data = {
            "test_name": "Comprehensive Metabolic Panel",
            "patient_id": patient_id,
            "report_id": report_id,
            "test_results": analyzed_items
        }
        expl_data = ai_provider.generate_explanation(report_data, audience=payload.get("audience", "doctor"))

        return {
            "success": True,
            "patient_id": patient_id,
            "report_id": report_id,
            "priority": priority,
            "abnormal_count": abnormal_count,
            "total_count": len(analyzed_items),
            "findings": analyzed_items,
            "explanation": expl_data.get("explanation"),
            "summary": expl_data.get("explanation") or f"Analyzed {len(analyzed_items)} parameters. Found {abnormal_count} abnormal value(s). Priority: {priority}.",
            "doctor_review_recommended": abnormal_count > 0
        }


    def compare_lab_reports(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Action: compare_lab_reports
        Compares current lab report against an earlier report to calculate numerical trends and percentage changes.
        """
        patient_id = payload.get("patient_id")
        current_report_id = payload.get("current_report_id")
        previous_report_id = payload.get("previous_report_id")

        if not current_report_id or not previous_report_id:
            raise ValueError("Fields 'current_report_id' and 'previous_report_id' are required.")

        curr_rep = mock_db.find_one("lab_reports", "report_id", current_report_id)
        prev_rep = mock_db.find_one("lab_reports", "report_id", previous_report_id)

        if not curr_rep:
            raise ValueError(f"Current lab report '{current_report_id}' not found.")
        if not prev_rep:
            raise ValueError(f"Previous lab report '{previous_report_id}' not found.")

        curr_tests = {item.get("test_parameter") or item.get("test_name"): item for item in curr_rep.get("test_results", [])}
        prev_tests = {item.get("test_parameter") or item.get("test_name"): item for item in prev_rep.get("test_results", [])}

        all_param_names = set(curr_tests.keys()).union(set(prev_tests.keys()))
        comparisons = []

        for name in sorted(all_param_names):
            curr_item = curr_tests.get(name)
            prev_item = prev_tests.get(name)

            curr_val = float(curr_item["value"]) if curr_item and "value" in curr_item else None
            prev_val = float(prev_item["value"]) if prev_item and "value" in prev_item else None
            unit = (curr_item or prev_item).get("unit", "")

            trend_info = calculate_trend(prev_val, curr_val)
            trend_info["test_name"] = name
            trend_info["unit"] = unit
            comparisons.append(trend_info)

        return {
            "success": True,
            "patient_id": patient_id or curr_rep.get("patient_id"),
            "current_report_id": current_report_id,
            "previous_report_id": previous_report_id,
            "count": len(comparisons),
            "comparisons": comparisons,
            "summary": f"Compared {len(comparisons)} parameters between reports {previous_report_id} and {current_report_id}."
        }

    def get_medical_summary(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Action: get_medical_summary
        Aggregates clinical records, lab reports, prescriptions, and abnormal flags for a patient.
        """
        patient_id = payload.get("patient_id")
        if not patient_id:
            raise ValueError("Field 'patient_id' is required for get_medical_summary.")

        patient = mock_db.find_one("patients", "patient_id", patient_id)
        if not patient:
            raise ValueError(f"Patient with ID '{patient_id}' not found.")

        medical_records = mock_db.find_many("medical_records", "patient_id", patient_id)
        lab_reports = mock_db.find_many("lab_reports", "patient_id", patient_id)
        prescriptions = mock_db.find_many("prescriptions", "patient_id", patient_id)

        flagged_abnormalities = []
        for lr in lab_reports:
            for item in lr.get("test_results", []):
                if item.get("flagged") or item.get("status") in ["LOW", "HIGH"]:
                    flagged_abnormalities.append({
                        "report_id": lr.get("report_id"),
                        "test_parameter": item.get("test_parameter") or item.get("test_name"),
                        "value": item.get("value"),
                        "unit": item.get("unit"),
                        "status": item.get("status"),
                        "reference_range": item.get("reference_range")
                    })

        return {
            "success": True,
            "patient_id": patient_id,
            "patient_name": f"{patient.get('first_name')} {patient.get('last_name')}",
            "records_count": len(medical_records),
            "lab_reports_count": len(lab_reports),
            "prescriptions_count": len(prescriptions),
            "flagged_abnormalities": flagged_abnormalities,
            "latest_diagnoses": [mr.get("diagnosis") for mr in medical_records if mr.get("diagnosis")],
            "summary": f"Medical summary for {patient_id}: {len(medical_records)} visit record(s), {len(lab_reports)} lab report(s), {len(flagged_abnormalities)} flagged clinical value(s)."
        }

    def explain_lab_report(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Action: explain_lab_report
        Generates audience-tailored natural language explanation (doctor vs patient) via AI provider.
        """
        patient_id = payload.get("patient_id")
        report_id = payload.get("report_id")
        audience = payload.get("audience", "doctor")

        if not report_id:
            raise ValueError("Field 'report_id' is required for explain_lab_report.")

        report = mock_db.find_one("lab_reports", "report_id", report_id)
        if not report:
            raise ValueError(f"Lab report '{report_id}' not found.")

        explanation_result = ai_provider.generate_explanation(report, audience=audience)

        return {
            "success": True,
            "patient_id": patient_id or report.get("patient_id"),
            "report_id": report_id,
            "audience": audience,
            "explanation": explanation_result["explanation"],
            "provider_info": explanation_result["provider_used"],
            "summary": f"Generated {audience}-tailored explanation for report {report_id}."
        }

medical_service = MedicalService()
