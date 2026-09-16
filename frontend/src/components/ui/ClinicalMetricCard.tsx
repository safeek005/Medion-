import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export interface ClinicalMetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  trend?: {
    direction: 'up' | 'down' | 'neutral';
    text: string;
    isPositive?: boolean;
  };
  status?: 'normal' | 'warning' | 'critical';
  subtext?: string;
  icon?: React.ReactNode;
  style?: React.CSSProperties;
}

export const ClinicalMetricCard: React.FC<ClinicalMetricCardProps> = ({
  label,
  value,
  unit,
  trend,
  status = 'normal',
  subtext,
  icon,
  style,
}) => {
  let statusColor = 'var(--text-primary)';
  let borderColor = 'var(--border-subtle)';
  let indicatorColor = 'var(--forest-brand)';

  if (status === 'warning') {
    statusColor = 'var(--warning-amber)';
    borderColor = 'var(--warning-amber-border)';
    indicatorColor = 'var(--warning-amber)';
  } else if (status === 'critical') {
    statusColor = 'var(--danger-red)';
    borderColor = 'var(--danger-red-border)';
    indicatorColor = 'var(--danger-red)';
  }

  return (
    <div
      style={{
        background: 'var(--bg-surface)',
        border: `1px solid ${borderColor}`,
        borderRadius: 'var(--radius-md)',
        padding: '1.25rem 1.4rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-xs)',
        ...style,
      }}
    >
      {/* Subtle top indicator bar */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: indicatorColor,
          opacity: status === 'normal' ? 0.3 : 1,
        }}
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.65rem' }}>
        <span
          style={{
            fontSize: '0.74rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: 'var(--text-muted)',
          }}
        >
          {label}
        </span>
        {icon && (
          <div style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
            {icon}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem', marginBottom: '0.4rem' }}>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '1.85rem',
            fontWeight: 700,
            letterSpacing: '-0.03em',
            color: statusColor,
            lineHeight: 1,
          }}
        >
          {value}
        </span>
        {unit && (
          <span style={{ fontSize: '0.82rem', fontWeight: 500, color: 'var(--text-muted)' }}>
            {unit}
          </span>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.74rem' }}>
        {trend && (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
              fontWeight: 600,
              color:
                trend.direction === 'neutral'
                  ? 'var(--text-muted)'
                  : trend.isPositive
                  ? 'var(--clinical-green)'
                  : 'var(--danger-red)',
            }}
          >
            {trend.direction === 'up' && <TrendingUp style={{ width: 12, height: 12 }} />}
            {trend.direction === 'down' && <TrendingDown style={{ width: 12, height: 12 }} />}
            {trend.direction === 'neutral' && <Minus style={{ width: 12, height: 12 }} />}
            <span>{trend.text}</span>
          </div>
        )}
        {subtext && (
          <span style={{ color: 'var(--text-muted)', marginLeft: 'auto' }}>
            {subtext}
          </span>
        )}
      </div>
    </div>
  );
};
