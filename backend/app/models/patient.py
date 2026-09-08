from typing import Optional, List
from pydantic import BaseModel, EmailStr

class EmergencyContact(BaseModel):
    name: str
    relationship: str
    phone: str

class Patient(BaseModel):
    patient_id: str
    first_name: str
    last_name: str
    dob: str
    gender: str
    blood_group: str
    phone: str
    email: EmailStr
    address: str
    emergency_contact: EmergencyContact
    primary_doctor_id: str
    insurance_policy_id: str
    created_at: str

class Doctor(BaseModel):
    doctor_id: str
    first_name: str
    last_name: str
    specialty: str
    qualification: str
    hospital_id: str
    phone: str
    email: EmailStr
    available_days: List[str]
    available_slots: List[str]

class Nurse(BaseModel):
    nurse_id: str
    first_name: str
    last_name: str
    department: str
    hospital_id: str
    phone: str
    email: EmailStr

class Hospital(BaseModel):
    hospital_id: str
    name: str
    city: str
    state: str
    address: str
    phone: str
    email: EmailStr
    accreditation: str

class PatientRegisterRequest(BaseModel):
    full_name: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    date_of_birth: Optional[str] = None
    dob: Optional[str] = None
    gender: Optional[str] = None
    blood_group: Optional[str] = None
    phone: str
    email: Optional[EmailStr] = None
    address: Optional[str] = None
    emergency_contact: Optional[EmergencyContact] = None
    primary_doctor_id: Optional[str] = None
    insurance_policy_id: Optional[str] = None

class PatientUpdateRequest(BaseModel):
    patient_id: str
    updates: Optional[dict] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    address: Optional[str] = None
    emergency_contact: Optional[EmergencyContact] = None
    primary_doctor_id: Optional[str] = None
    insurance_policy_id: Optional[str] = None

class PatientSearchRequest(BaseModel):
    patient_id: Optional[str] = None
    name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None

