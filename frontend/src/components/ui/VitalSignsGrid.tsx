import React from 'react';
import { Activity, Heart, Thermometer, Wind, Droplet, Clock } from 'lucide-react';

export interface VitalSignItem {
  id: string;
  name: string;
  value: string | number;
  unit: string;
  status: 'normal' | 'elevated' | 'critical' | 'low';
  measuredAt?: string;
  referenceRange: string;
}

export interface VitalSignsGridProps {
  vitals: VitalSignItem[];
  patientAcuity?: 'Stable' | 'Guarded' | 'Urgent' | 'Critical';
  lastTaken?: string;
  onRecordNew?: () => void;
}

export const VitalSignsGrid: React.FC<VitalSignsGridProps> = ({
  vitals,
  patientAcuity,
  lastTaken,
  onRecordNew,
}) => {
  const getIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('heart') || n.includes('pulse')) return <Heart style={{ width: 15, height: 15, color: '#e11d48' }} />;
    if (n.includes('temp')) return <Thermometer style={{ width: 15, height: 15, color: '#f59e0b' }} />;
    if (n.includes('resp') || n.includes('spo2') || n.includes('oxygen')) return <Wind style={{ width: 15, height: 15, color: '#0ea5e9' }} />;
    if (n.includes('sugar') || n.includes('glucose')) return <Droplet style={{ width: 15, height: 15, color: '#8b5cf6' }} />;
    return <Activity style={{ width: 15, height: 15, color: 'var(--forest-brand)' }} />;
  };

  const getStatusBadge = (status: VitalSignItem['status']) => {
    switch (status) {
      case 'critical':
        return <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '0.15rem 0.45rem', borderRadius: 4, background: 'var(--danger-red-bg)', color: 'var(--danger-red)', border: '1px solid var(--danger-red-border)' }}>CRITICAL</span>;
      case 'elevated':
        return <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '0.15rem 0.45rem', borderRadius: 4, background: 'var(--warning-amber-bg)', color: 'var(--warning-amber)', border: '1px solid var(--warning-amber-border)' }}>HIGH</span>;
      case 'low':
        return <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '0.15rem 0.45rem', borderRadius: 4, background: 'var(--warning-amber-bg)', color: 'var(--warning-amber)', border: '1px solid var(--warning-amber-border)' }}>LOW</span>;
      default:
        return <span style={{ fontSize: '0.7rem', fontWeight: 600, padding: '0.15rem 0.45rem', borderRadius: 4, background: 'var(--clinical-green-bg)', color: 'var(--clinical-green)' }}>NORMAL</span>;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>Vital Signs</span>
          {patientAcuity && (
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                padding: '0.15rem 0.55rem',
                borderRadius: 'var(--radius-full)',
                background:
                  patientAcuity === 'Critical'
                    ? 'var(--danger-red-bg)'
                    : patientAcuity === 'Urgent'
                    ? 'var(--warning-amber-bg)'
                    : 'var(--clinical-green-bg)',
                color:
                  patientAcuity === 'Critical'
                    ? 'var(--danger-red)'
                    : patientAcuity === 'Urgent'
                    ? 'var(--warning-amber)'
                    : 'var(--clinical-green)',
                border: '1px solid currentColor',
              }}
            >
              Acuity: {patientAcuity}
            </span>
          )}
        </div>

        {lastTaken && (
          <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <Clock style={{ width: 12, height: 12 }} /> Last recorded: {lastTaken}
          </span>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem' }}>
        {vitals.map((v) => (
          <div
            key={v.id}
            style={{
              background: 'var(--bg-surface)',
              border: v.status === 'critical' ? '1px solid var(--danger-red)' : '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '0.85rem 1rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: 'var(--shadow-xs)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                {getIcon(v.name)}
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{v.name}</span>
              </div>
              {getStatusBadge(v.status)}
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem', margin: '0.2rem 0' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1.35rem', fontWeight: 700, color: v.status === 'critical' ? 'var(--danger-red)' : 'var(--text-primary)' }}>
                {v.value}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{v.unit}</span>
            </div>

            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              Ref: {v.referenceRange}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
