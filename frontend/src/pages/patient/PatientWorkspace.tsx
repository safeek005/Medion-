import React, { useState } from 'react';
import { PageHeader, SectionHeader } from '../../components/common/SharedComponents';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { dispatchToWorkbench } from '../../api/workbench';
import { ExecutionTraceStep } from '../../types';
import { HumanResponseRenderer } from '../../components/intelligence/HumanResponseRenderer';
import { MOCK_PATIENT, MOCK_APPOINTMENTS, MOCK_LAB_REPORT, MOCK_PRESCRIPTIONS } from '../../data/mockDatasets';
import { useSharedPatients, useSharedAppointments } from '../../services/dataService';
import { Calendar, FileText, Sparkles, CheckCircle2, ShieldCheck } from 'lucide-react';

interface PatientWorkspaceProps {
  onTraceGenerated: (step: ExecutionTraceStep) => void;
}

export const PatientWorkspace: React.FC<PatientWorkspaceProps> = ({ onTraceGenerated }) => {
  const [output, setOutput] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const patients = useSharedPatients();
  const appointments = useSharedAppointments();

  const activePatient = patients[0] || MOCK_PATIENT;
  const patientApts = appointments.filter(a => a.patient_id.toUpperCase() === activePatient.patient_id.toUpperCase() && a.status !== 'CANCELLED');
  const nextApt = patientApts[0] || null;

  const handlePatientQuery = async (actionType: string, promptText: string) => {
    setLoading(true);
    setOutput(null);

    const requestPayload = {
      workflow_id: `WF-PAT-${Date.now().toString().slice(-4)}`,
      agent_target: actionType === 'get_patient_history' ? ('patient' as any) : ('medical' as any),
      action: actionType,
      portal_source: 'patient',
      payload: { patient_id: activePatient.patient_id, report_id: 'LABR-1001', audience: 'patient', message: promptText },
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
      portalSource: 'patient',
      agentTarget: requestPayload.agent_target,
      action: actionType,
      durationMs: duration,
      success: response.success !== false,
      request: requestPayload,
      response: response,
    });
  };

  return (
    <div style={{ padding: '2rem', maxWidth: 1100, margin: '0 auto' }}>
      <PageHeader
        title={`Welcome, ${activePatient.first_name}`}
        subtitle={`Patient ID: ${activePatient.patient_id} • Personal Healthcare Record & Medical Portal`}
        badge={<Badge variant="green">Active Account</Badge>}
      />

      {/* Patient High Priority Summary Section */}
      <div className="section-panel">
        <SectionHeader title="Healthcare Summary & Activity" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
          <div>
            <div className="text-muted" style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Next Appointment</div>
            {nextApt ? (
              <>
                <div style={{ fontSize: '1.05rem', fontWeight: 600, marginTop: '0.25rem' }}>Dr. Rajesh Mehta</div>
                <div className="text-muted" style={{ fontSize: '0.8rem' }}>{nextApt.reason || 'Clinical Consultation'}</div>
                <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--forest-green)', fontWeight: 500 }}>
                  <Calendar style={{ width: 14, height: 14, display: 'inline', marginRight: 4 }} /> {nextApt.date} ({nextApt.time_slot})
                </div>
              </>
            ) : (
              <div className="text-muted" style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>No upcoming appointments scheduled</div>
            )}
          </div>

          <div>
            <div className="text-muted" style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Latest Test Results</div>
            <div style={{ fontSize: '1.05rem', fontWeight: 600, marginTop: '0.25rem' }}>Blood & Lipid Panel</div>
            <div className="text-muted" style={{ fontSize: '0.8rem' }}>Collection Date: 2024-06-14</div>
            <div style={{ marginTop: '0.5rem' }}>
              <Badge variant="amber">Low Hemoglobin (10.4 g/dL)</Badge>
            </div>
          </div>

          <div>
            <div className="text-muted" style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Insurance Coverage</div>
            <div style={{ fontSize: '1.05rem', fontWeight: 600, marginTop: '0.25rem' }}>POL-701 (Active)</div>
            <div className="text-muted" style={{ fontSize: '0.8rem' }}>Comprehensive Health Shield</div>
            <div style={{ marginTop: '0.5rem' }}>
              <Badge variant="green"><CheckCircle2 style={{ width: 12, height: 12 }} /> 90% Coverage Active</Badge>
            </div>
          </div>
        </div>

        {/* Quick Context Action Prompts */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
          <Button variant="primary" onClick={() => handlePatientQuery('explain_lab_report', 'Explain my latest lab report in plain terms')}>
            <Sparkles style={{ width: 15, height: 15 }} /> Explain Test Results in Plain Terms
          </Button>
          <Button variant="secondary" onClick={() => handlePatientQuery('get_patient_history', 'Show my complete medical history')}>
            <FileText style={{ width: 15, height: 15 }} /> View Complete Medical History
          </Button>
        </div>
      </div>

      {/* Active Medications List */}
      <div className="section-panel">
        <SectionHeader title="Active Prescriptions" subtitle="Prescribed by Dr. Rajesh Mehta on 2024-06-15" />
        <table className="table-ui">
          <thead>
            <tr>
              <th>Medication</th>
              <th>Dosage</th>
              <th>Frequency</th>
              <th>Instructions</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_PRESCRIPTIONS[0].medications.map((m, i) => (
              <tr key={i}>
                <td style={{ fontWeight: 600 }}>{m.name}</td>
                <td>{m.dosage}</td>
                <td>{m.frequency}</td>
                <td className="text-muted">{m.instructions}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Output Panel */}
      {output && (
        <div className="section-panel">
          <SectionHeader title="MEDION Assistant Explanation" />
          <div style={{ background: 'var(--bg-app)', padding: '1.25rem', borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
            <HumanResponseRenderer response={output} />
          </div>
        </div>
      )}
    </div>
  );
};
