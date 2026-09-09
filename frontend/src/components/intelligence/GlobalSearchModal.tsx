import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  User,
  Calendar,
  FlaskConical,
  ShieldCheck,
  LayoutDashboard,
  Sparkles,
  ArrowRight,
  X,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { useSharedPatients, useSharedAppointments, useSharedPolicies } from '../../services/dataService';
import { MOCK_LAB_REPORT } from '../../data/mockDatasets';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPatient?: (patientId: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose, onSelectPatient }) => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const patients = useSharedPatients();
  const appointments = useSharedAppointments();
  const policies = useSharedPolicies();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
    }
  }, [isOpen]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return {
        shortcuts: [
          { label: 'Ask MEDION Intelligence', path: '/doctor/ai', icon: <Sparkles style={{ width: 14, height: 14, color: 'var(--mint-vibrant)' }} /> },
          { label: 'Patient Directory', path: '/doctor/patients', icon: <User style={{ width: 14, height: 14, color: 'var(--forest-brand)' }} /> },
          { label: 'Appointment Schedules', path: '/doctor/appointments', icon: <Calendar style={{ width: 14, height: 14, color: 'var(--forest-brand)' }} /> },
          { label: 'Laboratory Diagnostics', path: '/laboratory', icon: <FlaskConical style={{ width: 14, height: 14, color: 'var(--forest-brand)' }} /> },
          { label: 'Insurance & Claims', path: '/insurance', icon: <ShieldCheck style={{ width: 14, height: 14, color: 'var(--forest-brand)' }} /> },
          { label: 'MEDION Command Admin', path: '/hospital', icon: <LayoutDashboard style={{ width: 14, height: 14, color: 'var(--forest-brand)' }} /> },
        ],
        patients: patients.slice(0, 4),
        appointments: appointments.slice(0, 3),
        labs: [MOCK_LAB_REPORT],
        insurance: policies.slice(0, 2)
      };
    }

    return {
      shortcuts: [
        { label: 'Open Ask MEDION with query', path: `/doctor/ai?q=${encodeURIComponent(q)}`, icon: <Sparkles style={{ width: 14, height: 14, color: 'var(--mint-vibrant)' }} /> }
      ],
      patients: patients.filter(p =>
        p.patient_id.toLowerCase().includes(q) ||
        p.first_name.toLowerCase().includes(q) ||
        (p.last_name && p.last_name.toLowerCase().includes(q)) ||
        (p.phone && p.phone.includes(q))
      ),
      appointments: appointments.filter(a =>
        a.appointment_id.toLowerCase().includes(q) ||
        a.doctor_id.toLowerCase().includes(q) ||
        a.patient_id.toLowerCase().includes(q) ||
        (a.reason && a.reason.toLowerCase().includes(q))
      ),
      labs: [MOCK_LAB_REPORT].filter(l =>
        l.report_id.toLowerCase().includes(q) ||
        l.test_type.toLowerCase().includes(q) ||
        l.patient_id.toLowerCase().includes(q)
      ),
      insurance: policies.filter((pol: any) =>
        pol.policy_id.toLowerCase().includes(q) ||
        pol.patient_id.toLowerCase().includes(q) ||
        (pol.provider_name && pol.provider_name.toLowerCase().includes(q))
      )
    };
  }, [query, patients, appointments, policies]);

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-surface"
        style={{ maxWidth: 660, maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Header */}
        <div style={{
          padding: '1.15rem 1.5rem',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.85rem',
          background: 'var(--bg-surface)'
        }}>
          <Search style={{ width: 18, height: 18, color: 'var(--forest-brand)' }} />
          <input
            type="text"
            placeholder="Search patients, appointments, lab reports, insurance, or jump to workspace..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              fontSize: '1rem',
              color: 'var(--text-primary)',
              background: 'transparent',
              fontFamily: 'inherit'
            }}
          />
          <button
            onClick={onClose}
            className="btn-icon-ui"
            title="Close"
          >
            <X style={{ width: 16, height: 16 }} />
          </button>
        </div>

        {/* Results Container */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.5rem' }}>
          {/* Shortcuts / Quick Actions */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div className="text-meta" style={{ marginBottom: '0.5rem' }}>Workspaces & Actions</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.5rem' }}>
              {results.shortcuts.map((sc, i) => (
                <div
                  key={i}
                  onClick={() => { navigate(sc.path); onClose(); }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.65rem 0.85rem',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-surface-secondary)',
                    border: '1px solid var(--border-subtle)',
                    cursor: 'pointer',
                    fontSize: '0.82rem',
                    color: 'var(--text-primary)',
                    fontWeight: 500,
                    transition: 'all 0.12s ease'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--forest-brand)')}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
                >
                  {sc.icon}
                  <span style={{ flex: 1 }}>{sc.label}</span>
                  <ArrowRight style={{ width: 12, height: 12, color: 'var(--text-muted)' }} />
                </div>
              ))}
            </div>
          </div>

          {/* Patients Category */}
          {results.patients.length > 0 && (
            <div style={{ marginBottom: '1.25rem' }}>
              <div className="text-meta" style={{ marginBottom: '0.5rem' }}>Patients ({results.patients.length})</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {results.patients.map((p) => (
                  <div
                    key={p.patient_id}
                    onClick={() => {
                      if (onSelectPatient) onSelectPatient(p.patient_id);
                      navigate(`/doctor/patients`);
                      onClose();
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.65rem 0.85rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-subtle)',
                      background: 'var(--bg-surface)',
                      cursor: 'pointer',
                      transition: 'background 0.12s ease'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-surface-hover)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--bg-surface)')}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <div style={{
                        width: 30,
                        height: 30,
                        borderRadius: 'var(--radius-sm)',
                        background: 'var(--forest-tint)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <User style={{ width: 15, height: 15, color: 'var(--forest-brand)' }} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                          {p.first_name} {p.last_name || ''}
                        </div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                          {p.patient_id} • DOB: {p.dob || p.date_of_birth || 'Not provided'} • {p.gender || 'Not specified'}
                        </div>
                      </div>
                    </div>
                    <span className="badge-ui badge-brand" style={{ fontSize: '0.7rem' }}>View Record</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Appointments Category */}
          {results.appointments.length > 0 && (
            <div style={{ marginBottom: '1.25rem' }}>
              <div className="text-meta" style={{ marginBottom: '0.5rem' }}>Appointments ({results.appointments.length})</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {results.appointments.map((a) => (
                  <div
                    key={a.appointment_id}
                    onClick={() => { navigate('/doctor/appointments'); onClose(); }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.65rem 0.85rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-subtle)',
                      background: 'var(--bg-surface)',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-surface-hover)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--bg-surface)')}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <Calendar style={{ width: 16, height: 16, color: 'var(--forest-brand)' }} />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.86rem', color: 'var(--text-primary)' }}>
                          {a.appointment_id} — {a.reason || 'Clinical Consultation'}
                        </div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                          {a.date} ({a.time_slot}) • Patient: {a.patient_id} • Doctor: {a.doctor_id}
                        </div>
                      </div>
                    </div>
                    <span className="badge-ui badge-green" style={{ fontSize: '0.7rem' }}>{a.status}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Laboratory Reports Category */}
          {results.labs.length > 0 && (
            <div style={{ marginBottom: '1rem' }}>
              <div className="text-meta" style={{ marginBottom: '0.5rem' }}>Laboratory Tests</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {results.labs.map((l) => (
                  <div
                    key={l.report_id}
                    onClick={() => { navigate('/laboratory'); onClose(); }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.65rem 0.85rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-subtle)',
                      background: 'var(--bg-surface)',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-surface-hover)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--bg-surface)')}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <FlaskConical style={{ width: 16, height: 16, color: 'var(--forest-brand)' }} />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.86rem', color: 'var(--text-primary)' }}>
                          {l.test_type} ({l.report_id})
                        </div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                          Patient: {l.patient_id} • Date: {l.test_date}
                        </div>
                      </div>
                    </div>
                    <span className="badge-ui badge-green" style={{ fontSize: '0.7rem' }}>VERIFIED</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation Hints */}
        <div style={{
          padding: '0.75rem 1.5rem',
          borderTop: '1px solid var(--border-subtle)',
          background: 'var(--bg-surface-secondary)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.75rem',
          color: 'var(--text-muted)'
        }}>
          <div>
            Press <span className="kbd-shortcut">ESC</span> to dismiss
          </div>
          <div>
            Global Healthcare Search
          </div>
        </div>
      </div>
    </div>
  );
};
