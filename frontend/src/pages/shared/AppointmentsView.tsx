import React, { useState, useMemo, useRef } from 'react';
import { AppointmentItem } from '../../types';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { PageHeader, SectionHeader } from '../../components/common/SharedComponents';
import {
  Calendar as CalendarIcon,
  Clock,
  Plus,
  X,
  CheckCircle2,
  User,
  Stethoscope,
  Building2,
  Filter,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CalendarCheck,
  Activity,
  List,
  CalendarDays,
} from 'lucide-react';
import { useSharedAppointments, useSharedPatients, dataService } from '../../services/dataService';

export const AppointmentsView: React.FC = () => {
  const appointments = useSharedAppointments();
  const registeredPatients = useSharedPatients();
  const [viewMode, setViewMode] = useState<'schedule' | 'calendar' | 'table'>('schedule');
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const [selectedPhysician, setSelectedPhysician] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [timeScope, setTimeScope] = useState<'today' | 'week' | 'month'>('today');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  // Physician availability directory
  const physicians = useMemo(
    () => [
      { id: 'DOC-101', name: 'Dr. Rajesh Mehta', dept: 'Cardiology', room: 'OPD Suite 4B', status: 'In Consult', statusVariant: 'brand' as const, nextAvailable: '11:30 AM', bookedToday: 8 },
      { id: 'DOC-102', name: 'Dr. Anita Deshmukh', dept: 'Endocrinology', room: 'OPD Suite 2A', status: 'Available', statusVariant: 'green' as const, nextAvailable: 'Now (Walk-in)', bookedToday: 5 },
      { id: 'DOC-103', name: 'Dr. Suresh Rao', dept: 'General Medicine', room: 'OPD Suite 1C', status: 'In Consult', statusVariant: 'brand' as const, nextAvailable: '12:00 PM', bookedToday: 11 },
      { id: 'DOC-104', name: 'Dr. Priya Sundaram', dept: 'Neurology', room: 'Neuro Clinic 3', status: 'Ward Rounds', statusVariant: 'amber' as const, nextAvailable: '02:00 PM', bookedToday: 6 },
      { id: 'DOC-105', name: 'Dr. Vikram Patel', dept: 'Orthopedics', room: 'Fracture Clinic 5', status: 'Available', statusVariant: 'green' as const, nextAvailable: '11:45 AM', bookedToday: 7 },
    ],
    []
  );

  // Department load breakdown
  const departments = [
    { name: 'Cardiology', totalToday: 14, completed: 6, waiting: 2, capacity: '85%' },
    { name: 'General Medicine', totalToday: 18, completed: 8, waiting: 4, capacity: '92%' },
    { name: 'Endocrinology', totalToday: 9, completed: 4, waiting: 1, capacity: '60%' },
    { name: 'Neurology', totalToday: 8, completed: 3, waiting: 1, capacity: '70%' },
    { name: 'Orthopedics', totalToday: 11, completed: 5, waiting: 2, capacity: '78%' },
  ];

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const formattedTodayDate = useMemo(
    () =>
      new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }),
    []
  );

  // New Appointment Form State
  const [newPatientId, setNewPatientId] = useState('PAT-1001');
  const [newDept, setNewDept] = useState('Cardiology');
  const [newDoctorId, setNewDoctorId] = useState('DOC-101');
  const [newDate, setNewDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [newTimeSlot, setNewTimeSlot] = useState('');
  const [newReason, setNewReason] = useState('Routine Clinical Consultation');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);

  // Standard 30-minute consultation slots
  const availableSlotsList = [
    '09:00-09:30',
    '09:30-10:00',
    '10:00-10:30',
    '10:30-11:00',
    '11:00-11:30',
    '11:30-12:00',
    '14:00-14:30',
    '14:30-15:00',
    '15:00-15:30',
    '15:30-16:00',
  ];

  // Booked slots for selected doctor and date
  const bookedSlotsSet = useMemo(() => {
    const set = new Set<string>();
    appointments.forEach((apt) => {
      if (
        apt.status !== 'CANCELLED' &&
        apt.doctor_id === newDoctorId &&
        apt.date === newDate &&
        apt.time_slot
      ) {
        set.add(apt.time_slot);
      }
    });
    return set;
  }, [appointments, newDoctorId, newDate]);

  // Current Patient profile
  const currentPatient = useMemo(() => {
    return (
      registeredPatients.find((p) => p.patient_id.toUpperCase() === newPatientId.toUpperCase()) || {
        patient_id: newPatientId,
        first_name: 'Patient',
        last_name: newPatientId,
      }
    );
  }, [registeredPatients, newPatientId]);

  // Current Doctor profile
  const currentDoctor = useMemo(() => {
    return physicians.find((p) => p.id === newDoctorId) || physicians[0];
  }, [physicians, newDoctorId]);

  // Handle specialty change
  const handleDeptChange = (dept: string) => {
    setNewDept(dept);
    const docsInDept = physicians.filter((p) => p.dept === dept);
    if (docsInDept.length > 0) {
      setNewDoctorId(docsInDept[0].id);
    }
    setNewTimeSlot('');
  };

  // Handle doctor change
  const handleDoctorChange = (docId: string) => {
    setNewDoctorId(docId);
    const doc = physicians.find((p) => p.id === docId);
    if (doc && doc.dept !== newDept) {
      setNewDept(doc.dept);
    }
    setNewTimeSlot('');
  };

  // Open modal cleanly
  const handleOpenModal = () => {
    setNewTimeSlot('');
    setIsSubmitting(false);
    isSubmittingRef.current = false;
    setIsModalOpen(true);
  };

  // Handle Book Submit with strict duplicate prevention
  const handleBookSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingRef.current || isSubmitting) return;
    if (!newTimeSlot) return;

    isSubmittingRef.current = true;
    setIsSubmitting(true);

    try {
      const patientName = `${currentPatient.first_name} ${currentPatient.last_name}`.trim();
      const newApt = dataService.bookAppointment({
        patient_id: newPatientId,
        patient_name: patientName,
        doctor_id: newDoctorId,
        doctor_name: currentDoctor.name,
        specialty: newDept,
        hospital_id: 'HOSP-001',
        date: newDate,
        time_slot: newTimeSlot,
        status: 'SCHEDULED',
        reason: newReason,
      });

      setIsModalOpen(false);
      setNewTimeSlot('');
      setNotificationMsg(
        `Appointment ${newApt.appointment_id} scheduled successfully for ${patientName} with ${currentDoctor.name} on ${newDate} at ${newTimeSlot}!`
      );
      setTimeout(() => setNotificationMsg(null), 5000);
    } finally {
      setIsSubmitting(false);
      isSubmittingRef.current = false;
    }
  };

  const handleCancelApt = (id: string) => {
    dataService.cancelAppointment(id);
    setNotificationMsg(`Appointment ${id} has been cancelled.`);
    setTimeout(() => setNotificationMsg(null), 4500);
  };

  // Dynamically derive timeline slots with strict deduplication
  const activeTimelineSlots = useMemo(() => {
    const seenIds = new Set<string>();
    const uniqueApts: AppointmentItem[] = [];
    for (const apt of appointments) {
      const idKey = apt.appointment_id ? apt.appointment_id.toUpperCase() : null;
      if (idKey && !seenIds.has(idKey)) {
        seenIds.add(idKey);
        uniqueApts.push(apt);
      }
    }

    return uniqueApts.map((apt) => {
      const doc = physicians.find((p) => p.id === apt.doctor_id);
      return {
        id: apt.appointment_id,
        date: apt.date,
        time: apt.time_slot || (apt.start_time ? `${apt.start_time}-${apt.end_time || ''}` : '10:00-10:30'),
        doctor: apt.doctor_name || doc?.name || 'Dr. Rajesh Mehta',
        doctorId: apt.doctor_id,
        dept: apt.specialty || doc?.dept || 'Cardiology',
        room: doc?.room || 'OPD Suite 4B',
        patient: apt.patient_name || apt.patient_id || 'Patient',
        patientId: apt.patient_id,
        type: apt.reason_for_visit || apt.reason || 'Clinical Consultation',
        status: apt.status || 'CONFIRMED',
        statusVariant: (apt.status === 'COMPLETED' ? 'green' : (apt.status === 'IN_CONSULTATION' ? 'brand' : 'neutral')) as any,
      };
    });
  }, [appointments, physicians]);

  // Filter timeline items
  const filteredTimeline = useMemo(() => {
    return activeTimelineSlots.filter((slot) => {
      if (timeScope === 'today') {
        if (slot.date && slot.date !== todayStr) return false;
      } else if (timeScope === 'week') {
        if (slot.date) {
          const slotTime = new Date(slot.date).getTime();
          const todayTime = new Date(todayStr).getTime();
          const diffDays = (slotTime - todayTime) / (1000 * 3600 * 24);
          if (diffDays < 0 || diffDays > 7) return false;
        }
      }
      if (selectedDept !== 'ALL' && slot.dept !== selectedDept) return false;
      if (selectedPhysician !== 'ALL' && slot.doctor !== selectedPhysician) return false;
      if (selectedStatus !== 'ALL' && slot.status.toUpperCase() !== selectedStatus.toUpperCase()) return false;
      return true;
    });
  }, [activeTimelineSlots, timeScope, todayStr, selectedDept, selectedPhysician, selectedStatus]);

  // Filter table appointments with deduplication
  const filteredAppointments = useMemo(() => {
    const seen = new Set<string>();
    const unique = appointments.filter((apt) => {
      if (!apt.appointment_id || seen.has(apt.appointment_id.toUpperCase())) return false;
      seen.add(apt.appointment_id.toUpperCase());
      return true;
    });
    return unique.filter((apt) => {
      if (selectedStatus !== 'ALL' && apt.status !== selectedStatus) return false;
      return true;
    });
  }, [appointments, selectedStatus]);

  return (
    <div style={{ padding: '1.75rem 2rem', maxWidth: 1350, margin: '0 auto' }}>
      {/* Top Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '1.5rem',
          paddingBottom: '1.25rem',
          borderBottom: '1px solid var(--border-subtle)',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <div
            style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              color: 'var(--teal-intelligent)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            COIMBATORE MEDICAL CENTER • CLINICAL SCHEDULING OPERATIONS
          </div>
          <h1
            style={{
              fontSize: '1.75rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
              letterSpacing: '-0.03em',
              marginTop: '0.2rem',
            }}
          >
            Appointments & Clinical Scheduling
          </h1>
          <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Real-time outpatient timeline, attending physician availability, and multi-department slot allocation
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
          <div
            style={{
              display: 'flex',
              background: 'var(--bg-surface-secondary)',
              padding: '0.2rem',
              borderRadius: 6,
              border: '1px solid var(--border-subtle)',
            }}
          >
            <button
              onClick={() => setViewMode('schedule')}
              style={{
                padding: '0.35rem 0.75rem',
                fontSize: '0.8rem',
                fontWeight: 600,
                borderRadius: 4,
                border: 'none',
                cursor: 'pointer',
                background: viewMode === 'schedule' ? 'var(--bg-surface)' : 'transparent',
                color: viewMode === 'schedule' ? 'var(--text-primary)' : 'var(--text-muted)',
                boxShadow: viewMode === 'schedule' ? 'var(--shadow-sm)' : 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
            >
              <Clock style={{ width: 13, height: 13 }} /> Schedule Timeline
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              style={{
                padding: '0.35rem 0.75rem',
                fontSize: '0.8rem',
                fontWeight: 600,
                borderRadius: 4,
                border: 'none',
                cursor: 'pointer',
                background: viewMode === 'calendar' ? 'var(--bg-surface)' : 'transparent',
                color: viewMode === 'calendar' ? 'var(--text-primary)' : 'var(--text-muted)',
                boxShadow: viewMode === 'calendar' ? 'var(--shadow-sm)' : 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
            >
              <CalendarDays style={{ width: 13, height: 13 }} /> Calendar View
            </button>
            <button
              onClick={() => setViewMode('table')}
              style={{
                padding: '0.35rem 0.75rem',
                fontSize: '0.8rem',
                fontWeight: 600,
                borderRadius: 4,
                border: 'none',
                cursor: 'pointer',
                background: viewMode === 'table' ? 'var(--bg-surface)' : 'transparent',
                color: viewMode === 'table' ? 'var(--text-primary)' : 'var(--text-muted)',
                boxShadow: viewMode === 'table' ? 'var(--shadow-sm)' : 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
            >
              <List style={{ width: 13, height: 13 }} /> Registry List
            </button>
          </div>

          <Button variant="primary" size="sm" onClick={handleOpenModal}>
            <Plus style={{ width: 14, height: 14 }} /> Book Clinical Appointment
          </Button>
        </div>
      </div>

      {/* Action Notification Banner */}
      {notificationMsg && (
        <div
          style={{
            marginBottom: '1.25rem',
            background: 'var(--forest-subtle)',
            border: '1px solid var(--forest-brand)',
            color: 'var(--forest-brand)',
            borderRadius: 6,
            padding: '0.65rem 1rem',
            fontSize: '0.84rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontWeight: 600,
          }}
        >
          <CheckCircle2 style={{ width: 16, height: 16 }} />
          <span>{notificationMsg}</span>
        </div>
      )}

      {/* Filter Control Bar: Scope, Department, Physician, Status */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
          flexWrap: 'wrap',
          marginBottom: '1.5rem',
          padding: '0.75rem 1rem',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 8,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            SCOPE:
          </span>
          <div style={{ display: 'flex', gap: '0.25rem' }}>
            {(['today', 'week', 'month'] as const).map((scope) => (
              <button
                key={scope}
                onClick={() => setTimeScope(scope)}
                style={{
                  padding: '0.25rem 0.6rem',
                  fontSize: '0.76rem',
                  fontWeight: 600,
                  borderRadius: 4,
                  border: timeScope === scope ? '1px solid var(--teal-intelligent)' : '1px solid transparent',
                  background: timeScope === scope ? 'rgba(13, 148, 136, 0.1)' : 'transparent',
                  color: timeScope === scope ? 'var(--teal-intelligent)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                }}
              >
                {scope}
              </button>
            ))}
          </div>

          <div style={{ height: 18, width: 1, background: 'var(--border-subtle)', margin: '0 0.25rem' }} />

          {/* Department Filter */}
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            DEPT:
          </span>
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            style={{
              padding: '0.25rem 0.5rem',
              fontSize: '0.78rem',
              borderRadius: 4,
              border: '1px solid var(--border-subtle)',
              background: 'var(--bg-surface)',
              color: 'var(--text-primary)',
            }}
          >
            <option value="ALL">All Departments</option>
            <option value="Cardiology">Cardiology</option>
            <option value="General Medicine">General Medicine</option>
            <option value="Endocrinology">Endocrinology</option>
            <option value="Neurology">Neurology</option>
            <option value="Orthopedics">Orthopedics</option>
          </select>

          {/* Physician Filter */}
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            PHYSICIAN:
          </span>
          <select
            value={selectedPhysician}
            onChange={(e) => setSelectedPhysician(e.target.value)}
            style={{
              padding: '0.25rem 0.5rem',
              fontSize: '0.78rem',
              borderRadius: 4,
              border: '1px solid var(--border-subtle)',
              background: 'var(--bg-surface)',
              color: 'var(--text-primary)',
            }}
          >
            <option value="ALL">All Attending Staff</option>
            {physicians.map((p) => (
              <option key={p.id} value={p.name}>
                {p.name} ({p.dept})
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            STATUS:
          </span>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            style={{
              padding: '0.25rem 0.5rem',
              fontSize: '0.78rem',
              borderRadius: 4,
              border: '1px solid var(--border-subtle)',
              background: 'var(--bg-surface)',
              color: 'var(--text-primary)',
            }}
          >
            <option value="ALL">All Statuses</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="In Consult">In Consult</option>
            <option value="Completed">Completed</option>
            <option value="Waiting">Waiting / Triage</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          Showing <strong>{filteredTimeline.length}</strong> active clinical sessions today
        </div>
      </div>

      {/* VIEW MODE 1: CLINICAL SCHEDULE (TIMELINE & BOARD) */}
      {viewMode === 'schedule' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.8fr) minmax(320px, 1fr)', gap: '1.5rem', alignItems: 'start' }}>
          {/* LEFT: TODAY'S CLINICAL TIMELINE */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 8,
                padding: '1.25rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-subtle)' }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Today's Clinical Schedule
                  </h2>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Real-time outpatient queue • {formattedTodayDate}
                  </span>
                </div>
                <Badge variant="brand">Live Dispatch</Badge>
              </div>

              {/* Chronological Timeline Track */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {filteredTimeline.map((slot) => (
                  <div
                    key={slot.id}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '85px minmax(0, 1fr) auto',
                      gap: '1rem',
                      alignItems: 'center',
                      padding: '0.85rem 1rem',
                      borderRadius: 6,
                      background: (slot.status === 'In Consult' || slot.status === 'IN_CONSULTATION') ? 'rgba(13, 148, 136, 0.06)' : 'var(--bg-surface-secondary)',
                      border: (slot.status === 'In Consult' || slot.status === 'IN_CONSULTATION') ? '1px solid rgba(13, 148, 136, 0.3)' : '1px solid var(--border-subtle)',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {/* Time Column */}
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Clock style={{ width: 13, height: 13, color: 'var(--teal-intelligent)' }} />
                        {slot.time}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{slot.room}</span>
                    </div>

                    {/* Patient & Attending Info */}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-primary)' }}>
                          {slot.patient}
                        </span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                          {slot.patientId}
                        </span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--border-strong)' }}>•</span>
                        <span style={{ fontSize: '0.78rem', color: 'var(--teal-intelligent)', fontWeight: 600 }}>
                          {slot.dept}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                        Attending: <strong>{slot.doctor}</strong> • {slot.type}
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div>
                      <Badge variant={slot.statusVariant}>{slot.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* UPCOMING APPOINTMENTS FOR THE WEEK */}
            <div
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 8,
                padding: '1.25rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-subtle)' }}>
                <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Upcoming Appointments (Next 48 Hours)
                </h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Confirmed bookings</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.75rem' }}>
                <div style={{ padding: '0.85rem', borderRadius: 6, border: '1px solid var(--border-subtle)', background: 'var(--bg-surface-secondary)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.86rem' }}>Tomorrow, 10:00 AM</span>
                    <Badge variant="green">Confirmed</Badge>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-primary)', fontWeight: 600 }}>Meera Nambiar</div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>Dr. Rajesh Mehta • Cardiology Post-Angio</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>OPD Suite 4B</div>
                </div>

                <div style={{ padding: '0.85rem', borderRadius: 6, border: '1px solid var(--border-subtle)', background: 'var(--bg-surface-secondary)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.86rem' }}>Tomorrow, 11:30 AM</span>
                    <Badge variant="brand">Pre-Registered</Badge>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-primary)', fontWeight: 600 }}>Sunil Gavaskar</div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>Dr. Anita Deshmukh • Diabetes Follow-up</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>OPD Suite 2A</div>
                </div>

                <div style={{ padding: '0.85rem', borderRadius: 6, border: '1px solid var(--border-subtle)', background: 'var(--bg-surface-secondary)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.86rem' }}>Friday, 09:30 AM</span>
                    <Badge variant="green">Confirmed</Badge>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-primary)', fontWeight: 600 }}>Deepak Verma</div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>Dr. Vikram Patel • Orthopedic Evaluation</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Fracture Clinic 5</div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: PHYSICIAN AVAILABILITY & DEPARTMENT SCHEDULE */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* PHYSICIAN AVAILABILITY PANEL */}
            <div
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 8,
                padding: '1.25rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-subtle)' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Physician Availability
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Attending clinical duty status</span>
                </div>
                <span style={{ fontSize: '0.74rem', fontWeight: 600, color: 'var(--forest-brand)' }}>5 Attending</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {physicians.map((doc) => (
                  <div
                    key={doc.id}
                    style={{
                      padding: '0.75rem',
                      borderRadius: 6,
                      border: '1px solid var(--border-subtle)',
                      background: 'var(--bg-surface-secondary)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem' }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.86rem', color: 'var(--text-primary)' }}>
                          {doc.name}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                          {doc.dept} • {doc.room}
                        </div>
                      </div>
                      <Badge variant={doc.statusVariant}>{doc.status}</Badge>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem', marginTop: '0.4rem', paddingTop: '0.35rem', borderTop: '1px dashed var(--border-subtle)' }}>
                      <span style={{ color: 'var(--text-muted)' }}>
                        Next Opening: <strong>{doc.nextAvailable}</strong>
                      </span>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        {doc.bookedToday} Booked Today
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* DEPARTMENT SCHEDULE & CAPACITY */}
            <div
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 8,
                padding: '1.25rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-subtle)' }}>
                <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Department Schedule & Load
                </h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Outpatient Clinic</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {departments.map((dept) => (
                  <div
                    key={dept.name}
                    style={{
                      padding: '0.65rem 0.75rem',
                      borderRadius: 6,
                      background: 'var(--bg-surface-secondary)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--text-primary)' }}>
                        {dept.name}
                      </span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--teal-intelligent)' }}>
                        {dept.capacity}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      <span>{dept.totalToday} total today</span>
                      <span>{dept.completed} completed • {dept.waiting} waiting</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW MODE 2: GENUINELY USEFUL CALENDAR VIEW */}
      {viewMode === 'calendar' && (
        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 8,
            padding: '1.5rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                September 2026 • Clinical Calendar
              </h2>
              <Badge variant="brand">Coimbatore Medical Center</Badge>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <Button variant="secondary" size="sm">
                <ChevronLeft style={{ width: 14, height: 14 }} /> Previous
              </Button>
              <Button variant="secondary" size="sm">Today</Button>
              <Button variant="secondary" size="sm">
                Next <ChevronRight style={{ width: 14, height: 14 }} />
              </Button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem', textAlign: 'center' }}>
            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
              <div
                key={day}
                style={{
                  fontWeight: 700,
                  fontSize: '0.78rem',
                  padding: '0.6rem 0.25rem',
                  background: 'var(--bg-surface-secondary)',
                  color: 'var(--text-secondary)',
                  borderRadius: 4,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                {day}
              </div>
            ))}

            {Array.from({ length: 30 }).map((_, i) => {
              const dayNum = i + 1;
              const isToday = dayNum === 15;
              const activeApts = appointments.filter((a) => {
                if (!a.date || a.status === 'CANCELLED') return false;
                const d = parseInt(a.date.split('-')[2], 10);
                return d === dayNum;
              });
              const hasApt = activeApts.length > 0;

              return (
                <div
                  key={i}
                  style={{
                    minHeight: 105,
                    border: isToday ? '2px solid var(--teal-intelligent)' : '1px solid var(--border-subtle)',
                    borderRadius: 6,
                    padding: '0.5rem',
                    textAlign: 'left',
                    background: isToday
                      ? 'rgba(13, 148, 136, 0.05)'
                      : hasApt
                      ? 'rgba(5, 150, 105, 0.03)'
                      : 'var(--bg-surface)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span
                        style={{
                          fontWeight: isToday ? 800 : 600,
                          fontSize: '0.8rem',
                          color: isToday ? 'var(--teal-intelligent)' : 'var(--text-primary)',
                        }}
                      >
                        {dayNum}
                      </span>
                      {isToday && (
                        <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--teal-intelligent)', background: 'rgba(13, 148, 136, 0.15)', padding: '0.1rem 0.35rem', borderRadius: 3 }}>
                          TODAY
                        </span>
                      )}
                    </div>

                    {isToday && (
                      <div style={{ marginTop: '0.35rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <div style={{ fontSize: '0.68rem', background: 'var(--forest-subtle)', color: 'var(--forest-brand)', padding: '0.2rem 0.35rem', borderRadius: 3, fontWeight: 600 }}>
                          10:00 • Arun Kumar
                        </div>
                        <div style={{ fontSize: '0.68rem', background: 'rgba(13, 148, 136, 0.1)', color: 'var(--teal-intelligent)', padding: '0.2rem 0.35rem', borderRadius: 3, fontWeight: 600 }}>
                          10:30 • Sneha S.
                        </div>
                      </div>
                    )}

                    {hasApt && !isToday && (
                      <div style={{ marginTop: '0.35rem' }}>
                        <div style={{ fontSize: '0.68rem', color: 'var(--forest-brand)', fontWeight: 600, background: 'var(--forest-subtle)', padding: '0.2rem 0.35rem', borderRadius: 3 }}>
                          ● {activeApts[0].appointment_id} ({activeApts[0].doctor_id})
                        </div>
                      </div>
                    )}
                  </div>

                  <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)', textAlign: 'right' }}>
                    {isToday ? '8 slots booked' : hasApt ? `${activeApts.length} booking` : 'Open slots'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW MODE 3: REGISTRY LIST / APPOINTMENT TABLE */}
      {viewMode === 'table' && (
        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 8,
            overflow: 'hidden',
          }}
        >
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Master Appointment Registry
            </h3>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Total: {filteredAppointments.length} records
            </span>
          </div>

          <table className="table-ui">
            <thead>
              <tr>
                <th>Appointment ID</th>
                <th>Patient</th>
                <th>Attending Physician</th>
                <th>Facility</th>
                <th>Date & Slot</th>
                <th>Clinical Reason</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredAppointments.map((apt) => (
                <tr key={apt.appointment_id}>
                  <td className="tabular-nums" style={{ fontWeight: 700, color: 'var(--teal-intelligent)' }}>
                    {apt.appointment_id}
                  </td>
                  <td>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{apt.patient_id}</span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 500 }}>{apt.doctor_id}</span>
                  </td>
                  <td style={{ fontSize: '0.78rem' }}>
                    {apt.hospital_id === 'HOSP-001' ? 'Coimbatore Medical Center' : apt.hospital_id}
                  </td>
                  <td className="tabular-nums" style={{ fontSize: '0.8rem' }}>
                    {apt.date} <strong>({apt.time_slot})</strong>
                  </td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{apt.reason}</td>
                  <td>
                    <Badge
                      variant={
                        apt.status === 'CANCELLED'
                          ? 'red'
                          : apt.status === 'RESCHEDULED'
                          ? 'amber'
                          : 'green'
                      }
                    >
                      {apt.status}
                    </Badge>
                  </td>
                  <td>
                    {apt.status !== 'CANCELLED' && (
                      <button
                        onClick={() => handleCancelApt(apt.appointment_id)}
                        className="btn-ui btn-ghost-ui"
                        style={{
                          fontSize: '0.74rem',
                          padding: '0.2rem 0.5rem',
                          color: 'var(--danger-red)',
                        }}
                      >
                        Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Book Clinical Appointment Modal */}
      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
        >
          <div
            style={{
              background: 'var(--bg-surface)',
              borderRadius: 8,
              border: '1px solid var(--border-subtle)',
              width: '100%',
              maxWidth: 560,
              maxHeight: '92vh',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '1.25rem 1.5rem',
                borderBottom: '1px solid var(--border-subtle)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexShrink: 0,
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Schedule Clinical Appointment
                </h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Allocate outpatient consult slot at Coimbatore Medical Center
                </span>
              </div>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => {
                  if (!isSubmitting) setIsModalOpen(false);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  color: 'var(--text-muted)',
                  padding: '0.25rem',
                }}
              >
                <X style={{ width: 18, height: 18 }} />
              </button>
            </div>

            {/* Modal Form Body */}
            <form
              onSubmit={handleBookSubmit}
              style={{
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.1rem',
                overflowY: 'auto',
              }}
            >
              {/* Step 3: Select Patient */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  1. Select Patient
                </label>
                <select
                  value={newPatientId}
                  onChange={(e) => setNewPatientId(e.target.value)}
                  disabled={isSubmitting}
                  className="input-ui"
                >
                  {registeredPatients.map((p) => (
                    <option key={p.patient_id} value={p.patient_id}>
                      {p.first_name} {p.last_name} ({p.patient_id})
                    </option>
                  ))}
                </select>
              </div>

              {/* Steps 4 & 5: Select Specialty and Attending Doctor */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                    2. Select Specialty
                  </label>
                  <select
                    value={newDept}
                    onChange={(e) => handleDeptChange(e.target.value)}
                    disabled={isSubmitting}
                    className="input-ui"
                  >
                    {['Cardiology', 'Endocrinology', 'General Medicine', 'Neurology', 'Orthopedics'].map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                    3. Select Doctor
                  </label>
                  <select
                    value={newDoctorId}
                    onChange={(e) => handleDoctorChange(e.target.value)}
                    disabled={isSubmitting}
                    className="input-ui"
                  >
                    {physicians
                      .filter((p) => p.dept === newDept)
                      .map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.room})
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              {/* Step 6: Select Date */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  4. Select Consultation Date
                </label>
                <input
                  type="date"
                  value={newDate}
                  min={todayStr}
                  onChange={(e) => {
                    setNewDate(e.target.value);
                    setNewTimeSlot('');
                  }}
                  disabled={isSubmitting}
                  required
                  className="input-ui"
                />
              </div>

              {/* Steps 7 & 8: Show available 30-minute slots & Select ONE slot */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem' }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    5. Available 30-Minute Slots ({newDate})
                  </label>
                  <span style={{ fontSize: '0.72rem', color: newTimeSlot ? 'var(--teal-intelligent)' : 'var(--text-muted)' }}>
                    {newTimeSlot ? `Selected: ${newTimeSlot}` : 'Select ONE slot'}
                  </span>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(105px, 1fr))',
                    gap: '0.45rem',
                  }}
                >
                  {availableSlotsList.map((slot) => {
                    const isBooked = bookedSlotsSet.has(slot);
                    const isSelected = newTimeSlot === slot;

                    return (
                      <button
                        key={slot}
                        type="button"
                        disabled={isBooked || isSubmitting}
                        onClick={() => setNewTimeSlot(slot)}
                        style={{
                          padding: '0.45rem 0.25rem',
                          fontSize: '0.74rem',
                          borderRadius: 4,
                          fontWeight: isSelected ? 700 : 500,
                          textAlign: 'center',
                          transition: 'all 0.15s ease',
                          cursor: isBooked ? 'not-allowed' : 'pointer',
                          background: isSelected
                            ? 'rgba(13, 148, 136, 0.12)'
                            : isBooked
                            ? 'var(--bg-surface-secondary)'
                            : 'var(--bg-surface)',
                          color: isSelected
                            ? 'var(--teal-intelligent)'
                            : isBooked
                            ? 'var(--text-muted)'
                            : 'var(--text-primary)',
                          border: isSelected
                            ? '2px solid var(--teal-intelligent)'
                            : isBooked
                            ? '1px solid var(--border-subtle)'
                            : '1px solid var(--border-strong)',
                          opacity: isBooked ? 0.45 : 1,
                        }}
                      >
                        <div>{slot}</div>
                        <div style={{ fontSize: '0.64rem', marginTop: '0.1rem', color: isBooked ? 'var(--danger-red)' : 'inherit' }}>
                          {isBooked ? 'Booked' : isSelected ? '✓ Chosen' : 'Available'}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Clinical Indication / Reason */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  6. Clinical Indication / Reason for Visit
                </label>
                <input
                  type="text"
                  value={newReason}
                  onChange={(e) => setNewReason(e.target.value)}
                  disabled={isSubmitting}
                  required
                  className="input-ui"
                  placeholder="e.g. Hypertension Follow-Up & ECG Evaluation"
                />
              </div>

              {/* Step 9: Show ONE Confirmation Section */}
              <div
                style={{
                  background: 'var(--bg-surface-secondary)',
                  border: '1px solid var(--border-subtle)',
                  borderLeft: '3px solid var(--teal-intelligent)',
                  borderRadius: 6,
                  padding: '0.85rem 1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.4rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--teal-intelligent)', textTransform: 'uppercase' }}>
                    Booking Confirmation Summary
                  </span>
                  <Badge variant="brand">Coimbatore Medical Center (HOSP-001)</Badge>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem', fontSize: '0.78rem' }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>PATIENT: </span>
                    <strong style={{ color: 'var(--text-primary)' }}>
                      {currentPatient.first_name} {currentPatient.last_name}
                    </strong>{' '}
                    ({newPatientId})
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>SPECIALTY: </span>
                    <strong style={{ color: 'var(--text-primary)' }}>{newDept}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>PHYSICIAN: </span>
                    <strong style={{ color: 'var(--text-primary)' }}>{currentDoctor.name}</strong> ({currentDoctor.room})
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>SLOT: </span>
                    {newTimeSlot ? (
                      <strong style={{ color: 'var(--teal-intelligent)' }}>
                        {newDate} • {newTimeSlot}
                      </strong>
                    ) : (
                      <span style={{ color: 'var(--danger-red)', fontWeight: 600 }}>Please select a slot</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Step 10: Confirm Booking Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.25rem' }}>
                <Button
                  variant="secondary"
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => {
                    if (!isSubmitting) setIsModalOpen(false);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  type="submit"
                  loading={isSubmitting}
                  disabled={isSubmitting || !newTimeSlot}
                >
                  Confirm Booking
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
