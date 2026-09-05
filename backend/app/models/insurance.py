from typing import Optional, List
from pydantic import BaseModel, EmailStr
from .common import ClaimStatus

class InsuranceProvider(BaseModel):
    provider_id: str
    name: str
    payer_code: str
    support_phone: str
    support_email: EmailStr
    portal_url: str

class InsurancePolicy(BaseModel):
    policy_id: str
    patient_id: str
    provider_id: str
    policy_number: str
    policy_holder_name: str
    plan_type: str
    coverage_amount: float
    remaining_coverage: float
    copay_percentage: float
    status: str
    valid_from: str
    valid_to: str

class BillItem(BaseModel):
    description: str
    amount: float

class Bill(BaseModel):
    bill_id: str
    patient_id: str
    hospital_id: str
    bill_date: str
    items: List[BillItem]
    subtotal: float
    tax_amount: float
    total_amount: float
    insurance_covered_amount: float
    patient_payable_amount: float
    status: str
    claim_id: Optional[str] = None

class InsuranceClaim(BaseModel):
    claim_id: str
    patient_id: str
    policy_id: str
    provider_id: str
    bill_id: str
    claim_amount: float
    approved_amount: float
    status: ClaimStatus
    submitted_date: str
    processed_date: Optional[str] = None
    adjudication_notes: Optional[str] = None

class VerifyInsuranceRequest(BaseModel):
    patient_id: str
    policy_id: Optional[str] = None

class GetCoverageRequest(BaseModel):
    patient_id: str
    service_type: Optional[str] = "CONSULTATION"

class PrepareClaimRequest(BaseModel):
    patient_id: str
    bill_id: str
    service_type: Optional[str] = "CONSULTATION"

class SubmitClaimRequest(BaseModel):
    claim_id: str

class GetClaimStatusRequest(BaseModel):
    claim_id: str

