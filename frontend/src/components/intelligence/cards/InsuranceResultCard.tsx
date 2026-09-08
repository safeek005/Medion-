import React from 'react';
import { ShieldCheck, FileCheck, DollarSign, AlertCircle, Building2 } from 'lucide-react';

interface InsuranceResultCardProps {
  data: any;
  summary?: string;
}

export const InsuranceResultCard: React.FC<InsuranceResultCardProps> = ({ data, summary }) => {
  const policy = data?.policy || {};
  const claim = data?.claim || {};
  const isClaim = Boolean(data?.claim_id || claim?.claim_id);

  if (isClaim) {
    const claimId = data?.claim_id || claim?.claim_id;
    const status = data?.status || claim?.status || 'SUBMITTED';
    const approved = data?.approved_amount ?? claim?.approved_amount;
    const claimed = claim?.claim_amount;
    const notes = claim?.adjudication_notes || data?.adjudication_notes;

    return (
      <div className="result-card insurance-card" style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg, 12px)',
        padding: '1.25rem',
        marginTop: '0.75rem',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileCheck style={{ width: 18, height: 18, color: 'var(--forest-green)' }} />
            <span style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
              Insurance Claim {claimId}
            </span>
          </div>
          <span className="badge-ui badge-green" style={{ fontSize: '0.75rem' }}>
            {status}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.85rem', marginBottom: '1rem' }}>
          {claimed !== undefined && (
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Claimed Amount</span>
              <span style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--text-primary)' }}>
                ${Number(claimed).toLocaleString()}
              </span>
            </div>
          )}
          {approved !== undefined && (
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Approved Amount</span>
              <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--forest-green)' }}>
                ${Number(approved).toLocaleString()}
              </span>
            </div>
          )}
          {notes && (
            <div style={{ gridColumn: '1 / -1' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Adjudication Notes</span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{notes}</span>
            </div>
          )}
        </div>

        {summary && (
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', background: 'var(--bg-muted, rgba(0,0,0,0.02))', padding: '0.65rem 0.85rem', borderRadius: '8px' }}>
            {summary}
          </div>
        )}
      </div>
    );
  }

  // Policy verification / Coverage
  const policyId = policy.policy_id || data?.policy_id || 'POL-701';
  const provider = policy.provider_name || 'Health Insurance Provider';
  const planType = policy.plan_type || data?.plan_type || 'Comprehensive Coverage';
  const status = policy.status || data?.status || 'ACTIVE';
  const copay = policy.copay_percentage ?? data?.copay_percentage ?? 10;
  const remaining = policy.remaining_coverage ?? data?.remaining_coverage;
  const limit = policy.coverage_limit ?? data?.coverage_limit;

  return (
    <div className="result-card insurance-card" style={{
      background: 'var(--bg-surface)',
      border: '1px solid rgba(16, 185, 129, 0.25)',
      borderRadius: 'var(--radius-lg, 12px)',
      padding: '1.25rem',
      marginTop: '0.75rem',
      boxShadow: 'var(--shadow-sm)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-subtle)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <ShieldCheck style={{ width: 18, height: 18, color: 'var(--forest-green)' }} />
            <span style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
              Policy {policyId}
            </span>
          </div>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            {provider} • {planType}
          </span>
        </div>
        <span className="badge-ui badge-green" style={{ fontSize: '0.75rem' }}>
          {status}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.85rem', marginBottom: '1rem' }}>
        <div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Eligibility</span>
          <span style={{ fontWeight: 600, fontSize: '0.92rem', color: 'var(--forest-green)' }}>
            Eligible (Active)
          </span>
        </div>
        <div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Standard Copay</span>
          <span style={{ fontWeight: 600, fontSize: '0.92rem', color: 'var(--text-primary)' }}>
            {copay}%
          </span>
        </div>
        {remaining !== undefined && (
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Remaining Balance</span>
            <span style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-primary)' }}>
              ${Number(remaining).toLocaleString()}
            </span>
          </div>
        )}
        {limit !== undefined && (
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Coverage Limit</span>
            <span style={{ fontSize: '0.92rem', color: 'var(--text-muted)' }}>
              ${Number(limit).toLocaleString()}
            </span>
          </div>
        )}
      </div>

      {summary && (
        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', background: 'var(--bg-muted, rgba(0,0,0,0.02))', padding: '0.65rem 0.85rem', borderRadius: '8px' }}>
          {summary}
        </div>
      )}
    </div>
  );
};
