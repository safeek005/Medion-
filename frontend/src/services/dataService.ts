import { useEffect, useState } from 'react';
import { PatientProfile, AppointmentItem, LabReportItem } from '../types';
import {
  MOCK_PATIENTS_LIST,
  MOCK_APPOINTMENTS,
  MOCK_LAB_REPORT,
  MOCK_PRESCRIPTIONS,
  MOCK_NOTIFICATIONS,
  PrescriptionItem,
  NotificationItem,
} from '../data/mockDatasets';

// Keys for browser persistent storage
const STORAGE_KEYS = {
  PATIENTS: 'medion_db_patients',
  APPOINTMENTS: 'medion_db_appointments',
  LAB_REPORTS: 'medion_db_lab_reports',
  PRESCRIPTIONS: 'medion_db_prescriptions',
  POLICIES: 'medion_db_policies',
  CLAIMS: 'medion_db_claims',
  DOCTORS: 'medion_db_doctors',
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
    email: 'dr.suresh@cityhospital.org',
    available_days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    available_slots: ['09:00-09:30', '09:30-10:00', '10:00-10:30', '11:00-11:30'],
  },
];

// Default Policies
export const INITIAL_POLICIES = [
  {
    policy_id: 'POL-701',
    patient_id: 'PAT-1001',
    provider_name: 'Star Health & Allied Insurance',
    policy_number: 'SH-COMP-2024-88912',
    plan_type: 'Comprehensive Family Floater',
    status: 'ACTIVE',
    coverage_limit: 500000,
    remaining_coverage: 485000,
    copay_percentage: 10,
    valid_until: '2025-12-31',
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
    valid_until: '2025-10-30',
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
    valid_until: '2025-08-15',
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
];

// Default Lab Reports
export const INITIAL_LAB_REPORTS: LabReportItem[] = [
  MOCK_LAB_REPORT,
  {
    report_id: 'LABR-1002',
    patient_id: 'PAT-1002',
    laboratory_id: 'LAB-001',
    doctor_id: 'DOC-102',
    test_type: 'Thyroid Profile (T3, T4, TSH)',
    test_date: '2024-07-19',
    status: 'COMPLETED',
    results: [
      { parameter: 'TSH', value: 6.2, unit: 'uIU/mL', reference_range: '0.4 - 4.2', is_abnormal: true, abnormality_direction: 'HIGH' },
      { parameter: 'Free T4', value: 1.1, unit: 'ng/dL', reference_range: '0.8 - 1.8', is_abnormal: false, abnormality_direction: 'NORMAL' },
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
  table: 'patients' | 'appointments' | 'lab_reports' | 'insurance' | 'claims' | 'prescriptions' | 'context';
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
    this.initializeIfEmpty();
  }

  private initializeIfEmpty() {
    if (!getStorageItem(STORAGE_KEYS.PATIENTS, null)) {
      setStorageItem(STORAGE_KEYS.PATIENTS, MOCK_PATIENTS_LIST);
    }
    if (!getStorageItem(STORAGE_KEYS.APPOINTMENTS, null)) {
      setStorageItem(STORAGE_KEYS.APPOINTMENTS, MOCK_APPOINTMENTS);
    }
    if (!getStorageItem(STORAGE_KEYS.LAB_REPORTS, null)) {
      setStorageItem(STORAGE_KEYS.LAB_REPORTS, INITIAL_LAB_REPORTS);
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

  createPatient(patientData: Partial<PatientProfile> & { first_name?: string; last_name?: string; full_name?: string }): PatientProfile {
    const list = this.getPatients();
    
    // Parse names if provided as full_name
    let firstName = patientData.first_name || '';
    let lastName = patientData.last_name || '';
    if (!firstName && patientData.full_name) {
      const parts = patientData.full_name.trim().split(' ');
      firstName = parts[0];
      lastName = parts.slice(1).join(' ') || 'Patient';
    }
    if (!firstName) firstName = 'New';
    if (!lastName) lastName = 'Patient';

    const newPatient: PatientProfile = {
      patient_id: patientData.patient_id || this.generatePatientId(),
      first_name: firstName,
      last_name: lastName,
      date_of_birth: (patientData as any).dob || patientData.date_of_birth || '2000-01-01',
      gender: patientData.gender || 'Not specified',
      blood_group: patientData.blood_group || 'O+',
      phone: patientData.phone || '+91 9000000000',
      email: patientData.email || `${firstName.toLowerCase()}@example.com`,
      address: patientData.address || 'Bengaluru, Karnataka',
      emergency_contact: patientData.emergency_contact || {
        name: 'Primary Contact',
        relationship: 'Family',
        phone: patientData.phone || '+91 9000000001',
      },
      primary_doctor_id: patientData.primary_doctor_id || 'DOC-101',
      insurance_policy_id: patientData.insurance_policy_id || 'POL-701',
    };

    // Avoid duplicate IDs if already registered
    const existingIdx = list.findIndex((p) => p.patient_id === newPatient.patient_id);
    let updatedList: PatientProfile[];
    if (existingIdx >= 0) {
      updatedList = [...list];
      updatedList[existingIdx] = { ...updatedList[existingIdx], ...newPatient };
    } else {
      updatedList = [newPatient, ...list];
    }

    setStorageItem(STORAGE_KEYS.PATIENTS, updatedList);
    emitDbChange({ table: 'patients', action: 'create', data: newPatient });
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
    return updated;
  }

  // ----------------------------------------------------
  // APPOINTMENTS
  // ----------------------------------------------------

  getAppointments(): AppointmentItem[] {
    return getStorageItem<AppointmentItem[]>(STORAGE_KEYS.APPOINTMENTS, MOCK_APPOINTMENTS);
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
    const newApt: AppointmentItem = {
      appointment_id: aptData.appointment_id || this.generateAppointmentId(),
      patient_id: aptData.patient_id || 'PAT-1001',
      doctor_id: aptData.doctor_id || 'DOC-101',
      hospital_id: aptData.hospital_id || 'HOSP-001',
      date: aptData.date || aptData.appointment_date || new Date().toISOString().split('T')[0],
      time_slot: aptData.time_slot || '10:00-10:30',
      status: (aptData.status as any) || 'SCHEDULED',
      reason: aptData.reason || aptData.reason_for_visit || 'Clinical Consultation',
    };

    // Check if ID exists, if so update, else prepend
    const existingIdx = list.findIndex((a) => a.appointment_id === newApt.appointment_id);
    let updatedList: AppointmentItem[];
    if (existingIdx >= 0) {
      updatedList = [...list];
      updatedList[existingIdx] = newApt;
    } else {
      updatedList = [newApt, ...list];
    }

    setStorageItem(STORAGE_KEYS.APPOINTMENTS, updatedList);
    emitDbChange({ table: 'appointments', action: 'create', data: newApt });
    return newApt;
  }

  cancelAppointment(appointmentId: string): AppointmentItem | null {
    const list = this.getAppointments();
    const idx = list.findIndex((a) => a.appointment_id.toUpperCase() === appointmentId.toUpperCase());
    if (idx === -1) return null;

    list[idx] = { ...list[idx], status: 'CANCELLED' };
    setStorageItem(STORAGE_KEYS.APPOINTMENTS, list);
    emitDbChange({ table: 'appointments', action: 'update', data: list[idx] });
    return list[idx];
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
    return getStorageItem<LabReportItem[]>(STORAGE_KEYS.LAB_REPORTS, INITIAL_LAB_REPORTS);
  }

  getLabReportById(reportId: string): LabReportItem | null {
    const reports = this.getLabReports();
    return reports.find((r) => r.report_id.toUpperCase() === reportId.toUpperCase()) || null;
  }

  // ----------------------------------------------------
  // INSURANCE & CLAIMS
  // ----------------------------------------------------

  getPolicies(): typeof INITIAL_POLICIES {
    return getStorageItem(STORAGE_KEYS.POLICIES, INITIAL_POLICIES);
  }

  getPolicyByPatientId(patientId: string) {
    const policies = this.getPolicies();
    return policies.find((p) => p.patient_id.toUpperCase() === patientId.toUpperCase()) || policies[0];
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
