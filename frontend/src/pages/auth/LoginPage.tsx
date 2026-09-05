import React, { useState } from 'react';
import { UserRole } from '../../types';
import { Stethoscope, UserCheck, User, FlaskConical, ShieldCheck, Building2, Lock, ArrowRight } from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: (role: UserRole) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('dr.mehta@medionhealth.org');
  const [password, setPassword] = useState('demo1234');
  const [activeRole, setActiveRole] = useState<UserRole>('doctor');

  const roles: Array<{ id: UserRole; label: string; icon: React.ReactNode; defaultEmail: string; desc: string }> = [
    { id: 'doctor', label: 'Doctor', icon: <Stethoscope style={{ width: 16, height: 16 }} />, defaultEmail: 'dr.mehta@medionhealth.org', desc: 'Clinical Care & Patients' },
    { id: 'nurse', label: 'Nurse', icon: <UserCheck style={{ width: 16, height: 16 }} />, defaultEmail: 'nurse.reka@medionhealth.org', desc: 'Intake & Verification' },
    { id: 'patient', label: 'Patient', icon: <User style={{ width: 16, height: 16 }} />, defaultEmail: 'arun.kumar@example.com', desc: 'Personal Health Portal' },
    { id: 'lab', label: 'Laboratory', icon: <FlaskConical style={{ width: 16, height: 16 }} />, defaultEmail: 'lab.tech@medionlabs.org', desc: 'Pathology & Diagnostics' },
    { id: 'insurance', label: 'Insurance', icon: <ShieldCheck style={{ width: 16, height: 16 }} />, defaultEmail: 'claims@medioncare.com', desc: 'Claims & Adjudication' },
    { id: 'hospital', label: 'Hospital Admin', icon: <Building2 style={{ width: 16, height: 16 }} />, defaultEmail: 'admin@medionhealth.org', desc: 'Network Operations' },
  ];

  const handleRoleSelect = (r: typeof roles[0]) => {
    setActiveRole(r.id);
    setEmail(r.defaultEmail);
    onLoginSuccess(r.id);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLoginSuccess(activeRole);
  };

  return (
    <div
      style={{
        background: '#050c0a',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        color: '#ffffff',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Ambient background glow */}
      <div
        style={{
          position: 'absolute',
          width: 500,
          height: 500,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(4, 120, 87, 0.15) 0%, rgba(5, 12, 10, 0) 70%)',
          top: '20%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          position: 'relative',
          zIndex: 10,
          width: 480,
          maxWidth: '100%',
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '2.5rem',
          borderRadius: 16,
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(20px)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.5px', color: '#ffffff', marginBottom: '0.25rem' }}>
            MEDION <span style={{ color: '#34d399' }}>AGENT</span>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.6)' }}>
            Enter Clinical & Healthcare Operations Workspace
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ marginBottom: '2rem' }}>
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'rgba(255, 255, 255, 0.75)', marginBottom: '0.35rem' }}>
              Email Address
            </label>
            <input
              type="email"
              style={{
                width: '100%',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#ffffff',
                padding: '0.7rem 0.9rem',
                borderRadius: 8,
                fontSize: '0.9rem',
                outline: 'none',
              }}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'rgba(255, 255, 255, 0.75)', marginBottom: '0.35rem' }}>
              Password
            </label>
            <input
              type="password"
              style={{
                width: '100%',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#ffffff',
                padding: '0.7rem 0.9rem',
                borderRadius: 8,
                fontSize: '0.9rem',
                outline: 'none',
              }}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            style={{
              width: '100%',
              background: '#047857',
              color: '#ffffff',
              border: 'none',
              padding: '0.75rem',
              borderRadius: 8,
              fontSize: '0.95rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              transition: 'background 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#059669')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#047857')}
          >
            <Lock style={{ width: 15, height: 15 }} /> Enter Workspace
          </button>
        </form>

        <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '1.5rem' }}>
          <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600, color: '#34d399', textAlign: 'center', marginBottom: '1rem' }}>
            Instant Role Access (Demo Selection)
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
            {roles.map((r) => (
              <button
                key={r.id}
                onClick={() => handleRoleSelect(r)}
                style={{
                  background: activeRole === r.id ? 'rgba(52, 211, 153, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                  border: activeRole === r.id ? '1px solid rgba(52, 211, 153, 0.4)' : '1px solid rgba(255, 255, 255, 0.08)',
                  color: '#ffffff',
                  padding: '0.65rem 0.8rem',
                  borderRadius: 8,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(52, 211, 153, 0.5)';
                  e.currentTarget.style.background = 'rgba(52, 211, 153, 0.12)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = activeRole === r.id ? 'rgba(52, 211, 153, 0.4)' : 'rgba(255, 255, 255, 0.08)';
                  e.currentTarget.style.background = activeRole === r.id ? 'rgba(52, 211, 153, 0.15)' : 'rgba(255, 255, 255, 0.03)';
                }}
              >
                <div style={{ color: '#34d399' }}>{r.icon}</div>
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>{r.label}</div>
                  <div style={{ fontSize: '0.68rem', color: 'rgba(255, 255, 255, 0.5)' }}>{r.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
