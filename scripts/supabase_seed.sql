-- ==============================================================================
-- MEDION HEALTHCARE PLATFORM — SUPABASE POSTGRESQL SEED DATA
-- Phase 1: Initial Database Seeding
-- ==============================================================================

-- 1. SEED DOCTORS
INSERT INTO public.doctors (doctor_id, first_name, last_name, specialty, hospital_id, phone, email, available_days, available_slots)
VALUES
    ('DOC-101', 'Rajesh', 'Mehta', 'Cardiology', 'HOSP-001', '+91 9123456780', 'dr.mehta@medionhealth.org', '["Monday", "Wednesday", "Friday"]'::jsonb, '["09:00-09:30", "10:00-10:30", "11:00-11:30", "14:00-14:30", "15:00-15:30"]'::jsonb),
    ('DOC-102', 'Anita', 'Deshmukh', 'Endocrinology', 'HOSP-001', '+91 9123456781', 'dr.anita@medionhealth.org', '["Tuesday", "Thursday", "Saturday"]'::jsonb, '["09:30-10:00", "10:30-11:00", "11:30-12:00", "14:30-15:00"]'::jsonb),
    ('DOC-103', 'Suresh', 'Rao', 'General Medicine', 'HOSP-002', '+91 9123456782', 'dr.suresh@cityhospital.org', '["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]'::jsonb, '["09:00-09:30", "09:30-10:00", "10:00-10:30", "11:00-11:30"]'::jsonb)
ON CONFLICT (doctor_id) DO NOTHING;

-- 2. SEED PATIENTS
INSERT INTO public.patients (patient_id, first_name, last_name, dob, gender, blood_group, phone, email, address, emergency_contact, primary_doctor_id, insurance_policy_id, created_at)
VALUES
    ('PAT-1001', 'Arun', 'Kumar', '1982-05-14', 'Male', 'O+', '+91 9876543210', 'arun.kumar@example.com', '42 MG Road, Indiranagar, Bengaluru, Karnataka', '{"name": "Priya Kumar", "relationship": "Spouse", "phone": "+91 9876543211"}'::jsonb, 'DOC-101', 'POL-701', '2024-01-10T09:30:00Z'),
    ('PAT-1002', 'Sneha', 'Sharma', '1990-11-22', 'Female', 'A+', '+91 9812345678', 'sneha.sharma@example.com', '15 Park Street, Koramangala, Bengaluru, Karnataka', '{"name": "Rajesh Sharma", "relationship": "Father", "phone": "+91 9812345679"}'::jsonb, 'DOC-102', 'POL-702', '2024-02-15T11:00:00Z'),
    ('PAT-1003', 'Vikram', 'Singh', '1975-08-03', 'Male', 'B-', '+91 9988776655', 'vikram.singh@example.com', '88 Outer Ring Road, Whitefield, Bengaluru, Karnataka', '{"name": "Ananya Singh", "relationship": "Spouse", "phone": "+91 9988776656"}'::jsonb, 'DOC-101', 'POL-703', '2024-03-01T14:20:00Z')
ON CONFLICT (patient_id) DO NOTHING;

-- 3. SEED APPOINTMENTS
INSERT INTO public.appointments (appointment_id, patient_id, patient_name, doctor_id, doctor_name, specialty, hospital_id, hospital_name, appointment_date, date, time_slot, status, reason_for_visit, reason, created_at)
VALUES
    ('APT-2001', 'PAT-1001', 'Arun Kumar', 'DOC-101', 'Dr. Rajesh Mehta', 'Cardiology', 'HOSP-001', 'Apollo Hospitals Greams Road', '2024-07-22', '2024-07-22', '10:00-10:30', 'SCHEDULED', 'Follow-up consultation for hypertension', 'Follow-up consultation for hypertension', '2024-07-15T10:00:00Z'),
    ('APT-2002', 'PAT-1002', 'Sneha Sharma', 'DOC-102', 'Dr. Anita Deshmukh', 'Endocrinology', 'HOSP-001', 'Apollo Hospitals Greams Road', '2024-07-23', '2024-07-23', '11:30-12:00', 'SCHEDULED', 'Thyroid management and dosage adjustment', 'Thyroid management and dosage adjustment', '2024-07-16T11:30:00Z'),
    ('APT-2003', 'PAT-1003', 'Vikram Singh', 'DOC-101', 'Dr. Rajesh Mehta', 'Cardiology', 'HOSP-001', 'Apollo Hospitals Greams Road', '2024-07-25', '2024-07-25', '14:00-14:30', 'SCHEDULED', 'Chest discomfort evaluation and ECG review', 'Chest discomfort evaluation and ECG review', '2024-07-18T14:00:00Z')
ON CONFLICT (appointment_id) DO NOTHING;

-- 4. SEED INSURANCE POLICIES
INSERT INTO public.insurance_policies (policy_id, patient_id, provider_name, policy_number, plan_type, status, coverage_limit, remaining_coverage, copay_percentage, valid_until, created_at)
VALUES
    ('POL-701', 'PAT-1001', 'Star Health & Allied Insurance', 'SH-COMP-2024-88912', 'Comprehensive Family Floater', 'ACTIVE', 500000, 485000, 10, '2025-12-31', '2024-01-01T00:00:00Z'),
    ('POL-702', 'PAT-1002', 'HDFC ERGO Health', 'HE-OPT-2024-44510', 'Optima Restore Individual', 'ACTIVE', 300000, 290000, 15, '2025-10-30', '2024-02-01T00:00:00Z'),
    ('POL-703', 'PAT-1003', 'Star Health & Allied Insurance', 'SH-SR-2024-99120', 'Senior Citizens Red Carpet', 'ACTIVE', 750000, 720000, 20, '2025-08-15', '2024-03-01T00:00:00Z')
ON CONFLICT (policy_id) DO NOTHING;

-- 5. SEED INSURANCE CLAIMS
INSERT INTO public.insurance_claims (claim_id, patient_id, policy_id, provider_id, bill_id, claim_amount, approved_amount, status, submitted_date, processed_date, adjudication_notes, created_at)
VALUES
    ('CLM-501', 'PAT-1001', 'POL-701', 'INS-001', 'BILL-201', 15000, 13500, 'APPROVED', '2024-05-15T10:00:00Z', '2024-05-18T14:30:00Z', 'Approved after 10% standard copay deduction.', '2024-05-15T10:00:00Z'),
    ('CLM-502', 'PAT-1002', 'POL-702', 'INS-002', 'BILL-202', 8500, 7225, 'APPROVED', '2024-06-10T11:00:00Z', '2024-06-12T16:00:00Z', 'Approved with 15% individual copay.', '2024-06-10T11:00:00Z')
ON CONFLICT (claim_id) DO NOTHING;

-- 6. SEED LAB REPORTS
INSERT INTO public.lab_reports (report_id, patient_id, laboratory_id, doctor_id, test_type, test_date, status, results, created_at)
VALUES
    ('LABR-1001', 'PAT-1001', 'LAB-001', 'DOC-101', 'Comprehensive Blood & Lipid Panel', '2024-07-18', 'COMPLETED', '[
        {"parameter": "Hemoglobin", "value": 10.4, "unit": "g/dL", "reference_range": "13.5 - 17.5", "is_abnormal": true, "abnormality_direction": "LOW"},
        {"parameter": "Total Cholesterol", "value": 215.0, "unit": "mg/dL", "reference_range": "< 200", "is_abnormal": true, "abnormality_direction": "HIGH"},
        {"parameter": "HDL Cholesterol", "value": 45.0, "unit": "mg/dL", "reference_range": "> 40", "is_abnormal": false, "abnormality_direction": "NORMAL"},
        {"parameter": "Fasting Blood Sugar", "value": 98.0, "unit": "mg/dL", "reference_range": "70 - 100", "is_abnormal": false, "abnormality_direction": "NORMAL"}
    ]'::jsonb, '2024-07-18T10:00:00Z'),
    ('LABR-1002', 'PAT-1002', 'LAB-001', 'DOC-102', 'Thyroid Profile (T3, T4, TSH)', '2024-07-19', 'COMPLETED', '[
        {"parameter": "TSH", "value": 6.2, "unit": "uIU/mL", "reference_range": "0.4 - 4.2", "is_abnormal": true, "abnormality_direction": "HIGH"},
        {"parameter": "Free T4", "value": 1.1, "unit": "ng/dL", "reference_range": "0.8 - 1.8", "is_abnormal": false, "abnormality_direction": "NORMAL"}
    ]'::jsonb, '2024-07-19T11:00:00Z')
ON CONFLICT (report_id) DO NOTHING;

-- 7. SEED MEDICAL RECORDS
INSERT INTO public.medical_records (record_id, patient_id, doctor_id, visit_date, diagnosis, symptoms, treatment_plan, notes, created_at)
VALUES
    ('MED-3001', 'PAT-1001', 'DOC-101', '2024-06-15', 'Essential Hypertension & Mild Anemia', 'Fatigue, occasional morning headaches', 'Prescribed Amlodipine 5mg OD and Iron supplement. Recommended low sodium diet.', 'Patient advised to monitor blood pressure weekly.', '2024-06-15T11:00:00Z'),
    ('MED-3002', 'PAT-1002', 'DOC-102', '2024-06-20', 'Primary Hypothyroidism', 'Weight gain, cold intolerance, mild lethargy', 'Adjusted Levothyroxine to 75mcg daily before breakfast. Retest TSH in 6 weeks.', 'Thyroid function improving compared to previous quarter.', '2024-06-20T14:30:00Z')
ON CONFLICT (record_id) DO NOTHING;

-- 8. SEED PRESCRIPTIONS
INSERT INTO public.prescriptions (prescription_id, patient_id, doctor_id, prescribed_date, medications, instructions, status, created_at)
VALUES
    ('RX-4001', 'PAT-1001', 'DOC-101', '2024-06-15', '[
        {"medicine_name": "Amlodipine", "dosage": "5mg", "frequency": "Once daily (Morning)", "duration_days": 30},
        {"medicine_name": "Ferrous Ascorbate", "dosage": "100mg", "frequency": "Once daily after lunch", "duration_days": 30}
    ]'::jsonb, 'Take Amlodipine regularly on empty stomach. Avoid missed doses.', 'ACTIVE', '2024-06-15T11:30:00Z'),
    ('RX-4002', 'PAT-1002', 'DOC-102', '2024-06-20', '[
        {"medicine_name": "Levothyroxine Sodium", "dosage": "75mcg", "frequency": "Once daily (Morning empty stomach)", "duration_days": 45}
    ]'::jsonb, 'Take at least 30 minutes before breakfast with full glass of water.', 'ACTIVE', '2024-06-20T15:00:00Z')
ON CONFLICT (prescription_id) DO NOTHING;
