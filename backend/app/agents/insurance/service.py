from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
from app.services.mock_db import mock_db
from app.services.mock_insurance import mock_insurance_system

class InsuranceService:
    def verify_insurance(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Action: verify_insurance
        Finds patient's insurance policy and returns active status and eligibility.
        """
        patient_id = payload.get("patient_id")
        if not patient_id:
            raise ValueError("Field 'patient_id' is required for verify_insurance.")

        patient = mock_db.find_one("patients", "patient_id", patient_id)
        if not patient:
            raise ValueError(f"Patient with ID '{patient_id}' not found.")

        policy_id = payload.get("policy_id") or patient.get("insurance_policy_id")
        policy = mock_db.find_one("insurance_policies", "policy_id", policy_id)

        if not policy:
            return {
                "success": False,
                "patient_id": patient_id,
                "eligible": False,
                "status": "NO_POLICY_FOUND",
                "summary": f"No active insurance policy found for patient {patient_id}."
            }

        is_active = policy.get("status") == "ACTIVE"

        return {
            "success": True,
            "patient_id": patient_id,
            "policy_id": policy.get("policy_id"),
            "provider_id": policy.get("provider_id"),
            "policy_number": policy.get("policy_number"),
            "plan_type": policy.get("plan_type"),
            "status": policy.get("status"),
            "eligible": is_active,
            "coverage_amount": policy.get("coverage_amount"),
            "remaining_coverage": policy.get("remaining_coverage"),
            "copay_percentage": policy.get("copay_percentage"),
            "summary": f"Insurance verification for patient {patient_id}: Policy {policy.get('policy_id')} is {policy.get('status')} (Eligible: {is_active})."
        }

    def get_coverage(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Action: get_coverage
        Looks up coverage percentage and copay details for a service type from patient's policy.
        """
        patient_id = payload.get("patient_id")
        service_type = payload.get("service_type", "CONSULTATION")

        if not patient_id:
            raise ValueError("Field 'patient_id' is required for get_coverage.")

        patient = mock_db.find_one("patients", "patient_id", patient_id)
        if not patient:
            raise ValueError(f"Patient with ID '{patient_id}' not found.")

        policy_id = patient.get("insurance_policy_id")
        policy = mock_db.find_one("insurance_policies", "policy_id", policy_id)

        if not policy:
            raise ValueError(f"No insurance policy linked to patient '{patient_id}'.")

        copay_pct = float(policy.get("copay_percentage", 10.0))
        coverage_pct = round(100.0 - copay_pct, 2)
        is_covered = policy.get("status") == "ACTIVE"

        return {
            "success": True,
            "patient_id": patient_id,
            "policy_id": policy_id,
            "service_type": service_type,
            "covered": is_covered,
            "coverage_percentage": coverage_pct,
            "copay_percentage": copay_pct,
            "remaining_coverage": policy.get("remaining_coverage"),
            "summary": f"Coverage for service '{service_type}' under policy {policy_id}: {coverage_pct}% covered ({copay_pct}% copay)."
        }

    def prepare_claim(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Action: prepare_claim
        Builds a structured insurance claim from patient, policy, and bill details.
        """
        patient_id = payload.get("patient_id")
        bill_id = payload.get("bill_id")
        service_type = payload.get("service_type", "CONSULTATION")

        if not patient_id:
            raise ValueError("Field 'patient_id' is required for prepare_claim.")
        if not bill_id:
            raise ValueError("Field 'bill_id' is required for prepare_claim.")

        patient = mock_db.find_one("patients", "patient_id", patient_id)
        if not patient:
            raise ValueError(f"Patient with ID '{patient_id}' not found.")

        bill = mock_db.find_one("bills", "bill_id", bill_id)
        if not bill:
            raise ValueError(f"Bill with ID '{bill_id}' not found.")

        policy_id = patient.get("insurance_policy_id")
        policy = mock_db.find_one("insurance_policies", "policy_id", policy_id)
        if not policy:
            raise ValueError(f"No insurance policy linked to patient '{patient_id}'.")

        claim_id = mock_db.generate_claim_id()
        claim_amount = float(bill.get("total_amount", 0.0))
        provider_id = policy.get("provider_id")

        claim_record = {
            "claim_id": claim_id,
            "patient_id": patient_id,
            "policy_id": policy_id,
            "provider_id": provider_id,
            "bill_id": bill_id,
            "service_type": service_type,
            "claim_amount": claim_amount,
            "approved_amount": 0.0,
            "status": "DRAFT",
            "submitted_date": datetime.now(timezone.utc).isoformat(),
            "processed_date": None,
            "adjudication_notes": "Claim prepared and ready for submission."
        }

        mock_db.add_claim(claim_record)

        return {
            "success": True,
            "claim_id": claim_id,
            "status": "DRAFT",
            "claim": claim_record,
            "summary": f"Prepared claim {claim_id} for bill {bill_id} (Amount: ${claim_amount})."
        }

    def submit_claim(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Action: submit_claim
        Sends claim to Mock Insurance System for adjudication.
        """
        claim_id = payload.get("claim_id")
        if not claim_id:
            raise ValueError("Field 'claim_id' is required for submit_claim.")

        claim = mock_db.find_one("insurance_claims", "claim_id", claim_id)
        if not claim:
            raise ValueError(f"Claim with ID '{claim_id}' not found.")

        policy_id = claim.get("policy_id")
        policy = mock_db.find_one("insurance_policies", "policy_id", policy_id)
        if not policy:
            raise ValueError(f"Insurance policy '{policy_id}' not found for claim '{claim_id}'.")

        adjudication = mock_insurance_system.adjudicate_claim(claim, policy)

        updates = {
            "status": adjudication["status"],
            "approved_amount": adjudication["approved_amount"],
            "processed_date": adjudication["processed_date"],
            "adjudication_notes": adjudication["adjudication_notes"]
        }

        updated_claim = mock_db.update_claim(claim_id, updates)

        return {
            "success": True,
            "claim_id": claim_id,
            "status": adjudication["status"],
            "approved_amount": adjudication["approved_amount"],
            "mock_provider_response": adjudication,
            "claim": updated_claim,
            "summary": f"Submitted claim {claim_id} to Mock Insurance System. Result: {adjudication['status']} (Approved: ${adjudication['approved_amount']})."
        }

    def get_claim_status(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Action: get_claim_status
        Retrieves claim status and adjudication notes by claim_id.
        """
        claim_id = payload.get("claim_id")
        if not claim_id:
            raise ValueError("Field 'claim_id' is required for get_claim_status.")

        claim = mock_db.find_one("insurance_claims", "claim_id", claim_id)
        if not claim:
            raise ValueError(f"Insurance claim with ID '{claim_id}' not found.")

        return {
            "success": True,
            "claim_id": claim_id,
            "status": claim.get("status"),
            "claim_amount": claim.get("claim_amount"),
            "approved_amount": claim.get("approved_amount"),
            "adjudication_notes": claim.get("adjudication_notes"),
            "claim": claim,
            "summary": f"Claim {claim_id} status is {claim.get('status')} (Approved: ${claim.get('approved_amount')})."
        }

insurance_service = InsuranceService()
