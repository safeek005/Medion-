import React, { useState } from 'react';
import { PageHeader, SectionHeader, Timeline } from '../../components/common/SharedComponents';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { dispatchToWorkbench } from '../../api/workbench';
import { ExecutionTraceStep } from '../../types';
import { HumanResponseRenderer } from '../../components/intelligence/HumanResponseRenderer';
import { MOCK_PATIENT, MOCK_APPOINTMENTS, MOCK_LAB_REPORT } from '../../data/mockDatasets';
import { ShieldCheck, FileCheck, DollarSign, Send, Users, Calendar, FlaskConical, AlertCircle } from 'lucide-react';

interface NurseWorkspaceProps {
  onTraceGenerated: (step: ExecutionTraceStep) => void;
}

export const NurseWorkspace: React.FC<NurseWorkspaceProps> = ({ onTraceGenerated }) => {
  const [patientId, setPatientId] = useState('PAT-1001');
  const [billId, setBillId] = useState('BILL-1001');
  const [claimId, setClaimId] = useState('CLM-1001');
  const [output, setOutput] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleAction = async (actionType: string) => {
    setLoading(true);
    setOutput(null);

    let payload: Record<string, any> = {};
    if (actionType === 'verify_insurance') payload = { patient_id: patientId };
    else if (actionType === 'get_coverage') payload = { patient_id: patientId, service_type: 'CONSULTATION' };
    else if (actionType === 'prepare_claim') payload = { patient_id: patientId, bill_id: billId, service_type: 'CONSULTATION' };
    else if (actionType === 'submit_claim') payload = { claim_id: claimId };

    const requestPayload = {
      workflow_id: `WF-NUR-${Date.now().toString().slice(-4)}`,
      agent_target: 'insurance' as any,
      action: actionType,
      portal_source: 'nurse',
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
      portalSource: 'nurse',
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
        title="Nurse / Clinical Operations Workspace"
        subtitle="Nurse Reka • Patient Intake Queue, Insurance Verification & Operational Tasks"
        badge={<Badge variant="green">Clinical Operations</Badge>}
      />

      {/* Operational Task Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
        <div className="section-panel" style={{ marginBottom: 0 }}>
          <div className="text-muted" style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>Intake Queue</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0.25rem 0' }}>{MOCK_PATIENT.first_name} {MOCK_PATIENT.last_name}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>PAT-1001 • DOB {MOCK_PATIENT.date_of_birth}</div>
        </div>

        <div className="section-panel" style={{ marginBottom: 0 }}>
          <div className="text-muted" style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>Today's Appointments</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0.25rem 0' }}>2 Scheduled</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--forest-green)' }}>Cardiology & Endocrinology</div>
        </div>

        <div className="section-panel" style={{ marginBottom: 0 }}>
          <div className="text-muted" style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>Lab Status Alert</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0.25rem 0', color: 'var(--warning-amber)' }}>1 Flagged</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>LABR-1001 Low Hemoglobin</div>
        </div>
      </div>

      {/* Patient Intake & Verification Panel */}
      <div className="section-panel">
        <SectionHeader
          title="Patient Intake & Insurance Verification Tasks"
          subtitle="Policy POL-701 • Comprehensive Health Shield"
          actions={
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Button variant="primary" size="sm" onClick={() => handleAction('verify_insurance')}>
                <ShieldCheck style={{ width: 14, height: 14 }} /> Verify Policy POL-701
              </Button>
              <Button variant="secondary" size="sm" onClick={() => handleAction('get_coverage')}>
                <DollarSign style={{ width: 14, height: 14 }} /> Check Copay %
              </Button>
            </div>
          }
        />

        <table className="table-ui" style={{ marginBottom: '1.5rem' }}>
          <thead>
            <tr>
              <th>Patient Name</th>
              <th>Patient ID</th>
              <th>Insurance Policy</th>
              <th>Service Bill ID</th>
              <th>Copay Verification</th>
              <th>Claim Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ fontWeight: 600 }}>{MOCK_PATIENT.first_name} {MOCK_PATIENT.last_name}</td>
              <td><Badge variant="green">{MOCK_PATIENT.patient_id}</Badge></td>
              <td>POL-701 (Comprehensive Health Shield)</td>
              <td>BILL-1001</td>
              <td>10% Copay (Verified)</td>
              <td><Badge variant="amber">UNDER REVIEW</Badge></td>
            </tr>
          </tbody>
        </table>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button variant="secondary" size="sm" onClick={() => handleAction('prepare_claim')}>
            <FileCheck style={{ width: 14, height: 14 }} /> Prepare Claim BILL-1001
          </Button>
          <Button variant="secondary" size="sm" onClick={() => handleAction('submit_claim')}>
            <Send style={{ width: 14, height: 14 }} /> Dispatch Claim to Payer
          </Button>
        </div>
      </div>

      {/* Response Panel */}
      {output && (
        <div className="section-panel">
          <SectionHeader title="Insurance Agent Operational Response" />
          <div style={{ background: 'var(--bg-app)', padding: '1.25rem', borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
            <HumanResponseRenderer response={output} />
          </div>
        </div>
      )}
    </div>
  );
};
