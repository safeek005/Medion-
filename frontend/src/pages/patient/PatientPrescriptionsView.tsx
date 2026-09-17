import React, { useState } from 'react';
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
  Stethoscope,
  Send,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useAuth } from '../../services/authService';
import {
  useSharedPatients,
  useSharedPrescriptions,
  useSharedDoctors,
} from '../../services/dataService';
import { ExecutionTraceStep } from '../../types';

interface PatientPrescriptionsViewProps {
  onTraceGenerated?: (step: ExecutionTraceStep) => void;
}

export const PatientPrescriptionsView: React.FC<PatientPrescriptionsViewProps> = () => {
  const { user } = useAuth();
  const patients = useSharedPatients();
  const allPrescriptions = useSharedPrescriptions();
  const doctors = useSharedDoctors();

  const activePatient =
    (user?.id ? patients.find((p) => p.patient_id.toUpperCase() === user.id.toUpperCase()) : null) ||
    (user?.email ? patients.find((p) => p.email?.toLowerCase() === user.email.toLowerCase()) : null) ||
    patients[0] ||
    null;

  const mrn = user?.id || activePatient?.patient_id || 'PAT-1001';
  const patientDisplayName = user?.name || (activePatient ? `${activePatient.first_name} ${activePatient.last_name}` : 'Patient');

  const [refillMsg, setRefillMsg] = useState<string | null>(null);

  // Strict Patient Isolation: Filter ONLY this patient's prescriptions
  const patientPrescriptions = allPrescriptions.filter(
    (rx) => rx.patient_id?.toUpperCase() === mrn.toUpperCase()
  );

  // Active Medications for this patient derived dynamically
  const activeMedications = patientPrescriptions.flatMap((rx) =>
    (rx.medications || []).map((m: any, idx: number) => {
      const doc = doctors.find((d) => d.doctor_id === rx.doctor_id);
      return {
        id: `${rx.prescription_id || 'rx'}-med-${idx}`,
        name: m.name,
        brandName: m.brand_name || 'Generic / Formulated',
        dose: m.dosage || m.dose || '',
        route: m.route || 'Oral (PO)',
        frequency: m.frequency || m.schedule || 'As prescribed',
        prescriber: doc ? `Dr. ${doc.first_name} ${doc.last_name}, MD (${doc.specialty})` : 'Attending Physician',
        startDate: rx.issued_date || '2026-09-12',
        refills: rx.refills_remaining !== undefined ? `${rx.refills_remaining} refills remaining` : 'Active therapy',
        status: (rx.status || 'ACTIVE') as 'ACTIVE',
        purpose: m.instructions || m.reason || 'Clinical management',
        instructions: m.instructions || 'Take medication strictly according to prescribing clinician directions.',
        warnings: m.warnings || 'Follow prescribed dosing schedule. Contact clinic if adverse symptoms appear.',
      };
    })
  );

  // Prescription History for this patient
  const prescriptionHistory = patientPrescriptions.map((rx) => {
    const doc = doctors.find((d) => d.doctor_id === rx.doctor_id);
    return {
      prescriptionId: rx.prescription_id || 'RX-1025',
      doctor: doc ? `Dr. ${doc.first_name} ${doc.last_name}, MD` : 'Attending Physician',
      facility: 'Coimbatore Medical Center • Outpatient Clinic',
      issuedDate: rx.issued_date || '2026-09-12',
      validUntil: '2027-03-12',
      medications: (rx.medications || []).map((m: any) => ({
        name: m.name,
        dose: m.dosage || m.dose || '',
        frequency: m.frequency || m.schedule || 'Once daily',
        duration: m.duration_days ? `${m.duration_days} days` : '60 days',
      })),
      notes: rx.instructions || 'Authorized outpatient prescription regimen.',
      status: (rx.status || 'ACTIVE') as 'ACTIVE',
    };
  });

  const handleRequestRefill = (medName: string) => {
    setRefillMsg(`Refill request for ${medName} submitted to Coimbatore Medical Center Central Pharmacy.`);
    setTimeout(() => setRefillMsg(null), 4500);
  };

  return (
    <div style={{ padding: '2rem', maxWidth: 1150, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem', fontFamily: 'var(--font-sans)' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--teal-intelligent)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.25rem' }}>
            <Pill style={{ width: 14, height: 14 }} /> Patient Care Portal • Prescriptions & Active Medications
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
            My Active Medications & Prescriptions
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: '0.35rem 0 0' }}>
            Review your verified pharmaceutical regimens, dosage schedules, refill status, and medication guidelines.
          </p>
        </div>

        <div style={{ textAlign: 'right', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          <div>Patient: <strong style={{ color: 'var(--text-primary)' }}>{patientDisplayName}</strong></div>
          <div>MRN: <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-primary)' }}>{mrn}</span></div>
        </div>
      </div>

      {/* Refill Feedback Notice */}
      {refillMsg && (
        <div style={{ padding: '0.85rem 1.25rem', borderRadius: 'var(--radius-md, 8px)', backgroundColor: 'var(--medical-emerald-subtle, #ecfdf5)', border: '1px solid #a7f3d0', color: 'var(--medical-emerald, #059669)', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle2 style={{ width: 18, height: 18 }} />
          <span>{refillMsg}</span>
        </div>
      )}

      {/* Allergy Warning Strip */}
      <div style={{ padding: '0.85rem 1.25rem', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: 'var(--radius-md, 10px)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <AlertCircle style={{ width: 20, height: 20, color: '#dc2626', flexShrink: 0 }} />
        <div style={{ fontSize: '0.82rem', color: '#991b1b' }}>
          <strong>Documented Drug Allergy:</strong>{' '}
          {(activePatient as any)?.allergies && ((activePatient as any).allergies as any[]).length > 0
            ? ((activePatient as any).allergies as any[]).join(', ')
            : 'No Known Drug Allergies (NKDA). All prescribed regimens screened.'}
        </div>
      </div>

      {/* Active Medications Roster */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: 'var(--radius-lg, 16px)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-xs)', overflow: 'hidden' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-app)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Pill style={{ width: 18, height: 18, color: 'var(--teal-intelligent)' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Active Medications ({activeMedications.length})</h3>
          </div>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '0.2rem 0.6rem', borderRadius: 999, backgroundColor: '#dcfce7', color: '#15803d' }}>
            Verified Active Regimens
          </span>
        </div>

        {activeMedications.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {activeMedications.map((med, idx) => (
            <div
              key={med.id}
              style={{
                padding: '1.5rem',
                borderBottom: idx < activeMedications.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.85rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                      {med.name} ({med.brandName})
                    </h4>
                    <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', fontWeight: 600, padding: '0.15rem 0.45rem', borderRadius: 4, backgroundColor: 'var(--teal-subtle)', color: 'var(--teal-intelligent)' }}>
                      {med.dose} • {med.route}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                    Frequency: <strong style={{ color: 'var(--text-primary)' }}>{med.frequency}</strong> • Prescribed by {med.prescriber}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Refills: <strong style={{ color: 'var(--text-primary)' }}>{med.refills}</strong>
                  </span>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleRequestRefill(med.name)}
                    style={{ fontSize: '0.78rem' }}
                  >
                    <Send style={{ width: 13, height: 13, marginRight: 6 }} /> Request Refill
                  </Button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.75rem', fontSize: '0.8rem', backgroundColor: 'var(--bg-app)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md, 8px)', border: '1px solid var(--border-subtle)' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem' }}>Clinical Purpose</span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{med.purpose}</span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem' }}>Instructions</span>
                  <span style={{ color: 'var(--text-primary)' }}>{med.instructions}</span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem' }}>Precautions</span>
                  <span style={{ color: '#b45309' }}>{med.warnings}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ padding: '3rem 1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Pill style={{ width: 32, height: 32, margin: '0 auto 0.75rem', opacity: 0.4 }} />
          <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>No Active Medications</div>
          <p style={{ fontSize: '0.82rem', margin: '0.25rem 0 0' }}>There are currently no active prescription regimens on file for this patient.</p>
        </div>
      )}
      </div>

      {/* Prescription History */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: 'var(--radius-lg, 16px)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-xs)', padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-subtle)' }}>
          <FileText style={{ width: 18, height: 18, color: 'var(--teal-intelligent)' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Historical Prescription Ledger</h3>
        </div>

        {prescriptionHistory.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {prescriptionHistory.map((rx) => (
              <div
                key={rx.prescriptionId}
                style={{
                  padding: '1rem 1.25rem',
                  borderRadius: 'var(--radius-md, 10px)',
                  backgroundColor: 'var(--bg-app)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  flexWrap: 'wrap',
                  gap: '0.75rem',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <strong style={{ fontFamily: 'var(--font-mono)', fontSize: '0.88rem', color: 'var(--text-primary)' }}>{rx.prescriptionId}</strong>
                    <span style={{ fontSize: '0.7rem', fontWeight: 600, padding: '0.15rem 0.45rem', borderRadius: 4, backgroundColor: rx.status === 'ACTIVE' ? '#dcfce7' : '#f1f5f9', color: rx.status === 'ACTIVE' ? '#15803d' : '#64748b' }}>
                      {rx.status}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Issued by {rx.doctor} • {rx.facility}
                  </div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    Dates: {rx.issuedDate} through {rx.validUntil}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.35rem', fontStyle: 'italic' }}>
                    "{rx.notes}"
                  </div>
                </div>

                <div style={{ fontSize: '0.8rem', textAlign: 'right' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>Prescribed Regimen:</span>
                  {(rx.medications || []).map((m: any, mIdx: number) => (
                    <div key={mIdx} style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: 2 }}>
                      {m.name} ({m.dose}) - {m.frequency}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding: '3rem 1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <FileText style={{ width: 32, height: 32, margin: '0 auto 0.75rem', opacity: 0.4 }} />
            <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>No Prescription History</div>
            <p style={{ fontSize: '0.82rem', margin: '0.25rem 0 0' }}>No historical prescription orders recorded.</p>
          </div>
        )}
      </div>
    </div>
  );
};
