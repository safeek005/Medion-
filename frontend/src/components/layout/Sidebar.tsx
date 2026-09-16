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
  ShieldAlert,
  Clock,
  HeartPulse,
  Activity,
  Layers,
  MessageSquare,
  FileSpreadsheet,
  Pill,
} from 'lucide-react';
import { UserRole } from '../../types';
import { useAuth } from '../../services/authService';
import { Badge } from '../ui/Badge';

interface SidebarProps {
  role: UserRole;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onLogout: () => void;
  onRoleChange?: (role: UserRole) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  role,
  collapsed,
  onToggleCollapse,
  onLogout,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  // Active role is authenticated role or path role
  const effectiveRole = user?.role || role;
  const prefix = effectiveRole === 'lab' ? '/laboratory' : `/${effectiveRole}`;

  // Role-adapted Enterprise Information Architecture
  const getNavSections = (r: UserRole) => {
    switch (r) {
      case 'doctor':
        return {
          main: [
            { id: 'overview', label: 'Overview', icon: <LayoutDashboard style={{ width: 16, height: 16 }} />, path: '/doctor' },
            { id: 'patients', label: 'Patients', icon: <Users style={{ width: 16, height: 16 }} />, path: '/doctor/patients' },
            { id: 'appointments', label: 'Appointments', icon: <Calendar style={{ width: 16, height: 16 }} />, path: '/doctor/appointments' },
            { id: 'prescriptions', label: 'Prescriptions', icon: <FileText style={{ width: 16, height: 16 }} />, path: '/doctor/prescriptions' },
            { id: 'lab-reports', label: 'Lab Reports', icon: <FlaskConical style={{ width: 16, height: 16 }} />, path: '/doctor/lab-reports' },
          ],
          intelligence: [
            { id: 'ai', label: 'Ask MEDION', icon: <Sparkles style={{ width: 16, height: 16 }} />, path: '/doctor/ai' },
            { id: 'agent-activity', label: 'Agent Activity', icon: <Cpu style={{ width: 16, height: 16 }} />, path: '/doctor/agent-activity' },
          ],
          operations: [],
          administration: [
            { id: 'notifications', label: 'Alerts & Messages', icon: <Bell style={{ width: 16, height: 16 }} />, path: '/doctor/notifications' },
            { id: 'audit', label: 'Audit & Security', icon: <ShieldCheck style={{ width: 16, height: 16 }} />, path: '/doctor/audit' },
            { id: 'settings', label: 'Settings', icon: <Settings style={{ width: 16, height: 16 }} />, path: '/doctor/settings' },
          ],
        };

      case 'nurse':
        return {
          main: [
            { id: 'overview', label: 'Ward Overview', icon: <LayoutDashboard style={{ width: 16, height: 16 }} />, path: '/nurse' },
            { id: 'patients', label: 'Assigned Patients', icon: <Users style={{ width: 16, height: 16 }} />, path: '/nurse/patients' },
            { id: 'prescriptions', label: 'Medication Tasks (eMAR)', icon: <FileText style={{ width: 16, height: 16 }} />, path: '/nurse/prescriptions' },
            { id: 'appointments', label: 'Care Schedule', icon: <Calendar style={{ width: 16, height: 16 }} />, path: '/nurse/appointments' },
            { id: 'lab-reports', label: 'Specimens & Labs', icon: <FlaskConical style={{ width: 16, height: 16 }} />, path: '/nurse/lab-reports' },
          ],
          intelligence: [
            { id: 'ai', label: 'Ask MEDION', icon: <Sparkles style={{ width: 16, height: 16 }} />, path: '/nurse/ai' },
            { id: 'agent-activity', label: 'Agent Activity', icon: <Cpu style={{ width: 16, height: 16 }} />, path: '/nurse/agent-activity' },
          ],
          operations: [],
          administration: [
            { id: 'notifications', label: 'Alerts', icon: <Bell style={{ width: 16, height: 16 }} />, path: '/nurse/notifications' },
            { id: 'audit', label: 'Audit & Security', icon: '/nurse/audit', path: '/nurse/audit' },
            { id: 'settings', label: 'Settings', icon: <Settings style={{ width: 16, height: 16 }} />, path: '/nurse/settings' },
          ],
        };

      case 'patient':
        return {
          main: [
            { id: 'overview', label: 'Health Overview', icon: <LayoutDashboard style={{ width: 16, height: 16 }} />, path: '/patient' },
            { id: 'appointments', label: 'Appointments', icon: <Calendar style={{ width: 16, height: 16 }} />, path: '/patient/appointments' },
            { id: 'records', label: 'Medical Records', icon: <FileText style={{ width: 16, height: 16 }} />, path: '/patient/records' },
            { id: 'lab-reports', label: 'Lab Results', icon: <FlaskConical style={{ width: 16, height: 16 }} />, path: '/patient/lab-reports' },
            { id: 'prescriptions', label: 'Prescriptions', icon: <Pill style={{ width: 16, height: 16 }} />, path: '/patient/prescriptions' },
            { id: 'insurance', label: 'Insurance', icon: <ShieldCheck style={{ width: 16, height: 16 }} />, path: '/patient/insurance' },
          ],
          intelligence: [
            { id: 'ai', label: 'Ask MEDION', icon: <Sparkles style={{ width: 16, height: 16 }} />, path: '/patient/ai' },
          ],
          operations: [],
          administration: [
            { id: 'notifications', label: 'Notifications', icon: <Bell style={{ width: 16, height: 16 }} />, path: '/patient/notifications' },
            { id: 'profile', label: 'Profile', icon: <User style={{ width: 16, height: 16 }} />, path: '/patient/profile' },
            { id: 'settings', label: 'Settings', icon: <Settings style={{ width: 16, height: 16 }} />, path: '/patient/settings' },
          ],
        };

      case 'hospital':
        return {
          main: [
            { id: 'overview', label: 'Hospital Overview', icon: <LayoutDashboard style={{ width: 16, height: 16 }} />, path: '/hospital' },
            { id: 'patients', label: 'Patients Census', icon: <Users style={{ width: 16, height: 16 }} />, path: '/hospital/patients' },
            { id: 'appointments', label: 'Appointments', icon: <Calendar style={{ width: 16, height: 16 }} />, path: '/hospital/appointments' },
          ],
          operations: [
            { id: 'doctors', label: 'Medical Staff', icon: <Building2 style={{ width: 16, height: 16 }} />, path: '/hospital/doctors' },
            { id: 'nurses', label: 'Nursing Staff', icon: <Users style={{ width: 16, height: 16 }} />, path: '/hospital/nurses' },
            { id: 'laboratories', label: 'Laboratories', icon: <FlaskConical style={{ width: 16, height: 16 }} />, path: '/hospital/laboratories' },
            { id: 'insurance', label: 'Financial & Claims', icon: <ShieldCheck style={{ width: 16, height: 16 }} />, path: '/hospital/insurance' },
            { id: 'analytics', label: 'Throughput Analytics', icon: <BarChart3 style={{ width: 16, height: 16 }} />, path: '/hospital/analytics' },
          ],
          intelligence: [
            { id: 'ai', label: 'Ask MEDION', icon: <Sparkles style={{ width: 16, height: 16 }} />, path: '/hospital/ai' },
            { id: 'agent-activity', label: 'Agent Activity', icon: <Cpu style={{ width: 16, height: 16 }} />, path: '/hospital/agent-activity' },
            { id: 'architecture', label: 'Execution Architecture', icon: <Layers style={{ width: 16, height: 16 }} />, path: '/hospital/architecture' },
          ],
          administration: [
            { id: 'audit', label: 'Audit & Security', icon: <ShieldCheck style={{ width: 16, height: 16 }} />, path: '/hospital/audit' },
            { id: 'notifications', label: 'System Alerts', icon: <Bell style={{ width: 16, height: 16 }} />, path: '/hospital/notifications' },
            { id: 'settings', label: 'Settings', icon: <Settings style={{ width: 16, height: 16 }} />, path: '/hospital/settings' },
          ],
        };

      case 'lab':
        return {
          main: [
            { id: 'overview', label: 'Lab Queue', icon: <LayoutDashboard style={{ width: 16, height: 16 }} />, path: '/laboratory' },
            { id: 'patients', label: 'Specimen Registry', icon: <Users style={{ width: 16, height: 16 }} />, path: '/laboratory/patients' },
            { id: 'reports', label: 'Diagnostic Panels', icon: <FlaskConical style={{ width: 16, height: 16 }} />, path: '/laboratory/reports' },
          ],
          intelligence: [
            { id: 'ai', label: 'Ask MEDION', icon: <Sparkles style={{ width: 16, height: 16 }} />, path: '/laboratory/ai' },
            { id: 'report-processing', label: 'AI Extraction Pipeline', icon: <Cpu style={{ width: 16, height: 16 }} />, path: '/laboratory/report-processing' },
            { id: 'agent-activity', label: 'Agent Activity', icon: <Cpu style={{ width: 16, height: 16 }} />, path: '/laboratory/agent-activity' },
          ],
          operations: [],
          administration: [
            { id: 'audit', label: 'Audit & Security', icon: <ShieldCheck style={{ width: 16, height: 16 }} />, path: '/laboratory/audit' },
            { id: 'notifications', label: 'Lab Alerts', icon: <Bell style={{ width: 16, height: 16 }} />, path: '/laboratory/notifications' },
            { id: 'settings', label: 'Settings', icon: <Settings style={{ width: 16, height: 16 }} />, path: '/laboratory/settings' },
          ],
        };

      case 'insurance':
        return {
          main: [
            { id: 'overview', label: 'Claims Desk', icon: <LayoutDashboard style={{ width: 16, height: 16 }} />, path: '/insurance' },
            { id: 'policies', label: 'Benefit Plans', icon: <FileText style={{ width: 16, height: 16 }} />, path: '/insurance/policies' },
            { id: 'claims', label: 'Claims Adjudication', icon: <ShieldCheck style={{ width: 16, height: 16 }} />, path: '/insurance/claims' },
            { id: 'patients', label: 'Enrolled Members', icon: <Users style={{ width: 16, height: 16 }} />, path: '/insurance/patients' },
          ],
          intelligence: [
            { id: 'ai', label: 'Ask MEDION', icon: <Sparkles style={{ width: 16, height: 16 }} />, path: '/insurance/ai' },
            { id: 'agent-activity', label: 'Agent Activity', icon: <Cpu style={{ width: 16, height: 16 }} />, path: '/insurance/agent-activity' },
          ],
          operations: [],
          administration: [
            { id: 'audit', label: 'Audit & Security', icon: <ShieldCheck style={{ width: 16, height: 16 }} />, path: '/insurance/audit' },
            { id: 'notifications', label: 'Alerts', icon: <Bell style={{ width: 16, height: 16 }} />, path: '/insurance/notifications' },
            { id: 'settings', label: 'Settings', icon: <Settings style={{ width: 16, height: 16 }} />, path: '/insurance/settings' },
          ],
        };

      case 'receptionist':
      default:
        return {
          main: [
            { id: 'overview', label: 'Front Desk Queue', icon: <LayoutDashboard style={{ width: 16, height: 16 }} />, path: '/receptionist' },
            { id: 'intake', label: 'Patient Intake', icon: <UserPlus style={{ width: 16, height: 16 }} />, path: '/receptionist/intake' },
            { id: 'appointments', label: 'Scheduling', icon: <Calendar style={{ width: 16, height: 16 }} />, path: '/receptionist/appointments' },
            { id: 'patients', label: 'Patient Index', icon: <Users style={{ width: 16, height: 16 }} />, path: '/receptionist/patients' },
          ],
          intelligence: [
            { id: 'ai', label: 'Ask MEDION', icon: <Sparkles style={{ width: 16, height: 16 }} />, path: '/receptionist/ai' },
          ],
          operations: [],
          administration: [
            { id: 'notifications', label: 'Alerts', icon: <Bell style={{ width: 16, height: 16 }} />, path: '/receptionist/notifications' },
            { id: 'settings', label: 'Settings', icon: <Settings style={{ width: 16, height: 16 }} />, path: '/receptionist/settings' },
          ],
        };
    }
  };

  const sections = getNavSections(effectiveRole);

  const renderNavGroup = (title: string, items: Array<{ id: string; label: string; icon: React.ReactNode; path: string }>) => {
    if (!items || items.length === 0) return null;
    return (
      <div style={{ marginBottom: '1.2rem' }}>
        {!collapsed && (
          <div
            style={{
              fontSize: '0.66rem',
              fontWeight: 700,
              color: 'var(--text-muted)',
              padding: '0 0.75rem 0.35rem',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            {title}
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.12rem' }}>
          {items.map((item) => {
            const isActive =
              location.pathname === item.path ||
              (item.id === 'overview' && (location.pathname === item.path || location.pathname === `${item.path}/`));

            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className="btn-ui"
                style={{
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  width: '100%',
                  padding: collapsed ? '0.55rem' : '0.45rem 0.75rem',
                  fontSize: '0.82rem',
                  background: isActive ? 'var(--teal-subtle)' : 'transparent',
                  color: isActive ? 'var(--teal-intelligent)' : 'var(--text-secondary)',
                  fontWeight: isActive ? 600 : 400,
                  borderLeft: isActive && !collapsed ? '3px solid var(--teal-intelligent)' : '3px solid transparent',
                  borderRadius: collapsed ? 8 : '0 6px 6px 0',
                  transition: 'all 0.15s ease',
                }}
                title={item.label}
              >
                <span style={{ color: isActive ? 'var(--teal-intelligent)' : 'var(--text-muted)' }}>
                  {item.icon}
                </span>
                {!collapsed && <span style={{ marginLeft: '0.65rem' }}>{item.label}</span>}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const getUserDisplayName = () => {
    if (user?.name) return user.name;
    switch (effectiveRole) {
      case 'patient': return 'Kavya';
      case 'doctor': return 'Dr. Rajesh Mehta';
      case 'nurse': return 'Nurse Reka';
      case 'lab': return 'Dr. Vikram Patel';
      case 'insurance': return 'Kavita Iyer';
      case 'hospital': return 'Admin Officer';
      default: return 'Kavya';
    }
  };

  const getUserInitials = () => {
    const name = getUserDisplayName();
    const parts = name.replace('Dr. ', '').replace('Nurse ', '').split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <aside className={`sidebar-container ${collapsed ? 'collapsed' : ''}`} style={{ borderRight: '1px solid var(--border-subtle)', background: 'var(--bg-surface)' }}>
      {/* Brand Header */}
      <div
        style={{
          height: 68,
          padding: '0 1.25rem',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {!collapsed ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 7,
                background: 'linear-gradient(135deg, var(--teal-intelligent) 0%, #0f766e 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                boxShadow: '0 2px 6px rgba(13, 148, 136, 0.3)',
              }}
            >
              <HeartPulse style={{ width: 18, height: 18 }} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.98rem', color: 'var(--text-primary)', letterSpacing: '-0.3px', lineHeight: 1.1 }}>
                MEDION <span style={{ color: 'var(--teal-intelligent)', fontWeight: 600 }}>HEALTH</span>
              </div>
              <div style={{ fontSize: '0.64rem', color: 'var(--text-secondary)', fontWeight: 600, letterSpacing: '0.1px', marginTop: '0.15rem' }}>
                Coimbatore Medical Center
              </div>
              <div style={{ fontSize: '0.58rem', color: 'var(--teal-intelligent)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Main Campus
              </div>
            </div>
          </div>
        ) : (
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 6,
              background: 'var(--teal-intelligent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              margin: '0 auto',
            }}
          >
            <HeartPulse style={{ width: 16, height: 16 }} />
          </div>
        )}
        <button
          className="btn-ui btn-ghost-ui"
          onClick={onToggleCollapse}
          style={{ padding: '0.25rem', color: 'var(--text-muted)' }}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight style={{ width: 16, height: 16 }} /> : <ChevronLeft style={{ width: 16, height: 16 }} />}
        </button>
      </div>

      {/* Role-Adapted Nav Groups */}
      <nav style={{ padding: '1rem 0.5rem', flex: 1, overflowY: 'auto' }}>
        {renderNavGroup(effectiveRole === 'patient' ? 'Overview' : 'Clinical', sections.main)}
        {sections.operations && sections.operations.length > 0 && renderNavGroup('Operations', sections.operations)}
        {renderNavGroup('Intelligence', sections.intelligence)}
        {renderNavGroup(effectiveRole === 'patient' ? 'Account' : 'Governance', sections.administration)}
      </nav>

      {/* Authenticated User Session Footprint (Clean Enterprise Shell) */}
      <div
        style={{
          padding: '0.75rem 0.85rem',
          borderTop: '1px solid var(--border-subtle)',
          background: 'var(--bg-surface-secondary)',
        }}
      >
        {!collapsed ? (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.45rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', minWidth: 0 }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: effectiveRole === 'patient' ? 'var(--emerald-subtle)' : 'var(--teal-subtle)',
                    border: `1px solid ${effectiveRole === 'patient' ? 'var(--medical-emerald)' : 'var(--teal-border)'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    color: effectiveRole === 'patient' ? 'var(--medical-emerald)' : 'var(--teal-intelligent)',
                    flexShrink: 0,
                  }}
                >
                  {getUserInitials()}
                </div>
                <div style={{ minWidth: 0, lineHeight: 1.2 }}>
                  <div
                    style={{
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      color: 'var(--text-primary)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {getUserDisplayName()}
                  </div>
                  <div
                    style={{
                      fontSize: '0.68rem',
                      color: 'var(--text-muted)',
                      textTransform: 'capitalize',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                    }}
                  >
                    <span>{effectiveRole}</span>
                    <span>•</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                      {effectiveRole === 'patient' ? 'PAT-1025' : (user as any)?.staff_id || 'DOC-101'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* User Quick Actions */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: '0.4rem',
                borderTop: '1px dashed var(--border-subtle)',
                fontSize: '0.72rem',
              }}
            >
              <button
                onClick={() => navigate(`/${effectiveRole}/profile`)}
                className="btn-ui btn-ghost-ui"
                style={{ padding: '0.2rem 0.4rem', fontSize: '0.72rem', color: 'var(--text-secondary)' }}
              >
                Profile
              </button>
              <button
                onClick={() => navigate(`/${effectiveRole}/notifications`)}
                className="btn-ui btn-ghost-ui"
                style={{ padding: '0.2rem 0.4rem', fontSize: '0.72rem', color: 'var(--text-secondary)' }}
              >
                Notifications
              </button>
              <button
                onClick={onLogout}
                className="btn-ui btn-ghost-ui"
                style={{ padding: '0.2rem 0.4rem', fontSize: '0.72rem', color: 'var(--danger-red)' }}
                title="Sign out of MEDION session"
              >
                Sign out
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={onLogout}
            className="btn-ui btn-ghost-ui"
            style={{ width: '100%', justifyContent: 'center', padding: '0.4rem', color: 'var(--danger-red)' }}
            title="Sign out of MEDION session"
          >
            <LogOut style={{ width: 15, height: 15 }} />
          </button>
        )}
      </div>
    </aside>
  );
};
