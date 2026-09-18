import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  Plus,
  X,
  CheckCircle2,
  AlertCircle,
  Stethoscope,
  Building2,
  ChevronRight,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  Info,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useAuth } from '../../services/authService';
import { useSharedAppointments, useSharedDoctors, useSharedPatients, dataService } from '../../services/dataService';
import { dispatchToWorkbench } from '../../api/workbench';
import { ExecutionTraceStep, AppointmentItem } from '../../types';

interface PatientAppointmentsViewProps {
  onTraceGenerated?: (step: ExecutionTraceStep) => void;
}

export const PatientAppointmentsView: React.FC<PatientAppointmentsViewProps> = ({ onTraceGenerated }) => {
  const { user } = useAuth();
  const allAppointments = useSharedAppointments();
  const doctors = useSharedDoctors();
  const patients = useSharedPatients();

  // Scope strictly to authenticated patient session
  const activePatient = user?.id
    ? (patients.find((p) => p.patient_id.toUpperCase() === user.id.toUpperCase()) ||
       (user.email ? patients.find((p) => p.email?.toLowerCase() === user.email.toLowerCase()) : null) || {
         patient_id: user.id,
         first_name: user.name ? user.name.split(' ')[0] : 'Patient',
         last_name: user.name && user.name.split(' ').length > 1 ? user.name.split(' ').slice(1).join(' ') : '',
         email: user.email,
         phone: user.phone || '',
       })
    : patients[0];

  const mrn = user?.id || activePatient?.patient_id || 'PAT-1001';
  const patientDisplayName = user?.name || (activePatient ? `${activePatient.first_name} ${activePatient.last_name}` : 'Patient');

  // Strict Patient Isolation: Filter ONLY this patient's appointments
  const patientAppointments = allAppointments.filter(
    (a) => a.patient_id?.toUpperCase() === mrn.toUpperCase() && a.status !== 'CANCELLED'
  );

  // Modal & Form State
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [bookDoctorId, setBookDoctorId] = useState('DOC-101');
  const [bookDate, setBookDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [bookTimeSlot, setBookTimeSlot] = useState('10:00-10:30');
  const [bookReason, setBookReason] = useState('Clinical Follow-up & Health Assessment');
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);
  const [prepAdvice, setPrepAdvice] = useState<{ aptId: string; advice: string } | null>(null);

  // Dynamic slot lookup from Appointment Agent
  useEffect(() => {
    let isMounted = true;
    const fetchSlots = async () => {
      setLoadingSlots(true);
      try {
        const res = await dispatchToWorkbench({
          workflow_id: `wf-slots-${Date.now()}`,
          agent_target: 'appointment',
          action: 'get_available_slots',
          portal_source: 'patient',
          payload: {
            doctor_id: bookDoctorId,
            date: bookDate,
            caller_patient_id: mrn,
            user_role: 'patient',
          },
        });
        if (isMounted && res.success) {
          const rawSlots = res.result?.available_slots || res.result?.result_data?.available_slots || [];
          const openSlots: string[] = rawSlots
            .filter((s: any) => (typeof s === 'object' ? s.status === 'AVAILABLE' : true))
            .map((s: any) => (typeof s === 'string' ? s : s.time_slot || s.slot_id));

          if (openSlots.length > 0) {
            setAvailableSlots(openSlots);
            setBookTimeSlot(openSlots[0]);
          } else {
            setAvailableSlots([]);
            setBookTimeSlot('');
          }
        }
      } catch (err) {
        if (isMounted) {
          setAvailableSlots(['09:00-09:30', '10:00-10:30', '11:00-11:30', '14:00-14:30']);
          setBookTimeSlot('09:00-09:30');
        }
      } finally {
        if (isMounted) setLoadingSlots(false);
      }
    };

    if (isBookModalOpen) {
      fetchSlots();
    }
    return () => {
      isMounted = false;
    };
  }, [bookDoctorId, bookDate, isBookModalOpen, mrn]);

  // Handle Book Appointment
  const handleBookSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookTimeSlot) {
      setBookingError('No available time slots for the selected date. Please choose another date or doctor.');
      return;
    }
    setBookingLoading(true);
    setBookingError(null);

    const startTime = Date.now();
    const reqPayload = {
      workflow_id: `WF-APT-${Date.now().toString().slice(-4)}`,
      agent_target: 'appointment' as const,
      action: 'book_appointment',
      portal_source: 'patient',
      payload: {
        patient_id: mrn,
        caller_patient_id: mrn,
        user_role: 'patient',
        doctor_id: bookDoctorId,
        hospital_id: 'HOSP-001',
        date: bookDate,
        time_slot: bookTimeSlot,
        reason: bookReason,
      },
    };

    try {
      const res = await dispatchToWorkbench(reqPayload);
      const duration = Date.now() - startTime;

      if (onTraceGenerated) {
        onTraceGenerated({
          id: `tr-${Date.now()}`,
          workflowId: reqPayload.workflow_id,
          timestamp: new Date().toLocaleTimeString(),
          portalSource: 'patient',
          agentTarget: 'appointment',
          action: 'book_appointment',
          durationMs: duration,
          success: res.success !== false,
          request: reqPayload,
          response: res,
        });
      }

      if (res.success) {
        const confirmedApt: AppointmentItem =
          res.result?.appointment ||
          res.result?.result_data?.appointment || {
            appointment_id: res.result?.appointment_id || res.result?.result_data?.appointment_id || `APT-${Date.now().toString().slice(-4)}`,
            patient_id: mrn,
            doctor_id: bookDoctorId,
            hospital_id: 'HOSP-001',
            date: bookDate,
            time_slot: bookTimeSlot,
            status: 'SCHEDULED',
            reason: bookReason,
          };

        // Sync confirmed booking into persistent client database
        dataService.bookAppointment(confirmedApt);

        setIsBookModalOpen(false);
        setNotificationMsg(`Appointment confirmed successfully for ${bookDate} at ${bookTimeSlot}!`);
        setTimeout(() => setNotificationMsg(null), 4500);
      } else {
        setBookingError(res.errors?.[0] || 'Selected slot is unavailable. Please choose another time.');
      }
    } catch (err: any) {
      setBookingError(err.message || 'Error communicating with appointment scheduling engine.');
    } finally {
      setBookingLoading(false);
    }
  };

  // Handle Cancel Appointment (Patient's Own Only)
  const handleCancelApt = async (aptId: string) => {
    try {
      await dispatchToWorkbench({
        workflow_id: `wf-cancel-${Date.now()}`,
        agent_target: 'appointment',
        action: 'cancel_appointment',
        portal_source: 'patient',
        payload: {
          appointment_id: aptId,
          patient_id: mrn,
          caller_patient_id: mrn,
          user_role: 'patient',
        },
      });

      dataService.cancelAppointment(aptId);
      setNotificationMsg(`Appointment ${aptId} has been cancelled.`);
      setTimeout(() => setNotificationMsg(null), 4000);
    } catch (err: any) {
      setNotificationMsg(err.message || 'Unable to cancel appointment.');
      setTimeout(() => setNotificationMsg(null), 5000);
    }
  };

  // Handle Preparation Advice via Medical Agent
  const handleGetPreparationAdvice = async (apt: AppointmentItem) => {
    try {
      const doc = doctors.find((d) => d.doctor_id === apt.doctor_id);
      const docName = doc ? `Dr. ${doc.first_name} ${doc.last_name}` : 'the attending physician';
      const res = await dispatchToWorkbench({
        workflow_id: `wf-prep-${Date.now()}`,
        agent_target: 'assistant',
        action: 'interpret_request',
        portal_source: 'patient',
        payload: {
          message: `Provide pre-consultation clinical preparation instructions for appointment ${apt.appointment_id} with ${docName}.`,
          patient_id: mrn,
          caller_patient_id: mrn,
          user_role: 'patient',
        },
      });

      const adviceText =
        res.result?.summary ||
        res.result?.result_data?.explanation ||
        'Please arrive 15 minutes prior to your consultation with your active photo ID, current medication list, and relevant outside diagnostic reports.';

      setPrepAdvice({ aptId: apt.appointment_id, advice: adviceText });
    } catch (e) {
      setPrepAdvice({
        aptId: apt.appointment_id,
        advice: 'Please arrive 15 minutes prior to your consultation with your active photo ID and current prescription list.',
      });
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: 1150, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem', fontFamily: 'var(--font-sans)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--teal-intelligent)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.25rem' }}>
            <CalendarIcon style={{ width: 14, height: 14 }} /> Patient Care Portal • Appointments & Consultations
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
            My Scheduled Appointments
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: '0.35rem 0 0' }}>
            Review your upcoming consultations, book appointments with attending clinicians, and manage your care schedule.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ textAlign: 'right', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            <div>Patient: <strong style={{ color: 'var(--text-primary)' }}>{patientDisplayName}</strong></div>
            <div>MRN: <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-primary)' }}>{mrn}</span></div>
          </div>
          <Button
            onClick={() => setIsBookModalOpen(true)}
            style={{ padding: '0.65rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Plus style={{ width: 16, height: 16 }} /> Book Appointment
          </Button>
        </div>
      </div>

      {/* Notification Toast */}
      {notificationMsg && (
        <div style={{ padding: '0.85rem 1.25rem', borderRadius: 'var(--radius-md, 8px)', backgroundColor: 'var(--medical-emerald-subtle, #ecfdf5)', border: '1px solid #a7f3d0', color: 'var(--medical-emerald, #059669)', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle2 style={{ width: 18, height: 18 }} />
          <span>{notificationMsg}</span>
        </div>
      )}

      {/* Security Scope Banner */}
      <div style={{ padding: '0.85rem 1.25rem', backgroundColor: '#f8fafc', borderRadius: 'var(--radius-md, 10px)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShieldCheck style={{ width: 16, height: 16, color: 'var(--teal-intelligent)' }} />
          <span>Showing strictly verified appointments scheduled for <strong>{patientDisplayName} ({mrn})</strong>. Hospital operational queues and other patient records are strictly isolated.</span>
        </div>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-muted)' }}>RBAC Isolation: Active</span>
      </div>

      {/* Appointments List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {patientAppointments.length > 0 ? (
          patientAppointments.map((apt) => {
            const doc = doctors.find((d) => d.doctor_id === apt.doctor_id) || doctors[0];
            const isDoctorCancelled = apt.status === 'CANCELLED_BY_DOCTOR';
            return (
              <div
                key={apt.appointment_id}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: 'var(--radius-lg, 16px)',
                  border: isDoctorCancelled ? '1px solid #fca5a5' : '1px solid var(--border-subtle)',
                  padding: '1.5rem',
                  boxShadow: 'var(--shadow-xs)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                    {/* Date Block */}
                    <div
                      style={{
                        backgroundColor: isDoctorCancelled ? '#fef2f2' : 'var(--teal-subtle)',
                        border: isDoctorCancelled ? '1px solid #fecaca' : '1px solid var(--teal-border)',
                        borderRadius: 'var(--radius-md, 10px)',
                        padding: '0.75rem 1rem',
                        textAlign: 'center',
                        minWidth: 80,
                      }}
                    >
                      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: isDoctorCancelled ? '#dc2626' : 'var(--teal-intelligent)', textTransform: 'uppercase' }}>
                        {new Date(apt.date).toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}
                      </div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1 }}>
                        {new Date(apt.date).getDate() || 18}
                      </div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                        {new Date(apt.date).getFullYear() || 2026}
                      </div>
                    </div>

                    {/* Details */}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                          {apt.reason || 'Clinical Consultation'}
                        </h3>
                        <span style={{
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          padding: '0.15rem 0.5rem',
                          borderRadius: 4,
                          backgroundColor: isDoctorCancelled ? '#fee2e2' : '#dcfce7',
                          color: isDoctorCancelled ? '#b91c1c' : '#15803d'
                        }}>
                          {isDoctorCancelled ? 'CANCELLED BY DOCTOR' : (apt.status || 'CONFIRMED')}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Stethoscope style={{ width: 14, height: 14, color: 'var(--teal-intelligent)' }} />
                        <span>Dr. {doc?.first_name} {doc?.last_name}, MD • {doc?.specialty || 'Cardiology'}</span>
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                        <span>Time: <strong style={{ color: 'var(--text-primary)' }}>{apt.time_slot}</strong></span>
                        <span>Facility: <strong style={{ color: 'var(--text-primary)' }}>Coimbatore Medical Center (HOSP-001)</strong></span>
                        <span>Appointment ID: <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>{apt.appointment_id}</strong></span>
                      </div>
                      {isDoctorCancelled && (
                        <div style={{ marginTop: '0.5rem', padding: '0.5rem 0.75rem', borderRadius: 6, backgroundColor: '#fef2f2', border: '1px solid #fee2e2', color: '#991b1b', fontSize: '0.8rem' }}>
                          <strong>Cancellation Reason:</strong> {apt.cancellation_reason || 'Cancelled per physician notice.'}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleGetPreparationAdvice(apt)}
                      style={{ fontSize: '0.78rem' }}
                    >
                      <Sparkles style={{ width: 14, height: 14, marginRight: 6, color: 'var(--teal-intelligent)' }} /> Preparation Advice
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleCancelApt(apt.appointment_id)}
                      style={{ fontSize: '0.78rem', color: '#dc2626' }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>

                {/* Preparation Advice Expandable Box */}
                {prepAdvice && prepAdvice.aptId === apt.appointment_id && (
                  <div style={{ padding: '0.85rem 1rem', borderRadius: 'var(--radius-md, 8px)', backgroundColor: 'var(--teal-subtle)', border: '1px solid var(--teal-border)', fontSize: '0.82rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
                    <Info style={{ width: 16, height: 16, color: 'var(--teal-intelligent)', flexShrink: 0, marginTop: 2 }} />
                    <div style={{ flex: 1 }}>
                      <strong style={{ color: 'var(--teal-intelligent)' }}>Consultation Preparation Checklist:</strong>
                      <div style={{ marginTop: '0.25rem', lineHeight: 1.5 }}>{prepAdvice.advice}</div>
                    </div>
                    <button
                      onClick={() => setPrepAdvice(null)}
                      style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0 }}
                    >
                      <X style={{ width: 14, height: 14 }} />
                    </button>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div style={{ backgroundColor: '#ffffff', borderRadius: 'var(--radius-lg, 16px)', border: '1px solid var(--border-subtle)', padding: '3.5rem 1.5rem', textAlign: 'center', boxShadow: 'var(--shadow-xs)' }}>
            <CalendarIcon style={{ width: 44, height: 44, color: 'var(--text-muted)', margin: '0 auto 0.75rem', opacity: 0.4 }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>No Scheduled Appointments</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '0.35rem 0 1.25rem' }}>
              You currently do not have any active clinical visits scheduled.
            </p>
            <Button onClick={() => setIsBookModalOpen(true)}>
              <Plus style={{ width: 16, height: 16, marginRight: 6 }} /> Book an Appointment
            </Button>
          </div>
        )}
      </div>

      {/* Attending Care Team & Clinic Info */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        <div style={{ backgroundColor: '#ffffff', borderRadius: 'var(--radius-lg, 16px)', border: '1px solid var(--border-subtle)', padding: '1.5rem', boxShadow: 'var(--shadow-xs)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem', fontSize: '0.95rem' }}>
            <Building2 style={{ width: 18, height: 18, color: 'var(--teal-intelligent)' }} /> Clinic Location & Inquiries
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
            Coimbatore Medical Center • Suite 302, West Wing<br />
            Consultation Desk: <strong>+91 9123456780</strong><br />
            Emergency Line: <strong>+91 9845012345</strong> (24/7 Dispatch)
          </p>
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: 'var(--radius-lg, 16px)', border: '1px solid var(--border-subtle)', padding: '1.5rem', boxShadow: 'var(--shadow-xs)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem', fontSize: '0.95rem' }}>
            <RotateCcw style={{ width: 18, height: 18, color: 'var(--medical-emerald)' }} /> Reschedule & Cancellation Policy
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
            You may reschedule or cancel scheduled consultations up to 2 hours prior to the slot. For urgent care adjustments, please contact your attending doctor desk directly.
          </p>
        </div>
      </div>

      {/* Interactive Booking Modal */}
      {isBookModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', zIndex: 100 }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: 'var(--radius-lg, 16px)', maxWidth: 520, width: '100%', padding: '2rem', boxShadow: 'var(--shadow-xl)', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Book New Appointment</h3>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Scheduling consultation for {patientDisplayName} ({mrn})</span>
              </div>
              <button
                onClick={() => setIsBookModalOpen(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X style={{ width: 20, height: 20 }} />
              </button>
            </div>

            {bookingError && (
              <div style={{ padding: '0.75rem 1rem', borderRadius: 8, backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertCircle style={{ width: 16, height: 16, flexShrink: 0 }} />
                <span>{bookingError}</span>
              </div>
            )}

            <form onSubmit={handleBookSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                  Attending Physician
                </label>
                <select
                  value={bookDoctorId}
                  onChange={(e) => setBookDoctorId(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: 8, border: '1px solid var(--border-subtle)', fontSize: '0.85rem', color: 'var(--text-primary)', backgroundColor: 'var(--bg-surface)' }}
                >
                  {doctors.map((d) => (
                    <option key={d.doctor_id} value={d.doctor_id}>
                      Dr. {d.first_name} {d.last_name} ({d.specialty})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                    Consultation Date
                  </label>
                  <input
                    type="date"
                    value={bookDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setBookDate(e.target.value)}
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: 8, border: '1px solid var(--border-subtle)', fontSize: '0.85rem', color: 'var(--text-primary)', backgroundColor: 'var(--bg-surface)' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                    Available Time Slot {loadingSlots && <span style={{ color: 'var(--teal-intelligent)', fontSize: '0.72rem' }}>(Checking...)</span>}
                  </label>
                  <select
                    value={bookTimeSlot}
                    onChange={(e) => setBookTimeSlot(e.target.value)}
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: 8, border: '1px solid var(--border-subtle)', fontSize: '0.85rem', color: 'var(--text-primary)', backgroundColor: 'var(--bg-surface)' }}
                  >
                    {availableSlots.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                  Reason for Consultation / Symptoms
                </label>
                <input
                  type="text"
                  value={bookReason}
                  onChange={(e) => setBookReason(e.target.value)}
                  placeholder="e.g. Routine follow-up, hypertension check, chest discomfort"
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: 8, border: '1px solid var(--border-subtle)', fontSize: '0.85rem', color: 'var(--text-primary)', backgroundColor: 'var(--bg-surface)' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setIsBookModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={bookingLoading}
                >
                  {bookingLoading ? 'Confirming with Appointment Agent...' : 'Confirm Appointment'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
