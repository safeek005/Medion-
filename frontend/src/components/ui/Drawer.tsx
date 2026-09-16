import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  width?: number | string;
  footer?: React.ReactNode;
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  width = 460,
  footer,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const resolveWidth = (val: number | string) => {
    if (typeof val === 'number') return `${val}px`;
    if (val === 'sm') return '380px';
    if (val === 'md') return '460px';
    if (val === 'lg') return '640px';
    if (val === 'xl') return '800px';
    return val;
  };

  const drawerElement = (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(7, 25, 20, 0.65)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        justifyContent: 'flex-end',
        zIndex: 9999,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: resolveWidth(width),
          height: '100%',
          backgroundColor: 'var(--bg-surface)',
          borderLeft: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-xl)',
          display: 'flex',
          flexDirection: 'column',
          animation: 'drawerSlideIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
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
                  fontSize: '0.78rem',
                  color: 'var(--text-muted)',
                  marginTop: '0.2rem',
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
            aria-label="Close drawer"
          >
            <X style={{ width: 16, height: 16 }} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div
          style={{
            padding: '1.5rem',
            overflowY: 'auto',
            flex: 1,
            color: 'var(--text-primary)',
            fontSize: '0.88rem',
          }}
        >
          {children}
        </div>

        {/* Footer */}
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

  return typeof document !== 'undefined'
    ? createPortal(drawerElement, document.body)
    : drawerElement;
};
