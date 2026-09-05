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

export const MOCK_PATIENT: PatientProfile = {
  patient_id: 'PAT-1001',
  first_name: 'Arun',
  last_name: 'Kumar',
  date_of_birth: '1982-05-14',
  gender: 'Male',
  blood_group: 'O+',
  phone: '+91 9876543210',
  email: 'arun.kumar@example.com',
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
    email: 'sneha.sharma@example.com',
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
    email: 'vikram.singh@example.com',
    address: '88 Outer Ring Road, Whitefield, Bengaluru, Karnataka',
    emergency_contact: {
      name: 'Ananya Singh',
      relationship: 'Spouse',
      phone: '+91 9988776656',
    },
    primary_doctor_id: 'DOC-101',
    insurance_policy_id: 'POL-703',
  },
];

export const MOCK_LAB_REPORT: LabReportItem = {
  report_id: 'LABR-1001',
  patient_id: 'PAT-1001',
  laboratory_id: 'LAB-001',
  doctor_id: 'DOC-101',
  test_type: 'Comprehensive Blood & Lipid Panel',
  test_date: '2024-06-14',
  status: 'COMPLETED',
  results: [
    { parameter: 'Hemoglobin', value: 10.4, unit: 'g/dL', reference_range: '13.5 - 17.5', is_abnormal: true, abnormality_direction: 'LOW' },
    { parameter: 'Total Cholesterol', value: 215.0, unit: 'mg/dL', reference_range: '< 200', is_abnormal: true, abnormality_direction: 'HIGH' },
    { parameter: 'Fasting Blood Sugar', value: 92.0, unit: 'mg/dL', reference_range: '70 - 99', is_abnormal: false, abnormality_direction: 'NORMAL' },
  ],
};

export const MOCK_APPOINTMENTS: AppointmentItem[] = [
  {
    appointment_id: 'APT-1001',
    patient_id: 'PAT-1001',
    doctor_id: 'DOC-101',
    hospital_id: 'HOSP-001',
    date: '2024-09-10',
    time_slot: '10:00-10:30',
    status: 'SCHEDULED',
    reason: 'Routine Cardiology Follow-up & Blood Pressure Check',
  },
  {
    appointment_id: 'APT-1002',
    patient_id: 'PAT-1002',
    doctor_id: 'DOC-102',
    hospital_id: 'HOSP-001',
    date: '2024-09-12',
    time_slot: '11:30-12:00',
    status: 'SCHEDULED',
    reason: 'Thyroid Function Test Review',
  },
];

export const MOCK_PRESCRIPTIONS: PrescriptionItem[] = [
  {
    prescription_id: 'RX-1001',
    patient_id: 'PAT-1001',
    doctor_id: 'DOC-101',
    issued_date: '2024-06-15',
    medications: [
      { name: 'Amlodipine', dosage: '5 mg', frequency: 'Once daily (Morning)', duration_days: 90, instructions: 'Take with water after breakfast' },
      { name: 'Ferrous Ascorbate (Iron Supplement)', dosage: '100 mg', frequency: 'Once daily (Night)', duration_days: 30, instructions: 'Take after dinner' },
    ],
    refills_remaining: 2,
  },
  {
    prescription_id: 'RX-1002',
    patient_id: 'PAT-1002',
    doctor_id: 'DOC-102',
    issued_date: '2024-07-20',
    medications: [
      { name: 'Levothyroxine Sodium', dosage: '25 mcg', frequency: 'Once daily (Early Morning)', duration_days: 60, instructions: 'Take on empty stomach 30 mins before breakfast' },
    ],
    refills_remaining: 3,
  },
];

export const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    notification_id: 'NOTIF-1001',
    recipient_type: 'PATIENT',
    recipient_id: 'PAT-1001',
    title: 'Appointment Confirmed',
    message: 'Your cardiology appointment with Dr. Rajesh Mehta is confirmed for 2024-09-10 at 10:00 AM.',
    channel: 'SMS',
    status: 'SENT',
    sent_at: '2024-09-01T10:05:00Z',
  },
  {
    notification_id: 'NOTIF-1002',
    recipient_type: 'DOCTOR',
    recipient_id: 'DOC-101',
    title: 'Abnormal Lab Value Flagged',
    message: 'Patient Arun Kumar (PAT-1001) has low Hemoglobin (10.4 g/dL) in report LABR-1001.',
    channel: 'PORTAL',
    status: 'DELIVERED',
    sent_at: '2024-06-14T16:35:00Z',
  },
];
