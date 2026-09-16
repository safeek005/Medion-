import React, { useState } from 'react';
import { WorkspaceHeader } from '../../components/common/WorkspaceHeader';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { VitalSignsGrid, VitalSignItem } from '../../components/ui/VitalSignsGrid';
import { dispatchToWorkbench } from '../../api/workbench';
import { ExecutionTraceStep } from '../../types';
import { HumanResponseRenderer } from '../../components/intelligence/HumanResponseRenderer';
import {
  MOCK_INPATIENTS,
  MOCK_EMAR_TASKS,
  InpatientBedItem,
  EmarTaskItem,
} from '../../data/mockDatasets';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Pill,
  ShieldAlert,
  Sparkles,
  User,
  Heart,
  Droplet,
  Thermometer,
  Wind,
  ClipboardList,
  ArrowRight,
  Stethoscope,
  Send,
  Calendar,
} from 'lucide-react';

interface NurseWorkspaceProps {
  onTraceGenerated: (step: ExecutionTraceStep) => void;
}

export const NurseWorkspace: React.FC<NurseWorkspaceProps> = ({ onTraceGenerated }) => {
  const [inpatients, setInpatients] = useState<InpatientBedItem[]>(MOCK_INPATIENTS);
  const [emarTasks, setEmarTasks] = useState<EmarTaskItem[]>(MOCK_EMAR_TASKS);
  const [selectedBedId, setSelectedBedId] = useState<string>('BED-301-A');
  const [activeTab, setActiveTab] = useState<'bedboard' | 'emar' | 'vitals_rounding' | 'handover'>('bedboard');
  const [output, setOutput] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [nurseNotice, setNurseNotice] = useState<string | null>(null);

  // Shift care checklist
  const [shiftTasks, setShiftTasks] = useState([
    { id: 't1', title: 'Verify IV Infusion Rate on Bed 304 (Normal Saline 125 mL/hr)', completed: true },
    { id: 't2', title: 'Administer 12:00 eMAR Oral Medications (Metoprolol for Bed 301-B)', completed: false },
    { id: 't3', title: 'Record Mid-Shift Vital Signs & Calculate Early Warning Score (EWS)', completed: false },
    { id: 't4', title: 'Inspect Peripheral Cannula Site on Bed 301-A (No Phlebitis)', completed: true },
    { id: 't5', title: 'Prepare SBAR Clinical Handover Report for Evening Shift (19:00)', completed: false },
  ]);

  const activeBed = inpatients.find((b) => b.bed_id === selectedBedId) || inpatients[0];

  const toggleShiftTask = (id: string) => {
    setShiftTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const markEmarAdministered = (taskId: string) => {
    setEmarTasks((prev) =>
      prev.map((task) =>
        task.task_id === taskId
          ? { ...task, status: 'ADMINISTERED', notes: 'Logged by Nurse Ananya R. at ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
          : task
      )
    );

    onTraceGenerated({
      id: `TR-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toLocaleTimeString(),
      workflowId: `WF-EMAR-${Date.now().toString().slice(-4)}`,
      portalSource: 'nurse',
      agentTarget: 'medical',
      action: 'administer_medication',
      durationMs: 85,
      success: true,
      request: { task_id: taskId, nurse_id: 'NURSE-402' } as any,
      response: {
        status: 'ADMINISTERED_VERIFIED',
        message: 'Medication administration stamped in hospital eMAR audit log.',
      } as any,
    });
  };

  const handleNurseAssistant = async (queryType: string, promptText: string) => {
    setLoading(true);
    setOutput(null);

    const requestPayload = {
      workflow_id: `WF-NUR-${Date.now().toString().slice(-4)}`,
      agent_target: 'medical' as any,
      action: queryType,
      portal_source: 'nurse',
      payload: {
        patient_id: activeBed.patient_id,
        bed_id: activeBed.bed_id,
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
      portalSource: 'nurse',
      agentTarget: 'medical',
      action: queryType,
      durationMs: duration,
      success: response.success !== false,
      request: requestPayload,
      response: response,
    });
  };

  const getAcuityBadge = (acuity: InpatientBedItem['acuity']) => {
    switch (acuity) {
      case 'Critical':
        return <Badge variant="red">Critical Care</Badge>;
      case 'Urgent':
        return <Badge variant="amber">Urgent Guard</Badge>;
      case 'Guarded':
        return <Badge variant="brand">Guarded</Badge>;
      default:
        return <Badge variant="green">Stable</Badge>;
    }
  };

  // Convert active bed vitals into VitalSignItem format
  const activeBedVitals: VitalSignItem[] = [
    {
      id: 'v1',
      name: 'Blood Pressure',
      value: activeBed.vitals.bp,
      unit: '',
      status: activeBed.vitals.status === 'critical' ? 'critical' : activeBed.vitals.status === 'elevated' ? 'elevated' : 'normal',
      referenceRange: '90-120 / 60-80',
      measuredAt: activeBed.vitals.last_taken,
    },
    {
      id: 'v2',
      name: 'Pulse / Heart Rate',
      value: activeBed.vitals.pulse,
      unit: 'bpm',
      status: activeBed.vitals.pulse > 100 ? 'critical' : 'normal',
      referenceRange: '60 - 100 bpm',
      measuredAt: activeBed.vitals.last_taken,
    },
    {
      id: 'v3',
      name: 'Oxygen Saturation (SpO2)',
      value: activeBed.vitals.spo2,
      unit: '%',
      status: activeBed.vitals.spo2 < 95 ? 'critical' : 'normal',
      referenceRange: '95 - 100%',
      measuredAt: activeBed.vitals.last_taken,
    },
    {
      id: 'v4',
      name: 'Temperature',
      value: activeBed.vitals.temp,
      unit: '',
      status: 'normal',
      referenceRange: '97.8 - 99.1°F',
      measuredAt: activeBed.vitals.last_taken,
    },
  ];

  return (
    <div style={{ padding: '1.75rem 2.25rem', maxWidth: 1280, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Section 13 Nursing Station Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '1.75rem',
          paddingBottom: '1.25rem',
          borderBottom: '1px solid var(--border-subtle)',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.78rem',
              fontWeight: 700,
              color: 'var(--teal-intelligent)',
              background: 'var(--teal-subtle)',
              padding: '0.15rem 0.5rem',
              borderRadius: 4,
              border: '1px solid var(--teal-border)',
              letterSpacing: '0.04em',
            }}
          >
            COIMBATORE MEDICAL CENTER • WARD 3B / INPATIENT CARDIOLOGY UNIT
          </span>
          <h1
            style={{
              fontSize: '1.75rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
              letterSpacing: '-0.03em',
              marginTop: '0.2rem',
            }}
          >
            Good morning, Nurse
          </h1>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginTop: '0.75rem',
              flexWrap: 'wrap',
              fontSize: '0.82rem',
              color: 'var(--text-muted)',
            }}
          >
            <span style={{ color: 'var(--text-secondary)' }}>Ward / Unit: <strong>Ward 3B (Inpatient & Step-Down)</strong></span>
            <span style={{ color: 'var(--border-strong)' }}>•</span>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Shift: Day Duty (07:00 - 19:00)</span>
            <span style={{ color: 'var(--border-strong)' }}>•</span>
            <span style={{ fontWeight: 600, color: 'var(--danger-red)' }}>5 Tasks Requiring Attention</span>
            <span style={{ color: 'var(--border-strong)' }}>•</span>
            <span style={{ fontWeight: 600, color: 'var(--teal-intelligent)' }}>6 Assigned Inpatients</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.6rem' }}>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleNurseAssistant('get_medical_summary', 'Prepare SBAR shift handover report for assigned patients')}
          >
            <ClipboardList style={{ width: 14, height: 14 }} /> SBAR Shift Handover
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => handleNurseAssistant('explain_lab_report', 'Check drug compatibility for IV Infusions in Ward 3B')}
          >
            <Sparkles style={{ width: 14, height: 14 }} /> Nursing Protocol Assistant
          </Button>
        </div>
      </div>

      {/* Operational Feedback Notice */}
      {nurseNotice && (
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
          <span>{nurseNotice}</span>
        </div>
      )}

      {/* TASKS REQUIRING ATTENTION (Section 3) */}
      <div
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 8,
          padding: '1.25rem 1.5rem',
          marginBottom: '1.75rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-subtle)' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock style={{ width: 18, height: 18, color: 'var(--warning-amber)' }} />
              Shift Directives & Priority Nursing Tasks
            </h3>
            <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
              Critical timed interventions, pending administration windows, and stat orders
            </span>
          </div>
          <Badge variant="amber">5 Tasks • 2 Time-Sensitive</Badge>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.85rem' }}>
          {/* 1. Stat Med Admin */}
          <div
            style={{
              padding: '0.85rem',
              borderRadius: 6,
              border: '1px solid rgba(239, 68, 68, 0.3)',
              background: 'rgba(239, 68, 68, 0.04)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--danger-red)', textTransform: 'uppercase' }}>
                  STAT MEDICATION
                </span>
                <Badge variant="red">Due 10:00</Badge>
              </div>
              <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                Bed 301-A • Arun Kumar
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                Administer Amlodipine 10mg PO OD (Escalated Dose)
              </div>
            </div>
            <div style={{ marginTop: '0.75rem' }}>
              <button
                className="btn-ui btn-primary-ui"
                style={{ fontSize: '0.74rem', padding: '0.25rem 0.6rem', width: '100%' }}
                onClick={() => {
                  setNurseNotice('STAT medication administration verified and logged for Bed 301-A.');
                  setTimeout(() => setNurseNotice(null), 4000);
                }}
              >
                Log Administration
              </button>
            </div>
          </div>

          {/* 2. Critical Lab Alert */}
          <div
            style={{
              padding: '0.85rem',
              borderRadius: 6,
              border: '1px solid rgba(245, 158, 11, 0.3)',
              background: 'rgba(245, 158, 11, 0.05)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase' }}>
                  LAB ALERT
                </span>
                <Badge variant="amber">Review</Badge>
              </div>
              <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                Bed 301-B • Vikram Singh
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                Serum K+ 5.2 mEq/L. Repeat draw requisitioned.
              </div>
            </div>
            <div style={{ marginTop: '0.75rem' }}>
              <button
                className="btn-ui btn-ghost-ui"
                style={{ fontSize: '0.74rem', padding: '0.25rem 0.6rem', width: '100%', border: '1px solid var(--border-subtle)' }}
                onClick={() => {
                  setNurseNotice('Phlebotomy sample collected and tubed to Central Pathology (LAB-001).');
                  setTimeout(() => setNurseNotice(null), 4000);
                }}
              >
                Collect Blood Sample
              </button>
            </div>
          </div>

          {/* 3. Wound Dressing */}
          <div
            style={{
              padding: '0.85rem',
              borderRadius: 6,
              border: '1px solid var(--border-subtle)',
              background: 'var(--bg-surface-secondary)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  WOUND CHECK
                </span>
                <Badge variant="neutral">Routine</Badge>
              </div>
              <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                Bed 302 • Rajesh Iyer
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                Surgical sternal wound & chest tube drain output
              </div>
            </div>
            <div style={{ marginTop: '0.75rem' }}>
              <button
                className="btn-ui btn-ghost-ui"
                style={{ fontSize: '0.74rem', padding: '0.25rem 0.6rem', width: '100%', border: '1px solid var(--border-subtle)' }}
                onClick={() => {
                  setNurseNotice('Post-op assessment checklist documented in nursing EHR log.');
                  setTimeout(() => setNurseNotice(null), 4000);
                }}
              >
                Log Wound Check
              </button>
            </div>
          </div>

          {/* 4. Care Task */}
          <div
            style={{
              padding: '0.85rem',
              borderRadius: 6,
              border: '1px solid var(--border-subtle)',
              background: 'var(--bg-surface-secondary)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  CARE TASK
                </span>
                <Badge variant="neutral">Routine</Badge>
              </div>
              <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                Room 303 • Meera Nambiar
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                Inspect peripheral IV cannula site & flush with saline
              </div>
            </div>
            <div style={{ marginTop: '0.75rem' }}>
              <button
                className="btn-ui btn-ghost-ui"
                style={{ fontSize: '0.74rem', padding: '0.25rem 0.6rem', width: '100%', border: '1px solid var(--border-subtle)' }}
                onClick={() => {
                  setNurseNotice('IV cannula site checked: patent, no phlebitis or erythema.');
                  setTimeout(() => setNurseNotice(null), 4000);
                }}
              >
                Complete Task
              </button>
            </div>
          </div>

          {/* 5. Patient Transfer */}
          <div
            style={{
              padding: '0.85rem',
              borderRadius: 6,
              border: '1px solid rgba(59, 130, 246, 0.3)',
              background: 'rgba(59, 130, 246, 0.05)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#3b82f6', textTransform: 'uppercase' }}>
                  PATIENT TRANSFER
                </span>
                <Badge variant="brand">Pending Bed</Badge>
              </div>
              <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                Room 304 • Ananya Roy
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                Step-down transfer from ICCU to Ward 3B Room 304
              </div>
            </div>
            <div style={{ marginTop: '0.75rem' }}>
              <button
                className="btn-ui btn-ghost-ui"
                style={{ fontSize: '0.74rem', padding: '0.25rem 0.6rem', width: '100%', border: '1px solid rgba(59, 130, 246, 0.3)', color: '#2563eb' }}
                onClick={() => {
                  setNurseNotice('Bed 304 sanitized and confirmed ready for ICCU transfer intake.');
                  setTimeout(() => setNurseNotice(null), 4000);
                }}
              >
                Accept Intake
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-bar */}
      <div
        style={{
          display: 'flex',
          gap: '0.25rem',
          borderBottom: '1px solid var(--border-subtle)',
          marginBottom: '1.5rem',
          paddingBottom: '0.25rem',
        }}
      >
        {[
          { id: 'bedboard', label: 'Ward Bed Board & Assigned Patients' },
          { id: 'emar', label: 'Electronic Medication Administration (eMAR)' },
          { id: 'vitals_rounding', label: 'Observations & Vital Signs Rounding' },
          { id: 'handover', label: 'Shift Tasks & SBAR Handover' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            style={{
              padding: '0.55rem 1rem',
              fontSize: '0.84rem',
              fontWeight: activeTab === tab.id ? 700 : 500,
              color: activeTab === tab.id ? 'var(--teal-intelligent)' : 'var(--text-secondary)',
              background: activeTab === tab.id ? 'var(--teal-subtle)' : 'transparent',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: WARD BED BOARD & ASSIGNED PATIENTS */}
      {activeTab === 'bedboard' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Active Bed Overview Strip */}
          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 8,
              padding: '1.25rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                  Selected Bed Context
                </span>
                <span style={{ fontWeight: 800, fontSize: '1.15rem', color: 'var(--text-primary)' }}>
                  {activeBed.room} ({activeBed.bed_id})
                </span>
                {getAcuityBadge(activeBed.acuity)}
              </div>
              <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '0.2rem' }}>
                {activeBed.patient_name} • {activeBed.age}y {activeBed.gender} • MRN: {activeBed.patient_id}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                Attending: <strong>{activeBed.attending_doctor}</strong> • Diagnosis: {activeBed.diagnosis}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setActiveTab('emar')}
              >
                <Pill style={{ width: 14, height: 14 }} /> Open eMAR ({activeBed.pending_tasks_count} Tasks)
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setActiveTab('vitals_rounding')}
              >
                <Activity style={{ width: 14, height: 14 }} /> Record Observations
              </Button>
            </div>
          </div>

          {/* Assigned Beds Table */}
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
                <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Assigned Patients (Ward 3B)
                </h4>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Task-oriented clinical roster • Click row to load patient bed context
                </span>
              </div>
              <Badge variant="brand">{inpatients.length} Inpatients Assigned</Badge>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table className="table-ui" style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th>Room</th>
                    <th>Patient</th>
                    <th>Acuity</th>
                    <th>Vitals Status</th>
                    <th>Medication Status</th>
                    <th>Next Task</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {inpatients.map((bed, idx) => {
                    const isSelected = bed.bed_id === selectedBedId;
                    const vitalsStatus = idx === 0 ? 'Due in 15m' : bed.vitals.status === 'critical' ? 'Elevated (Review)' : 'Normal (q4h)';
                    const medStatus = idx === 1 ? '12:00 PM Metoprolol Due' : idx === 0 ? 'Amlodipine Given (08:00)' : 'Next at 14:00 PM';
                    const nextTask = idx === 0 ? 'Record q4h Vitals' : idx === 1 ? 'Administer eMAR Dose' : idx === 2 ? 'Post-Op Wound Check' : 'Routine Rounding';

                    return (
                      <tr
                        key={bed.bed_id}
                        onClick={() => setSelectedBedId(bed.bed_id)}
                        style={{
                          cursor: 'pointer',
                          background: isSelected ? 'var(--forest-subtle)' : 'transparent',
                        }}
                      >
                        <td>
                          <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{bed.room}</div>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{bed.bed_id}</span>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{bed.patient_name}</div>
                          <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                            {bed.patient_id} ({bed.age}y {bed.gender})
                          </span>
                        </td>
                        <td>{getAcuityBadge(bed.acuity)}</td>
                        <td>
                          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: vitalsStatus.includes('Due') ? 'var(--teal-intelligent)' : vitalsStatus.includes('Elevated') ? 'var(--danger-red)' : 'var(--clinical-green)' }}>
                            {vitalsStatus}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            BP {bed.vitals.bp} • HR {bed.vitals.pulse}
                          </div>
                        </td>
                        <td>
                          <div style={{ fontSize: '0.78rem', fontWeight: 600, color: medStatus.includes('Due') ? 'var(--warning-amber)' : 'var(--text-primary)' }}>
                            {medStatus}
                          </div>
                        </td>
                        <td>
                          <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--teal-intelligent)', background: 'rgba(13, 148, 136, 0.08)', padding: '0.2rem 0.45rem', borderRadius: 4 }}>
                            {nextTask}
                          </span>
                        </td>
                        <td>
                          <Button
                            variant={isSelected ? 'primary' : 'secondary'}
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedBedId(bed.bed_id);
                            }}
                          >
                            {isSelected ? 'Active' : 'Select'}
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ELECTRONIC MEDICATION ADMINISTRATION RECORD (eMAR) */}
      {activeTab === 'emar' && (
        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 8,
            padding: '1.25rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Electronic Medication Administration Record (eMAR)
              </h4>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Shift Time Slots • 5 Rights of Medication Administration Verified (Patient, Drug, Dose, Route, Time)
              </span>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <span className="priority-badge-warning" style={{ fontSize: '0.68rem' }}>
                1 DOSE OVERDUE (15m)
              </span>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleNurseAssistant('explain_lab_report', 'Review eMAR allergy cross-checks for Ward 3 East inpatients')}
              >
                <Sparkles style={{ width: 14, height: 14 }} /> Safety Cross-Check
              </Button>
            </div>
          </div>

          {/* Overdue Medication Warning Banner */}
          <div
            style={{
              padding: '0.75rem 1rem',
              borderRadius: 6,
              background: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.5rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <AlertTriangle style={{ width: 16, height: 16, color: 'var(--status-danger)' }} />
              <div>
                <span style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--status-danger)' }}>
                  SCHEDULED MEDICATION OVERDUE WARNING
                </span>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-primary)' }}>
                  <strong>Metoprolol Tartrate 25 mg PO</strong> for <strong>Vikram Singh (Bed 301-B)</strong> was scheduled at 12:00 PM (15m delay).
                </div>
              </div>
            </div>
            <button
              className="btn-ui btn-primary-ui"
              style={{ fontSize: '0.74rem', padding: '0.3rem 0.75rem' }}
              onClick={() => markEmarAdministered('EMAR-401')}
            >
              <Pill style={{ width: 12, height: 12 }} /> Administer Now
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="table-ui" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th>Scheduled Time</th>
                  <th>Patient & Bed</th>
                  <th>Medication & Form</th>
                  <th>Dosage & Route</th>
                  <th>Prescribing Clinician</th>
                  <th>Administration Status</th>
                  <th>Special Clinical Instructions</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {emarTasks.map((task) => (
                  <tr key={task.task_id} style={{ background: task.status === 'DUE' ? 'var(--warning-amber-bg)' : 'transparent' }}>
                    <td>
                      <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-primary)' }}>
                        {task.scheduled_time}
                      </div>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Slot ID: {task.task_id}</span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{task.patient_name}</div>
                      <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>{task.bed_id}</span>
                    </td>
                    <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{task.medication}</td>
                    <td>
                      <span style={{ fontWeight: 600 }}>{task.dosage}</span>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{task.route}</div>
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{task.prescribed_by}</td>
                    <td>
                      {task.status === 'ADMINISTERED' ? (
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: 4, background: 'var(--clinical-green-bg)', color: 'var(--clinical-green)' }}>
                          ADMINISTERED
                        </span>
                      ) : task.status === 'DUE' ? (
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: 4, background: 'var(--warning-amber-border)', color: 'var(--warning-amber)', border: '1px solid var(--warning-amber)' }}>
                          DUE NOW
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.72rem', fontWeight: 600, padding: '0.15rem 0.5rem', borderRadius: 4, background: 'var(--bg-app)', color: 'var(--text-muted)' }}>
                          PENDING
                        </span>
                      )}
                    </td>
                    <td style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', maxWidth: 220 }}>
                      {task.notes || 'Routine administration per protocol'}
                    </td>
                    <td>
                      {task.status !== 'ADMINISTERED' ? (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => markEmarAdministered(task.task_id)}
                        >
                          <CheckCircle2 style={{ width: 14, height: 14 }} /> Record Dose
                        </Button>
                      ) : (
                        <span style={{ fontSize: '0.76rem', color: 'var(--clinical-green)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <CheckCircle2 style={{ width: 14, height: 14 }} /> Verified
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: OBSERVATIONS & VITAL SIGNS ROUNDING */}
      {activeTab === 'vitals_rounding' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
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
                  Vital Signs Rounding: {activeBed.patient_name} ({activeBed.room})
                </h4>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Early Warning Score (EWS): <strong>{activeBed.vitals.status === 'critical' ? 'Score 4 (Urgent Escalation)' : 'Score 0 (Stable)'}</strong>
                </span>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleNurseAssistant('explain_lab_report', `Evaluate vital signs trends for ${activeBed.patient_name} on ${activeBed.room}`)}
              >
                <Sparkles style={{ width: 14, height: 14 }} /> AI Deterioration Risk Scan
              </Button>
            </div>

            <VitalSignsGrid
              vitals={activeBedVitals}
              patientAcuity={activeBed.acuity}
              lastTaken={activeBed.vitals.last_taken}
            />
          </div>
        </div>
      )}

      {/* TAB 4: SHIFT TASKS & SBAR HANDOVER */}
      {activeTab === 'handover' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
          {/* Shift Checklist */}
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
                  Shift Care Tasks Checklist
                </h4>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Day Shift Protocol • Ward 3 East</span>
              </div>
              <Badge variant="brand">
                {shiftTasks.filter((t) => t.completed).length} / {shiftTasks.length} Completed
              </Badge>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {shiftTasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => toggleShiftTask(task.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem 0.9rem',
                    borderRadius: 6,
                    border: '1px solid',
                    borderColor: task.completed ? 'var(--forest-border)' : 'var(--border-subtle)',
                    background: task.completed ? 'var(--forest-subtle)' : 'var(--bg-app)',
                    cursor: 'pointer',
                  }}
                >
                  <div
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: 4,
                      border: '1.5px solid',
                      borderColor: task.completed ? 'var(--forest-brand)' : 'var(--border-strong)',
                      background: task.completed ? 'var(--forest-brand)' : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                    }}
                  >
                    {task.completed && <CheckCircle2 style={{ width: 12, height: 12 }} />}
                  </div>
                  <span
                    style={{
                      fontSize: '0.84rem',
                      color: task.completed ? 'var(--text-secondary)' : 'var(--text-primary)',
                      textDecoration: task.completed ? 'line-through' : 'none',
                    }}
                  >
                    {task.title}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* SBAR Shift Handover Summary */}
          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 8,
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  SBAR Shift Handover Draft
                </h4>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Standardized Hospital Clinical Transmission
                </span>
              </div>
              <Badge variant="green">Ready for Review</Badge>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.82rem', background: 'var(--bg-app)', padding: '1rem', borderRadius: 6, border: '1px solid var(--border-subtle)' }}>
              <div>
                <strong style={{ color: 'var(--forest-brand)' }}>S — Situation:</strong> 4 assigned inpatients on Ward 3 East & ICCU. Bed 201 (Rajesh Iyer) critical on Heparin infusion.
              </div>
              <div>
                <strong style={{ color: 'var(--forest-brand)' }}>B — Background:</strong> Bed 301-A (Arun Kumar) stable post-workup for HTN & mild anemia. Bed 301-B (Vikram Singh) post-MI stepdown, scheduled for echo tomorrow.
              </div>
              <div>
                <strong style={{ color: 'var(--forest-brand)' }}>A — Assessment:</strong> All scheduled 08:00 doses administered. Bed 304 hydration infusion running smoothly @ 125 mL/hr.
              </div>
              <div>
                <strong style={{ color: 'var(--forest-brand)' }}>R — Recommendation:</strong> Monitor Bed 201 aPTT result due from lab at 16:00. Evening medication rounds due at 20:00.
              </div>
            </div>

            <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
              <Button
                variant="primary"
                size="sm"
                style={{ width: '100%' }}
                onClick={() => handleNurseAssistant('get_medical_summary', 'Format and transmit SBAR handover note to oncoming evening nurse')}
              >
                <Send style={{ width: 14, height: 14 }} /> Finalize & Transmit SBAR Handover
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* AI Assistant Output Section */}
      {(loading || output) && (
        <div
          style={{
            marginTop: '1.5rem',
            background: 'var(--bg-surface)',
            border: '1px solid var(--forest-border)',
            borderRadius: 8,
            padding: '1.25rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.85rem' }}>
            <Sparkles style={{ width: 16, height: 16, color: 'var(--forest-brand)' }} />
            <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              MEDION Clinical Nurse Assistant
            </h4>
          </div>

          {loading ? (
            <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <Activity style={{ width: 20, height: 20, margin: '0 auto 0.5rem', animation: 'spin 2s linear infinite' }} />
              <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Checking clinical protocol & pharmacological guidance...</div>
            </div>
          ) : (
            <div style={{ background: 'var(--bg-app)', padding: '1rem', borderRadius: 6, border: '1px solid var(--border-subtle)' }}>
              <HumanResponseRenderer response={output} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
