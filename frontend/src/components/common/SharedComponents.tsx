import React from 'react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, badge, actions }) => {
  return (
    <div style={{ marginBottom: '1.75rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
          <h2 className="h2">{title}</h2>
          {badge}
        </div>
        {subtitle && <p className="text-muted" style={{ fontSize: '0.85rem' }}>{subtitle}</p>}
      </div>
      {actions && <div style={{ display: 'flex', gap: '0.5rem' }}>{actions}</div>}
    </div>
  );
};

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ title, subtitle, actions }) => {
  return (
    <div className="section-header">
      <div>
        <h3 className="h3">{title}</h3>
        {subtitle && <p className="text-muted" style={{ fontSize: '0.78rem', marginTop: '0.15rem' }}>{subtitle}</p>}
      </div>
      {actions && <div style={{ display: 'flex', gap: '0.5rem' }}>{actions}</div>}
    </div>
  );
};

interface TimelineProps {
  steps: Array<{ label: string; sublabel?: string; status: 'completed' | 'active' | 'pending' }>;
}

export const Timeline: React.FC<TimelineProps> = ({ steps }) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 0' }}>
      {steps.map((step, idx) => {
        const isCompleted = step.status === 'completed';
        const isActive = step.status === 'active';
        const isPending = step.status === 'pending';

        return (
          <React.Fragment key={idx}>
            <div style={{ textAlign: 'center', flex: 1 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: isCompleted ? 'var(--forest-green-light)' : isActive ? 'var(--forest-green-light)' : 'var(--bg-app)',
                  color: isCompleted || isActive ? 'var(--forest-green)' : 'var(--text-muted)',
                  border: isPending ? '1px solid var(--border-strong)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 0.35rem',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                }}
              >
                {isCompleted ? '✓' : isActive ? '●' : '○'}
              </div>
              <div style={{ fontWeight: 600, fontSize: '0.8rem', color: isActive ? 'var(--forest-green)' : 'var(--text-primary)' }}>
                {step.label}
              </div>
              {step.sublabel && <div className="text-muted" style={{ fontSize: '0.72rem' }}>{step.sublabel}</div>}
            </div>
            {idx < steps.length - 1 && (
              <div style={{ flex: 1, height: 2, background: isCompleted ? 'var(--forest-green)' : 'var(--border-subtle)', margin: '0 0.5rem' }}></div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

interface EmptyStateProps {
  title: string;
  message: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ title, message }) => {
  return (
    <div style={{ textAlign: 'center', padding: '3rem 1.5rem', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 10, color: 'var(--text-muted)' }}>
      <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: '0.35rem' }}>{title}</div>
      <div style={{ fontSize: '0.82rem' }}>{message}</div>
    </div>
  );
};
