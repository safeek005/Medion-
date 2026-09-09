import React, { useState } from 'react';
import { UserRole } from '../../types';
import {
  Stethoscope,
  UserCheck,
  User,
  FlaskConical,
  ShieldCheck,
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
  ClipboardList
} from 'lucide-react';
import { dataService } from '../../services/dataService';

interface LoginPageProps {
  onLoginSuccess: (role: UserRole) => void;
}

type AuthScreen =
  | 'welcome'           // Screen 01: Welcome (Patient vs Org)
  | 'patient_signin'    // Screen 02: Patient Sign In
  | 'patient_signup'    // Screen 03: Patient Account Creation
  | 'org_access'        // Screen 04: Organization Access
  | 'org_activation'    // Screen 05: Staff Account Activation
  | 'password_recovery' // Screen 06: Password Recovery
  | 'verification';     // Screen 07: Verification State

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [currentScreen, setCurrentScreen] = useState<AuthScreen>('welcome');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [invitationCode, setInvitationCode] = useState('MED-HOSP-7089');
  const [verificationCode, setVerificationCode] = useState('');
  const [selectedOrgRole, setSelectedOrgRole] = useState<UserRole>('doctor');
  const [loading, setLoading] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // Patient Registration Multi-step Form State
  const [patientRegStep, setPatientRegStep] = useState<1 | 2>(1);
  const [patientForm, setPatientForm] = useState({
    firstName: '',
    lastName: '',
    dob: '',
    gender: 'Female',
    phone: '',
    email: '',
    password: '',
  });

  // Discrete Role Demo Switcher List
  const demoRoles: Array<{ id: UserRole; label: string; icon: React.ReactNode; defaultEmail: string; desc: string }> = [
    { id: 'doctor', label: 'Doctor', icon: <Stethoscope style={{ width: 14, height: 14 }} />, defaultEmail: 'dr.mehta@medionhealth.org', desc: 'Clinical Care & Patients' },
    { id: 'nurse', label: 'Nurse', icon: <UserCheck style={{ width: 14, height: 14 }} />, defaultEmail: 'nurse.reka@medionhealth.org', desc: 'Intake & Care Tasks' },
    { id: 'receptionist', label: 'Receptionist', icon: <ClipboardList style={{ width: 14, height: 14 }} />, defaultEmail: 'reception@medionhealth.org', desc: 'Patient Intake & Slots' },
    { id: 'patient', label: 'Patient', icon: <User style={{ width: 14, height: 14 }} />, defaultEmail: 'arun.kumar@example.com', desc: 'Personal Health Portal' },
    { id: 'lab', label: 'Laboratory', icon: <FlaskConical style={{ width: 14, height: 14 }} />, defaultEmail: 'lab.tech@medionlabs.org', desc: 'Pathology & Diagnostics' },
    { id: 'insurance', label: 'Insurance', icon: <ShieldCheck style={{ width: 14, height: 14 }} />, defaultEmail: 'claims@medioncare.com', desc: 'Claims & Adjudication' },
    { id: 'hospital', label: 'MEDION Command', icon: <Building2 style={{ width: 14, height: 14 }} />, defaultEmail: 'admin@medionhealth.org', desc: 'Hospital Intelligence' },
  ];

  const handlePatientSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onLoginSuccess('patient');
    }, 450);
  };

  const handlePatientSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (patientRegStep === 1) {
      if (!patientForm.firstName || !patientForm.phone) {
        setFeedbackMessage('Please provide your name and contact phone number.');
        return;
      }
      setFeedbackMessage(null);
      setPatientRegStep(2);
      return;
    }

    setLoading(true);
    try {
      // Register in Supabase / Local Store
      dataService.createPatient({
        first_name: patientForm.firstName,
        last_name: patientForm.lastName,
        dob: patientForm.dob || '2000-01-01',
        gender: patientForm.gender,
        phone: patientForm.phone,
        email: patientForm.email,
        blood_group: null,
        address: null,
        emergency_contact: null,
        primary_doctor_id: null,
        insurance_policy_id: null
      });
      setLoading(false);
      setCurrentScreen('verification');
    } catch (err) {
      setLoading(false);
      setCurrentScreen('verification');
    }
  };

  const handleOrgAccess = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onLoginSuccess(selectedOrgRole);
    }, 450);
  };

  const handleStaffActivation = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onLoginSuccess(selectedOrgRole);
    }, 450);
  };

  return (
    <div
      style={{
        background: 'linear-gradient(180deg, #071914 0%, #05130f 100%)',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1.5rem',
        color: '#ffffff',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: 'var(--font-sans)',
      }}
    >
      {/* Subtle Ambient Clinical Glow */}
      <div
        style={{
          position: 'absolute',
          width: 700,
          height: 700,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(30, 107, 82, 0.22) 0%, rgba(7, 25, 20, 0) 70%)',
          top: '25%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
        }}
      />

      {/* Brand Header */}
      <div style={{ textAlign: 'center', marginBottom: '2.25rem', position: 'relative', zIndex: 10 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.6rem' }}>
          <div style={{
            width: 32,
            height: 32,
            borderRadius: 'var(--radius-sm)',
            background: 'var(--forest-brand)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(30, 107, 82, 0.4)'
          }}>
            <Sparkles style={{ width: 17, height: 17, color: '#ffffff' }} />
          </div>
          <span style={{ fontSize: '1.45rem', fontWeight: 700, letterSpacing: '-0.03em', color: '#ffffff' }}>
            MEDION <span style={{ color: 'var(--mint-accent)' }}>AGENT</span>
          </span>
        </div>
        <p style={{ fontSize: '0.86rem', color: 'rgba(255, 255, 255, 0.65)', letterSpacing: '-0.01em' }}>
          Enterprise Multi-Agent Healthcare Operating System
        </p>
      </div>

      {/* Main Form Surface */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          width: '100%',
          maxWidth: 520,
          background: 'rgba(14, 43, 35, 0.85)',
          border: '1px solid rgba(110, 231, 183, 0.16)',
          padding: '2.5rem',
          borderRadius: 'var(--radius-xl)',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.55)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          animation: 'fadeIn 0.25s ease-out'
        }}
      >
        {/* ================================================================= */}
        {/* SCREEN 01 — WELCOME TO MEDION                                     */}
        {/* ================================================================= */}
        {currentScreen === 'welcome' && (
          <div>
            <div style={{ marginBottom: '1.75rem', textAlign: 'center' }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 600, color: '#ffffff', marginBottom: '0.4rem' }}>
                Welcome to MEDION
              </h2>
              <p style={{ fontSize: '0.86rem', color: 'rgba(255, 255, 255, 0.7)' }}>
                Select your designated access environment to proceed
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
              {/* Option A: Patient Portal */}
              <button
                onClick={() => setCurrentScreen('patient_signin')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1.25rem 1.4rem',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(110, 231, 183, 0.22)',
                  borderRadius: 'var(--radius-lg)',
                  color: '#ffffff',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.18s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(30, 107, 82, 0.25)';
                  e.currentTarget.style.borderColor = 'var(--mint-accent)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                  e.currentTarget.style.borderColor = 'rgba(110, 231, 183, 0.22)';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{
                    width: 44,
                    height: 44,
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(110, 231, 183, 0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <User style={{ width: 22, height: 22, color: 'var(--mint-accent)' }} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '1rem', color: '#ffffff' }}>Continue as Patient</div>
                    <div style={{ fontSize: '0.78rem', color: 'rgba(255, 255, 255, 0.65)' }}>
                      Personal records, appointments, lab reports & Ask MEDION
                    </div>
                  </div>
                </div>
                <ChevronRight style={{ width: 18, height: 18, color: 'var(--mint-accent)' }} />
              </button>

              {/* Option B: Healthcare Organization Access */}
              <button
                onClick={() => setCurrentScreen('org_access')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1.25rem 1.4rem',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(110, 231, 183, 0.22)',
                  borderRadius: 'var(--radius-lg)',
                  color: '#ffffff',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.18s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(30, 107, 82, 0.25)';
                  e.currentTarget.style.borderColor = 'var(--mint-accent)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                  e.currentTarget.style.borderColor = 'rgba(110, 231, 183, 0.22)';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{
                    width: 44,
                    height: 44,
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(30, 107, 82, 0.35)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Building2 style={{ width: 22, height: 22, color: '#ffffff' }} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '1rem', color: '#ffffff' }}>Organization Access</div>
                    <div style={{ fontSize: '0.78rem', color: 'rgba(255, 255, 255, 0.65)' }}>
                      Clinicians, nurses, receptionists, lab & hospital admins
                    </div>
                  </div>
                </div>
                <ChevronRight style={{ width: 18, height: 18, color: 'var(--mint-accent)' }} />
              </button>
            </div>

            <div style={{ textAlign: 'center', fontSize: '0.78rem', color: 'rgba(255, 255, 255, 0.5)' }}>
              Invited staff?{' '}
              <button
                onClick={() => setCurrentScreen('org_activation')}
                style={{ background: 'none', border: 'none', color: 'var(--mint-accent)', cursor: 'pointer', textDecoration: 'underline' }}
              >
                Activate your organization account
              </button>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* SCREEN 02 — PATIENT SIGN IN                                       */}
        {/* ================================================================= */}
        {currentScreen === 'patient_signin' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <button
                onClick={() => setCurrentScreen('welcome')}
                className="btn-icon-ui"
                style={{ color: '#ffffff' }}
              >
                <ArrowLeft style={{ width: 16, height: 16 }} />
              </button>
              <div>
                <h3 style={{ fontSize: '1.2rem', color: '#ffffff' }}>Patient Sign In</h3>
                <p style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.65)' }}>
                  Access your personal health records
                </p>
              </div>
            </div>

            <form onSubmit={handlePatientSignIn}>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.76rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgba(255, 255, 255, 0.7)', marginBottom: '0.4rem' }}>
                  Registered Email or Phone
                </label>
                <input
                  type="text"
                  placeholder="arun.kumar@example.com"
                  defaultValue="arun.kumar@example.com"
                  required
                  style={{
                    width: '100%',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.75rem 1rem',
                    color: '#ffffff',
                    fontSize: '0.9rem',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <label style={{ fontSize: '0.76rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgba(255, 255, 255, 0.7)' }}>
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setCurrentScreen('password_recovery')}
                    style={{ background: 'none', border: 'none', color: 'var(--mint-accent)', fontSize: '0.76rem', cursor: 'pointer' }}
                  >
                    Forgot password?
                  </button>
                </div>
                <input
                  type="password"
                  placeholder="••••••••"
                  defaultValue="patient123"
                  required
                  style={{
                    width: '100%',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.75rem 1rem',
                    color: '#ffffff',
                    fontSize: '0.9rem',
                    outline: 'none'
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-ui btn-primary-ui"
                style={{ width: '100%', padding: '0.8rem', fontSize: '0.95rem', borderRadius: 'var(--radius-md)' }}
              >
                {loading ? 'Authenticating...' : 'Sign In to Health Portal'}
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.82rem', color: 'rgba(255, 255, 255, 0.7)' }}>
              New to MEDION?{' '}
              <button
                onClick={() => setCurrentScreen('patient_signup')}
                style={{ background: 'none', border: 'none', color: 'var(--mint-accent)', cursor: 'pointer', fontWeight: 600 }}
              >
                Create a patient account
              </button>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* SCREEN 03 — PATIENT ACCOUNT CREATION                              */}
        {/* ================================================================= */}
        {currentScreen === 'patient_signup' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <button
                onClick={() => {
                  if (patientRegStep === 2) setPatientRegStep(1);
                  else setCurrentScreen('patient_signin');
                }}
                className="btn-icon-ui"
                style={{ color: '#ffffff' }}
              >
                <ArrowLeft style={{ width: 16, height: 16 }} />
              </button>
              <div>
                <h3 style={{ fontSize: '1.2rem', color: '#ffffff' }}>
                  Create Patient Account
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.65)' }}>
                  Step {patientRegStep} of 2 — {patientRegStep === 1 ? 'Personal Details' : 'Security & Login'}
                </p>
              </div>
            </div>

            {feedbackMessage && (
              <div style={{
                padding: '0.65rem 0.9rem',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(220, 38, 38, 0.2)',
                border: '1px solid rgba(220, 38, 38, 0.35)',
                color: '#fca5a5',
                fontSize: '0.8rem',
                marginBottom: '1rem'
              }}>
                {feedbackMessage}
              </div>
            )}

            <form onSubmit={handlePatientSignUp}>
              {patientRegStep === 1 ? (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.74rem', textTransform: 'uppercase', color: 'rgba(255, 255, 255, 0.7)', marginBottom: '0.3rem' }}>
                        First Name
                      </label>
                      <input
                        type="text"
                        placeholder="Harini"
                        value={patientForm.firstName}
                        onChange={(e) => setPatientForm({ ...patientForm, firstName: e.target.value })}
                        required
                        style={{ width: '100%', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: 8, padding: '0.65rem', color: '#ffffff' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.74rem', textTransform: 'uppercase', color: 'rgba(255, 255, 255, 0.7)', marginBottom: '0.3rem' }}>
                        Last Name
                      </label>
                      <input
                        type="text"
                        placeholder="S"
                        value={patientForm.lastName}
                        onChange={(e) => setPatientForm({ ...patientForm, lastName: e.target.value })}
                        style={{ width: '100%', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: 8, padding: '0.65rem', color: '#ffffff' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.74rem', textTransform: 'uppercase', color: 'rgba(255, 255, 255, 0.7)', marginBottom: '0.3rem' }}>
                        Date of Birth
                      </label>
                      <input
                        type="date"
                        value={patientForm.dob}
                        onChange={(e) => setPatientForm({ ...patientForm, dob: e.target.value })}
                        style={{ width: '100%', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: 8, padding: '0.65rem', color: '#ffffff' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.74rem', textTransform: 'uppercase', color: 'rgba(255, 255, 255, 0.7)', marginBottom: '0.3rem' }}>
                        Gender
                      </label>
                      <select
                        value={patientForm.gender}
                        onChange={(e) => setPatientForm({ ...patientForm, gender: e.target.value })}
                        style={{ width: '100%', background: '#0a221b', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: 8, padding: '0.65rem', color: '#ffffff' }}
                      >
                        <option value="Female">Female</option>
                        <option value="Male">Male</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', fontSize: '0.74rem', textTransform: 'uppercase', color: 'rgba(255, 255, 255, 0.7)', marginBottom: '0.3rem' }}>
                      Mobile Phone Number
                    </label>
                    <input
                      type="tel"
                      placeholder="9566036555"
                      value={patientForm.phone}
                      onChange={(e) => setPatientForm({ ...patientForm, phone: e.target.value })}
                      required
                      style={{ width: '100%', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: 8, padding: '0.65rem', color: '#ffffff' }}
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn-ui btn-primary-ui"
                    style={{ width: '100%', padding: '0.8rem', fontSize: '0.95rem', borderRadius: 'var(--radius-md)' }}
                  >
                    Continue to Account Credentials <ArrowRight style={{ width: 14, height: 14 }} />
                  </button>
                </>
              ) : (
                <>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontSize: '0.74rem', textTransform: 'uppercase', color: 'rgba(255, 255, 255, 0.7)', marginBottom: '0.3rem' }}>
                      Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="harini@example.com"
                      value={patientForm.email}
                      onChange={(e) => setPatientForm({ ...patientForm, email: e.target.value })}
                      required
                      style={{ width: '100%', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: 8, padding: '0.65rem', color: '#ffffff' }}
                    />
                  </div>

                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', fontSize: '0.74rem', textTransform: 'uppercase', color: 'rgba(255, 255, 255, 0.7)', marginBottom: '0.3rem' }}>
                      Create Secure Password
                    </label>
                    <input
                      type="password"
                      placeholder="Minimum 8 characters"
                      value={patientForm.password}
                      onChange={(e) => setPatientForm({ ...patientForm, password: e.target.value })}
                      required
                      style={{ width: '100%', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: 8, padding: '0.65rem', color: '#ffffff' }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-ui btn-primary-ui"
                    style={{ width: '100%', padding: '0.8rem', fontSize: '0.95rem', borderRadius: 'var(--radius-md)' }}
                  >
                    {loading ? 'Registering Account...' : 'Complete Patient Registration'}
                  </button>
                </>
              )}
            </form>
          </div>
        )}

        {/* ================================================================= */}
        {/* SCREEN 04 — ORGANIZATION ACCESS                                   */}
        {/* ================================================================= */}
        {currentScreen === 'org_access' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <button
                onClick={() => setCurrentScreen('welcome')}
                className="btn-icon-ui"
                style={{ color: '#ffffff' }}
              >
                <ArrowLeft style={{ width: 16, height: 16 }} />
              </button>
              <div>
                <h3 style={{ fontSize: '1.2rem', color: '#ffffff' }}>Healthcare Organization Access</h3>
                <p style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.65)' }}>
                  Sign in with your clinical institutional credentials
                </p>
              </div>
            </div>

            <form onSubmit={handleOrgAccess}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.76rem', textTransform: 'uppercase', color: 'rgba(255, 255, 255, 0.7)', marginBottom: '0.4rem' }}>
                  Professional Role
                </label>
                <select
                  value={selectedOrgRole}
                  onChange={(e) => setSelectedOrgRole(e.target.value as UserRole)}
                  style={{
                    width: '100%',
                    background: '#0a221b',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.75rem 1rem',
                    color: '#ffffff',
                    fontSize: '0.9rem',
                    outline: 'none'
                  }}
                >
                  <option value="doctor">Doctor / Physician</option>
                  <option value="nurse">Nurse / Clinical Care</option>
                  <option value="receptionist">Receptionist / Front Desk</option>
                  <option value="lab">Laboratory Specialist</option>
                  <option value="insurance">Insurance Adjudicator</option>
                  <option value="hospital">Hospital Administrator (MEDION Command)</option>
                </select>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.76rem', textTransform: 'uppercase', color: 'rgba(255, 255, 255, 0.7)', marginBottom: '0.4rem' }}>
                  Institutional Email
                </label>
                <input
                  type="email"
                  placeholder="name@hospital.medionhealth.org"
                  defaultValue={
                    selectedOrgRole === 'doctor' ? 'dr.mehta@medionhealth.org' :
                    selectedOrgRole === 'nurse' ? 'nurse.reka@medionhealth.org' :
                    selectedOrgRole === 'receptionist' ? 'reception@medionhealth.org' :
                    selectedOrgRole === 'lab' ? 'lab.tech@medionlabs.org' :
                    selectedOrgRole === 'insurance' ? 'claims@medioncare.com' : 'admin@medionhealth.org'
                  }
                  required
                  style={{
                    width: '100%',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.75rem 1rem',
                    color: '#ffffff',
                    fontSize: '0.9rem',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.76rem', textTransform: 'uppercase', color: 'rgba(255, 255, 255, 0.7)', marginBottom: '0.4rem' }}>
                  Password
                </label>
                <input
                  type="password"
                  defaultValue="demo1234"
                  required
                  style={{
                    width: '100%',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.75rem 1rem',
                    color: '#ffffff',
                    fontSize: '0.9rem',
                    outline: 'none'
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-ui btn-primary-ui"
                style={{ width: '100%', padding: '0.8rem', fontSize: '0.95rem', borderRadius: 'var(--radius-md)' }}
              >
                {loading ? 'Verifying Credentials...' : 'Authenticate Clinical Workspace'}
              </button>
            </form>
          </div>
        )}

        {/* ================================================================= */}
        {/* SCREEN 05 — ACCOUNT ACTIVATION                                    */}
        {/* ================================================================= */}
        {currentScreen === 'org_activation' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <button
                onClick={() => setCurrentScreen('welcome')}
                className="btn-icon-ui"
                style={{ color: '#ffffff' }}
              >
                <ArrowLeft style={{ width: 16, height: 16 }} />
              </button>
              <div>
                <h3 style={{ fontSize: '1.2rem', color: '#ffffff' }}>Account Activation</h3>
                <p style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.65)' }}>
                  Activate an invited staff account with an organization token
                </p>
              </div>
            </div>

            <form onSubmit={handleStaffActivation}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.76rem', textTransform: 'uppercase', color: 'rgba(255, 255, 255, 0.7)', marginBottom: '0.4rem' }}>
                  Hospital Invitation Token
                </label>
                <input
                  type="text"
                  value={invitationCode}
                  onChange={(e) => setInvitationCode(e.target.value)}
                  placeholder="e.g. MED-HOSP-7089"
                  required
                  style={{
                    width: '100%',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.75rem 1rem',
                    color: '#ffffff',
                    fontSize: '0.9rem',
                    fontFamily: 'var(--font-mono)'
                  }}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.76rem', textTransform: 'uppercase', color: 'rgba(255, 255, 255, 0.7)', marginBottom: '0.4rem' }}>
                  Assigning Role
                </label>
                <select
                  value={selectedOrgRole}
                  onChange={(e) => setSelectedOrgRole(e.target.value as UserRole)}
                  style={{
                    width: '100%',
                    background: '#0a221b',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.75rem 1rem',
                    color: '#ffffff',
                    fontSize: '0.9rem'
                  }}
                >
                  <option value="doctor">Doctor (Consulting Physician)</option>
                  <option value="nurse">Nurse (Triage & Ward Care)</option>
                  <option value="receptionist">Receptionist (Front Desk Desk)</option>
                  <option value="lab">Laboratory Personnel</option>
                  <option value="insurance">Insurance Adjudicator</option>
                </select>
              </div>

              <button
                type="submit"
                className="btn-ui btn-primary-ui"
                style={{ width: '100%', padding: '0.8rem', fontSize: '0.95rem', borderRadius: 'var(--radius-md)' }}
              >
                Validate Token & Enter Workspace
              </button>
            </form>
          </div>
        )}

        {/* ================================================================= */}
        {/* SCREEN 06 — PASSWORD RECOVERY                                     */}
        {/* ================================================================= */}
        {currentScreen === 'password_recovery' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <button
                onClick={() => setCurrentScreen('patient_signin')}
                className="btn-icon-ui"
                style={{ color: '#ffffff' }}
              >
                <ArrowLeft style={{ width: 16, height: 16 }} />
              </button>
              <div>
                <h3 style={{ fontSize: '1.2rem', color: '#ffffff' }}>Password Recovery</h3>
                <p style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.65)' }}>
                  We will send a secure password reset link
                </p>
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.76rem', textTransform: 'uppercase', color: 'rgba(255, 255, 255, 0.7)', marginBottom: '0.4rem' }}>
                Account Email Address
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.75rem 1rem',
                  color: '#ffffff',
                  fontSize: '0.9rem'
                }}
              />
            </div>

            <button
              onClick={() => {
                setFeedbackMessage('Reset link dispatched. Please check your inbox.');
                setTimeout(() => setCurrentScreen('patient_signin'), 2000);
              }}
              className="btn-ui btn-primary-ui"
              style={{ width: '100%', padding: '0.8rem', fontSize: '0.95rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }}
            >
              Send Reset Instructions
            </button>
          </div>
        )}

        {/* ================================================================= */}
        {/* SCREEN 07 — VERIFICATION STATE                                    */}
        {/* ================================================================= */}
        {currentScreen === 'verification' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem'
            }}>
              <CheckCircle2 style={{ width: 28, height: 28, color: 'var(--clinical-green)' }} />
            </div>
            <h3 style={{ fontSize: '1.25rem', color: '#ffffff', marginBottom: '0.5rem' }}>
              Account Verification
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.7)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
              A security verification code has been dispatched to your contact channel. You can now access your patient portal.
            </p>

            <button
              onClick={() => onLoginSuccess('patient')}
              className="btn-ui btn-primary-ui"
              style={{ width: '100%', padding: '0.8rem', fontSize: '0.95rem', borderRadius: 'var(--radius-md)' }}
            >
              Enter Patient Health Portal
            </button>
          </div>
        )}
      </div>

      {/* Discrete Role Switcher for Evaluators & Testing */}
      <div style={{
        marginTop: '2.5rem',
        maxWidth: 620,
        width: '100%',
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: 'var(--radius-lg)',
        padding: '0.85rem 1.25rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem',
        zIndex: 10
      }}>
        <div style={{ fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'rgba(255, 255, 255, 0.5)' }}>
          Clinical Roles Quick Preview:
        </div>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {demoRoles.map((r) => (
            <button
              key={r.id}
              onClick={() => onLoginSuccess(r.id)}
              style={{
                padding: '0.28rem 0.6rem',
                borderRadius: 'var(--radius-xs)',
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#ffffff',
                fontSize: '0.74rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(30, 107, 82, 0.4)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)')}
            >
              {r.icon}
              {r.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
