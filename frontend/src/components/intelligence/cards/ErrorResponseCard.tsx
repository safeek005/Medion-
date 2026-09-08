import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

interface ErrorResponseCardProps {
  message?: string;
  onRetry?: () => void;
}

export const ErrorResponseCard: React.FC<ErrorResponseCardProps> = ({ message, onRetry }) => {
  const displayMsg = message || "I couldn't retrieve the healthcare information right now. Please verify your query or try again.";

  return (
    <div className="result-card error-card" style={{
      background: 'rgba(239, 68, 68, 0.04)',
      border: '1px solid rgba(239, 68, 68, 0.2)',
      borderRadius: 'var(--radius-lg, 12px)',
      padding: '1.25rem',
      marginTop: '0.75rem',
      boxShadow: 'var(--shadow-sm)'
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
        <div style={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          background: 'rgba(239, 68, 68, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          <AlertCircle style={{ width: 18, height: 18, color: 'var(--danger-red, #dc2626)' }} />
        </div>
        <div style={{ flex: 1 }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--danger-red, #dc2626)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Clinical Service Notice
          </span>
          <p style={{ margin: '0.25rem 0 0.75rem', fontSize: '0.9rem', lineHeight: 1.5, color: 'var(--text-primary)' }}>
            {displayMsg}
          </p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="btn-ui btn-secondary-ui"
              style={{
                fontSize: '0.78rem',
                padding: '0.35rem 0.75rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                borderRadius: '6px'
              }}
            >
              <RotateCcw style={{ width: 12, height: 12 }} /> Retry Query
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
