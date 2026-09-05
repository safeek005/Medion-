import React from 'react';
import { useLocation } from 'react-router-dom';
import { Code, User as UserIcon } from 'lucide-react';
import { UserRole } from '../../types';

interface HeaderProps {
  role: UserRole;
  onOpenTraceDrawer: () => void;
}

export const Header: React.FC<HeaderProps> = ({ role, onOpenTraceDrawer }) => {
  const location = useLocation();

  const getRoleTitle = (r: UserRole) => {
    switch (r) {
      case 'doctor': return 'Dr. Rajesh Mehta (Cardiology)';
      case 'nurse': return 'Nurse Reka (Clinical Operations)';
      case 'patient': return 'Arun Kumar (Patient)';
      case 'lab': return 'Lab Tech (Diagnostic Services)';
      case 'insurance': return 'Claims Officer (Payer Operations)';
      case 'hospital': return 'Hospital Administrator (HOSP-001)';
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
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)', textTransform: 'capitalize' }}>
            {getPathTitle(location.pathname)}
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button className="btn-ui btn-secondary-ui" onClick={onOpenTraceDrawer} style={{ fontSize: '0.78rem', padding: '0.38rem 0.85rem' }}>
          <Code style={{ width: 14, height: 14 }} /> View Execution Architecture
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-surface-secondary)', padding: '0.35rem 0.75rem', borderRadius: 20, border: '1px solid var(--border-subtle)' }}>
          <UserIcon style={{ width: 14, height: 14, color: 'var(--forest-green)' }} />
          <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-primary)' }}>
            {getRoleTitle(role)}
          </span>
        </div>
      </div>
    </header>
  );
};
