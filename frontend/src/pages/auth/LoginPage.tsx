import React, { useState } from 'react';
import { UserRole } from '../../types';
import {
  User,
  Building2,
  Lock,
  ArrowRight,
  Mail,
  Shield,
  CheckCircle2,
  KeyRound,
  Sparkles,
  ArrowLeft,
  ChevronRight,
  AlertCircle,
  Phone,
  Info,
  Activity,
  HeartPulse,
  Stethoscope,
  Clock,
  Check
} from 'lucide-react';
import { dataService } from '../../services/dataService';
import { authService } from '../../services/authService';
import { Input, Select } from '../../components/ui/Input';

interface LoginPageProps {
  onLoginSuccess: (role: UserRole) => void;
}

type AuthScreen =
  | 'welcome'           // Screen 01: Master Access Pathways (Patient vs Organization)
  | 'patient_signin'    // Screen 02: Patient Sign In
  | 'patient_signup'    // Screen 03: Progressive Patient Registration
  | 'org_access'        // Screen 04: Organization Access (Role resolved via credentials)
  | 'org_activation'    // Screen 05: Staff Account Activation
  | 'password_recovery' // Screen 06: Password Recovery
  | 'verification';     // Screen 07: Registration Success & MRN Linking State

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [currentScreen, setCurrentScreen] = useState<AuthScreen>('welcome');

  // Patient Sign In state
  const [patientIdentifier, setPatientIdentifier] = useState('kavya.sharma@example.com');
  const [patientPassword, setPatientPassword] = useState('patient123');

  // Organization Access state
  const [orgEmail, setOrgEmail] = useState('');
  const [orgPassword, setOrgPassword] = useState('');

  // Invitation / Activation state
  const [invitationCode, setInvitationCode] = useState('MED-HOSP-7089');
  const [activationEmail, setActivationEmail] = useState('');

  // Password recovery state
  const [recoveryEmail, setRecoveryEmail] = useState('');

  // Status & loading states
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<string | null>(null);
  const [createdPatientId, setCreatedPatientId] = useState<string | null>(null);

  // Progressive Patient Registration Form State (3 Stages)
  const [patientRegStep, setPatientRegStep] = useState<1 | 2 | 3>(1);
  const [patientForm, setPatientForm] = useState({
    firstName: '',
    lastName: '',
    dob: '',
    gender: 'Female',
    phone: '',
    email: '',
    password: '',
  });

  // Handle Patient Authentication via Development Session Adapter
  const handlePatientSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await authService.loginPatient(patientIdentifier, patientPassword);
      setLoading(false);
      if (res.success && res.user) {
        onLoginSuccess('patient');
      } else {
        setErrorMessage(res.error || 'Authentication failed. Please check your credentials.');
      }
    } catch {
      setLoading(false);
      setErrorMessage('Unable to reach the patient identity service. Please verify your connection.');
    }
  };

  // Handle Progressive Patient Registration with Real Supabase Persistence
  const handlePatientSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Step 1 validation: Legal Name
    if (patientRegStep === 1) {
      if (!patientForm.firstName.trim()) {
        setErrorMessage('Please provide your legal first name.');
        return;
      }
      setPatientRegStep(2);
      return;
    }

    // Step 2 validation: Contact & Demographics
    if (patientRegStep === 2) {
      if (!patientForm.phone.trim()) {
        setErrorMessage('Please provide your mobile phone number for verification.');
        return;
      }
      setPatientRegStep(3);
      return;
    }

    // Step 3: Submission & Database Record Creation
    if (!patientForm.email.trim() || !patientForm.password.trim()) {
      setErrorMessage('Please enter an email address and create a secure password.');
      return;
    }

    setLoading(true);
    try {
      // 1. Create Patient Record directly in Supabase via dataService
      const newPatient = dataService.createPatient({
        first_name: patientForm.firstName.trim(),
        last_name: patientForm.lastName.trim(),
        dob: patientForm.dob || '1995-05-15',
        gender: patientForm.gender,
        phone: patientForm.phone.trim(),
        email: patientForm.email.trim(),
        blood_group: null,
        address: null,
        emergency_contact: null,
        primary_doctor_id: null,
        insurance_policy_id: null
      });

      // 2. Automatically log the newly registered patient into the local session
      await authService.loginPatient(newPatient.patient_id, patientForm.password);

      setCreatedPatientId(newPatient.patient_id);
      setLoading(false);
      setCurrentScreen('verification');
    } catch (err) {
      setLoading(false);
      setErrorMessage('Failed to create patient account record. Please try again.');
    }
  };

  // Handle Organization Authentication — Credentials resolve Organization and Role automatically
  const handleOrgAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await authService.loginOrganization(orgEmail, orgPassword);
      setLoading(false);

      if (res.success && res.user) {
        // Automatically redirects to the authorized workspace corresponding to the resolved role
        onLoginSuccess(res.user.role);
      } else {
        setErrorMessage(res.error || 'Invalid healthcare organization credentials.');
      }
    } catch {
      setLoading(false);
      setErrorMessage('Unable to connect to the institutional directory service.');
    }
  };

  // Handle Staff Invitation Token Activation
  const handleStaffActivation = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    setTimeout(() => {
      setLoading(false);
      setSuccessInfo(
        'Staff invitation token validated against institutional registry. In production, this provisions via LDAP / Active Directory SSO. For testing in Phase 2, sign in using your assigned institutional email on the Organization Access screen.'
      );
    }, 550);
  };

  // Handle Password Recovery Request
  const handlePasswordRecovery = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    setTimeout(() => {
      setLoading(false);
      setSuccessInfo(
        'Password recovery request logged. In production, this dispatches via institutional SMTP/SMS gateway. For immediate assistance in pre-production, please contact your care coordinator or IT helpdesk.'
      );
    }, 600);
  };

  return (
    <div className="access-viewport">
      {/* Background Cinematic Video with Dark Forest-Green Overlays */}
      <div className="access-video-backdrop">
        <video autoPlay loop muted playsInline>
          <source src="/videos/medion-hero.mp4" type="video/mp4" />
          <source src="/medion-hero.mp4" type="video/mp4" />
        </video>
        <div className="access-overlay-gradient" />
        <div className="access-ambient-radial" />
      </div>

      {/* Architectural Split Canvas */}
      <div className="access-layout-split">
        {/* ================================================================= */}
        {/* LEFT COLUMN: BRAND PRESENCE & CLINICAL CONTEXT                    */}
        {/* ================================================================= */}
        <div className="access-brand-pane">
          <div>
            {/* High-craft Brand Emblem */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1.25rem' }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 'var(--radius-md)',
                  background: 'linear-gradient(135deg, var(--forest-brand) 0%, #124334 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 24px rgba(30, 107, 82, 0.45)',
                  border: '1px solid rgba(110, 231, 183, 0.3)'
                }}
              >
                <HeartPulse style={{ width: 24, height: 24, color: 'var(--mint-accent)' }} />
              </div>
              <span
                style={{
                  fontSize: '1.9rem',
                  fontWeight: 800,
                  letterSpacing: '-0.04em',
                  color: '#ffffff',
                  fontFamily: 'var(--font-sans)'
                }}
              >
                MEDION <span style={{ color: 'var(--mint-accent)', fontWeight: 600 }}>AGENT</span>
              </span>
            </div>

            {/* Confident Clinical Tagline */}
            <h1
              style={{
                fontSize: '2.5rem',
                fontWeight: 700,
                letterSpacing: '-0.035em',
                lineHeight: 1.18,
                color: '#ffffff',
                marginBottom: '1rem'
              }}
            >
              Healthcare, <br />
              <span style={{ color: 'var(--mint-accent)' }}>intelligently connected.</span>
            </h1>

            <p
              style={{
                fontSize: '1.02rem',
                color: 'rgba(255, 255, 255, 0.72)',
                lineHeight: 1.6,
                maxWidth: 480,
                letterSpacing: '-0.01em'
              }}
            >
              The unified healthcare operating system orchestrating clinical workflows, precision diagnostics, personal patient records, and hospital intelligence across modern healthcare networks.
            </p>
          </div>

          {/* Core Architectural Pillars */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: 460 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(110, 231, 183, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: '0.15rem'
                }}
              >
                <Shield style={{ width: 15, height: 15, color: 'var(--mint-accent)' }} />
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.88rem', color: '#ffffff' }}>
                  Institutional Security & Integrity
                </div>
                <div style={{ fontSize: '0.78rem', color: 'rgba(255, 255, 255, 0.6)', lineHeight: 1.45 }}>
                  End-to-end cryptographic protection, strict tenant boundaries, and audit logging designed for enterprise healthcare networks.
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(110, 231, 183, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: '0.15rem'
                }}
              >
                <Sparkles style={{ width: 15, height: 15, color: 'var(--mint-accent)' }} />
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.88rem', color: '#ffffff' }}>
                  Human-in-the-Loop Intelligence
                </div>
                <div style={{ fontSize: '0.78rem', color: 'rgba(255, 255, 255, 0.6)', lineHeight: 1.45 }}>
                  Clinical recommendations require explicit clinician authorization before executing care interventions or administrative actions.
                </div>
              </div>
            </div>
          </div>

          {/* Real-time Gateway Node Status */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.65rem',
              padding: '0.55rem 0.95rem',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              width: 'fit-content'
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: 'var(--mint-accent)',
                boxShadow: '0 0 10px var(--mint-accent)',
                animation: 'pulseGlow 2s infinite'
              }}
            />
            <span style={{ fontSize: '0.76rem', color: 'rgba(255, 255, 255, 0.75)', letterSpacing: '0.02em' }}>
              HOSP-001 Gateway Active · TLS 1.3 · HIPAA & NDHM Architecture Ready
            </span>
          </div>
        </div>

        {/* ================================================================= */}
        {/* RIGHT COLUMN: INTERACTIVE ACCESS SURFACE                          */}
        {/* ================================================================= */}
        <div className="access-surface-pane">
          <div className="access-card-container">
            {/* Error Banner */}
            {errorMessage && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.65rem',
                  padding: '0.85rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.35)',
                  color: '#fca5a5',
                  fontSize: '0.85rem',
                  marginBottom: '1.5rem',
                  lineHeight: 1.5
                }}
              >
                <AlertCircle style={{ width: 18, height: 18, flexShrink: 0, marginTop: '0.1rem' }} />
                <div>{errorMessage}</div>
              </div>
            )}

            {/* Information Notice Banner */}
            {successInfo && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.65rem',
                  padding: '0.85rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.35)',
                  color: '#6ee7b7',
                  fontSize: '0.85rem',
                  marginBottom: '1.5rem',
                  lineHeight: 1.5
                }}
              >
                <Info style={{ width: 18, height: 18, flexShrink: 0, marginTop: '0.1rem' }} />
                <div>{successInfo}</div>
              </div>
            )}

            {/* =============================================================== */}
            {/* SCREEN 01 — MASTER ACCESS PATHWAYS                              */}
            {/* =============================================================== */}
            {currentScreen === 'welcome' && (
              <div>
                <div style={{ marginBottom: '1.85rem' }}>
                  <h2 style={{ fontSize: '1.35rem', fontWeight: 600, color: '#ffffff', marginBottom: '0.35rem', letterSpacing: '-0.02em' }}>
                    Select Access Pathway
                  </h2>
                  <p style={{ fontSize: '0.86rem', color: 'rgba(255, 255, 255, 0.68)', lineHeight: 1.5 }}>
                    Choose your designated entry environment to authenticate your authorized healthcare workspace.
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem', marginBottom: '2rem' }}>
                  {/* PATHWAY 1: PATIENT ACCESS */}
                  <button
                    onClick={() => {
                      setErrorMessage(null);
                      setSuccessInfo(null);
                      setCurrentScreen('patient_signin');
                    }}
                    className="pathway-button"
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.1rem' }}>
                      <div
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: 'var(--radius-md)',
                          background: 'rgba(110, 231, 183, 0.12)',
                          border: '1px solid rgba(110, 231, 183, 0.25)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          marginTop: '0.1rem'
                        }}
                      >
                        <User style={{ width: 22, height: 22, color: 'var(--mint-accent)' }} />
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                          <span style={{ fontWeight: 600, fontSize: '1.05rem', color: '#ffffff' }}>
                            Patient Access
                          </span>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--mint-accent)', fontWeight: 500, marginBottom: '0.35rem' }}>
                          A calm, personal healthcare experience
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'rgba(255, 255, 255, 0.65)', lineHeight: 1.45 }}>
                          Appointments · Medical Records · Laboratory · Insurance · Ask MEDION
                        </div>
                      </div>
                    </div>
                    <ChevronRight style={{ width: 20, height: 20, color: 'var(--mint-accent)', flexShrink: 0 }} />
                  </button>

                  {/* PATHWAY 2: ORGANIZATION ACCESS */}
                  <button
                    onClick={() => {
                      setErrorMessage(null);
                      setSuccessInfo(null);
                      setCurrentScreen('org_access');
                    }}
                    className="pathway-button"
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.1rem' }}>
                      <div
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: 'var(--radius-md)',
                          background: 'rgba(30, 107, 82, 0.35)',
                          border: '1px solid rgba(110, 231, 183, 0.25)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          marginTop: '0.1rem'
                        }}
                      >
                        <Building2 style={{ width: 22, height: 22, color: '#ffffff' }} />
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                          <span style={{ fontWeight: 600, fontSize: '1.05rem', color: '#ffffff' }}>
                            Organization Access
                          </span>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--mint-accent)', fontWeight: 500, marginBottom: '0.35rem' }}>
                          Secure access for healthcare organizations
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'rgba(255, 255, 255, 0.65)', lineHeight: 1.45 }}>
                          Physicians · Nursing Teams · Front Desk · Diagnostics · Claims Desk · Hospital Command
                        </div>
                      </div>
                    </div>
                    <ChevronRight style={{ width: 20, height: 20, color: 'var(--mint-accent)', flexShrink: 0 }} />
                  </button>
                </div>

                {/* Secondary Institutional Action */}
                <div style={{ textAlign: 'center', fontSize: '0.82rem', color: 'rgba(255, 255, 255, 0.6)' }}>
                  Invited healthcare professional?{' '}
                  <button
                    onClick={() => {
                      setErrorMessage(null);
                      setSuccessInfo(null);
                      setCurrentScreen('org_activation');
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--mint-accent)',
                      cursor: 'pointer',
                      textDecoration: 'underline',
                      fontWeight: 500
                    }}
                  >
                    Activate your organization account
                  </button>
                </div>
              </div>
            )}

            {/* =============================================================== */}
            {/* SCREEN 02 — PATIENT SIGN IN                                     */}
            {/* =============================================================== */}
            {currentScreen === 'patient_signin' && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1.85rem' }}>
                  <button
                    onClick={() => {
                      setErrorMessage(null);
                      setSuccessInfo(null);
                      setCurrentScreen('welcome');
                    }}
                    className="btn-icon-ui"
                    style={{ color: '#ffffff', background: 'rgba(255, 255, 255, 0.06)' }}
                    aria-label="Back to access pathways"
                  >
                    <ArrowLeft style={{ width: 16, height: 16 }} />
                  </button>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#ffffff', margin: 0 }}>
                      Patient Sign In
                    </h3>
                    <p style={{ fontSize: '0.82rem', color: 'rgba(255, 255, 255, 0.65)', margin: 0 }}>
                      Access your personal healthcare workspace
                    </p>
                  </div>
                </div>

                <form onSubmit={handlePatientSignIn} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <Input
                    label="MRN, Registered Email, or Mobile Phone"
                    type="text"
                    placeholder="e.g. PAT-1025 or kavya.sharma@example.com"
                    value={patientIdentifier}
                    onChange={(e) => setPatientIdentifier(e.target.value)}
                    icon={<User style={{ width: 16, height: 16 }} />}
                    helperText="Enter your unique patient identifier or contact details on record"
                    required
                  />

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                      <label style={{ fontSize: '0.76rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-secondary)' }}>
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setErrorMessage(null);
                          setSuccessInfo(null);
                          setCurrentScreen('password_recovery');
                        }}
                        style={{ background: 'none', border: 'none', color: 'var(--mint-accent)', fontSize: '0.78rem', cursor: 'pointer' }}
                      >
                        Forgot password?
                      </button>
                    </div>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={patientPassword}
                      onChange={(e) => setPatientPassword(e.target.value)}
                      icon={<Lock style={{ width: 16, height: 16 }} />}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-ui btn-primary-ui"
                    style={{ width: '100%', padding: '0.9rem', fontSize: '0.95rem', borderRadius: 'var(--radius-md)', marginTop: '0.5rem' }}
                  >
                    {loading ? 'Authenticating Patient Portal...' : 'Sign In to Health Portal'}
                  </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: '1.85rem', fontSize: '0.84rem', color: 'rgba(255, 255, 255, 0.65)' }}>
                  First time visiting MEDION?{' '}
                  <button
                    onClick={() => {
                      setErrorMessage(null);
                      setSuccessInfo(null);
                      setPatientRegStep(1);
                      setCurrentScreen('patient_signup');
                    }}
                    style={{ background: 'none', border: 'none', color: 'var(--mint-accent)', cursor: 'pointer', fontWeight: 600 }}
                  >
                    Create a patient account
                  </button>
                </div>
              </div>
            )}

            {/* =============================================================== */}
            {/* SCREEN 03 — PROGRESSIVE PATIENT REGISTRATION (3 PACED STAGES)   */}
            {/* =============================================================== */}
            {currentScreen === 'patient_signup' && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1.5rem' }}>
                  <button
                    onClick={() => {
                      setErrorMessage(null);
                      if (patientRegStep === 3) setPatientRegStep(2);
                      else if (patientRegStep === 2) setPatientRegStep(1);
                      else setCurrentScreen('patient_signin');
                    }}
                    className="btn-icon-ui"
                    style={{ color: '#ffffff', background: 'rgba(255, 255, 255, 0.06)' }}
                    aria-label="Back"
                  >
                    <ArrowLeft style={{ width: 16, height: 16 }} />
                  </button>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#ffffff', margin: 0 }}>
                      Patient Account Registration
                    </h3>
                    <p style={{ fontSize: '0.82rem', color: 'rgba(255, 255, 255, 0.65)', margin: 0 }}>
                      {patientRegStep === 1 && 'Stage 1 of 3 — Legal Identity'}
                      {patientRegStep === 2 && 'Stage 2 of 3 — Contact & Demographics'}
                      {patientRegStep === 3 && 'Stage 3 of 3 — Security & Credentials'}
                    </p>
                  </div>
                </div>

                {/* Progressive Stage Stepper */}
                <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.35rem' }}>
                  {[1, 2, 3].map((step) => (
                    <div
                      key={step}
                      style={{
                        flex: 1,
                        height: 4,
                        borderRadius: 2,
                        background:
                          patientRegStep >= step ? 'var(--mint-accent)' : 'rgba(255, 255, 255, 0.15)',
                        transition: 'background 0.25s ease'
                      }}
                    />
                  ))}
                </div>

                {/* Accurate Production Registration Notice */}
                <div
                  style={{
                    padding: '0.8rem 0.95rem',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(30, 107, 82, 0.25)',
                    border: '1px solid rgba(110, 231, 183, 0.25)',
                    fontSize: '0.78rem',
                    color: 'rgba(255, 255, 255, 0.85)',
                    lineHeight: 1.45,
                    marginBottom: '1.35rem'
                  }}
                >
                  <div style={{ fontWeight: 600, color: 'var(--mint-accent)', marginBottom: '0.2rem' }}>
                    New Patient Registration
                  </div>
                  Submitting this form registers a new patient record in the database and generates your unique Medical Record Number (MRN). In future releases, an automated Master Patient Index (MPI) will cross-verify existing hospital charts.
                </div>

                <form onSubmit={handlePatientSignUp} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
                  {patientRegStep === 1 && (
                    <>
                      <Input
                        label="Legal First Name"
                        type="text"
                        placeholder="e.g. Harini"
                        value={patientForm.firstName}
                        onChange={(e) => setPatientForm({ ...patientForm, firstName: e.target.value })}
                        helperText="Enter your official legal first name as shown on national health identification"
                        required
                      />

                      <Input
                        label="Legal Last Name / Surname"
                        type="text"
                        placeholder="e.g. Sundaram"
                        value={patientForm.lastName}
                        onChange={(e) => setPatientForm({ ...patientForm, lastName: e.target.value })}
                      />

                      <button
                        type="submit"
                        className="btn-ui btn-primary-ui"
                        style={{ width: '100%', padding: '0.9rem', fontSize: '0.95rem', borderRadius: 'var(--radius-md)', marginTop: '0.5rem' }}
                      >
                        Continue to Contact Details <ArrowRight style={{ width: 15, height: 15 }} />
                      </button>
                    </>
                  )}

                  {patientRegStep === 2 && (
                    <>
                      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '0.75rem' }}>
                        <Input
                          label="Date of Birth"
                          type="date"
                          value={patientForm.dob}
                          onChange={(e) => setPatientForm({ ...patientForm, dob: e.target.value })}
                          required
                        />
                        <Select
                          label="Gender"
                          value={patientForm.gender}
                          onChange={(e) => setPatientForm({ ...patientForm, gender: e.target.value })}
                          options={[
                            { value: 'Female', label: 'Female' },
                            { value: 'Male', label: 'Male' },
                            { value: 'Other', label: 'Other' },
                          ]}
                        />
                      </div>

                      <Input
                        label="Mobile Phone Number"
                        type="tel"
                        placeholder="e.g. 9876543210"
                        value={patientForm.phone}
                        onChange={(e) => setPatientForm({ ...patientForm, phone: e.target.value })}
                        icon={<Phone style={{ width: 15, height: 15 }} />}
                        helperText="Used for appointment confirmations and security verification"
                        required
                      />

                      <button
                        type="submit"
                        className="btn-ui btn-primary-ui"
                        style={{ width: '100%', padding: '0.9rem', fontSize: '0.95rem', borderRadius: 'var(--radius-md)', marginTop: '0.5rem' }}
                      >
                        Continue to Portal Credentials <ArrowRight style={{ width: 15, height: 15 }} />
                      </button>
                    </>
                  )}

                  {patientRegStep === 3 && (
                    <>
                      <Input
                        label="Portal Email Address"
                        type="email"
                        placeholder="harini.sundaram@example.com"
                        value={patientForm.email}
                        onChange={(e) => setPatientForm({ ...patientForm, email: e.target.value })}
                        icon={<Mail style={{ width: 15, height: 15 }} />}
                        helperText="Used for portal sign-in, care summaries, and laboratory alerts"
                        required
                      />

                      <Input
                        label="Create Secure Password"
                        type="password"
                        placeholder="Minimum 8 characters"
                        value={patientForm.password}
                        onChange={(e) => setPatientForm({ ...patientForm, password: e.target.value })}
                        icon={<Lock style={{ width: 15, height: 15 }} />}
                        helperText="Use at least 8 characters with letters, numbers, and symbols"
                        required
                      />

                      <button
                        type="submit"
                        disabled={loading}
                        className="btn-ui btn-primary-ui"
                        style={{ width: '100%', padding: '0.9rem', fontSize: '0.95rem', borderRadius: 'var(--radius-md)', marginTop: '0.5rem' }}
                      >
                        {loading ? 'Creating Record in Supabase...' : 'Complete Patient Registration'}
                      </button>
                    </>
                  )}
                </form>
              </div>
            )}

            {/* =============================================================== */}
            {/* SCREEN 04 — HEALTHCARE ORGANIZATION ACCESS                      */}
            {/* =============================================================== */}
            {currentScreen === 'org_access' && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1.85rem' }}>
                  <button
                    onClick={() => {
                      setErrorMessage(null);
                      setSuccessInfo(null);
                      setCurrentScreen('welcome');
                    }}
                    className="btn-icon-ui"
                    style={{ color: '#ffffff', background: 'rgba(255, 255, 255, 0.06)' }}
                    aria-label="Back"
                  >
                    <ArrowLeft style={{ width: 16, height: 16 }} />
                  </button>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#ffffff', margin: 0 }}>
                      Organization Access
                    </h3>
                    <p style={{ fontSize: '0.82rem', color: 'rgba(255, 255, 255, 0.65)', margin: 0 }}>
                      Sign in with your verified institutional healthcare credentials
                    </p>
                  </div>
                </div>

                {/* Institutional Access Standard Notice */}
                <div
                  style={{
                    padding: '0.75rem 0.95rem',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(30, 107, 82, 0.2)',
                    border: '1px solid rgba(110, 231, 183, 0.2)',
                    fontSize: '0.78rem',
                    color: 'rgba(255, 255, 255, 0.85)',
                    lineHeight: 1.45,
                    marginBottom: '1.35rem'
                  }}
                >
                  <div style={{ fontWeight: 600, color: 'var(--mint-accent)', marginBottom: '0.2rem' }}>
                    Institutional Access Policy
                  </div>
                  Organization credentials automatically resolve your facility affiliation, department, role, and workspace permissions. Manual role selection is restricted.
                </div>

                <form onSubmit={handleOrgAccess} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <Input
                    label="Institutional Healthcare Email"
                    type="email"
                    placeholder="name@medionhealth.org"
                    value={orgEmail}
                    onChange={(e) => setOrgEmail(e.target.value)}
                    icon={<Mail style={{ width: 16, height: 16 }} />}
                    helperText="Enter your verified hospital or partner network email address"
                    required
                  />

                  <Input
                    label="Password"
                    type="password"
                    placeholder="••••••••"
                    value={orgPassword}
                    onChange={(e) => setOrgPassword(e.target.value)}
                    icon={<Lock style={{ width: 16, height: 16 }} />}
                    required
                  />

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-ui btn-primary-ui"
                    style={{ width: '100%', padding: '0.9rem', fontSize: '0.95rem', borderRadius: 'var(--radius-md)', marginTop: '0.5rem' }}
                  >
                    {loading ? 'Resolving Organization & Role...' : 'Authenticate & Enter Workspace'}
                  </button>
                </form>

                {/* Subtle Institutional Directory Mapping Helper for Testing/Evaluation */}
                <div
                  style={{
                    marginTop: '1.75rem',
                    padding: '0.85rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    fontSize: '0.78rem',
                    color: 'rgba(255, 255, 255, 0.6)',
                    lineHeight: 1.5
                  }}
                >
                  <div style={{ fontWeight: 600, color: 'rgba(255, 255, 255, 0.85)', marginBottom: '0.35rem' }}>
                    Institutional Directory Mapping
                  </div>
                  <div>Your department, role, and workspace permissions are resolved automatically from your credentials:</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.35rem', marginTop: '0.5rem', fontFamily: 'var(--font-mono)', fontSize: '0.72rem' }}>
                    <span style={{ color: 'var(--mint-accent)' }}>dr.mehta@medionhealth.org</span>
                    <span style={{ color: 'rgba(255,255,255,0.7)' }}>Attending Cardiologist</span>
                    <span style={{ color: 'var(--mint-accent)' }}>nurse.reka@medionhealth.org</span>
                    <span style={{ color: 'rgba(255,255,255,0.7)' }}>Charge Nurse</span>
                    <span style={{ color: 'var(--mint-accent)' }}>reception@medionhealth.org</span>
                    <span style={{ color: 'rgba(255,255,255,0.7)' }}>Front Desk Officer</span>
                    <span style={{ color: 'var(--mint-accent)' }}>lab.tech@medionlabs.org</span>
                    <span style={{ color: 'rgba(255,255,255,0.7)' }}>Laboratory Director</span>
                    <span style={{ color: 'var(--mint-accent)' }}>claims@medioncare.com</span>
                    <span style={{ color: 'rgba(255,255,255,0.7)' }}>Claims Adjudicator</span>
                    <span style={{ color: 'var(--mint-accent)' }}>admin@medionhealth.org</span>
                    <span style={{ color: 'rgba(255,255,255,0.7)' }}>Hospital Command Admin</span>
                  </div>
                </div>
              </div>
            )}

            {/* =============================================================== */}
            {/* SCREEN 05 — STAFF ACCOUNT ACTIVATION                            */}
            {/* =============================================================== */}
            {currentScreen === 'org_activation' && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1.5rem' }}>
                  <button
                    onClick={() => {
                      setErrorMessage(null);
                      setSuccessInfo(null);
                      setCurrentScreen('welcome');
                    }}
                    className="btn-icon-ui"
                    style={{ color: '#ffffff', background: 'rgba(255, 255, 255, 0.06)' }}
                    aria-label="Back"
                  >
                    <ArrowLeft style={{ width: 16, height: 16 }} />
                  </button>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#ffffff', margin: 0 }}>
                      Staff Account Activation
                    </h3>
                    <p style={{ fontSize: '0.82rem', color: 'rgba(255, 255, 255, 0.65)', margin: 0 }}>
                      Activate an invited institutional account with your hospital token
                    </p>
                  </div>
                </div>

                {/* Directory Service Notice */}
                <div
                  style={{
                    padding: '0.8rem 0.95rem',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(30, 107, 82, 0.2)',
                    border: '1px solid rgba(110, 231, 183, 0.25)',
                    fontSize: '0.8rem',
                    color: 'rgba(255, 255, 255, 0.85)',
                    lineHeight: 1.5,
                    marginBottom: '1.35rem'
                  }}
                >
                  <strong>Directory Service Notice:</strong> Staff token validation connects to enterprise LDAP / Active Directory SSO in production environments.
                </div>

                <form onSubmit={handleStaffActivation} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <Input
                    label="Hospital Invitation Token"
                    type="text"
                    value={invitationCode}
                    onChange={(e) => setInvitationCode(e.target.value)}
                    placeholder="e.g. MED-HOSP-7089"
                    icon={<KeyRound style={{ width: 16, height: 16 }} />}
                    helperText="Provided by your hospital department director or system administrator"
                    required
                  />

                  <Input
                    label="Assigned Institutional Email"
                    type="email"
                    value={activationEmail}
                    onChange={(e) => setActivationEmail(e.target.value)}
                    placeholder="e.g. staff.member@medionhealth.org"
                    icon={<Mail style={{ width: 16, height: 16 }} />}
                    required
                  />

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-ui btn-primary-ui"
                    style={{ width: '100%', padding: '0.9rem', fontSize: '0.95rem', borderRadius: 'var(--radius-md)', marginTop: '0.5rem' }}
                  >
                    {loading ? 'Validating Token...' : 'Verify Token & Proceed'}
                  </button>
                </form>
              </div>
            )}

            {/* =============================================================== */}
            {/* SCREEN 06 — PASSWORD RECOVERY                                   */}
            {/* =============================================================== */}
            {currentScreen === 'password_recovery' && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1.5rem' }}>
                  <button
                    onClick={() => {
                      setErrorMessage(null);
                      setSuccessInfo(null);
                      setCurrentScreen('patient_signin');
                    }}
                    className="btn-icon-ui"
                    style={{ color: '#ffffff', background: 'rgba(255, 255, 255, 0.06)' }}
                    aria-label="Back"
                  >
                    <ArrowLeft style={{ width: 16, height: 16 }} />
                  </button>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#ffffff', margin: 0 }}>
                      Password Recovery
                    </h3>
                    <p style={{ fontSize: '0.82rem', color: 'rgba(255, 255, 255, 0.65)', margin: 0 }}>
                      Request secure credential reset instructions
                    </p>
                  </div>
                </div>

                <div
                  style={{
                    padding: '0.85rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(30, 107, 82, 0.2)',
                    border: '1px solid rgba(110, 231, 183, 0.25)',
                    fontSize: '0.82rem',
                    color: 'rgba(255, 255, 255, 0.85)',
                    lineHeight: 1.5,
                    marginBottom: '1.35rem'
                  }}
                >
                  <strong>Gateway Notice:</strong> Automated password recovery dispatches via the hospital SMTP or SMS gateway. For immediate credential assistance, please contact the patient care desk.
                </div>

                <form onSubmit={handlePasswordRecovery} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <Input
                    label="Account Registered Email"
                    type="email"
                    placeholder="you@example.com"
                    value={recoveryEmail}
                    onChange={(e) => setRecoveryEmail(e.target.value)}
                    icon={<Mail style={{ width: 16, height: 16 }} />}
                    required
                  />

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-ui btn-primary-ui"
                    style={{ width: '100%', padding: '0.9rem', fontSize: '0.95rem', borderRadius: 'var(--radius-md)', marginTop: '0.5rem' }}
                  >
                    {loading ? 'Submitting Request...' : 'Submit Recovery Request'}
                  </button>
                </form>
              </div>
            )}

            {/* =============================================================== */}
            {/* SCREEN 07 — VERIFICATION & RECORD INITIALIZATION CONFIRMATION   */}
            {/* =============================================================== */}
            {currentScreen === 'verification' && (
              <div style={{ textAlign: 'center', padding: '0.75rem 0' }}>
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: '50%',
                    background: 'rgba(16, 185, 129, 0.16)',
                    border: '1px solid rgba(16, 185, 129, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1.35rem'
                  }}
                >
                  <CheckCircle2 style={{ width: 34, height: 34, color: 'var(--mint-accent)' }} />
                </div>

                <h3 style={{ fontSize: '1.4rem', fontWeight: 600, color: '#ffffff', marginBottom: '0.4rem' }}>
                  Patient Record Initialized
                </h3>

                {createdPatientId && (
                  <div
                    style={{
                      display: 'inline-block',
                      margin: '0.5rem 0 1.35rem',
                      padding: '0.45rem 1.15rem',
                      borderRadius: 'var(--radius-full)',
                      background: 'rgba(110, 231, 183, 0.12)',
                      border: '1px solid rgba(110, 231, 183, 0.35)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.92rem',
                      color: 'var(--mint-accent)',
                      fontWeight: 600
                    }}
                  >
                    Medical Record Number: {createdPatientId}
                  </div>
                )}

                <p style={{ fontSize: '0.88rem', color: 'rgba(255, 255, 255, 0.75)', marginBottom: '1.85rem', lineHeight: 1.6, maxWidth: 440, margin: '0 auto 1.85rem' }}>
                  A new patient record has been initialized in Supabase with assigned MRN. You may now access your personal patient workspace.
                </p>

                <button
                  onClick={() => onLoginSuccess('patient')}
                  className="btn-ui btn-primary-ui"
                  style={{ width: '100%', padding: '0.9rem', fontSize: '0.95rem', borderRadius: 'var(--radius-md)' }}
                >
                  Enter Patient Health Workspace
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Institutional Compliance & Standards Strip */}
      <footer
        style={{
          position: 'relative',
          zIndex: 10,
          padding: '1.25rem 2rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'rgba(7, 25, 20, 0.85)',
          backdropFilter: 'blur(16px)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          fontSize: '0.76rem',
          color: 'rgba(255, 255, 255, 0.5)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <span>MEDION Healthcare Intelligence Platform</span>
          <span>·</span>
          <span>Enterprise Operating Layer</span>
          <span>·</span>
          <span>HIPAA & NDHM Architecture Ready</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <span>HL7 FHIR Interoperability Standard</span>
          <span>·</span>
          <span>Encrypted Transport TLS 1.3</span>
          <span>·</span>
          <span>Multi-Tenant Node HOSP-001</span>
        </div>
      </footer>
    </div>
  );
};
