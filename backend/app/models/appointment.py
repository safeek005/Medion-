from typing import Optional, List
from pydantic import BaseModel
from .common import AppointmentStatus

class Appointment(BaseModel):
    appointment_id: str
    patient_id: str
    doctor_id: str
    hospital_id: str
    appointment_date: str
    time_slot: str
    status: AppointmentStatus
    reason_for_visit: str
    created_at: str

class SlotCheckRequest(BaseModel):
    doctor_id: str
    date: str
    hospital_id: Optional[str] = None

class AppointmentBookingRequest(BaseModel):
    patient_id: str
    doctor_id: str
    hospital_id: Optional[str] = "HOSP-001"
    appointment_date: Optional[str] = None
    date: Optional[str] = None
    time_slot: Optional[str] = None
    start_time: Optional[str] = None
    reason_for_visit: Optional[str] = "General Consultation"
    reason: Optional[str] = None

class CancelAppointmentRequest(BaseModel):
    appointment_id: str
    reason: Optional[str] = None

class RescheduleAppointmentRequest(BaseModel):
    appointment_id: str
    new_date: Optional[str] = None
    appointment_date: Optional[str] = None
    new_time_slot: Optional[str] = None
    new_start_time: Optional[str] = None
    time_slot: Optional[str] = None

