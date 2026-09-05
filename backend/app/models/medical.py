from typing import Optional, List, Dict, Any
from pydantic import BaseModel
from .common import LabReportStatus, PriorityLevel

class VitalSigns(BaseModel):
    blood_pressure: str
    heart_rate: str
    temperature_c: float
    spo2_percent: int

class MedicalRecord(BaseModel):
    record_id: str
    patient_id: str
    doctor_id: str
    visit_date: str
    diagnosis: str
    symptoms: List[str]
    vital_signs: VitalSigns
    clinical_notes: str
    lab_report_ids: List[str]
    prescription_ids: List[str]

class TestResultItem(BaseModel):
    test_parameter: str
    value: float
    unit: str
    reference_range: str
    status: str
    flagged: bool

class LabReport(BaseModel):
    report_id: str
    patient_id: str
    doctor_id: str
    lab_id: str
    test_name: str
    collection_date: str
    result_date: str
    status: LabReportStatus
    test_results: List[TestResultItem]
    lab_technician_notes: str
    summary: str

class MedicationItem(BaseModel):
    name: str
    dosage: str
    frequency: str
    duration_days: int
    instructions: str

class Prescription(BaseModel):
    prescription_id: str
    patient_id: str
    doctor_id: str
    issued_date: str
    medications: List[MedicationItem]
    refills_remaining: int

class MedicalAnalysisSummary(BaseModel):
    report_id: str
    patient_id: str
    findings: List[TestResultItem]
    priority: PriorityLevel
    summary: str
    doctor_action_required: bool

class NormalizedTestItem(BaseModel):
    test_name: str
    value: float
    unit: str
    reference_low: Optional[float] = None
    reference_high: Optional[float] = None
    raw_reference: str

class TestAnalysisItem(BaseModel):
    test_name: str
    value: float
    unit: str
    reference_low: Optional[float] = None
    reference_high: Optional[float] = None
    raw_reference: str
    status: str  # LOW, NORMAL, HIGH, UNKNOWN
    flagged: bool

class LabComparisonItem(BaseModel):
    test_name: str
    unit: str
    previous_value: Optional[float] = None
    current_value: Optional[float] = None
    change: Optional[float] = None
    percentage_change: Optional[float] = None
    trend: str  # INCREASING, DECREASING, STABLE, NEW, MISSING_FROM_CURRENT

class ExtractLabReportRequest(BaseModel):
    patient_id: str
    report_id: Optional[str] = None
    test_results: Optional[List[Dict[str, Any]]] = None

class AnalyzeLabReportRequest(BaseModel):
    patient_id: str
    report_id: Optional[str] = None

class CompareLabReportsRequest(BaseModel):
    patient_id: str
    current_report_id: str
    previous_report_id: str

class ExplainLabReportRequest(BaseModel):
    patient_id: str
    report_id: str
    audience: Optional[str] = "doctor"  # doctor | patient

class MedicalSummaryRequest(BaseModel):
    patient_id: str

