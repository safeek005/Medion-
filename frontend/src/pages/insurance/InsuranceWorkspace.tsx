import React, { useState } from 'react';
import { WorkspaceHeader } from '../../components/common/WorkspaceHeader';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { dispatchToWorkbench } from '../../api/workbench';
import { ExecutionTraceStep } from '../../types';
import { HumanResponseRenderer } from '../../components/intelligence/HumanResponseRenderer';
import {
  MOCK_INSURANCE_CLAIMS,
  ClaimAdjudicationItem,
} from '../../data/mockDatasets';
import {
  ShieldCheck,
  FileText,
  CheckCircle2,
  Shield,
  DollarSign,
  AlertCircle,
  HelpCircle,
  Sparkles,
  ArrowUpRight,
  Activity,
  Send,
  Building2,
  XCircle,
} from 'lucide-react';

interface InsuranceWorkspaceProps {
  onTraceGenerated: (step: ExecutionTraceStep) => void;
}

export const InsuranceWorkspace: React.FC<InsuranceWorkspaceProps> = ({ onTraceGenerated }) => {
  const [claims, setClaims] = useState<ClaimAdjudicationItem[]>(MOCK_INSURANCE_CLAIMS);
  const [selectedClaimId, setSelectedClaimId] = useState<string>('CLM-1001');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [output, setOutput] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const activeClaim = claims.find((c) => c.claim_id === selectedClaimId) || claims[0];

  const filteredClaims = claims.filter((item) => {
    if (filterStatus !== 'ALL' && item.status !== filterStatus) return false;
    return true;
  });

  const handleClaimDecision = (claimId: string, decision: 'SETTLED' | 'QUERY_RAISED' | 'REJECTED') => {
    setClaims((prev) =>
      prev.map((c) =>
        c.claim_id === claimId
          ? {
              ...c,
              status: decision,
              approved_amount: decision === 'SETTLED' ? c.claimed_amount * 0.9 : c.approved_amount,
              required_action:
                decision === 'SETTLED'
                  ? 'Claim approved and settled directly to hospital ledger.'
                  : decision === 'QUERY_RAISED'
                  ? 'Clarification query dispatched to hospital billing department.'
                  : 'Claim rejected under policy non-coverage clause.',
            }
          : c
      )
    );

    const noticeText = `Claim ${claimId} marked as ${decision}. Audit entry recorded.`;
    setActionNotice(noticeText);
    setTimeout(() => setActionNotice(null), 5000);

    onTraceGenerated({
      id: `TR-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toLocaleTimeString(),
      workflowId: `WF-INS-DECISION-${Date.now().toString().slice(-4)}`,
      portalSource: 'insurance',
      agentTarget: 'insurance',
      action: 'adjudicate_claim',
      durationMs: 110,
      success: true,
      request: {
        claim_id: claimId,
        decision,
        adjudicator_id: 'ADJ-882',
      } as any,
      response: {
        status: 'ADJUDICATION_CONFIRMED',
        claim_id: claimId,
        new_status: decision,
      } as any,
    });
  };

  const handleAiAdjudicationCheck = async (promptText: string) => {
    setLoading(true);
    setOutput(null);

    const requestPayload = {
      workflow_id: `WF-INS-${Date.now().toString().slice(-4)}`,
      agent_target: 'insurance' as any,
      action: 'verify_insurance',
      portal_source: 'insurance',
      payload: {
        claim_id: activeClaim.claim_id,
        patient_id: activeClaim.patient_id,
        policy_id: activeClaim.policy_id,
        message: promptText,
      },
    };

    const startTime = performance.now();
    const response = await dispatchToWorkbench(requestPayload);
    const duration = Math.round(performance.now() - startTime);

    setLoading(false);
    setOutput(response);

    onTraceGenerated({
      id: `TR-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toLocaleTimeString(),
      workflowId: requestPayload.workflow_id,
      portalSource: 'insurance',
      agentTarget: 'insurance',
      action: 'verify_insurance',
      durationMs: duration,
      success: response.success !== false,
      request: requestPayload as any,
      response: response as any,
    });
  };

  const getStatusBadge = (status: ClaimAdjudicationItem['status']) => {
    switch (status) {
      case 'SETTLED':
        return <Badge variant="green">Settled / Approved</Badge>;
      case 'PRE_AUTHORIZED':
        return <Badge variant="brand">Pre-Authorized</Badge>;
      case 'UNDER_REVIEW':
        return <Badge variant="amber">Under Adjudication</Badge>;
      case 'QUERY_RAISED':
        return <Badge variant="red">Query Raised</Badge>;
      case 'REJECTED':
        return <Badge variant="neutral">Rejected</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  return (
    <div style={{ padding: '1.75rem 2.25rem', maxWidth: 1280, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Product Standard Workspace Header */}
      <WorkspaceHeader
        title="Insurance Operations & Payer Claims Adjudication"
        subtitle="Officer Rajesh Patel • Senior Adjudication Officer • MEDION Claims & Pre-Authorization Gateway"
        facility="Coimbatore Medical Center (Main Campus)"
        department="Payer Relations, TPA Gateway & Revenue Cycle Operations"
        statusText="Payer TPA Gateway Connected"
        statusVariant="active"
        metrics={[
          { label: 'Active Policies', value: '342 Enrolled', accent: 'var(--text-primary)' },
          { label: 'Pending Claims', value: '18 Claims', accent: 'var(--warning-amber)' },
          { label: 'Preauthorizations', value: '12 Active', accent: 'var(--teal-intelligent)' },
          { label: 'Approved', value: '145 Settled', accent: 'var(--clinical-green)' },
          { label: 'Rejected', value: '7 Denied', accent: 'var(--danger-red)' },
        ]}
        actions={
          <div style={{ display: 'flex', gap: '0.6rem' }}>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleAiAdjudicationCheck('Audit pre-existing clause and co-pay compliance for active claims queue')}
            >
              <Sparkles style={{ width: 14, height: 14 }} /> AI Policy Audit Check
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleClaimDecision(activeClaim.claim_id, 'SETTLED')}
            >
              <CheckCircle2 style={{ width: 14, height: 14 }} /> Approve & Settle Active Claim
            </Button>
          </div>
        }
      />

      {/* Operational Notice Banner */}
      {actionNotice && (
        <div
          style={{
            background: 'var(--clinical-green-bg)',
            border: '1px solid var(--clinical-green)',
            padding: '0.75rem 1.25rem',
            borderRadius: 8,
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            color: 'var(--clinical-green)',
            fontSize: '0.84rem',
            fontWeight: 600,
          }}
        >
          <CheckCircle2 style={{ width: 16, height: 16 }} />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '0.35rem',
          marginBottom: '1.25rem',
          flexWrap: 'wrap',
        }}
      >
        {[
          { id: 'ALL', label: 'All Active Claims' },
          { id: 'PRE_AUTHORIZED', label: 'Pre-Authorized' },
          { id: 'UNDER_REVIEW', label: 'Under Review' },
          { id: 'QUERY_RAISED', label: 'Queries Raised' },
          { id: 'SETTLED', label: 'Settled' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterStatus(tab.id)}
            style={{
              padding: '0.45rem 0.85rem',
              fontSize: '0.8rem',
              fontWeight: filterStatus === tab.id ? 700 : 500,
              color: filterStatus === tab.id ? 'var(--forest-brand)' : 'var(--text-secondary)',
              background: filterStatus === tab.id ? 'var(--forest-subtle)' : 'var(--bg-surface)',
              border: '1px solid',
              borderColor: filterStatus === tab.id ? 'var(--forest-border)' : 'var(--border-subtle)',
              borderRadius: 6,
              cursor: 'pointer',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Two-Column Master-Detail Layout */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(460px, 1fr) minmax(360px, 440px)',
          gap: '1.5rem',
          alignItems: 'start',
        }}
      >
        {/* LEFT COLUMN: CLAIMS ADJUDICATION QUEUE TABLE */}
        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 8,
            padding: '1.25rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Adjudication & Settlement Queue
              </h4>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Direct Cashless & Reimbursement Requests
              </span>
            </div>
            <Badge variant="brand">{filteredClaims.length} Claims</Badge>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="table-ui" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th>Claim</th>
                  <th>Patient</th>
                  <th>Policy</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Submitted</th>
                  <th>Next Action</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredClaims.map((claim) => {
                  const isSelected = claim.claim_id === selectedClaimId;
                  const nextAction =
                    claim.status === 'SETTLED'
                      ? 'Reconcile Hospital Ledger'
                      : claim.status === 'QUERY_RAISED'
                      ? 'Await Billing Clarification'
                      : claim.status === 'PRE_AUTHORIZED'
                      ? 'Pre-Op Co-Pay Confirmed'
                      : claim.status === 'REJECTED'
                      ? 'Issue Non-Coverage Notice'
                      : 'Adjudicate Medical Necessity';

                  return (
                    <tr
                      key={claim.claim_id}
                      onClick={() => setSelectedClaimId(claim.claim_id)}
                      style={{
                        cursor: 'pointer',
                        background: isSelected ? 'var(--forest-subtle)' : 'transparent',
                      }}
                    >
                      <td>
                        <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                          {claim.claim_id}
                        </div>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{claim.service_type}</span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{claim.patient_name}</div>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{claim.patient_id}</span>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                          {claim.policy_id}
                        </div>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{claim.payer_name}</span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                          ${claim.claimed_amount.toLocaleString()}
                        </div>
                        {claim.approved_amount && (
                          <span style={{ fontSize: '0.7rem', color: 'var(--clinical-green)', fontWeight: 600 }}>
                            Appr: ${claim.approved_amount.toLocaleString()}
                          </span>
                        )}
                      </td>
                      <td>{getStatusBadge(claim.status)}</td>
                      <td style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                        {claim.submitted_date}
                      </td>
                      <td>
                        <span style={{ fontSize: '0.74rem', color: 'var(--teal-intelligent)', fontWeight: 600, background: 'rgba(13, 148, 136, 0.08)', padding: '0.2rem 0.4rem', borderRadius: 4 }}>
                          {nextAction}
                        </span>
                      </td>
                      <td>
                        <Button
                          variant={isSelected ? 'primary' : 'secondary'}
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedClaimId(claim.claim_id);
                          }}
                        >
                          {isSelected ? 'Auditing' : 'Inspect'}
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT COLUMN: CLAIM INSPECTION & ADJUDICATION ACTIONS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 8,
              padding: '1.25rem',
            }}
          >
            {/* LIFECYCLE VISUALIZATION: Submitted -> Review -> Approved -> Rejected -> Paid */}
            <div style={{ marginBottom: '1.25rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                Claim Adjudication Lifecycle
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.25rem' }}>
                {[
                  { id: 'SUBMITTED', label: 'Submitted', active: true },
                  { id: 'REVIEW', label: 'Review', active: activeClaim.status !== 'SUBMITTED' },
                  { id: 'APPROVED', label: activeClaim.status === 'REJECTED' ? 'Rejected' : 'Approved', active: activeClaim.status === 'SETTLED' || activeClaim.status === 'PRE_AUTHORIZED' || activeClaim.status === 'REJECTED', isDenied: activeClaim.status === 'REJECTED' },
                  { id: 'PAID', label: 'Paid', active: activeClaim.status === 'SETTLED' },
                ].map((step, sIdx, arr) => (
                  <React.Fragment key={step.id}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
                      <div
                        style={{
                          width: 22,
                          height: 22,
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          background: step.isDenied
                            ? 'var(--danger-red)'
                            : step.active
                            ? 'var(--clinical-green)'
                            : 'var(--bg-app)',
                          color: step.active || step.isDenied ? '#fff' : 'var(--text-muted)',
                          border: '1px solid',
                          borderColor: step.isDenied ? 'var(--danger-red)' : step.active ? 'var(--clinical-green)' : 'var(--border-subtle)',
                        }}
                      >
                        {step.active ? '✓' : sIdx + 1}
                      </div>
                      <span style={{ fontSize: '0.68rem', fontWeight: step.active ? 700 : 500, color: step.active ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                        {step.label}
                      </span>
                    </div>
                    {sIdx < arr.length - 1 && (
                      <div
                        style={{
                          flex: 1,
                          height: 2,
                          background: step.active && arr[sIdx + 1].active ? 'var(--clinical-green)' : 'var(--border-subtle)',
                          marginBottom: '0.8rem',
                        }}
                      />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem' }}>
              <div>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                  Claim Dossier Inspection
                </span>
                <h3 style={{ margin: '0.2rem 0 0', fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {activeClaim.claim_id}
                </h3>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                  Patient: <strong>{activeClaim.patient_name}</strong> ({activeClaim.patient_id})
                </div>
              </div>
              {getStatusBadge(activeClaim.status)}
            </div>

            {/* Financial Details Box */}
            <div style={{ background: 'var(--bg-app)', padding: '0.85rem', borderRadius: 6, border: '1px solid var(--border-subtle)', marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.82rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Payer / Insurer:</span>
                <strong style={{ color: 'var(--text-primary)' }}>{activeClaim.payer_name}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Policy Contract ID:</span>
                <strong style={{ color: 'var(--text-primary)' }}>{activeClaim.policy_id}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Claimed Amount:</span>
                <span style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  ${activeClaim.claimed_amount.toLocaleString()} USD
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Recommended Settlement:</span>
                <span style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--clinical-green)' }}>
                  ${(activeClaim.approved_amount || activeClaim.claimed_amount * 0.9).toLocaleString()} USD (90% Co-Pay)
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.45rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Diagnosis:</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{activeClaim.diagnosis_desc}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>ICD-10 Code:</span>
                <Badge variant="brand">{activeClaim.diagnosis_code}</Badge>
              </div>
            </div>

            {/* Action Notice or Instructions */}
            <div style={{ padding: '0.75rem', borderRadius: 6, background: 'var(--forest-subtle)', border: '1px solid var(--forest-border)', marginBottom: '1rem', fontSize: '0.8rem', color: 'var(--text-primary)' }}>
              <strong>Adjudication Note:</strong> {activeClaim.required_action || 'Review clinical discharge notes and settled diagnostics.'}
            </div>

            {/* Adjudication Decision Bar */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <Button
                variant="primary"
                size="sm"
                style={{ flex: 1 }}
                onClick={() => handleClaimDecision(activeClaim.claim_id, 'SETTLED')}
              >
                <CheckCircle2 style={{ width: 14, height: 14 }} /> Settle Claim
              </Button>
              <Button
                variant="secondary"
                size="sm"
                style={{ flex: 1 }}
                onClick={() => handleClaimDecision(activeClaim.claim_id, 'QUERY_RAISED')}
              >
                <HelpCircle style={{ width: 14, height: 14 }} /> Raise Query
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleClaimDecision(activeClaim.claim_id, 'REJECTED')}
              >
                <XCircle style={{ width: 14, height: 14 }} /> Reject
              </Button>
            </div>
          </div>

          {/* AI Decision Support Panel */}
          {(loading || output) && (
            <div
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--forest-border)',
                borderRadius: 8,
                padding: '1.25rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.85rem' }}>
                <Sparkles style={{ width: 16, height: 16, color: 'var(--forest-brand)' }} />
                <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Insurance Adjudication AI Verification
                </h4>
              </div>

              {loading ? (
                <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <Activity style={{ width: 20, height: 20, margin: '0 auto 0.5rem', animation: 'spin 2s linear infinite' }} />
                  <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Cross-referencing payer policy clauses & co-pay schedules...</div>
                </div>
              ) : (
                <div style={{ background: 'var(--bg-app)', padding: '1rem', borderRadius: 6, border: '1px solid var(--border-subtle)' }}>
                  <HumanResponseRenderer response={output} />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
