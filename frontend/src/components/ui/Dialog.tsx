import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { Button } from './Button';

export interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: number | string;
}

export const Dialog: React.FC<DialogProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  maxWidth = 540,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const resolveMaxWidth = (val: number | string) => {
    if (typeof val === 'number') return `${val}px`;
    if (val === 'sm') return '420px';
    if (val === 'md') return '540px';
    if (val === 'lg') return '680px';
    if (val === 'xl') return '840px';
    return val;
  };

  const dialogElement = (
    <div
      className="modal-backdrop"
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(7, 25, 20, 0.72)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '1.25rem',
      }}
    >
      <div
        className="modal-surface"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth,
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg, 14px)',
          boxShadow: 'var(--shadow-xl)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90vh',
          animation: 'modalSlideIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '1rem',
          }}
        >
          <div>
            <h3
              style={{
                fontSize: '1.1rem',
                fontWeight: 600,
                color: 'var(--text-primary)',
                letterSpacing: '-0.2px',
                margin: 0,
              }}
            >
              {title}
            </h3>
            {subtitle && (
              <p
                style={{
                  fontSize: '0.8rem',
                  color: 'var(--text-muted)',
                  marginTop: '0.25rem',
                  marginBottom: 0,
                }}
              >
                {subtitle}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="btn-ui btn-ghost-ui"
            style={{ padding: '0.35rem', color: 'var(--text-muted)' }}
            aria-label="Close dialog"
          >
            <X style={{ width: 16, height: 16 }} />
          </button>
        </div>

        {/* Content Body */}
        <div
          style={{
            padding: '1.5rem',
            overflowY: 'auto',
            flex: 1,
            color: 'var(--text-primary)',
            fontSize: '0.88rem',
            lineHeight: 1.55,
          }}
        >
          {children}
        </div>

        {/* Footer Actions */}
        {footer && (
          <div
            style={{
              padding: '1rem 1.5rem',
              borderTop: '1px solid var(--border-subtle)',
              background: 'var(--bg-surface-secondary)',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '0.75rem',
            }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
