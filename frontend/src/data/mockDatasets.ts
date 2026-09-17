import { PatientProfile, LabReportItem, AppointmentItem } from '../types';

export interface PrescriptionItem {
  prescription_id: string;
  patient_id: string;
  doctor_id: string;
  issued_date: string;
  medications: Array<{
    name: string;
    dosage: string;
    frequency: string;
    duration_days: number;
    instructions: string;
  }>;
  refills_remaining: number;
}

export interface NotificationItem {
  notification_id: string;
  recipient_type: string;
  recipient_id: string;
  title: string;
  message: string;
  channel: string;
  status: string;
  sent_at: string;
}

export interface InpatientBedItem {
  bed_id: string;
  room: string;
  ward: string;
  patient_id: string;
  patient_name: string;
  age: number;
  gender: string;
  acuity: 'Stable' | 'Guarded' | 'Urgent' | 'Critical';
  attending_doctor: string;
  admission_date: string;
  diagnosis: string;
  allergies: string[];
  vitals: {
    bp: string;
    pulse: number;
    spo2: number;
    temp: string;
    last_taken: string;
    status: 'normal' | 'elevated' | 'critical';
  };
  pending_tasks_count: number;
}

export interface EmarTaskItem {
  task_id: string;
  patient_id: string;
  patient_name: string;
  bed_id: string;
  medication: string;
  dosage: string;
  route: string;
  scheduled_time: string;
  status: 'PENDING' | 'ADMINISTERED' | 'DUE' | 'HELD';
  prescribed_by: string;
  notes?: string;
}

export interface LabWorkQueueItem {
  specimen_id: string;
  patient_id: string;
  patient_name: string;
  test_name: string;
  section: 'Hematology' | 'Biochemistry' | 'Microbiology' | 'Immunology';
  collected_at: string;
  turnaround_target_mins: number;
  elapsed_mins: number;
  priority: 'STAT' | 'Urgent' | 'Routine';
  stage: 'ORDERED' | 'COLLECTED' | 'ANALYSIS' | 'CRITICAL_REVIEW' | 'COMPLETED';
  specimen_type: string;
  ordering_doctor: string;
  critical_alert?: boolean;
}

export interface ClaimAdjudicationItem {
  claim_id: string;
  patient_id: string;
  patient_name: string;
  policy_id: string;
  payer_name: string;
  service_type: 'Inpatient' | 'Outpatient' | 'Emergency' | 'Diagnostics';
  diagnosis_code: string;
  diagnosis_desc: string;
  claimed_amount: number;
  approved_amount?: number;
  submitted_date: string;
  status: 'SUBMITTED' | 'PRE_AUTHORIZED' | 'UNDER_REVIEW' | 'QUERY_RAISED' | 'SETTLED' | 'REJECTED';
  required_action?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. MASTER PATIENTS REPOSITORY (Realistic Clinical Cohort)
// ─────────────────────────────────────────────────────────────────────────────

export const MOCK_PATIENT: PatientProfile = {
  patient_id: 'PAT-1001',
  first_name: 'Arun',
  last_name: 'Kumar',
  date_of_birth: '1982-05-14',
  gender: 'Male',
  blood_group: 'O+',
  phone: '+91 9876543210',
  email: 'arun.kumar@medion.demo',
  address: '42 MG Road, Indiranagar, Bengaluru, Karnataka',
  emergency_contact: {
    name: 'Priya Kumar',
    relationship: 'Spouse',
    phone: '+91 9876543211',
  },
  primary_doctor_id: 'DOC-101',
  insurance_policy_id: 'POL-701',
};

export const MOCK_PATIENTS_LIST: PatientProfile[] = [
  MOCK_PATIENT,
  {
    patient_id: 'PAT-1002',
    first_name: 'Sneha',
    last_name: 'Sharma',
    date_of_birth: '1990-11-22',
    gender: 'Female',
    blood_group: 'A+',
    phone: '+91 9812345678',
    email: 'sneha.sharma@medion.demo',
    address: '15 Park Street, Koramangala, Bengaluru, Karnataka',
    emergency_contact: {
      name: 'Rajesh Sharma',
      relationship: 'Father',
      phone: '+91 9812345679',
    },
    primary_doctor_id: 'DOC-102',
    insurance_policy_id: 'POL-702',
  },
  {
    patient_id: 'PAT-1003',
    first_name: 'Vikram',
    last_name: 'Singh',
    date_of_birth: '1975-08-03',
    gender: 'Male',
    blood_group: 'B-',
    phone: '+91 9988776655',
    email: 'vikram.singh@medion.demo',
    address: '88 Outer Ring Road, Whitefield, Bengaluru, Karnataka',
    emergency_contact: {
      name: 'Ananya Singh',
      relationship: 'Spouse',
      phone: '+91 9988776656',
    },
    primary_doctor_id: 'DOC-101',
    insurance_policy_id: 'POL-703',
  },
  {
    patient_id: 'PAT-1004',
    first_name: 'Priya',
    last_name: 'Nair',
    date_of_birth: '1995-03-17',
    gender: 'Female',
    blood_group: 'O-',
    phone: '+91 9765432109',
    email: 'priya.nair@medion.demo',
    address: '24 HSR Layout, Sector 3, Bengaluru, Karnataka',
    emergency_contact: {
      name: 'Karthik Nair',
      relationship: 'Brother',
      phone: '+91 9765432110',
    },
    primary_doctor_id: 'DOC-105',
    insurance_policy_id: 'POL-704',
  },
  {
    patient_id: 'PAT-1044',
    first_name: 'shiva',
    last_name: 's',
    date_of_birth: '1988-06-15',
    gender: 'Male',
    blood_group: 'O+',
    phone: '+91 9876543044',
    email: 'shiva.s@medion.demo',
    address: '44 RS Puram, Coimbatore, Tamil Nadu',
    emergency_contact: {
      name: 'Suresh S',
      relationship: 'Brother',
      phone: '+91 9876543045',
    },
    primary_doctor_id: 'DOC-101',
    insurance_policy_id: 'POL-744',
  },
  {
    patient_id: 'PAT-1025',
    first_name: 'Kavya',
    last_name: 'Sharma',
    date_of_birth: '1994-06-18',
    gender: 'Female',
    blood_group: 'B+',
    phone: '+91 9845012345',
    email: 'kavya.sharma@example.com',
    address: '12 Richmond Town, Bengaluru, Karnataka',
    emergency_contact: {
      name: 'Rohan Sharma',
      relationship: 'Spouse',
      phone: '+91 9845012346',
    },
    primary_doctor_id: 'DOC-101',
    insurance_policy_id: 'POL-725',
  },
  {
    patient_id: 'PAT-1005',
    first_name: 'Meera',
    last_name: 'Nair',
    date_of_birth: '1988-12-05',
    gender: 'Female',
    blood_group: 'O-',
    phone: '+91 9741223344',
    email: 'meera.nair@example.com',
    address: '102 HSR Layout Sector 2, Bengaluru, Karnataka',
    emergency_contact: {
      name: 'Vinod Nair',
      relationship: 'Spouse',
      phone: '+91 9741223345',
    },
    primary_doctor_id: 'DOC-101',
    insurance_policy_id: 'POL-705',
  },
  {
    patient_id: 'PAT-1006',
    first_name: 'Rajesh',
    last_name: 'Iyer',
    date_of_birth: '1963-09-29',
    gender: 'Male',
    blood_group: 'B+',
    phone: '+91 9448110099',
    email: 'rajesh.iyer@example.com',
    address: '77 Malleshwaram 15th Cross, Bengaluru, Karnataka',
    emergency_contact: {
      name: 'Lakshmi Iyer',
      relationship: 'Spouse',
      phone: '+91 9448110098',
    },
    primary_doctor_id: 'DOC-101',
    insurance_policy_id: 'POL-706',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// 2. DIAGNOSTIC LABORATORY REPORTS
// ─────────────────────────────────────────────────────────────────────────────

export const MOCK_LAB_REPORT: LabReportItem = {
  report_id: 'LABR-1001',
  patient_id: 'PAT-1001',
  laboratory_id: 'LAB-001',
  doctor_id: 'DOC-101',
  test_type: 'Comprehensive Blood & Lipid Panel',
  test_date: '2026-09-10',
  status: 'COMPLETED',
  results: [
    { parameter: 'Hemoglobin', value: 10.4, unit: 'g/dL', reference_range: '13.5 - 17.5', is_abnormal: true, abnormality_direction: 'LOW' },
    { parameter: 'Total Cholesterol', value: 215.0, unit: 'mg/dL', reference_range: '< 200', is_abnormal: true, abnormality_direction: 'HIGH' },
    { parameter: 'HDL Cholesterol', value: 44.0, unit: 'mg/dL', reference_range: '> 40', is_abnormal: false, abnormality_direction: 'NORMAL' },
    { parameter: 'LDL Cholesterol', value: 142.0, unit: 'mg/dL', reference_range: '< 100', is_abnormal: true, abnormality_direction: 'HIGH' },
    { parameter: 'Triglycerides', value: 168.0, unit: 'mg/dL', reference_range: '< 150', is_abnormal: true, abnormality_direction: 'HIGH' },
    { parameter: 'Fasting Blood Sugar', value: 92.0, unit: 'mg/dL', reference_range: '70 - 99', is_abnormal: false, abnormality_direction: 'NORMAL' },
    { parameter: 'Serum Creatinine', value: 0.95, unit: 'mg/dL', reference_range: '0.7 - 1.3', is_abnormal: false, abnormality_direction: 'NORMAL' },
  ],
};

export const MOCK_LAB_REPORT_ARUN_BASELINE: LabReportItem = {
  report_id: 'LABR-0990',
  patient_id: 'PAT-1001',
  laboratory_id: 'LAB-001',
  doctor_id: 'DOC-101',
  test_type: 'Comprehensive Blood & Lipid Panel (Baseline)',
  test_date: '2026-03-12',
  status: 'COMPLETED',
  results: [
    { parameter: 'Hemoglobin', value: 11.2, unit: 'g/dL', reference_range: '13.5 - 17.5', is_abnormal: true, abnormality_direction: 'LOW' },
    { parameter: 'Total Cholesterol', value: 228.0, unit: 'mg/dL', reference_range: '< 200', is_abnormal: true, abnormality_direction: 'HIGH' },
    { parameter: 'HDL Cholesterol', value: 41.0, unit: 'mg/dL', reference_range: '> 40', is_abnormal: false, abnormality_direction: 'NORMAL' },
    { parameter: 'LDL Cholesterol', value: 155.0, unit: 'mg/dL', reference_range: '< 100', is_abnormal: true, abnormality_direction: 'HIGH' },
    { parameter: 'Triglycerides', value: 185.0, unit: 'mg/dL', reference_range: '< 150', is_abnormal: true, abnormality_direction: 'HIGH' },
    { parameter: 'Fasting Blood Sugar', value: 98.0, unit: 'mg/dL', reference_range: '70 - 99', is_abnormal: false, abnormality_direction: 'NORMAL' },
    { parameter: 'Serum Creatinine', value: 0.98, unit: 'mg/dL', reference_range: '0.7 - 1.3', is_abnormal: false, abnormality_direction: 'NORMAL' },
  ],
};

export const MOCK_LAB_REPORT_2: LabReportItem = {
  report_id: 'LABR-1002',
  patient_id: 'PAT-1002',
  laboratory_id: 'LAB-001',
  doctor_id: 'DOC-102',
  test_type: 'Comprehensive Thyroid Function Panel',
  test_date: '2026-08-10',
  status: 'COMPLETED',
  results: [
    { parameter: 'Thyroid Stimulating Hormone (TSH)', value: 5.85, unit: 'uIU/mL', reference_range: '0.4 - 4.0', is_abnormal: true, abnormality_direction: 'HIGH' },
    { parameter: 'Free Thyroxine (FT4)', value: 1.05, unit: 'ng/dL', reference_range: '0.8 - 1.8', is_abnormal: false, abnormality_direction: 'NORMAL' },
    { parameter: 'Free Triiodothyronine (FT3)', value: 2.8, unit: 'pg/mL', reference_range: '2.3 - 4.2', is_abnormal: false, abnormality_direction: 'NORMAL' },
  ],
};

export const MOCK_LAB_REPORT_KAVYA: LabReportItem = {
  report_id: 'LABR-1025',
  patient_id: 'PAT-1025',
  laboratory_id: 'LAB-001',
  doctor_id: 'DOC-101',
  test_type: 'Complete Blood Count & Metabolic Profile',
  test_date: '2026-09-14',
  status: 'COMPLETED',
  results: [
    { parameter: 'Hemoglobin', value: 13.2, unit: 'g/dL', reference_range: '12.0 - 15.5', is_abnormal: false, abnormality_direction: 'NORMAL' },
    { parameter: 'Total Cholesterol', value: 175.0, unit: 'mg/dL', reference_range: '< 200', is_abnormal: false, abnormality_direction: 'NORMAL' },
    { parameter: 'Fasting Blood Sugar', value: 88.0, unit: 'mg/dL', reference_range: '70 - 99', is_abnormal: false, abnormality_direction: 'NORMAL' },
    { parameter: 'Serum Creatinine', value: 0.85, unit: 'mg/dL', reference_range: '0.6 - 1.2', is_abnormal: false, abnormality_direction: 'NORMAL' },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// 3. APPOINTMENTS & CONSULTATION SCHEDULE
// ─────────────────────────────────────────────────────────────────────────────

export const MOCK_APPOINTMENTS: AppointmentItem[] = [
  {
    appointment_id: 'APT-1001',
    patient_id: 'PAT-1001',
    doctor_id: 'DOC-101',
    hospital_id: 'HOSP-001',
    date: '2026-09-16',
    time_slot: '10:00-10:30',
    status: 'SCHEDULED',
    reason: 'Routine Cardiology Follow-up & Blood Pressure Check',
  },
  {
    appointment_id: 'APT-1025',
    patient_id: 'PAT-1025',
    doctor_id: 'DOC-101',
    hospital_id: 'HOSP-001',
    date: '2026-09-18',
    time_slot: '11:30-12:00',
    status: 'SCHEDULED',
    reason: 'Preventive Health Assessment & Vitamin D Follow-up',
  },
  {
    appointment_id: 'APT-1002',
    patient_id: 'PAT-1002',
    doctor_id: 'DOC-102',
    hospital_id: 'HOSP-001',
    date: '2026-09-16',
    time_slot: '10:30-11:00',
    status: 'SCHEDULED',
    reason: 'Thyroid Function Test Review & Dose Adjustment',
  },
  {
    appointment_id: 'APT-1003',
    patient_id: 'PAT-1003',
    doctor_id: 'DOC-101',
    hospital_id: 'HOSP-001',
    date: '2026-09-16',
    time_slot: '11:00-11:30',
    status: 'SCHEDULED',
    reason: 'Post-MI Rehabilitation & Lipid Re-evaluation',
  },
  {
    appointment_id: 'APT-1004',
    patient_id: 'PAT-1005',
    doctor_id: 'DOC-101',
    hospital_id: 'HOSP-001',
    date: '2026-09-16',
    time_slot: '11:45-12:15',
    status: 'SCHEDULED',
    reason: 'Pre-operative Cardiac Clearance for Elective Knee Arthroscopy',
  },
  {
    appointment_id: 'APT-1005',
    patient_id: 'PAT-1006',
    doctor_id: 'DOC-101',
    hospital_id: 'HOSP-001',
    date: '2026-09-16',
    time_slot: '14:00-14:30',
    status: 'SCHEDULED',
    reason: 'Hypertension Management & Serum Creatinine Review',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// 4. PRESCRIPTIONS & MEDICATION REGIMENS
// ─────────────────────────────────────────────────────────────────────────────

export const MOCK_PRESCRIPTIONS: PrescriptionItem[] = [
  {
    prescription_id: 'RX-1001',
    patient_id: 'PAT-1001',
    doctor_id: 'DOC-101',
    issued_date: '2026-09-10',
    medications: [
      { name: 'Amlodipine', dosage: '5 mg', frequency: 'Once daily (Morning)', duration_days: 90, instructions: 'Take with water after breakfast' },
      { name: 'Atorvastatin', dosage: '20 mg', frequency: 'Once daily (Bedtime)', duration_days: 90, instructions: 'Take at night before sleep' },
      { name: 'Ferrous Ascorbate (Iron Supplement)', dosage: '100 mg', frequency: 'Once daily (Night)', duration_days: 30, instructions: 'Take after dinner' },
    ],
    refills_remaining: 2,
  },
  {
    prescription_id: 'RX-1025',
    patient_id: 'PAT-1025',
    doctor_id: 'DOC-101',
    issued_date: '2026-09-12',
    medications: [
      { name: 'Cholecalciferol (Vitamin D3)', dosage: '60,000 IU', frequency: 'Once weekly', duration_days: 60, instructions: 'Take with milk after breakfast' },
      { name: 'Cetirizine Hydrochloride', dosage: '10 mg', frequency: 'Once daily as needed (Night)', duration_days: 30, instructions: 'Take at bedtime for allergic symptoms' },
    ],
    refills_remaining: 3,
  },
  {
    prescription_id: 'RX-1002',
    patient_id: 'PAT-1002',
    doctor_id: 'DOC-102',
    issued_date: '2026-08-10',
    medications: [
      { name: 'Levothyroxine Sodium', dosage: '50 mcg', frequency: 'Once daily (Early Morning)', duration_days: 60, instructions: 'Take on empty stomach 30 mins before breakfast' },
    ],
    refills_remaining: 3,
  },
  {
    prescription_id: 'RX-1003',
    patient_id: 'PAT-1003',
    doctor_id: 'DOC-101',
    issued_date: '2026-09-14',
    medications: [
      { name: 'Ramipril', dosage: '5 mg', frequency: 'Once daily (Morning)', duration_days: 90, instructions: 'Monitor blood pressure regularly' },
      { name: 'Metoprolol Succinate', dosage: '25 mg', frequency: 'Once daily (Morning)', duration_days: 90, instructions: 'Take with food' },
      { name: 'Furosemide', dosage: '20 mg', frequency: 'Once daily (Morning)', duration_days: 30, instructions: 'Take in morning' },
    ],
    refills_remaining: 2,
  },
  {
    prescription_id: 'RX-1006',
    patient_id: 'PAT-1006',
    doctor_id: 'DOC-101',
    issued_date: '2026-09-15',
    medications: [
      { name: 'Clopidogrel', dosage: '75 mg', frequency: 'Once daily (Morning)', duration_days: 30, instructions: 'Take with or without food' },
      { name: 'Aspirin (Ecosprin)', dosage: '75 mg', frequency: 'Once daily (Afternoon)', duration_days: 30, instructions: 'Take post-lunch with water' },
      { name: 'Rosuvastatin', dosage: '20 mg', frequency: 'Once daily (Bedtime)', duration_days: 90, instructions: 'Take before sleep' },
    ],
    refills_remaining: 2,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// 5. INPATIENT WARD BEDS (Nursing Clinical Operations)
// ─────────────────────────────────────────────────────────────────────────────

export const MOCK_INPATIENTS: InpatientBedItem[] = [
  {
    bed_id: 'BED-301-A',
    room: 'Room 301',
    ward: 'Ward 3 East (Cardiology / Telemetry)',
    patient_id: 'PAT-1001',
    patient_name: 'Arun Kumar',
    age: 42,
    gender: 'Male',
    acuity: 'Guarded',
    attending_doctor: 'Dr. Rajesh Mehta',
    admission_date: '2026-09-08',
    diagnosis: 'Hypertensive Urgency, Secondary Microcytic Anemia',
    allergies: ['Penicillin'],
    vitals: {
      bp: '138/88 mmHg',
      pulse: 78,
      spo2: 98,
      temp: '98.6°F',
      last_taken: '10 mins ago',
      status: 'normal',
    },
    pending_tasks_count: 2,
  },
  {
    bed_id: 'BED-301-B',
    room: 'Room 301',
    ward: 'Ward 3 East (Cardiology / Telemetry)',
    patient_id: 'PAT-1003',
    patient_name: 'Vikram Singh',
    age: 49,
    gender: 'Male',
    acuity: 'Urgent',
    attending_doctor: 'Dr. Rajesh Mehta',
    admission_date: '2024-09-07',
    diagnosis: 'Post-MI Day 3, Type 2 Diabetes Mellitus',
    allergies: ['Sulfa drugs'],
    vitals: {
      bp: '144/92 mmHg',
      pulse: 88,
      spo2: 96,
      temp: '99.1°F',
      last_taken: '25 mins ago',
      status: 'elevated',
    },
    pending_tasks_count: 4,
  },
  {
    bed_id: 'BED-304',
    room: 'Room 304',
    ward: 'Ward 3 East (Step-Down Unit)',
    patient_id: 'PAT-1004',
    patient_name: 'Harini Sundaram',
    age: 29,
    gender: 'Female',
    acuity: 'Stable',
    attending_doctor: 'Dr. Suresh Rao',
    admission_date: '2024-09-09',
    diagnosis: 'Acute Gastroenteritis, Mild Dehydration',
    allergies: ['None documented'],
    vitals: {
      bp: '118/74 mmHg',
      pulse: 72,
      spo2: 99,
      temp: '98.4°F',
      last_taken: '40 mins ago',
      status: 'normal',
    },
    pending_tasks_count: 1,
  },
  {
    bed_id: 'BED-201-ICU',
    room: 'ICU Bed 2',
    ward: 'Intensive Coronary Care Unit (ICCU)',
    patient_id: 'PAT-1006',
    patient_name: 'Rajesh Iyer',
    age: 61,
    gender: 'Male',
    acuity: 'Critical',
    attending_doctor: 'Dr. Rajesh Mehta',
    admission_date: '2024-09-09',
    diagnosis: 'Acute Coronary Syndrome, Troponin-T Elevation',
    allergies: ['Aspirin (Bronchospasm)'],
    vitals: {
      bp: '158/98 mmHg',
      pulse: 102,
      spo2: 94,
      temp: '99.4°F',
      last_taken: '5 mins ago',
      status: 'critical',
    },
    pending_tasks_count: 5,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// 6. EMAR TASKS (Medication Administration Records)
// ─────────────────────────────────────────────────────────────────────────────

export const MOCK_EMAR_TASKS: EmarTaskItem[] = [
  {
    task_id: 'EMAR-801',
    patient_id: 'PAT-1001',
    patient_name: 'Arun Kumar',
    bed_id: 'BED-301-A',
    medication: 'Amlodipine Besylate',
    dosage: '5 mg PO',
    route: 'Oral',
    scheduled_time: '08:00',
    status: 'ADMINISTERED',
    prescribed_by: 'Dr. Rajesh Mehta',
  },
  {
    task_id: 'EMAR-802',
    patient_id: 'PAT-1003',
    patient_name: 'Vikram Singh',
    bed_id: 'BED-301-B',
    medication: 'Metoprolol Tartrate',
    dosage: '25 mg PO',
    route: 'Oral',
    scheduled_time: '12:00',
    status: 'DUE',
    prescribed_by: 'Dr. Rajesh Mehta',
    notes: 'Hold if systolic BP < 100 or HR < 55 bpm',
  },
  {
    task_id: 'EMAR-803',
    patient_id: 'PAT-1004',
    patient_name: 'Harini Sundaram',
    bed_id: 'BED-304',
    medication: 'Normal Saline (0.9% NaCl)',
    dosage: '1000 mL IV infusion @ 125 mL/hr',
    route: 'Intravenous',
    scheduled_time: '12:00',
    status: 'DUE',
    prescribed_by: 'Dr. Suresh Rao',
  },
  {
    task_id: 'EMAR-804',
    patient_id: 'PAT-1006',
    patient_name: 'Rajesh Iyer',
    bed_id: 'BED-201-ICU',
    medication: 'Heparin Sodium',
    dosage: '800 units/hr IV continuous infusion',
    route: 'Intravenous Infusion',
    scheduled_time: '14:00',
    status: 'PENDING',
    prescribed_by: 'Dr. Rajesh Mehta',
    notes: 'Check aPTT every 6 hours',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// 7. LABORATORY WORK QUEUE (Diagnostics Lifecycle)
// ─────────────────────────────────────────────────────────────────────────────

export const MOCK_LAB_QUEUE: LabWorkQueueItem[] = [
  {
    specimen_id: 'SPEC-9011',
    patient_id: 'PAT-1006',
    patient_name: 'Rajesh Iyer',
    test_name: 'Cardiac Troponin-I (High Sensitivity)',
    section: 'Biochemistry',
    collected_at: '10:15 AM',
    turnaround_target_mins: 45,
    elapsed_mins: 22,
    priority: 'STAT',
    stage: 'CRITICAL_REVIEW',
    specimen_type: 'Heparinized Plasma',
    ordering_doctor: 'Dr. Rajesh Mehta',
    critical_alert: true,
  },
  {
    specimen_id: 'SPEC-9012',
    patient_id: 'PAT-1001',
    patient_name: 'Arun Kumar',
    test_name: 'Complete Blood Count (CBC) with Reticulocyte Count',
    section: 'Hematology',
    collected_at: '09:30 AM',
    turnaround_target_mins: 90,
    elapsed_mins: 65,
    priority: 'Urgent',
    stage: 'ANALYSIS',
    specimen_type: 'EDTA Whole Blood',
    ordering_doctor: 'Dr. Rajesh Mehta',
  },
  {
    specimen_id: 'SPEC-9013',
    patient_id: 'PAT-1003',
    patient_name: 'Vikram Singh',
    test_name: 'HbA1c & Fasting Lipid Panel',
    section: 'Biochemistry',
    collected_at: '08:45 AM',
    turnaround_target_mins: 120,
    elapsed_mins: 110,
    priority: 'Routine',
    stage: 'ANALYSIS',
    specimen_type: 'Serum Gel Tube',
    ordering_doctor: 'Dr. Rajesh Mehta',
  },
  {
    specimen_id: 'SPEC-9014',
    patient_id: 'PAT-1004',
    patient_name: 'Harini Sundaram',
    test_name: 'Serum Electrolytes (Na+, K+, Cl-, HCO3-)',
    section: 'Biochemistry',
    collected_at: '10:45 AM',
    turnaround_target_mins: 60,
    elapsed_mins: 15,
    priority: 'Urgent',
    stage: 'COLLECTED',
    specimen_type: 'Serum',
    ordering_doctor: 'Dr. Suresh Rao',
  },
  {
    specimen_id: 'SPEC-9015',
    patient_id: 'PAT-1002',
    patient_name: 'Sneha Sharma',
    test_name: 'Free T3, Free T4, TSH Panel',
    section: 'Immunology',
    collected_at: '08:15 AM',
    turnaround_target_mins: 180,
    elapsed_mins: 160,
    priority: 'Routine',
    stage: 'COMPLETED',
    specimen_type: 'Serum',
    ordering_doctor: 'Dr. Anita Deshmukh',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// 8. INSURANCE CLAIMS QUEUE (Payer Adjudication)
// ─────────────────────────────────────────────────────────────────────────────

export const MOCK_INSURANCE_CLAIMS: ClaimAdjudicationItem[] = [
  {
    claim_id: 'CLM-1001',
    patient_id: 'PAT-1001',
    patient_name: 'Arun Kumar',
    policy_id: 'POL-701',
    payer_name: 'Star Health & Allied Insurance',
    service_type: 'Inpatient',
    diagnosis_code: 'I10 / D50.9',
    diagnosis_desc: 'Hypertensive crisis with microcytic hypochromic anemia',
    claimed_amount: 4250,
    approved_amount: 3825,
    submitted_date: '2026-09-14',
    status: 'PRE_AUTHORIZED',
    required_action: 'Awaiting discharge summary for final settlement',
  },
  {
    claim_id: 'CLM-1002',
    patient_id: 'PAT-1003',
    patient_name: 'Vikram Singh',
    policy_id: 'POL-703',
    payer_name: 'Max Bupa Health Insurance',
    service_type: 'Inpatient',
    diagnosis_code: 'I21.9 / E11.9',
    diagnosis_desc: 'Acute myocardial infarction, Type 2 diabetes mellitus',
    claimed_amount: 9800,
    submitted_date: '2026-09-15',
    status: 'UNDER_REVIEW',
    required_action: 'Cardiac catheterization angiogram cine-loop review required',
  },
  {
    claim_id: 'CLM-1003',
    patient_id: 'PAT-1004',
    patient_name: 'Harini Sundaram',
    policy_id: 'POL-704',
    payer_name: 'HDFC ERGO Health',
    service_type: 'Emergency',
    diagnosis_code: 'A09 / E86.0',
    diagnosis_desc: 'Infectious gastroenteritis with volume depletion',
    claimed_amount: 1120,
    approved_amount: 1050,
    submitted_date: '2026-09-15',
    status: 'SETTLED',
    required_action: 'Settlement disbursed to hospital ledger',
  },
  {
    claim_id: 'CLM-1004',
    patient_id: 'PAT-1006',
    patient_name: 'Rajesh Iyer',
    policy_id: 'POL-706',
    payer_name: 'ICICI Lombard Health Care',
    service_type: 'Inpatient',
    diagnosis_code: 'I20.0',
    diagnosis_desc: 'Unstable angina, Emergency coronary care admission',
    claimed_amount: 7500,
    submitted_date: '2026-09-16',
    status: 'QUERY_RAISED',
    required_action: 'Pre-existing cardiovascular disclosure confirmation requested',
  },
  {
    claim_id: 'CLM-1025',
    patient_id: 'PAT-1025',
    patient_name: 'Kavya Sharma',
    policy_id: 'POL-725',
    payer_name: 'Star Health Gold Comprehensive',
    service_type: 'Outpatient',
    diagnosis_code: 'E55.9 / M79.7',
    diagnosis_desc: 'Severe Vitamin D deficiency with systemic fatigue and myalgia',
    claimed_amount: 850,
    approved_amount: 850,
    submitted_date: '2026-09-16',
    status: 'SETTLED',
    required_action: 'Direct claim settlement processed to pharmacy ledger',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// 9. HOSPITAL COMMAND OPERATIONS TELEMETRY
// ─────────────────────────────────────────────────────────────────────────────

export const MOCK_HOSPITAL_METRICS = {
  facility_id: 'HOSP-001',
  facility_name: 'MEDION Main Campus Hospital Network',
  timestamp: 'Live Operational Feed',
  bed_capacity: {
    total_licensed: 450,
    total_occupied: 382,
    occupancy_rate_pct: 84.8,
    icu_total: 40,
    icu_occupied: 38,
    icu_rate_pct: 95.0,
    er_beds_total: 30,
    er_occupied: 26,
  },
  emergency_department: {
    waiting_count: 14,
    average_wait_time_mins: 18,
    acuity_breakdown: { red: 2, amber: 5, green: 7 },
  },
  surgical_suites: {
    total_theatres: 8,
    active_now: 6,
    scheduled_today: 28,
    completed_today: 19,
  },
  diagnostics_turnaround: {
    stat_lab_tat_mins: 34,
    target_stat_mins: 45,
    mri_queue_count: 4,
    ct_queue_count: 2,
  },
  agent_orchestration_health: {
    active_workflows_last_hour: 142,
    success_rate_pct: 99.4,
    avg_response_latency_ms: 380,
    human_in_loop_approvals_pending: 3,
  },
};

export const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    notification_id: 'NOTIF-001',
    recipient_type: 'PATIENT',
    recipient_id: 'PAT-1001',
    title: 'Appointment Confirmed',
    message: 'Your consultation with Dr. Rajesh Mehta is scheduled for Sep 12, 2024 at 10:00 AM.',
    channel: 'SMS/IN_APP',
    status: 'DELIVERED',
    sent_at: '2024-09-09 10:00:00',
  },
  {
    notification_id: 'NOTIF-002',
    recipient_type: 'DOCTOR',
    recipient_id: 'DOC-101',
    title: 'Lab Report Ready for Review',
    message: 'Comprehensive Blood & Lipid Panel completed for Arun Kumar (PAT-1001). 2 abnormal values detected.',
    channel: 'IN_APP',
    status: 'DELIVERED',
    sent_at: '2024-09-09 11:30:00',
  },
  {
    notification_id: 'NOTIF-003',
    recipient_type: 'NURSE',
    recipient_id: 'NURSE-402',
    title: 'Medication Due Alert',
    message: 'eMAR: Scheduled 12:00 doses due for Ward 3 East (Bed 301-B, Bed 304).',
    channel: 'IN_APP',
    status: 'DELIVERED',
    sent_at: '2024-09-09 11:55:00',
  },
];

