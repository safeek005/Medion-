import React from 'react';

interface HumanResponseRendererProps {
  response: any;
  className?: string;
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

export const HumanResponseRenderer: React.FC<HumanResponseRendererProps> = ({ response, className }) => {
  const rawText = extractHumanReadableText(response);

  // Parse lines for rich formatting
  const lines = rawText.split('\n');

  return (
    <div
      className={className}
      style={{
        fontSize: '0.92rem',
        lineHeight: 1.65,
        color: 'var(--text-primary)',
        letterSpacing: '0.2px',
      }}
    >
      {lines.map((line, idx) => {
        const trimmed = line.trim();

        // Empty line -> spacing
        if (!trimmed) {
          return <div key={idx} style={{ height: '0.65rem' }} />;
        }

        // Section Headings (e.g. CLINICAL SUMMARY, Abnormal Findings:, Recommended Action:)
        if (
          trimmed.toUpperCase().startsWith('CLINICAL SUMMARY') ||
          trimmed.toUpperCase().startsWith('ABNORMAL FINDINGS') ||
          trimmed.toUpperCase().startsWith('NORMAL FINDINGS') ||
          trimmed.toUpperCase().startsWith('RECOMMENDED ACTION') ||
          trimmed.startsWith('[CLINICAL BRIEF]') ||
          trimmed.endsWith(':') && trimmed.length < 40
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
                  ? 'var(--forest-green, #15803d)'
                  : 'var(--text-primary)',
                marginTop: idx > 0 ? '0.75rem' : '0',
                marginBottom: '0.35rem',
                letterSpacing: '0.3px',
              }}
            >
              {trimmed}
            </div>
          );
        }

        // Bullet points (e.g. * Hemoglobin: 10.4 g/dL ... or - Total Cholesterol ...)
        if (trimmed.startsWith('*') || trimmed.startsWith('-') || trimmed.startsWith('•')) {
          const bulletContent = trimmed.replace(/^[\*\-•]\s*/, '');
          const isLow = bulletContent.includes('LOW') || bulletContent.includes('[LOW]');
          const isHigh = bulletContent.includes('HIGH') || bulletContent.includes('[HIGH]');
          const isNormal = bulletContent.includes('NORMAL') || bulletContent.includes('[NORMAL]');

          return (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.5rem',
                margin: '0.25rem 0 0.25rem 0.5rem',
              }}
            >
              <span
                style={{
                  color: isLow || isHigh
                    ? 'var(--danger-red, #dc2626)'
                    : isNormal
                    ? 'var(--forest-green, #15803d)'
                    : 'var(--forest-green, #0f766e)',
                  fontWeight: 800,
                  fontSize: '1rem',
                  lineHeight: '1.2',
                }}
              >
                •
              </span>
              <div style={{ flex: 1 }}>
                {bulletContent}
              </div>
            </div>
          );
        }

        // Standard Paragraph text
        return (
          <p key={idx} style={{ margin: '0.25rem 0' }}>
            {trimmed}
          </p>
        );
      })}
    </div>
  );
};
