import React, { useState } from 'react';
import { PageHeader, SectionHeader, Timeline } from '../../components/common/SharedComponents';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { dispatchToWorkbench } from '../../api/workbench';
import { ExecutionTraceStep } from '../../types';
import { ShieldCheck, FileText, CheckCircle2 } from 'lucide-react';

interface InsuranceWorkspaceProps {
  onTraceGenerated: (step: ExecutionTraceStep) => void;
}

export const InsuranceWorkspace: React.FC<InsuranceWorkspaceProps> = ({ onTraceGenerated }) => {
  const [claimId, setClaimId] = useState('CLM-1001');
  const [output, setOutput] = useState<any>(null);
  const [loading, setLoading] = useState(false);

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
          title="Claim Adjudication Lifecycle (CLM-1001)"
          subtitle="Policy POL-701 • Comprehensive Health Shield • Coverage Limit: ₹500,000"
          actions={
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Button variant="primary" size="sm" onClick={() => handleAction('submit_claim')}>
                <ShieldCheck style={{ width: 14, height: 14 }} /> Adjudicate Claim CLM-1001
              </Button>
              <Button variant="secondary" size="sm" onClick={() => handleAction('verify_insurance')}>
                Verify Policy POL-701
              </Button>
            </div>
          }
        />

        <Timeline
          steps={[
            { label: 'Prepared', sublabel: 'BILL-1001', status: 'completed' },
            { label: 'Submitted', sublabel: 'Sent to Payer', status: 'completed' },
            { label: 'Under Review', sublabel: 'Rules Engine Active', status: 'active' },
            { label: 'Approved', sublabel: 'Final Settlement', status: 'pending' },
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
              <th>Policy Holder</th>
              <th>Plan Type</th>
              <th>Coverage Amount</th>
              <th>Remaining Limit</th>
              <th>Copay %</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ fontWeight: 600 }}>POL-701</td>
              <td>Arun Kumar (PAT-1001)</td>
              <td>Comprehensive Health Shield</td>
              <td>₹500,000</td>
              <td>₹425,000</td>
              <td>10%</td>
              <td><Badge variant="green">ACTIVE</Badge></td>
            </tr>
            <tr>
              <td style={{ fontWeight: 600 }}>POL-702</td>
              <td>Sneha Sharma (PAT-1002)</td>
              <td>Executive Gold Mediclaim</td>
              <td>₹1,000,000</td>
              <td>₹1,000,000</td>
              <td>5%</td>
              <td><Badge variant="green">ACTIVE</Badge></td>
            </tr>
          </tbody>
        </table>
      </div>

      {output && (
        <div className="section-panel">
          <SectionHeader title="Insurance Agent Response" />
          <pre style={{ background: 'var(--bg-app)', padding: '1rem', borderRadius: 8, fontSize: '0.8rem', fontFamily: 'var(--font-mono)', overflowX: 'auto', border: '1px solid var(--border-subtle)' }}>
            {JSON.stringify(output, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};
