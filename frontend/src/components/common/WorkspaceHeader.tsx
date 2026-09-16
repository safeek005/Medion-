import React from 'react';
import { Badge } from '../ui/Badge';
import { StatusIndicator } from '../ui/StatusIndicator';
import { Building2, ChevronRight, Sparkles } from 'lucide-react';

export interface WorkspaceHeaderProps {
  title: string;
  subtitle?: string;
  facility?: string;
  department?: string;
  statusText?: string;
  statusVariant?: 'online' | 'active' | 'pending' | 'critical' | 'neutral';
  actions?: React.ReactNode;
  metrics?: Array<{ label: string; value: string | number; accent?: string }>;
}

export const WorkspaceHeader: React.FC<WorkspaceHeaderProps> = ({
  title,
  subtitle,
  facility = 'HOSP-001 (Main Campus)',
  department,
  statusText = 'Operational',
  statusVariant = 'active',
  actions,
  metrics,
}) => {
  return (
    <div
      style={{
        marginBottom: '1.75rem',
        paddingBottom: '1.25rem',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.85rem',
      }}
    >
      {/* Top Clinical Breadcrumb & Facility Context */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
          fontSize: '0.76rem',
          color: 'var(--text-muted)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 500 }}>
          <Building2 style={{ width: 14, height: 14, color: 'var(--forest-brand)' }} />
          <span>{facility}</span>
          {department && (
            <>
              <ChevronRight style={{ width: 12, height: 12, color: 'var(--border-strong)' }} />
              <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{department}</span>
            </>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <StatusIndicator status={statusVariant} label={statusText} pulse />
          <span style={{ color: 'var(--border-strong)' }}>•</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem' }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        </div>
      </div>

      {/* Main Title Row & Actions */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h1
            style={{
              fontSize: '1.65rem',
              fontWeight: 700,
              letterSpacing: '-0.03em',
              color: 'var(--text-primary)',
              lineHeight: 1.25,
              margin: 0,
            }}
          >
            {title}
          </h1>
          {subtitle && (
            <p
              style={{
                fontSize: '0.86rem',
                color: 'var(--text-secondary)',
                margin: '0.35rem 0 0',
                lineHeight: 1.45,
                maxWidth: 640,
              }}
            >
              {subtitle}
            </p>
          )}
        </div>

        {actions && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
            {actions}
          </div>
        )}
      </div>

      {/* Optional Compact Clinical Metrics Strip */}
      {metrics && metrics.length > 0 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1.5rem',
            paddingTop: '0.85rem',
            borderTop: '1px dashed var(--border-subtle)',
            flexWrap: 'wrap',
          }}
        >
          {metrics.map((m, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)' }}>
                {m.label}:
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.92rem',
                  fontWeight: 700,
                  color: m.accent || 'var(--text-primary)',
                }}
              >
                {m.value}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
