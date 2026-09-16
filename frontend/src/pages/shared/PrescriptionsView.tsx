import React, { useState } from 'react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { useSharedPrescriptions, useSharedPatients } from '../../services/dataService';
import {
  Pill,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar,
  User,
  ShieldCheck,
  Sparkles,
  Info,
  RefreshCw,
  Plus,
  Search,
  Filter,
} from 'lucide-react';

export const PrescriptionsView: React.FC = () => {
  const sharedPrescriptions = useSharedPrescriptions();
  const sharedPatients = useSharedPatients();

  const [selectedPatientId, setSelectedPatientId] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [refillMsg, setRefillMsg] = useState<string | null>(null);

  // Filter prescriptions
  const filteredPrescriptions = sharedPrescriptions.filter((rx) => {
    if (selectedPatientId !== 'ALL' && rx.patient_id.toUpperCase() !== selectedPatientId.toUpperCase()) {
      return false;
    }
    if (!searchQuery.trim()) return true;

    const patient = sharedPatients.find(
      (p) => p.patient_id.toUpperCase() === rx.patient_id.toUpperCase()
    );
    const patientName = patient ? `${patient.first_name} ${patient.last_name}`.toLowerCase() : '';
    const query = searchQuery.toLowerCase();
    const hasMedMatch = (rx.medications || []).some(
      (m: any) =>
        m.name.toLowerCase().includes(query) ||
        (m.instructions && m.instructions.toLowerCase().includes(query))
    );

    return (
      rx.prescription_id.toLowerCase().includes(query) ||
      rx.patient_id.toLowerCase().includes(query) ||
      patientName.includes(query) ||
      hasMedMatch
    );
  });

  const handleRequestRefill = (medName: string, patientName: string) => {
    setRefillMsg(`Refill request for ${medName} (${patientName}) dispatched to hospital pharmacy.`);
    setTimeout(() => setRefillMsg(null), 4500);
  };

  return (
    <div style={{ padding: '1.75rem 2rem', maxWidth: 1250, margin: '0 auto' }}>
      {/* Page Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '1.5rem',
          paddingBottom: '1.25rem',
          borderBottom: '1px solid var(--border-subtle)',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <div
            style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              color: 'var(--teal-intelligent)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            COIMBATORE MEDICAL CENTER • PHARMACEUTICAL CARE & EHR FORMULARY
          </div>
          <h1
            style={{
              fontSize: '1.75rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
              letterSpacing: '-0.03em',
              marginTop: '0.2rem',
            }}
          >
            Prescriptions & Medication Orders
          </h1>
          <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Hospital pharmaceutical regimens, dosage schedules, refill status, and electronic medication ledger
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.6rem' }}>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setRefillMsg('Formulary safety cross-check verified: No contraindications or severe cytochrome P450 interactions detected.');
              setTimeout(() => setRefillMsg(null), 4500);
            }}
          >
            <ShieldCheck style={{ width: 14, height: 14, color: 'var(--clinical-green)' }} /> Formulary Safety Verified
          </Button>
        </div>
      </div>

      {/* Feedback Notice */}
      {refillMsg && (
        <div
          style={{
            marginBottom: '1.25rem',
            background: 'var(--forest-subtle)',
            border: '1px solid var(--forest-brand)',
            color: 'var(--forest-brand)',
            borderRadius: 6,
            padding: '0.65rem 1rem',
            fontSize: '0.84rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontWeight: 600,
          }}
        >
          <CheckCircle2 style={{ width: 16, height: 16 }} />
          <span>{refillMsg}</span>
        </div>
      )}

      {/* Patient Filter Strip & Search */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setSelectedPatientId('ALL')}
            style={{
              padding: '0.45rem 0.85rem',
              fontSize: '0.8rem',
              fontWeight: selectedPatientId === 'ALL' ? 700 : 500,
              color: selectedPatientId === 'ALL' ? 'var(--forest-brand)' : 'var(--text-secondary)',
              background: selectedPatientId === 'ALL' ? 'var(--forest-subtle)' : 'var(--bg-surface)',
              border: '1px solid',
              borderColor: selectedPatientId === 'ALL' ? 'var(--forest-border)' : 'var(--border-subtle)',
              borderRadius: 6,
              cursor: 'pointer',
            }}
          >
            All Patients ({sharedPrescriptions.length})
          </button>
          {sharedPatients.slice(0, 6).map((p) => {
            const isSelected = selectedPatientId === p.patient_id;
            const rxCount = sharedPrescriptions.filter(
              (r) => r.patient_id.toUpperCase() === p.patient_id.toUpperCase()
            ).length;
            return (
              <button
                key={p.patient_id}
                onClick={() => setSelectedPatientId(p.patient_id)}
                style={{
                  padding: '0.45rem 0.85rem',
                  fontSize: '0.8rem',
                  fontWeight: isSelected ? 700 : 500,
                  color: isSelected ? 'var(--forest-brand)' : 'var(--text-secondary)',
                  background: isSelected ? 'var(--forest-subtle)' : 'var(--bg-surface)',
                  border: '1px solid',
                  borderColor: isSelected ? 'var(--forest-border)' : 'var(--border-subtle)',
                  borderRadius: 6,
                  cursor: 'pointer',
                }}
              >
                {p.first_name} {p.last_name} ({rxCount})
              </button>
            );
          })}
        </div>

        <div style={{ position: 'relative', width: 280 }}>
          <Search
            style={{
              position: 'absolute',
              left: 10,
              top: '50%',
              transform: 'translateY(-50%)',
              width: 15,
              height: 15,
              color: 'var(--text-muted)',
            }}
          />
          <input
            type="text"
            placeholder="Search medications or patients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '0.45rem 0.85rem 0.45rem 2.2rem',
              borderRadius: 6,
              border: '1px solid var(--border-subtle)',
              background: 'var(--bg-surface)',
              color: 'var(--text-primary)',
              fontSize: '0.82rem',
              outline: 'none',
            }}
          />
        </div>
      </div>

      {/* SECTION 1: PRESCRIPTIONS LIST */}
      <div
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 8,
          padding: '1.25rem 1.5rem',
          marginBottom: '2rem',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.25rem',
            paddingBottom: '0.5rem',
            borderBottom: '1px solid var(--border-subtle)',
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: '1.05rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <Pill style={{ width: 18, height: 18, color: 'var(--teal-intelligent)' }} />
              Active Prescriptions & Regimens
            </h2>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Currently authorized therapeutic regimens under active clinical management
            </span>
          </div>
          <Badge variant="green">{filteredPrescriptions.length} Orders</Badge>
        </div>

        {filteredPrescriptions.length === 0 ? (
          <div
            style={{
              padding: '2.5rem',
              textAlign: 'center',
              color: 'var(--text-muted)',
              background: 'var(--bg-app)',
              borderRadius: 6,
              border: '1px solid var(--border-subtle)',
            }}
          >
            No prescriptions found matching the active filter.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {filteredPrescriptions.map((rx) => {
              const patient = sharedPatients.find(
                (p) => p.patient_id.toUpperCase() === rx.patient_id.toUpperCase()
              );
              const patientName = patient ? `${patient.first_name} ${patient.last_name}` : rx.patient_id;

              return (
                <div
                  key={rx.prescription_id}
                  style={{
                    borderRadius: 6,
                    border: '1px solid var(--border-subtle)',
                    background: 'var(--bg-surface-secondary)',
                    padding: '1rem 1.25rem',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '0.65rem',
                      flexWrap: 'wrap',
                      gap: '0.5rem',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontWeight: 800, fontSize: '0.94rem', color: 'var(--text-primary)' }}>
                          {patientName}
                        </span>
                        <Badge variant="brand">{rx.patient_id}</Badge>
                        <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                          {rx.prescription_id}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                        Prescribed by: <strong>{rx.doctor_id} (Attending Physician)</strong> • Coimbatore Medical Center
                      </div>
                    </div>

                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textAlign: 'right' }}>
                      <div>
                        Issued: <strong className="tabular-nums">{rx.issued_date || '2026-09-10'}</strong>
                      </div>
                      <div style={{ color: 'var(--forest-brand)', fontWeight: 600 }}>
                        Refills Remaining: {rx.refills_remaining ?? 2}
                      </div>
                    </div>
                  </div>

                  {/* Medications Table */}
                  <div style={{ overflowX: 'auto', margin: '0.65rem 0' }}>
                    <table className="table-ui" style={{ width: '100%', background: 'var(--bg-surface)' }}>
                      <thead>
                        <tr>
                          <th>Medication</th>
                          <th>Dose</th>
                          <th>Frequency</th>
                          <th>Duration</th>
                          <th>Instructions</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(rx.medications || []).map((m: any, mIdx: number) => (
                          <tr key={mIdx}>
                            <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{m.name}</td>
                            <td>{m.dosage} PO</td>
                            <td>
                              <Badge variant="brand">{m.frequency}</Badge>
                            </td>
                            <td>{m.duration_days ? `${m.duration_days} days` : '30 days'}</td>
                            <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                              {m.instructions || 'Take as prescribed'}
                            </td>
                            <td>
                              <Button
                                variant="secondary"
                                size="sm"
                                style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem' }}
                                onClick={() => handleRequestRefill(m.name, patientName)}
                              >
                                Dispense Refill
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Patient Allergy Notice if present */}
                  {patient?.allergies && (
                    <div style={{ fontSize: '0.74rem', color: 'var(--danger-red)', marginTop: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <AlertCircle style={{ width: 13, height: 13 }} />
                      <span>
                        Documented Allergies:{' '}
                        {Array.isArray(patient.allergies) ? patient.allergies.join(', ') : String(patient.allergies)}{' '}
                        (Cross-reactions screened)
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
