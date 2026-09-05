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
          { id: 'overview', label: 'Overview', icon: <LayoutDashboard style={{ width: 17, height: 17 }} />, path: '/doctor' },
          { id: 'patients', label: 'Patients', icon: <Users style={{ width: 17, height: 17 }} />, path: '/doctor/patients' },
          { id: 'appointments', label: 'Appointments', icon: <Calendar style={{ width: 17, height: 17 }} />, path: '/doctor/appointments' },
          { id: 'prescriptions', label: 'Prescriptions', icon: <FileText style={{ width: 17, height: 17 }} />, path: '/doctor/prescriptions' },
          { id: 'lab-reports', label: 'Lab Reports', icon: <FlaskConical style={{ width: 17, height: 17 }} />, path: '/doctor/lab-reports' },
        ];
        break;

      case 'nurse':
        workspaceItems = [
          { id: 'overview', label: 'Overview', icon: <LayoutDashboard style={{ width: 17, height: 17 }} />, path: '/nurse' },
          { id: 'patients', label: 'Patients', icon: <Users style={{ width: 17, height: 17 }} />, path: '/nurse/patients' },
          { id: 'appointments', label: 'Appointments', icon: <Calendar style={{ width: 17, height: 17 }} />, path: '/nurse/appointments' },
          { id: 'prescriptions', label: 'Prescriptions', icon: <FileText style={{ width: 17, height: 17 }} />, path: '/nurse/prescriptions' },
          { id: 'lab-reports', label: 'Lab Reports', icon: <FlaskConical style={{ width: 17, height: 17 }} />, path: '/nurse/lab-reports' },
          { id: 'insurance', label: 'Insurance', icon: <ShieldCheck style={{ width: 17, height: 17 }} />, path: '/nurse/insurance' },
        ];
        break;

      case 'patient':
        workspaceItems = [
          { id: 'overview', label: 'Overview', icon: <LayoutDashboard style={{ width: 17, height: 17 }} />, path: '/patient' },
          { id: 'appointments', label: 'Appointments', icon: <Calendar style={{ width: 17, height: 17 }} />, path: '/patient/appointments' },
          { id: 'prescriptions', label: 'Prescriptions', icon: <FileText style={{ width: 17, height: 17 }} />, path: '/patient/prescriptions' },
          { id: 'lab-reports', label: 'Lab Reports', icon: <FlaskConical style={{ width: 17, height: 17 }} />, path: '/patient/lab-reports' },
          { id: 'insurance', label: 'Insurance', icon: <ShieldCheck style={{ width: 17, height: 17 }} />, path: '/patient/insurance' },
        ];
        break;

      case 'lab':
        workspaceItems = [
          { id: 'overview', label: 'Overview', icon: <LayoutDashboard style={{ width: 17, height: 17 }} />, path: '/laboratory' },
          { id: 'patients', label: 'Patients', icon: <Users style={{ width: 17, height: 17 }} />, path: '/laboratory/patients' },
          { id: 'reports', label: 'Reports', icon: <FlaskConical style={{ width: 17, height: 17 }} />, path: '/laboratory/reports' },
          { id: 'report-processing', label: 'Report Processing', icon: <Cpu style={{ width: 17, height: 17 }} />, path: '/laboratory/report-processing' },
        ];
        break;

      case 'insurance':
        workspaceItems = [
          { id: 'overview', label: 'Overview', icon: <LayoutDashboard style={{ width: 17, height: 17 }} />, path: '/insurance' },
          { id: 'policies', label: 'Policies', icon: <FileText style={{ width: 17, height: 17 }} />, path: '/insurance/policies' },
          { id: 'claims', label: 'Claims', icon: <ShieldCheck style={{ width: 17, height: 17 }} />, path: '/insurance/claims' },
          { id: 'patients', label: 'Patients', icon: <Users style={{ width: 17, height: 17 }} />, path: '/insurance/patients' },
        ];
        break;

      case 'hospital':
        workspaceItems = [
          { id: 'overview', label: 'Overview', icon: <LayoutDashboard style={{ width: 17, height: 17 }} />, path: '/hospital' },
          { id: 'patients', label: 'Patients', icon: <Users style={{ width: 17, height: 17 }} />, path: '/hospital/patients' },
          { id: 'doctors', label: 'Doctors', icon: <Building2 style={{ width: 17, height: 17 }} />, path: '/hospital/doctors' },
          { id: 'nurses', label: 'Nurses', icon: <Users style={{ width: 17, height: 17 }} />, path: '/hospital/nurses' },
          { id: 'appointments', label: 'Appointments', icon: <Calendar style={{ width: 17, height: 17 }} />, path: '/hospital/appointments' },
          { id: 'laboratories', label: 'Laboratories', icon: <FlaskConical style={{ width: 17, height: 17 }} />, path: '/hospital/laboratories' },
          { id: 'insurance', label: 'Insurance', icon: <ShieldCheck style={{ width: 17, height: 17 }} />, path: '/hospital/insurance' },
          { id: 'analytics', label: 'Analytics', icon: <BarChart3 style={{ width: 17, height: 17 }} />, path: '/hospital/analytics' },
        ];
        break;
    }

    return {
      workspace: workspaceItems,
      intelligence: [
        { id: 'ai', label: 'Ask MEDION', icon: <Sparkles style={{ width: 17, height: 17, color: 'var(--forest-green)' }} />, path: `${prefix}/ai` },
      ],
      system: [
        { id: 'notifications', label: 'Notifications', icon: <Bell style={{ width: 17, height: 17 }} />, path: `${prefix}/notifications` },
        { id: 'profile', label: 'Profile', icon: <User style={{ width: 17, height: 17 }} />, path: `${prefix}/profile` },
        { id: 'settings', label: 'Settings', icon: <Settings style={{ width: 17, height: 17 }} />, path: `${prefix}/settings` },
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
        <div style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-muted)', padding: '0 0.75rem 0.35rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {title}
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
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
                padding: collapsed ? '0.6rem' : '0.55rem 0.85rem',
                fontSize: '0.82rem',
                background: isActive ? 'var(--forest-green-light)' : 'transparent',
                color: isActive ? 'var(--forest-green)' : 'var(--text-secondary)',
                fontWeight: isActive ? 600 : 400,
                borderLeft: isActive && !collapsed ? '3px solid var(--forest-green)' : '3px solid transparent',
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
            <span style={{ fontWeight: 700, fontSize: '1.15rem', color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
              MEDION <span style={{ color: 'var(--forest-green)' }}>AGENT</span>
            </span>
          </div>
        ) : (
          <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--forest-green)' }}>MA</div>
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
      <div style={{ padding: '0.85rem', borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-surface-secondary)' }}>
        {!collapsed && (
          <div style={{ marginBottom: '0.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.25rem' }}>
              Demo Application Role
            </label>
            <select
              value={role}
              onChange={(e) => handleRoleSelect(e.target.value as UserRole)}
              className="select-field-sm"
              style={{ width: '100%', background: 'var(--bg-surface)', border: '1px solid var(--border-strong)', fontSize: '0.78rem' }}
            >
              <option value="doctor">Doctor</option>
              <option value="nurse">Nurse</option>
              <option value="patient">Patient</option>
              <option value="lab">Laboratory</option>
              <option value="insurance">Insurance</option>
              <option value="hospital">Hospital Administration</option>
            </select>
          </div>
        )}

        <button
          onClick={onLogout}
          className="btn-ui btn-ghost-ui"
          style={{ width: '100%', justifyContent: collapsed ? 'center' : 'flex-start', color: 'var(--danger-red)', fontSize: '0.8rem', padding: '0.4rem 0.6rem' }}
        >
          <LogOut style={{ width: 15, height: 15 }} />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
};
