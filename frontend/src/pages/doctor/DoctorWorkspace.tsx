import React, { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { dispatchToWorkbench } from '../../api/workbench';
import { ExecutionTraceStep } from '../../types';
import { MOCK_PATIENT, MOCK_LAB_REPORT } from '../../data/mockDatasets';
import { Search, FlaskConical, TrendingDown, FileText, Activity, Calendar } from 'lucide-react';

interface DoctorWorkspaceProps {
  onTraceGenerated: (step: ExecutionTraceStep) => void;
}

export const DoctorWorkspace: React.FC<DoctorWorkspaceProps> = ({ onTraceGenerated }) => {
  const [patientId, setPatientId] = useState('PAT-1001');
  const [reportId, setReportId] = useState('LABR-1001');
  const [output, setOutput] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'clinical' | 'lab' | 'summary'>('clinical');

  const handleAction = async (actionType: string) => {
    setLoading(true);
    setOutput(null);

    let targetAgent: any = 'medical';
    let payload: Record<string, any> = {};

    if (actionType === 'search_patient') {
      targetAgent = 'patient';
      payload = { query: patientId };
    } else if (actionType === 'analyze_lab_report') {
      payload = { patient_id: patientId, report_id: reportId };
    } else if (actionType === 'compare_lab_reports') {
      payload = { patient_id: patientId, current_report_id: 'LABR-1002', previous_report_id: 'LABR-1001' };
    } else if (actionType === 'get_medical_summary') {
      payload = { patient_id: patientId };
    } else if (actionType === 'explain_lab_report') {
      payload = { patient_id: patientId, report_id: reportId, audience: 'doctor' };
    }

    const requestPayload = {
      workflow_id: `WF-DOC-${Date.now().toString().slice(-4)}`,
      agent_target: targetAgent,
      action: actionType,
      portal_source: 'doctor',
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
      portalSource: 'doctor',
      agentTarget: targetAgent,
      action: actionType,
      durationMs: duration,
      success: response.success !== false,
      request: requestPayload,
      response: response,
    });
  };

  return (
    <div style={{ padding: '2rem', maxWidth: 1200, margin: '0 auto' }}>
      {/* Doctor Identity & Workspace Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-subtle)' }}>
        <div>
          <h2 className="h2">Doctor Clinical Workspace</h2>
          <p className="text-muted" style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
            Dr. Rajesh Mehta • Cardiology Department • HOSP-001
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button variant="secondary" size="sm" onClick={() => handleAction('search_patient')}>
            <Search style={{ width: 14, height: 14 }} /> Search Patient
          </Button>
          <Button variant="primary" size="sm" onClick={() => handleAction('analyze_lab_report')}>
            <FlaskConical style={{ width: 14, height: 14 }} /> Analyze Lab Report
          </Button>
        </div>
      </div>

      {/* Patient Workspace Container */}
      <div className="section-panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
              <h1 className="h1" style={{ fontSize: '1.75rem' }}>{MOCK_PATIENT.first_name} {MOCK_PATIENT.last_name}</h1>
              <span className="badge-ui badge-green">{MOCK_PATIENT.patient_id}</span>
              <span className="badge-ui badge-neutral">{MOCK_PATIENT.gender} • DOB {MOCK_PATIENT.date_of_birth}</span>
            </div>
            <p className="text-secondary" style={{ fontSize: '0.85rem' }}>
              Primary Doctor: DOC-101 • Policy: POL-701 • Blood Group: {MOCK_PATIENT.blood_group}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button variant="secondary" size="sm" onClick={() => handleAction('compare_lab_reports')}>
              <TrendingDown style={{ width: 14, height: 14 }} /> Compare History
            </Button>
            <Button variant="secondary" size="sm" onClick={() => handleAction('get_medical_summary')}>
              <FileText style={{ width: 14, height: 14 }} /> Medical Summary
            </Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border-subtle)', marginBottom: '1.5rem' }}>
          <button
            onClick={() => setActiveTab('clinical')}
            style={{ padding: '0.5rem 0.25rem', background: 'none', border: 'none', borderBottom: activeTab === 'clinical' ? '2px solid var(--forest-green)' : '2px solid transparent', color: activeTab === 'clinical' ? 'var(--forest-green)' : 'var(--text-muted)', fontWeight: activeTab === 'clinical' ? 600 : 400, cursor: 'pointer', fontSize: '0.88rem' }}
          >
            Clinical Record Overview
          </button>
          <button
            onClick={() => setActiveTab('lab')}
            style={{ padding: '0.5rem 0.25rem', background: 'none', border: 'none', borderBottom: activeTab === 'lab' ? '2px solid var(--forest-green)' : '2px solid transparent', color: activeTab === 'lab' ? 'var(--forest-green)' : 'var(--text-muted)', fontWeight: activeTab === 'lab' ? 600 : 400, cursor: 'pointer', fontSize: '0.88rem' }}
          >
            Laboratory Results (LABR-1001)
          </button>
        </div>

        {/* Tab 1: Clinical Overview */}
        {activeTab === 'clinical' && (
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
            <div>
              <h4 className="h4" style={{ marginBottom: '0.75rem' }}>Demographic Information</h4>
              <table className="table-ui" style={{ marginBottom: '1.5rem' }}>
                <tbody>
                  <tr><td className="text-muted">Full Address</td><td>{MOCK_PATIENT.address}</td></tr>
                  <tr><td className="text-muted">Contact Phone</td><td>{MOCK_PATIENT.phone}</td></tr>
                  <tr><td className="text-muted">Emergency Contact</td><td>{MOCK_PATIENT.emergency_contact.name} ({MOCK_PATIENT.emergency_contact.relationship} • {MOCK_PATIENT.emergency_contact.phone})</td></tr>
                </tbody>
              </table>
            </div>

            <div style={{ background: 'var(--bg-app)', padding: '1.25rem', borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
              <h4 className="h4" style={{ marginBottom: '0.5rem' }}>Upcoming Appointments</h4>
              <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Cardiology Follow-up</div>
              <div className="text-muted" style={{ fontSize: '0.78rem', marginTop: '0.25rem' }}>
                <Calendar style={{ width: 12, height: 12, display: 'inline', marginRight: 4 }} /> 2024-09-10 (10:00 - 10:30)
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Laboratory Panel */}
        {activeTab === 'lab' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{MOCK_LAB_REPORT.test_type}</span>
              <span className="text-muted" style={{ fontSize: '0.8rem' }}>Collection Date: {MOCK_LAB_REPORT.test_date}</span>
            </div>

            <table className="table-ui">
              <thead>
                <tr>
                  <th>Parameter</th>
                  <th>Result Value</th>
                  <th>Reference Range</th>
                  <th>Indicator</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_LAB_REPORT.results.map((r, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 500 }}>{r.parameter}</td>
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
        )}
      </div>

      {/* Orchestration Output Panel */}
      {output && (
        <div className="section-panel" style={{ background: 'var(--bg-surface)' }}>
          <h4 className="h4" style={{ marginBottom: '0.75rem' }}>SNS Workbench Action Response</h4>
          <pre style={{ background: 'var(--bg-app)', padding: '1rem', borderRadius: 8, fontSize: '0.8rem', fontFamily: 'var(--font-mono)', overflowX: 'auto', border: '1px solid var(--border-subtle)' }}>
            {JSON.stringify(output, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};
