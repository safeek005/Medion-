import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Code,
  User as UserIcon,
  Search,
  Building,
  Bell,
  Sparkles,
  ChevronDown,
  Check,
  ShieldCheck,
  HelpCircle,
  Activity,
  Layers,
} from 'lucide-react';
import { UserRole } from '../../types';
import { useAuth, ENTERPRISE_FACILITIES } from '../../services/authService';

interface HeaderProps {
  role: UserRole;
  onOpenTraceDrawer: () => void;
  onOpenGlobalSearch?: () => void;
  onOpenNotifications?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  role,
  onOpenTraceDrawer,
  onOpenGlobalSearch,
  onOpenNotifications,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, updateFacility } = useAuth();
  const [isFacilityMenuOpen, setIsFacilityMenuOpen] = useState(false);
  const facilityRef = useRef<HTMLDivElement>(null);

  // Close facility menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (facilityRef.current && !facilityRef.current.contains(e.target as Node)) {
        setIsFacilityMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeFacilityName = user?.facility || 'Coimbatore Medical Center (Main Campus)';

  const getBreadcrumbs = () => {
    const parts = location.pathname.split('/').filter(Boolean);
    if (parts.length <= 1) {
      return [{ label: 'MEDION Health', path: `/${role}` }, { label: 'Overview', path: `/${role}` }];
    }
    const crumbs = [{ label: 'MEDION Health', path: `/${role}` }];
    for (let i = 1; i < parts.length; i++) {
      const seg = parts[i];
      const title = seg.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
      crumbs.push({
        label: title,
        path: '/' + parts.slice(0, i + 1).join('/'),
      });
    }
    return crumbs;
  };

  const getRoleBadge = (r: UserRole) => {
    switch (r) {
      case 'doctor': return { label: 'ATTENDING PHYSICIAN', color: 'var(--teal-intelligent)' };
      case 'nurse': return { label: 'CHARGE NURSE', color: '#0284c7' };
      case 'patient': return { label: 'PATIENT PORTAL', color: '#059669' };
      case 'lab': return { label: 'CHIEF PATHOLOGIST', color: '#d97706' };
      case 'insurance': return { label: 'CLAIMS AUDITOR', color: '#7c3aed' };
      case 'hospital': return { label: 'HOSPITAL COMMAND', color: '#dc2626' };
      case 'receptionist': return { label: 'PATIENT INTAKE', color: '#0891b2' };
      default: return { label: 'CLINICAL USER', color: 'var(--text-muted)' };
    }
  };

  const roleMeta = getRoleBadge(role);
  const breadcrumbs = getBreadcrumbs();

  return (
    <header
      className="top-header"
      style={{
        height: '60px',
        padding: '0 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid var(--border-subtle)',
        background: '#ffffff',
        position: 'sticky',
        top: 0,
        zIndex: 25,
      }}
    >
      {/* Left: Organization Context & Facility Switcher + Breadcrumbs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', minWidth: 0 }}>
        {/* Enterprise Facility Switcher */}
        <div className="facility-dropdown" ref={facilityRef}>
          <button
            onClick={() => setIsFacilityMenuOpen(!isFacilityMenuOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.28rem 0.65rem',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-surface-secondary)',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.78rem',
              fontWeight: 600,
              color: 'var(--text-primary)',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            title="Switch healthcare facility context"
          >
            <Building style={{ width: 14, height: 14, color: 'var(--teal-intelligent)' }} />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: 1.15 }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {activeFacilityName.split('(')[0].trim() || 'Coimbatore Medical Center'}
              </span>
              <span style={{ fontSize: '0.62rem', color: 'var(--teal-intelligent)', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                Main Campus
              </span>
            </div>
            <ChevronDown style={{ width: 12, height: 12, color: 'var(--text-muted)' }} />
          </button>

          {isFacilityMenuOpen && (
            <div className="facility-menu">
              <div
                style={{
                  padding: '0.35rem 0.6rem 0.5rem',
                  fontSize: '0.66rem',
                  fontWeight: 700,
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  borderBottom: '1px solid var(--border-subtle)',
                  marginBottom: '0.35rem',
                }}
              >
                Healthcare Facilities & Campuses
              </div>
              {ENTERPRISE_FACILITIES.map((fac) => {
                const isSelected = activeFacilityName.includes(fac.name) || activeFacilityName.includes(fac.id);
                return (
                  <div
                    key={fac.id}
                    onClick={() => {
                      updateFacility(`${fac.name} (${fac.campus})`);
                      setIsFacilityMenuOpen(false);
                    }}
                    style={{
                      padding: '0.45rem 0.65rem',
                      borderRadius: 'var(--radius-xs)',
                      background: isSelected ? 'var(--teal-subtle)' : 'transparent',
                      color: isSelected ? 'var(--teal-intelligent)' : 'var(--text-primary)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '0.8rem',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: isSelected ? 600 : 500 }}>{fac.name}</div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                        {fac.campus} • {fac.type}
                      </div>
                    </div>
                    {isSelected && <Check style={{ width: 14, height: 14, color: 'var(--teal-intelligent)' }} />}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Divider */}
        <div style={{ width: 1, height: 16, background: 'var(--border-subtle)' }} />

        {/* Dynamic Breadcrumbs */}
        <nav aria-label="Breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem' }}>
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={idx}>
              {idx > 0 && <span style={{ color: 'var(--text-tertiary)', fontSize: '0.7rem' }}>/</span>}
              <span
                style={{
                  color: idx === breadcrumbs.length - 1 ? 'var(--text-primary)' : 'var(--text-muted)',
                  fontWeight: idx === breadcrumbs.length - 1 ? 600 : 400,
                  whiteSpace: 'nowrap',
                }}
              >
                {crumb.label}
              </span>
            </React.Fragment>
          ))}
        </nav>
      </div>

      {/* Right: Global Search, AI Intelligence Status, Architecture Telemetry, Notifications, Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
        {/* Global Spotlight Search Trigger (Cmd+K / Ctrl+K) */}
        <button
          onClick={onOpenGlobalSearch}
          className="btn-ui"
          style={{
            background: 'var(--bg-surface-secondary)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '0.35rem 0.75rem',
            fontSize: '0.78rem',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
          title="Search patients, MRNs, consultations, labs, staff (Ctrl+K or Cmd+K)"
        >
          <Search style={{ width: 14, height: 14, color: 'var(--teal-intelligent)' }} />
          <span style={{ color: 'var(--text-secondary)' }}>Search MEDION...</span>
          <kbd
            style={{
              fontSize: '0.64rem',
              background: '#ffffff',
              border: '1px solid var(--border-subtle)',
              borderRadius: 3,
              padding: '0.1rem 0.35rem',
              color: 'var(--text-muted)',
              fontFamily: 'var(--font-mono)',
            }}
          >
            ⌘K
          </kbd>
        </button>

        {/* AI System Status Pill */}
        {/* AI Health indicator - staff/admin context */}
        {role !== 'patient' && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.28rem 0.65rem',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--teal-subtle)',
              border: '1px solid var(--teal-border)',
              fontSize: '0.7rem',
              fontWeight: 600,
              color: 'var(--teal-intelligent)',
            }}
            title="MEDION Healthcare Intelligence Online"
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: 'var(--teal-intelligent)',
                boxShadow: '0 0 6px var(--teal-vibrant)',
              }}
            />
            <span>AI Active</span>
          </div>
        )}

        {/* Architecture & Telemetry Drawer Trigger - clinical and administrative users only */}
        {role !== 'patient' && (
          <button
            className="btn-ui btn-ghost-ui"
            onClick={onOpenTraceDrawer}
            style={{
              padding: '0.35rem 0.6rem',
              fontSize: '0.74rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              color: 'var(--text-secondary)',
            }}
            title="Inspect MEDION Architecture Execution Trace"
          >
            <Code style={{ width: 14, height: 14, color: 'var(--teal-intelligent)' }} />
            <span>Telemetry</span>
          </button>
        )}

        {/* Notifications Icon Button */}
        <button
          className="btn-ui btn-ghost-ui"
          onClick={() => {
            if (onOpenNotifications) {
              onOpenNotifications();
            } else {
              navigate(`/${role}/notifications`);
            }
          }}
          style={{ padding: '0.4rem', position: 'relative', color: 'var(--text-secondary)' }}
          title="Notifications & Alerts"
        >
          <Bell style={{ width: 16, height: 16 }} />
          <span
            style={{
              position: 'absolute',
              top: 4,
              right: 4,
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: 'var(--danger-red)',
            }}
          />
        </button>

        {/* User Identity Pill */}
        <div
          onClick={() => navigate(`/${role}/profile`)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'var(--bg-surface-secondary)',
            padding: '0.25rem 0.65rem',
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--border-subtle)',
            cursor: 'pointer',
          }}
          title="User Profile & Account"
        >
          <div
            style={{
              width: 22,
              height: 22,
              borderRadius: '50%',
              background: 'var(--teal-subtle)',
              border: '1px solid var(--teal-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.7rem',
              color: 'var(--teal-intelligent)',
            }}
          >
            {(user?.name || (role === 'patient' ? 'Kavya' : 'Dr. Rajesh Mehta')).charAt(0)}
          </div>
          <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            {user?.name || (role === 'patient' ? 'Kavya' : 'Dr. Rajesh Mehta')} ▾
          </span>
        </div>
      </div>
    </header>
  );
};
