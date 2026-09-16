import React from 'react';
import { AlertCircle, RefreshCw, FolderSearch } from 'lucide-react';
import { Button } from './Button';

export interface EmptyStateProps {
  title?: string;
  message: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No Records Available',
  message,
  icon,
  action,
}) => {
  return (
    <div
      style={{
        textAlign: 'center',
        padding: '3rem 1.5rem',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg, 12px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: '50%',
          backgroundColor: 'var(--bg-surface-secondary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-muted)',
          marginBottom: '0.85rem',
        }}
      >
        {icon || <FolderSearch style={{ width: 22, height: 22 }} />}
      </div>
      <h4
        style={{
          fontSize: '0.95rem',
          fontWeight: 600,
          color: 'var(--text-primary)',
          margin: '0 0 0.35rem',
        }}
      >
        {title}
      </h4>
      <p
        style={{
          fontSize: '0.82rem',
          color: 'var(--text-muted)',
          maxWidth: 380,
          margin: 0,
          lineHeight: 1.5,
        }}
      >
        {message}
      </p>
      {action && (
        <div style={{ marginTop: '1.25rem' }}>
          <Button variant="secondary" size="sm" onClick={action.onClick}>
            {action.label}
          </Button>
        </div>
      )}
    </div>
  );
};

export interface ErrorBannerProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export const ErrorBanner: React.FC<ErrorBannerProps> = ({
  title = 'Unable to Load Clinical Data',
  message,
  onRetry,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: '1rem',
        padding: '1rem 1.25rem',
        borderRadius: 'var(--radius-md, 10px)',
        backgroundColor: 'var(--danger-red-bg, #fef2f2)',
        border: '1px solid var(--danger-red-border, rgba(220, 38, 38, 0.25))',
        color: 'var(--danger-red, #dc2626)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
        <AlertCircle style={{ width: 18, height: 18, marginTop: 2, flexShrink: 0 }} />
        <div>
          <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{title}</div>
          <div style={{ fontSize: '0.8rem', opacity: 0.9, marginTop: '0.2rem' }}>{message}</div>
        </div>
      </div>
      {onRetry && (
        <Button
          variant="secondary"
          size="sm"
          onClick={onRetry}
          style={{
            borderColor: 'var(--danger-red-border)',
            color: 'var(--danger-red)',
            backgroundColor: 'transparent',
            flexShrink: 0,
          }}
        >
          <RefreshCw style={{ width: 13, height: 13 }} /> Retry
        </Button>
      )}
    </div>
  );
};

export interface SkeletonProps {
  lines?: number;
  height?: number | string;
  width?: number | string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  lines = 1,
  height = 20,
  width = '100%',
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%' }}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          style={{
            height,
            width: i === lines - 1 && lines > 1 ? '70%' : width,
            backgroundColor: 'var(--border-subtle)',
            borderRadius: 'var(--radius-sm, 6px)',
            animation: 'skeletonPulse 1.5s ease-in-out infinite',
          }}
        />
      ))}
    </div>
  );
};

export const TableSkeleton: React.FC<{ rows?: number; columns?: number }> = ({
  rows = 5,
  columns = 5,
}) => {
  return (
    <div style={{ width: '100%', overflowX: 'auto', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
      <div style={{ padding: '0.85rem 1rem', background: 'var(--bg-surface-secondary)', display: 'grid', gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: '1rem' }}>
        {Array.from({ length: columns }).map((_, c) => (
          <div key={c} style={{ height: 14, background: 'var(--border-subtle)', borderRadius: 4 }} />
        ))}
      </div>
      <div style={{ padding: '0.5rem 1rem' }}>
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} style={{ display: 'grid', gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: '1rem', padding: '0.75rem 0', borderBottom: r !== rows - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
            {Array.from({ length: columns }).map((_, c) => (
              <div key={c} style={{ height: 16, width: c === 0 ? '60%' : '80%', background: 'var(--border-subtle)', borderRadius: 4, opacity: 0.6 }} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export const MetricGridSkeleton: React.FC<{ count?: number }> = ({ count = 4 }) => {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fit, minmax(200px, 1fr))`, gap: '1rem', marginBottom: '1.25rem' }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="metric-strip-card" style={{ padding: '1rem 1.25rem' }}>
          <div style={{ height: 12, width: '50%', background: 'var(--border-subtle)', borderRadius: 4, marginBottom: '0.5rem' }} />
          <div style={{ height: 28, width: '40%', background: 'var(--border-subtle)', borderRadius: 4, marginBottom: '0.35rem' }} />
          <div style={{ height: 10, width: '70%', background: 'var(--border-subtle)', borderRadius: 4, opacity: 0.6 }} />
        </div>
      ))}
    </div>
  );
};
