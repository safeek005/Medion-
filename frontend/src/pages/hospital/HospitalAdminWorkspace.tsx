import React, { useState } from 'react';
import { PageHeader, SectionHeader } from '../../components/common/SharedComponents';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { dispatchToWorkbench } from '../../api/workbench';
import { ExecutionTraceStep } from '../../types';
import { HumanResponseRenderer } from '../../components/intelligence/HumanResponseRenderer';
import { MOCK_APPOINTMENTS } from '../../data/mockDatasets';
import { Building2, Calendar, Users, FlaskConical } from 'lucide-react';

interface HospitalAdminWorkspaceProps {
  onTraceGenerated: (step: ExecutionTraceStep) => void;
}

export const HospitalAdminWorkspace: React.FC<HospitalAdminWorkspaceProps> = ({ onTraceGenerated }) => {
  const [docId, setDocId] = useState('DOC-101');
  const [date, setDate] = useState('2024-09-10');
  const [output, setOutput] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleAction = async (actionType: string) => {
    setLoading(true);
    setOutput(null);

    let payload: Record<string, any> = {};
    if (actionType === 'get_available_slots') payload = { doctor_id: docId, date: date };
    else if (actionType === 'book_appointment') payload = { patient_id: 'PAT-1001', doctor_id: docId, hospital_id: 'HOSP-001', date: date, time_slot: '11:00-11:30', reason: 'Consultation' };

    const requestPayload = {
      workflow_id: `WF-HOSP-${Date.now().toString().slice(-4)}`,
      agent_target: 'appointment' as any,
      action: actionType,
      portal_source: 'hospital',
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
      portalSource: 'hospital',
      agentTarget: 'appointment',
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
        title="Hospital Administration Workspace"
        subtitle="MEDION Hospital Network (HOSP-001) • Executive Operations & Capacity Management"
        badge={<Badge variant="green">Executive Network</Badge>}
      />

      {/* Operational Capacity Dashboard */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
        <div className="section-panel" style={{ marginBottom: 0 }}>
          <div className="text-muted" style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>Inpatient Bed Capacity</div>
          <div style={{ fontSize: '1.65rem', fontWeight: 700, margin: '0.25rem 0' }}>78% Occupied</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--forest-green)' }}>156 of 200 Beds Available</div>
        </div>

        <div className="section-panel" style={{ marginBottom: 0 }}>
          <div className="text-muted" style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>Active Medical Staff</div>
          <div style={{ fontSize: '1.65rem', fontWeight: 700, margin: '0.25rem 0' }}>3 Doctors • 2 Nurses</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>HOSP-001 & HOSP-002 Facilities</div>
        </div>

        <div className="section-panel" style={{ marginBottom: 0 }}>
          <div className="text-muted" style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>Avg Lab Turn-around</div>
          <div style={{ fontSize: '1.65rem', fontWeight: 700, margin: '0.25rem 0' }}>4.5 Hours</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--forest-green)' }}>NABL Standard Compliance</div>
        </div>
      </div>

      {/* Hospital Master Schedule */}
      <div className="section-panel">
        <SectionHeader
          title="Hospital Master Schedule (HOSP-001)"
          subtitle="Department bookings and physician availability"
          actions={
            <Button variant="primary" size="sm" onClick={() => handleAction('get_available_slots')}>
              <Calendar style={{ width: 14, height: 14 }} /> Check Doctor DOC-101 Slots
            </Button>
          }
        />

        <table className="table-ui">
          <thead>
            <tr>
              <th>Appointment ID</th>
              <th>Patient ID</th>
              <th>Doctor ID</th>
              <th>Hospital Facility</th>
              <th>Date & Slot</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_APPOINTMENTS.map((apt, i) => (
              <tr key={i}>
                <td style={{ fontWeight: 600 }}>{apt.appointment_id}</td>
                <td>{apt.patient_id}</td>
                <td>{apt.doctor_id}</td>
                <td>{apt.hospital_id}</td>
                <td>{apt.date} ({apt.time_slot})</td>
                <td><Badge variant="green">{apt.status}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {output && (
        <div className="section-panel">
          <SectionHeader title="Appointment Agent Response" />
          <div style={{ background: 'var(--bg-app)', padding: '1.25rem', borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
            <HumanResponseRenderer response={output} />
          </div>
        </div>
      )}
    </div>
  );
};
