import React from 'react';
import {
  AppointmentResultCard,
  LabReportResultCard,
  InsuranceResultCard,
  PatientResultCard,
  ClarificationCard,
  ErrorResponseCard
} from './cards';

interface HumanResponseRendererProps {
  response: any;
  className?: string;
  onSelectPrompt?: (prompt: string) => void;
  onRetry?: () => void;
}

export function extractHumanReadableText(response: any): string {
  if (!response) return 'No response received.';
  if (typeof response === 'string') return response;

  // 1. response.output.summary
  if (response.output?.summary && typeof response.output.summary === 'string') {
    return response.output.summary;
  }

  // 2. response.result.summary or nested
  if (response.result?.summary && typeof response.result.summary === 'string') {
    return response.result.summary;
  }
  if (response.result?.output?.summary && typeof response.result.output.summary === 'string') {
    return response.result.output.summary;
  }

  // 3. response.output.result_data.formatted_text or response.result.formatted_text
  if (response.output?.result_data?.formatted_text && typeof response.output.result_data.formatted_text === 'string') {
    return response.output.result_data.formatted_text;
  }
  if (response.result?.formatted_text && typeof response.result.formatted_text === 'string') {
    return response.result.formatted_text;
  }
  if (response.result?.result_data?.formatted_text && typeof response.result.result_data.formatted_text === 'string') {
    return response.result.result_data.formatted_text;
  }

  // 4. response.output.result_data.explanation or response.result.explanation
  if (response.output?.result_data?.explanation && typeof response.output.result_data.explanation === 'string') {
    return response.output.result_data.explanation;
  }
  if (response.result?.explanation && typeof response.result.explanation === 'string') {
    return response.result.explanation;
  }
  if (response.result?.result_data?.explanation && typeof response.result.result_data.explanation === 'string') {
    return response.result.result_data.explanation;
  }

  // 5. Message fallbacks
  if (response.output?.message && typeof response.output.message === 'string') return response.output.message;
  if (response.result?.message && typeof response.result.message === 'string') return response.result.message;
  if (response.message && typeof response.message === 'string') return response.message;

  // 6. Plain string result
  if (typeof response.result === 'string') return response.result;

  return 'MEDION successfully processed your clinical request.';
}

export const HumanResponseRenderer: React.FC<HumanResponseRendererProps> = ({
  response,
  className,
  onSelectPrompt,
  onRetry
}) => {
  // 1. Error state check
  if (response?.success === false || (response?.errors && response.errors.length > 0)) {
    const errorMsg = response?.errors?.[0] || response?.error || 'Unable to complete clinical request.';
    return <ErrorResponseCard message={errorMsg} onRetry={onRetry} />;
  }

  // Extract structured result data
  const resultData = response?.output?.result_data ||
                     response?.result?.result_data ||
                     response?.result_data ||
                     response?.output ||
                     response?.result ||
                     {};

  const summary = extractHumanReadableText(response);

  // 2. Clarification Card
  if (resultData?.needs_clarification || response?.output?.needs_clarification) {
    const question = resultData?.clarification_question || summary;
    const options = resultData?.ambiguous_options;
    return (
      <ClarificationCard
        question={question}
        options={options}
        onSelectOption={(opt) => onSelectPrompt && onSelectPrompt(opt)}
      />
    );
  }

  // 3. Appointment Result Card
  if (resultData?.appointment || resultData?.available_slots || response?.target_agent === 'appointment') {
    return (
      <AppointmentResultCard
        data={resultData}
        summary={summary}
        onSelectSlot={(slot, date, doc) => {
          if (onSelectPrompt) {
            onSelectPrompt(`Book me with ${doc} on ${date} at ${slot}`);
          }
        }}
      />
    );
  }

  // 4. Lab Report Result Card
  if (resultData?.abnormal_findings || resultData?.test_results || resultData?.report_summary || response?.target_agent === 'medical') {
    return <LabReportResultCard data={resultData} summary={summary} />;
  }

  // 5. Insurance Result Card
  if (resultData?.policy || resultData?.claim || resultData?.eligible !== undefined || response?.target_agent === 'insurance') {
    return <InsuranceResultCard data={resultData} summary={summary} />;
  }

  // 6. Patient Result Card
  if (resultData?.patient || resultData?.medical_records || response?.target_agent === 'patient') {
    return <PatientResultCard data={resultData} summary={summary} />;
  }

  // 7. Generic / Fallback Text Renderer with section formatting
  const lines = summary.split('\n');

  return (
    <div
      className={className}
      style={{
        fontSize: '0.92rem',
        lineHeight: 1.65,
        color: 'var(--text-primary)',
        letterSpacing: '0.2px',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg, 12px)',
        padding: '1.25rem',
        marginTop: '0.75rem',
        boxShadow: 'var(--shadow-sm)'
      }}
    >
      {lines.map((line, idx) => {
        const trimmed = line.trim();

        if (!trimmed) {
          return <div key={idx} style={{ height: '0.65rem' }} />;
        }

        if (
          trimmed.toUpperCase().startsWith('CLINICAL SUMMARY') ||
          trimmed.toUpperCase().startsWith('ABNORMAL FINDINGS') ||
          trimmed.toUpperCase().startsWith('NORMAL FINDINGS') ||
          trimmed.toUpperCase().startsWith('RECOMMENDED ACTION') ||
          trimmed.startsWith('[CLINICAL BRIEF]') ||
          (trimmed.endsWith(':') && trimmed.length < 40)
        ) {
          const isAbnormalHeader = trimmed.toUpperCase().includes('ABNORMAL');
          const isNormalHeader = trimmed.toUpperCase().includes('NORMAL');
          return (
            <div
              key={idx}
              style={{
                fontWeight: 700,
                fontSize: '0.95rem',
                color: isAbnormalHeader
                  ? 'var(--danger-red, #dc2626)'
                  : isNormalHeader
                  ? 'var(--forest-green, #10b981)'
                  : 'var(--text-primary)',
                marginTop: idx > 0 ? '0.65rem' : '0',
                marginBottom: '0.35rem',
                letterSpacing: '0.3px',
              }}
            >
              {trimmed}
            </div>
          );
        }

        if (trimmed.startsWith('* ') || trimmed.startsWith('• ') || trimmed.startsWith('- ')) {
          const itemText = trimmed.replace(/^[\*\•\-]\s*/, '');
          const isAbnormal = itemText.toUpperCase().includes('STATUS: HIGH') || itemText.toUpperCase().includes('STATUS: LOW');

          return (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: '0.5rem',
                paddingLeft: '0.75rem',
                marginBottom: '0.25rem',
                color: isAbnormal ? 'var(--danger-red, #dc2626)' : 'var(--text-secondary)',
              }}
            >
              <span style={{ fontSize: '0.75rem', color: isAbnormal ? 'var(--danger-red)' : 'var(--forest-green)' }}>
                ●
              </span>
              <span>{itemText}</span>
            </div>
          );
        }

        return (
          <div key={idx} style={{ marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
            {trimmed}
          </div>
        );
      })}
    </div>
  );
};
