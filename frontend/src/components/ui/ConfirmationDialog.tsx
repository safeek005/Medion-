import React from 'react';
import { ShieldCheck, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Dialog } from './Dialog';
import { Button } from './Button';

export interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  subtitle?: string;
  summary: string;
  details?: Record<string, string | number | undefined | null>;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  loading?: boolean;
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  subtitle = 'Clinical review & authorization required before execution.',
  summary,
  details,
  confirmLabel = 'Confirm & Authorize Execution',
  cancelLabel = 'Cancel & Dismiss',
  isDestructive = false,
  loading = false,
}) => {
  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      subtitle={subtitle}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button
            variant={isDestructive ? 'destructive' : 'primary'}
            onClick={onConfirm}
            loading={loading}
          >
            <ShieldCheck style={{ width: 14, height: 14 }} />
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* Recommendation Notice */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem',
            padding: '0.85rem 1rem',
            borderRadius: 'var(--radius-md, 8px)',
            background: 'var(--clinical-green-bg, #ecfdf5)',
            border: '1px solid var(--clinical-green-border, rgba(5, 150, 105, 0.25))',
            color: 'var(--clinical-green, #059669)',
            fontSize: '0.82rem',
          }}
        >
          <ShieldCheck style={{ width: 18, height: 18, flexShrink: 0, marginTop: 1 }} />
          <div>
            <div style={{ fontWeight: 600 }}>Clinician Authorization Protocol</div>
            <div style={{ opacity: 0.9, marginTop: '0.15rem' }}>
              AI assists. Clinicians decide. Explicit authorization required before committing this sensitive order.
            </div>
          </div>
        </div>

        {/* Action Summary */}
        <div>
          <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.35rem' }}>
            Action Summary
          </div>
          <div style={{ fontSize: '0.92rem', color: 'var(--text-primary)', lineHeight: 1.5, fontWeight: 500 }}>
            {summary}
          </div>
        </div>

        {/* Action Parameters Table */}
        {details && Object.keys(details).length > 0 && (
          <div
            style={{
              background: 'var(--bg-surface-secondary)',
              borderRadius: 'var(--radius-md, 8px)',
              padding: '0.85rem 1rem',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.5rem' }}>
              Parameters to Execute
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              {Object.entries(details).map(([key, val]) => (
                <div key={key} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                  <span style={{ color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                    {key.replace(/_/g, ' ')}:
                  </span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                    {val != null ? String(val) : '—'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Dialog>
  );
};
