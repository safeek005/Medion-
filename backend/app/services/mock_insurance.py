from typing import Dict, Any
from datetime import datetime, timezone

class MockInsuranceService:
    """
    Simulated external Insurance Payer System.
    Note: External System Simulation, NOT a core agent!
    """
    def adjudicate_claim(self, claim_data: Dict[str, Any], policy_data: Dict[str, Any]) -> Dict[str, Any]:
        claim_amount = float(claim_data.get("claim_amount", 0.0))
        copay_pct = float(policy_data.get("copay_percentage", 10.0))
        rem_coverage = float(policy_data.get("remaining_coverage", 500000.0))
        status = policy_data.get("status", "ACTIVE")

        processed_date = datetime.now(timezone.utc).isoformat()

        if status != "ACTIVE":
            return {
                "status": "REJECTED",
                "approved_amount": 0.0,
                "processed_date": processed_date,
                "adjudication_notes": f"Claim rejected. Policy {policy_data.get('policy_id')} status is {status}."
            }

        if claim_amount > rem_coverage:
            return {
                "status": "REJECTED",
                "approved_amount": 0.0,
                "processed_date": processed_date,
                "adjudication_notes": f"Claim rejected. Amount ({claim_amount}) exceeds remaining policy coverage ({rem_coverage})."
            }

        # Calculate approved amount considering copay
        copay_amount = round(claim_amount * (copay_pct / 100.0), 2)
        approved_amount = round(claim_amount - copay_amount, 2)

        return {
            "status": "APPROVED",
            "approved_amount": approved_amount,
            "processed_date": processed_date,
            "adjudication_notes": f"Claim approved. {copay_pct}% copay ({copay_amount}) applied per policy terms ({policy_data.get('policy_id')})."
        }

mock_insurance_system = MockInsuranceService()
