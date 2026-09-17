import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { MOCK_PATIENTS_LIST, MOCK_LAB_REPORT, MOCK_PRESCRIPTIONS, MOCK_APPOINTMENTS } from '../../data/mockDatasets';
import { PatientProfile, ExecutionTraceStep } from '../../types';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { dispatchToWorkbench } from '../../api/workbench';
import { HumanResponseRenderer } from '../../components/intelligence/HumanResponseRenderer';
import { useSharedPatients, useSharedAppointments, useSharedPrescriptions, useSharedLabReports, dataService } from '../../services/dataService';
import {
  Search,
  ArrowLeft,
  Calendar,
  FileText,
  FlaskConical,
  ShieldCheck,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Code,
  CheckCircle2,
  AlertTriangle,
  User,
  Plus,
  Clock,
  Minus,
  Stethoscope,
  Activity,
  Building,
} from 'lucide-react';

interface PatientsViewProps {
  onTraceGenerated?: (step: ExecutionTraceStep) => void;
  onOpenTraceDrawer?: () => void;
}

export const PatientsView: React.FC<PatientsViewProps> = ({ onTraceGenerated, onOpenTraceDrawer }) => {
  const { patientId } = useParams<{ patientId?: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    dataService.syncFromSupabase();
  }, []);

  const patientsList = useSharedPatients();
  const sharedAppointments = useSharedAppointments();
  const sharedPrescriptions = useSharedPrescriptions();
  const sharedLabReports = useSharedLabReports();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<'all' | 'active' | 'recent'>('all');
  const [activeTab, setActiveTab] = useState<'overview' | 'medical' | 'lab' | 'comparison' | 'prescriptions' | 'appointments' | 'insurance' | 'claims'>('overview');

  // AI Context Query State inside Patient Profile
  const [aiLoading, setAiLoading] = useState(false);
  const [aiOutput, setAiOutput] = useState<any>(null);

  // Derive current role prefix (e.g. /doctor, /nurse, /hospital)
  const getRolePrefix = () => {
    if (location.pathname.startsWith('/nurse')) return '/nurse';
    if (location.pathname.startsWith('/patient')) return '/patient';
    if (location.pathname.startsWith('/laboratory')) return '/laboratory';
    if (location.pathname.startsWith('/insurance')) return '/insurance';
    if (location.pathname.startsWith('/hospital')) return '/hospital';
    return '/doctor';
  };

  const rolePrefix = getRolePrefix();

  // Find active patient from route or fallback to selected from dynamic shared storage
  const activePatientId = patientId || 'PAT-1001';
  const selectedPatient = patientsList.find(p => p.patient_id.toUpperCase() === activePatientId.toUpperCase()) || patientsList[0] || MOCK_PATIENTS_LIST[0];

  // Filter patients list
  const filteredPatients = patientsList.filter(p => {
    const matchesSearch =
      `${p.first_name} ${p.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.patient_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.phone && p.phone.includes(searchQuery)) ||
      (p.email && p.email.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

  const handlePatientSelect = (pId: string) => {
    navigate(`${rolePrefix}/patients/${pId}`);
  };

  // Ask MEDION within Patient Context
  const handleContextualAiAction = async (promptText: string, actionType: string, targetAgent: any = 'medical') => {
    setAiLoading(true);
    setAiOutput(null);

    const requestPayload = {
      workflow_id: `WF-PATCONTEXT-${Date.now().toString().slice(-4)}`,
      agent_target: targetAgent,
      action: actionType,
      portal_source: 'doctor',
      payload: { patient_id: selectedPatient.patient_id, report_id: 'LABR-1001', message: promptText },
    };

    const startTime = performance.now();
    const response = await dispatchToWorkbench(requestPayload);
    const duration = Math.round(performance.now() - startTime);

    setAiLoading(false);
    setAiOutput(response);

    if (onTraceGenerated) {
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
    }
  };

  // View 1: Detailed Patient Profile Flagship View (when URL has :patientId or /patient/records)
  const isDetailView = Boolean(patientId) || location.pathname.startsWith('/patient/records');

  return (
    <div style={{ padding: '2rem', maxWidth: 1200, margin: '0 auto' }}>
      {/* If in Patient Detail Route (/doctor/patients/PAT-1001) or Patient Records (/patient/records) */}
      {isDetailView ? (
        <div>
          {/* Header Navigation Back (Staff only) */}
          {!location.pathname.startsWith('/patient/records') && (
            <div style={{ marginBottom: '1.25rem' }}>
              <button
                onClick={() => navigate(`${rolePrefix}/patients`)}
                className="btn-ui btn-ghost-ui"
                style={{ fontSize: '0.82rem', padding: '0.35rem 0.65rem', color: 'var(--text-muted)' }}
              >
                <ArrowLeft style={{ width: 15, height: 15 }} /> Back to Patients Directory
              </button>
            </div>
          )}

          {/* Persistent Enterprise Patient Identity Context */}
          <div
            style={{
              background: '#ffffff',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '1.25rem 1.5rem',
              marginBottom: '1.25rem',
              boxShadow: 'var(--shadow-xs)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    background: 'var(--teal-subtle)',
                    color: 'var(--teal-intelligent)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '1.1rem',
                  }}
                >
                  {selectedPatient.first_name?.[0]}{selectedPatient.last_name?.[0]}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
                    <h1 className="h2" style={{ margin: 0 }}>
                      {selectedPatient.first_name} {selectedPatient.last_name}
                    </h1>
                    <span className="badge-ui badge-green tabular-nums" style={{ fontWeight: 600 }}>
                      MRN: {selectedPatient.patient_id}
                    </span>
                    <span className="badge-ui badge-neutral" style={{ fontWeight: 600 }}>
                      {selectedPatient.blood_group || 'O+'}
                    </span>
                    <span className="badge-ui badge-neutral">
                      {selectedPatient.dob ? `${new Date().getFullYear() - new Date(selectedPatient.dob).getFullYear()} yrs` : '45 yrs'} • {selectedPatient.gender || 'Male'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.85rem', marginTop: '0.35rem', fontSize: '0.8rem', color: 'var(--text-secondary)', flexWrap: 'wrap' }}>
                    <span>Primary Care: <strong style={{ color: 'var(--text-primary)' }}>Dr. Rajesh Mehta, MD</strong></span>
                    <span>•</span>
                    <span>Facility: <strong>Coimbatore Medical Center</strong></span>
                    <span>•</span>
                    <span>Policy: <strong className="tabular-nums" style={{ color: 'var(--text-primary)' }}>{selectedPatient.insurance_policy_id || 'POL-CARDIO-882'}</strong></span>
                  </div>
                </div>
              </div>

              {/* Contextual Ask MEDION Trigger */}
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleContextualAiAction(`Summarize ${selectedPatient.first_name}'s recent lab diagnostic results`, 'analyze_lab_report')}
                  disabled={aiLoading}
                >
                  <Sparkles style={{ width: 14, height: 14 }} /> {aiLoading ? 'Synthesizing...' : 'Ask MEDION: Analyze Chart'}
                </Button>
              </div>
            </div>

            {/* Contextual AI Output Container */}
            {aiOutput && (
              <div style={{ marginTop: '1.25rem', background: 'var(--bg-surface-secondary)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--teal-intelligent)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    MEDION Clinical Decision Support ({aiOutput.target_agent || 'Medical Agent'})
                  </span>
                  {rolePrefix !== '/patient' && onOpenTraceDrawer && (
                    <button className="btn-ui btn-ghost-ui" onClick={onOpenTraceDrawer} style={{ fontSize: '0.72rem', padding: '0.2rem' }}>
                      <Code style={{ width: 13, height: 13 }} /> Trace Execution ➔
                    </button>
                  )}
                </div>
                <div style={{ marginTop: '0.5rem' }}>
                  <HumanResponseRenderer response={aiOutput} />
                </div>
              </div>
            )}
          </div>

          {/* Stateful Clinical Profile Tabs */}
          <div className="section-panel" style={{ padding: '1.25rem 1.5rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '1.25rem', borderBottom: '1px solid var(--border-subtle)', marginBottom: '1.5rem', overflowX: 'auto' }}>
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'medical', label: 'Clinical History' },
                { id: 'lab', label: 'Lab Reports' },
                { id: 'comparison', label: 'Lab Comparison' },
                { id: 'prescriptions', label: 'Prescriptions' },
                { id: 'appointments', label: 'Appointments' },
                { id: 'insurance', label: 'Insurance' },
                { id: 'claims', label: 'Documents & Claims' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  style={{
                    padding: '0.6rem 0.25rem',
                    background: 'none',
                    border: 'none',
                    borderBottom: activeTab === tab.id ? '2.5px solid var(--teal-intelligent)' : '2.5px solid transparent',
                    color: activeTab === tab.id ? 'var(--teal-intelligent)' : 'var(--text-muted)',
                    fontWeight: activeTab === tab.id ? 600 : 400,
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* TAB 1: OVERVIEW */}
            {activeTab === 'overview' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                <div>
                  <h4 className="h4" style={{ marginBottom: '0.85rem' }}>Patient Demographics & Contact</h4>
                  <table className="table-ui">
                    <tbody>
                      <tr><td className="text-muted">Full Name</td><td style={{ fontWeight: 600 }}>{selectedPatient.first_name} {selectedPatient.last_name}</td></tr>
                      <tr><td className="text-muted">Patient ID</td><td>{selectedPatient.patient_id}</td></tr>
                      <tr><td className="text-muted">Date of Birth</td><td>{selectedPatient.date_of_birth || (selectedPatient as any).dob || 'Not provided'}</td></tr>
                      <tr><td className="text-muted">Gender & Blood Group</td><td>{selectedPatient.gender || 'Not specified'} ({selectedPatient.blood_group || 'Not provided'})</td></tr>
                      <tr><td className="text-muted">Phone Number</td><td>{selectedPatient.phone || 'Not provided'}</td></tr>
                      <tr><td className="text-muted">Email Address</td><td>{selectedPatient.email || 'Not provided'}</td></tr>
                      <tr><td className="text-muted">Residential Address</td><td>{selectedPatient.address || 'Not provided'}</td></tr>
                    </tbody>
                  </table>
                </div>

                <div>
                  <h4 className="h4" style={{ marginBottom: '0.85rem' }}>Emergency Contact & Attending Care</h4>
                  <table className="table-ui">
                    <tbody>
                      <tr><td className="text-muted">Emergency Contact Name</td><td style={{ fontWeight: 600 }}>{(selectedPatient.emergency_contact && typeof selectedPatient.emergency_contact === 'object' && 'name' in selectedPatient.emergency_contact) ? (selectedPatient.emergency_contact as any).name : (typeof selectedPatient.emergency_contact === 'string' && selectedPatient.emergency_contact.trim() ? selectedPatient.emergency_contact : 'Not provided')}</td></tr>
                      <tr><td className="text-muted">Relationship</td><td>{(selectedPatient.emergency_contact && typeof selectedPatient.emergency_contact === 'object' && 'relationship' in selectedPatient.emergency_contact) ? (selectedPatient.emergency_contact as any).relationship : '—'}</td></tr>
                      <tr><td className="text-muted">Emergency Phone</td><td>{(selectedPatient.emergency_contact && typeof selectedPatient.emergency_contact === 'object' && 'phone' in selectedPatient.emergency_contact) ? (selectedPatient.emergency_contact as any).phone : (typeof selectedPatient.emergency_contact === 'string' ? selectedPatient.emergency_contact : '—')}</td></tr>
                      <tr><td className="text-muted">Primary Physician</td><td>{selectedPatient.primary_doctor_id ? `Doctor (${selectedPatient.primary_doctor_id})` : 'Not assigned'}</td></tr>
                      <tr><td className="text-muted">Insurance Policy ID</td><td>{selectedPatient.insurance_policy_id || 'Not assigned'}</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 2: LONGITUDINAL CLINICAL CARE TIMELINE */}
            {activeTab === 'medical' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <div>
                    <h4 className="h4" style={{ margin: 0 }}>Longitudinal Clinical Care Timeline</h4>
                    <p className="text-muted" style={{ fontSize: '0.78rem', margin: '0.2rem 0 0' }}>
                      Chronological care progression across consultations, diagnostic orders, and prescription updates
                    </p>
                  </div>
                  <Badge variant="brand">4 Verified Milestones</Badge>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative', paddingLeft: '1.5rem' }}>
                  {/* Vertical Track Line */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '1rem',
                      bottom: '1rem',
                      left: '0.45rem',
                      width: 2,
                      background: 'var(--border-subtle)',
                    }}
                  />

                  {[
                    {
                      date: 'SEP 14, 2026',
                      type: 'Lab Report',
                      badge: 'DIAGNOSTIC ORDER',
                      badgeVariant: 'brand' as const,
                      title: 'Lipid Profile & Complete Blood Count (LABR-1001)',
                      clinician: 'Dr. S. Kulkarni, Pathologist (Central Pathology Lab)',
                      orderedBy: 'Dr. Rajesh Mehta, MD',
                      facility: 'Central Diagnostics Lab • CMC Wing B',
                      whatHappened: 'Venous blood collection analyzed via automated clinical chemistry analyzer.',
                      whatChanged: 'Total Cholesterol elevated at 215 mg/dL; LDL at 142 mg/dL. Microcytic indices detected (Hb 10.4 g/dL).',
                      actionFollowed: 'Diagnostic results verified and released to EHR; iron supplementation and antihypertensive regimen review indicated.',
                      icon: <FlaskConical style={{ width: 14, height: 14 }} />,
                    },
                    {
                      date: 'SEP 10, 2026',
                      type: 'Clinical Visit',
                      badge: 'CARDIOLOGY ENCOUNTER',
                      badgeVariant: 'green' as const,
                      title: 'Outpatient Cardiology Follow-Up & Blood Pressure Review',
                      clinician: 'Dr. Rajesh Mehta, MD (Cardiology Clinic 4B)',
                      orderedBy: 'Attending Physician',
                      facility: 'Coimbatore Medical Center (Main Campus)',
                      whatHappened: 'In-person ambulatory consultation. Resting seated blood pressure recorded at 138/86 mmHg (HR 74 bpm).',
                      whatChanged: 'Suboptimal blood pressure control persisting despite Amlodipine 5mg monotherapy.',
                      actionFollowed: 'AI Regimen titration proposed (Amlodipine 5mg → 10mg + Telmisartan 40mg); routine metabolic blood panel ordered.',
                      icon: <Stethoscope style={{ width: 14, height: 14 }} />,
                    },
                    {
                      date: 'AUG 28, 2026',
                      type: 'Prescription',
                      badge: 'E-PRESCRIPTION',
                      badgeVariant: 'neutral' as const,
                      title: 'Maintenance Antihypertensive Refill (RX-2024-91)',
                      clinician: 'Dr. Rajesh Mehta, MD',
                      orderedBy: 'Dr. Rajesh Mehta, MD',
                      facility: 'MEDION Pharmacy Dispensary',
                      whatHappened: 'Electronic refill authorization for Amlodipine 5mg PO OD (30-day supply, 2 refills remaining).',
                      whatChanged: 'Dose maintained at 5mg pending upcoming 3-month lipid panel evaluation.',
                      actionFollowed: 'Dispensed at Central Pharmacy; patient advised on sodium reduction and daily home BP log.',
                      icon: <FileText style={{ width: 14, height: 14 }} />,
                    },
                    {
                      date: 'JUN 15, 2026',
                      type: 'Clinical Encounter',
                      badge: 'INITIAL WORKUP',
                      badgeVariant: 'green' as const,
                      title: 'Initial Cardiovascular Risk Assessment & Triage',
                      clinician: 'Dr. Rajesh Mehta, MD & Nurse Reka, RN',
                      orderedBy: 'Ambulatory Referral',
                      facility: 'Coimbatore Medical Center (Main Campus)',
                      whatHappened: 'Baseline clinical intake following ambulatory referral for exertional fatigue and elevated BP readings.',
                      whatChanged: 'Diagnosed with Stage 1 Essential Hypertension (ICD-10 I10); baseline ECG normal sinus rhythm.',
                      actionFollowed: 'Commenced on Amlodipine 5mg PO daily; comprehensive lifestyle counseling provided.',
                      icon: <Activity style={{ width: 14, height: 14 }} />,
                    },
                  ].map((event, idx) => (
                    <div
                      key={idx}
                      style={{
                        position: 'relative',
                        background: '#ffffff',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-md)',
                        padding: '1.15rem 1.25rem',
                        boxShadow: 'var(--shadow-xs)',
                      }}
                    >
                      {/* Timeline Node Dot */}
                      <div
                        style={{
                          position: 'absolute',
                          left: '-1.45rem',
                          top: '1.25rem',
                          width: 10,
                          height: 10,
                          borderRadius: '50%',
                          background: 'var(--teal-intelligent)',
                          border: '2px solid #ffffff',
                          boxShadow: '0 0 0 2px var(--teal-border)',
                        }}
                      />

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.4rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span className="tabular-nums" style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--teal-intelligent)', letterSpacing: '0.04em' }}>
                            {event.date}
                          </span>
                          <span style={{ color: 'var(--border-strong)' }}>•</span>
                          <Badge variant={event.badgeVariant}>{event.badge}</Badge>
                        </div>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          {event.facility}
                        </span>
                      </div>

                      <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                        {event.title}
                      </div>

                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.65rem' }}>
                        Performing Clinician: <strong style={{ color: 'var(--text-primary)' }}>{event.clinician}</strong>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.75rem', background: 'var(--bg-surface-secondary)', padding: '0.75rem 0.9rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-subtle)' }}>
                        <div>
                          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                            Clinical Findings & Change
                          </div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-primary)', marginTop: '0.15rem' }}>
                            {event.whatChanged}
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--teal-intelligent)', textTransform: 'uppercase' }}>
                            Action Followed
                          </div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                            {event.actionFollowed}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: CLINICAL-GRADE LAB DIAGNOSTIC RESULTS */}
            {activeTab === 'lab' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <h4 className="h4" style={{ margin: 0 }}>
                      Lipid Panel & Hematology Diagnostic Suite (LABR-1001)
                    </h4>
                    <span className="text-muted" style={{ fontSize: '0.78rem' }}>
                      Collection: 2026-09-14 09:15 AM • Central Diagnostics Lab • Pathologist Dr. S. Kulkarni
                    </span>
                  </div>
                  <Button variant="secondary" size="sm" onClick={() => setActiveTab('comparison')}>
                    <TrendingDown style={{ width: 14, height: 14 }} /> Compare Baseline LABR-0990
                  </Button>
                </div>

                {/* Clinical-Grade Results Table */}
                <div style={{ overflowX: 'auto', marginBottom: '1.25rem' }}>
                  <table className="table-ui" style={{ width: '100%' }}>
                    <thead>
                      <tr>
                        <th>Diagnostic Parameter</th>
                        <th>Measured Result</th>
                        <th>Reference Range</th>
                        <th>Unit</th>
                        <th>Clinical Status</th>
                        <th>Previous Result</th>
                        <th>Trend</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        {
                          test: 'Hemoglobin (Hb)',
                          result: '10.4',
                          range: '13.5 – 17.5',
                          unit: 'g/dL',
                          status: 'Low',
                          statusVariant: 'amber' as const,
                          previous: '11.2 g/dL',
                          trend: 'Decreasing',
                          trendIcon: <TrendingDown style={{ width: 14, height: 14, color: 'var(--warning-amber)' }} />,
                        },
                        {
                          test: 'Total Cholesterol',
                          result: '215',
                          range: '< 200',
                          unit: 'mg/dL',
                          status: 'High',
                          statusVariant: 'amber' as const,
                          previous: '228 mg/dL',
                          trend: 'Improving',
                          trendIcon: <TrendingDown style={{ width: 14, height: 14, color: 'var(--clinical-green)' }} />,
                        },
                        {
                          test: 'LDL Atherogenic Cholesterol',
                          result: '142',
                          range: '< 100',
                          unit: 'mg/dL',
                          status: 'High',
                          statusVariant: 'amber' as const,
                          previous: '155 mg/dL',
                          trend: 'Improving',
                          trendIcon: <TrendingDown style={{ width: 14, height: 14, color: 'var(--clinical-green)' }} />,
                        },
                        {
                          test: 'HDL Protective Cholesterol',
                          result: '44',
                          range: '> 40',
                          unit: 'mg/dL',
                          status: 'Normal',
                          statusVariant: 'green' as const,
                          previous: '42 mg/dL',
                          trend: 'Stable',
                          trendIcon: <Minus style={{ width: 14, height: 14, color: 'var(--text-muted)' }} />,
                        },
                        {
                          test: 'Serum Potassium (K+)',
                          result: '4.2',
                          range: '3.5 – 5.0',
                          unit: 'mEq/L',
                          status: 'Normal',
                          statusVariant: 'green' as const,
                          previous: '4.3 mEq/L',
                          trend: 'Stable',
                          trendIcon: <Minus style={{ width: 14, height: 14, color: 'var(--text-muted)' }} />,
                        },
                        {
                          test: 'Serum Creatinine',
                          result: '0.95',
                          range: '0.70 – 1.30',
                          unit: 'mg/dL',
                          status: 'Normal',
                          statusVariant: 'green' as const,
                          previous: '0.92 mg/dL',
                          trend: 'Stable',
                          trendIcon: <Minus style={{ width: 14, height: 14, color: 'var(--text-muted)' }} />,
                        },
                        {
                          test: 'High Sensitivity Troponin-I',
                          result: '0.012',
                          range: '< 0.040',
                          unit: 'ng/mL',
                          status: 'Normal',
                          statusVariant: 'green' as const,
                          previous: '0.010 ng/mL',
                          trend: 'Stable',
                          trendIcon: <Minus style={{ width: 14, height: 14, color: 'var(--text-muted)' }} />,
                        },
                      ].map((item, i) => (
                        <tr key={i}>
                          <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.test}</td>
                          <td className="tabular-nums" style={{ fontWeight: 700, fontSize: '0.92rem', color: item.status === 'Normal' ? 'var(--text-primary)' : 'var(--warning-amber)' }}>
                            {item.result}
                          </td>
                          <td className="tabular-nums text-muted">{item.range}</td>
                          <td className="text-secondary">{item.unit}</td>
                          <td>
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.3rem',
                                padding: '0.15rem 0.5rem',
                                borderRadius: 'var(--radius-xs)',
                                fontSize: '0.74rem',
                                fontWeight: 600,
                                background: item.status === 'Normal' ? 'var(--clinical-green-bg)' : 'var(--warning-amber-bg)',
                                color: item.status === 'Normal' ? 'var(--clinical-green)' : 'var(--warning-amber)',
                                border: `1px solid ${item.status === 'Normal' ? 'var(--clinical-green-border)' : 'var(--warning-amber-border)'}`,
                              }}
                            >
                              {item.status === 'Normal' ? (
                                <CheckCircle2 style={{ width: 12, height: 12 }} />
                              ) : (
                                <AlertTriangle style={{ width: 12, height: 12 }} />
                              )}
                              <span>{item.status}</span>
                            </span>
                          </td>
                          <td className="tabular-nums text-muted">{item.previous}</td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                              {item.trendIcon}
                              <span>{item.trend}</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Structured MEDION Decision Support Insight */}
                <div style={{ background: 'var(--bg-surface-secondary)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '1rem' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--teal-intelligent)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.25rem' }}>
                    MEDION Clinical Decision Support Summary
                  </div>
                  <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                    Mild microcytic anemia index (Hb 10.4 g/dL) and borderline atherogenic dyslipidemia (LDL 142 mg/dL) identified. Renal function and cardiac troponin within physiological baseline limits. Iron study profile recommended; antihypertensive titration safe for renal clearance.
                  </p>
                </div>
              </div>
            )}

            {/* TAB 4: LAB COMPARISON (LABR-0990 vs LABR-1001) */}
            {activeTab === 'comparison' && (
              <div>
                {selectedPatient.patient_id === 'PAT-1001' ? (
                  <>
                    <h4 className="h4" style={{ marginBottom: '0.5rem' }}>Laboratory Trend Comparison (LABR-0990 vs LABR-1001)</h4>
                    <p className="text-muted" style={{ fontSize: '0.8rem', marginBottom: '1.25rem' }}>
                      Comparing March 2026 baseline diagnostic results with current September 2026 panel
                    </p>

                    <table className="table-ui">
                      <thead>
                        <tr>
                          <th>Parameter</th>
                          <th>Baseline Value (LABR-0990)</th>
                          <th>Current Value (LABR-1001)</th>
                          <th>Reference Bounds</th>
                          <th>Clinical Trend</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td style={{ fontWeight: 500 }}>Hemoglobin (Hb)</td>
                          <td>11.2 g/dL</td>
                          <td>10.4 g/dL</td>
                          <td className="text-muted">13.5 - 17.5</td>
                          <td><Badge variant="amber">↓ Decreasing (Low)</Badge></td>
                        </tr>
                        <tr>
                          <td style={{ fontWeight: 500 }}>Total Cholesterol</td>
                          <td>228.0 mg/dL</td>
                          <td>215.0 mg/dL</td>
                          <td className="text-muted">&lt; 200</td>
                          <td><Badge variant="green">↓ Improving (High)</Badge></td>
                        </tr>
                        <tr>
                          <td style={{ fontWeight: 500 }}>HDL Protective Cholesterol</td>
                          <td>41.0 mg/dL</td>
                          <td>44.0 mg/dL</td>
                          <td className="text-muted">&gt; 40</td>
                          <td><Badge variant="green">↑ Improving (Normal)</Badge></td>
                        </tr>
                        <tr>
                          <td style={{ fontWeight: 500 }}>LDL Atherogenic Cholesterol</td>
                          <td>155.0 mg/dL</td>
                          <td>142.0 mg/dL</td>
                          <td className="text-muted">&lt; 100</td>
                          <td><Badge variant="green">↓ Improving (High)</Badge></td>
                        </tr>
                        <tr>
                          <td style={{ fontWeight: 500 }}>Triglycerides</td>
                          <td>185.0 mg/dL</td>
                          <td>168.0 mg/dL</td>
                          <td className="text-muted">&lt; 150</td>
                          <td><Badge variant="green">↓ Improving (High)</Badge></td>
                        </tr>
                        <tr>
                          <td style={{ fontWeight: 500 }}>Fasting Blood Sugar</td>
                          <td>98.0 mg/dL</td>
                          <td>92.0 mg/dL</td>
                          <td className="text-muted">70 - 99</td>
                          <td><Badge variant="green">→ Stable (Normal)</Badge></td>
                        </tr>
                        <tr>
                          <td style={{ fontWeight: 500 }}>Serum Creatinine</td>
                          <td>0.98 mg/dL</td>
                          <td>0.95 mg/dL</td>
                          <td className="text-muted">0.7 - 1.3</td>
                          <td><Badge variant="green">→ Stable (Normal)</Badge></td>
                        </tr>
                      </tbody>
                    </table>
                  </>
                ) : (
                  <div className="text-muted" style={{ padding: '2.5rem 1rem', textAlign: 'center', background: 'var(--bg-app)', borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
                    No laboratory trend comparison available for this patient.
                  </div>
                )}
              </div>
            )}

            {/* TAB 5: PRESCRIPTIONS */}
            {activeTab === 'prescriptions' && (() => {
              const patientRxList = sharedPrescriptions.filter(
                (rx) => rx.patient_id.toUpperCase() === selectedPatient.patient_id.toUpperCase()
              );
              if (patientRxList.length === 0) {
                return (
                  <div className="text-muted" style={{ padding: '2.5rem 1rem', textAlign: 'center', background: 'var(--bg-app)', borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
                    No active prescriptions on file for {selectedPatient.first_name} {selectedPatient.last_name}.
                  </div>
                );
              }
              const allMeds = patientRxList.flatMap((rx) => rx.medications);
              return (
                <div>
                  <h4 className="h4" style={{ marginBottom: '1rem' }}>
                    Active Prescriptions for {selectedPatient.first_name} {selectedPatient.last_name} ({selectedPatient.patient_id})
                  </h4>
                  <table className="table-ui">
                    <thead>
                      <tr>
                        <th>Medication Name</th>
                        <th>Dosage</th>
                        <th>Frequency</th>
                        <th>Duration</th>
                        <th>Physician Instructions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allMeds.map((m, i) => (
                        <tr key={i}>
                          <td style={{ fontWeight: 600 }}>{m.name}</td>
                          <td>{m.dosage}</td>
                          <td>{m.frequency}</td>
                          <td>{m.duration_days ? `${m.duration_days} days` : '30 days'}</td>
                          <td className="text-muted">{m.instructions || 'Take as directed by physician'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            })()}

            {/* TAB 6: APPOINTMENTS */}
            {activeTab === 'appointments' && (
              <div>
                <h4 className="h4" style={{ marginBottom: '1rem' }}>Scheduled Appointments</h4>
                {(() => {
                  const patientApts = sharedAppointments.filter(
                    (a) => a.patient_id.toUpperCase() === selectedPatient.patient_id.toUpperCase()
                  );
                  if (patientApts.length === 0) {
                    return (
                      <div className="text-muted" style={{ padding: '2.5rem 1rem', textAlign: 'center', background: 'var(--bg-app)', borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
                        No scheduled appointments recorded for this patient.
                      </div>
                    );
                  }
                  return (
                    <table className="table-ui">
                      <thead>
                        <tr>
                          <th>Appointment ID</th>
                          <th>Attending Doctor</th>
                          <th>Date & Slot</th>
                          <th>Reason for Visit</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {patientApts.map((apt, i) => (
                          <tr key={apt.appointment_id || i}>
                            <td style={{ fontWeight: 600 }}>{apt.appointment_id}</td>
                            <td>{apt.doctor_id}</td>
                            <td>{apt.date} ({apt.time_slot})</td>
                            <td>{apt.reason}</td>
                            <td>
                              <Badge variant={apt.status === 'CANCELLED' ? 'red' : apt.status === 'RESCHEDULED' ? 'amber' : 'green'}>
                                {apt.status}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  );
                })()}
              </div>
            )}

            {/* TAB 7: INSURANCE */}
            {activeTab === 'insurance' && (
              <div>
                {selectedPatient.insurance_policy_id ? (
                  <>
                    <h4 className="h4" style={{ marginBottom: '1rem' }}>Active Policy ({selectedPatient.insurance_policy_id})</h4>
                    <table className="table-ui">
                      <tbody>
                        <tr><td className="text-muted">Policy ID</td><td style={{ fontWeight: 600 }}>{selectedPatient.insurance_policy_id}</td></tr>
                        <tr><td className="text-muted">Policy Number</td><td>SH-2024-998811</td></tr>
                        <tr><td className="text-muted">Plan Type</td><td>Comprehensive Health Shield</td></tr>
                        <tr><td className="text-muted">Coverage Amount</td><td>₹500,000</td></tr>
                        <tr><td className="text-muted">Remaining Coverage</td><td>₹425,000</td></tr>
                        <tr><td className="text-muted">Copay Percentage</td><td>10%</td></tr>
                        <tr><td className="text-muted">Policy Status</td><td><Badge variant="green">ACTIVE</Badge></td></tr>
                      </tbody>
                    </table>
                  </>
                ) : (
                  <div className="text-muted" style={{ padding: '2.5rem 1rem', textAlign: 'center', background: 'var(--bg-app)', borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
                    No active insurance policy assigned for this patient.
                  </div>
                )}
              </div>
            )}

            {/* TAB 8: BILLS & CLAIMS */}
            {activeTab === 'claims' && (
              <div>
                {selectedPatient.patient_id === 'PAT-1001' ? (
                  <>
                    <h4 className="h4" style={{ marginBottom: '1rem' }}>Submitted Claims & Adjudication Status</h4>
                    <table className="table-ui" style={{ marginBottom: '1.5rem' }}>
                      <thead>
                        <tr>
                          <th>Claim ID</th>
                          <th>Bill ID</th>
                          <th>Service Type</th>
                          <th>Claim Amount</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td style={{ fontWeight: 600 }}>CLM-1001</td>
                          <td>BILL-1001</td>
                          <td>Cardiology Consultation & Diagnostic Panel</td>
                          <td>₹4,500</td>
                          <td><Badge variant="amber">UNDER REVIEW</Badge></td>
                        </tr>
                      </tbody>
                    </table>

                    {/* Refined Claim Timeline */}
                    <div style={{ background: 'var(--bg-app)', border: '1px solid var(--border-subtle)', borderRadius: 8, padding: '1.25rem' }}>
                      <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Claim Adjudication Lifecycle
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ textAlign: 'center' }}><span style={{ fontWeight: 700, color: 'var(--forest-green)' }}>✓</span> <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Prepared</span></div>
                        <div style={{ flex: 1, height: 2, background: 'var(--forest-green)', margin: '0 0.5rem' }}></div>
                        <div style={{ textAlign: 'center' }}><span style={{ fontWeight: 700, color: 'var(--forest-green)' }}>✓</span> <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Submitted</span></div>
                        <div style={{ flex: 1, height: 2, background: 'var(--forest-green)', margin: '0 0.5rem' }}></div>
                        <div style={{ textAlign: 'center' }}><span style={{ fontWeight: 700, color: 'var(--forest-green)' }}>●</span> <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--forest-green)' }}>Under Review</span></div>
                        <div style={{ flex: 1, height: 2, background: 'var(--border-subtle)', margin: '0 0.5rem' }}></div>
                        <div style={{ textAlign: 'center' }}><span style={{ color: 'var(--text-muted)' }}>○</span> <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Approved</span></div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-muted" style={{ padding: '2.5rem 1rem', textAlign: 'center', background: 'var(--bg-app)', borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
                    No claims recorded for this patient.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* View 2: Refined Clinical Patient Directory (/doctor/patients) */
        <div>
          <div style={{ marginBottom: '1.75rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-subtle)' }}>
            <h2 className="h2">Patients Directory</h2>
            <p className="text-muted" style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
              Clinical records and patient management directory
            </p>
          </div>

          <div className="section-panel">
            {/* Search Bar & Category Filters */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', gap: '1rem' }}>
              <div className="command-input-container" style={{ flex: 1, maxWidth: 450, padding: '0.45rem 0.85rem' }}>
                <Search style={{ width: 16, height: 16, color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  className="command-input"
                  placeholder="Search patient name, ID, phone, or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => setFilterCategory('all')}
                  className={`btn-ui ${filterCategory === 'all' ? 'btn-primary-ui' : 'btn-ghost-ui'}`}
                  style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem' }}
                >
                  All Patients
                </button>
                <button
                  onClick={() => setFilterCategory('active')}
                  className={`btn-ui ${filterCategory === 'active' ? 'btn-primary-ui' : 'btn-ghost-ui'}`}
                  style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem' }}
                >
                  Active
                </button>
              </div>
            </div>

            {/* Refined Clinical Patients Table */}
            {filteredPatients.length > 0 ? (
              <table className="table-ui">
                <thead>
                  <tr>
                    <th>Patient Name</th>
                    <th>Patient ID</th>
                    <th>DOB / Gender</th>
                    <th>Contact Phone</th>
                    <th>Primary Physician</th>
                    <th>Insurance Policy</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPatients.map((p) => (
                    <tr
                      key={p.patient_id}
                      style={{ cursor: 'pointer' }}
                      onClick={() => handlePatientSelect(p.patient_id)}
                    >
                      <td style={{ fontWeight: 600 }}>{p.first_name} {p.last_name}</td>
                      <td><Badge variant="green">{p.patient_id}</Badge></td>
                      <td className="text-muted">{(p.date_of_birth || (p as any).dob) ? `${p.date_of_birth || (p as any).dob}` : '—'} {p.gender ? `(${p.gender})` : ''}</td>
                      <td className="text-muted">{p.phone || '—'}</td>
                      <td>{p.primary_doctor_id || '—'}</td>
                      <td>{p.insurance_policy_id || '—'}</td>
                      <td><Badge variant="green">Active</Badge></td>
                      <td>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePatientSelect(p.patient_id);
                          }}
                          style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
                        >
                          View Profile ➔
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                No patient records match the search query "{searchQuery}".
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
