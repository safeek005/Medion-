import React, { useState } from 'react';
import { PageHeader, SectionHeader, Timeline } from '../../components/common/SharedComponents';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { DataTable } from '../../components/ui/DataTable';
import { dispatchToWorkbench } from '../../api/workbench';
import { ExecutionTraceStep } from '../../types';
import { HumanResponseRenderer } from '../../components/intelligence/HumanResponseRenderer';
import { MOCK_LAB_REPORT } from '../../data/mockDatasets';
import { useSharedLabReports } from '../../services/dataService';
import { FlaskConical, AlertTriangle, CheckCircle2, Play, FileText, Cpu, Check } from 'lucide-react';

interface LabWorkspaceProps {
  onTraceGenerated: (step: ExecutionTraceStep) => void;
}

export const LabWorkspace: React.FC<LabWorkspaceProps> = ({ onTraceGenerated }) => {
  const [reportId, setReportId] = useState('LABR-1001');
  const [processingStep, setProcessingStep] = useState<number | null>(null);
  const [output, setOutput] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const labReports = useSharedLabReports();

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

  // Diagnostic Results Columns
  const resultColumns = [
    {
      key: 'parameter',
      header: 'Diagnostic Parameter',
      sortable: true,
      render: (r: typeof MOCK_LAB_REPORT.results[0]) => (
        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{r.parameter}</span>
      ),
    },
    {
      key: 'value',
      header: 'Measured Result',
      sortable: true,
      render: (r: typeof MOCK_LAB_REPORT.results[0]) => (
        <span style={{ fontWeight: 600, color: 'var(--color-primary-light)' }}>
          {r.value} {r.unit}
        </span>
      ),
    },
    {
      key: 'reference_range',
      header: 'Reference Bounds',
      sortable: true,
      render: (r: typeof MOCK_LAB_REPORT.results[0]) => (
        <span style={{ color: 'var(--text-muted)' }}>{r.reference_range}</span>
      ),
    },
    {
      key: 'is_abnormal',
      header: 'Clinical Evaluation',
      sortable: true,
      render: (r: typeof MOCK_LAB_REPORT.results[0]) =>
        r.is_abnormal ? (
          <Badge variant="amber">{r.abnormality_direction || 'ABNORMAL'}</Badge>
        ) : (
          <Badge variant="green">NORMAL</Badge>
        ),
    },
  ];

  return (
    <div style={{ padding: '2rem', maxWidth: 1280, margin: '0 auto' }}>
      <PageHeader
        title="Laboratory Operations & Diagnostics"
        subtitle="Central Diagnostics Lab (LAB-001) • Specimen intake, reference range normalization & AI clinical extraction"
        badge={<Badge variant="green">NABL Accredited • Active</Badge>}
      />

      {/* Lab Pipeline Showcase Section */}
      <div className="section-panel">
        <SectionHeader
          title="Automated Specimen Diagnostic Pipeline"
          subtitle="Multi-agent medical validation: OCR extraction, bound normalization, and physician insight generation"
          actions={
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Button variant="primary" size="sm" loading={loading} onClick={() => handleAction('extract_lab_report')}>
                <Play style={{ width: 14, height: 14 }} /> Process Report LABR-1001
              </Button>
              <Button variant="secondary" size="sm" onClick={() => handleAction('analyze_lab_report')}>
                <AlertTriangle style={{ width: 14, height: 14 }} /> Evaluate Clinical Bounds
              </Button>
            </div>
          }
        />

        <Timeline
          steps={[
            { label: 'Specimen Intake', sublabel: 'LABR-1001', status: processingStep && processingStep > 1 ? 'completed' : processingStep === 1 ? 'active' : 'pending' },
            { label: 'Biomarker Extraction', sublabel: '3 Parameters', status: processingStep && processingStep > 2 ? 'completed' : processingStep === 2 ? 'active' : 'pending' },
            { label: 'Bounds Verification', sublabel: 'Ref Check', status: processingStep && processingStep > 3 ? 'completed' : processingStep === 3 ? 'active' : 'pending' },
            { label: 'Longitudinal Delta', sublabel: 'LABR-1002 vs 1001', status: processingStep && processingStep > 4 ? 'completed' : processingStep === 4 ? 'active' : 'pending' },
            { label: 'Medical Agent Evaluation', sublabel: 'Insight Formatted', status: processingStep === 5 ? 'completed' : 'pending' },
          ]}
        />
      </div>

      {/* Raw Diagnostic Report Table */}
      <div className="section-panel" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
              Active Specimen Panel: {MOCK_LAB_REPORT.test_type}
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '0.2rem 0 0' }}>
              Report ID: {MOCK_LAB_REPORT.report_id} • Patient: {MOCK_LAB_REPORT.patient_id} • Specimen Collected: {MOCK_LAB_REPORT.test_date}
            </p>
          </div>
          <Badge variant="green">Verified Batch</Badge>
        </div>

        <DataTable
          columns={resultColumns}
          data={MOCK_LAB_REPORT.results}
          searchPlaceholder="Search parameters (e.g. Cholesterol, HbA1c)..."
          pageSize={10}
        />
      </div>

      {output && (
        <div className="section-panel">
          <SectionHeader title="Medical Intelligence Analysis Output" />
          <div style={{ background: 'var(--bg-elevated)', padding: '1.25rem', borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
            <HumanResponseRenderer response={output} />
          </div>
        </div>
      )}
    </div>
  );
};
