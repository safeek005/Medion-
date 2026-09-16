import React from 'react';

export type StatusType = 'online' | 'active' | 'pending' | 'review' | 'completed' | 'critical' | 'offline';

export interface StatusIndicatorProps {
  status: StatusType | string;
  label?: string;
  pulse?: boolean;
  size?: 'sm' | 'md';
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  label,
  pulse = false,
  size = 'md',
}) => {
  const getStatusColor = (s: string) => {
    switch (s.toLowerCase()) {
      case 'online':
      case 'active':
      case 'completed':
      case 'approved':
      case 'operational':
        return { dot: 'var(--clinical-green, #059669)', bg: 'var(--clinical-green-bg, #ecfdf5)', text: 'var(--clinical-green, #059669)' };
      case 'pending':
      case 'scheduled':
      case 'review':
      case 'awaiting confirmation':
      case 'rescheduled':
        return { dot: 'var(--warning-amber, #d97706)', bg: 'var(--warning-amber-bg, #fffbeb)', text: 'var(--warning-amber, #d97706)' };
      case 'critical':
      case 'cancelled':
      case 'rejected':
      case 'error':
        return { dot: 'var(--danger-red, #dc2626)', bg: 'var(--danger-red-bg, #fef2f2)', text: 'var(--danger-red, #dc2626)' };
      default:
        return { dot: 'var(--sage-muted, #88a298)', bg: 'var(--bg-surface-secondary, #f0f4f2)', text: 'var(--text-secondary, #334e44)' };
    }
  };

  const colors = getStatusColor(status);
  const dotSize = size === 'sm' ? 6 : 8;

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.45rem',
        padding: size === 'sm' ? '0.15rem 0.45rem' : '0.22rem 0.65rem',
        borderRadius: 14,
        background: colors.bg,
        border: '1px solid var(--border-subtle)',
      }}
    >
      <span
        style={{
          width: dotSize,
          height: dotSize,
          borderRadius: '50%',
          backgroundColor: colors.dot,
          display: 'inline-block',
          boxShadow: pulse ? `0 0 0 2px ${colors.dot}33` : 'none',
        }}
      />
      {label && (
        <span
          style={{
            fontSize: size === 'sm' ? '0.7rem' : '0.76rem',
            fontWeight: 600,
            color: colors.text,
            letterSpacing: '0.2px',
          }}
        >
          {label}
        </span>
      )}
    </div>
  );
};
