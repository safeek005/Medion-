-- ==============================================================================
-- MEDION HEALTHCARE PLATFORM — SUPABASE POSTGRESQL SEED DATA (10 SYNTHETIC PATIENTS)
-- ==============================================================================

-- 1. SEED DOCTORS
INSERT INTO public.doctors (doctor_id, first_name, last_name, specialty, hospital_id, phone, email, available_days, available_slots)
VALUES
    ('DOC-101', 'Rajesh', 'Mehta', 'Cardiology', 'HOSP-001', '+91 9123456780', 'dr.mehta@medionhealth.org', '["Monday", "Wednesday", "Friday"]'::jsonb, '["09:00-09:30", "10:00-10:30", "11:00-11:30", "14:00-14:30", "15:00-15:30"]'::jsonb),
    ('DOC-102', 'Anita', 'Deshmukh', 'Endocrinology', 'HOSP-001', '+91 9123456781', 'dr.anita@medionhealth.org', '["Tuesday", "Thursday", "Saturday"]'::jsonb, '["09:30-10:00", "10:30-11:00", "11:30-12:00", "14:30-15:00"]'::jsonb),
    ('DOC-103', 'Suresh', 'Rao', 'General Medicine', 'HOSP-002', '+91 9123456782', 'dr.suresh@cityhospital.org', '["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]'::jsonb, '["09:00-09:30", "09:30-10:00", "10:00-10:30", "11:00-11:30"]'::jsonb),
    ('DOC-104', 'Vikramaditya', 'Roy', 'Orthopedics', 'HOSP-001', '+91 9123456783', 'dr.roy@medionhealth.org', '["Monday", "Wednesday", "Thursday"]'::jsonb, '["10:00-10:30", "11:00-11:30", "15:00-15:30"]'::jsonb),
    ('DOC-105', 'Kavita', 'Iyer', 'Dermatology', 'HOSP-001', '+91 9123456784', 'dr.kavita@medionhealth.org', '["Tuesday", "Friday"]'::jsonb, '["10:00-10:30", "11:30-12:00", "16:00-16:30"]'::jsonb),
    ('DOC-106', 'Pradeep', 'Verma', 'Neurology', 'HOSP-002', '+91 9123456785', 'dr.verma@cityhospital.org', '["Monday", "Thursday"]'::jsonb, '["11:00-11:30", "14:00-14:30"]'::jsonb),
    ('DOC-107', 'Sunita', 'Kapoor', 'Pulmonology', 'HOSP-001', '+91 9123456786', 'dr.sunita@medionhealth.org', '["Wednesday", "Saturday"]'::jsonb, '["09:00-09:30", "10:30-11:00"]'::jsonb),
    ('DOC-108', 'Ramesh', 'Nambiar', 'Gastroenterology', 'HOSP-001', '+91 9123456787', 'dr.nambiar@medionhealth.org', '["Tuesday", "Thursday"]'::jsonb, '["14:00-14:30", "15:30-16:00"]'::jsonb),
    ('DOC-109', 'Meera', 'Kulkarni', 'ENT', 'HOSP-002', '+91 9123456788', 'dr.meera@cityhospital.org', '["Monday", "Friday"]'::jsonb, '["10:00-10:30", "11:30-12:00"]'::jsonb)
ON CONFLICT (doctor_id) DO NOTHING;

-- 2. SEED PATIENTS (10 UNIQUE SYNTHETIC PATIENTS)
INSERT INTO public.patients (patient_id, first_name, last_name, dob, gender, blood_group, phone, email, address, emergency_contact, primary_doctor_id, insurance_policy_id, created_at)
VALUES
    ('PAT-1001', 'Arun', 'Kumar', '1982-05-14', 'Male', 'O+', '+91 9876543210', 'arun.kumar@example.com', '42 MG Road, Indiranagar, Bengaluru', '{"name": "Priya Kumar", "relationship": "Spouse", "phone": "+91 9876543211"}'::jsonb, 'DOC-101', 'POL-701', '2024-01-10T09:30:00Z'),
    ('PAT-1002', 'Sneha', 'Sharma', '1990-11-22', 'Female', 'A+', '+91 9812345678', 'sneha.sharma@example.com', '15 Park Street, Koramangala, Bengaluru', '{"name": "Rajesh Sharma", "relationship": "Father", "phone": "+91 9812345679"}'::jsonb, 'DOC-102', 'POL-702', '2024-02-15T11:00:00Z'),
    ('PAT-1003', 'Vikram', 'Singh', '1975-08-03', 'Male', 'B-', '+91 9988776655', 'vikram.singh@example.com', '88 Outer Ring Road, Whitefield, Bengaluru', '{"name": "Ananya Singh", "relationship": "Spouse", "phone": "+91 9988776656"}'::jsonb, 'DOC-104', 'POL-703', '2024-03-01T14:20:00Z'),
    ('PAT-1004', 'Priya', 'Nair', '1995-03-17', 'Female', 'O-', '+91 9765432109', 'priya.nair@example.com', '24 HSR Layout, Sector 3, Bengaluru', '{"name": "Suresh Nair", "relationship": "Brother", "phone": "+91 9765432110"}'::jsonb, 'DOC-105', 'POL-704', '2024-03-18T10:15:00Z'),
    ('PAT-1005', 'Rajesh', 'Patel', '1968-12-05', 'Male', 'AB+', '+91 9654321098', 'rajesh.patel@example.com', '102 Electronic City Phase 1, Bengaluru', '{"name": "Meena Patel", "relationship": "Spouse", "phone": "+91 9654321099"}'::jsonb, 'DOC-103', 'POL-705', '2024-04-02T08:45:00Z'),
    ('PAT-1006', 'Ananya', 'Sen', '1988-09-29', 'Female', 'A-', '+91 9543210987', 'ananya.sen@example.com', '56 Jayanagar 4th Block, Bengaluru', '{"name": "Aritra Sen", "relationship": "Spouse", "phone": "+91 9543210988"}'::jsonb, 'DOC-106', 'POL-706', '2024-04-20T16:30:00Z'),
    ('PAT-1007', 'Tariq', 'Ahmed', '1980-04-11', 'Male', 'B+', '+91 9432109876', 'tariq.ahmed@example.com', '77 Frazer Town, Commercial Street, Bengaluru', '{"name": "Zara Ahmed", "relationship": "Spouse", "phone": "+91 9432109877"}'::jsonb, 'DOC-107', 'POL-707', '2024-05-05T11:20:00Z'),
    ('PAT-1008', 'Deepa', 'Joshi', '1972-07-19', 'Female', 'O+', '+91 9321098765', 'deepa.joshi@example.com', '33 Malleshwaram 18th Cross, Bengaluru', '{"name": "Amit Joshi", "relationship": "Son", "phone": "+91 9321098766"}'::jsonb, 'DOC-108', 'POL-708', '2024-05-19T13:40:00Z'),
    ('PAT-1009', 'Kabir', 'Das', '1993-01-30', 'Male', 'AB-', '+91 9210987654', 'kabir.das@example.com', '19 Bannerghatta Main Road, Bengaluru', '{"name": "Neha Das", "relationship": "Spouse", "phone": "+91 9210987655"}'::jsonb, 'DOC-109', 'POL-709', '2024-06-01T09:10:00Z'),
    ('PAT-1010', 'Lakshmi', 'Menon', '1965-10-14', 'Female', 'A+', '+91 9109876543', 'lakshmi.menon@example.com', '64 Sadashivanagar 8th Main, Bengaluru', '{"name": "Ramesh Menon", "relationship": "Spouse", "phone": "+91 9109876544"}'::jsonb, 'DOC-103', 'POL-710', '2024-06-15T15:00:00Z')
ON CONFLICT (patient_id) DO NOTHING;

-- 3. SEED APPOINTMENTS
INSERT INTO public.appointments (appointment_id, patient_id, patient_name, doctor_id, doctor_name, specialty, hospital_id, hospital_name, appointment_date, date, time_slot, status, reason_for_visit, reason, created_at)
VALUES
    ('APT-1001', 'PAT-1001', 'Arun Kumar', 'DOC-101', 'Dr. Rajesh Mehta', 'Cardiology', 'HOSP-001', 'Apollo Hospitals Greams Road', '2026-09-18', 'Tomorrow', '10:00-10:30', 'CONFIRMED', 'Follow-up consultation for hypertension', 'Follow-up consultation for hypertension', '2026-09-15T10:00:00Z'),
    ('APT-1002', 'PAT-1002', 'Sneha Sharma', 'DOC-102', 'Dr. Anita Deshmukh', 'Endocrinology', 'HOSP-001', 'Apollo Hospitals Greams Road', '2026-09-17', 'Today', '10:30-11:00', 'SCHEDULED', 'Quarterly Diabetes & Thyroid Management Review', 'Quarterly Diabetes & Thyroid Management Review', '2026-09-16T11:00:00Z'),
    ('APT-1003', 'PAT-1003', 'Vikram Singh', 'DOC-104', 'Dr. Vikramaditya Roy', 'Orthopedics', 'HOSP-001', 'Apollo Hospitals Greams Road', '2026-09-19', 'Friday', '11:00-11:30', 'CONFIRMED', 'Right knee joint evaluation & physio review', 'Right knee joint evaluation & physio review', '2026-09-16T14:20:00Z'),
    ('APT-1004', 'PAT-1004', 'Priya Nair', 'DOC-105', 'Dr. Kavita Iyer', 'Dermatology', 'HOSP-001', 'Apollo Hospitals Greams Road', '2026-09-18', 'Tomorrow', '16:00-16:30', 'CONFIRMED', 'Eczema flare-up consultation', 'Eczema flare-up consultation', '2026-09-15T09:15:00Z'),
    ('APT-1005', 'PAT-1005', 'Rajesh Patel', 'DOC-103', 'Dr. Suresh Rao', 'General Medicine', 'HOSP-002', 'City General Hospital', '2026-09-17', 'Today', '09:30-10:00', 'SCHEDULED', 'Routine wellness checkup & Vitamin D review', 'Routine wellness checkup & Vitamin D review', '2026-09-14T08:45:00Z'),
    ('APT-1006', 'PAT-1006', 'Ananya Sen', 'DOC-106', 'Dr. Pradeep Verma', 'Neurology', 'HOSP-002', 'City General Hospital', '2026-09-21', 'Monday', '11:00-11:30', 'SCHEDULED', 'Migraine prophylaxis review', 'Migraine prophylaxis review', '2026-09-15T16:30:00Z'),
    ('APT-1007', 'PAT-1007', 'Tariq Ahmed', 'DOC-107', 'Dr. Sunita Kapoor', 'Pulmonology', 'HOSP-001', 'Apollo Hospitals Greams Road', '2026-09-17', 'Today', '10:30-11:00', 'CONFIRMED', 'Asthma inhaler technique & PFT assessment', 'Asthma inhaler technique & PFT assessment', '2026-09-16T11:20:00Z'),
    ('APT-1008', 'PAT-1008', 'Deepa Joshi', 'DOC-108', 'Dr. Ramesh Nambiar', 'Gastroenterology', 'HOSP-001', 'Apollo Hospitals Greams Road', '2026-09-18', 'Tomorrow', '14:00-14:30', 'CONFIRMED', 'GERD symptom follow-up', 'GERD symptom follow-up', '2026-09-15T13:40:00Z'),
    ('APT-1009', 'PAT-1009', 'Kabir Das', 'DOC-109', 'Dr. Meera Kulkarni', 'ENT', 'HOSP-002', 'City General Hospital', '2026-09-18', 'Tomorrow', '10:00-10:30', 'SCHEDULED', 'Sinusitis follow-up & endoscopy report review', 'Sinusitis follow-up & endoscopy report review', '2026-09-16T09:10:00Z'),
    ('APT-1010', 'PAT-1010', 'Lakshmi Menon', 'DOC-103', 'Dr. Suresh Rao', 'General Medicine', 'HOSP-002', 'City General Hospital', '2026-09-18', 'Tomorrow', '10:00-10:30', 'CONFIRMED', 'Osteopenia bone density management review', 'Osteopenia bone density management review', '2026-09-16T15:00:00Z')
ON CONFLICT (appointment_id) DO NOTHING;
