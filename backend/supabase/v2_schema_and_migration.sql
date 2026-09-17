-- =============================================================================
-- MEDION V2: Healthcare Operating System - Normalized PostgreSQL Schema
-- Authoritative Database Migration Script for Supabase / PostgreSQL
-- =============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. HOSPITALS & FACILITIES
CREATE TABLE IF NOT EXISTS hospitals (
    hospital_id VARCHAR(50) PRIMARY KEY,
    hospital_name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    pincode VARCHAR(20) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    emergency_phone VARCHAR(50) NOT NULL,
    total_beds INT DEFAULT 250,
    available_beds INT DEFAULT 75,
    icu_beds INT DEFAULT 30,
    available_icu_beds INT DEFAULT 6,
    departments JSONB DEFAULT '["Cardiology", "Endocrinology", "Neurology", "Pediatrics", "Emergency"]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. PATIENTS
CREATE TABLE IF NOT EXISTS patients (
    patient_id VARCHAR(50) PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    dob DATE NOT NULL,
    gender VARCHAR(20) NOT NULL,
    blood_group VARCHAR(10),
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255) UNIQUE,
    address TEXT,
    emergency_contact JSONB,
    primary_doctor_id VARCHAR(50),
    insurance_policy_id VARCHAR(50),
    allergies JSONB DEFAULT '[]'::jsonb,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_patients_email ON patients(email);
CREATE INDEX IF NOT EXISTS idx_patients_phone ON patients(phone);

-- 3. DOCTORS
CREATE TABLE IF NOT EXISTS doctors (
    doctor_id VARCHAR(50) PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    specialty VARCHAR(100) NOT NULL,
    qualification VARCHAR(100),
    experience_years INT DEFAULT 10,
    phone VARCHAR(50),
    email VARCHAR(255),
    hospital_id VARCHAR(50) REFERENCES hospitals(hospital_id),
    consultation_fee NUMERIC(10,2) DEFAULT 800.00,
    available_days JSONB DEFAULT '["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]'::jsonb,
    status VARCHAR(50) DEFAULT 'AVAILABLE',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. APPOINTMENTS
CREATE TABLE IF NOT EXISTS appointments (
    appointment_id VARCHAR(50) PRIMARY KEY,
    patient_id VARCHAR(50) NOT NULL REFERENCES patients(patient_id),
    doctor_id VARCHAR(50) NOT NULL REFERENCES doctors(doctor_id),
    hospital_id VARCHAR(50) REFERENCES hospitals(hospital_id),
    appointment_date DATE NOT NULL,
    time_slot VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'CONFIRMED', -- SCHEDULED, CONFIRMED, COMPLETED, CANCELLED, RESCHEDULED
    reason_for_visit TEXT,
    consultation_type VARCHAR(50) DEFAULT 'IN_PERSON',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_appointments_patient ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_date ON appointments(doctor_id, appointment_date);

-- 5. MEDICAL RECORDS
CREATE TABLE IF NOT EXISTS medical_records (
    record_id VARCHAR(50) PRIMARY KEY,
    patient_id VARCHAR(50) NOT NULL REFERENCES patients(patient_id),
    doctor_id VARCHAR(50) REFERENCES doctors(doctor_id),
    hospital_id VARCHAR(50) REFERENCES hospitals(hospital_id),
    visit_date DATE NOT NULL,
    diagnosis TEXT NOT NULL,
    icd10_code VARCHAR(50),
    chief_complaint TEXT,
    clinical_notes TEXT,
    vitals JSONB DEFAULT '{}'::jsonb,
    treatment_plan TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_medical_records_patient ON medical_records(patient_id);

-- 6. PRESCRIPTIONS
CREATE TABLE IF NOT EXISTS prescriptions (
    prescription_id VARCHAR(50) PRIMARY KEY,
    patient_id VARCHAR(50) NOT NULL REFERENCES patients(patient_id),
    doctor_id VARCHAR(50) NOT NULL REFERENCES doctors(doctor_id),
    hospital_id VARCHAR(50) REFERENCES hospitals(hospital_id),
    prescription_date DATE NOT NULL,
    diagnosis TEXT,
    medications JSONB NOT NULL DEFAULT '[]'::jsonb,
    instructions TEXT,
    is_signed BOOLEAN DEFAULT TRUE,
    signed_by VARCHAR(255),
    status VARCHAR(50) DEFAULT 'ACTIVE', -- ACTIVE, COMPLETED, CANCELLED
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_prescriptions_patient ON prescriptions(patient_id);

-- 7. LAB REPORTS
CREATE TABLE IF NOT EXISTS lab_reports (
    report_id VARCHAR(50) PRIMARY KEY,
    patient_id VARCHAR(50) NOT NULL REFERENCES patients(patient_id),
    laboratory_id VARCHAR(50),
    doctor_id VARCHAR(50) REFERENCES doctors(doctor_id),
    test_type VARCHAR(150) NOT NULL,
    test_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'COMPLETED', -- PENDING, IN_ANALYSIS, COMPLETED, RELEASED
    results JSONB NOT NULL DEFAULT '[]'::jsonb,
    summary TEXT,
    is_critical BOOLEAN DEFAULT FALSE,
    authorized_by VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lab_reports_patient ON lab_reports(patient_id);

-- 8. INSURANCE POLICIES
CREATE TABLE IF NOT EXISTS insurance_policies (
    policy_id VARCHAR(50) PRIMARY KEY,
    patient_id VARCHAR(50) NOT NULL REFERENCES patients(patient_id),
    provider_id VARCHAR(50) NOT NULL,
    policy_number VARCHAR(100) NOT NULL,
    policy_holder_name VARCHAR(255) NOT NULL,
    plan_type VARCHAR(100) NOT NULL,
    coverage_amount NUMERIC(12,2) NOT NULL,
    remaining_coverage NUMERIC(12,2) NOT NULL,
    copay_percentage NUMERIC(5,2) DEFAULT 10.00,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    valid_from DATE NOT NULL,
    valid_to DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_insurance_policies_patient ON insurance_policies(patient_id);

-- 9. INSURANCE CLAIMS
CREATE TABLE IF NOT EXISTS insurance_claims (
    claim_id VARCHAR(50) PRIMARY KEY,
    patient_id VARCHAR(50) NOT NULL REFERENCES patients(patient_id),
    policy_id VARCHAR(50) NOT NULL REFERENCES insurance_policies(policy_id),
    provider_id VARCHAR(50),
    bill_id VARCHAR(50),
    service_type VARCHAR(150),
    claim_amount NUMERIC(12,2) NOT NULL,
    approved_amount NUMERIC(12,2) DEFAULT 0.00,
    status VARCHAR(50) DEFAULT 'SUBMITTED', -- SUBMITTED, UNDER_REVIEW, APPROVED, QUERY_RAISED, SETTLED, REJECTED
    adjudication_notes TEXT,
    disbursement_ref VARCHAR(100),
    submitted_date TIMESTAMPTZ DEFAULT NOW(),
    processed_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_insurance_claims_patient ON insurance_claims(patient_id);

-- 10. NURSING TASKS & WORKFLOWS
CREATE TABLE IF NOT EXISTS tasks (
    task_id VARCHAR(50) PRIMARY KEY,
    patient_id VARCHAR(50) REFERENCES patients(patient_id),
    assigned_to VARCHAR(50), -- Staff ID (e.g., NURSE-01)
    task_type VARCHAR(100) NOT NULL,
    priority VARCHAR(20) DEFAULT 'MEDIUM', -- LOW, MEDIUM, HIGH, CRITICAL
    status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, IN_PROGRESS, COMPLETED, ESCALATED
    department VARCHAR(100),
    details TEXT,
    due_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. PATIENT VITALS
CREATE TABLE IF NOT EXISTS vitals (
    vital_id VARCHAR(50) PRIMARY KEY,
    patient_id VARCHAR(50) NOT NULL REFERENCES patients(patient_id),
    nurse_id VARCHAR(50),
    vitals JSONB NOT NULL, -- { systolic, diastolic, heart_rate, spo2, temperature }
    is_critical BOOLEAN DEFAULT FALSE,
    recorded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vitals_patient ON vitals(patient_id);

-- 12. NOTIFICATIONS & ALERTS
CREATE TABLE IF NOT EXISTS notifications (
    notification_id VARCHAR(50) PRIMARY KEY,
    recipient_id VARCHAR(50) NOT NULL, -- User/Staff ID
    patient_id VARCHAR(50) REFERENCES patients(patient_id),
    severity VARCHAR(20) DEFAULT 'INFO', -- INFO, WARNING, CRITICAL, URGENT
    type VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    requires_acknowledgment BOOLEAN DEFAULT FALSE,
    is_read BOOLEAN DEFAULT FALSE,
    dispatched_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notifications(recipient_id);

-- 13. APPEND-ONLY AUDIT LEDGER
CREATE TABLE IF NOT EXISTS audit_logs (
    log_id VARCHAR(50) PRIMARY KEY,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    event_type VARCHAR(100) NOT NULL,
    actor VARCHAR(100) NOT NULL,
    target_id VARCHAR(100) NOT NULL,
    details JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON audit_logs(actor);
CREATE INDEX IF NOT EXISTS idx_audit_logs_event ON audit_logs(event_type);

-- Enable Supabase Realtime Publication for Essential Multi-Portal Tables
ALTER PUBLICATION supabase_realtime ADD TABLE appointments;
ALTER PUBLICATION supabase_realtime ADD TABLE patients;
ALTER PUBLICATION supabase_realtime ADD TABLE prescriptions;
ALTER PUBLICATION supabase_realtime ADD TABLE lab_reports;
ALTER PUBLICATION supabase_realtime ADD TABLE insurance_claims;
ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
