import React from 'react';
import { Activity, AlertTriangle, CheckCircle2, FileText, Info } from 'lucide-react';

interface LabReportResultCardProps {
  data: any;
  summary?: string;
}

export const LabReportResultCard: React.FC<LabReportResultCardProps> = ({ data, summary }) => {
  const abnormal = data?.abnormal_findings || [];
  const normal = data?.normal_findings || [];
  const reportSummary = data?.report_summary || {};
  const reportId = data?.report_id || reportSummary?.report_id || 'LABR-1001';
  const testName = reportSummary?.test_name || data?.test_name || 'Laboratory Analysis';
  const patientName = data?.patient_name || reportSummary?.patient_name || 'Patient';
  const priority = data?.priority || (abnormal.length > 0 ? 'HIGH' : 'NORMAL');
  const safetyNote = data?.safety_note || 'Informational analysis based on synthetic health records. Not a medical diagnosis.';

  return (
    <div className="result-card lab-card" style={{
      background: 'var(--bg-surface)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-lg, 12px)',
      padding: '1.25rem',
      marginTop: '0.75rem',
      boxShadow: 'var(--shadow-sm)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-subtle)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span className="badge-ui badge-green" style={{ fontSize: '0.72rem', textTransform: 'uppercase' }}>
              Lab Intelligence
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {reportId}
            </span>
          </div>
          <h4 style={{ fontSize: '1.05rem', fontWeight: 600, margin: 0, color: 'var(--text-primary)' }}>
            {testName}
          </h4>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Patient: {patientName}
          </span>
        </div>
        <span className={`badge-ui ${priority === 'HIGH' ? 'badge-amber' : 'badge-green'}`} style={{ fontSize: '0.75rem' }}>
          {priority} PRIORITY
        </span>
      </div>

      {/* Abnormal Findings Table */}
      {abnormal.length > 0 && (
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', fontWeight: 700, color: 'var(--danger-red, #dc2626)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.5rem' }}>
            <AlertTriangle style={{ width: 14, height: 14 }} />
            Flagged Values ({abnormal.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {abnormal.map((item: any, idx: number) => (
              <div key={idx} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.55rem 0.85rem',
                background: 'rgba(239, 68, 68, 0.05)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                borderRadius: '8px'
              }}>
                <div>
                  <span style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                    {item.parameter}
                  </span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block' }}>
                    Ref: {item.reference_range}
                  </span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--danger-red, #dc2626)' }}>
                    {item.value}
                  </span>
                  <span className="badge-ui badge-red" style={{ fontSize: '0.68rem', marginLeft: '0.5rem', padding: '0.15rem 0.4rem' }}>
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Normal Findings */}
      {normal.length > 0 && (
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', fontWeight: 700, color: 'var(--forest-green, #10b981)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.4rem' }}>
            <CheckCircle2 style={{ width: 14, height: 14 }} />
            Normal Parameters ({normal.length})
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            {normal.map((item: any, idx: number) => (
              <div key={idx} style={{
                padding: '0.35rem 0.65rem',
                background: 'var(--bg-muted, rgba(0,0,0,0.02))',
                border: '1px solid var(--border-subtle)',
                borderRadius: '6px',
                fontSize: '0.8rem',
                color: 'var(--text-secondary)'
              }}>
                <span style={{ fontWeight: 500 }}>{item.parameter}: </span>
                <span style={{ color: 'var(--text-primary)' }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Clinical Summary */}
      {summary && (
        <div style={{
          fontSize: '0.86rem',
          lineHeight: 1.55,
          color: 'var(--text-secondary)',
          background: 'var(--bg-muted, rgba(0,0,0,0.02))',
          padding: '0.75rem 1rem',
          borderRadius: '8px',
          marginBottom: '0.75rem'
        }}>
          {summary}
        </div>
      )}

      {/* Healthcare Safety Disclaimer */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--text-muted)', paddingTop: '0.5rem', borderTop: '1px solid var(--border-subtle)' }}>
        <Info style={{ width: 13, height: 13, flexShrink: 0, color: 'var(--forest-green)' }} />
        <span>{safetyNote}</span>
      </div>
    </div>
  );
};
