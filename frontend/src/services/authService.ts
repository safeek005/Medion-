import { useState, useEffect } from 'react';
import { UserRole, AuthUser, PatientProfile, LabReportItem } from '../types';
import { dataService, INITIAL_LAB_REPORTS } from './dataService';

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * TEMPORARY CLIENT-SIDE DEVELOPMENT SESSION ADAPTER (NOT PRODUCTION AUTH)
 * ─────────────────────────────────────────────────────────────────────────────
 * IMPORTANT ARCHITECTURAL NOTICE:
 * This module is a temporary client-side session adapter for frontend UI
 * rendering, state management, and navigation previews during Phase 1.
 *
 * It relies on:
 *   - Local sessionStorage persistence
 *   - Pre-configured demo institutional directory records
 *   - Client-side role resolution heuristics
 *
 * THIS DOES NOT CONSTITUTE A PRODUCTION SECURITY BOUNDARY.
 * Frontend role-based routing controls UI presentation only.
 *
 * Long-term Production Security Architecture:
 *   Identity Provider (Supabase Auth / OAuth / SAML)
 *          ↓
 *   Cryptographically signed HTTP-only session tokens
 *          ↓
 *   Server-side Organization Membership & Tenant Verification
 *          ↓
 *   Server-enforced RBAC / Row-Level Security (RLS) on every API endpoint
 *          ↓
 *   Authorized MEDION Workspace access
 * ─────────────────────────────────────────────────────────────────────────────
 */

const AUTH_STORAGE_KEY = 'medion_auth_dev_session';

// Pre-configured development directory for local UI resolution without shortcuts
const DEV_INSTITUTIONAL_DIRECTORY: Record<string, AuthUser> = {
  // Doctors
  'dr.mehta@medionhealth.org': {
    id: 'DOC-101',
    name: 'Dr. Rajesh Mehta',
    email: 'dr.mehta@medionhealth.org',
    role: 'doctor',
    organization: 'MEDION Health Network',
    facility: 'HOSP-001 (Main Campus)',
    department: 'Cardiology',
    title: 'Senior Attending Cardiologist',
    phone: '+91 9123456780',
  },
  'dr.anita@medionhealth.org': {
    id: 'DOC-102',
    name: 'Dr. Anita Deshmukh',
    email: 'dr.anita@medionhealth.org',
    role: 'doctor',
    organization: 'MEDION Health Network',
    facility: 'HOSP-001 (Main Campus)',
    department: 'Endocrinology',
    title: 'Lead Endocrinologist',
    phone: '+91 9123456781',
  },
  'dr.suresh@cityhospital.org': {
    id: 'DOC-103',
    name: 'Dr. Suresh Rao',
    email: 'dr.suresh@cityhospital.org',
    role: 'doctor',
    organization: 'City Hospital Annex',
    facility: 'HOSP-002 (City Annex)',
    department: 'General Medicine',
    title: 'Consultant Physician',
    phone: '+91 9123456782',
  },

  // Nursing Staff
  'nurse.reka@medionhealth.org': {
    id: 'NUR-201',
    name: 'Nurse Reka',
    email: 'nurse.reka@medionhealth.org',
    role: 'nurse',
    organization: 'MEDION Health Network',
    facility: 'HOSP-001 (Main Campus)',
    department: 'Inpatient Clinical Operations',
    title: 'Floor Charge Nurse',
    phone: '+91 9123456790',
  },
  'nurse.sunita@medionhealth.org': {
    id: 'NUR-202',
    name: 'Nurse Sunita',
    email: 'nurse.sunita@medionhealth.org',
    role: 'nurse',
    organization: 'MEDION Health Network',
    facility: 'HOSP-001 (Main Campus)',
    department: 'Intensive Care Unit (ICU)',
    title: 'Critical Care Specialist Nurse',
    phone: '+91 9123456791',
  },

  // Reception & Front Desk
  'reception@medionhealth.org': {
    id: 'REC-301',
    name: 'Priya Sharma',
    email: 'reception@medionhealth.org',
    role: 'receptionist',
    organization: 'MEDION Health Network',
    facility: 'HOSP-001 (Main Campus)',
    department: 'Front Desk & Patient Triage',
    title: 'Lead Reception Officer',
    phone: '+91 9123456770',
  },
  'reception.priya@medionhealth.org': {
    id: 'REC-301',
    name: 'Priya Sharma',
    email: 'reception.priya@medionhealth.org',
    role: 'receptionist',
    organization: 'MEDION Health Network',
    facility: 'HOSP-001 (Main Campus)',
    department: 'Front Desk & Patient Triage',
    title: 'Lead Reception Officer',
    phone: '+91 9123456770',
  },

  // Laboratory Technologists
  'lab.tech@medionlabs.org': {
    id: 'LAB-401',
    name: 'Dr. Vikram Patel',
    email: 'lab.tech@medionlabs.org',
    role: 'lab',
    organization: 'Central Diagnostics Network',
    facility: 'LAB-001 (Central Diagnostics)',
    department: 'Pathology & Molecular Testing',
    title: 'Laboratory Director',
    phone: '+91 9123456760',
  },

  // Insurance & Claims
  'claims@medioncare.com': {
    id: 'INS-501',
    name: 'Kavita Iyer',
    email: 'claims@medioncare.com',
    role: 'insurance',
    organization: 'Star Health & Allied Insurance',
    facility: 'HOSP-001 (Payer Liaison Desk)',
    department: 'Claims Adjudication',
    title: 'Senior Claims Adjudicator',
    phone: '+91 9123456750',
  },

  // Hospital Command / Executive Administration
  'admin@medionhealth.org': {
    id: 'HOSP-ADMIN-01',
    name: 'Hospital Command Admin',
    email: 'admin@medionhealth.org',
    role: 'hospital',
    organization: 'MEDION Health Network',
    facility: 'HOSP-001 (Executive Suite)',
    department: 'Hospital Administration',
    title: 'Chief Operating Officer',
    phone: '+91 9123456700',
  },
};

export interface SyntheticPatientAccount {
  patient_id: string;
  name: string;
  email: string;
  password: string;
}

export const SYNTHETIC_PATIENT_ACCOUNTS: SyntheticPatientAccount[] = [
  {
    patient_id: 'PAT-1001',
    name: 'Arun Kumar',
    email: 'arun.kumar@medion.demo',
    password: 'Medion@1001',
  },
  {
    patient_id: 'PAT-1002',
    name: 'Sneha Sharma',
    email: 'sneha.sharma@medion.demo',
    password: 'Medion@1002',
  },
  {
    patient_id: 'PAT-1003',
    name: 'Vikram Singh',
    email: 'vikram.singh@medion.demo',
    password: 'Medion@1003',
  },
  {
    patient_id: 'PAT-1004',
    name: 'Priya Nair',
    email: 'priya.nair@medion.demo',
    password: 'Medion@1004',
  },
  {
    patient_id: 'PAT-1044',
    name: 'shiva s',
    email: 'shiva.s@medion.demo',
    password: 'Medion@1044',
  },
];

class AuthService {
  private currentUser: AuthUser | null = null;
  private listeners: Array<(user: AuthUser | null) => void> = [];

  constructor() {
    this.restoreSession();
  }

  private restoreSession() {
    if (typeof window === 'undefined') return;
    try {
      const saved = window.sessionStorage.getItem(AUTH_STORAGE_KEY);
      if (saved) {
        this.currentUser = JSON.parse(saved);
      }
    } catch (e) {
      console.warn('[AuthService] Failed to parse session:', e);
    }
  }

  getCurrentUser(): AuthUser | null {
    return this.currentUser;
  }

  /**
   * Authenticate Patient via Phone, Email, or MRN
   */
  async loginPatient(identifier: string, password?: string): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
    const query = (identifier || '').trim().toLowerCase();
    if (!query) {
      return { success: false, error: 'Please enter your Medical Record Number (MRN), Email, or Phone number.' };
    }

    // 1. Check synthetic patient accounts with credential verification
    const syntheticMatch = SYNTHETIC_PATIENT_ACCOUNTS.find(
      (a) => a.patient_id.toLowerCase() === query || a.email.toLowerCase() === query
    );

    if (syntheticMatch) {
      if (password && password.trim()) {
        if (password.trim() !== syntheticMatch.password) {
          return { success: false, error: 'Invalid password. Please check your credentials.' };
        }
      }

      // Check if patient profile exists in dataService
      let patient = dataService.getPatientById(syntheticMatch.patient_id);
      if (!patient) {
        // Auto-seed patient profile into dataService if not present
        patient = dataService.createPatient({
          patient_id: syntheticMatch.patient_id,
          first_name: syntheticMatch.name.split(' ')[0],
          last_name: syntheticMatch.name.split(' ').slice(1).join(' ') || '',
          email: syntheticMatch.email,
        });
      }

      // Ensure the patient's lab reports exist in dataService
      const patientReports = dataService.getLabReportsForPatient(syntheticMatch.patient_id);
      if (patientReports.length === 0) {
        const initReports = INITIAL_LAB_REPORTS.filter(
          (lr: LabReportItem) => lr.patient_id?.toUpperCase() === syntheticMatch.patient_id.toUpperCase()
        );
        for (const rep of initReports) {
          dataService.addLabReport(rep);
        }
      }

      const authUser: AuthUser = {
        id: syntheticMatch.patient_id,
        name: syntheticMatch.name,
        email: syntheticMatch.email,
        role: 'patient',
        organization: 'MEDION Patient Care Network',
        facility: 'HOSP-001 (Outpatient)',
        phone: patient?.phone || undefined,
        title: 'Registered Patient',
      };

      this.setSession(authUser);
      return { success: true, user: authUser };
    }

    // 2. Lookup existing registered patient records
    const patients = dataService.getPatients();
    const matched = patients.find(
      (p) =>
        p.patient_id.toLowerCase() === query ||
        (p.email && p.email.toLowerCase() === query) ||
        (p.phone && p.phone.replace(/\D/g, '').includes(query.replace(/\D/g, '')))
    );

    if (matched) {
      const authUser: AuthUser = {
        id: matched.patient_id,
        name: `${matched.first_name} ${matched.last_name}`,
        email: matched.email || `${matched.patient_id.toLowerCase()}@patient.medionhealth.org`,
        role: 'patient',
        organization: 'MEDION Patient Care Network',
        facility: 'HOSP-001 (Outpatient)',
        phone: matched.phone || undefined,
        title: 'Registered Patient',
      };
      this.setSession(authUser);
      return { success: true, user: authUser };
    }

    return {
      success: false,
      error: 'Patient account not found. Please enter a valid MRN or registered email (e.g. shiva.s@medion.demo or PAT-1044).',
    };
  }

  /**
   * Authenticate Healthcare Organization Personnel
   * Organization and Role are automatically resolved from institutional credentials.
   */
  async loginOrganization(email: string, _password?: string): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
    const cleanEmail = (email || '').trim().toLowerCase();
    if (!cleanEmail) {
      return { success: false, error: 'Please enter your institutional healthcare email.' };
    }

    // Lookup in pre-configured development institutional directory
    const resolved = DEV_INSTITUTIONAL_DIRECTORY[cleanEmail];

    if (resolved) {
      this.setSession(resolved);
      return { success: true, user: resolved };
    }

    // Heuristic for enterprise institutional emails
    let role: UserRole = 'doctor';
    let title = 'Physician';
    let dept = 'Clinical Department';

    if (cleanEmail.includes('nurse')) {
      role = 'nurse';
      title = 'Registered Nurse';
      dept = 'Clinical Operations';
    } else if (cleanEmail.includes('reception') || cleanEmail.includes('intake')) {
      role = 'receptionist';
      title = 'Front Desk & Triage Officer';
      dept = 'Front Desk';
    } else if (cleanEmail.includes('lab') || cleanEmail.includes('pathology')) {
      role = 'lab';
      title = 'Lab Specialist';
      dept = 'Central Diagnostics';
    } else if (cleanEmail.includes('claim') || cleanEmail.includes('insur')) {
      role = 'insurance';
      title = 'Insurance Officer';
      dept = 'Claims Adjudication';
    } else if (cleanEmail.includes('admin') || cleanEmail.includes('exec')) {
      role = 'hospital';
      title = 'Hospital Administrator';
      dept = 'Executive Hospital Administration';
    }

    const fallbackUser: AuthUser = {
      id: `ORG-${Math.floor(1000 + Math.random() * 9000)}`,
      name: cleanEmail.split('@')[0].replace('.', ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      email: cleanEmail,
      role: role,
      organization: 'MEDION Health Network',
      facility: 'HOSP-001 (Main Campus)',
      department: dept,
      title: title,
    };

    this.setSession(fallbackUser);
    return { success: true, user: fallbackUser };
  }

  /**
   * Set and broadcast session
   */
  private setSession(user: AuthUser) {
    this.currentUser = user;
    dataService.clearConversationContext();
    if (typeof window !== 'undefined') {
      try {
        window.sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      } catch (e) {
        console.warn('[AuthService] Storage write error:', e);
      }
    }
    this.notify();
  }

  updateFacility(facilityName: string) {
    if (this.currentUser) {
      this.currentUser = { ...this.currentUser, facility: facilityName };
      this.setSession(this.currentUser);
    }
  }

  logout() {
    this.currentUser = null;
    dataService.clearConversationContext();
    if (typeof window !== 'undefined') {
      try {
        window.sessionStorage.removeItem(AUTH_STORAGE_KEY);
      } catch (e) {
        console.warn('[AuthService] Storage clear error:', e);
      }
    }
    this.notify();
  }

  subscribe(listener: (user: AuthUser | null) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    for (const listener of this.listeners) {
      listener(this.currentUser);
    }
  }
}

export const ENTERPRISE_FACILITIES = [
  { id: 'HOSP-001', name: 'Coimbatore Medical Center', campus: 'Main Campus', city: 'Coimbatore', type: 'Tertiary Care Hospital' },
  { id: 'HOSP-002', name: 'Bengaluru Specialty Center', campus: 'South Campus', city: 'Bengaluru', type: 'Super-Specialty Hospital' },
  { id: 'HOSP-003', name: 'Chennai Healthcare Hub', campus: 'Central Campus', city: 'Chennai', type: 'Multi-Disciplinary Pavilion' },
];

export const authService = new AuthService();

/**
 * React Hook for Authenticated Session
 */
export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(() => authService.getCurrentUser());

  useEffect(() => {
    const unsubscribe = authService.subscribe((u) => {
      setUser(u);
    });
    return unsubscribe;
  }, []);

  return {
    user,
    isAuthenticated: user !== null,
    logout: () => authService.logout(),
    updateFacility: (fac: string) => authService.updateFacility(fac),
  };
}

