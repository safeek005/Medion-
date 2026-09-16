import React, { useState } from 'react';
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
import { useSharedAppointments, dataService } from '../../services/dataService';

export const AppointmentsView: React.FC = () => {
  const appointments = useSharedAppointments();
  const [viewMode, setViewMode] = useState<'schedule' | 'calendar' | 'table'>('schedule');
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const [selectedPhysician, setSelectedPhysician] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [timeScope, setTimeScope] = useState<'today' | 'week' | 'month'>('today');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  // New Appointment Form State
  const [newPatientId, setNewPatientId] = useState('PAT-1001');
  const [newDoctorId, setNewDoctorId] = useState('DOC-101');
  const [newDate, setNewDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [newTimeSlot, setNewTimeSlot] = useState('11:00-11:30');
  const [newReason, setNewReason] = useState('Routine Cardiology Consultation');
  const [newDept, setNewDept] = useState('Cardiology');

  const handleBookSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newApt = dataService.bookAppointment({
      patient_id: newPatientId,
      doctor_id: newDoctorId,
      hospital_id: 'HOSP-001',
      date: newDate,
      time_slot: newTimeSlot,
      status: 'SCHEDULED',
      reason: newReason,
    });

    setIsModalOpen(false);
    setNotificationMsg(`Appointment ${newApt.appointment_id} scheduled successfully for ${newDate} at ${newTimeSlot}!`);
    setTimeout(() => setNotificationMsg(null), 4500);
  };

  const handleCancelApt = (id: string) => {
    dataService.cancelAppointment(id);
    setNotificationMsg(`Appointment ${id} has been cancelled.`);
    setTimeout(() => setNotificationMsg(null), 4500);
  };

  // Physician availability directory
  const physicians = [
    { id: 'DOC-101', name: 'Dr. Rajesh Mehta', dept: 'Cardiology', room: 'OPD Suite 4B', status: 'In Consult', statusVariant: 'brand' as const, nextAvailable: '11:30 AM', bookedToday: 8 },
    { id: 'DOC-102', name: 'Dr. Anita Deshmukh', dept: 'Endocrinology', room: 'OPD Suite 2A', status: 'Available', statusVariant: 'green' as const, nextAvailable: 'Now (Walk-in)', bookedToday: 5 },
    { id: 'DOC-103', name: 'Dr. Suresh Rao', dept: 'General Medicine', room: 'OPD Suite 1C', status: 'In Consult', statusVariant: 'brand' as const, nextAvailable: '12:00 PM', bookedToday: 11 },
    { id: 'DOC-104', name: 'Dr. Priya Sundaram', dept: 'Neurology', room: 'Neuro Clinic 3', status: 'Ward Rounds', statusVariant: 'amber' as const, nextAvailable: '02:00 PM', bookedToday: 6 },
    { id: 'DOC-105', name: 'Dr. Vikram Patel', dept: 'Orthopedics', room: 'Fracture Clinic 5', status: 'Available', statusVariant: 'green' as const, nextAvailable: '11:45 AM', bookedToday: 7 },
  ];

  // Department load breakdown
  const departments = [
    { name: 'Cardiology', totalToday: 14, completed: 6, waiting: 2, capacity: '85%' },
    { name: 'General Medicine', totalToday: 18, completed: 8, waiting: 4, capacity: '92%' },
    { name: 'Endocrinology', totalToday: 9, completed: 4, waiting: 1, capacity: '60%' },
    { name: 'Neurology', totalToday: 8, completed: 3, waiting: 1, capacity: '70%' },
    { name: 'Orthopedics', totalToday: 11, completed: 5, waiting: 2, capacity: '78%' },
  ];

  // Simulated chronological timeline for today
  const todayTimelineSlots = [
    {
      time: '09:00 AM',
      doctor: 'Dr. Rajesh Mehta',
      dept: 'Cardiology',
      room: 'Suite 4B',
      patient: 'Arun Kumar',
      patientId: 'PAT-1001',
      type: 'Follow-up & Lipid Review',
      status: 'Completed',
      statusVariant: 'green' as const,
    },
    {
      time: '09:30 AM',
      doctor: 'Dr. Suresh Rao',
      dept: 'General Medicine',
      room: 'Suite 1C',
      patient: 'Priya Sharma',
      patientId: 'PAT-1004',
      type: 'Comprehensive Physical',
      status: 'Completed',
      statusVariant: 'green' as const,
    },
    {
      time: '10:00 AM',
      doctor: 'Dr. Anita Deshmukh',
      dept: 'Endocrinology',
      room: 'Suite 2A',
      patient: 'Vikram Singh',
      patientId: 'PAT-1003',
      type: 'HbA1c & Insulin Titration',
      status: 'In Consult',
      statusVariant: 'brand' as const,
    },
    {
      time: '10:30 AM',
      doctor: 'Dr. Rajesh Mehta',
      dept: 'Cardiology',
      room: 'Suite 4B',
      patient: 'Sneha Sharma',
      patientId: 'PAT-1002',
      type: 'Echocardiogram Review',
      status: 'In Consult',
      statusVariant: 'brand' as const,
    },
    {
      time: '11:00 AM',
      doctor: 'Dr. Suresh Rao',
      dept: 'General Medicine',
      room: 'Suite 1C',
      patient: 'Kavita Iyer',
      patientId: 'PAT-1005',
      type: 'Post-Viral Fatigue Check',
      status: 'Waiting',
      statusVariant: 'amber' as const,
    },
    {
      time: '11:30 AM',
      doctor: 'Dr. Rajesh Mehta',
      dept: 'Cardiology',
      room: 'Suite 4B',
      patient: 'Rajesh Iyer',
      patientId: 'PAT-1006',
      type: 'Hypertension Follow-Up',
      status: 'Checked In',
      statusVariant: 'brand' as const,
    },
    {
      time: '12:00 PM',
      doctor: 'Dr. Priya Sundaram',
      dept: 'Neurology',
      room: 'Neuro Clinic 3',
      patient: 'Ananya Roy',
      patientId: 'PAT-1007',
      type: 'Migraine Prophylaxis Consult',
      status: 'Scheduled',
      statusVariant: 'neutral' as const,
    },
    {
      time: '02:00 PM',
      doctor: 'Dr. Vikram Patel',
      dept: 'Orthopedics',
      room: 'Fracture Clinic 5',
      patient: 'Mohammed Farooq',
      patientId: 'PAT-1008',
      type: 'Post-Op Knee Arthroscopy',
      status: 'Scheduled',
      statusVariant: 'neutral' as const,
    },
  ];

  // Filter timeline items
  const filteredTimeline = todayTimelineSlots.filter((slot) => {
    if (selectedDept !== 'ALL' && slot.dept !== selectedDept) return false;
    if (selectedPhysician !== 'ALL' && slot.doctor !== selectedPhysician) return false;
    if (selectedStatus !== 'ALL' && slot.status.toUpperCase() !== selectedStatus.toUpperCase()) return false;
    return true;
  });

  // Filter table appointments
  const filteredAppointments = appointments.filter((apt) => {
    if (selectedStatus !== 'ALL' && apt.status !== selectedStatus) return false;
    return true;
  });

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

          <Button variant="primary" size="sm" onClick={() => setIsModalOpen(true)}>
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
                    Real-time outpatient queue • Thursday, September 15, 2026
                  </span>
                </div>
                <Badge variant="brand">Live Dispatch</Badge>
              </div>

              {/* Chronological Timeline Track */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {filteredTimeline.map((slot, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '85px minmax(0, 1fr) auto',
                      gap: '1rem',
                      alignItems: 'center',
                      padding: '0.85rem 1rem',
                      borderRadius: 6,
                      background: slot.status === 'In Consult' ? 'rgba(13, 148, 136, 0.06)' : 'var(--bg-surface-secondary)',
                      border: slot.status === 'In Consult' ? '1px solid rgba(13, 148, 136, 0.3)' : '1px solid var(--border-subtle)',
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
              maxWidth: 520,
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                padding: '1.25rem 1.5rem',
                borderBottom: '1px solid var(--border-subtle)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
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
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X style={{ width: 18, height: 18 }} />
              </button>
            </div>

            <form onSubmit={handleBookSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  Patient Master ID
                </label>
                <input
                  type="text"
                  value={newPatientId}
                  onChange={(e) => setNewPatientId(e.target.value)}
                  required
                  className="input-ui"
                  placeholder="e.g. PAT-1001 (Arun Kumar)"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                    Attending Physician
                  </label>
                  <select
                    value={newDoctorId}
                    onChange={(e) => setNewDoctorId(e.target.value)}
                    className="input-ui"
                  >
                    <option value="DOC-101">Dr. Rajesh Mehta (Cardiology)</option>
                    <option value="DOC-102">Dr. Anita Deshmukh (Endo)</option>
                    <option value="DOC-103">Dr. Suresh Rao (Gen Med)</option>
                    <option value="DOC-104">Dr. Priya Sundaram (Neuro)</option>
                    <option value="DOC-105">Dr. Vikram Patel (Ortho)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                    Department
                  </label>
                  <select
                    value={newDept}
                    onChange={(e) => setNewDept(e.target.value)}
                    className="input-ui"
                  >
                    <option value="Cardiology">Cardiology</option>
                    <option value="Endocrinology">Endocrinology</option>
                    <option value="General Medicine">General Medicine</option>
                    <option value="Neurology">Neurology</option>
                    <option value="Orthopedics">Orthopedics</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                    Consultation Date
                  </label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    required
                    className="input-ui"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                    Time Window
                  </label>
                  <select
                    value={newTimeSlot}
                    onChange={(e) => setNewTimeSlot(e.target.value)}
                    className="input-ui"
                  >
                    <option value="09:00-09:30">09:00 - 09:30 AM</option>
                    <option value="09:30-10:00">09:30 - 10:00 AM</option>
                    <option value="10:00-10:30">10:00 - 10:30 AM</option>
                    <option value="10:30-11:00">10:30 - 11:00 AM</option>
                    <option value="11:00-11:30">11:00 - 11:30 AM</option>
                    <option value="11:30-12:00">11:30 - 12:00 PM</option>
                    <option value="14:00-14:30">02:00 - 02:30 PM</option>
                    <option value="15:00-15:30">03:00 - 03:30 PM</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                  Clinical Indication / Reason for Visit
                </label>
                <input
                  type="text"
                  value={newReason}
                  onChange={(e) => setNewReason(e.target.value)}
                  required
                  className="input-ui"
                  placeholder="e.g. Hypertension Follow-Up & ECG Evaluation"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <Button variant="secondary" type="button" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
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
