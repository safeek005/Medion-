import React, { useState } from 'react';
import { WorkspaceHeader } from '../../components/common/WorkspaceHeader';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { CareTimeline, TimelineEvent } from '../../components/ui/CareTimeline';
import { VitalSignsGrid, VitalSignItem } from '../../components/ui/VitalSignsGrid';
import { ClinicalReviewDrawer, ProposedClinicalAction } from '../../components/intelligence/ClinicalReviewDrawer';
import { dispatchToWorkbench } from '../../api/workbench';
import { ExecutionTraceStep } from '../../types';
import { HumanResponseRenderer } from '../../components/intelligence/HumanResponseRenderer';
import {
  MOCK_PATIENT,
  MOCK_PATIENTS_LIST,
  MOCK_LAB_REPORT,
  MOCK_PRESCRIPTIONS,
  MOCK_APPOINTMENTS,
} from '../../data/mockDatasets';
import {
  useSharedPatients,
  useSharedAppointments,
  useSharedLabReports,
  useSharedPrescriptions,
  dataService,
} from '../../services/dataService';
import {
  Search,
  FlaskConical,
  TrendingDown,
  FileText,
  Activity,
  Calendar,
  Sparkles,
  AlertTriangle,
  Stethoscope,
  Pill,
  CheckCircle2,
  Clock,
  User,
  Check,
  ChevronRight,
  ShieldAlert,
  ArrowUpRight,
  ClipboardList,
} from 'lucide-react';

interface DoctorWorkspaceProps {
  onTraceGenerated: (step: ExecutionTraceStep) => void;
}

export const DoctorWorkspace: React.FC<DoctorWorkspaceProps> = ({ onTraceGenerated }) => {
  const patients = useSharedPatients();
  const appointments = useSharedAppointments();
  const sharedPrescriptions = useSharedPrescriptions();
  const sharedLabReports = useSharedLabReports();

  const [selectedPatientId, setSelectedPatientId] = useState('PAT-1001');
  const [activeTab, setActiveTab] = useState<'clinical' | 'lab' | 'rx' | 'timeline'>('clinical');
  const [output, setOutput] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [approvalStatus, setApprovalStatus] = useState<'pending' | 'approved' | 'rejected'>('pending');

  const activePatient =
    patients.find((p) => p.patient_id.toUpperCase() === selectedPatientId.toUpperCase()) ||
    MOCK_PATIENTS_LIST.find((p) => p.patient_id.toUpperCase() === selectedPatientId.toUpperCase()) ||
    MOCK_PATIENT;

  const patientAllergiesList: string[] = Array.isArray(activePatient.allergies)
    ? activePatient.allergies
    : activePatient.allergies
    ? [String(activePatient.allergies)]
    : [];

  // Patient-specific dynamic prescriptions and lab reports
  const patientPrescriptions = sharedPrescriptions.filter(
    (rx) => rx.patient_id.toUpperCase() === selectedPatientId.toUpperCase()
  );
  const patientLabReports = sharedLabReports.filter(
    (lr) => lr.patient_id.toUpperCase() === selectedPatientId.toUpperCase()
  );

  // Active AI clinical action proposal dynamically tailored to patient
  const activeProposal: ProposedClinicalAction = selectedPatientId === 'PAT-1025'
    ? {
        id: 'PROP-MED-4092',
        actionType: 'prescription_change',
        title: 'Cholecalciferol High-Dose Repletion Protocol for Severe Hypovitaminosis D',
        patient: {
          id: activePatient.patient_id,
          name: `${activePatient.first_name} ${activePatient.last_name}`,
          dob: activePatient.date_of_birth,
          allergies: patientAllergiesList.length > 0 ? patientAllergiesList : ['Sulfonamides'],
        },
        currentStatus: 'Cholecalciferol 60,000 IU PO Weekly (Serum 25-OH Vit D 14.2 ng/mL)',
        proposedChange: {
          item: 'Cholecalciferol 60,000 IU Weekly for 8 Weeks + Elemental Calcium 500mg daily',
          detail: 'Complete 8-week weekly loading dose followed by maintenance 2,000 IU daily.',
          previous: 'No prior supplementation documented',
        },
        clinicalRationale:
          'Serum 25-hydroxyvitamin D level 14.2 ng/mL indicates clinical deficiency (< 20 ng/mL). Endocrine Society guidelines mandate high-dose repletion followed by maintenance.',
        contraindications: [
          'Hypercalcemia Screen: Serum Calcium 9.1 mg/dL (Normal). No nephrolithiasis history.',
          'Safe with documented Sulfonamide allergy.',
        ],
        reviewingClinician: {
          name: 'Dr. Rajesh Mehta, MD',
          role: 'Attending Physician',
          department: 'Department of Internal Medicine',
        },
      }
    : selectedPatientId === 'PAT-1006'
    ? {
        id: 'PROP-MED-4093',
        actionType: 'prescription_change',
        title: 'Dual Antiplatelet Therapy (DAPT) Optimization for Unstable Angina Step-Down',
        patient: {
          id: activePatient.patient_id,
          name: `${activePatient.first_name} ${activePatient.last_name}`,
          dob: activePatient.date_of_birth,
          allergies: patientAllergiesList.length > 0 ? patientAllergiesList : ['No Known Drug Allergies'],
        },
        currentStatus: 'Aspirin 75mg daily + Clopidogrel 75mg daily',
        proposedChange: {
          item: 'Add High-Intensity Statin: Rosuvastatin 40mg PO OD Bedtime',
          detail: 'Escalate statin intensity per ACC/AHA NSTE-ACS guidelines given Troponin T elevation.',
          previous: 'Atorvastatin 20mg PO OD',
        },
        clinicalRationale:
          'Elevated Troponin T (0.048 ng/mL) warrants aggressive secondary prevention lipid management and continued DAPT monitoring.',
        contraindications: [
          'Hepatic Function Screen: Baseline AST/ALT within normal limits.',
          'Bleeding Risk: HAS-BLED score 1 (Low).',
        ],
        reviewingClinician: {
          name: 'Dr. Rajesh Mehta, MD',
          role: 'Senior Consultant Interventional Cardiologist',
          department: 'Department of Cardiovascular Medicine',
        },
      }
    : {
        id: 'PROP-MED-4091',
        actionType: 'prescription_change',
        title: 'Titration of Antihypertensive Regimen for Stage 1 Hypertension',
        patient: {
          id: activePatient.patient_id,
          name: `${activePatient.first_name} ${activePatient.last_name}`,
          dob: activePatient.date_of_birth,
          allergies: patientAllergiesList.length > 0 ? patientAllergiesList : ['Penicillin (Cutaneous Rash)'],
        },
        currentStatus: 'Amlodipine 5 mg PO daily (Persistent Blood Pressure 138/86 mmHg)',
        proposedChange: {
          item: 'Amlodipine Besylate 10 mg PO OD + Telmisartan 40 mg PO OD',
          detail: 'Escalate Amlodipine from 5mg to 10mg once daily; introduce ARB Telmisartan 40mg once daily morning.',
          previous: 'Amlodipine 5 mg PO OD alone',
        },
        clinicalRationale:
          'Consecutive 14-day ambulatory blood pressure monitoring demonstrates mean systolic pressure 138-144 mmHg (target < 130/80 mmHg per ACC/AHA guidelines). Co-existing hyperlipidemia (LDL 142 mg/dL) elevates 10-year ASCVD risk score to 8.4%.',
        contraindications: [
          'ARB Contraindication Screen: No bilateral renal artery stenosis or hyperkalemia on recent metabolic panel (Serum K+ 4.2 mEq/L, Creatinine 0.95 mg/dL).',
          'Allergy Cross-Reaction Screen: Safe with documented Penicillin cutaneous allergy.',
        ],
        reviewingClinician: {
          name: 'Dr. Rajesh Mehta, MD',
          role: 'Senior Consultant Interventional Cardiologist',
          department: 'Department of Cardiovascular Medicine',
        },
      };

  // Today's patient queue
  const todayQueue = [
    {
      id: 'PAT-1001',
      name: 'Arun Kumar',
      time: '10:00 AM',
      age: 42,
      gender: 'Male',
      reason: 'Cardiology Follow-Up & Lipid Panel',
      priority: 'STAT',
      priorityVariant: 'red' as const,
      status: 'In Consultation Room 4B',
      lastInteraction: 'Sep 15 16:30 (Nurse Vitals)',
      currentConcern: 'Stage 1 HTN (138/88 mmHg) & Borderline High LDL (142 mg/dL)',
      nextAction: 'Titrate Amlodipine & sign ARB order',
      unreadAction: 'AI Rx Review',
    },
    {
      id: 'PAT-1025',
      name: 'Kavya Sharma',
      time: '10:30 AM',
      age: 28,
      gender: 'Female',
      reason: 'Preventive Care & Vitamin D Repletion Review',
      priority: 'ROUTINE',
      priorityVariant: 'neutral' as const,
      status: 'Checked In / OPD Suite 4B',
      lastInteraction: 'Sep 14 09:30 (Lab Vit-D/CBC)',
      currentConcern: 'Severe Hypovitaminosis D (14.2 ng/mL) with fatigue',
      nextAction: 'Review 8-week weekly loading protocol',
      unreadAction: 'AI Rx Review',
    },
    {
      id: 'PAT-1006',
      name: 'Rajesh Iyer',
      time: '11:30 AM',
      age: 61,
      gender: 'Male',
      reason: 'Unstable Angina / Coronary Care Step-Down',
      priority: 'STAT',
      priorityVariant: 'red' as const,
      status: 'ICCU Bed 201',
      lastInteraction: 'Sep 16 09:15 (ECG Recorded)',
      currentConcern: 'Elevated Troponin T (0.048 ng/mL) with chest tightness',
      nextAction: 'Review repeat biomarker & schedule Cath Lab slot',
      unreadAction: 'AI Rx Review',
    },
    {
      id: 'PAT-1003',
      name: 'Vikram Singh',
      time: '11:00 AM',
      age: 58,
      gender: 'Male',
      reason: 'Post-MI Inpatient Step-Down Review',
      priority: 'URGENT',
      priorityVariant: 'amber' as const,
      status: 'Ward 3 East Bed 301-B',
      lastInteraction: 'Sep 16 08:00 (Morning Rounding)',
      currentConcern: 'Mild orthostatic dizziness post-ACE inhibitor dose',
      nextAction: 'Check postural vitals & adjust morning diuretic',
    },
    {
      id: 'PAT-1002',
      name: 'Sneha Sharma',
      time: '12:00 PM',
      age: 33,
      gender: 'Female',
      reason: 'Thyroid Panel & Fatigue Evaluation',
      priority: 'ROUTINE',
      priorityVariant: 'neutral' as const,
      status: 'Checked In / Waiting Area',
      lastInteraction: 'Sep 10 (OPD Intake)',
      currentConcern: 'Borderline elevated TSH (4.8 mIU/L), normal free T4',
      nextAction: 'Clinical counseling on thyroid autoantibody screening',
    },
  ];

  // Dynamic longitudinal patient vitals
  const currentVitals: VitalSignItem[] = selectedPatientId === 'PAT-1025'
    ? [
        { id: 'v1', name: 'Blood Pressure', value: '116/74', unit: 'mmHg', status: 'normal', referenceRange: '< 120/80 mmHg', measuredAt: 'Sep 14, 2026' },
        { id: 'v2', name: 'Heart Rate', value: 72, unit: 'bpm', status: 'normal', referenceRange: '60 - 100 bpm', measuredAt: 'Sep 14, 2026' },
        { id: 'v3', name: 'SpO2 Oxygen Saturation', value: 99, unit: '%', status: 'normal', referenceRange: '95 - 100%', measuredAt: 'Sep 14, 2026' },
        { id: 'v4', name: 'Fasting Blood Sugar', value: 86, unit: 'mg/dL', status: 'normal', referenceRange: '70 - 99 mg/dL', measuredAt: 'Sep 14, 2026' },
        { id: 'v5', name: '25-OH Vitamin D', value: 14.2, unit: 'ng/mL', status: 'critical', referenceRange: '30 - 100 ng/mL', measuredAt: 'Sep 14, 2026' },
      ]
    : selectedPatientId === 'PAT-1006'
    ? [
        { id: 'v1', name: 'Blood Pressure', value: '146/92', unit: 'mmHg', status: 'elevated', referenceRange: '< 120/80 mmHg', measuredAt: 'Sep 16, 2026' },
        { id: 'v2', name: 'Heart Rate', value: 88, unit: 'bpm', status: 'normal', referenceRange: '60 - 100 bpm', measuredAt: 'Sep 16, 2026' },
        { id: 'v3', name: 'SpO2 Oxygen Saturation', value: 96, unit: '%', status: 'normal', referenceRange: '95 - 100%', measuredAt: 'Sep 16, 2026' },
        { id: 'v4', name: 'Cardiac Troponin T', value: 0.048, unit: 'ng/mL', status: 'critical', referenceRange: '< 0.014 ng/mL', measuredAt: 'Sep 16, 2026' },
        { id: 'v5', name: 'Serum Creatinine', value: 1.1, unit: 'mg/dL', status: 'normal', referenceRange: '0.7 - 1.3 mg/dL', measuredAt: 'Sep 16, 2026' },
      ]
    : [
        { id: 'v1', name: 'Blood Pressure', value: '138/88', unit: 'mmHg', status: 'elevated', referenceRange: '< 120/80 mmHg', measuredAt: 'Sep 15, 2026' },
        { id: 'v2', name: 'Heart Rate', value: 78, unit: 'bpm', status: 'normal', referenceRange: '60 - 100 bpm', measuredAt: 'Sep 15, 2026' },
        { id: 'v3', name: 'SpO2 Oxygen Saturation', value: 98, unit: '%', status: 'normal', referenceRange: '95 - 100%', measuredAt: 'Sep 15, 2026' },
        { id: 'v4', name: 'Fasting Blood Sugar', value: 92, unit: 'mg/dL', status: 'normal', referenceRange: '70 - 99 mg/dL', measuredAt: 'Sep 14, 2026' },
        { id: 'v5', name: 'Serum Creatinine', value: 0.95, unit: 'mg/dL', status: 'normal', referenceRange: '0.7 - 1.3 mg/dL', measuredAt: 'Sep 14, 2026' },
      ];

  // Care timeline
  const doctorCareTimeline: TimelineEvent[] = [
    {
      id: 'det-1',
      date: '2026-09-14',
      time: '09:45 AM',
      title: 'Outpatient Triage & Vitals Acquisition',
      type: 'vital',
      clinician: 'Staff Nurse Ananya R., RN',
      facility: 'OPD Suite 4B',
      description: 'Vitals recorded. Patient reports consistent adherence to prescribed therapy.',
      status: 'COMPLETED',
      statusVariant: 'brand',
    },
    {
      id: 'det-2',
      date: '2026-09-10',
      time: '04:00 PM',
      title: 'Outpatient Cardiology Follow-Up Consultation',
      type: 'encounter',
      clinician: 'Dr. Rajesh Mehta, MD',
      facility: 'Cardiology Clinic',
      description: 'Evaluated treatment response. Ordered comprehensive diagnostic panel and ambulatory tracking.',
      status: 'RECORDED',
      statusVariant: 'green',
    },
    {
      id: 'det-3',
      date: '2026-09-08',
      time: '09:30 AM',
      title: 'Central Pathology Laboratory Panel',
      type: 'lab',
      clinician: 'Dr. S. Kulkarni, Pathologist',
      facility: 'Clinical Biochemistry & Hematology',
      description: 'Comprehensive diagnostic panel processed and validated in NABL laboratory information system.',
      status: 'VERIFIED',
      statusVariant: 'amber',
    },
  ];

  const handleAction = async (actionType: string) => {
    setLoading(true);
    setOutput(null);

    let targetAgent: any = 'medical';
    let payload: Record<string, any> = {};

    if (actionType === 'search_patient') {
      targetAgent = 'patient';
      payload = { query: selectedPatientId };
    } else if (actionType === 'analyze_lab_report') {
      payload = { patient_id: selectedPatientId, report_id: 'LABR-1001' };
    } else if (actionType === 'compare_lab_reports') {
      payload = { patient_id: selectedPatientId, current_report_id: 'LABR-1001', previous_report_id: 'LABR-0990' };
    } else if (actionType === 'get_medical_summary') {
      payload = { patient_id: selectedPatientId };
    } else if (actionType === 'explain_lab_report') {
      payload = { patient_id: selectedPatientId, report_id: 'LABR-1001', audience: 'doctor' };
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

  const handleApproveProposal = async (proposal: ProposedClinicalAction, notes?: string) => {
    setApprovalStatus('approved');
    setIsReviewOpen(false);

    const requestPayload = {
      workflow_id: `WF-APPROVAL-${Date.now().toString().slice(-4)}`,
      agent_target: 'medical' as any,
      action: 'sign_clinical_order',
      portal_source: 'doctor',
      payload: {
        proposal_id: proposal.id,
        patient_id: proposal.patient.id,
        doctor_id: 'DOC-101',
        approved_by: 'Dr. Rajesh Mehta, MD',
        clinician_notes: notes || 'Approved titration based on ambulatory readings.',
        medications: [
          {
            medicine_name: 'Amlodipine Besylate',
            dosage: '10mg',
            frequency: 'Once daily (Morning)',
            duration_days: 30,
          },
          {
            medicine_name: 'Telmisartan',
            dosage: '40mg',
            frequency: 'Once daily (Morning)',
            duration_days: 30,
          },
        ],
      },
    };

    const startTime = performance.now();
    const response = await dispatchToWorkbench(requestPayload);
    const duration = Math.round(performance.now() - startTime);

    // Persist to local data service so prescription list immediately reflects the signed order
    const createdRx = dataService.addPrescription({
      prescription_id: (response as any)?.prescription_id || `RX-${Date.now().toString().slice(-4)}`,
      patient_id: proposal.patient.id,
      doctor_id: 'DOC-101',
      medications: [
        {
          name: 'Amlodipine Besylate',
          dosage: '10mg',
          frequency: 'Once daily (Morning)',
          duration: '30 days',
          status: 'Active',
        },
        {
          name: 'Telmisartan',
          dosage: '40mg',
          frequency: 'Once daily (Morning)',
          duration: '30 days',
          status: 'Active',
        },
      ],
      instructions: `Dual-agent regimen signed by Dr. Rajesh Mehta, MD. ${notes || 'Approved titration based on ambulatory readings.'}`,
      status: 'ACTIVE',
    });

    onTraceGenerated({
      id: `TR-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toLocaleTimeString(),
      workflowId: requestPayload.workflow_id,
      portalSource: 'doctor',
      agentTarget: 'medical',
      action: 'sign_clinical_order',
      durationMs: duration,
      success: response.success !== false,
      request: requestPayload as any,
      response: (response?.success ? response : {
        status: 'ORDER_SIGNED',
        message: 'Order transmitted to MEDION Pharmacy and updated in patient EHR chart.',
        order_id: (response as any)?.order_id || `ORD-RX-${Date.now().toString().slice(-4)}`,
        prescription: createdRx,
      }) as any,
    });
  };

  const handleRejectProposal = async (proposal: ProposedClinicalAction, reason: string) => {
    setApprovalStatus('rejected');
    setIsReviewOpen(false);

    onTraceGenerated({
      id: `TR-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toLocaleTimeString(),
      workflowId: `WF-REJECT-${Date.now().toString().slice(-4)}`,
      portalSource: 'doctor',
      agentTarget: 'medical',
      action: 'reject_clinical_proposal',
      durationMs: 120,
      success: true,
      request: { proposal_id: proposal.id, reason } as any,
      response: { status: 'PROPOSAL_REJECTED', reason } as any,
    });
  };

  return (
    <div style={{ padding: '1.75rem 2.25rem', maxWidth: 1280, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Section 12 Physician Workspace Header */}
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
            COIMBATORE MEDICAL CENTER • ATTENDING CARDIOLOGIST DESK
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
            Good morning, Dr. Rajesh
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
            <span style={{ color: 'var(--text-secondary)' }}>Today:</span>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>12 appointments</span>
            <span style={{ color: 'var(--border-strong)' }}>•</span>
            <span style={{ fontWeight: 600, color: 'var(--warning-amber)' }}>4 pending reviews</span>
            <span style={{ color: 'var(--border-strong)' }}>•</span>
            <span style={{ fontWeight: 600, color: 'var(--teal-intelligent)' }}>3 lab results</span>
            <span style={{ color: 'var(--border-strong)' }}>•</span>
            <span style={{ fontWeight: 700, color: 'var(--danger-red)' }}>2 urgent alerts</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.6rem' }}>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleAction('get_medical_summary')}
          >
            <FileText style={{ width: 14, height: 14 }} /> Longitudinal Summary
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => handleAction('analyze_lab_report')}
          >
            <FlaskConical style={{ width: 14, height: 14 }} /> Analyze Lab Diagnostics
          </Button>
        </div>
      </div>

      {/* 4-Metric Strip */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
          marginBottom: '1.75rem',
        }}
      >
        <div className="metric-strip-card">
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
            Patients Today
          </span>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '0.2rem' }}>
            <span className="clinical-stat-val" style={{ fontSize: '1.5rem', color: 'var(--text-primary)' }}>
              12
            </span>
            <Badge variant="brand">8 Outpatient • 4 Inpatient</Badge>
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Cardiology Suite 4B & Ward 3B</span>
        </div>

        <div className="metric-strip-card">
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
            Pending Reviews
          </span>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '0.2rem' }}>
            <span className="clinical-stat-val" style={{ fontSize: '1.5rem', color: 'var(--warning-amber)' }}>
              4
            </span>
            <Badge variant="amber">Action Required</Badge>
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>1 Medication Titration • 3 Discharge Summaries</span>
        </div>

        <div className="metric-strip-card">
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
            Critical Lab Results
          </span>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '0.2rem' }}>
            <span className="clinical-stat-val" style={{ fontSize: '1.5rem', color: 'var(--danger-red)' }}>
              3
            </span>
            <Badge variant="red">STAT Flagged</Badge>
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Troponin T, K+ 5.8 mEq, Low Hb 8.2</span>
        </div>

        <div className="metric-strip-card">
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
            Confirmed Appointments
          </span>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '0.2rem' }}>
            <span className="clinical-stat-val" style={{ fontSize: '1.5rem', color: 'var(--clinical-green)' }}>
              8
            </span>
            <Badge variant="green">On Schedule</Badge>
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Next slot: 11:30 AM (Sneha Sharma)</span>
        </div>
      </div>

      {/* Two-Column Master-Detail Layout */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(320px, 360px) 1fr',
          gap: '1.5rem',
          alignItems: 'start',
        }}
      >
        {/* LEFT COLUMN: TODAY'S CLINICAL SCHEDULE & WORK QUEUE */}
        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 8,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: '1rem 1.25rem',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Today's Patient Schedule
              </h3>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Cardiology Suite 4B & Wards</span>
            </div>
            <Badge variant="brand">{todayQueue.length} Assigned</Badge>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {todayQueue.map((item) => {
              const isSelected = item.id === selectedPatientId;
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedPatientId(item.id)}
                  style={{
                    padding: '1rem 1.25rem',
                    borderBottom: '1px solid var(--border-subtle)',
                    cursor: 'pointer',
                    background: isSelected ? 'var(--forest-subtle)' : 'transparent',
                    borderLeft: isSelected ? '3px solid var(--forest-brand)' : '3px solid transparent',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.94rem', color: 'var(--text-primary)' }}>
                        {item.name}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                        {item.id}
                      </span>
                    </div>
                    <Badge variant={item.priorityVariant as any}>{item.priority}</Badge>
                  </div>

                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                    <strong>Reason:</strong> {item.reason}
                  </div>

                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Clock style={{ width: 11, height: 11 }} />
                    <span>Last: {item.lastInteraction}</span>
                  </div>

                  <div style={{ fontSize: '0.76rem', color: 'var(--danger-red)', marginBottom: '0.35rem', background: 'rgba(239, 68, 68, 0.05)', padding: '0.25rem 0.4rem', borderRadius: 4, border: '1px solid rgba(239, 68, 68, 0.15)' }}>
                    <strong>Concern:</strong> {item.currentConcern}
                  </div>

                  <div style={{ fontSize: '0.74rem', color: 'var(--teal-intelligent)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <ChevronRight style={{ width: 12, height: 12 }} />
                    <span>Next: {item.nextAction}</span>
                  </div>

                  {item.unreadAction && approvalStatus === 'pending' && (
                    <div
                      style={{
                        marginTop: '0.5rem',
                        padding: '0.25rem 0.5rem',
                        background: 'var(--warning-amber-bg)',
                        border: '1px solid var(--warning-amber-border)',
                        borderRadius: 4,
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        color: 'var(--warning-amber)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                      }}
                    >
                      <Sparkles style={{ width: 12, height: 12 }} /> {item.unreadAction} Requires Sign-Off
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: ACTIVE PATIENT CLINICAL CONTEXT & DECISION WORKSPACE */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Active Patient Identity & Header Strip - Sticky High-Density Context Bar */}
          <div
            className="sticky-context-bar"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {activePatient.first_name} {activePatient.last_name}
                  </h2>
                  <Badge variant="brand">{activePatient.patient_id}</Badge>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    DOB: {activePatient.date_of_birth} • Blood Group: <strong>{activePatient.blood_group || 'O+'}</strong>
                  </span>
                  <span className="priority-badge-warning" style={{ fontSize: '0.68rem' }}>
                    {selectedPatientId === 'PAT-1025'
                      ? 'HYPOVITAMINOSIS D'
                      : selectedPatientId === 'PAT-1006'
                      ? 'UNSTABLE ANGINA / ACS'
                      : selectedPatientId === 'PAT-1003'
                      ? 'POST-MI STEP-DOWN'
                      : selectedPatientId === 'PAT-1002'
                      ? 'HYPOTHYROIDISM'
                      : 'STAGE 1 HYPERTENSION'}
                  </span>
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  Insurance: {activePatient.insurance_policy_id || 'POL-701'} (Pre-Authorized) • Attending: Dr. Rajesh Mehta • Room: OPD 4B
                </div>
              </div>

              {/* Allergy Warning Pill & Critical Lab Flag */}
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {patientAllergiesList.length > 0 ? (
                  <div
                    style={{
                      padding: '0.35rem 0.75rem',
                      borderRadius: 6,
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid rgba(239, 68, 68, 0.35)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.45rem',
                    }}
                  >
                    <ShieldAlert style={{ width: 15, height: 15, color: 'var(--status-danger)' }} />
                    <div>
                      <div style={{ fontSize: '0.66rem', fontWeight: 700, color: 'var(--status-danger)', textTransform: 'uppercase' }}>
                        ALLERGIES
                      </div>
                      <div style={{ fontSize: '0.74rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {patientAllergiesList.join(', ')}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    style={{
                      padding: '0.35rem 0.75rem',
                      borderRadius: 6,
                      background: 'var(--clinical-green-bg)',
                      border: '1px solid var(--clinical-green)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.45rem',
                    }}
                  >
                    <CheckCircle2 style={{ width: 15, height: 15, color: 'var(--clinical-green)' }} />
                    <div>
                      <div style={{ fontSize: '0.66rem', fontWeight: 700, color: 'var(--clinical-green)', textTransform: 'uppercase' }}>
                        ALLERGIES
                      </div>
                      <div style={{ fontSize: '0.74rem', fontWeight: 600, color: 'var(--clinical-green)' }}>
                        No Known Drug Allergies (NKDA)
                      </div>
                    </div>
                  </div>
                )}

                <div
                  style={{
                    padding: '0.35rem 0.75rem',
                    borderRadius: 6,
                    background: 'rgba(245, 158, 11, 0.1)',
                    border: '1px solid rgba(245, 158, 11, 0.35)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                  }}
                >
                  <AlertTriangle style={{ width: 15, height: 15, color: '#f59e0b' }} />
                  <div>
                    <div style={{ fontSize: '0.66rem', fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase' }}>
                      LAB STATUS FLAG
                    </div>
                    <div style={{ fontSize: '0.74rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {selectedPatientId === 'PAT-1025'
                        ? '25-OH Vit D: 14.2 ng/mL [DEFICIENT]'
                        : selectedPatientId === 'PAT-1006'
                        ? 'Troponin T: 0.048 ng/mL [CRITICAL HIGH]'
                        : selectedPatientId === 'PAT-1003'
                        ? 'Serum K+: 5.2 mEq/L [BORDERLINE]'
                        : 'LDL: 158 mg/dL • Chol: 242 mg/dL [HIGH]'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Clinician Quick Order Action Bar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: '0.5rem',
                borderTop: '1px solid var(--border-subtle)',
                fontSize: '0.74rem',
                flexWrap: 'wrap',
                gap: '0.5rem',
              }}
            >
              <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Quick Clinical Directives:</span>
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                <button
                  className="btn-ui btn-ghost-ui"
                  style={{ fontSize: '0.72rem', padding: '0.25rem 0.55rem', border: '1px solid var(--border-subtle)' }}
                  onClick={() => handleAction('analyze_lab_report')}
                >
                  <FlaskConical style={{ width: 12, height: 12, color: 'var(--status-danger)' }} /> STAT Troponin I
                </button>
                <button
                  className="btn-ui btn-ghost-ui"
                  style={{ fontSize: '0.72rem', padding: '0.25rem 0.55rem', border: '1px solid var(--border-subtle)' }}
                  onClick={() => handleAction('get_medical_summary')}
                >
                  <Activity style={{ width: 12, height: 12, color: '#60a5fa' }} /> 12-Lead ECG
                </button>
                <button
                  className="btn-ui btn-ghost-ui"
                  style={{ fontSize: '0.72rem', padding: '0.25rem 0.55rem', border: '1px solid var(--border-subtle)' }}
                  onClick={() => handleAction('explain_lab_report')}
                >
                  <Stethoscope style={{ width: 12, height: 12, color: 'var(--color-primary-light)' }} /> 2D Echo
                </button>
                {activeProposal && (
                  <button
                    className="btn-ui btn-primary-ui"
                    style={{ fontSize: '0.72rem', padding: '0.25rem 0.65rem' }}
                    onClick={() => setIsReviewOpen(true)}
                  >
                    <Sparkles style={{ width: 12, height: 12 }} /> Review AI Order
                  </button>
                )}
              </div>
            </div>

            {/* HUMAN-IN-THE-LOOP ACTION CENTER BANNER */}
            {activeProposal && (
              <div
                style={{
                  marginTop: '0.25rem',
                  padding: '0.9rem 1.1rem',
                  borderRadius: 6,
                  background: approvalStatus === 'approved' ? 'var(--clinical-green-bg)' : approvalStatus === 'rejected' ? 'var(--bg-app)' : 'var(--forest-subtle)',
                  border: '1px solid',
                  borderColor: approvalStatus === 'approved' ? 'var(--clinical-green)' : approvalStatus === 'rejected' ? 'var(--border-subtle)' : 'var(--forest-border)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '0.75rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  {approvalStatus === 'approved' ? (
                    <CheckCircle2 style={{ width: 20, height: 20, color: 'var(--clinical-green)' }} />
                  ) : approvalStatus === 'rejected' ? (
                    <Clock style={{ width: 20, height: 20, color: 'var(--text-muted)' }} />
                  ) : (
                    <Sparkles style={{ width: 20, height: 20, color: 'var(--forest-brand)' }} />
                  )}
                  <div>
                    <div style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {approvalStatus === 'approved'
                        ? `Clinical Decision Signed: ${activeProposal.title}`
                        : approvalStatus === 'rejected'
                        ? 'AI Recommendation Dismissed with Clinician Rationale'
                        : `MEDION Clinical AI Proposes: ${activeProposal.title}`}
                    </div>
                    <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                      {approvalStatus === 'approved'
                        ? `${activeProposal.proposedChange.item}. Dispatched to pharmacy.`
                        : approvalStatus === 'rejected'
                        ? 'Regimen unchanged per attending physician order.'
                        : activeProposal.clinicalRationale}
                    </div>
                  </div>
                </div>

                {approvalStatus === 'pending' && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setIsReviewOpen(true)}
                  >
                    <Stethoscope style={{ width: 14, height: 14 }} /> Review & Sign Order
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Sub-Tabs Navigation */}
          <div
            style={{
              display: 'flex',
              gap: '0.25rem',
              borderBottom: '1px solid var(--border-subtle)',
              paddingBottom: '0.25rem',
            }}
          >
            {[
              { id: 'clinical', label: 'Clinical Assessment & Vitals' },
              { id: 'lab', label: 'Diagnostic Lab Reports' },
              { id: 'rx', label: 'Prescriptions & Medication Orders' },
              { id: 'timeline', label: 'Encounters & Care History' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  padding: '0.55rem 1rem',
                  fontSize: '0.84rem',
                  fontWeight: activeTab === tab.id ? 700 : 500,
                  color: activeTab === tab.id ? 'var(--forest-brand)' : 'var(--text-secondary)',
                  background: activeTab === tab.id ? 'var(--forest-subtle)' : 'transparent',
                  border: 'none',
                  borderRadius: 6,
                  cursor: 'pointer',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* SUB-TAB 1: CLINICAL ASSESSMENT & VITALS */}
          {activeTab === 'clinical' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Vital Signs Grid */}
              <div
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 8,
                  padding: '1.25rem',
                }}
              >
                <VitalSignsGrid
                  vitals={currentVitals}
                  patientAcuity={selectedPatientId === 'PAT-1006' ? 'Critical' : 'Guarded'}
                  lastTaken="09:45 AM Today"
                />
              </div>

              {/* Physician Assessment & Clinical Rationale Panel */}
              <div
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 8,
                  padding: '1.25rem',
                }}
              >
                <h4 style={{ margin: '0 0 0.85rem', fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Current Assessment & Problem List
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                  <div style={{ padding: '0.9rem', borderRadius: 6, background: 'var(--bg-app)', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                      Primary Diagnosis
                    </div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.2rem' }}>
                      {selectedPatientId === 'PAT-1025'
                        ? 'Vitamin D Deficiency, Unspecified — ICD-10: E55.9'
                        : selectedPatientId === 'PAT-1006'
                        ? 'Unstable Angina — ICD-10: I20.0'
                        : selectedPatientId === 'PAT-1003'
                        ? 'Old Myocardial Infarction — ICD-10: I25.2'
                        : selectedPatientId === 'PAT-1002'
                        ? 'Subclinical Hypothyroidism — ICD-10: E02'
                        : 'Essential (Primary) Hypertension — ICD-10: I10'}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                      {selectedPatientId === 'PAT-1025'
                        ? 'Serum 25-OH Vitamin D 14.2 ng/mL indicates clinical hypovitaminosis D with associated chronic fatigue.'
                        : selectedPatientId === 'PAT-1006'
                        ? 'Recent non-ST elevation ACS event; post-percutaneous coronary intervention surveillance.'
                        : selectedPatientId === 'PAT-1003'
                        ? 'Post-MI inpatient step-down; ACE inhibitor and beta-blocker optimization.'
                        : selectedPatientId === 'PAT-1002'
                        ? 'TSH elevated at 4.8 mIU/L with normal free thyroxine; fatigue evaluation.'
                        : 'Stage 1 with sub-optimal response to monotherapy. Ambulatory SBP average 138-144 mmHg.'}
                    </div>
                  </div>

                  <div style={{ padding: '0.9rem', borderRadius: 6, background: 'var(--bg-app)', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                      Secondary Diagnostic Conditions
                    </div>
                    <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.2rem' }}>
                      {selectedPatientId === 'PAT-1025'
                        ? 'Allergic Rhinitis (J30.9) & Fatigue Syndrome (R53.83)'
                        : selectedPatientId === 'PAT-1006'
                        ? 'Atherosclerotic Heart Disease (I25.10) & Elevated Troponin T'
                        : selectedPatientId === 'PAT-1003'
                        ? 'Essential Hypertension (I10) & Postural Lightheadedness'
                        : selectedPatientId === 'PAT-1002'
                        ? 'Chronic Fatigue Syndrome & Thyroid Surveillance'
                        : 'Mixed Hyperlipidemia (E78.2) & Microcytic Anemia (D50.9)'}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                      {selectedPatientId === 'PAT-1025'
                        ? 'Documented seasonal allergy symptoms. Baseline complete blood count within reference limits.'
                        : selectedPatientId === 'PAT-1006'
                        ? 'Elevated cardiac biomarkers requiring continuous telemetry in ICCU.'
                        : selectedPatientId === 'PAT-1003'
                        ? 'Blood pressure controlled on dual antihypertensive therapy.'
                        : selectedPatientId === 'PAT-1002'
                        ? 'Thyroid autoantibody screening recommended.'
                        : 'Total Chol: 215 mg/dL, LDL: 142 mg/dL. Hemoglobin 10.4 g/dL. Oral iron therapy initiated.'}
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: '1rem', display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleAction('explain_lab_report')}
                  >
                    <Sparkles style={{ width: 14, height: 14 }} /> Generate AI Differential Diagnosis
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleAction('compare_lab_reports')}
                  >
                    <TrendingDown style={{ width: 14, height: 14 }} /> Compare Longitudinal Lab Trends
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* SUB-TAB 2: DIAGNOSTIC LAB REPORTS */}
          {activeTab === 'lab' && (() => {
            const activeLabReport = patientLabReports[0] || (selectedPatientId === 'PAT-1001' ? MOCK_LAB_REPORT : null);
            if (!activeLabReport) {
              return (
                <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 8, padding: '2.5rem', textAlign: 'center' }}>
                  <FlaskConical style={{ width: 32, height: 32, margin: '0 auto 0.75rem', color: 'var(--text-muted)' }} />
                  <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>No Diagnostic Lab Reports Available</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.25rem', marginBottom: '1rem' }}>
                    No pathology or biochemistry panels have been filed for {activePatient.first_name} {activePatient.last_name} yet.
                  </div>
                  <Button variant="primary" size="sm" onClick={() => handleAction('analyze_lab_report')}>
                    <Sparkles style={{ width: 14, height: 14 }} /> Requisition Laboratory Panel
                  </Button>
                </div>
              );
            }
            return (
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
                      {activeLabReport.test_type} ({activeLabReport.report_id})
                    </h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Collected: {activeLabReport.test_date} • Specimen: Venous Blood • Laboratory: Central Pathology LAB-001
                    </span>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleAction('analyze_lab_report')}
                  >
                    <Sparkles style={{ width: 14, height: 14 }} /> AI Biomarker Correlation
                  </Button>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table className="table-ui" style={{ width: '100%' }}>
                    <thead>
                      <tr>
                        <th>Biomarker</th>
                        <th>Measured Value</th>
                        <th>Reference Range</th>
                        <th>Variance Status</th>
                        <th>Clinical Significance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeLabReport.results.map((item, idx) => (
                        <tr key={idx} style={{ background: item.is_abnormal ? 'var(--warning-amber-bg)' : 'transparent' }}>
                          <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.parameter}</td>
                          <td style={{ fontWeight: 700, fontSize: '0.92rem' }}>
                            {item.value} {item.unit}
                          </td>
                          <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{item.reference_range} {item.unit}</td>
                          <td>
                            {item.is_abnormal ? (
                              <span
                                style={{
                                  fontSize: '0.72rem',
                                  fontWeight: 700,
                                  padding: '0.15rem 0.5rem',
                                  borderRadius: 4,
                                  background: item.abnormality_direction === 'LOW' ? 'var(--warning-amber-border)' : 'var(--danger-red-bg)',
                                  color: item.abnormality_direction === 'LOW' ? 'var(--warning-amber)' : 'var(--danger-red)',
                                  border: '1px solid',
                                  borderColor: item.abnormality_direction === 'LOW' ? 'var(--warning-amber)' : 'var(--danger-red-border)',
                                }}
                              >
                                {item.abnormality_direction}
                              </span>
                            ) : (
                              <span style={{ fontSize: '0.72rem', fontWeight: 600, padding: '0.15rem 0.5rem', borderRadius: 4, background: 'var(--clinical-green-bg)', color: 'var(--clinical-green)' }}>
                                NORMAL
                              </span>
                            )}
                          </td>
                          <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                            {item.is_abnormal
                              ? `${item.parameter} flagged outside physiological reference interval.`
                              : 'Within expected physiological reference range.'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })()}

          {/* SUB-TAB 3: PRESCRIPTIONS & MEDICATION ORDERS */}
          {activeTab === 'rx' && (() => {
            const allPatientMeds = patientPrescriptions.flatMap((rx) => rx.medications);
            return (
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
                      Current Active Prescriptions for {activePatient.first_name} {activePatient.last_name} ({selectedPatientId})
                    </h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Attending Clinician: Dr. Rajesh Mehta • Electronic Medication Ledger
                    </span>
                  </div>
                  {activeProposal && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setIsReviewOpen(true)}
                    >
                      <Pill style={{ width: 14, height: 14 }} /> Review AI Regimen
                    </Button>
                  )}
                </div>

                {allPatientMeds.length === 0 ? (
                  <div style={{ padding: '2.5rem', textAlign: 'center', background: 'var(--bg-app)', borderRadius: 6, border: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                    No active prescriptions currently recorded for {activePatient.first_name} {activePatient.last_name}.
                  </div>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table className="table-ui" style={{ width: '100%' }}>
                      <thead>
                        <tr>
                          <th>Medication</th>
                          <th>Dose & Route</th>
                          <th>Frequency</th>
                          <th>Prescribed For / Instructions</th>
                          <th>Order Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {allPatientMeds.map((m, idx) => (
                          <tr key={idx}>
                            <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{m.name}</td>
                            <td style={{ fontWeight: 600 }}>{m.dosage} PO</td>
                            <td>
                              <Badge variant="brand">{m.frequency}</Badge>
                            </td>
                            <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{m.instructions || 'Take as directed by physician'}</td>
                            <td>
                              <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--clinical-green)' }}>
                                Active in EHR
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })()}

          {/* SUB-TAB 4: ENCOUNTERS & TIMELINE */}
          {activeTab === 'timeline' && (
            <div
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 8,
                padding: '1.25rem',
              }}
            >
              <CareTimeline
                events={doctorCareTimeline}
                title="Longitudinal Clinical Encounters & Diagnostic Trail"
                subtitle="Chronological audit of triage vitals, laboratory verifications, and physician encounter notes"
              />
            </div>
          )}

          {/* AI Workbench Trace Output Section */}
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
                  MEDION Clinical Decision Support Analysis
                </h4>
              </div>

              {loading ? (
                <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <Activity style={{ width: 20, height: 20, margin: '0 auto 0.5rem', animation: 'spin 2s linear infinite' }} />
                  <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Synthesizing clinical decision support evidence...</div>
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

      {/* SECTION 1: LAB RESULTS TO REVIEW */}
      <div
        style={{
          marginTop: '2rem',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 8,
          padding: '1.25rem 1.5rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-subtle)' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FlaskConical style={{ width: 18, height: 18, color: 'var(--danger-red)' }} />
              Lab Results to Review (Pending Clinician Sign-Off)
            </h3>
            <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
              Critical abnormal values flagged by Central Pathology automated analyzer
            </span>
          </div>
          <Badge variant="red">2 STAT • 2 Guarded</Badge>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          <div style={{ padding: '0.85rem', borderRadius: 6, border: '1px solid rgba(239, 68, 68, 0.3)', background: 'rgba(239, 68, 68, 0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
              <span style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--danger-red)' }}>Cardiac Troponin T</span>
              <Badge variant="red">STAT PANIC</Badge>
            </div>
            <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>Rajesh Iyer (ICCU Bed 201)</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
              Result: <strong>0.048 ng/mL</strong> (Ref: &lt; 0.014) • High
            </div>
            <div style={{ marginTop: '0.65rem', display: 'flex', gap: '0.4rem' }}>
              <button
                className="btn-ui btn-primary-ui"
                style={{ fontSize: '0.74rem', padding: '0.2rem 0.5rem' }}
                onClick={() => handleAction('acknowledge_panic_troponin')}
              >
                Acknowledge STAT
              </button>
            </div>
          </div>

          <div style={{ padding: '0.85rem', borderRadius: 6, border: '1px solid var(--border-subtle)', background: 'var(--bg-surface-secondary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
              <span style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)' }}>Lipid Panel & LDL-C</span>
              <Badge variant="amber">ELEVATED</Badge>
            </div>
            <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>Arun Kumar (Suite 4B)</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
              LDL: <strong>158 mg/dL</strong>, Chol: <strong>242 mg/dL</strong>
            </div>
            <div style={{ marginTop: '0.65rem', display: 'flex', gap: '0.4rem' }}>
              <button
                className="btn-ui btn-ghost-ui"
                style={{ fontSize: '0.74rem', padding: '0.2rem 0.5rem', border: '1px solid var(--border-subtle)' }}
                onClick={() => handleAction('analyze_lab_report')}
              >
                AI Synthesis
              </button>
            </div>
          </div>

          <div style={{ padding: '0.85rem', borderRadius: 6, border: '1px solid var(--border-subtle)', background: 'var(--bg-surface-secondary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
              <span style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)' }}>Serum Potassium (K+)</span>
              <Badge variant="amber">GUARDED</Badge>
            </div>
            <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>Vikram Singh (Ward 3B)</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
              Result: <strong>5.2 mEq/L</strong> (Ref: 3.5 - 5.0) • Borderline
            </div>
            <div style={{ marginTop: '0.65rem', display: 'flex', gap: '0.4rem' }}>
              <button
                className="btn-ui btn-ghost-ui"
                style={{ fontSize: '0.74rem', padding: '0.2rem 0.5rem', border: '1px solid var(--border-subtle)' }}
                onClick={() => handleAction('order_repeat_potassium')}
              >
                Order Repeat
              </button>
            </div>
          </div>

          <div style={{ padding: '0.85rem', borderRadius: 6, border: '1px solid var(--border-subtle)', background: 'var(--bg-surface-secondary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
              <span style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)' }}>Thyroid Stimulating Hormone</span>
              <Badge variant="neutral">ROUTINE</Badge>
            </div>
            <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>Sneha Sharma (Waiting Area)</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
              TSH: <strong>4.8 mIU/L</strong> (Ref: 0.4 - 4.2) • Borderline
            </div>
            <div style={{ marginTop: '0.65rem', display: 'flex', gap: '0.4rem' }}>
              <button
                className="btn-ui btn-ghost-ui"
                style={{ fontSize: '0.74rem', padding: '0.2rem 0.5rem', border: '1px solid var(--border-subtle)' }}
                onClick={() => handleAction('verify_tsh_result')}
              >
                Verify & File
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: UPCOMING APPOINTMENTS & CLINICAL SESSIONS */}
      <div
        style={{
          marginTop: '1.5rem',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 8,
          padding: '1.25rem 1.5rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-subtle)' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calendar style={{ width: 18, height: 18, color: 'var(--teal-intelligent)' }} />
              Upcoming Clinical Appointments
            </h3>
            <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
              Next consult slots for Dr. Rajesh Mehta • Cardiology Suite 4B
            </span>
          </div>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
            4 remaining today
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.85rem' }}>
          <div style={{ padding: '0.85rem', borderRadius: 6, border: '1px solid var(--border-subtle)', background: 'var(--bg-surface-secondary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
              <span style={{ fontWeight: 700, fontSize: '0.86rem' }}>Today, 11:30 AM</span>
              <Badge variant="brand">Ready</Badge>
            </div>
            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>Rajesh Iyer (61y, M)</div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>Angina Post-Stepdown Review</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>ICCU Bed 201 • Chart Linked</div>
          </div>

          <div style={{ padding: '0.85rem', borderRadius: 6, border: '1px solid var(--border-subtle)', background: 'var(--bg-surface-secondary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
              <span style={{ fontWeight: 700, fontSize: '0.86rem' }}>Today, 02:00 PM</span>
              <Badge variant="neutral">Scheduled</Badge>
            </div>
            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>Priya Sundaram (45y, F)</div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>Palpitations & Holter Monitor Review</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>OPD Suite 4B • Telemetry Attached</div>
          </div>

          <div style={{ padding: '0.85rem', borderRadius: 6, border: '1px solid var(--border-subtle)', background: 'var(--bg-surface-secondary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
              <span style={{ fontWeight: 700, fontSize: '0.86rem' }}>Today, 02:30 PM</span>
              <Badge variant="neutral">Scheduled</Badge>
            </div>
            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>Meera Nambiar (52y, F)</div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>Echocardiogram Follow-Up</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Echo Suite 1 • Imaging Linked</div>
          </div>

          <div style={{ padding: '0.85rem', borderRadius: 6, border: '1px solid var(--border-subtle)', background: 'var(--bg-surface-secondary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
              <span style={{ fontWeight: 700, fontSize: '0.86rem' }}>Tomorrow, 09:30 AM</span>
              <Badge variant="green">Confirmed</Badge>
            </div>
            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>Kavita Iyer (39y, F)</div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>Cardiovascular Wellness Screening</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>OPD Suite 4B</div>
          </div>
        </div>
      </div>

      {/* SECTION 3: AI CLINICAL INSIGHTS */}
      <div
        style={{
          marginTop: '1.5rem',
          background: 'var(--bg-surface)',
          border: '1px solid rgba(13, 148, 136, 0.3)',
          borderRadius: 8,
          padding: '1.25rem 1.5rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-subtle)' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles style={{ width: 18, height: 18, color: 'var(--teal-intelligent)' }} />
              AI Clinical Decision Support Insights
            </h3>
            <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
              Deterministic pharmacology & guideline-based evidence synthesis • <em>AI assists. Clinicians decide.</em>
            </span>
          </div>
          <Badge variant="brand">Grounded Evidence</Badge>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
          <div style={{ padding: '1rem', borderRadius: 6, background: 'var(--bg-surface-secondary)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
              <span style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                {activeProposal ? activeProposal.title : 'No Pending Action'}
              </span>
              <Badge variant="brand">{activeProposal ? activeProposal.id : 'CDS-00'}</Badge>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
              {activeProposal ? activeProposal.clinicalRationale : 'Patient chart reviewed. All current therapeutic parameters remain stable.'}
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--forest-brand)', fontWeight: 600 }}>
              {activeProposal && activeProposal.contraindications ? activeProposal.contraindications[0] : 'No active clinical contraindications.'}
            </div>
            {activeProposal && (
              <div style={{ marginTop: '0.75rem' }}>
                <Button variant="primary" size="sm" onClick={() => setIsReviewOpen(true)}>
                  Review Rationale & Sign Order
                </Button>
              </div>
            )}
          </div>

          <div style={{ padding: '1rem', borderRadius: 6, background: 'var(--bg-surface-secondary)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
              <span style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                {selectedPatientId === 'PAT-1025'
                  ? 'Vitamin D Repletion Protocol Guideline'
                  : 'ASCVD 10-Year Cardiovascular Risk Score'}
              </span>
              <Badge variant="amber">
                {selectedPatientId === 'PAT-1025' ? 'Guideline Grade A' : '8.4% Moderate'}
              </Badge>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
              {selectedPatientId === 'PAT-1025'
                ? 'Endocrine Society Clinical Practice Guidelines recommend 60,000 IU ergocalciferol or cholecalciferol weekly for 8 weeks to achieve a 25(OH)D level > 30 ng/mL, followed by maintenance.'
                : 'Calculated based on Age 42, SBP 138 mmHg, Total Chol 215 mg/dL, HDL 42 mg/dL, Non-Smoker. Statin initiation (Atorvastatin 10mg) is recommended under Primary Prevention.'}
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
              Source: {selectedPatientId === 'PAT-1025' ? 'Endocrine Society Clinical Guidelines' : '2019 ACC/AHA Guideline on the Primary Prevention of Cardiovascular Disease'}
            </div>
            <div style={{ marginTop: '0.75rem' }}>
              <Button variant="secondary" size="sm" onClick={() => handleAction('check_drug_interactions')}>
                Check Drug Interactions
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* HUMAN-IN-THE-LOOP CLINICAL REVIEW DRAWER */}
      {isReviewOpen && activeProposal && (
        <ClinicalReviewDrawer
          key={activeProposal.id}
          isOpen={isReviewOpen}
          onClose={() => setIsReviewOpen(false)}
          proposal={activeProposal}
          onApprove={handleApproveProposal}
          onReject={handleRejectProposal}
        />
      )}
    </div>
  );
};
