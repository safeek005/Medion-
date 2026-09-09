import React, { useState } from 'react';
import { PageHeader, SectionHeader, Timeline } from '../../components/common/SharedComponents';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { DataTable } from '../../components/ui/DataTable';
import { dispatchToWorkbench } from '../../api/workbench';
import { ExecutionTraceStep } from '../../types';
import { HumanResponseRenderer } from '../../components/intelligence/HumanResponseRenderer';
import { useSharedClaims, useSharedPolicies, dataService } from '../../services/dataService';
import { ShieldCheck, FileText, CheckCircle2, Shield, DollarSign } from 'lucide-react';

interface InsuranceWorkspaceProps {
  onTraceGenerated: (step: ExecutionTraceStep) => void;
}

export const InsuranceWorkspace: React.FC<InsuranceWorkspaceProps> = ({ onTraceGenerated }) => {
  const [claimId, setClaimId] = useState('CLM-1001');
  const [output, setOutput] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const claims = useSharedClaims();
  const policies = useSharedPolicies();
  const activeClaim = claims.find(c => c.claim_id.toUpperCase() === claimId.toUpperCase()) || claims[0];

  const handleAction = async (actionType: string) => {
    setLoading(true);
    setOutput(null);

    let payload: Record<string, any> = {};
    if (actionType === 'verify_insurance') payload = { patient_id: 'PAT-1001' };
    else if (actionType === 'submit_claim') payload = { claim_id: claimId };
    else if (actionType === 'get_claim_status') payload = { claim_id: claimId };

    const requestPayload = {
      workflow_id: `WF-INS-${Date.now().toString().slice(-4)}`,
      agent_target: 'insurance' as any,
      action: actionType,
      portal_source: 'insurance',
      payload: payload,
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
      action: actionType,
      durationMs: duration,
      success: response.success !== false,
      request: requestPayload,
      response: response,
    });
  };

  // Policy Table Columns
  const policyColumns = [
    {
      key: 'policy_id',
      header: 'Policy ID',
      sortable: true,
      render: (p: any) => <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{p.policy_id}</span>,
    },
    {
      key: 'provider_name',
      header: 'Payer Organization',
      sortable: true,
      render: (p: any) => (
        <div>
          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{p.provider_name}</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{p.plan_type}</div>
        </div>
      ),
    },
    {
      key: 'policy_number',
      header: 'Certificate / Policy Number',
      sortable: true,
      render: (p: any) => <span>{p.policy_number}</span>,
    },
    {
      key: 'coverage_limit',
      header: 'Coverage Limit',
      sortable: true,
      render: (p: any) => (
        <span style={{ fontWeight: 600, color: 'var(--color-primary-light)' }}>
          ₹{(p.coverage_limit || 0).toLocaleString()}
        </span>
      ),
    },
    {
      key: 'copay_percentage',
      header: 'Copay Ratio',
      sortable: true,
      render: (p: any) => <span>{p.copay_percentage}%</span>,
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (p: any) => <Badge variant={p.status === 'ACTIVE' ? 'green' : 'amber'}>{p.status}</Badge>,
    },
  ];

  // Claims Table Columns
  const claimColumns = [
    {
      key: 'claim_id',
      header: 'Claim ID',
      sortable: true,
      render: (c: any) => <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{c.claim_id}</span>,
    },
    {
      key: 'patient_id',
      header: 'Patient MRN',
      sortable: true,
      render: (c: any) => <span>{c.patient_id}</span>,
    },
    {
      key: 'policy_id',
      header: 'Policy Reference',
      sortable: true,
      render: (c: any) => <span>{c.policy_id}</span>,
    },
    {
      key: 'claim_amount',
      header: 'Claimed Amount',
      sortable: true,
      render: (c: any) => <span>₹{(c.claim_amount || 0).toLocaleString()}</span>,
    },
    {
      key: 'approved_amount',
      header: 'Approved Settlement',
      sortable: true,
      render: (c: any) => (
        <span style={{ fontWeight: 600, color: 'var(--color-primary-light)' }}>
          ₹{(c.approved_amount || 0).toLocaleString()}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Adjudication Status',
      sortable: true,
      render: (c: any) => (
        <Badge variant={c.status === 'APPROVED' ? 'green' : c.status === 'REJECTED' ? 'red' : 'amber'}>
          {c.status}
        </Badge>
      ),
    },
  ];

  return (
    <div style={{ padding: '2rem', maxWidth: 1280, margin: '0 auto' }}>
      <PageHeader
        title="Insurance & Payer Operations"
        subtitle="Star Health & Allied Insurance • Real-time policy verification & automated claims adjudication"
        badge={<Badge variant="green">Payer Gateway Connected</Badge>}
      />

      {/* Adjudication Lifecycle Panel */}
      <div className="section-panel">
        <SectionHeader
          title={`Claim Adjudication Lifecycle (${activeClaim.claim_id})`}
          subtitle={`Policy ${activeClaim.policy_id} • Claim Amount: ₹${activeClaim.claim_amount.toLocaleString()}`}
          actions={
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Button variant="primary" size="sm" loading={loading} onClick={() => handleAction('submit_claim')}>
                <ShieldCheck style={{ width: 14, height: 14 }} /> Adjudicate Claim {activeClaim.claim_id}
              </Button>
              <Button variant="secondary" size="sm" onClick={() => handleAction('verify_insurance')}>
                Verify Policy POL-701
              </Button>
            </div>
          }
        />

        <Timeline
          steps={[
            { label: 'Hospital Bill Prepared', sublabel: activeClaim.bill_id || 'BILL-1001', status: 'completed' },
            { label: 'Electronic Claim Filed', sublabel: 'FHIR Standard Transmission', status: 'completed' },
            { label: 'Rules Engine Verification', sublabel: 'Copay & Pre-auth Checked', status: activeClaim.status === 'APPROVED' ? 'completed' : 'active' },
            { label: 'Adjudication Settlement', sublabel: activeClaim.status === 'APPROVED' ? `₹${(activeClaim.approved_amount || 0).toLocaleString()} Approved` : 'Under Review', status: activeClaim.status === 'APPROVED' ? 'completed' : 'pending' },
          ]}
        />
      </div>

      {/* Claims Registry Table */}
      <div className="section-panel" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
              Submitted Insurance Claims
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '0.2rem 0 0' }}>
              Real-time claims tracking across affiliated hospital networks
            </p>
          </div>
          <Badge variant="brand">{claims.length} Claims In Ledger</Badge>
        </div>

        <DataTable
          columns={claimColumns}
          data={claims}
          searchPlaceholder="Filter claims by ID, patient, or policy..."
          pageSize={5}
        />
      </div>

      {/* Policy Registry Table */}
      <div className="section-panel" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
              Active Policy Registry
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '0.2rem 0 0' }}>
              Validated institutional and private health insurance coverage contracts
            </p>
          </div>
          <Badge variant="green">{policies.length} Active Policies</Badge>
        </div>

        <DataTable
          columns={policyColumns}
          data={policies}
          searchPlaceholder="Filter policies by ID, provider, or certificate number..."
          pageSize={5}
        />
      </div>

      {output && (
        <div className="section-panel" style={{ marginTop: '1.5rem' }}>
          <SectionHeader title="Insurance Agent Adjudication Response" />
          <div style={{ background: 'var(--bg-elevated)', padding: '1.25rem', borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
            <HumanResponseRenderer response={output} />
          </div>
        </div>
      )}
    </div>
  );
};
