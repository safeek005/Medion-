import React, { useState } from 'react';
import { WorkspaceHeader } from '../../components/common/WorkspaceHeader';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { dispatchToWorkbench } from '../../api/workbench';
import { ExecutionTraceStep } from '../../types';
import { HumanResponseRenderer } from '../../components/intelligence/HumanResponseRenderer';
import {
  MOCK_LAB_QUEUE,
  MOCK_LAB_REPORT,
  LabWorkQueueItem,
} from '../../data/mockDatasets';
import {
  FlaskConical,
  AlertTriangle,
  CheckCircle2,
  Play,
  FileText,
  Clock,
  Sparkles,
  ShieldAlert,
  ArrowRight,
  Filter,
  Check,
  Activity,
  Microscope,
  PhoneCall,
  Search,
} from 'lucide-react';

interface LabWorkspaceProps {
  onTraceGenerated: (step: ExecutionTraceStep) => void;
}

export const LabWorkspace: React.FC<LabWorkspaceProps> = ({ onTraceGenerated }) => {
  const [queue, setQueue] = useState<LabWorkQueueItem[]>(MOCK_LAB_QUEUE);
  const [selectedSpecimenId, setSelectedSpecimenId] = useState<string>('SPEC-9011');
  const [sectionFilter, setSectionFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [output, setOutput] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [signOffNotice, setSignOffNotice] = useState<string | null>(null);

  const activeSpecimen = queue.find((s) => s.specimen_id === selectedSpecimenId) || queue[0];

  const filteredQueue = queue.filter((item) => {
    if (sectionFilter !== 'ALL' && item.section !== sectionFilter) return false;
    if (priorityFilter === 'STAT' && item.priority !== 'STAT') return false;
    return true;
  });

  const handleAdvanceStage = (specimenId: string) => {
    setQueue((prev) =>
      prev.map((item) => {
        if (item.specimen_id !== specimenId) return item;
        let nextStage: LabWorkQueueItem['stage'] = 'COMPLETED';
        if (item.stage === 'COLLECTED') nextStage = 'ANALYSIS';
        else if (item.stage === 'ANALYSIS') nextStage = 'CRITICAL_REVIEW';
        else if (item.stage === 'CRITICAL_REVIEW') nextStage = 'COMPLETED';

        return { ...item, stage: nextStage };
      })
    );
  };

  const handleSignOffReport = (specimen: LabWorkQueueItem) => {
    setQueue((prev) =>
      prev.map((item) =>
        item.specimen_id === specimen.specimen_id ? { ...item, stage: 'COMPLETED' } : item
      )
    );

    setSignOffNotice(`Verified and signed off ${specimen.specimen_id} (${specimen.test_name}) by Pathologist Dr. S. Kulkarni. Transmitted to EHR.`);
    setTimeout(() => setSignOffNotice(null), 5000);

    onTraceGenerated({
      id: `TR-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toLocaleTimeString(),
      workflowId: `WF-LAB-SIGNOFF-${Date.now().toString().slice(-4)}`,
      portalSource: 'lab',
      agentTarget: 'medical',
      action: 'pathologist_sign_off',
      durationMs: 140,
      success: true,
      request: {
        specimen_id: specimen.specimen_id,
        patient_id: specimen.patient_id,
        pathologist_id: 'DOC-PATH-10',
      } as any,
      response: {
        status: 'VERIFIED_AND_RELEASED',
        message: 'Panic alert logged and transmitted to attending physician.',
      } as any,
    });
  };

  const handleAiVerification = async (promptText: string) => {
    setLoading(true);
    setOutput(null);

    const requestPayload = {
      workflow_id: `WF-LAB-${Date.now().toString().slice(-4)}`,
      agent_target: 'medical' as any,
      action: 'analyze_lab_report',
      portal_source: 'lab',
      payload: {
        report_id: (activeSpecimen as any).report_id || `LABR-${activeSpecimen.specimen_id.replace('SPEC-', '')}`,
        specimen_id: activeSpecimen.specimen_id,
        patient_id: activeSpecimen.patient_id,
        test_name: activeSpecimen.test_name,
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
      portalSource: 'lab',
      agentTarget: 'medical',
      action: 'analyze_lab_report',
      durationMs: duration,
      success: response.success !== false,
      request: requestPayload as any,
      response: response as any,
    });
  };

  const getPriorityBadge = (priority: LabWorkQueueItem['priority']) => {
    switch (priority) {
      case 'STAT':
        return <Badge variant="red">STAT Critical</Badge>;
      case 'Urgent':
        return <Badge variant="amber">Urgent</Badge>;
      default:
        return <Badge variant="neutral">Routine</Badge>;
    }
  };

  const getStageBadge = (stage: LabWorkQueueItem['stage']) => {
    switch (stage) {
      case 'CRITICAL_REVIEW':
        return <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: 4, background: 'var(--danger-red-bg)', color: 'var(--danger-red)', border: '1px solid var(--danger-red-border)' }}>CRITICAL REVIEW</span>;
      case 'ANALYSIS':
        return <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: 4, background: 'var(--forest-subtle)', color: 'var(--forest-brand)' }}>ANALYSIS</span>;
      case 'COLLECTED':
        return <span style={{ fontSize: '0.72rem', fontWeight: 600, padding: '0.15rem 0.5rem', borderRadius: 4, background: 'var(--bg-app)', color: 'var(--text-secondary)' }}>COLLECTED</span>;
      case 'COMPLETED':
        return <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: 4, background: 'var(--clinical-green-bg)', color: 'var(--clinical-green)' }}>COMPLETED</span>;
      default:
        return <span style={{ fontSize: '0.72rem', fontWeight: 600, padding: '0.15rem 0.5rem', borderRadius: 4, background: 'var(--bg-app)', color: 'var(--text-muted)' }}>ORDERED</span>;
    }
  };

  return (
    <div style={{ padding: '1.75rem 2.25rem', maxWidth: 1280, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Product Standard Workspace Header */}
      <WorkspaceHeader
        title="Laboratory Operations"
        subtitle="Central Pathology & Molecular Diagnostics • Coimbatore Medical Center"
        facility="Coimbatore Medical Center (Main Campus)"
        department="Central Pathology, Biochemistry & Molecular Diagnostics"
        statusText="Analyzers Calibrated & Online"
        statusVariant="active"
        metrics={[
          { label: 'Pending Orders', value: '14 Orders', accent: 'var(--text-primary)' },
          { label: 'Processing', value: '8 Running', accent: 'var(--teal-intelligent)' },
          { label: 'Completed Today', value: '28 Released', accent: 'var(--clinical-green)' },
          { label: 'Critical Results', value: '3 Panic Values', accent: 'var(--danger-red)' },
        ]}
        actions={
          <div style={{ display: 'flex', gap: '0.6rem' }}>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleAiVerification('Scan specimen queue and flag abnormal critical values requiring verbal notification')}
            >
              <Sparkles style={{ width: 14, height: 14 }} /> Quality Control Scan
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleSignOffReport(activeSpecimen)}
            >
              <CheckCircle2 style={{ width: 14, height: 14 }} /> Pathologist Sign-Off
            </Button>
          </div>
        }
      />

      {/* Operational Notice Banner */}
      {signOffNotice && (
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
          <span>{signOffNotice}</span>
        </div>
      )}

      {/* Filter Toolbar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.25rem',
        }}
      >
        <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
          {[
            { id: 'ALL', label: 'All Sections' },
            { id: 'Biochemistry', label: 'Biochemistry' },
            { id: 'Hematology', label: 'Hematology' },
            { id: 'Immunology', label: 'Immunology' },
          ].map((sec) => (
            <button
              key={sec.id}
              onClick={() => setSectionFilter(sec.id)}
              style={{
                padding: '0.45rem 0.85rem',
                fontSize: '0.8rem',
                fontWeight: sectionFilter === sec.id ? 700 : 500,
                color: sectionFilter === sec.id ? 'var(--forest-brand)' : 'var(--text-secondary)',
                background: sectionFilter === sec.id ? 'var(--forest-subtle)' : 'var(--bg-surface)',
                border: '1px solid',
                borderColor: sectionFilter === sec.id ? 'var(--forest-border)' : 'var(--border-subtle)',
                borderRadius: 6,
                cursor: 'pointer',
              }}
            >
              {sec.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            onClick={() => setPriorityFilter(priorityFilter === 'STAT' ? 'ALL' : 'STAT')}
            style={{
              padding: '0.45rem 0.85rem',
              fontSize: '0.8rem',
              fontWeight: 700,
              color: priorityFilter === 'STAT' ? '#fff' : 'var(--danger-red)',
              background: priorityFilter === 'STAT' ? 'var(--danger-red)' : 'var(--danger-red-bg)',
              border: '1px solid var(--danger-red-border)',
              borderRadius: 6,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
            }}
          >
            <AlertTriangle style={{ width: 13, height: 13 }} />
            {priorityFilter === 'STAT' ? 'Showing STAT Priority' : 'Filter STAT Priority'}
          </button>
        </div>
      </div>

      {/* Two-Column Layout: Work Queue Table + Selected Specimen Inspector */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(420px, 1fr) minmax(360px, 440px)',
          gap: '1.5rem',
          alignItems: 'start',
        }}
      >
        {/* LEFT COLUMN: SPECIMEN QUEUE TABLE */}
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
                Specimen Intake & Analyzer Queue
              </h4>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Sorted by priority & remaining turnaround SLA window
              </span>
            </div>
            <Badge variant="brand">{filteredQueue.length} In Queue</Badge>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="table-ui" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th>Priority</th>
                  <th>Order ID</th>
                  <th>Patient</th>
                  <th>Test Order</th>
                  <th>Collected</th>
                  <th>Status</th>
                  <th>TAT</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredQueue.map((item) => {
                  const isSelected = item.specimen_id === selectedSpecimenId;
                  const isExceeded = item.elapsed_mins > item.turnaround_target_mins;
                  return (
                    <tr
                      key={item.specimen_id}
                      onClick={() => setSelectedSpecimenId(item.specimen_id)}
                      style={{
                        cursor: 'pointer',
                        background: isSelected
                          ? 'var(--forest-subtle)'
                          : item.critical_alert
                          ? 'rgba(239, 68, 68, 0.04)'
                          : 'transparent',
                        borderLeft: item.critical_alert ? '3px solid var(--danger-red)' : '3px solid transparent',
                      }}
                    >
                      <td>{getPriorityBadge(item.priority)}</td>
                      <td>
                        <div style={{ fontWeight: 700, fontSize: '0.86rem', color: 'var(--text-primary)' }}>
                          {item.specimen_id}
                        </div>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{item.specimen_type}</span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.patient_name}</div>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{item.patient_id}</span>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                          {item.test_name}
                        </div>
                        <span style={{ fontSize: '0.72rem', color: 'var(--forest-brand)', fontWeight: 500 }}>
                          {item.section}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                        {item.collected_at}
                      </td>
                      <td>{getStageBadge(item.stage)}</td>
                      <td>
                        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: isExceeded ? 'var(--danger-red)' : 'var(--text-primary)' }}>
                          {item.elapsed_mins} / {item.turnaround_target_mins}m
                        </div>
                        {isExceeded && (
                          <span style={{ fontSize: '0.68rem', color: 'var(--danger-red)', fontWeight: 600 }}>SLA Breach</span>
                        )}
                      </td>
                      <td>
                        <Button
                          variant={isSelected ? 'primary' : 'secondary'}
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedSpecimenId(item.specimen_id);
                          }}
                        >
                          {isSelected ? 'Inspecting' : 'Inspect'}
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT COLUMN: SPECIMEN INSPECTOR & PATHOLOGY SIGN-OFF */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 8,
              padding: '1.25rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem' }}>
              <div>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                  Specimen Diagnostic Inspector
                </span>
                <h3 style={{ margin: '0.2rem 0 0', fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {activeSpecimen.test_name}
                </h3>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                  Barcode: <strong>{activeSpecimen.specimen_id}</strong> • Tube: {activeSpecimen.specimen_type}
                </div>
              </div>
              {getPriorityBadge(activeSpecimen.priority)}
            </div>

            {/* Critical Alert Warning Box if active */}
            {activeSpecimen.critical_alert && (
              <div
                style={{
                  padding: '0.85rem 1rem',
                  borderRadius: 6,
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.35)',
                  marginBottom: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.65rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <ShieldAlert style={{ width: 22, height: 22, color: 'var(--status-danger)', flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--status-danger)' }}>
                      PANIC VALUE DETECTED — ELEVATED CARDIAC BIOMARKER
                    </div>
                    <div style={{ fontSize: '0.76rem', color: 'var(--text-primary)', marginTop: '0.15rem' }}>
                      Troponin-I High Sensitivity: <strong>0.18 ng/mL</strong> (Reference: &lt; 0.04 ng/mL). Immediate verbal communication mandated.
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', borderTop: '1px solid rgba(239, 68, 68, 0.2)', paddingTop: '0.5rem' }}>
                  <button
                    className="btn-ui btn-primary-ui"
                    style={{ fontSize: '0.72rem', padding: '0.3rem 0.75rem', background: 'var(--status-danger)', borderColor: 'var(--status-danger)' }}
                    onClick={() => {
                      const msg = `Logged verbal critical read-back call to Dr. Rajesh Mehta (Cardiology) for ${activeSpecimen.patient_name} at ${new Date().toLocaleTimeString()}. Stamped in NABL audit trail.`;
                      setSignOffNotice(msg);
                      setTimeout(() => setSignOffNotice(null), 6000);
                      onTraceGenerated({
                        id: `TR-${Date.now().toString().slice(-4)}`,
                        timestamp: new Date().toLocaleTimeString(),
                        workflowId: `WF-LAB-CALL-${Date.now().toString().slice(-4)}`,
                        portalSource: 'lab',
                        agentTarget: 'medical',
                        action: 'verbal_panic_readback',
                        durationMs: 85,
                        success: true,
                        request: {
                          patient_id: activeSpecimen.patient_id,
                          patient_name: activeSpecimen.patient_name,
                          specimen_id: activeSpecimen.specimen_id,
                          biomarker: 'Troponin-I High Sensitivity',
                          value: '0.18 ng/mL',
                          physician: 'Dr. Rajesh Mehta',
                        } as any,
                        response: {
                          status: 'READBACK_COMPLETED',
                          notes: msg,
                        } as any,
                      });
                    }}
                  >
                    <PhoneCall style={{ width: 12, height: 12 }} /> Log Verbal Read-Back Call to Dr. Mehta
                  </button>
                </div>
              </div>
            )}

            {/* Specimen Metadata Details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.82rem', background: 'var(--bg-app)', padding: '0.85rem', borderRadius: 6, border: '1px solid var(--border-subtle)', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Patient Name:</span>
                <strong style={{ color: 'var(--text-primary)' }}>{activeSpecimen.patient_name} ({activeSpecimen.patient_id})</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Ordering Clinician:</span>
                <span style={{ color: 'var(--text-secondary)' }}>{activeSpecimen.ordering_doctor}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Laboratory Section:</span>
                <span style={{ color: 'var(--forest-brand)', fontWeight: 600 }}>{activeSpecimen.section}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Current Stage:</span>
                <div>{getStageBadge(activeSpecimen.stage)}</div>
              </div>
            </div>

            {/* AI LAB ASSISTANCE Panel */}
            <div
              style={{
                marginTop: '1.25rem',
                padding: '1rem',
                borderRadius: 6,
                background: 'rgba(13, 148, 136, 0.05)',
                border: '1px solid rgba(13, 148, 136, 0.25)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.65rem' }}>
                <Sparkles style={{ width: 15, height: 15, color: 'var(--teal-intelligent)' }} />
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  AI Lab Assistance
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                <button
                  className="btn-ui btn-ghost-ui"
                  style={{ fontSize: '0.78rem', justifyContent: 'flex-start', border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)', padding: '0.4rem 0.65rem' }}
                  onClick={() => handleAiVerification(`Summarize diagnostic lab report for ${activeSpecimen.test_name} (${activeSpecimen.specimen_id}) including clinical significance`)}
                >
                  <FileText style={{ width: 13, height: 13, color: 'var(--teal-intelligent)' }} /> Summarize Report
                </button>
                <button
                  className="btn-ui btn-ghost-ui"
                  style={{ fontSize: '0.78rem', justifyContent: 'flex-start', border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)', padding: '0.4rem 0.65rem' }}
                  onClick={() => handleAiVerification(`Flag all abnormal reference range violations and critical panic values for specimen ${activeSpecimen.specimen_id}`)}
                >
                  <AlertTriangle style={{ width: 13, height: 13, color: 'var(--warning-amber)' }} /> Flag Abnormal Values
                </button>
                <button
                  className="btn-ui btn-ghost-ui"
                  style={{ fontSize: '0.78rem', justifyContent: 'flex-start', border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)', padding: '0.4rem 0.65rem' }}
                  onClick={() => handleAiVerification(`Compare previous longitudinal laboratory results for patient ${activeSpecimen.patient_id} across earlier panels`)}
                >
                  <Activity style={{ width: 13, height: 13, color: 'var(--forest-brand)' }} /> Compare Previous Results
                </button>
              </div>
            </div>

            {/* Pathologist Release Control */}
            <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
              {activeSpecimen.stage !== 'COMPLETED' ? (
                <Button
                  variant="primary"
                  size="sm"
                  style={{ width: '100%' }}
                  onClick={() => handleSignOffReport(activeSpecimen)}
                >
                  <CheckCircle2 style={{ width: 14, height: 14 }} /> Pathologist Verify & Sign-Off
                </Button>
              ) : (
                <Button variant="secondary" size="sm" style={{ width: '100%' }} disabled>
                  Verified & Released to EHR
                </Button>
              )}
            </div>
          </div>

          {/* AI Verification Trace Output Section */}
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
                  Pathology AI Decision Support
                </h4>
              </div>

              {loading ? (
                <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <Activity style={{ width: 20, height: 20, margin: '0 auto 0.5rem', animation: 'spin 2s linear infinite' }} />
                  <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Analyzing specimen calibration and clinical delta checks...</div>
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
