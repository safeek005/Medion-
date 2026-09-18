import { useEffect, useState } from 'react';
import { PatientProfile, AppointmentItem, LabReportItem } from '../types';
import {
  MOCK_PATIENTS_LIST,
  MOCK_APPOINTMENTS,
  MOCK_LAB_REPORT,
  MOCK_LAB_REPORT_ARUN_BASELINE,
  MOCK_LAB_REPORT_KAVYA,
  MOCK_PRESCRIPTIONS,
  MOCK_NOTIFICATIONS,
  PrescriptionItem,
  NotificationItem,
} from '../data/mockDatasets';
import { getSupabaseClient, isSupabaseConfigured } from './supabaseClient';

// Keys for browser persistent storage
const DB_VERSION_KEY = 'medion_db_version';
const CURRENT_DB_VERSION = '2.6.0';

const STORAGE_KEYS = {
  PATIENTS: 'medion_db_patients',
  APPOINTMENTS: 'medion_db_appointments',
  LAB_REPORTS: 'medion_db_lab_reports',
  PRESCRIPTIONS: 'medion_db_prescriptions',
  POLICIES: 'medion_db_policies',
  CLAIMS: 'medion_db_claims',
  DOCTORS: 'medion_db_doctors',
  NOTIFICATIONS: 'medion_db_notifications',
  CONTEXT: 'medion_conversation_context',
};

// Default Doctors
export const INITIAL_DOCTORS = [
  {
    doctor_id: 'DOC-101',
    first_name: 'Rajesh',
    last_name: 'Mehta',
    specialty: 'Cardiology',
    hospital_id: 'HOSP-001',
    phone: '+91 9123456780',
    email: 'dr.mehta@medionhealth.org',
    available_days: ['Monday', 'Wednesday', 'Friday'],
    available_slots: ['09:00-09:30', '10:00-10:30', '11:00-11:30', '14:00-14:30', '15:00-15:30'],
  },
  {
    doctor_id: 'DOC-102',
    first_name: 'Anita',
    last_name: 'Deshmukh',
    specialty: 'Endocrinology',
    hospital_id: 'HOSP-001',
    phone: '+91 9123456781',
    email: 'dr.anita@medionhealth.org',
    available_days: ['Tuesday', 'Thursday', 'Saturday'],
    available_slots: ['09:30-10:00', '10:30-11:00', '11:30-12:00', '14:30-15:00'],
  },
  {
    doctor_id: 'DOC-103',
    first_name: 'Suresh',
    last_name: 'Rao',
    specialty: 'General Medicine',
    hospital_id: 'HOSP-002',
    phone: '+91 9123456782',
    email: 'dr.suresh@medionhealth.org',
    available_days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    available_slots: ['10:00-10:30', '11:00-11:30', '12:00-12:30', '15:00-15:30'],
  },
];

// Default Insurance Policies (Grounded in Master Data Layer)
export const INITIAL_POLICIES = [
  {
    policy_id: 'POL-701',
    patient_id: 'PAT-1001',
    provider_name: 'Star Health & Allied Insurance',
    policy_number: 'SH-CARD-2024-88492',
    plan_type: 'Comprehensive Family Floater',
    status: 'ACTIVE',
    coverage_limit: 500000,
    remaining_coverage: 485000,
    copay_percentage: 10,
    valid_until: '2027-12-31',
  },
  {
    policy_id: 'POL-702',
    patient_id: 'PAT-1002',
    provider_name: 'HDFC ERGO Health',
    policy_number: 'HE-OPT-2024-44510',
    plan_type: 'Optima Restore Individual',
    status: 'ACTIVE',
    coverage_limit: 300000,
    remaining_coverage: 290000,
    copay_percentage: 15,
    valid_until: '2027-12-31',
  },
  {
    policy_id: 'POL-703',
    patient_id: 'PAT-1003',
    provider_name: 'Star Health & Allied Insurance',
    policy_number: 'SH-SR-2024-99120',
    plan_type: 'Senior Citizens Red Carpet',
    status: 'ACTIVE',
    coverage_limit: 750000,
    remaining_coverage: 720000,
    copay_percentage: 20,
    valid_until: '2027-12-31',
  },
  {
    policy_id: 'POL-725',
    patient_id: 'PAT-1025',
    provider_name: 'Star Health & Allied Insurance',
    policy_number: 'SH-GOLD-2024-1025',
    plan_type: 'Star Health Gold Comprehensive',
    status: 'ACTIVE',
    coverage_limit: 600000,
    remaining_coverage: 580000,
    copay_percentage: 10,
    valid_until: '2027-12-31',
  },
];

// Default Claims
export const INITIAL_CLAIMS = [
  {
    claim_id: 'CLM-1001',
    patient_id: 'PAT-1001',
    policy_id: 'POL-701',
    provider_id: 'INS-001',
    bill_id: 'BILL-201',
    claim_amount: 15000,
    approved_amount: 13500,
    status: 'APPROVED',
    submitted_date: '2024-05-15T10:00:00Z',
    processed_date: '2024-05-18T14:30:00Z',
    adjudication_notes: 'Approved after 10% standard copay deduction.',
  },
  {
    claim_id: 'CLM-1025',
    patient_id: 'PAT-1025',
    policy_id: 'POL-725',
    provider_id: 'INS-501',
    bill_id: 'BILL-1025',
    claim_amount: 850,
    approved_amount: 850,
    status: 'APPROVED',
    submitted_date: '2026-09-16T08:30:00Z',
    processed_date: '2026-09-16T11:00:00Z',
    adjudication_notes: 'Prescription and diagnostic consultation pre-authorized and approved per policy terms (POL-725).',
  },
];

// Default Lab Reports
export const INITIAL_LAB_REPORTS: LabReportItem[] = [
  {
    ...MOCK_LAB_REPORT,
    status: 'RELEASED',
  },
  {
    report_id: 'LABR-1001-02',
    patient_id: 'PAT-1001',
    laboratory_id: 'LAB-001',
    doctor_id: 'DOC-101',
    test_type: 'Cardiac Biomarkers & Electrolyte Panel',
    test_date: '2026-09-16',
    status: 'RELEASED',
    results: [
      { parameter: 'Serum Sodium', value: 140.0, unit: 'mEq/L', reference_range: '135 - 145', is_abnormal: false, abnormality_direction: 'NORMAL' },
      { parameter: 'Serum Potassium', value: 4.2, unit: 'mEq/L', reference_range: '3.5 - 5.0', is_abnormal: false, abnormality_direction: 'NORMAL' },
      { parameter: 'hs-CRP', value: 3.2, unit: 'mg/L', reference_range: '< 1.0', is_abnormal: true, abnormality_direction: 'HIGH' },
      { parameter: 'Cardiac Troponin T', value: 0.01, unit: 'ng/mL', reference_range: '< 0.014', is_abnormal: false, abnormality_direction: 'NORMAL' },
    ],
  },
  MOCK_LAB_REPORT_ARUN_BASELINE,
  MOCK_LAB_REPORT_KAVYA,
  {
    report_id: 'LABR-1002',
    patient_id: 'PAT-1002',
    laboratory_id: 'LAB-001',
    doctor_id: 'DOC-102',
    test_type: 'Thyroid Function Profile (T3, T4, TSH)',
    test_date: '2026-08-10',
    status: 'RELEASED',
    results: [
      { parameter: 'TSH', value: 6.2, unit: 'uIU/mL', reference_range: '0.4 - 4.2', is_abnormal: true, abnormality_direction: 'HIGH' },
      { parameter: 'Free T4', value: 1.1, unit: 'ng/dL', reference_range: '0.8 - 1.8', is_abnormal: false, abnormality_direction: 'NORMAL' },
    ],
  },
  {
    report_id: 'LABR-1002-02',
    patient_id: 'PAT-1002',
    laboratory_id: 'LAB-001',
    doctor_id: 'DOC-102',
    test_type: 'Renal Function & Urinalysis Panel',
    test_date: '2026-09-16',
    status: 'RELEASED',
    results: [
      { parameter: 'Serum Creatinine', value: 0.85, unit: 'mg/dL', reference_range: '0.6 - 1.2', is_abnormal: false, abnormality_direction: 'NORMAL' },
      { parameter: 'Blood Urea Nitrogen', value: 15.0, unit: 'mg/dL', reference_range: '7 - 20', is_abnormal: false, abnormality_direction: 'NORMAL' },
      { parameter: 'eGFR', value: 95.0, unit: 'mL/min', reference_range: '> 90', is_abnormal: false, abnormality_direction: 'NORMAL' },
      { parameter: 'Microalbumin', value: 24.0, unit: 'mg/L', reference_range: '< 30', is_abnormal: false, abnormality_direction: 'NORMAL' },
    ],
  },
  {
    report_id: 'LABR-1003',
    patient_id: 'PAT-1003',
    laboratory_id: 'LAB-001',
    doctor_id: 'DOC-101',
    test_type: 'HbA1c & Glycemic Assessment',
    test_date: '2026-08-14',
    status: 'RELEASED',
    results: [
      { parameter: 'HbA1c', value: 7.8, unit: '%', reference_range: '< 5.7', is_abnormal: true, abnormality_direction: 'HIGH' },
      { parameter: 'Fasting Blood Sugar', value: 152, unit: 'mg/dL', reference_range: '70 - 99', is_abnormal: true, abnormality_direction: 'HIGH' },
    ],
  },
  {
    report_id: 'LABR-1003-02',
    patient_id: 'PAT-1003',
    laboratory_id: 'LAB-002',
    doctor_id: 'DOC-104',
    test_type: 'Arthritic & Joint Fluid Diagnostic Panel',
    test_date: '2026-09-15',
    status: 'RELEASED',
    results: [
      { parameter: 'Rheumatoid Factor', value: 12.0, unit: 'IU/mL', reference_range: '< 14', is_abnormal: false, abnormality_direction: 'NORMAL' },
      { parameter: 'Serum Uric Acid', value: 7.6, unit: 'mg/dL', reference_range: '3.5 - 7.2', is_abnormal: true, abnormality_direction: 'HIGH' },
      { parameter: '25-OH Vitamin D', value: 22.0, unit: 'ng/mL', reference_range: '30 - 100', is_abnormal: true, abnormality_direction: 'LOW' },
      { parameter: 'WBC Count', value: 6.8, unit: 'x10^3/uL', reference_range: '4.0 - 11.0', is_abnormal: false, abnormality_direction: 'NORMAL' },
    ],
  },
  {
    report_id: 'LABR-1004',
    patient_id: 'PAT-1004',
    laboratory_id: 'LAB-001',
    doctor_id: 'DOC-101',
    test_type: 'Cardiac Risk & Lipid Biomarker Panel',
    test_date: '2026-08-18',
    status: 'RELEASED',
    results: [
      { parameter: 'Total Cholesterol', value: 210, unit: 'mg/dL', reference_range: '< 200', is_abnormal: true, abnormality_direction: 'HIGH' },
      { parameter: 'LDL Cholesterol', value: 135, unit: 'mg/dL', reference_range: '< 100', is_abnormal: true, abnormality_direction: 'HIGH' },
      { parameter: 'HDL Cholesterol', value: 48, unit: 'mg/dL', reference_range: '> 40', is_abnormal: false, abnormality_direction: 'NORMAL' },
    ],
  },
  {
    report_id: 'LABR-1004-02',
    patient_id: 'PAT-1004',
    laboratory_id: 'LAB-001',
    doctor_id: 'DOC-105',
    test_type: 'Comprehensive Complete Blood Count',
    test_date: '2026-09-15',
    status: 'RELEASED',
    results: [
      { parameter: 'Hemoglobin', value: 12.8, unit: 'g/dL', reference_range: '12.0 - 16.0', is_abnormal: false, abnormality_direction: 'NORMAL' },
      { parameter: 'Platelets', value: 280.0, unit: 'x10^3/uL', reference_range: '150 - 450', is_abnormal: false, abnormality_direction: 'NORMAL' },
      { parameter: 'Eosinophils', value: 7.2, unit: '%', reference_range: '1.0 - 6.0', is_abnormal: true, abnormality_direction: 'HIGH' },
      { parameter: 'WBC', value: 7.5, unit: 'x10^3/uL', reference_range: '4.0 - 11.0', is_abnormal: false, abnormality_direction: 'NORMAL' },
    ],
  },
  {
    report_id: 'LABR-1005',
    patient_id: 'PAT-1005',
    laboratory_id: 'LAB-001',
    doctor_id: 'DOC-103',
    test_type: 'Complete Blood Count (CBC) with Differential',
    test_date: '2026-08-20',
    status: 'COMPLETED',
    results: [
      { parameter: 'WBC Count', value: 6.8, unit: 'K/uL', reference_range: '4.5 - 11.0', is_abnormal: false, abnormality_direction: 'NORMAL' },
      { parameter: 'Hemoglobin', value: 13.5, unit: 'g/dL', reference_range: '12.0 - 15.5', is_abnormal: false, abnormality_direction: 'NORMAL' },
      { parameter: 'Platelets', value: 245, unit: 'K/uL', reference_range: '150 - 450', is_abnormal: false, abnormality_direction: 'NORMAL' },
    ],
  },
  {
    report_id: 'LABR-1006',
    patient_id: 'PAT-1006',
    laboratory_id: 'LAB-001',
    doctor_id: 'DOC-101',
    test_type: 'Cardiovascular Biomarker & Troponin Panel',
    test_date: '2026-09-16',
    status: 'COMPLETED',
    results: [
      { parameter: 'Cardiac Troponin T', value: 0.048, unit: 'ng/mL', reference_range: '< 0.014', is_abnormal: true, abnormality_direction: 'HIGH' },
      { parameter: 'CK-MB', value: 6.5, unit: 'ng/mL', reference_range: '< 5.0', is_abnormal: true, abnormality_direction: 'HIGH' },
      { parameter: 'hs-CRP', value: 3.8, unit: 'mg/L', reference_range: '< 1.0', is_abnormal: true, abnormality_direction: 'HIGH' },
    ],
  },
  {
    report_id: 'LABR-1007',
    patient_id: 'PAT-1007',
    laboratory_id: 'LAB-001',
    doctor_id: 'DOC-103',
    test_type: 'Pulmonary Arterial Blood Gas & Electrolytes',
    test_date: '2026-09-02',
    status: 'COMPLETED',
    results: [
      { parameter: 'Arterial pH', value: 7.38, unit: '', reference_range: '7.35 - 7.45', is_abnormal: false, abnormality_direction: 'NORMAL' },
      { parameter: 'PaO2', value: 88, unit: 'mmHg', reference_range: '75 - 100', is_abnormal: false, abnormality_direction: 'NORMAL' },
    ],
  },
  {
    report_id: 'LABR-1008',
    patient_id: 'PAT-1008',
    laboratory_id: 'LAB-001',
    doctor_id: 'DOC-102',
    test_type: 'Hepatic Function & Liver Enzyme Panel',
    test_date: '2026-09-05',
    status: 'COMPLETED',
    results: [
      { parameter: 'ALT (SGPT)', value: 28, unit: 'U/L', reference_range: '7 - 56', is_abnormal: false, abnormality_direction: 'NORMAL' },
      { parameter: 'AST (SGOT)', value: 32, unit: 'U/L', reference_range: '10 - 40', is_abnormal: false, abnormality_direction: 'NORMAL' },
    ],
  },
  {
    report_id: 'LABR-1009',
    patient_id: 'PAT-1009',
    laboratory_id: 'LAB-001',
    doctor_id: 'DOC-103',
    test_type: 'Renal Function & Electrolyte Profile',
    test_date: '2026-09-08',
    status: 'COMPLETED',
    results: [
      { parameter: 'Serum Creatinine', value: 0.9, unit: 'mg/dL', reference_range: '0.6 - 1.2', is_abnormal: false, abnormality_direction: 'NORMAL' },
      { parameter: 'Blood Urea Nitrogen', value: 14, unit: 'mg/dL', reference_range: '7 - 20', is_abnormal: false, abnormality_direction: 'NORMAL' },
    ],
  },
  {
    report_id: 'LABR-1010',
    patient_id: 'PAT-1010',
    laboratory_id: 'LAB-001',
    doctor_id: 'DOC-103',
    test_type: 'General Outpatient Diagnostic Screening',
    test_date: '2026-09-12',
    status: 'COMPLETED',
    results: [
      { parameter: 'Hemoglobin', value: 14.2, unit: 'g/dL', reference_range: '13.5 - 17.5', is_abnormal: false, abnormality_direction: 'NORMAL' },
      { parameter: 'Total Cholesterol', value: 175, unit: 'mg/dL', reference_range: '< 200', is_abnormal: false, abnormality_direction: 'NORMAL' },
    ],
  },
  {
    report_id: 'LABR-1044-01',
    patient_id: 'PAT-1044',
    laboratory_id: 'LAB-001',
    doctor_id: 'DOC-101',
    test_type: 'Complete Blood Count (CBC)',
    test_date: '2026-09-16',
    status: 'RELEASED',
    results: [
      { parameter: 'Hemoglobin', value: 13.8, unit: 'g/dL', reference_range: '12.0 - 16.0', is_abnormal: false, abnormality_direction: 'NORMAL' },
      { parameter: 'WBC', value: 7.2, unit: 'x10^3/uL', reference_range: '4.0 - 11.0', is_abnormal: false, abnormality_direction: 'NORMAL' },
      { parameter: 'Platelets', value: 245, unit: 'x10^3/uL', reference_range: '150 - 450', is_abnormal: false, abnormality_direction: 'NORMAL' },
      { parameter: 'Hematocrit', value: 41, unit: '%', reference_range: '36 - 46', is_abnormal: false, abnormality_direction: 'NORMAL' },
    ],
  },
  {
    report_id: 'LABR-1044-02',
    patient_id: 'PAT-1044',
    laboratory_id: 'LAB-001',
    doctor_id: 'DOC-101',
    test_type: 'Comprehensive Metabolic Panel',
    test_date: '2026-09-17',
    status: 'RELEASED',
    results: [
      { parameter: 'Fasting Glucose', value: 108, unit: 'mg/dL', reference_range: '70 - 99', is_abnormal: true, abnormality_direction: 'HIGH' },
      { parameter: 'Creatinine', value: 0.9, unit: 'mg/dL', reference_range: '0.6 - 1.2', is_abnormal: false, abnormality_direction: 'NORMAL' },
      { parameter: 'ALT', value: 28, unit: 'U/L', reference_range: '7 - 56', is_abnormal: false, abnormality_direction: 'NORMAL' },
      { parameter: 'AST', value: 25, unit: 'U/L', reference_range: '10 - 40', is_abnormal: false, abnormality_direction: 'NORMAL' },
    ],
  },
  {
    report_id: 'LABR-1044-03',
    patient_id: 'PAT-1044',
    laboratory_id: 'LAB-001',
    doctor_id: 'DOC-101',
    test_type: 'Lipid Profile',
    test_date: '2026-09-17',
    status: 'RELEASED',
    results: [
      { parameter: 'Total Cholesterol', value: 198, unit: 'mg/dL', reference_range: '< 200', is_abnormal: false, abnormality_direction: 'NORMAL' },
      { parameter: 'LDL Cholesterol', value: 124, unit: 'mg/dL', reference_range: '< 100', is_abnormal: true, abnormality_direction: 'HIGH' },
      { parameter: 'HDL Cholesterol', value: 52, unit: 'mg/dL', reference_range: '> 40', is_abnormal: false, abnormality_direction: 'NORMAL' },
      { parameter: 'Triglycerides', value: 138, unit: 'mg/dL', reference_range: '< 150', is_abnormal: false, abnormality_direction: 'NORMAL' },
    ],
  },
];

// In-Memory fallback for non-browser or disabled storage
const memoryStore: Record<string, any> = {};

function getStorageItem<T>(key: string, fallback: T): T {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const val = window.localStorage.getItem(key);
      if (val) return JSON.parse(val);
    }
  } catch (e) {
    console.warn(`[MEDION DataLayer] Error reading localStorage key: ${key}`, e);
  }
  return memoryStore[key] !== undefined ? memoryStore[key] : fallback;
}

function setStorageItem<T>(key: string, value: T): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, JSON.stringify(value));
    }
  } catch (e) {
    console.warn(`[MEDION DataLayer] Error writing localStorage key: ${key}`, e);
  }
  memoryStore[key] = value;
}

// Event Dispatcher for cross-component and cross-tab UI synchronization
export type DBChangeEvent = {
  table: 'patients' | 'appointments' | 'lab_reports' | 'insurance' | 'claims' | 'prescriptions' | 'context' | 'doctors' | 'policies' | 'notifications';
  action: 'create' | 'update' | 'delete' | 'reset';
  data?: any;
};

const DB_EVENT_NAME = 'medion:db:change';

function emitDbChange(event: DBChangeEvent) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(DB_EVENT_NAME, { detail: event }));
  }
}

/**
 * Shared Persistent Healthcare Database Service
 * Single Source of Truth for MEDION AI Agent and Frontend UI
 */
class SharedDataService {
  constructor() {
    this.sanitizeAndMigrate();
    this.initializeIfEmpty();
    this.syncFromSupabase();
  }

  private sanitizeAndMigrate() {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return;
      const storedVersion = window.localStorage.getItem(DB_VERSION_KEY);
      if (storedVersion !== CURRENT_DB_VERSION) {
        console.info(`[MEDION DataLayer] Migrating storage from ${storedVersion || 'legacy'} to ${CURRENT_DB_VERSION}. Purging stale cache.`);
        // Purge old patient, appointments, prescriptions, policies, labs and context cache contaminated with mock defaults
        window.localStorage.removeItem(STORAGE_KEYS.PATIENTS);
        window.localStorage.removeItem(STORAGE_KEYS.APPOINTMENTS);
        window.localStorage.removeItem(STORAGE_KEYS.PRESCRIPTIONS);
        window.localStorage.removeItem(STORAGE_KEYS.POLICIES);
        window.localStorage.removeItem(STORAGE_KEYS.LAB_REPORTS);
        window.localStorage.removeItem(STORAGE_KEYS.CONTEXT);
        window.localStorage.setItem(DB_VERSION_KEY, CURRENT_DB_VERSION);
      } else {
        // Surgical purge of any phantom patient records containing hallucinated defaults
        const rawPatients = window.localStorage.getItem(STORAGE_KEYS.PATIENTS);
        if (rawPatients) {
          const list: PatientProfile[] = JSON.parse(rawPatients);
          let modified = false;
          const cleaned = list.map((p) => {
            const isBaseSeed = p.patient_id === 'PAT-1001' || p.patient_id === 'PAT-1002' || p.patient_id === 'PAT-1003';
            if (!isBaseSeed) {
              if (p.primary_doctor_id === 'DOC-101') { p.primary_doctor_id = null; modified = true; }
              if (p.insurance_policy_id === 'POL-701') { p.insurance_policy_id = null; modified = true; }
              if (p.blood_group === 'O+') { p.blood_group = null; modified = true; }
              if (p.emergency_contact && typeof p.emergency_contact === 'string' && (p.emergency_contact.includes('Family') || p.emergency_contact.includes('Contact'))) {
                p.emergency_contact = null;
                modified = true;
              }
              if (p.emergency_contact && typeof p.emergency_contact === 'object' && (p.emergency_contact as any).name === 'Family Emergency Contact') {
                p.emergency_contact = null;
                modified = true;
              }
            }
            return p;
          });
          if (modified) {
            window.localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(cleaned));
          }
        }
      }
    } catch (e) {
      console.warn('[MEDION DataLayer] Migration error:', e);
    }
  }

  public isFallbackAllowed(): boolean {
    const envVal = (import.meta as any).env?.VITE_ENABLE_MOCK_FALLBACK;
    return envVal === 'true' || envVal === true || envVal === '1';
  }

  public async syncFromSupabase(): Promise<void> {
    const sb = getSupabaseClient();
    if (!sb) {
      if (!this.isFallbackAllowed()) {
        console.warn('[MEDION DataLayer] Supabase is not configured and mock fallback is disabled.');
      }
      return;
    }

    try {
      // 1. Fetch Patients
      const { data: patients, error: pErr } = await sb.from('patients').select('*').order('created_at', { ascending: false });
      if (pErr) {
        if (!this.isFallbackAllowed()) {
          console.error('[MEDION Supabase Sync Error] Failed to fetch patients:', pErr.message);
        }
      } else if (patients && patients.length > 0) {
        const normalized: PatientProfile[] = patients.map((p: any) => ({
          patient_id: p.patient_id,
          first_name: p.first_name,
          last_name: p.last_name,
          date_of_birth: p.date_of_birth || p.dob || '',
          dob: p.dob || p.date_of_birth || '',
          gender: p.gender || '',
          blood_group: p.blood_group || null,
          phone: p.phone || '',
          email: p.email || null,
          address: p.address || null,
          emergency_contact: p.emergency_contact?.name ? p.emergency_contact : (typeof p.emergency_contact === 'string' && p.emergency_contact.trim() ? p.emergency_contact : null),
          primary_doctor_id: p.primary_doctor_id || null,
          insurance_policy_id: p.insurance_policy_id || null,
        }));
        setStorageItem(STORAGE_KEYS.PATIENTS, normalized);
        emitDbChange({ table: 'patients', action: 'create' });
      }

      // 2. Fetch Appointments
      const { data: appointments, error: aErr } = await sb.from('appointments').select('*').order('created_at', { ascending: false });
      if (!aErr && appointments && appointments.length > 0) {
        const normalizedApts: AppointmentItem[] = appointments.map((a: any) => ({
          appointment_id: a.appointment_id,
          patient_id: a.patient_id,
          doctor_id: a.doctor_id,
          hospital_id: a.hospital_id,
          date: a.date || a.appointment_date || '',
          time_slot: a.time_slot || '',
          status: a.status || 'SCHEDULED',
          reason: a.reason || a.reason_for_visit || '',
          cancelled_by: a.cancelled_by || undefined,
          cancelled_at: a.cancelled_at || undefined,
          cancellation_reason: a.cancellation_reason || undefined,
        }));
        setStorageItem(STORAGE_KEYS.APPOINTMENTS, normalizedApts);
        emitDbChange({ table: 'appointments', action: 'create' });
      }

      // 3. Fetch Doctors
      const { data: doctors, error: dErr } = await sb.from('doctors').select('*');
      if (!dErr && doctors && doctors.length > 0) {
        setStorageItem(STORAGE_KEYS.DOCTORS, doctors);
      }

      // 4. Fetch Lab Reports
      const { data: labReports, error: lErr } = await sb.from('lab_reports').select('*');
      if (!lErr && labReports && labReports.length > 0) {
        setStorageItem(STORAGE_KEYS.LAB_REPORTS, labReports);
        emitDbChange({ table: 'lab_reports', action: 'create' });
      }

      // 5. Fetch Policies
      const { data: policies, error: polErr } = await sb.from('insurance_policies').select('*');
      if (!polErr && policies && policies.length > 0) {
        setStorageItem(STORAGE_KEYS.POLICIES, policies);
      }

      // 6. Fetch Claims
      const { data: claims, error: cErr } = await sb.from('insurance_claims').select('*');
      if (!cErr && claims && claims.length > 0) {
        setStorageItem(STORAGE_KEYS.CLAIMS, claims);
        emitDbChange({ table: 'claims', action: 'create' });
      }

      // 7. Fetch Prescriptions
      const { data: rxList, error: rxErr } = await sb.from('prescriptions').select('*').order('created_at', { ascending: false });
      if (!rxErr && rxList && rxList.length > 0) {
        setStorageItem(STORAGE_KEYS.PRESCRIPTIONS, rxList);
        emitDbChange({ table: 'prescriptions', action: 'create' });
      }
    } catch (err) {
      console.warn('[MEDION DataLayer] Supabase sync caught:', err);
    }
  }

  private initializeIfEmpty() {
    const existingPatients = getStorageItem<PatientProfile[]>(STORAGE_KEYS.PATIENTS, []);
    if (!existingPatients || existingPatients.length === 0) {
      setStorageItem(STORAGE_KEYS.PATIENTS, MOCK_PATIENTS_LIST);
    } else {
      let updatedP = false;
      const mergedP = [...existingPatients];
      for (const initP of MOCK_PATIENTS_LIST) {
        if (!mergedP.some((p) => p.patient_id.toUpperCase() === initP.patient_id.toUpperCase())) {
          mergedP.push(initP);
          updatedP = true;
        }
      }
      if (updatedP) {
        setStorageItem(STORAGE_KEYS.PATIENTS, mergedP);
      }
    }

    if (!getStorageItem(STORAGE_KEYS.APPOINTMENTS, null)) {
      setStorageItem(STORAGE_KEYS.APPOINTMENTS, MOCK_APPOINTMENTS);
    }

    const existingReports = getStorageItem<LabReportItem[]>(STORAGE_KEYS.LAB_REPORTS, []);
    if (!existingReports || existingReports.length === 0) {
      setStorageItem(STORAGE_KEYS.LAB_REPORTS, INITIAL_LAB_REPORTS);
    } else {
      let updated = false;
      const merged = [...existingReports];
      for (const initR of INITIAL_LAB_REPORTS) {
        if (!merged.some((r) => r.report_id === initR.report_id)) {
          merged.push(initR);
          updated = true;
        }
      }
      if (updated) {
        setStorageItem(STORAGE_KEYS.LAB_REPORTS, merged);
      }
    }

    if (!getStorageItem(STORAGE_KEYS.PRESCRIPTIONS, null)) {
      setStorageItem(STORAGE_KEYS.PRESCRIPTIONS, MOCK_PRESCRIPTIONS);
    }
    if (!getStorageItem(STORAGE_KEYS.POLICIES, null)) {
      setStorageItem(STORAGE_KEYS.POLICIES, INITIAL_POLICIES);
    }
    if (!getStorageItem(STORAGE_KEYS.CLAIMS, null)) {
      setStorageItem(STORAGE_KEYS.CLAIMS, INITIAL_CLAIMS);
    }
    if (!getStorageItem(STORAGE_KEYS.DOCTORS, null)) {
      setStorageItem(STORAGE_KEYS.DOCTORS, INITIAL_DOCTORS);
    }
  }

  // ----------------------------------------------------
  // PATIENTS
  // ----------------------------------------------------

  getPatients(): PatientProfile[] {
    return getStorageItem<PatientProfile[]>(STORAGE_KEYS.PATIENTS, MOCK_PATIENTS_LIST);
  }

  getPatientById(patientId: string): PatientProfile | null {
    const list = this.getPatients();
    return list.find((p) => p.patient_id.toUpperCase() === patientId.toUpperCase()) || null;
  }

  searchPatients(query: string): PatientProfile[] {
    const q = (query || '').toLowerCase().trim();
    if (!q) return this.getPatients();
    return this.getPatients().filter((p) => {
      const fullName = `${p.first_name} ${p.last_name}`.toLowerCase();
      return (
        fullName.includes(q) ||
        p.patient_id.toLowerCase().includes(q) ||
        (p.phone && p.phone.includes(q)) ||
        (p.email && p.email.toLowerCase().includes(q))
      );
    });
  }

  generatePatientId(): string {
    const list = this.getPatients();
    let maxId = 1000;
    list.forEach((p) => {
      const match = p.patient_id.match(/PAT-(\d+)/i);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxId) maxId = num;
      }
    });
    return `PAT-${maxId + 1}`;
  }

  createPatient(patientData: Partial<PatientProfile> & { first_name?: string; last_name?: string; full_name?: string; dob?: string }): PatientProfile {
    const list = this.getPatients();
    
    // Parse names if provided as full_name
    let firstName = patientData.first_name || '';
    let lastName = patientData.last_name || '';
    if (!firstName && patientData.full_name) {
      const parts = patientData.full_name.trim().split(' ');
      firstName = parts[0];
      lastName = parts.slice(1).join(' ');
    }

    const newPatient: PatientProfile = {
      patient_id: patientData.patient_id || this.generatePatientId(),
      first_name: firstName,
      last_name: lastName,
      date_of_birth: patientData.dob || patientData.date_of_birth || '',
      gender: patientData.gender || '',
      blood_group: patientData.blood_group || null as any,
      phone: patientData.phone || '',
      email: patientData.email || null as any,
      address: patientData.address || null as any,
      emergency_contact: (patientData.emergency_contact && typeof patientData.emergency_contact === 'object' && (patientData.emergency_contact as any).name)
        ? patientData.emergency_contact
        : (typeof patientData.emergency_contact === 'string' && (patientData.emergency_contact as string).trim() ? patientData.emergency_contact : null as any),
      primary_doctor_id: patientData.primary_doctor_id || null as any,
      insurance_policy_id: patientData.insurance_policy_id || null as any,
    };

    // Avoid duplicate IDs if already registered
    const existingIdx = list.findIndex((p) => p.patient_id === newPatient.patient_id);
    let updatedList: PatientProfile[];
    if (existingIdx >= 0) {
      updatedList = [...list];
      updatedList[existingIdx] = newPatient;
    } else {
      updatedList = [newPatient, ...list];
    }

    setStorageItem(STORAGE_KEYS.PATIENTS, updatedList);
    emitDbChange({ table: 'patients', action: 'create', data: newPatient });

    // Auto-create a synthetic baseline lab report & policy for newly registered patients if none exist
    setTimeout(() => {
      const existingLabs = this.getLabReportsForPatient(newPatient.patient_id);
      if (existingLabs.length === 0) {
        this.addLabReport({
          report_id: `LABR-${newPatient.patient_id.replace('PAT-', '')}`,
          patient_id: newPatient.patient_id,
          laboratory_id: 'LAB-001',
          doctor_id: newPatient.primary_doctor_id || 'DOC-101',
          test_type: 'Comprehensive Outpatient Screening & Metabolic Panel',
          test_date: new Date().toISOString().split('T')[0],
          status: 'COMPLETED',
          results: [
            { parameter: 'Hemoglobin', value: 13.8, unit: 'g/dL', reference_range: '12.0 - 16.0', is_abnormal: false, abnormality_direction: 'NORMAL' },
            { parameter: 'Fasting Blood Sugar', value: 92, unit: 'mg/dL', reference_range: '70 - 99', is_abnormal: false, abnormality_direction: 'NORMAL' },
            { parameter: 'Total Cholesterol', value: 180, unit: 'mg/dL', reference_range: '< 200', is_abnormal: false, abnormality_direction: 'NORMAL' },
            { parameter: 'Serum Creatinine', value: 0.9, unit: 'mg/dL', reference_range: '0.6 - 1.2', is_abnormal: false, abnormality_direction: 'NORMAL' },
          ],
        });
      }
      const existingPolicy = this.getPolicyByPatientId(newPatient.patient_id);
      if (!existingPolicy) {
        const autoPolicy = {
          policy_id: `POL-${newPatient.patient_id.replace('PAT-', '')}`,
          patient_id: newPatient.patient_id,
          provider_name: 'Star Health & Allied Insurance',
          policy_number: `SH-GEN-${newPatient.patient_id.replace('PAT-', '')}`,
          plan_type: 'Comprehensive Individual Care',
          status: 'ACTIVE',
          coverage_limit: 500000,
          remaining_coverage: 490000,
          copay_percentage: 10,
          valid_until: '2027-12-31',
        };
        const policies = this.getPolicies();
        setStorageItem(STORAGE_KEYS.POLICIES, [autoPolicy, ...policies]);
        emitDbChange({ table: 'policies', action: 'create', data: autoPolicy });
      }
    }, 50);

    // Persist to Supabase PostgreSQL
    const sb = getSupabaseClient();
    if (sb) {
      sb.from('patients').upsert({
        patient_id: newPatient.patient_id,
        first_name: newPatient.first_name,
        last_name: newPatient.last_name,
        dob: newPatient.date_of_birth || null,
        gender: newPatient.gender || null,
        blood_group: newPatient.blood_group || null,
        phone: newPatient.phone || null,
        email: newPatient.email || null,
        address: newPatient.address || null,
        emergency_contact: newPatient.emergency_contact || null,
        primary_doctor_id: newPatient.primary_doctor_id || null,
        insurance_policy_id: newPatient.insurance_policy_id || null,
      }).then(({ error }) => {
        if (error) {
          console.error('[MEDION Supabase] Patient upsert failed:', error.message);
          if (!this.isFallbackAllowed()) {
            throw new Error(`Database error: ${error.message}`);
          }
        }
      });
    } else if (!this.isFallbackAllowed()) {
      throw new Error("Supabase database is not configured and mock fallback is disabled.");
    }

    return newPatient;
  }

  updatePatient(patientId: string, updates: Partial<PatientProfile>): PatientProfile | null {
    const list = this.getPatients();
    const idx = list.findIndex((p) => p.patient_id.toUpperCase() === patientId.toUpperCase());
    if (idx === -1) return null;

    const updated = { ...list[idx], ...updates };
    list[idx] = updated;
    setStorageItem(STORAGE_KEYS.PATIENTS, list);
    emitDbChange({ table: 'patients', action: 'update', data: updated });

    // Persist to Supabase PostgreSQL
    const sb = getSupabaseClient();
    if (sb) {
      sb.from('patients').update({
        ...updates,
        dob: (updates as any).dob || updates.date_of_birth,
        updated_at: new Date().toISOString(),
      }).eq('patient_id', patientId).then(({ error }) => {
        if (error) console.warn('[MEDION Supabase] Patient update failed:', error.message);
      });
    }

    return updated;
  }

  // ----------------------------------------------------
  // APPOINTMENTS
  // ----------------------------------------------------

  getAppointments(): AppointmentItem[] {
    const list = getStorageItem<AppointmentItem[]>(STORAGE_KEYS.APPOINTMENTS, MOCK_APPOINTMENTS);
    // Strict deduplication by appointment_id
    const seen = new Set<string>();
    const uniqueList: AppointmentItem[] = [];
    for (const apt of list) {
      const key = apt.appointment_id ? apt.appointment_id.toUpperCase() : null;
      if (key && !seen.has(key)) {
        seen.add(key);
        uniqueList.push(apt);
      }
    }
    return uniqueList;
  }

  getAppointmentById(appointmentId: string): AppointmentItem | null {
    const list = this.getAppointments();
    return list.find((a) => a.appointment_id.toUpperCase() === appointmentId.toUpperCase()) || null;
  }

  generateAppointmentId(): string {
    const list = this.getAppointments();
    let maxId = 1000;
    list.forEach((a) => {
      const match = a.appointment_id.match(/APT-(\d+)/i);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxId) maxId = num;
      }
    });
    return `APT-${maxId + 1}`;
  }

  bookAppointment(aptData: Partial<AppointmentItem> & { appointment_date?: string; reason_for_visit?: string }): AppointmentItem {
    const list = this.getAppointments();

    const patientId = aptData.patient_id || 'PAT-1001';
    let patientName = aptData.patient_name;
    if (!patientName) {
      const p = this.getPatientById(patientId);
      if (p) patientName = `${p.first_name} ${p.last_name}`;
    }

    const doctorId = aptData.doctor_id || 'DOC-101';
    let doctorName = aptData.doctor_name;
    let specialty = aptData.specialty;
    if (!doctorName || !specialty) {
      const d = this.getDoctorById(doctorId);
      if (d) {
        if (!doctorName) doctorName = `Dr. ${d.first_name} ${d.last_name}`;
        if (!specialty) specialty = d.specialty;
      }
    }

    const date = aptData.date || aptData.appointment_date || new Date().toISOString().split('T')[0];
    const timeSlot = aptData.time_slot || '10:00-10:30';

    // IDEMPOTENCY CHECK:
    // If an active appointment for this exact patient, doctor, date, and slot already exists,
    // prevent duplicate insertion and return the existing record.
    const existingActive = list.find(
      (a) =>
        a.status !== 'CANCELLED' &&
        a.patient_id.toUpperCase() === patientId.toUpperCase() &&
        a.doctor_id.toUpperCase() === doctorId.toUpperCase() &&
        a.date === date &&
        a.time_slot === timeSlot
    );
    if (existingActive) {
      return existingActive;
    }

    const newApt: AppointmentItem = {
      appointment_id: aptData.appointment_id || this.generateAppointmentId(),
      patient_id: patientId,
      patient_name: patientName,
      doctor_id: doctorId,
      doctor_name: doctorName,
      specialty: specialty,
      hospital_id: aptData.hospital_id || 'HOSP-001',
      date: date,
      time_slot: timeSlot,
      status: (aptData.status as any) || 'SCHEDULED',
      reason: aptData.reason || aptData.reason_for_visit || 'Clinical Consultation',
    };

    // Check if ID exists, if so update, else prepend
    const existingIdx = list.findIndex((a) => a.appointment_id.toUpperCase() === newApt.appointment_id.toUpperCase());
    let updatedList: AppointmentItem[];
    if (existingIdx >= 0) {
      updatedList = [...list];
      updatedList[existingIdx] = newApt;
    } else {
      updatedList = [newApt, ...list];
    }

    setStorageItem(STORAGE_KEYS.APPOINTMENTS, updatedList);
    emitDbChange({ table: 'appointments', action: 'create', data: newApt });

    // Persist to Supabase PostgreSQL
    const sb = getSupabaseClient();
    if (sb) {
      sb.from('appointments').upsert({
        ...newApt,
        appointment_date: newApt.date,
        reason_for_visit: newApt.reason,
      }).then(({ error }) => {
        if (error) console.warn('[MEDION Supabase] Appointment booking failed:', error.message);
      });
    }

    return newApt;
  }

  cancelAppointment(
    appointmentId: string,
    options?: { status?: string; cancelled_by?: string; cancellation_reason?: string }
  ): AppointmentItem | null {
    const list = this.getAppointments();
    const idx = list.findIndex((a) => a.appointment_id.toUpperCase() === appointmentId.toUpperCase());
    if (idx === -1) return null;

    const newStatus = options?.status || 'CANCELLED';
    const cancelledBy = options?.cancelled_by || 'patient';
    const cancellationReason = options?.cancellation_reason || 'Cancelled by user';
    const cancelledAt = new Date().toISOString();

    list[idx] = {
      ...list[idx],
      status: newStatus,
      cancelled_by: cancelledBy,
      cancelled_at: cancelledAt,
      cancellation_reason: cancellationReason,
    };
    setStorageItem(STORAGE_KEYS.APPOINTMENTS, list);
    emitDbChange({ table: 'appointments', action: 'update', data: list[idx] });

    // Persist to Supabase PostgreSQL
    const sb = getSupabaseClient();
    if (sb) {
      sb.from('appointments').update({
        status: newStatus,
        cancelled_by: cancelledBy,
        cancelled_at: cancelledAt,
        cancellation_reason: cancellationReason,
        updated_at: cancelledAt,
      }).eq('appointment_id', appointmentId).then(({ error }) => {
        if (error) console.warn('[MEDION Supabase] Appointment cancel failed:', error.message);
      });
    }

    // Trigger patient notification if cancelled by doctor
    if (newStatus === 'CANCELLED_BY_DOCTOR' || cancelledBy === 'doctor' || cancelledBy === 'DOC-101') {
      this.notifyAppointmentCancelledByDoctor(list[idx], cancellationReason);
    }

    return list[idx];
  }

  // ----------------------------------------------------
  // NOTIFICATIONS & ALERTS
  // ----------------------------------------------------

  getNotifications(patientId?: string): NotificationItem[] {
    const list = getStorageItem<NotificationItem[]>(STORAGE_KEYS.NOTIFICATIONS, MOCK_NOTIFICATIONS);
    if (patientId) {
      const pidUpper = patientId.toUpperCase();
      return list.filter(
        (n) =>
          (n.recipient_id && n.recipient_id.toUpperCase() === pidUpper) ||
          (n.patient_id && n.patient_id.toUpperCase() === pidUpper)
      );
    }
    return list;
  }

  createNotification(notifData: Partial<NotificationItem>): NotificationItem {
    const list = getStorageItem<NotificationItem[]>(STORAGE_KEYS.NOTIFICATIONS, MOCK_NOTIFICATIONS);

    // Idempotency check: avoid duplicate notifications for the same appointment cancellation
    if (notifData.appointment_id && (notifData.type === 'APPOINTMENT_CANCELLED' || notifData.title === 'Appointment Cancelled')) {
      const existing = list.find(
        (n) => n.appointment_id === notifData.appointment_id && (n.type === 'APPOINTMENT_CANCELLED' || n.title === 'Appointment Cancelled')
      );
      if (existing) return existing;
    }

    const notifId = notifData.notification_id || notifData.id || `NOTIF-${Date.now()}`;
    const newNotif: NotificationItem = {
      notification_id: notifId,
      id: notifId,
      recipient_type: notifData.recipient_type || 'PATIENT',
      recipient_id: notifData.recipient_id || notifData.patient_id || 'PAT-1001',
      patient_id: notifData.patient_id || notifData.recipient_id || 'PAT-1001',
      appointment_id: notifData.appointment_id,
      type: notifData.type || 'APPOINTMENT_CANCELLED',
      title: notifData.title || 'Appointment Cancelled',
      message: notifData.message || '',
      cancellation_reason: notifData.cancellation_reason,
      channel: notifData.channel || 'IN_APP',
      status: notifData.status || 'UNREAD',
      is_read: notifData.is_read !== undefined ? notifData.is_read : false,
      created_at: notifData.created_at || new Date().toISOString(),
      sent_at: notifData.sent_at || new Date().toISOString(),
    };

    const updatedList = [newNotif, ...list];
    setStorageItem(STORAGE_KEYS.NOTIFICATIONS, updatedList);
    emitDbChange({ table: 'notifications', action: 'create', data: newNotif });

    const sb = getSupabaseClient();
    if (sb) {
      sb.from('notifications').upsert(newNotif).then(({ error }) => {
        if (error) console.warn('[MEDION Supabase] Notification insert failed:', error.message);
      });
    }

    return newNotif;
  }

  markNotificationAsRead(notificationId: string): NotificationItem | null {
    const list = getStorageItem<NotificationItem[]>(STORAGE_KEYS.NOTIFICATIONS, MOCK_NOTIFICATIONS);
    const idx = list.findIndex((n) => (n.notification_id || n.id) === notificationId);
    if (idx === -1) return null;

    const updatedItem: NotificationItem = {
      ...list[idx],
      is_read: true,
      status: 'READ',
    };
    list[idx] = updatedItem;

    setStorageItem(STORAGE_KEYS.NOTIFICATIONS, list);
    emitDbChange({ table: 'notifications', action: 'update', data: updatedItem });

    const sb = getSupabaseClient();
    if (sb) {
      sb.from('notifications')
        .update({ is_read: true, status: 'READ' })
        .eq('notification_id', notificationId)
        .then(({ error }) => {
          if (error) console.warn('[MEDION Supabase] Notification update failed:', error.message);
        });
    }

    return updatedItem;
  }

  notifyAppointmentCancelledByDoctor(apt: AppointmentItem, cancellationReason?: string): NotificationItem | null {
    if (!apt || !apt.patient_id) return null;

    const docName = apt.doctor_name || 'Rajesh Mehta';
    const aptDate = apt.date || '';
    const aptTime = apt.time_slot || apt.start_time || '';
    const reasonText = cancellationReason || apt.cancellation_reason || '';

    let msg = `Your appointment with Dr. ${docName} on ${aptDate} at ${aptTime} has been cancelled by the doctor.`;
    if (reasonText) {
      msg += `\nReason: ${reasonText}`;
    }

    return this.createNotification({
      notification_id: `NOTIF-CANCEL-${apt.appointment_id}`,
      recipient_type: 'PATIENT',
      recipient_id: apt.patient_id,
      patient_id: apt.patient_id,
      appointment_id: apt.appointment_id,
      type: 'APPOINTMENT_CANCELLED',
      title: 'Appointment Cancelled',
      message: msg,
      cancellation_reason: reasonText,
      channel: 'IN_APP',
      status: 'UNREAD',
      is_read: false,
    });
  }

  rescheduleAppointment(appointmentId: string, newDate: string, newTimeSlot: string): AppointmentItem | null {
    const list = this.getAppointments();
    const idx = list.findIndex((a) => a.appointment_id.toUpperCase() === appointmentId.toUpperCase());
    if (idx === -1) return null;

    list[idx] = {
      ...list[idx],
      date: newDate,
      time_slot: newTimeSlot,
      status: 'RESCHEDULED',
    };
    setStorageItem(STORAGE_KEYS.APPOINTMENTS, list);
    emitDbChange({ table: 'appointments', action: 'update', data: list[idx] });

    // Persist to Supabase PostgreSQL
    const sb = getSupabaseClient();
    if (sb) {
      sb.from('appointments').update({
        appointment_date: newDate,
        date: newDate,
        time_slot: newTimeSlot,
        status: 'RESCHEDULED',
        updated_at: new Date().toISOString(),
      }).eq('appointment_id', appointmentId).then(({ error }) => {
        if (error) console.warn('[MEDION Supabase] Appointment reschedule failed:', error.message);
      });
    }

    return list[idx];
  }

  updateAppointmentStatus(appointmentId: string, status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'RESCHEDULED'): AppointmentItem | null {
    const list = this.getAppointments();
    const idx = list.findIndex((a) => a.appointment_id.toUpperCase() === appointmentId.toUpperCase());
    if (idx === -1) return null;

    list[idx] = {
      ...list[idx],
      status: status as any,
    };
    setStorageItem(STORAGE_KEYS.APPOINTMENTS, list);
    emitDbChange({ table: 'appointments', action: 'update', data: list[idx] });

    const sb = getSupabaseClient();
    if (sb) {
      sb.from('appointments').update({
        status: status,
        updated_at: new Date().toISOString(),
      }).eq('appointment_id', appointmentId).then(({ error }) => {
        if (error) console.warn('[MEDION Supabase] Appointment status update failed:', error.message);
      });
    }

    return list[idx];
  }

  // ----------------------------------------------------
  // DOCTORS
  // ----------------------------------------------------

  getDoctors(): typeof INITIAL_DOCTORS {
    return getStorageItem(STORAGE_KEYS.DOCTORS, INITIAL_DOCTORS);
  }

  getDoctorById(doctorId: string) {
    const doctors = this.getDoctors();
    return doctors.find((d) => d.doctor_id.toUpperCase() === doctorId.toUpperCase()) || null;
  }

  // ----------------------------------------------------
  // LAB REPORTS
  // ----------------------------------------------------

  getLabReports(): LabReportItem[] {
    const list = getStorageItem<LabReportItem[]>(STORAGE_KEYS.LAB_REPORTS, INITIAL_LAB_REPORTS);
    if (!list || list.length === 0) return INITIAL_LAB_REPORTS;
    let missingFound = false;
    const merged = [...list];
    for (const initR of INITIAL_LAB_REPORTS) {
      if (!merged.some((r) => r.report_id === initR.report_id)) {
        merged.push(initR);
        missingFound = true;
      }
    }
    if (missingFound) {
      setStorageItem(STORAGE_KEYS.LAB_REPORTS, merged);
    }
    return merged;
  }

  getLabReportById(reportId: string): LabReportItem | null {
    const reports = this.getLabReports();
    return reports.find((r) => r.report_id.toUpperCase() === reportId.toUpperCase()) || null;
  }

  getLabReportsForPatient(patientId: string): LabReportItem[] {
    const reports = this.getLabReports();
    return reports.filter((r) => r.patient_id?.toUpperCase() === patientId.toUpperCase());
  }

  addLabReport(reportData: Partial<LabReportItem>): LabReportItem {
    const list = this.getLabReports();
    const newReport: LabReportItem = {
      report_id: reportData.report_id || `LABR-${1000 + list.length + 1}`,
      patient_id: reportData.patient_id || 'PAT-1001',
      laboratory_id: reportData.laboratory_id || 'LAB-001',
      doctor_id: reportData.doctor_id || 'DOC-101',
      test_type: reportData.test_type || 'Comprehensive Outpatient Panel',
      test_date: reportData.test_date || new Date().toISOString().split('T')[0],
      status: reportData.status || 'COMPLETED',
      results: reportData.results || [],
    };

    const existingIdx = list.findIndex((r) => r.report_id === newReport.report_id);
    let updatedList: LabReportItem[];
    if (existingIdx >= 0) {
      updatedList = [...list];
      updatedList[existingIdx] = newReport;
    } else {
      updatedList = [newReport, ...list];
    }

    setStorageItem(STORAGE_KEYS.LAB_REPORTS, updatedList);
    emitDbChange({ table: 'lab_reports', action: 'create', data: newReport });

    const sb = getSupabaseClient();
    if (sb) {
      sb.from('lab_reports').upsert(newReport).then(({ error }) => {
        if (error) console.warn('[MEDION Supabase] Lab report upsert failed:', error.message);
      });
    }

    return newReport;
  }

  // ----------------------------------------------------
  // PRESCRIPTIONS
  // ----------------------------------------------------

  getPrescriptions(): any[] {
    return getStorageItem<any[]>(STORAGE_KEYS.PRESCRIPTIONS, MOCK_PRESCRIPTIONS);
  }

  getPrescriptionsByPatientId(patientId: string): any[] {
    const list = this.getPrescriptions();
    return list.filter((rx: any) => rx.patient_id?.toUpperCase() === patientId.toUpperCase());
  }

  generatePrescriptionId(): string {
    const list = this.getPrescriptions();
    let maxId = 4000;
    list.forEach((rx: any) => {
      const match = (rx.prescription_id || '').match(/RX-(\d+)/i);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxId) maxId = num;
      }
    });
    return `RX-${maxId + 1}`;
  }

  addPrescription(rxData: any): any {
    const list = this.getPrescriptions();
    const newRx = {
      prescription_id: rxData.prescription_id || this.generatePrescriptionId(),
      patient_id: rxData.patient_id || 'PAT-1001',
      doctor_id: rxData.doctor_id || 'DOC-101',
      prescribed_date: rxData.prescribed_date || new Date().toISOString().split('T')[0],
      medications: rxData.medications || [],
      instructions: rxData.instructions || '',
      status: rxData.status || 'ACTIVE',
      created_at: rxData.created_at || new Date().toISOString(),
      updated_at: rxData.updated_at || new Date().toISOString(),
    };

    const existingIdx = list.findIndex((rx: any) => rx.prescription_id === newRx.prescription_id);
    let updatedList: any[];
    if (existingIdx >= 0) {
      updatedList = [...list];
      updatedList[existingIdx] = newRx;
    } else {
      updatedList = [newRx, ...list];
    }

    setStorageItem(STORAGE_KEYS.PRESCRIPTIONS, updatedList);
    emitDbChange({ table: 'prescriptions', action: 'create', data: newRx });

    const sb = getSupabaseClient();
    if (sb) {
      sb.from('prescriptions').upsert(newRx).then(({ error }) => {
        if (error) console.warn('[MEDION Supabase] Prescription upsert failed:', error.message);
      });
    }

    return newRx;
  }

  // ----------------------------------------------------
  // INSURANCE & CLAIMS
  // ----------------------------------------------------

  getPolicies(): typeof INITIAL_POLICIES {
    return getStorageItem(STORAGE_KEYS.POLICIES, INITIAL_POLICIES);
  }

  getPolicyByPatientId(patientId: string) {
    const policies = this.getPolicies();
    return policies.find((p) => p.patient_id.toUpperCase() === patientId.toUpperCase()) || null;
  }

  getClaims(): typeof INITIAL_CLAIMS {
    return getStorageItem(STORAGE_KEYS.CLAIMS, INITIAL_CLAIMS);
  }

  getClaimById(claimId: string) {
    const claims = this.getClaims();
    return claims.find((c) => c.claim_id.toUpperCase() === claimId.toUpperCase()) || null;
  }

  submitClaim(claimData: Partial<(typeof INITIAL_CLAIMS)[0]>): (typeof INITIAL_CLAIMS)[0] {
    const claims = this.getClaims();
    const newClaim = {
      claim_id: claimData.claim_id || `CLM-${1000 + claims.length + 1}`,
      patient_id: claimData.patient_id || 'PAT-1001',
      policy_id: claimData.policy_id || 'POL-701',
      provider_id: claimData.provider_id || 'INS-001',
      bill_id: claimData.bill_id || 'BILL-201',
      claim_amount: claimData.claim_amount || 12000,
      approved_amount: claimData.approved_amount || 10800,
      status: claimData.status || 'SUBMITTED',
      submitted_date: new Date().toISOString(),
      processed_date: new Date().toISOString(),
      adjudication_notes: claimData.adjudication_notes || 'Submitted via MEDION Insurance Agent.',
    };

    const existingIdx = claims.findIndex((c) => c.claim_id === newClaim.claim_id);
    let updatedClaims: typeof INITIAL_CLAIMS;
    if (existingIdx >= 0) {
      updatedClaims = [...claims];
      updatedClaims[existingIdx] = newClaim;
    } else {
      updatedClaims = [newClaim, ...claims];
    }

    setStorageItem(STORAGE_KEYS.CLAIMS, updatedClaims);
    emitDbChange({ table: 'claims', action: 'create', data: newClaim });
    return newClaim;
  }

  // ----------------------------------------------------
  // CONVERSATION CONTEXT (MULTI-TURN STATE)
  // ----------------------------------------------------

  getConversationContext(): any {
    return getStorageItem(STORAGE_KEYS.CONTEXT, null);
  }

  setConversationContext(context: any): void {
    setStorageItem(STORAGE_KEYS.CONTEXT, context);
  }

  clearConversationContext(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(STORAGE_KEYS.CONTEXT);
    }
    delete memoryStore[STORAGE_KEYS.CONTEXT];
  }

  // ----------------------------------------------------
  // EVENT SUBSCRIPTION
  // ----------------------------------------------------

  subscribe(callback: (event: DBChangeEvent) => void): () => void {
    if (typeof window === 'undefined') return () => {};
    const handler = (e: Event) => {
      const customEvent = e as CustomEvent<DBChangeEvent>;
      if (customEvent.detail) {
        callback(customEvent.detail);
      }
    };
    window.addEventListener(DB_EVENT_NAME, handler);
    return () => {
      window.removeEventListener(DB_EVENT_NAME, handler);
    };
  }

  // Reset to initial mock datasets
  resetAll(): void {
    setStorageItem(STORAGE_KEYS.PATIENTS, MOCK_PATIENTS_LIST);
    setStorageItem(STORAGE_KEYS.APPOINTMENTS, MOCK_APPOINTMENTS);
    setStorageItem(STORAGE_KEYS.LAB_REPORTS, INITIAL_LAB_REPORTS);
    setStorageItem(STORAGE_KEYS.PRESCRIPTIONS, MOCK_PRESCRIPTIONS);
    setStorageItem(STORAGE_KEYS.POLICIES, INITIAL_POLICIES);
    setStorageItem(STORAGE_KEYS.CLAIMS, INITIAL_CLAIMS);
    setStorageItem(STORAGE_KEYS.DOCTORS, INITIAL_DOCTORS);
    this.clearConversationContext();
    emitDbChange({ table: 'patients', action: 'reset' });
  }
}

export const dataService = new SharedDataService();

// ----------------------------------------------------
// REACT HOOKS FOR REACTIVE UI DATA
// ----------------------------------------------------

export function useSharedPatients() {
  const [patients, setPatients] = useState<PatientProfile[]>(() => dataService.getPatients());

  useEffect(() => {
    const unsubscribe = dataService.subscribe((event) => {
      if (event.table === 'patients' || event.action === 'reset') {
        setPatients(dataService.getPatients());
      }
    });
    return unsubscribe;
  }, []);

  return patients;
}

export function useSharedAppointments() {
  const [appointments, setAppointments] = useState<AppointmentItem[]>(() => dataService.getAppointments());

  useEffect(() => {
    const unsubscribe = dataService.subscribe((event) => {
      if (event.table === 'appointments' || event.action === 'reset') {
        setAppointments(dataService.getAppointments());
      }
    });
    return unsubscribe;
  }, []);

  return appointments;
}

export function useSharedLabReports() {
  const [reports, setReports] = useState<LabReportItem[]>(() => dataService.getLabReports());

  useEffect(() => {
    const unsubscribe = dataService.subscribe((event) => {
      if (event.table === 'lab_reports' || event.action === 'reset') {
        setReports(dataService.getLabReports());
      }
    });
    return unsubscribe;
  }, []);

  return reports;
}

export function useSharedClaims() {
  const [claims, setClaims] = useState<typeof INITIAL_CLAIMS>(() => dataService.getClaims());

  useEffect(() => {
    const unsubscribe = dataService.subscribe((event) => {
      if (event.table === 'claims' || event.action === 'reset') {
        setClaims(dataService.getClaims());
      }
    });
    return unsubscribe;
  }, []);

  return claims;
}

export function useSharedDoctors() {
  const [doctors, setDoctors] = useState(() => dataService.getDoctors());

  useEffect(() => {
    const unsubscribe = dataService.subscribe((event) => {
      if (event.table === 'doctors' || event.action === 'reset') {
        setDoctors(dataService.getDoctors());
      }
    });
    return unsubscribe;
  }, []);

  return doctors;
}

export function useSharedPolicies() {
  const [policies, setPolicies] = useState(() => dataService.getPolicies());

  useEffect(() => {
    const unsubscribe = dataService.subscribe((event) => {
      if (event.table === 'policies' || event.action === 'reset') {
        setPolicies(dataService.getPolicies());
      }
    });
    return unsubscribe;
  }, []);

  return policies;
}

export function useSharedPrescriptions() {
  const [prescriptions, setPrescriptions] = useState<any[]>(() => dataService.getPrescriptions());

  useEffect(() => {
    const unsubscribe = dataService.subscribe((event) => {
      if (event.table === 'prescriptions' || event.action === 'reset') {
        setPrescriptions(dataService.getPrescriptions());
      }
    });
    return unsubscribe;
  }, []);

  return prescriptions;
}

export function useSharedNotifications(patientId?: string) {
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => dataService.getNotifications(patientId));

  useEffect(() => {
    setNotifications(dataService.getNotifications(patientId));
    const unsubscribe = dataService.subscribe((event) => {
      if (event.table === 'notifications' || event.table === 'appointments' || event.action === 'reset') {
        setNotifications(dataService.getNotifications(patientId));
      }
    });
    return unsubscribe;
  }, [patientId]);

  return notifications;
}


