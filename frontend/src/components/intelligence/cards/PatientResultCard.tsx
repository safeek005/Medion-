import React from 'react';
import { User, Phone, Mail, MapPin, Heart, Shield, Stethoscope, FileText } from 'lucide-react';

interface PatientResultCardProps {
  data: any;
  summary?: string;
}

export const PatientResultCard: React.FC<PatientResultCardProps> = ({ data, summary }) => {
  const patient = data?.patient || {};
  const isHistory = Boolean(data?.medical_records || data?.lab_reports || data?.prescriptions);

  const patientId = patient.patient_id || data?.patient_id || '';
  const fullName = patient.first_name ? `${patient.first_name} ${patient.last_name || ''}`.trim() : (data?.patient_name || 'Patient Profile');

  return (
    <div className="result-card patient-card" style={{
      background: 'var(--bg-surface)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-lg, 12px)',
      padding: '1.25rem',
      marginTop: '0.75rem',
      boxShadow: 'var(--shadow-sm)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-subtle)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span className="badge-ui badge-green" style={{ fontSize: '0.72rem', textTransform: 'uppercase' }}>
              Patient Profile
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {patientId}
            </span>
          </div>
          <h4 style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0, color: 'var(--text-primary)' }}>
            {fullName}
          </h4>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            DOB: {patient.dob || patient.date_of_birth || 'Not provided'} • {patient.gender || 'Not specified'}
          </span>
        </div>
        <div>
          {patient.blood_group ? (
            <span className="badge-ui badge-red" style={{ fontSize: '0.8rem', fontWeight: 700 }}>
              {patient.blood_group}
            </span>
          ) : (
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
              Blood Group: Not provided
            </span>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.85rem', marginBottom: '1rem' }}>
        <div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Contact Phone</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.86rem', color: patient.phone ? 'var(--text-primary)' : 'var(--text-muted)' }}>
            <Phone style={{ width: 12, height: 12, color: 'var(--forest-green)' }} />
            {patient.phone || 'Not provided'}
          </div>
        </div>

        <div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Primary Care Physician</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.86rem', color: patient.primary_doctor_id ? 'var(--text-primary)' : 'var(--text-muted)' }}>
            <Stethoscope style={{ width: 12, height: 12, color: patient.primary_doctor_id ? 'var(--forest-green)' : 'var(--text-muted)' }} />
            {patient.primary_doctor_id || 'Not assigned'}
          </div>
        </div>

        <div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Insurance Policy</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.86rem', color: patient.insurance_policy_id ? 'var(--text-primary)' : 'var(--text-muted)' }}>
            <Shield style={{ width: 12, height: 12, color: patient.insurance_policy_id ? 'var(--forest-green)' : 'var(--text-muted)' }} />
            {patient.insurance_policy_id || 'Not assigned'}
          </div>
        </div>

        <div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Emergency Contact</span>
          <span style={{ fontSize: '0.86rem', color: (patient.emergency_contact?.name || (typeof patient.emergency_contact === 'string' && patient.emergency_contact)) ? 'var(--text-primary)' : 'var(--text-muted)' }}>
            {patient.emergency_contact?.name
              ? `${patient.emergency_contact.name} (${patient.emergency_contact.relationship || 'Contact'})`
              : (typeof patient.emergency_contact === 'string' && patient.emergency_contact.trim()
                  ? patient.emergency_contact
                  : 'Not provided')}
          </span>
        </div>
      </div>

      {/* Clinical History Counters if present */}
      {isHistory && (
        <div style={{
          display: 'flex',
          gap: '1rem',
          padding: '0.75rem',
          background: 'var(--bg-muted, rgba(0,0,0,0.02))',
          borderRadius: '8px',
          marginBottom: '0.75rem'
        }}>
          <div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>Records</span>
            <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
              {data.medical_records?.length || 0}
            </span>
          </div>
          <div style={{ borderLeft: '1px solid var(--border-subtle)', paddingLeft: '1rem' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>Lab Panels</span>
            <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
              {data.lab_reports?.length || 0}
            </span>
          </div>
          <div style={{ borderLeft: '1px solid var(--border-subtle)', paddingLeft: '1rem' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>Prescriptions</span>
            <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
              {data.prescriptions?.length || 0}
            </span>
          </div>
        </div>
      )}

      {summary && (
        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', background: 'var(--bg-muted, rgba(0,0,0,0.02))', padding: '0.65rem 0.85rem', borderRadius: '8px', marginBottom: '0.75rem' }}>
          {summary}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
        <button
          onClick={() => {
            const role = window.location.pathname.split('/')[1] || 'doctor';
            window.location.href = `/${role}/patients`;
          }}
          className="btn-ui btn-primary-ui"
          style={{
            fontSize: '0.82rem',
            padding: '0.4rem 0.85rem',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem'
          }}
        >
          <User style={{ width: 14, height: 14 }} />
          <span>View Patient</span>
        </button>
      </div>
    </div>
  );
};
