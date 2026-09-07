import React, { useState } from 'react';
import { PageHeader, SectionHeader, Timeline } from '../../components/common/SharedComponents';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { dispatchToWorkbench } from '../../api/workbench';
import { ExecutionTraceStep } from '../../types';
import { HumanResponseRenderer } from '../../components/intelligence/HumanResponseRenderer';
import { MOCK_LAB_REPORT } from '../../data/mockDatasets';
import { FlaskConical, AlertTriangle, CheckCircle2, Play } from 'lucide-react';

interface LabWorkspaceProps {
  onTraceGenerated: (step: ExecutionTraceStep) => void;
}

export const LabWorkspace: React.FC<LabWorkspaceProps> = ({ onTraceGenerated }) => {
  const [reportId, setReportId] = useState('LABR-1001');
  const [processingStep, setProcessingStep] = useState<number | null>(null);
  const [output, setOutput] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleAction = async (actionType: string) => {
    setLoading(true);
    setOutput(null);
    setProcessingStep(1);

    setTimeout(() => setProcessingStep(2), 300);
    setTimeout(() => setProcessingStep(3), 600);
    setTimeout(() => setProcessingStep(4), 900);

    const requestPayload = {
      workflow_id: `WF-LAB-${Date.now().toString().slice(-4)}`,
      agent_target: 'medical' as any,
      action: actionType,
      portal_source: 'lab',
      payload: { report_id: reportId, patient_id: 'PAT-1001' },
    };

    const startTime = performance.now();
    const response = await dispatchToWorkbench(requestPayload);
    const duration = Math.round(performance.now() - startTime);

    setLoading(false);
    setProcessingStep(5);
    setOutput(response);

    onTraceGenerated({
      id: `TR-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toLocaleTimeString(),
      workflowId: requestPayload.workflow_id,
      portalSource: 'lab',
      agentTarget: 'medical',
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
        title="Laboratory Operations Workspace"
        subtitle="Central Diagnostics Lab (LAB-001) • Pathology & Diagnostic Report Processing"
        badge={<Badge variant="green">Operational</Badge>}
      />

      {/* Lab Pipeline Showcase Section */}
      <div className="section-panel">
        <SectionHeader
          title="Diagnostic Processing Pipeline"
          subtitle="Execute automated reference normalization & Medical Agent evaluation"
          actions={
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Button variant="primary" size="sm" onClick={() => handleAction('extract_lab_report')}>
                <Play style={{ width: 14, height: 14 }} /> Process Report LABR-1001
              </Button>
              <Button variant="secondary" size="sm" onClick={() => handleAction('analyze_lab_report')}>
                <AlertTriangle style={{ width: 14, height: 14 }} /> Flag Deviations
              </Button>
            </div>
          }
        />

        <Timeline
          steps={[
            { label: 'Report Selected', sublabel: 'LABR-1001', status: processingStep && processingStep > 1 ? 'completed' : processingStep === 1 ? 'active' : 'pending' },
            { label: 'Extracting Results', sublabel: '3 Parameters', status: processingStep && processingStep > 2 ? 'completed' : processingStep === 2 ? 'active' : 'pending' },
            { label: 'Analyzing Bounds', sublabel: 'Ref Check', status: processingStep && processingStep > 3 ? 'completed' : processingStep === 3 ? 'active' : 'pending' },
            { label: 'Comparing History', sublabel: 'LABR-1002 vs 1001', status: processingStep && processingStep > 4 ? 'completed' : processingStep === 4 ? 'active' : 'pending' },
            { label: 'MEDION Insight Ready', sublabel: 'Analysis Complete', status: processingStep === 5 ? 'completed' : 'pending' },
          ]}
        />
      </div>

      {/* Raw Diagnostic Report Table */}
      <div className="section-panel">
        <SectionHeader
          title={`Active Diagnostic Panel: ${MOCK_LAB_REPORT.test_type}`}
          subtitle={`Report ID: ${MOCK_LAB_REPORT.report_id} • Patient: ${MOCK_LAB_REPORT.patient_id} • Collection Date: ${MOCK_LAB_REPORT.test_date}`}
        />

        <table className="table-ui">
          <thead>
            <tr>
              <th>Diagnostic Parameter</th>
              <th>Measured Result</th>
              <th>Reference Bounds</th>
              <th>Clinical Indicator</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_LAB_REPORT.results.map((r, i) => (
              <tr key={i}>
                <td style={{ fontWeight: 600 }}>{r.parameter}</td>
                <td>{r.value} {r.unit}</td>
                <td className="text-muted">{r.reference_range}</td>
                <td>
                  {r.is_abnormal ? (
                    <Badge variant="amber">{r.abnormality_direction}</Badge>
                  ) : (
                    <Badge variant="green">NORMAL</Badge>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {output && (
        <div className="section-panel">
          <SectionHeader title="Medical Agent Insight Response" />
          <div style={{ background: 'var(--bg-app)', padding: '1.25rem', borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
            <HumanResponseRenderer response={output} />
          </div>
        </div>
      )}
    </div>
  );
};
