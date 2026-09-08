import React from 'react';
import { Calendar, Clock, User, CheckCircle2, AlertCircle, MapPin } from 'lucide-react';

interface AppointmentResultCardProps {
  data: any;
  summary?: string;
  onSelectSlot?: (slot: string, date: string, doctorName: string) => void;
}

export const AppointmentResultCard: React.FC<AppointmentResultCardProps> = ({ data, summary, onSelectSlot }) => {
  const apt = data?.appointment;
  const isSlotsView = Boolean(data?.available_slots && !apt);

  if (isSlotsView) {
    const slots = data.available_slots || [];
    const doctorName = data.doctor_name || 'Consulting Physician';
    const specialty = data.specialty || 'Specialist';
    const date = data.date || 'Upcoming';

    return (
      <div className="result-card appointment-card" style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg, 12px)',
        padding: '1.25rem',
        marginTop: '0.75rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <span className="badge-ui badge-green" style={{ fontSize: '0.72rem', textTransform: 'uppercase' }}>
                Availability Found
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {slots.length} Slot(s) Available
              </span>
            </div>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 600, margin: 0, color: 'var(--text-primary)' }}>
              {doctorName}
            </h4>
            <span style={{ fontSize: '0.82rem', color: 'var(--forest-green)', fontWeight: 500 }}>
              {specialty}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
            <Calendar style={{ width: 14, height: 14 }} />
            <span>{date}</span>
          </div>
        </div>

        {summary && (
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: 1.5 }}>
            {summary}
          </p>
        )}

        <div style={{ marginTop: '0.75rem' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.5rem' }}>
            Select Preferred Time Slot to Book:
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {slots.map((s: any, idx: number) => {
              const slotStr = typeof s === 'string' ? s : s.time_slot;
              return (
                <button
                  key={idx}
                  onClick={() => onSelectSlot && onSelectSlot(slotStr, date, doctorName)}
                  className="btn-ui btn-secondary-ui"
                  style={{
                    fontSize: '0.82rem',
                    padding: '0.4rem 0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    borderRadius: '8px'
                  }}
                  title={`Book slot at ${slotStr}`}
                >
                  <Clock style={{ width: 12, height: 12, color: 'var(--forest-green)' }} />
                  {slotStr}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  if (apt) {
    const isCancelled = apt.status === 'CANCELLED';
    const isRescheduled = apt.status === 'RESCHEDULED';

    return (
      <div className="result-card appointment-card" style={{
        background: 'var(--bg-surface)',
        border: `1px solid ${isCancelled ? 'var(--border-subtle)' : 'rgba(16, 185, 129, 0.25)'}`,
        borderRadius: 'var(--radius-lg, 12px)',
        padding: '1.25rem',
        marginTop: '0.75rem',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {isCancelled ? (
              <AlertCircle style={{ width: 18, height: 18, color: 'var(--danger-red, #dc2626)' }} />
            ) : (
              <CheckCircle2 style={{ width: 18, height: 18, color: 'var(--forest-green, #10b981)' }} />
            )}
            <span style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
              Appointment {apt.appointment_id}
            </span>
          </div>
          <span className={`badge-ui ${isCancelled ? 'badge-red' : isRescheduled ? 'badge-amber' : 'badge-green'}`} style={{ fontSize: '0.75rem' }}>
            {apt.status || 'CONFIRMED'}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.85rem', marginBottom: '1rem' }}>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Consulting Doctor</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-primary)' }}>
              <User style={{ width: 14, height: 14, color: 'var(--forest-green)' }} />
              {apt.doctor_name || apt.doctor_id}
            </div>
            {apt.specialty && <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{apt.specialty}</span>}
          </div>

          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Date & Time</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-primary)' }}>
              <Calendar style={{ width: 14, height: 14, color: 'var(--forest-green)' }} />
              {apt.appointment_date}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              <Clock style={{ width: 12, height: 12 }} />
              {apt.time_slot}
            </div>
          </div>

          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Patient</span>
            <span style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-primary)' }}>
              {apt.patient_name || apt.patient_id}
            </span>
            {apt.reason_for_visit && (
              <span style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                {apt.reason_for_visit}
              </span>
            )}
          </div>
        </div>

        {summary && (
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', background: 'var(--bg-muted, rgba(0,0,0,0.02))', padding: '0.65rem 0.85rem', borderRadius: '8px', marginBottom: '0.75rem' }}>
            {summary}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
          <button
            onClick={() => {
              const role = window.location.pathname.split('/')[1] || 'doctor';
              window.location.href = `/${role}/appointments`;
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
            <Calendar style={{ width: 14, height: 14 }} />
            <span>View Appointments</span>
          </button>
        </div>
      </div>
    );
  }

  return null;
};
