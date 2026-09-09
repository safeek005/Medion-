import React from 'react';
import { useLocation } from 'react-router-dom';
import { Code, User as UserIcon, Search, ShieldCheck } from 'lucide-react';
import { UserRole } from '../../types';

interface HeaderProps {
  role: UserRole;
  onOpenTraceDrawer: () => void;
  onOpenGlobalSearch?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ role, onOpenTraceDrawer, onOpenGlobalSearch }) => {
  const location = useLocation();

  const getRoleTitle = (r: UserRole) => {
    switch (r) {
      case 'doctor': return 'Dr. Rajesh Mehta (Cardiology)';
      case 'nurse': return 'Nurse Reka (Clinical Operations)';
      case 'patient': return 'Arun Kumar (Patient)';
      case 'lab': return 'Lab Tech (Diagnostic Services)';
      case 'insurance': return 'Claims Officer (Payer Operations)';
      case 'hospital': return 'Hospital Administrator (HOSP-001)';
      case 'receptionist': return 'Priya Sharma (Front Desk & Intake)';
      default: return 'User';
    }
  };

  const getPathTitle = (path: string) => {
    const parts = path.split('/').filter(Boolean);
    if (parts.length <= 1) return 'Overview';
    return parts[1].replace('-', ' ');
  };

  return (
    <header className="top-header">
      {/* Left: Current View Title & Facility Badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-primary)', textTransform: 'capitalize' }}>
            {getPathTitle(location.pathname)}
          </span>
          <span
            style={{
              fontSize: '0.68rem',
              fontWeight: 600,
              padding: '0.2rem 0.5rem',
              borderRadius: 12,
              background: 'rgba(110, 231, 183, 0.08)',
              color: 'var(--color-primary-light)',
              border: '1px solid var(--border-accent)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-primary-light)' }} />
            HOSP-001 • LIVE
          </span>
        </div>
      </div>

      {/* Center/Right: Global Search & Execution Architecture */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {/* Global Cmd+K Search Trigger */}
        <button
          onClick={onOpenGlobalSearch}
          className="btn-ui"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 8,
            padding: '0.4rem 0.85rem',
            fontSize: '0.78rem',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            cursor: 'pointer',
          }}
          title="Search patients, doctors, records (Ctrl+K or Cmd+K)"
        >
          <Search style={{ width: 14, height: 14, color: 'var(--color-primary-light)' }} />
          <span>Quick search...</span>
          <kbd
            style={{
              fontSize: '0.65rem',
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 4,
              padding: '0.1rem 0.35rem',
              color: 'var(--text-muted)',
            }}
          >
            ⌘K
          </kbd>
        </button>

        {/* View Execution Architecture Drawer Trigger */}
        <button
          className="btn-ui btn-secondary-ui"
          onClick={onOpenTraceDrawer}
          style={{ fontSize: '0.78rem', padding: '0.38rem 0.85rem' }}
        >
          <Code style={{ width: 14, height: 14 }} /> View Execution Architecture
        </button>

        {/* Role Pill */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'var(--bg-card)',
            padding: '0.35rem 0.75rem',
            borderRadius: 20,
            border: '1px solid var(--border-subtle)',
          }}
        >
          <UserIcon style={{ width: 14, height: 14, color: 'var(--color-primary-light)' }} />
          <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-primary)' }}>
            {getRoleTitle(role)}
          </span>
        </div>
      </div>
    </header>
  );
};
