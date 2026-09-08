import React from 'react';
import { HelpCircle, ArrowRight } from 'lucide-react';

interface ClarificationCardProps {
  question: string;
  options?: string[];
  onSelectOption?: (option: string) => void;
}

export const ClarificationCard: React.FC<ClarificationCardProps> = ({ question, options, onSelectOption }) => {
  // Extract default options if none passed
  const displayOptions = options && options.length > 0 ? options : (
    question.toLowerCase().includes('doctor') ? [
      'Dr. Rajesh Mehta (Cardiology)',
      'Dr. Anita Deshmukh (Endocrinology)',
      'Dr. Suresh Rao (General Medicine)'
    ] : question.toLowerCase().includes('time') || question.toLowerCase().includes('date') ? [
      'Tomorrow at 10 AM',
      'Tomorrow at 2 PM',
      'Next available slot'
    ] : question.toLowerCase().includes('insurance') || question.toLowerCase().includes('claim') ? [
      'Verify Eligibility',
      'Check Coverage Limit',
      'Prepare a Claim'
    ] : []
  );

  return (
    <div className="result-card clarification-card" style={{
      background: 'rgba(59, 130, 246, 0.04)',
      border: '1px solid rgba(59, 130, 246, 0.25)',
      borderRadius: 'var(--radius-lg, 12px)',
      padding: '1.25rem',
      marginTop: '0.75rem',
      boxShadow: 'var(--shadow-sm)'
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '1rem' }}>
        <div style={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          background: 'rgba(59, 130, 246, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          <HelpCircle style={{ width: 18, height: 18, color: '#2563eb' }} />
        </div>
        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            MEDION Clarification Required
          </span>
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.92rem', lineHeight: 1.5, color: 'var(--text-primary)', fontWeight: 500 }}>
            {question}
          </p>
        </div>
      </div>

      {displayOptions.length > 0 && (
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.4rem' }}>
            Suggested Answers (Click to select):
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
            {displayOptions.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => onSelectOption && onSelectOption(opt)}
                className="btn-ui btn-secondary-ui"
                style={{
                  fontSize: '0.82rem',
                  padding: '0.4rem 0.8rem',
                  borderRadius: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  borderColor: 'rgba(59, 130, 246, 0.3)',
                  background: 'var(--bg-surface)'
                }}
              >
                <span>{opt}</span>
                <ArrowRight style={{ width: 12, height: 12, color: '#2563eb' }} />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
