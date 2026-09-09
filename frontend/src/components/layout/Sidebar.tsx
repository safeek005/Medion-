import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Calendar,
  FileText,
  FlaskConical,
  ShieldCheck,
  Sparkles,
  Bell,
  User,
  Settings,
  Building2,
  BarChart3,
  Cpu,
  LogOut,
  ChevronLeft,
  ChevronRight,
  UserPlus,
  Stethoscope,
} from 'lucide-react';
import { UserRole } from '../../types';

interface SidebarProps {
  role: UserRole;
  onRoleChange: (role: UserRole) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  role,
  onRoleChange,
  collapsed,
  onToggleCollapse,
  onLogout,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Navigation Section Grouping Generator
  const getNavSections = (r: UserRole) => {
    let workspaceItems: Array<{ id: string; label: string; icon: React.ReactNode; path: string }> = [];

    const prefix = r === 'lab' ? '/laboratory' : `/${r}`;

    switch (r) {
      case 'doctor':
        workspaceItems = [
          { id: 'overview', label: 'Clinical Overview', icon: <LayoutDashboard style={{ width: 16, height: 16 }} />, path: '/doctor' },
          { id: 'patients', label: 'Patient Charts', icon: <Users style={{ width: 16, height: 16 }} />, path: '/doctor/patients' },
          { id: 'appointments', label: 'Consultations', icon: <Calendar style={{ width: 16, height: 16 }} />, path: '/doctor/appointments' },
          { id: 'prescriptions', label: 'Rx Prescriptions', icon: <FileText style={{ width: 16, height: 16 }} />, path: '/doctor/prescriptions' },
          { id: 'lab-reports', label: 'Diagnostic Panels', icon: <FlaskConical style={{ width: 16, height: 16 }} />, path: '/doctor/lab-reports' },
        ];
        break;

      case 'nurse':
        workspaceItems = [
          { id: 'overview', label: 'Station Overview', icon: <LayoutDashboard style={{ width: 16, height: 16 }} />, path: '/nurse' },
          { id: 'patients', label: 'Bed Inpatients', icon: <Users style={{ width: 16, height: 16 }} />, path: '/nurse/patients' },
          { id: 'appointments', label: 'Care Schedule', icon: <Calendar style={{ width: 16, height: 16 }} />, path: '/nurse/appointments' },
          { id: 'prescriptions', label: 'Medication Orders', icon: <FileText style={{ width: 16, height: 16 }} />, path: '/nurse/prescriptions' },
          { id: 'lab-reports', label: 'Lab Orders', icon: <FlaskConical style={{ width: 16, height: 16 }} />, path: '/nurse/lab-reports' },
          { id: 'insurance', label: 'Coverage Verification', icon: <ShieldCheck style={{ width: 16, height: 16 }} />, path: '/nurse/insurance' },
        ];
        break;

      case 'receptionist':
        workspaceItems = [
          { id: 'overview', label: 'Front Desk Overview', icon: <LayoutDashboard style={{ width: 16, height: 16 }} />, path: '/receptionist' },
          { id: 'intake', label: 'Patient Intake Wizard', icon: <UserPlus style={{ width: 16, height: 16 }} />, path: '/receptionist/intake' },
          { id: 'appointments', label: 'Today\'s Schedule', icon: <Calendar style={{ width: 16, height: 16 }} />, path: '/receptionist/appointments' },
          { id: 'patients', label: 'Master Patient Index', icon: <Users style={{ width: 16, height: 16 }} />, path: '/receptionist/patients' },
        ];
        break;

      case 'patient':
        workspaceItems = [
          { id: 'overview', label: 'Health Summary', icon: <LayoutDashboard style={{ width: 16, height: 16 }} />, path: '/patient' },
          { id: 'appointments', label: 'My Appointments', icon: <Calendar style={{ width: 16, height: 16 }} />, path: '/patient/appointments' },
          { id: 'prescriptions', label: 'My Prescriptions', icon: <FileText style={{ width: 16, height: 16 }} />, path: '/patient/prescriptions' },
          { id: 'lab-reports', label: 'Lab Reports', icon: <FlaskConical style={{ width: 16, height: 16 }} />, path: '/patient/lab-reports' },
          { id: 'insurance', label: 'Insurance Policy', icon: <ShieldCheck style={{ width: 16, height: 16 }} />, path: '/patient/insurance' },
        ];
        break;

      case 'lab':
        workspaceItems = [
          { id: 'overview', label: 'Lab Station', icon: <LayoutDashboard style={{ width: 16, height: 16 }} />, path: '/laboratory' },
          { id: 'patients', label: 'Diagnostic Queue', icon: <Users style={{ width: 16, height: 16 }} />, path: '/laboratory/patients' },
          { id: 'reports', label: 'Specimen Reports', icon: <FlaskConical style={{ width: 16, height: 16 }} />, path: '/laboratory/reports' },
          { id: 'report-processing', label: 'Automated Pipeline', icon: <Cpu style={{ width: 16, height: 16 }} />, path: '/laboratory/report-processing' },
        ];
        break;

      case 'insurance':
        workspaceItems = [
          { id: 'overview', label: 'Payer Portal', icon: <LayoutDashboard style={{ width: 16, height: 16 }} />, path: '/insurance' },
          { id: 'policies', label: 'Policy Directory', icon: <FileText style={{ width: 16, height: 16 }} />, path: '/insurance/policies' },
          { id: 'claims', label: 'Claims Adjudication', icon: <ShieldCheck style={{ width: 16, height: 16 }} />, path: '/insurance/claims' },
          { id: 'patients', label: 'Beneficiaries', icon: <Users style={{ width: 16, height: 16 }} />, path: '/insurance/patients' },
        ];
        break;

      case 'hospital':
        workspaceItems = [
          { id: 'overview', label: 'Executive Command', icon: <LayoutDashboard style={{ width: 16, height: 16 }} />, path: '/hospital' },
          { id: 'patients', label: 'Master Census', icon: <Users style={{ width: 16, height: 16 }} />, path: '/hospital/patients' },
          { id: 'doctors', label: 'Physicians Directory', icon: <Building2 style={{ width: 16, height: 16 }} />, path: '/hospital/doctors' },
          { id: 'nurses', label: 'Nursing Staff', icon: <Users style={{ width: 16, height: 16 }} />, path: '/hospital/nurses' },
          { id: 'appointments', label: 'Hospital Master Schedule', icon: <Calendar style={{ width: 16, height: 16 }} />, path: '/hospital/appointments' },
          { id: 'laboratories', label: 'Diagnostic Units', icon: <FlaskConical style={{ width: 16, height: 16 }} />, path: '/hospital/laboratories' },
          { id: 'insurance', label: 'Payer Relationships', icon: <ShieldCheck style={{ width: 16, height: 16 }} />, path: '/hospital/insurance' },
          { id: 'analytics', label: 'Network BI', icon: <BarChart3 style={{ width: 16, height: 16 }} />, path: '/hospital/analytics' },
        ];
        break;
    }

    return {
      workspace: workspaceItems,
      intelligence: [
        { id: 'ai', label: 'Ask MEDION', icon: <Sparkles style={{ width: 16, height: 16, color: 'var(--color-primary-light)' }} />, path: `${prefix}/ai` },
      ],
      system: [
        { id: 'notifications', label: 'Notifications', icon: <Bell style={{ width: 16, height: 16 }} />, path: `${prefix}/notifications` },
        { id: 'profile', label: 'Profile', icon: <User style={{ width: 16, height: 16 }} />, path: `${prefix}/profile` },
        { id: 'settings', label: 'Settings', icon: <Settings style={{ width: 16, height: 16 }} />, path: `${prefix}/settings` },
      ],
    };
  };

  const sections = getNavSections(role);

  const handleRoleSelect = (newRole: UserRole) => {
    onRoleChange(newRole);
    const targetPath = newRole === 'lab' ? '/laboratory' : `/${newRole}`;
    navigate(targetPath);
  };

  const renderNavGroup = (title: string, items: Array<{ id: string; label: string; icon: React.ReactNode; path: string }>) => (
    <div style={{ marginBottom: '1.25rem' }}>
      {!collapsed && (
        <div style={{ fontSize: '0.66rem', fontWeight: 600, color: 'var(--text-muted)', padding: '0 0.75rem 0.35rem', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
          {title}
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
        {items.map((item) => {
          const isActive = location.pathname === item.path || (item.id === 'overview' && (location.pathname === item.path || location.pathname === `${item.path}/`));
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className="btn-ui"
              style={{
                justifyContent: collapsed ? 'center' : 'flex-start',
                width: '100%',
                padding: collapsed ? '0.55rem' : '0.48rem 0.85rem',
                fontSize: '0.8rem',
                background: isActive ? 'rgba(110, 231, 183, 0.08)' : 'transparent',
                color: isActive ? 'var(--color-primary-light)' : 'var(--text-secondary)',
                fontWeight: isActive ? 600 : 400,
                borderLeft: isActive && !collapsed ? '3px solid var(--color-primary-light)' : '3px solid transparent',
                borderRadius: collapsed ? 8 : '0 8px 8px 0',
                transition: 'all 0.15s ease',
              }}
              title={item.label}
            >
              {item.icon}
              {!collapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <aside className={`sidebar-container ${collapsed ? 'collapsed' : ''}`}>
      {/* Brand Header */}
      <div style={{ height: 60, padding: '0 1.25rem', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {!collapsed ? (
          <div>
            <span style={{ fontWeight: 700, fontSize: '1.12rem', color: 'var(--text-primary)', letterSpacing: '-0.4px' }}>
              MEDION <span style={{ color: 'var(--color-primary-light)', fontWeight: 600 }}>HEALTH</span>
            </span>
          </div>
        ) : (
          <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--color-primary-light)' }}>MH</div>
        )}
        <button className="btn-ui btn-ghost-ui" onClick={onToggleCollapse} style={{ padding: '0.25rem' }}>
          {collapsed ? <ChevronRight style={{ width: 16, height: 16 }} /> : <ChevronLeft style={{ width: 16, height: 16 }} />}
        </button>
      </div>

      {/* Grouped Sidebar Navigation */}
      <nav style={{ padding: '1rem 0.5rem', flex: 1, overflowY: 'auto' }}>
        {renderNavGroup('Workspace', sections.workspace)}
        {renderNavGroup('Intelligence', sections.intelligence)}
        {renderNavGroup('System', sections.system)}
      </nav>

      {/* Demo Role Switcher Footer */}
      <div style={{ padding: '0.85rem', borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-card)' }}>
        {!collapsed && (
          <div style={{ marginBottom: '0.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.66rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.25rem' }}>
              Active Clinical Workspace
            </label>
            <select
              value={role}
              onChange={(e) => handleRoleSelect(e.target.value as UserRole)}
              className="select-field"
              style={{ width: '100%', fontSize: '0.78rem', padding: '0.35rem 0.6rem' }}
            >
              <option value="doctor">Doctor (Cardiology)</option>
              <option value="nurse">Nurse (Inpatient Care)</option>
              <option value="receptionist">Receptionist (Front Desk)</option>
              <option value="patient">Patient (Health Portal)</option>
              <option value="lab">Laboratory (Diagnostics)</option>
              <option value="insurance">Insurance (Payer Adjudication)</option>
              <option value="hospital">Hospital Command (Admin)</option>
            </select>
          </div>
        )}

        <button
          onClick={onLogout}
          className="btn-ui btn-ghost-ui"
          style={{ width: '100%', justifyContent: collapsed ? 'center' : 'flex-start', color: 'var(--status-danger)', fontSize: '0.78rem', padding: '0.4rem 0.6rem' }}
        >
          <LogOut style={{ width: 14, height: 14 }} />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
};
