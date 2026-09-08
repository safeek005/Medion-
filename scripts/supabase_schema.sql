-- ==============================================================================
-- MEDION HEALTHCARE PLATFORM — SUPABASE POSTGRESQL SCHEMA MIGRATION
-- Phase 1: Centralized Relational Persistence
-- ==============================================================================

-- Enable UUID extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. DOCTORS TABLE
CREATE TABLE IF NOT EXISTS public.doctors (
    doctor_id TEXT PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    specialty TEXT NOT NULL,
    hospital_id TEXT,
    phone TEXT,
    email TEXT,
    available_days JSONB DEFAULT '[]'::jsonb,
    available_slots JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. PATIENTS TABLE
CREATE TABLE IF NOT EXISTS public.patients (
    patient_id TEXT PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    dob TEXT,
    gender TEXT,
    blood_group TEXT,
    phone TEXT,
    email TEXT,
    address TEXT,
    emergency_contact JSONB DEFAULT '{}'::jsonb,
    primary_doctor_id TEXT REFERENCES public.doctors(doctor_id) ON DELETE SET NULL,
    insurance_policy_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. APPOINTMENTS TABLE
CREATE TABLE IF NOT EXISTS public.appointments (
    appointment_id TEXT PRIMARY KEY,
    patient_id TEXT REFERENCES public.patients(patient_id) ON DELETE CASCADE,
    patient_name TEXT,
    doctor_id TEXT REFERENCES public.doctors(doctor_id) ON DELETE CASCADE,
    doctor_name TEXT,
    specialty TEXT,
    hospital_id TEXT,
    hospital_name TEXT,
    appointment_date TEXT NOT NULL,
    date TEXT,
    time_slot TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'SCHEDULED',
    reason_for_visit TEXT,
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. INSURANCE POLICIES TABLE
CREATE TABLE IF NOT EXISTS public.insurance_policies (
    policy_id TEXT PRIMARY KEY,
    patient_id TEXT REFERENCES public.patients(patient_id) ON DELETE CASCADE,
    provider_name TEXT NOT NULL,
    policy_number TEXT,
    plan_type TEXT,
    status TEXT NOT NULL DEFAULT 'ACTIVE',
    coverage_limit NUMERIC DEFAULT 500000,
    remaining_coverage NUMERIC DEFAULT 500000,
    copay_percentage NUMERIC DEFAULT 10,
    valid_until TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. INSURANCE CLAIMS TABLE
CREATE TABLE IF NOT EXISTS public.insurance_claims (
    claim_id TEXT PRIMARY KEY,
    patient_id TEXT REFERENCES public.patients(patient_id) ON DELETE CASCADE,
    policy_id TEXT REFERENCES public.insurance_policies(policy_id) ON DELETE SET NULL,
    provider_id TEXT,
    bill_id TEXT,
    claim_amount NUMERIC NOT NULL,
    approved_amount NUMERIC,
    status TEXT NOT NULL DEFAULT 'SUBMITTED',
    submitted_date TIMESTAMPTZ DEFAULT NOW(),
    processed_date TIMESTAMPTZ,
    adjudication_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. LAB REPORTS TABLE
CREATE TABLE IF NOT EXISTS public.lab_reports (
    report_id TEXT PRIMARY KEY,
    patient_id TEXT REFERENCES public.patients(patient_id) ON DELETE CASCADE,
    laboratory_id TEXT,
    doctor_id TEXT REFERENCES public.doctors(doctor_id) ON DELETE SET NULL,
    test_type TEXT NOT NULL,
    test_date TEXT,
    status TEXT NOT NULL DEFAULT 'COMPLETED',
    results JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. MEDICAL RECORDS TABLE
CREATE TABLE IF NOT EXISTS public.medical_records (
    record_id TEXT PRIMARY KEY,
    patient_id TEXT REFERENCES public.patients(patient_id) ON DELETE CASCADE,
    doctor_id TEXT REFERENCES public.doctors(doctor_id) ON DELETE SET NULL,
    visit_date TEXT,
    diagnosis TEXT,
    symptoms TEXT,
    treatment_plan TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. PRESCRIPTIONS TABLE
CREATE TABLE IF NOT EXISTS public.prescriptions (
    prescription_id TEXT PRIMARY KEY,
    patient_id TEXT REFERENCES public.patients(patient_id) ON DELETE CASCADE,
    doctor_id TEXT REFERENCES public.doctors(doctor_id) ON DELETE SET NULL,
    prescribed_date TEXT,
    medications JSONB DEFAULT '[]'::jsonb,
    instructions TEXT,
    status TEXT DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Appropriate for MEDION Demo & Prototyping (Read/Write access via anon & authenticated keys)
-- -----------------------------------------------------------------------------
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insurance_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insurance_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;

-- Allow full access for anon/authenticated roles
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Allow anon all on doctors" ON public.doctors;
    CREATE POLICY "Allow anon all on doctors" ON public.doctors FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Allow anon all on patients" ON public.patients;
    CREATE POLICY "Allow anon all on patients" ON public.patients FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Allow anon all on appointments" ON public.appointments;
    CREATE POLICY "Allow anon all on appointments" ON public.appointments FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Allow anon all on insurance_policies" ON public.insurance_policies;
    CREATE POLICY "Allow anon all on insurance_policies" ON public.insurance_policies FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Allow anon all on insurance_claims" ON public.insurance_claims;
    CREATE POLICY "Allow anon all on insurance_claims" ON public.insurance_claims FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Allow anon all on lab_reports" ON public.lab_reports;
    CREATE POLICY "Allow anon all on lab_reports" ON public.lab_reports FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Allow anon all on medical_records" ON public.medical_records;
    CREATE POLICY "Allow anon all on medical_records" ON public.medical_records FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Allow anon all on prescriptions" ON public.prescriptions;
    CREATE POLICY "Allow anon all on prescriptions" ON public.prescriptions FOR ALL USING (true) WITH CHECK (true);
END $$;
