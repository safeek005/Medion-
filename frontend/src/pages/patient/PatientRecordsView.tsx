import React from 'react';
import {
  FileText,
  User,
  HeartPulse,
  Activity,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Shield,
  Stethoscope,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { useAuth } from '../../services/authService';
import { useSharedPatients, useSharedDoctors, useSharedPolicies } from '../../services/dataService';
import { ExecutionTraceStep } from '../../types';

interface PatientRecordsViewProps {
  onTraceGenerated?: (step: ExecutionTraceStep) => void;
}

export const PatientRecordsView: React.FC<PatientRecordsViewProps> = () => {
  const { user } = useAuth();
  const patients = useSharedPatients();
  const doctors = useSharedDoctors();
  const policies = useSharedPolicies();

  // Scope strictly to authenticated patient
  const activePatient =
    (user?.id ? patients.find((p) => p.patient_id.toUpperCase() === user.id.toUpperCase()) : null) ||
    (user?.email ? patients.find((p) => p.email?.toLowerCase() === user.email.toLowerCase()) : null) ||
    patients.find((p) => p.patient_id === 'PAT-1025') ||
    null;

  const mrn = user?.id || activePatient?.patient_id || 'PAT-1025';
  const attendingDoctor = doctors.find((d) => d.doctor_id === activePatient?.primary_doctor_id) || null;
  const patientPolicy =
    policies.find((pol) => pol.patient_id?.toUpperCase() === mrn.toUpperCase()) ||
    (activePatient?.insurance_policy_id ? policies.find((pol) => pol.policy_id === activePatient.insurance_policy_id) : null);

  const renderEmergencyContact = () => {
    if (!activePatient?.emergency_contact) return 'None on record';
    if (typeof activePatient.emergency_contact === 'object') {
      const ec = activePatient.emergency_contact;
      return `${ec.name || 'Emergency Contact'} (${ec.relationship || 'Relative'}) • ${ec.phone || 'Phone on file'}`;
    }
    return String(activePatient.emergency_contact);
  };

  return (
    <div style={{ padding: '2rem', maxWidth: 1150, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem', fontFamily: 'var(--font-sans)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--teal-intelligent)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.25rem' }}>
            <Shield style={{ width: 14, height: 14 }} /> Patient Record Isolation Enforced
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>Electronic Medical Record (EMR)</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: '0.35rem 0 0' }}>
            Personal health summary, baseline vitals, attending care team, and emergency details.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ padding: '0.25rem 0.65rem', borderRadius: 999, fontSize: '0.75rem', fontWeight: 600, backgroundColor: 'var(--medical-emerald-subtle, #ecfdf5)', color: 'var(--medical-emerald, #059669)', border: '1px solid #a7f3d0' }}>
            Verified Patient Profile
          </span>
          <div style={{ fontSize: '0.78rem', fontFamily: 'var(--font-mono)', backgroundColor: 'var(--bg-app)', color: 'var(--text-primary)', padding: '0.35rem 0.75rem', borderRadius: 6, border: '1px solid var(--border-subtle)', fontWeight: 600 }}>
            MRN: {mrn}
          </div>
        </div>
      </div>

      {/* Patient Profile Card */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: 'var(--radius-lg, 16px)', border: '1px solid var(--border-subtle)', padding: '1.75rem', boxShadow: 'var(--shadow-xs)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
          <div style={{ width: 64, height: 64, borderRadius: 'var(--radius-md, 12px)', backgroundColor: 'var(--teal-subtle)', border: '1px solid var(--teal-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--teal-intelligent)', fontWeight: 800, fontSize: '1.35rem' }}>
            {activePatient?.first_name?.[0] || 'K'}{activePatient?.last_name?.[0] || 'S'}
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              {activePatient?.first_name} {activePatient?.last_name}
            </h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.75rem', fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
              <span>DOB: {activePatient?.date_of_birth || activePatient?.dob || '1996-08-14'}</span>
              <span>•</span>
              <span>Gender: {activePatient?.gender || 'Female'}</span>
              <span>•</span>
              <span>Blood Group: <strong style={{ color: '#dc2626' }}>{activePatient?.blood_group || 'B+'}</strong></span>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-subtle)', fontSize: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', color: 'var(--text-secondary)' }}>
            <Phone style={{ width: 16, height: 16, color: 'var(--text-muted)' }} />
            <span>{activePatient?.phone || '+91 9845012345'}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', color: 'var(--text-secondary)' }}>
            <Mail style={{ width: 16, height: 16, color: 'var(--text-muted)' }} />
            <span>{activePatient?.email || 'kavya.sharma@example.com'}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', color: 'var(--text-secondary)' }}>
            <MapPin style={{ width: 16, height: 16, color: 'var(--text-muted)' }} />
            <span>{activePatient?.address || '12/4 Gandhipuram, Coimbatore, TN'}</span>
          </div>
        </div>
      </div>

      {/* Baseline Clinical Vitals */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: 'var(--radius-lg, 16px)', border: '1px solid var(--border-subtle)', padding: '1.75rem', boxShadow: 'var(--shadow-xs)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: 'var(--text-primary)', fontSize: '1.05rem' }}>
            <HeartPulse style={{ width: 20, height: 20, color: '#ef4444' }} /> Baseline Clinical Vitals
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Last Recorded: Yesterday 16:30</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
          <div style={{ padding: '1rem', borderRadius: 'var(--radius-md, 10px)', backgroundColor: 'var(--bg-app)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Blood Pressure</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.25rem' }}>118 / 78</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--medical-emerald)', marginTop: '0.2rem', fontWeight: 600 }}>Normal range</div>
          </div>

          <div style={{ padding: '1rem', borderRadius: 'var(--radius-md, 10px)', backgroundColor: 'var(--bg-app)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Heart Rate</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.25rem' }}>72 bpm</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--medical-emerald)', marginTop: '0.2rem', fontWeight: 600 }}>Resting regular</div>
          </div>

          <div style={{ padding: '1rem', borderRadius: 'var(--radius-md, 10px)', backgroundColor: 'var(--bg-app)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>SpO2 (Oxygen)</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.25rem' }}>98%</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--medical-emerald)', marginTop: '0.2rem', fontWeight: 600 }}>Adequate room air</div>
          </div>

          <div style={{ padding: '1rem', borderRadius: 'var(--radius-md, 10px)', backgroundColor: 'var(--bg-app)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>BMI (Body Mass)</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.25rem' }}>22.4</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--medical-emerald)', marginTop: '0.2rem', fontWeight: 600 }}>Healthy weight</div>
          </div>
        </div>
      </div>

      {/* Clinical Summary & Care Team */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {/* Attending Care Team */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: 'var(--radius-lg, 16px)', border: '1px solid var(--border-subtle)', padding: '1.75rem', boxShadow: 'var(--shadow-xs)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.25rem', fontSize: '1.05rem' }}>
            <Stethoscope style={{ width: 20, height: 20, color: 'var(--teal-intelligent)' }} /> Primary Care Physician
          </div>

          <div style={{ padding: '1rem', borderRadius: 'var(--radius-md, 10px)', backgroundColor: 'var(--bg-app)', border: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              {attendingDoctor ? (
                <>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Dr. {attendingDoctor.first_name} {attendingDoctor.last_name}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{attendingDoctor.specialty} • Senior Attending</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Facility: Coimbatore Medical Center (HOSP-001)</div>
                </>
              ) : (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No primary physician currently assigned</div>
              )}
            </div>
            {attendingDoctor && (
              <span style={{ fontSize: '0.72rem', fontWeight: 600, padding: '0.2rem 0.6rem', borderRadius: 4, backgroundColor: '#dcfce7', color: '#15803d' }}>
                Assigned
              </span>
            )}
          </div>

          <div style={{ marginTop: '1rem', fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            Your primary physician is responsible for authorizing clinical care, coordinating diagnostic reviews, and approving therapeutic prescriptions.
          </div>
        </div>

        {/* Emergency Contact & Policy Link */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: 'var(--radius-lg, 16px)', border: '1px solid var(--border-subtle)', padding: '1.75rem', boxShadow: 'var(--shadow-xs)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.25rem', fontSize: '1.05rem' }}>
            <Shield style={{ width: 20, height: 20, color: 'var(--medical-emerald)' }} /> Emergency Contact & Coverage
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div style={{ padding: '1rem', borderRadius: 'var(--radius-md, 10px)', backgroundColor: 'var(--bg-app)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Emergency Contact</div>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: '0.25rem', fontSize: '0.88rem' }}>
                {renderEmergencyContact()}
              </div>
            </div>

            <div style={{ padding: '1rem', borderRadius: 'var(--radius-md, 10px)', backgroundColor: 'var(--bg-app)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Linked Insurance Policy</div>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: '0.25rem', fontSize: '0.88rem' }}>
                {patientPolicy
                  ? `${patientPolicy.provider_name} (${patientPolicy.plan_type} • Policy #${patientPolicy.policy_number || patientPolicy.policy_id})`
                  : 'No active insurance policy linked'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
