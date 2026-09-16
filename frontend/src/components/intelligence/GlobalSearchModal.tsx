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
  FileText,
  Building2,
  Stethoscope,
  HeartPulse,
  Pill,
  Shield,
} from 'lucide-react';
import {
  useSharedPatients,
  useSharedAppointments,
  useSharedPolicies,
  useSharedDoctors,
} from '../../services/dataService';
import { MOCK_LAB_REPORT, MOCK_PRESCRIPTIONS } from '../../data/mockDatasets';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPatient?: (patientId: string) => void;
}

type SearchCategory = 'all' | 'patients' | 'appointments' | 'labs' | 'prescriptions' | 'insurance' | 'staff';

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose, onSelectPatient }) => {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<SearchCategory>('all');
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const navigate = useNavigate();

  const patients = useSharedPatients();
  const appointments = useSharedAppointments();
  const policies = useSharedPolicies();
  const doctors = useSharedDoctors();

  const flatResults = useMemo(() => {
    const list: Array<{
      id: string;
      title: string;
      subtitle: string;
      badge: string;
      type: string;
      onSelect: () => void;
    }> = [];

    const q = query.trim().toLowerCase();

    const matchedPatients = patients.filter((p) =>
      p.patient_id.toLowerCase().includes(q) ||
      `${p.first_name} ${p.last_name}`.toLowerCase().includes(q) ||
      (p.phone && p.phone.includes(q))
    );

    const matchedAppointments = appointments.filter((a) =>
      a.appointment_id.toLowerCase().includes(q) ||
      a.patient_id.toLowerCase().includes(q) ||
      (a.reason && a.reason.toLowerCase().includes(q)) ||
      a.doctor_id.toLowerCase().includes(q)
    );

    const matchedLabs = [MOCK_LAB_REPORT].filter((l) =>
      l.report_id.toLowerCase().includes(q) ||
      l.test_type.toLowerCase().includes(q) ||
      l.patient_id.toLowerCase().includes(q)
    );

    const matchedRx = MOCK_PRESCRIPTIONS.filter((rx) =>
      rx.prescription_id.toLowerCase().includes(q) ||
      rx.patient_id.toLowerCase().includes(q) ||
      rx.medications.some((m) => m.name.toLowerCase().includes(q))
    );

    const matchedInsurance = policies.filter((pol: any) =>
      pol.policy_id.toLowerCase().includes(q) ||
      pol.patient_id?.toLowerCase().includes(q) ||
      (pol.provider_name && pol.provider_name.toLowerCase().includes(q))
    );

    const matchedStaff = doctors.filter((doc) =>
      doc.doctor_id.toLowerCase().includes(q) ||
      `${doc.first_name} ${doc.last_name}`.toLowerCase().includes(q) ||
      doc.specialty.toLowerCase().includes(q)
    );

    if (selectedCategory === 'all' || selectedCategory === 'patients') {
      matchedPatients.forEach((p) => {
        list.push({
          id: p.patient_id,
          title: `${p.first_name} ${p.last_name}`,
          subtitle: `DOB: ${p.date_of_birth || (p as any).dob || '1984-05-12'} • Dr. Rajesh Mehta • CMC`,
          badge: p.patient_id,
          type: 'Patient',
          onSelect: () => {
            if (onSelectPatient) {
              onSelectPatient(p.patient_id);
            } else {
              navigate(`/doctor/patients/${p.patient_id}`);
            }
            onClose();
          },
        });
      });
    }

    if (selectedCategory === 'all' || selectedCategory === 'appointments') {
      matchedAppointments.forEach((a) => {
        list.push({
          id: a.appointment_id,
          title: a.reason || 'Clinical Consultation',
          subtitle: `${a.date} (${a.time_slot}) • Patient: ${a.patient_id}`,
          badge: a.appointment_id,
          type: 'Appointment',
          onSelect: () => {
            navigate('/doctor/appointments');
            onClose();
          },
        });
      });
    }

    if (selectedCategory === 'all' || selectedCategory === 'labs') {
      matchedLabs.forEach((l) => {
        list.push({
          id: l.report_id,
          title: l.test_type,
          subtitle: `${l.test_date} • Patient: ${l.patient_id} • Status: ${l.status}`,
          badge: l.report_id,
          type: 'Lab Report',
          onSelect: () => {
            navigate('/doctor/lab-reports');
            onClose();
          },
        });
      });
    }

    if (selectedCategory === 'all' || selectedCategory === 'prescriptions') {
      matchedRx.forEach((rx) => {
        list.push({
          id: rx.prescription_id,
          title: rx.medications.map((m) => m.name).join(', '),
          subtitle: `Patient: ${rx.patient_id} • Issued: ${rx.issued_date} • Refills: ${rx.refills_remaining}`,
          badge: rx.prescription_id,
          type: 'Prescription',
          onSelect: () => {
            navigate('/doctor/prescriptions');
            onClose();
          },
        });
      });
    }

    if (selectedCategory === 'all' || selectedCategory === 'staff') {
      matchedStaff.forEach((doc) => {
        list.push({
          id: doc.doctor_id,
          title: `Dr. ${doc.first_name} ${doc.last_name}`,
          subtitle: `${doc.specialty} • ${(doc as any).qualification || 'MD'} • Coimbatore Medical Center`,
          badge: doc.doctor_id,
          type: 'Doctor',
          onSelect: () => {
            navigate('/hospital/doctors');
            onClose();
          },
        });
      });
    }

    if (selectedCategory === 'all' || selectedCategory === 'insurance') {
      matchedInsurance.forEach((pol: any) => {
        list.push({
          id: pol.policy_id,
          title: pol.provider_name || 'Health Policy',
          subtitle: `Policy: ${pol.policy_id} • Patient: ${pol.patient_id || 'N/A'}`,
          badge: pol.policy_id,
          type: 'Insurance',
          onSelect: () => {
            navigate('/insurance');
            onClose();
          },
        });
      });
    }

    return list;
  }, [query, selectedCategory, patients, appointments, policies, doctors, navigate, onClose, onSelectPatient]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
      if (isOpen && flatResults.length > 0) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setSelectedIndex((prev) => (prev + 1) % flatResults.length);
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          setSelectedIndex((prev) => (prev - 1 + flatResults.length) % flatResults.length);
        } else if (e.key === 'Enter') {
          e.preventDefault();
          if (flatResults[selectedIndex]) {
            flatResults[selectedIndex].onSelect();
          }
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, flatResults, selectedIndex]);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();

    const matchedPatients = patients.filter((p) =>
      p.patient_id.toLowerCase().includes(q) ||
      `${p.first_name} ${p.last_name}`.toLowerCase().includes(q) ||
      (p.phone && p.phone.includes(q))
    );

    const matchedAppointments = appointments.filter((a) =>
      a.appointment_id.toLowerCase().includes(q) ||
      a.patient_id.toLowerCase().includes(q) ||
      (a.reason && a.reason.toLowerCase().includes(q)) ||
      a.doctor_id.toLowerCase().includes(q)
    );

    const matchedLabs = [MOCK_LAB_REPORT].filter((l) =>
      l.report_id.toLowerCase().includes(q) ||
      l.test_type.toLowerCase().includes(q) ||
      l.patient_id.toLowerCase().includes(q)
    );

    const matchedRx = MOCK_PRESCRIPTIONS.filter((rx) =>
      rx.prescription_id.toLowerCase().includes(q) ||
      rx.patient_id.toLowerCase().includes(q) ||
      rx.medications.some((m) => m.name.toLowerCase().includes(q))
    );

    const matchedInsurance = policies.filter((pol: any) =>
      pol.policy_id.toLowerCase().includes(q) ||
      pol.patient_id?.toLowerCase().includes(q) ||
      (pol.provider_name && pol.provider_name.toLowerCase().includes(q))
    );

    const matchedStaff = doctors.filter((doc) =>
      doc.doctor_id.toLowerCase().includes(q) ||
      `${doc.first_name} ${doc.last_name}`.toLowerCase().includes(q) ||
      doc.specialty.toLowerCase().includes(q)
    );

    return {
      patients: matchedPatients,
      appointments: matchedAppointments,
      labs: matchedLabs,
      prescriptions: matchedRx,
      insurance: matchedInsurance,
      staff: matchedStaff,
    };
  }, [query, patients, appointments, policies, doctors]);

  if (!isOpen) return null;

  const categories: Array<{ id: SearchCategory; label: string; count?: number }> = [
    { id: 'all', label: 'All Results' },
    { id: 'patients', label: 'Patients', count: results.patients.length },
    { id: 'appointments', label: 'Appointments', count: results.appointments.length },
    { id: 'labs', label: 'Lab Reports', count: results.labs.length },
    { id: 'prescriptions', label: 'Prescriptions', count: results.prescriptions.length },
    { id: 'staff', label: 'Medical Staff', count: results.staff.length },
    { id: 'insurance', label: 'Insurance', count: results.insurance.length },
  ];

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 100 }}>
      <div
        className="modal-surface"
        style={{
          maxWidth: 720,
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25)',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          border: '1px solid var(--border-subtle)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div
          style={{
            padding: '1rem 1.25rem',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            background: '#ffffff',
          }}
        >
          <Search style={{ width: 18, height: 18, color: 'var(--teal-intelligent)' }} />
          <input
            type="text"
            placeholder="Search MEDION... e.g. Arun Kumar, CBC, PAT-1001, Dr. Mehta"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              fontSize: '0.98rem',
              color: 'var(--text-primary)',
              background: 'transparent',
              fontFamily: 'inherit',
            }}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="btn-ui btn-ghost-ui"
              style={{ padding: '0.2rem', color: 'var(--text-muted)' }}
            >
              <X style={{ width: 16, height: 16 }} />
            </button>
          )}
          <kbd
            style={{
              fontSize: '0.68rem',
              background: 'var(--bg-surface-secondary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 4,
              padding: '0.15rem 0.4rem',
              color: 'var(--text-muted)',
              fontFamily: 'var(--font-mono)',
            }}
          >
            ESC
          </kbd>
        </div>

        {/* Categories Bar */}
        <div
          style={{
            display: 'flex',
            gap: '0.35rem',
            padding: '0.5rem 1.25rem',
            background: 'var(--bg-surface-secondary)',
            borderBottom: '1px solid var(--border-subtle)',
            overflowX: 'auto',
          }}
        >
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              style={{
                padding: '0.25rem 0.6rem',
                fontSize: '0.75rem',
                fontWeight: selectedCategory === cat.id ? 600 : 500,
                borderRadius: 'var(--radius-xs)',
                background: selectedCategory === cat.id ? 'var(--teal-intelligent)' : 'transparent',
                color: selectedCategory === cat.id ? '#ffffff' : 'var(--text-secondary)',
                border: 'none',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
              }}
            >
              <span>{cat.label}</span>
              {cat.count !== undefined && cat.count > 0 && (
                <span
                  style={{
                    fontSize: '0.65rem',
                    padding: '0.05rem 0.35rem',
                    borderRadius: 10,
                    background: selectedCategory === cat.id ? 'rgba(255,255,255,0.25)' : 'var(--border-subtle)',
                    color: selectedCategory === cat.id ? '#ffffff' : 'var(--text-muted)',
                  }}
                >
                  {cat.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Results List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0.75rem 1rem' }}>
          {/* Quick AI Suggestion */}
          {query.trim() && (
            <div
              onClick={() => {
                navigate(`/doctor/ai?q=${encodeURIComponent(query)}`);
                onClose();
              }}
              style={{
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--teal-subtle)',
                border: '1px solid var(--teal-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                marginBottom: '0.75rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Sparkles style={{ width: 16, height: 16, color: 'var(--teal-intelligent)' }} />
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--teal-intelligent)' }}>
                  Ask MEDION AI: "{query}"
                </span>
              </div>
              <ArrowRight style={{ width: 14, height: 14, color: 'var(--teal-intelligent)' }} />
            </div>
          )}

          {/* Quick Jump / Spotlight Results */}
          {flatResults.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.2rem', letterSpacing: '0.05em' }}>
                {query.trim() ? `Matching Records (${flatResults.length})` : 'Quick Jump / Showcase Records'}
              </div>
              {flatResults.map((item, idx) => {
                const isSelected = selectedIndex === idx;
                return (
                  <div
                    key={`${item.type}-${item.id}-${idx}`}
                    onClick={() => item.onSelect()}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    style={{
                      padding: '0.65rem 0.85rem',
                      borderRadius: 'var(--radius-sm)',
                      background: isSelected ? 'var(--teal-subtle)' : 'var(--bg-surface)',
                      border: isSelected ? '1px solid var(--teal-intelligent)' : '1px solid var(--border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      transition: 'all 0.12s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          background: isSelected ? 'var(--bg-surface)' : 'var(--bg-surface-secondary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {item.type === 'Patient' && <User style={{ width: 16, height: 16, color: 'var(--teal-intelligent)' }} />}
                        {item.type === 'Doctor' && <Stethoscope style={{ width: 16, height: 16, color: 'var(--medical-emerald)' }} />}
                        {item.type === 'Appointment' && <Calendar style={{ width: 16, height: 16, color: 'var(--navy-institutional)' }} />}
                        {item.type === 'Lab Report' && <FlaskConical style={{ width: 16, height: 16, color: 'var(--warning-amber)' }} />}
                        {item.type === 'Prescription' && <Pill style={{ width: 16, height: 16, color: '#8b5cf6' }} />}
                        {item.type === 'Insurance' && <Shield style={{ width: 16, height: 16, color: '#0ea5e9' }} />}
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontSize: '0.86rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                            {item.title}
                          </span>
                          <span
                            style={{
                              fontSize: '0.65rem',
                              fontWeight: 600,
                              padding: '0.1rem 0.35rem',
                              borderRadius: 4,
                              background: 'var(--bg-surface-secondary)',
                              color: 'var(--text-muted)',
                              textTransform: 'uppercase',
                            }}
                          >
                            {item.type}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          {item.subtitle}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          padding: '0.15rem 0.45rem',
                          borderRadius: 4,
                          background: isSelected ? 'rgba(255,255,255,0.8)' : 'var(--bg-surface-secondary)',
                          color: 'var(--text-secondary)',
                        }}
                      >
                        {item.badge}
                      </span>
                      {isSelected && (
                        <ArrowRight style={{ width: 14, height: 14, color: 'var(--teal-intelligent)' }} />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-muted)' }}>
              <Search style={{ width: 28, height: 28, margin: '0 auto 0.5rem', opacity: 0.4 }} />
              <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                No clinical records matching "{query}"
              </div>
              <div style={{ fontSize: '0.78rem', marginTop: '0.2rem' }}>
                Try searching by patient ID (e.g. PAT-1025), test name (CBC), doctor name (Dr. Rajesh Mehta), or reason.
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation Hints */}
        <div
          style={{
            padding: '0.6rem 1.25rem',
            borderTop: '1px solid var(--border-subtle)',
            background: 'var(--bg-surface-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.72rem',
            color: 'var(--text-muted)',
          }}
        >
          <div style={{ display: 'flex', gap: '1rem' }}>
            <span><kbd style={{ fontFamily: 'var(--font-mono)' }}>↵</kbd> Select</span>
            <span><kbd style={{ fontFamily: 'var(--font-mono)' }}>ESC</kbd> Close</span>
          </div>
          <span>Coimbatore Medical Center Database</span>
        </div>
      </div>
    </div>
  );
};
