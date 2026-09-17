import React, { useState } from 'react';
import {
  Calendar,
  FileText,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  Clock,
  AlertTriangle,
  Stethoscope,
  Pill,
  ChevronRight,
  User,
  HeartPulse,
  Download,
  Activity,
  Plus,
  ArrowRight,
  FlaskConical,
  X,
  AlertCircle,
  Building,
  Check,
} from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { dispatchToWorkbench } from '../../api/workbench';
import { ExecutionTraceStep } from '../../types';
import { HumanResponseRenderer } from '../../components/intelligence/HumanResponseRenderer';
import {
  MOCK_PATIENT,
  MOCK_PRESCRIPTIONS,
  MOCK_LAB_REPORT,
  MOCK_APPOINTMENTS,
} from '../../data/mockDatasets';
import {
  useSharedPatients,
  useSharedAppointments,
  useSharedDoctors,
  useSharedLabReports,
  useSharedPolicies,
  useSharedPrescriptions,
  dataService,
} from '../../services/dataService';
import { useAuth } from '../../services/authService';

interface PatientWorkspaceProps {
  onTraceGenerated: (step: ExecutionTraceStep) => void;
}

export const PatientWorkspace: React.FC<PatientWorkspaceProps> = ({ onTraceGenerated }) => {
  const { user } = useAuth();
  const [output, setOutput] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [patientAiInput, setPatientAiInput] = useState('');

  // Interactive booking modal state
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [bookDate, setBookDate] = useState(new Date().toISOString().split('T')[0]);
  const [bookTime, setBookTime] = useState('10:00-10:30');
  const [bookDoctor, setBookDoctor] = useState('DOC-101');
  const [bookReason, setBookReason] = useState('Routine Health Checkup & Lab Review');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);

  // Adherence tracking
  const [medTakenState, setMedTakenState] = useState<Record<string, boolean>>({
    'med-1': true,
    'med-2': true,
    'med-3': false,
  });

  const patients = useSharedPatients();
  const appointments = useSharedAppointments();
  const doctors = useSharedDoctors();
  const labReports = useSharedLabReports();
  const policies = useSharedPolicies();

  const activePatient = user?.id
    ? (patients.find((p) => p.patient_id.toUpperCase() === user.id.toUpperCase()) ||
       (user.email ? patients.find((p) => p.email?.toLowerCase() === user.email.toLowerCase()) : null) || {
         patient_id: user.id,
         first_name: user.name ? user.name.split(' ')[0] : 'Patient',
         last_name: user.name && user.name.split(' ').length > 1 ? user.name.split(' ').slice(1).join(' ') : '',
         email: user.email,
         phone: user.phone || '',
       })
    : (patients[0] || MOCK_PATIENT);
  const mrn = user?.id || activePatient.patient_id;
  const patientDisplayName = user?.name || `${activePatient.first_name} ${activePatient.last_name}`.trim();

  const patientApts = appointments.filter(
    (a) => a.patient_id?.toUpperCase() === mrn.toUpperCase() && a.status !== 'CANCELLED'
  );
  const patientLabReports = labReports.filter(
    (lr) => lr.patient_id?.toUpperCase() === mrn.toUpperCase()
  );
  const activeLabReport = patientLabReports[0] || null;

  const patientPolicy =
    policies.find(
      (pol) =>
        pol.patient_id?.toUpperCase() === mrn.toUpperCase() ||
        (activePatient?.insurance_policy_id && pol.policy_id === activePatient.insurance_policy_id)
    ) || null;

  const prescriptions = useSharedPrescriptions();
  const patientPrescriptions = prescriptions.filter(
    (rx) => rx.patient_id?.toUpperCase() === mrn.toUpperCase()
  );
  const patientMedications = patientPrescriptions.flatMap((rx) =>
    (rx.medications || []).map((m: any, idx: number) => ({
      id: `${rx.prescription_id || 'rx'}-med-${idx}`,
      name: m.name,
      dose: m.dosage || m.dose || '',
      schedule: m.frequency || m.schedule || '',
      reason: m.instructions || m.reason || 'Prescribed Regimen',
      prescriber: doctors.find((d) => d.doctor_id === rx.doctor_id)
        ? `Dr. ${doctors.find((d) => d.doctor_id === rx.doctor_id)?.first_name} ${doctors.find((d) => d.doctor_id === rx.doctor_id)?.last_name}`
        : 'Attending Physician',
      refills: rx.refills_remaining !== undefined ? `${rx.refills_remaining} refills remaining` : 'Active',
    }))
  );

  const nextApt = patientApts[0] || null;
  const displayApts = patientApts;

  // Dynamic slot lookup from Appointment Agent
  React.useEffect(() => {
    let isMounted = true;
    const fetchSlots = async () => {
      try {
        const res = await dispatchToWorkbench({
          agent_target: 'appointment' as any,
          action: 'get_available_slots',
          portal_source: 'patient',
          payload: { doctor_id: bookDoctor, date: bookDate },
        });
        if (isMounted && res.success && res.result?.available_slots) {
          const slots: string[] = res.result.available_slots.map((s: any) =>
            typeof s === 'string' ? s : s.time_slot || s.slot_id
          );
          if (slots.length > 0) {
            setAvailableSlots(slots);
            setBookTime((prev) => (slots.includes(prev) ? prev : slots[0]));
          }
        }
      } catch (err) {
        console.warn('Slot lookup fallback:', err);
      }
    };

    if (isBookModalOpen) {
      fetchSlots();
    }
    return () => {
      isMounted = false;
    };
  }, [bookDoctor, bookDate, isBookModalOpen]);

  const getAgentTarget = (action: string): 'patient' | 'medical' | 'appointment' | 'insurance' | 'assistant' => {
    if (['get_coverage', 'verify_insurance', 'prepare_claim'].includes(action)) return 'insurance';
    if (['get_available_slots', 'book_appointment', 'cancel_appointment', 'reschedule_appointment'].includes(action)) return 'appointment';
    if (['explain_lab_report', 'analyze_lab_report', 'extract_lab_report', 'compare_lab_reports', 'get_medical_summary'].includes(action)) return 'medical';
    if (['get_patient', 'search_patient', 'update_patient', 'get_patient_history'].includes(action)) return 'patient';
    return 'assistant';
  };

  const handlePatientQuery = async (actionType: string, promptText: string, extraPayload: Record<string, any> = {}) => {
    setLoading(true);
    setOutput(null);

    const agentTarget = getAgentTarget(actionType);
    const requestPayload: any = {
      workflow_id: `WF-PAT-${Date.now().toString().slice(-4)}`,
      agent_target: agentTarget,
      action: actionType,
      portal_source: 'patient',
      patient_id: mrn,
      content: promptText,
      ...extraPayload,
    };

    const startTime = Date.now();
    const response = await dispatchToWorkbench(requestPayload);
    const duration = Date.now() - startTime;

    setOutput(response);
    setLoading(false);

    onTraceGenerated({
      id: `tr-${Date.now()}`,
      workflowId: requestPayload.workflow_id,
      timestamp: new Date().toLocaleTimeString(),
      portalSource: 'patient',
      agentTarget: agentTarget,
      action: actionType,
      durationMs: duration,
      success: response.success !== false,
      request: requestPayload,
      response: response,
    });
  };

  // Intelligent intent-based query routing
  const handleExecuteAiQuery = async (queryText: string) => {
    if (!queryText.trim()) return;
    const lower = queryText.toLowerCase();

    if (lower.includes('insurance') || lower.includes('policy') || lower.includes('coverage') || lower.includes('copay')) {
      await handlePatientQuery('get_coverage', queryText, { service_type: 'CONSULTATION', policy_id: patientPolicy?.policy_id });
    } else if (lower.includes('appointment') || lower.includes('slot') || lower.includes('doctor') || lower.includes('schedule')) {
      await handlePatientQuery('get_available_slots', queryText, { doctor_id: bookDoctor, date: bookDate });
    } else if (lower.includes('history') || lower.includes('record') || lower.includes('chronic') || lower.includes('visit')) {
      await handlePatientQuery('get_patient_history', queryText);
    } else {
      // Default to lab explanation / clinical understanding
      await handlePatientQuery('explain_lab_report', queryText, { report_id: activeLabReport?.report_id, audience: 'patient' });
    }
  };

  const handleExplainLabReport = async (reportId?: string) => {
    const repId = reportId || activeLabReport?.report_id;
    if (!repId) {
      setOutput({
        success: false,
        message: 'No laboratory reports currently available on file for this patient.',
      });
      return;
    }
    await handlePatientQuery(
      'explain_lab_report',
      `Explain lab report ${repId} in clear, patient-friendly language with reference ranges and abnormal flags highlighted.`,
      { report_id: repId, audience: 'patient' }
    );
    const el = document.getElementById('ai-intelligence-section');
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleCheckCoverage = async (serviceType: string = 'CONSULTATION') => {
    await handlePatientQuery(
      'get_coverage',
      `Verify my insurance coverage, active pre-authorization, and copay percentage for ${serviceType.toLowerCase()}.`,
      { service_type: serviceType, policy_id: patientPolicy?.policy_id }
    );
    const el = document.getElementById('ai-intelligence-section');
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  const toggleMed = (id: string) => {
    setMedTakenState((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Automation 1: Conflict-Aware Appointment Booking via Appointment Agent & Supabase
  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookingLoading(true);
    setBookingError(null);

    const reqPayload = {
      workflow_id: `WF-APT-${Date.now().toString().slice(-4)}`,
      agent_target: 'appointment' as const,
      action: 'book_appointment',
      portal_source: 'patient',
      patient_id: mrn,
      doctor_id: bookDoctor,
      hospital_id: 'HOSP-001',
      date: bookDate,
      time_slot: bookTime,
      reason: bookReason,
    };

    const startTime = Date.now();
    const res = await dispatchToWorkbench(reqPayload);
    const duration = Date.now() - startTime;

    onTraceGenerated({
      id: `tr-${Date.now()}`,
      workflowId: reqPayload.workflow_id,
      timestamp: new Date().toLocaleTimeString(),
      portalSource: 'patient',
      agentTarget: 'appointment',
      action: 'book_appointment',
      durationMs: duration,
      success: res.success !== false && !res.errors?.length,
      request: reqPayload,
      response: res,
    });

    if (res.success && (res.result?.appointment || res.result?.appointment_id)) {
      const confirmedApt = res.result.appointment || {
        appointment_id: res.result.appointment_id || `APT-${Date.now().toString().slice(-4)}`,
        patient_id: mrn,
        doctor_id: bookDoctor,
        hospital_id: 'HOSP-001',
        date: bookDate,
        time_slot: bookTime,
        status: 'SCHEDULED',
        reason: bookReason,
      };

      // Real-time synchronization to Supabase and reactive hooks
      dataService.bookAppointment(confirmedApt);

      setBookingSuccess(true);
      setTimeout(() => {
        setBookingSuccess(false);
        setIsBookModalOpen(false);
      }, 1500);
    } else {
      const errMsg =
        res.errors?.[0] ||
        (typeof res.result === 'string' ? res.result : null) ||
        'Selected slot is unavailable or conflicts with another appointment. Please choose a different time.';
      setBookingError(errMsg);
    }
    setBookingLoading(false);
  };

  return (
    <div style={{ padding: '1.75rem 2.25rem', maxWidth: 1280, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* 1. PATIENT HERO IDENTITY AREA (Requirement 5) */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          paddingBottom: '1.5rem',
          borderBottom: '1px solid var(--border-subtle)',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h1
            style={{
              fontSize: '1.85rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
              letterSpacing: '-0.03em',
              margin: 0,
            }}
          >
            Good morning, {patientDisplayName}
          </h1>
          <div style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Your health overview
          </div>

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
              }}
            >
              MRN: {mrn}
            </span>
            <span>•</span>
            <span>38 years</span>
            <span>•</span>
            <span>Female</span>
            <span>•</span>
            <span>Blood group: <strong style={{ color: 'var(--text-primary)' }}>B+</strong></span>
            <span>•</span>
            <span>Primary care: <strong style={{ color: 'var(--text-primary)' }}>Dr. Rajesh Mehta</strong></span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handlePatientQuery('get_patient_history', 'Summarize my longitudinal medical history and records')}
          >
            <Download style={{ width: 14, height: 14 }} /> Download Medical Summary
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsBookModalOpen(true)}
          >
            <Plus style={{ width: 14, height: 14 }} /> Book Appointment
          </Button>
        </div>
      </div>

      {/* 2. YOUR HEALTH AT A GLANCE (Requirement 6) */}
      <section>
        <div style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.85rem' }}>
          YOUR HEALTH AT A GLANCE
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1rem',
          }}
        >
          {/* Snapshot 1: Next Appointment */}
          <div
            style={{
              background: '#ffffff',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '1.25rem',
              boxShadow: 'var(--shadow-xs)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  NEXT APPOINTMENT
                </span>
                <Calendar style={{ width: 15, height: 15, color: 'var(--teal-intelligent)' }} />
              </div>
              {nextApt ? (
                <div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {nextApt.date} • {nextApt.time_slot}
                  </div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                    {doctors.find((d) => d.doctor_id === nextApt.doctor_id)
                      ? `Dr. ${doctors.find((d) => d.doctor_id === nextApt.doctor_id)?.first_name} ${doctors.find((d) => d.doctor_id === nextApt.doctor_id)?.last_name} • ${doctors.find((d) => d.doctor_id === nextApt.doctor_id)?.specialty}`
                      : 'Attending Specialist'}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
                    {nextApt.reason || 'Clinical Consultation'}
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                    No appointment scheduled
                  </div>
                </div>
              )}
            </div>
            <div style={{ marginTop: '0.85rem', paddingTop: '0.65rem', borderTop: '1px dashed var(--border-subtle)' }}>
              <button
                onClick={() => setIsBookModalOpen(true)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--teal-intelligent)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                }}
              >
                {nextApt ? 'Manage appointment' : '+ Book appointment'} <ChevronRight style={{ width: 12, height: 12 }} />
              </button>
            </div>
          </div>

          {/* Snapshot 2: Active Medications */}
          <div
            style={{
              background: '#ffffff',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '1.25rem',
              boxShadow: 'var(--shadow-xs)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  ACTIVE MEDICATIONS
                </span>
                <Pill style={{ width: 15, height: 15, color: 'var(--medical-emerald)' }} />
              </div>
              <div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {patientMedications.length} Active {patientMedications.length === 1 ? 'Prescription' : 'Prescriptions'}
                </div>
                <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                  {patientMedications.length > 0
                    ? patientMedications.map((m) => `${m.name} ${m.dose}`.trim()).join(', ')
                    : 'No active prescriptions'}
                </div>
                {patientMedications.length > 0 && (
                  <div style={{ fontSize: '0.72rem', color: 'var(--medical-emerald)', fontWeight: 600, marginTop: '0.1rem' }}>
                    Refills and regimen current
                  </div>
                )}
              </div>
            </div>
            <div style={{ marginTop: '0.85rem', paddingTop: '0.65rem', borderTop: '1px dashed var(--border-subtle)' }}>
              <button
                onClick={() => {
                  const el = document.getElementById('medications-section');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--teal-intelligent)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                }}
              >
                View prescriptions <ChevronRight style={{ width: 12, height: 12 }} />
              </button>
            </div>
          </div>

          {/* Snapshot 3: Latest Results */}
          <div
            style={{
              background: '#ffffff',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '1.25rem',
              boxShadow: 'var(--shadow-xs)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  LATEST RESULTS
                </span>
                <FlaskConical style={{ width: 15, height: 15, color: 'var(--warning-amber)' }} />
              </div>
              {activeLabReport ? (
                <div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {activeLabReport.test_type || (activeLabReport as any).test_name || 'Laboratory Panel'}
                  </div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                    {activeLabReport.results?.[0]
                      ? `${activeLabReport.results[0].parameter}: ${activeLabReport.results[0].value} ${activeLabReport.results[0].unit}`
                      : 'Metabolic & Diagnostic Profile'}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
                    Report: {activeLabReport.report_id} • {activeLabReport.status || 'COMPLETED'}
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    No Lab Reports
                  </div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                    No diagnostic records on file
                  </div>
                </div>
              )}
            </div>
            <div style={{ marginTop: '0.85rem', paddingTop: '0.65rem', borderTop: '1px dashed var(--border-subtle)' }}>
              <button
                onClick={() => handleExplainLabReport(activeLabReport?.report_id)}
                disabled={!activeLabReport}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: activeLabReport ? 'var(--teal-intelligent)' : 'var(--text-muted)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: activeLabReport ? 'pointer' : 'default',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                }}
              >
                Explain with Medical AI <ChevronRight style={{ width: 12, height: 12 }} />
              </button>
            </div>
          </div>

          {/* Snapshot 4: Insurance */}
          <div
            style={{
              background: '#ffffff',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '1.25rem',
              boxShadow: 'var(--shadow-xs)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  INSURANCE
                </span>
                <ShieldCheck style={{ width: 15, height: 15, color: 'var(--navy-institutional)' }} />
              </div>
              {patientPolicy ? (
                <div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {patientPolicy.provider_name}
                  </div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                    Policy: {patientPolicy.policy_id} • {patientPolicy.plan_type}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--clinical-green)', fontWeight: 600, marginTop: '0.1rem' }}>
                    Status: {patientPolicy.status} • Copay: {patientPolicy.copay_percentage}%
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    No Active Policy
                  </div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                    No insurance policy linked
                  </div>
                </div>
              )}
            </div>
            <div style={{ marginTop: '0.85rem', paddingTop: '0.65rem', borderTop: '1px dashed var(--border-subtle)' }}>
              <button
                onClick={() => handleCheckCoverage('CONSULTATION')}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--teal-intelligent)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                }}
              >
                Check coverage & copay <ChevronRight style={{ width: 12, height: 12 }} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. UPCOMING CARE (Requirement 7) */}
      <section>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
          <div style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            UPCOMING CARE
          </div>
          <Button size="sm" variant="secondary" onClick={() => setIsBookModalOpen(true)}>
            <Plus style={{ width: 13, height: 13 }} /> Schedule New Visit
          </Button>
        </div>

        {displayApts.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {displayApts.map((apt) => (
              <div
                key={apt.appointment_id}
                style={{
                  background: '#ffffff',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.25rem 1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  flexWrap: 'wrap',
                  boxShadow: 'var(--shadow-xs)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                  <div
                    style={{
                      background: 'var(--teal-subtle)',
                      border: '1px solid var(--teal-border)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '0.65rem 0.9rem',
                      textAlign: 'center',
                      minWidth: 80,
                    }}
                  >
                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--teal-intelligent)', textTransform: 'uppercase' }}>
                      {new Date(apt.date).toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}
                    </div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1 }}>
                      {new Date(apt.date).getDate() || 18}
                    </div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                      2026
                    </div>
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                      <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {apt.reason || 'Cardiology Routine Follow-Up & ECG Review'}
                      </span>
                      <Badge variant="green">CONFIRMED</Badge>
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                      {doctors.find((d) => d.doctor_id === apt.doctor_id)
                        ? `Dr. ${doctors.find((d) => d.doctor_id === apt.doctor_id)?.first_name} ${doctors.find((d) => d.doctor_id === apt.doctor_id)?.last_name}, MD • ${doctors.find((d) => d.doctor_id === apt.doctor_id)?.specialty}`
                        : 'Attending Specialist'}
                    </div>
                    <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                      Time: {apt.time_slot} • Coimbatore Medical Center (Suite 302, West Wing)
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handlePatientQuery('explain_lab_report', `Provide consultation preparation checklist for appointment ${apt.appointment_id}`)}
                  >
                    Preparation Advice
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setIsBookModalOpen(true)}
                  >
                    Reschedule
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div
            style={{
              background: '#ffffff',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '2.5rem 1.5rem',
              textAlign: 'center',
            }}
          >
            <Calendar style={{ width: 32, height: 32, color: 'var(--text-muted)', margin: '0 auto 0.75rem', opacity: 0.5 }} />
            <div style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              No upcoming appointments
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.25rem', marginBottom: '1rem' }}>
              You currently don't have a scheduled appointment.
            </p>
            <Button variant="primary" size="sm" onClick={() => setIsBookModalOpen(true)}>
              Book an appointment
            </Button>
          </div>
        )}
      </section>

      {/* 4. RECENT HEALTH ACTIVITY (Requirement 8) */}
      <section>
        <div style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.85rem' }}>
          RECENT HEALTH ACTIVITY
        </div>

        <div
          style={{
            background: '#ffffff',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '1.5rem',
            boxShadow: 'var(--shadow-xs)',
          }}
        >
          {(() => {
            const recentActivities = [
              ...patientLabReports.map((lr) => ({
                date: lr.test_date || 'Recent',
                type: 'Lab report',
                title: `${lr.test_type || 'Diagnostic Panel'} completed`,
                doctor: doctors.find((d) => d.doctor_id === lr.doctor_id)
                  ? `Ordered by: Dr. ${doctors.find((d) => d.doctor_id === lr.doctor_id)?.first_name} ${doctors.find((d) => d.doctor_id === lr.doctor_id)?.last_name}`
                  : 'Diagnostic Laboratory',
                details: lr.results && lr.results.length > 0
                  ? `Diagnostic analysis verified: ${lr.results.map((r: any) => `${r.parameter} (${r.value} ${r.unit})`).join(', ')}.`
                  : 'Diagnostic tests analyzed and verified by automated laboratory services.',
                action: 'Verified and filed in your diagnostic medical record.',
                icon: <FlaskConical style={{ width: 16, height: 16, color: 'var(--warning-amber)' }} />,
                tag: lr.status || 'VERIFIED',
              })),
              ...patientApts.map((a) => ({
                date: a.date,
                type: 'Clinical visit',
                title: a.reason || 'Clinical Consultation',
                doctor: doctors.find((d) => d.doctor_id === a.doctor_id)
                  ? `Attending: Dr. ${doctors.find((d) => d.doctor_id === a.doctor_id)?.first_name} ${doctors.find((d) => d.doctor_id === a.doctor_id)?.last_name}, MD`
                  : 'Clinical Staff',
                details: `Outpatient visit scheduled at Coimbatore Medical Center • Time: ${a.time_slot}.`,
                action: 'Confirmed on clinical schedule.',
                icon: <Stethoscope style={{ width: 16, height: 16, color: 'var(--teal-intelligent)' }} />,
                tag: a.status || 'SCHEDULED',
              })),
              ...patientPrescriptions.map((rx) => ({
                date: rx.issued_date || 'Recent',
                type: 'Prescription',
                title: 'Medication Regimen Active',
                doctor: doctors.find((d) => d.doctor_id === rx.doctor_id)
                  ? `Issued by: Dr. ${doctors.find((d) => d.doctor_id === rx.doctor_id)?.first_name} ${doctors.find((d) => d.doctor_id === rx.doctor_id)?.last_name}, MD`
                  : 'Attending Physician',
                details: (rx.medications || []).map((m: any) => `${m.name} ${m.dosage || m.dose}`).join('; '),
                action: `${rx.refills_remaining !== undefined ? `${rx.refills_remaining} refills remaining` : 'Active therapy'}.`,
                icon: <Pill style={{ width: 16, height: 16, color: 'var(--medical-emerald)' }} />,
                tag: 'ACTIVE RX',
              })),
            ];

            if (recentActivities.length === 0) {
              return (
                <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  No recent clinical activity logged for this account.
                </div>
              );
            }

            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {recentActivities.map((item, idx, arr) => (
                  <div key={idx} style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 32 }}>
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          background: 'var(--bg-surface-secondary)',
                          border: '1px solid var(--border-subtle)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        {item.icon}
                      </div>
                      {idx < arr.length - 1 && (
                        <div style={{ width: 2, height: 42, background: 'var(--border-subtle)', margin: '0.35rem 0' }} />
                      )}
                    </div>

                    <div style={{ flex: 1, paddingBottom: idx < arr.length - 1 ? '0.5rem' : 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.4rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                            {item.date}
                          </span>
                          <span style={{ color: 'var(--border-strong)' }}>•</span>
                          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--teal-intelligent)' }}>
                            {item.type}
                          </span>
                        </div>
                        <span
                          style={{
                            fontSize: '0.66rem',
                            fontWeight: 700,
                            padding: '0.1rem 0.4rem',
                            borderRadius: 4,
                            background: 'var(--bg-surface-secondary)',
                            color: 'var(--text-secondary)',
                            border: '1px solid var(--border-subtle)',
                          }}
                        >
                          {item.tag}
                        </span>
                      </div>

                      <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.2rem' }}>
                        {item.title}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
                        {item.doctor}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                        {item.details}
                      </div>
                      <div style={{ fontSize: '0.76rem', fontWeight: 600, color: 'var(--teal-intelligent)', marginTop: '0.2rem' }}>
                        {item.action}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      </section>

      {/* 5. ACTIVE MEDICATIONS (Requirement 9) */}
      <section id="medications-section">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
          <div style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            ACTIVE MEDICATIONS
          </div>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => handlePatientQuery('get_patient_history', 'Provide a complete breakdown of my current prescription schedule and refills')}
          >
            View Prescription History
          </Button>
        </div>

        <div
          style={{
            background: '#ffffff',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '1.25rem 1.5rem',
            boxShadow: 'var(--shadow-xs)',
          }}
        >
          {patientMedications.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {patientMedications.map((med) => {
                const isTaken = medTakenState[med.id];
                return (
                  <div
                    key={med.id}
                    onClick={() => toggleMed(med.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.9rem 1.15rem',
                      borderRadius: 'var(--radius-sm)',
                      border: isTaken ? '1px solid var(--teal-border)' : '1px solid var(--border-subtle)',
                      background: isTaken ? 'var(--teal-subtle)' : 'var(--bg-surface-secondary)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      flexWrap: 'wrap',
                      gap: '0.75rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
                      <div
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: 6,
                          border: isTaken ? '2px solid var(--teal-intelligent)' : '2px solid var(--border-strong)',
                          background: isTaken ? 'var(--teal-intelligent)' : '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#ffffff',
                        }}
                      >
                        {isTaken && <Check style={{ width: 14, height: 14, strokeWidth: 3 }} />}
                      </div>
                      <div>
                        <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                          {med.name} <span style={{ fontWeight: 600, color: 'var(--teal-intelligent)' }}>• {med.dose}</span>
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                          {med.schedule} • {med.reason}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
                          Prescribed by: {med.prescriber} • {med.refills}
                        </div>
                      </div>
                    </div>

                    <Badge variant={isTaken ? 'green' : 'amber'}>
                      {isTaken ? 'DOSE TAKEN' : 'DUE TODAY'}
                    </Badge>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
              No active prescription medications on file.
            </div>
          )}
        </div>
      </section>

      {/* 6. MEDION AI — DEDICATED HEALTHCARE ASSISTANT (Requirement 10) */}
      <section
        style={{
          background: 'linear-gradient(180deg, #ffffff 0%, var(--bg-surface-secondary) 100%)',
          border: '1px solid var(--teal-border)',
          borderRadius: 'var(--radius-md)',
          padding: '1.75rem',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: 'linear-gradient(135deg, var(--teal-intelligent) 0%, #0f766e 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 2px 6px rgba(13, 148, 136, 0.3)',
            }}
          >
            <Sparkles style={{ width: 18, height: 18 }} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              MEDION AI
            </h3>
            <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--teal-intelligent)' }}>
              Your intelligent healthcare assistant
            </div>
          </div>
        </div>

        <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', margin: '0.2rem 0 1rem', maxWidth: 640 }}>
          Ask questions about your appointments, medical records and test results.
        </p>

        {/* Suggestion Prompt Chips */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
          {[
            { label: 'Explain my latest test results', prompt: 'Explain my latest laboratory test results in simple, clear language.' },
            { label: 'Show my upcoming appointments', prompt: 'Show my upcoming scheduled clinic visits and preparation instructions.' },
            { label: 'Check my insurance coverage', prompt: 'Check my current insurance policy coverage, pre-authorization and copay.' },
            { label: 'Summarize my medical history', prompt: 'Summarize my medical history, chronic conditions, and recent visits.' },
          ].map((chip, idx) => (
            <button
              key={idx}
              onClick={() => {
                setPatientAiInput(chip.prompt);
                handleExecuteAiQuery(chip.prompt);
              }}
              style={{
                background: '#ffffff',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-full)',
                padding: '0.35rem 0.8rem',
                fontSize: '0.76rem',
                fontWeight: 600,
                color: 'var(--text-primary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                transition: 'all 0.15s ease',
              }}
              className="hover:border-teal-500"
            >
              <span>{chip.label}</span>
              <ArrowRight style={{ width: 12, height: 12, color: 'var(--teal-intelligent)' }} />
            </button>
          ))}
        </div>

        {/* AI Query Input Bar */}
        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            background: '#ffffff',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-strong)',
            padding: '0.4rem 0.5rem',
            alignItems: 'center',
          }}
        >
          <input
            type="text"
            value={patientAiInput}
            onChange={(e) => setPatientAiInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleExecuteAiQuery(patientAiInput);
            }}
            placeholder="Ask MEDION about your care, prescriptions, or lab results..."
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              fontSize: '0.85rem',
              padding: '0.4rem 0.6rem',
              color: 'var(--text-primary)',
            }}
          />
          <Button
            variant="primary"
            size="sm"
            onClick={() => handleExecuteAiQuery(patientAiInput)}
            disabled={loading || !patientAiInput.trim()}
          >
            <Sparkles style={{ width: 14, height: 14 }} /> Ask MEDION
          </Button>
        </div>

        {/* AI Transparent Execution & Output */}
        {(loading || output) && (
          <div
            style={{
              marginTop: '1.25rem',
              background: '#ffffff',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              padding: '1.25rem',
            }}
          >
            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--teal-intelligent)', fontSize: '0.82rem', fontWeight: 600 }}>
                  <HeartPulse style={{ width: 16, height: 16, animation: 'spin 2s linear infinite' }} />
                  <span>MEDION Intelligence processing request...</span>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  <span style={{ color: 'var(--teal-intelligent)', fontWeight: 600 }}>1. Understanding request</span>
                  <span>→</span>
                  <span style={{ color: 'var(--teal-intelligent)', fontWeight: 600 }}>2. Checking patient context ({mrn})</span>
                  <span>→</span>
                  <span style={{ color: 'var(--teal-intelligent)', fontWeight: 600 }}>3. Routing to Medical Agent</span>
                  <span>→</span>
                  <span>4. Verifying clinical record</span>
                  <span>→</span>
                  <span>5. Preparing response</span>
                </div>
              </div>
            ) : (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--teal-intelligent)' }}>
                    <CheckCircle2 style={{ width: 14, height: 14 }} />
                    <span>Grounded in EHR Record ({mrn})</span>
                  </div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    AI assists. Clinicians decide.
                  </span>
                </div>
                <HumanResponseRenderer response={output} />
              </div>
            )}
          </div>
        )}

        <div style={{ marginTop: '0.75rem', fontSize: '0.7rem', color: 'var(--text-muted)', textAlign: 'center' }}>
          MEDION AI assists with healthcare navigation and record explanations. Clinicians decide all diagnosis and treatments.
        </div>
      </section>

      {/* Book Appointment Modal */}
      {isBookModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsBookModalOpen(false)}>
          <div
            className="modal-surface"
            style={{ maxWidth: 500 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-subtle)' }}>
              <h3 className="h3" style={{ margin: 0 }}>Book Clinical Consultation</h3>
              <button onClick={() => setIsBookModalOpen(false)} className="btn-ui btn-ghost-ui" style={{ padding: '0.2rem' }}>
                <X style={{ width: 16, height: 16 }} />
              </button>
            </div>

            {bookingSuccess ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                <CheckCircle2 style={{ width: 42, height: 42, color: 'var(--clinical-green)', margin: '0 auto 0.5rem' }} />
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Appointment Confirmed!</h4>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                  Synchronized with hospital schedule and notified attending physician.
                </p>
              </div>
            ) : (
              <form onSubmit={handleCreateBooking} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '0.3rem' }}>
                    Select Attending Physician
                  </label>
                  <select
                    value={bookDoctor}
                    onChange={(e) => setBookDoctor(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.55rem',
                      borderRadius: 'var(--radius-xs)',
                      border: '1px solid var(--border-strong)',
                      fontSize: '0.85rem',
                      background: '#ffffff',
                    }}
                  >
                    {doctors.map((doc) => (
                      <option key={doc.doctor_id} value={doc.doctor_id}>
                        Dr. {doc.first_name} {doc.last_name} ({doc.specialty})
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '0.3rem' }}>
                      Date
                    </label>
                    <input
                      type="date"
                      value={bookDate}
                      onChange={(e) => setBookDate(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.55rem',
                        borderRadius: 'var(--radius-xs)',
                        border: '1px solid var(--border-strong)',
                        fontSize: '0.85rem',
                      }}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '0.3rem' }}>
                      Time Slot {availableSlots.length > 0 && <span style={{ color: 'var(--teal-intelligent)', fontSize: '0.72rem' }}>({availableSlots.length} available)</span>}
                    </label>
                    <select
                      value={bookTime}
                      onChange={(e) => setBookTime(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.55rem',
                        borderRadius: 'var(--radius-xs)',
                        border: '1px solid var(--border-strong)',
                        fontSize: '0.85rem',
                        background: '#ffffff',
                      }}
                    >
                      {availableSlots.length > 0 ? (
                        availableSlots.map((slot) => (
                          <option key={slot} value={slot}>
                            {slot}
                          </option>
                        ))
                      ) : (
                        <>
                          <option value="09:00-09:30">09:00 - 09:30 AM</option>
                          <option value="09:30-10:00">09:30 - 10:00 AM</option>
                          <option value="10:00-10:30">10:00 - 10:30 AM</option>
                          <option value="10:30-11:00">10:30 - 11:00 AM</option>
                          <option value="11:00-11:30">11:00 - 11:30 AM</option>
                          <option value="14:00-14:30">02:00 - 02:30 PM</option>
                        </>
                      )}
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '0.3rem' }}>
                    Reason for Consultation
                  </label>
                  <input
                    type="text"
                    value={bookReason}
                    onChange={(e) => setBookReason(e.target.value)}
                    placeholder="e.g. Follow-up consultation, medication titration"
                    style={{
                      width: '100%',
                      padding: '0.55rem',
                      borderRadius: 'var(--radius-xs)',
                      border: '1px solid var(--border-strong)',
                      fontSize: '0.85rem',
                    }}
                    required
                  />
                </div>

                {bookingError && (
                  <div
                    style={{
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid var(--status-danger)',
                      borderRadius: 'var(--radius-xs)',
                      padding: '0.6rem 0.8rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      color: 'var(--status-danger)',
                      fontSize: '0.8rem',
                    }}
                  >
                    <AlertCircle style={{ width: 16, height: 16, flexShrink: 0 }} />
                    <span>{bookingError}</span>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <Button variant="secondary" size="sm" type="button" onClick={() => setIsBookModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button variant="primary" size="sm" type="submit" disabled={bookingLoading}>
                    {bookingLoading ? 'Checking & Booking...' : 'Confirm Booking'}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
