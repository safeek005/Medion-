import React, { useState } from 'react';
import { PageHeader, SectionHeader, Timeline } from '../../components/common/SharedComponents';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { dispatchToWorkbench } from '../../api/workbench';
import { ExecutionTraceStep } from '../../types';
import { HumanResponseRenderer } from '../../components/intelligence/HumanResponseRenderer';
import { useSharedClaims, dataService } from '../../services/dataService';
import { ShieldCheck, FileText, CheckCircle2 } from 'lucide-react';

interface InsuranceWorkspaceProps {
  onTraceGenerated: (step: ExecutionTraceStep) => void;
}

export const InsuranceWorkspace: React.FC<InsuranceWorkspaceProps> = ({ onTraceGenerated }) => {
  const [claimId, setClaimId] = useState('CLM-1001');
  const [output, setOutput] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const claims = useSharedClaims();
  const policies = dataService.getPolicies();
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

  return (
    <div style={{ padding: '2rem', maxWidth: 1200, margin: '0 auto' }}>
      <PageHeader
        title="Insurance & Payer Operations Workspace"
        subtitle="Star Health Insurance • Claims Adjudication & Policy Coverage Verification"
        badge={<Badge variant="green">Payer Active</Badge>}
      />

      {/* Adjudication Lifecycle Panel */}
      <div className="section-panel">
        <SectionHeader
          title={`Claim Adjudication Lifecycle (${activeClaim.claim_id})`}
          subtitle={`Policy ${activeClaim.policy_id} • Claim Amount: ₹${activeClaim.claim_amount.toLocaleString()}`}
          actions={
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Button variant="primary" size="sm" onClick={() => handleAction('submit_claim')}>
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
            { label: 'Prepared', sublabel: activeClaim.bill_id || 'BILL-1001', status: 'completed' },
            { label: 'Submitted', sublabel: 'Sent to Payer', status: 'completed' },
            { label: 'Under Review', sublabel: 'Rules Engine Active', status: activeClaim.status === 'APPROVED' ? 'completed' : 'active' },
            { label: 'Approved', sublabel: activeClaim.status === 'APPROVED' ? `₹${(activeClaim.approved_amount || 0).toLocaleString()}` : 'Pending', status: activeClaim.status === 'APPROVED' ? 'completed' : 'pending' },
          ]}
        />
      </div>

      {/* Policy Registry Table */}
      <div className="section-panel">
        <SectionHeader title="Active Policy Registry" />
        <table className="table-ui">
          <thead>
            <tr>
              <th>Policy ID</th>
              <th>Policy Holder / Patient</th>
              <th>Plan Type</th>
              <th>Coverage Amount</th>
              <th>Remaining Limit</th>
              <th>Copay %</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {policies.map((pol) => (
              <tr key={pol.policy_id}>
                <td style={{ fontWeight: 600 }}>{pol.policy_id}</td>
                <td>{pol.patient_id}</td>
                <td>{pol.plan_type}</td>
                <td>₹{pol.coverage_limit.toLocaleString()}</td>
                <td>₹{pol.remaining_coverage.toLocaleString()}</td>
                <td>{pol.copay_percentage}%</td>
                <td><Badge variant="green">{pol.status}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {output && (
        <div className="section-panel">
          <SectionHeader title="Insurance Agent Response" />
          <div style={{ background: 'var(--bg-app)', padding: '1.25rem', borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
            <HumanResponseRenderer response={output} />
          </div>
        </div>
      )}
    </div>
  );
};
