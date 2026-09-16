import React from 'react';
import { Calendar, Stethoscope, FlaskConical, Pill, ShieldCheck, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { Badge } from './Badge';

export interface TimelineEvent {
  id: string;
  date: string;
  time?: string;
  title: string;
  type: 'encounter' | 'lab' | 'medication' | 'insurance' | 'vital' | 'alert';
  clinician?: string;
  facility?: string;
  description?: string;
  status?: string;
  statusVariant?: 'green' | 'amber' | 'red' | 'neutral' | 'brand';
  metadata?: Record<string, string>;
}

export interface CareTimelineProps {
  events: TimelineEvent[];
  title?: string;
  subtitle?: string;
  maxItems?: number;
  onEventClick?: (event: TimelineEvent) => void;
}

export const CareTimeline: React.FC<CareTimelineProps> = ({
  events,
  title,
  subtitle,
  maxItems,
  onEventClick,
}) => {
  const displayEvents = maxItems ? events.slice(0, maxItems) : events;

  const getEventIcon = (type: TimelineEvent['type']) => {
    switch (type) {
      case 'encounter':
        return <Stethoscope style={{ width: 14, height: 14, color: 'var(--forest-brand)' }} />;
      case 'lab':
        return <FlaskConical style={{ width: 14, height: 14, color: '#0284c7' }} />;
      case 'medication':
        return <Pill style={{ width: 14, height: 14, color: '#7c3aed' }} />;
      case 'insurance':
        return <ShieldCheck style={{ width: 14, height: 14, color: 'var(--clinical-green)' }} />;
      case 'alert':
        return <AlertCircle style={{ width: 14, height: 14, color: 'var(--danger-red)' }} />;
      default:
        return <Clock style={{ width: 14, height: 14, color: 'var(--text-muted)' }} />;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      {(title || subtitle) && (
        <div style={{ marginBottom: '1.25rem' }}>
          {title && <h3 className="h3" style={{ margin: 0 }}>{title}</h3>}
          {subtitle && <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.2rem 0 0' }}>{subtitle}</p>}
        </div>
      )}

      <div style={{ position: 'relative', paddingLeft: '1.75rem' }}>
        {/* Continuous vertical spine */}
        <div
          style={{
            position: 'absolute',
            top: '0.5rem',
            bottom: '0.5rem',
            left: '0.55rem',
            width: 2,
            background: 'var(--border-subtle)',
          }}
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {displayEvents.map((evt) => (
            <div
              key={evt.id}
              onClick={() => onEventClick && onEventClick(evt)}
              style={{
                position: 'relative',
                cursor: onEventClick ? 'pointer' : 'default',
              }}
            >
              {/* Event node badge */}
              <div
                style={{
                  position: 'absolute',
                  left: '-1.75rem',
                  top: '0.15rem',
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  background: 'var(--bg-surface)',
                  border: '2px solid var(--border-strong)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: 'var(--shadow-xs)',
                }}
              >
                {getEventIcon(evt.type)}
              </div>

              {/* Event Card Body */}
              <div
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem 1.15rem',
                  boxShadow: 'var(--shadow-xs)',
                  transition: 'border-color 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  if (onEventClick) e.currentTarget.style.borderColor = 'var(--forest-brand)';
                }}
                onMouseLeave={(e) => {
                  if (onEventClick) e.currentTarget.style.borderColor = 'var(--border-subtle)';
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '0.35rem' }}>
                  <div>
                    <span style={{ fontWeight: 600, fontSize: '0.92rem', color: 'var(--text-primary)' }}>
                      {evt.title}
                    </span>
                    {evt.clinician && (
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block', marginTop: '0.15rem' }}>
                        {evt.clinician} {evt.facility ? `• ${evt.facility}` : ''}
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                    {evt.status && (
                      <Badge variant={evt.statusVariant || 'neutral'}>
                        {evt.status}
                      </Badge>
                    )}
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      {evt.date} {evt.time ? `(${evt.time})` : ''}
                    </span>
                  </div>
                </div>

                {evt.description && (
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '0.4rem 0 0', lineHeight: 1.5 }}>
                    {evt.description}
                  </p>
                )}

                {evt.metadata && (
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '0.65rem', paddingTop: '0.5rem', borderTop: '1px dashed var(--border-subtle)', flexWrap: 'wrap' }}>
                    {Object.entries(evt.metadata).map(([k, v]) => (
                      <div key={k} style={{ fontSize: '0.74rem' }}>
                        <span style={{ color: 'var(--text-muted)', textTransform: 'capitalize' }}>{k}: </span>
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{v}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
