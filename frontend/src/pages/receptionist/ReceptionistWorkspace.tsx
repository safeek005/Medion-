import React, { useState } from 'react';
import {
  UserPlus,
  Calendar,
  Search,
  CheckCircle2,
  Clock,
  User,
  Phone,
  Mail,
  AlertCircle,
  Building2,
  Filter,
  ArrowRight,
  Sparkles,
  RefreshCw,
  XCircle,
  CalendarCheck,
  Stethoscope,
} from 'lucide-react';
import { PageHeader, SectionHeader } from '../../components/common/SharedComponents';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { DataTable } from '../../components/ui/DataTable';
import {
  useSharedPatients,
  useSharedAppointments,
  useSharedDoctors,
  dataService,
} from '../../services/dataService';
import { ExecutionTraceStep, PatientProfile, AppointmentItem } from '../../types';

interface ReceptionistWorkspaceProps {
  onTraceGenerated?: (step: ExecutionTraceStep) => void;
  defaultTab?: 'queue' | 'intake' | 'schedules';
}

export const ReceptionistWorkspace: React.FC<ReceptionistWorkspaceProps> = ({
  onTraceGenerated,
  defaultTab = 'queue',
}) => {
  const [activeTab, setActiveTab] = useState<'queue' | 'intake' | 'schedules'>(defaultTab);

  // Shared Reactive Stores
  const patients = useSharedPatients();
  const appointments = useSharedAppointments();
  const doctors = useSharedDoctors();

  // Intake Wizard State
  const [intakeStep, setIntakeStep] = useState<1 | 2 | 3 | 4>(1);
  const [duplicateSearch, setDuplicateSearch] = useState('');
  const [duplicateMatches, setDuplicateMatches] = useState<PatientProfile[]>([]);
  const [hasSearchedDuplicates, setHasSearchedDuplicates] = useState(false);

  // New Patient Form
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dob: '',
    gender: 'Male',
    bloodGroup: '',
    phone: '',
    email: '',
    address: '',
    doctorId: 'DOC-101',
    appointmentDate: new Date().toISOString().split('T')[0],
    timeSlot: '10:00-10:30',
    visitReason: 'General Outpatient Consultation',
  });

  const [registeredPatient, setRegisteredPatient] = useState<PatientProfile | null>(null);
  const [registeredAppointment, setRegisteredAppointment] = useState<AppointmentItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Duplicate Check logic
  const handleCheckDuplicates = () => {
    if (!duplicateSearch.trim()) {
      setDuplicateMatches([]);
      setHasSearchedDuplicates(true);
      return;
    }
    const q = duplicateSearch.toLowerCase().trim();
    const results = patients.filter(
      (p) =>
        p.patient_id.toLowerCase().includes(q) ||
        `${p.first_name} ${p.last_name}`.toLowerCase().includes(q) ||
        (p.phone && p.phone.includes(q)) ||
        (p.email && p.email.toLowerCase().includes(q))
    );
    setDuplicateMatches(results);
    setHasSearchedDuplicates(true);
  };

  // Complete Live Registration (Supabase + Local Reactive Storage)
  const handleCompleteRegistration = async () => {
    setIsSubmitting(true);
    try {
      // 1. Create Patient in Supabase / Local storage
      const newPatient = dataService.createPatient({
        first_name: formData.firstName.trim(),
        last_name: formData.lastName.trim(),
        dob: formData.dob,
        gender: formData.gender,
        blood_group: formData.bloodGroup.trim() ? (formData.bloodGroup.trim() as any) : null,
        phone: formData.phone.trim(),
        email: formData.email.trim() ? formData.email.trim() : null,
        address: formData.address.trim() ? formData.address.trim() : null,
        primary_doctor_id: formData.doctorId,
      });

      // 2. Book Initial Appointment
      const newApt = dataService.bookAppointment({
        patient_id: newPatient.patient_id,
        doctor_id: formData.doctorId,
        hospital_id: 'HOSP-001',
        date: formData.appointmentDate,
        time_slot: formData.timeSlot,
        reason: formData.visitReason,
        status: 'SCHEDULED',
      });

      setRegisteredPatient(newPatient);
      setRegisteredAppointment(newApt);
      setIntakeStep(4);

      if (onTraceGenerated) {
        onTraceGenerated({
          id: `TR-${Date.now().toString().slice(-4)}`,
          timestamp: new Date().toLocaleTimeString(),
          workflowId: `WF-RECP-${Date.now().toString().slice(-4)}`,
          portalSource: 'hospital',
          agentTarget: 'patient_registration',
          action: 'register_patient',
          durationMs: 320,
          success: true,
          request: { ...formData } as any,
          response: {
            success: true,
            patient_id: newPatient.patient_id,
            appointment_id: newApt.appointment_id,
          } as any,
        });
      }
    } catch (err: any) {
      console.error('Registration failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetIntake = () => {
    setIntakeStep(1);
    setDuplicateSearch('');
    setDuplicateMatches([]);
    setHasSearchedDuplicates(false);
    setFormData({
      firstName: '',
      lastName: '',
      dob: '',
      gender: 'Male',
      bloodGroup: '',
      phone: '',
      email: '',
      address: '',
      doctorId: 'DOC-101',
      appointmentDate: new Date().toISOString().split('T')[0],
      timeSlot: '10:00-10:30',
      visitReason: 'General Outpatient Consultation',
    });
    setRegisteredPatient(null);
    setRegisteredAppointment(null);
  };

  // Appointment Status Updates (Check-in, Reschedule, Cancel)
  const handleUpdateAptStatus = (aptId: string, status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED') => {
    dataService.updateAppointmentStatus(aptId, status);
    setActionNotice(`Appointment ${aptId} status changed to ${status}.`);
    setTimeout(() => setActionNotice(null), 4000);
  };

  // Prepare table data for Queue
  const queueColumns = [
    {
      key: 'appointment_id',
      header: 'Appointment ID',
      sortable: true,
      render: (apt: AppointmentItem) => (
        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{apt.appointment_id}</span>
      ),
    },
    {
      key: 'patient_id',
      header: 'Patient Details',
      sortable: true,
      render: (apt: AppointmentItem) => {
        const p = patients.find((pat) => pat.patient_id === apt.patient_id);
        return (
          <div>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
              {p ? `${p.first_name} ${p.last_name}` : apt.patient_id}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              MRN: {apt.patient_id} {p?.phone && `• ${p.phone}`}
            </div>
          </div>
        );
      },
    },
    {
      key: 'doctor_id',
      header: 'Physician / Specialty',
      sortable: true,
      render: (apt: AppointmentItem) => {
        const d = doctors.find((doc) => doc.doctor_id === apt.doctor_id);
        return (
          <div>
            <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
              {d ? `Dr. ${d.first_name} ${d.last_name}` : apt.doctor_id}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              {d?.specialty || 'Consultant'}
            </div>
          </div>
        );
      },
    },
    {
      key: 'time_slot',
      header: 'Schedule & Slot',
      sortable: true,
      render: (apt: AppointmentItem) => (
        <div>
          <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{apt.date}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{apt.time_slot}</div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (apt: AppointmentItem) => {
        const variant =
          apt.status === 'COMPLETED'
            ? 'green'
            : apt.status === 'CANCELLED'
            ? 'red'
            : apt.status === 'RESCHEDULED'
            ? 'amber'
            : 'brand';
        return <Badge variant={variant as any}>{apt.status}</Badge>;
      },
    },
    {
      key: 'actions',
      header: 'Reception Actions',
      render: (apt: AppointmentItem) => (
        <div style={{ display: 'flex', gap: '0.35rem' }}>
          {apt.status !== 'COMPLETED' && apt.status !== 'CANCELLED' && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => handleUpdateAptStatus(apt.appointment_id, 'COMPLETED')}
              style={{ fontSize: '0.7rem', padding: '0.25rem 0.5rem' }}
            >
              <CheckCircle2 style={{ width: 12, height: 12 }} /> Check In
            </Button>
          )}
          {apt.status !== 'CANCELLED' && apt.status !== 'COMPLETED' && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleUpdateAptStatus(apt.appointment_id, 'CANCELLED')}
              style={{ fontSize: '0.7rem', padding: '0.25rem 0.5rem', color: 'var(--status-danger)' }}
            >
              <XCircle style={{ width: 12, height: 12 }} /> Cancel
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div style={{ padding: '2rem', maxWidth: 1280, margin: '0 auto' }}>
      <PageHeader
        title="Reception & Patient Intake"
        subtitle="MEDION Hospital Network (HOSP-001) • Patient registration, doctor triage, and schedule management"
        badge={<Badge variant="green">Reception Desk 01 • Online</Badge>}
        actions={
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button
              variant={activeTab === 'intake' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => {
                setActiveTab('intake');
                setIntakeStep(1);
              }}
            >
              <UserPlus style={{ width: 14, height: 14 }} /> New Patient Intake
            </Button>
            <Button
              variant={activeTab === 'queue' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setActiveTab('queue')}
            >
              <CalendarCheck style={{ width: 14, height: 14 }} /> Daily Queue ({appointments.length})
            </Button>
            <Button
              variant={activeTab === 'schedules' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setActiveTab('schedules')}
            >
              <Stethoscope style={{ width: 14, height: 14 }} /> Doctor Schedules
            </Button>
          </div>
        }
      />

      {/* Operational Notice Banner */}
      {actionNotice && (
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-accent)',
            padding: '0.75rem 1.25rem',
            borderRadius: 8,
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            color: 'var(--color-primary-light)',
            fontSize: '0.82rem',
          }}
        >
          <CheckCircle2 style={{ width: 16, height: 16 }} />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* TAB 1: DAILY QUEUE */}
      {activeTab === 'queue' && (
        <div>
          <div className="section-panel" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                  Today's Patient Arrival Queue
                </h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '0.2rem 0 0' }}>
                  Live intake queue synchronized with physician consultation rooms
                </p>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <Badge variant="brand">{appointments.length} Total Bookings</Badge>
                <Badge variant="green">
                  {appointments.filter((a) => a.status === 'COMPLETED').length} Checked In
                </Badge>
              </div>
            </div>

            <DataTable
              columns={queueColumns}
              data={appointments}
              searchPlaceholder="Filter appointments by patient, MRN, physician or date..."
              pageSize={8}
            />
          </div>
        </div>
      )}

      {/* TAB 2: MULTI-STEP PATIENT INTAKE WIZARD */}
      {activeTab === 'intake' && (
        <div>
          {/* Progress Indicator */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 12,
              padding: '1rem 1.75rem',
              marginBottom: '1.5rem',
            }}
          >
            {[
              { step: 1, label: 'Duplicate Verification' },
              { step: 2, label: 'Demographics & Contact' },
              { step: 3, label: 'Doctor & Schedule' },
              { step: 4, label: 'Confirmation & Card' },
            ].map((s, idx) => {
              const isCompleted = intakeStep > s.step;
              const isCurrent = intakeStep === s.step;
              return (
                <div key={s.step} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      background: isCompleted
                        ? 'var(--color-primary)'
                        : isCurrent
                        ? 'var(--color-primary-light)'
                        : 'var(--bg-elevated)',
                      color: isCurrent || isCompleted ? '#071914' : 'var(--text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                    }}
                  >
                    {isCompleted ? <CheckCircle2 style={{ width: 14, height: 14 }} /> : s.step}
                  </div>
                  <span
                    style={{
                      fontSize: '0.82rem',
                      fontWeight: isCurrent ? 600 : 400,
                      color: isCurrent ? 'var(--text-primary)' : 'var(--text-muted)',
                    }}
                  >
                    {s.label}
                  </span>
                  {idx < 3 && (
                    <div
                      style={{
                        width: 40,
                        height: 1,
                        background: isCompleted ? 'var(--border-accent)' : 'var(--border-subtle)',
                        marginLeft: '1rem',
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* STEP 1: DUPLICATE VERIFICATION */}
          {intakeStep === 1 && (
            <div className="section-panel" style={{ maxWidth: 750, margin: '0 auto' }}>
              <SectionHeader
                title="Step 1 — Duplicate Identity Check"
                subtitle="Verify patient isn't already registered in the MEDION master patient index"
              />
              <div style={{ marginBottom: '1.25rem' }}>
                <label className="label-ui">Search Phone Number, Email, or Full Name</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <Search
                      style={{
                        position: 'absolute',
                        left: 12,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: 15,
                        height: 15,
                        color: 'var(--text-muted)',
                      }}
                    />
                    <input
                      type="text"
                      className="input-ui"
                      style={{ paddingLeft: '2.4rem' }}
                      placeholder="e.g. 9876543210, priya@gmail.com, or Rajesh..."
                      value={duplicateSearch}
                      onChange={(e) => setDuplicateSearch(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleCheckDuplicates()}
                    />
                  </div>
                  <Button variant="primary" onClick={handleCheckDuplicates}>
                    Search Master Index
                  </Button>
                </div>
              </div>

              {hasSearchedDuplicates && (
                <div style={{ marginTop: '1.5rem' }}>
                  {duplicateMatches.length > 0 ? (
                    <div>
                      <div
                        style={{
                          fontSize: '0.78rem',
                          color: 'var(--status-warning)',
                          fontWeight: 600,
                          marginBottom: '0.75rem',
                        }}
                      >
                        ⚠️ Found {duplicateMatches.length} existing record(s) matching your query:
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {duplicateMatches.map((m) => (
                          <div
                            key={m.patient_id}
                            style={{
                              background: 'var(--bg-elevated)',
                              border: '1px solid var(--border-subtle)',
                              borderRadius: 8,
                              padding: '0.75rem 1rem',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                            }}
                          >
                            <div>
                              <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                                {m.first_name} {m.last_name} ({m.patient_id})
                              </div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                DOB: {m.date_of_birth || 'N/A'} • Phone: {m.phone || 'N/A'}
                              </div>
                            </div>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => {
                                // Pre-fill with existing patient to schedule
                                setFormData((prev) => ({
                                  ...prev,
                                  firstName: m.first_name,
                                  lastName: m.last_name,
                                  dob: m.date_of_birth || '',
                                  gender: m.gender || 'Male',
                                  bloodGroup: m.blood_group || '',
                                  phone: m.phone || '',
                                  email: m.email || '',
                                  address: m.address || '',
                                }));
                                setIntakeStep(3);
                              }}
                            >
                              Select & Book Appointment
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div
                      style={{
                        padding: '1rem',
                        background: 'rgba(110, 231, 183, 0.05)',
                        border: '1px solid var(--border-accent)',
                        borderRadius: 8,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--color-primary-light)', fontSize: '0.85rem' }}>
                          ✓ No duplicate records found
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          This appears to be a new patient. Proceed to demographic details.
                        </div>
                      </div>
                      <Button variant="primary" size="sm" onClick={() => setIntakeStep(2)}>
                        Proceed to Intake Form <ArrowRight style={{ width: 14, height: 14 }} />
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* STEP 2: DEMOGRAPHICS */}
          {intakeStep === 2 && (
            <div className="section-panel" style={{ maxWidth: 750, margin: '0 auto' }}>
              <SectionHeader
                title="Step 2 — Patient Demographics"
                subtitle="Capture authentic medical identity records"
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="label-ui">First Name *</label>
                  <input
                    type="text"
                    className="input-ui"
                    placeholder="e.g. Harini"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label-ui">Last Name *</label>
                  <input
                    type="text"
                    className="input-ui"
                    placeholder="e.g. S"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label-ui">Date of Birth</label>
                  <input
                    type="date"
                    className="input-ui"
                    value={formData.dob}
                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label-ui">Gender</label>
                  <select
                    className="select-field"
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="label-ui">Contact Phone *</label>
                  <input
                    type="tel"
                    className="input-ui"
                    placeholder="+91 9876543210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label-ui">Email Address (Optional)</label>
                  <input
                    type="email"
                    className="input-ui"
                    placeholder="harini@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label-ui">Blood Group (Optional)</label>
                  <select
                    className="select-field"
                    value={formData.bloodGroup}
                    onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                  >
                    <option value="">Leave empty (Don't hallucinate)</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>
                <div>
                  <label className="label-ui">Residential Address</label>
                  <input
                    type="text"
                    className="input-ui"
                    placeholder="e.g. 14 Lotus Garden, Chennai"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem' }}>
                <Button variant="secondary" onClick={() => setIntakeStep(1)}>
                  Back
                </Button>
                <Button
                  variant="primary"
                  disabled={!formData.firstName.trim() || !formData.phone.trim()}
                  onClick={() => setIntakeStep(3)}
                >
                  Continue to Doctor & Schedule <ArrowRight style={{ width: 14, height: 14 }} />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3: DOCTOR & SCHEDULE */}
          {intakeStep === 3 && (
            <div className="section-panel" style={{ maxWidth: 750, margin: '0 auto' }}>
              <SectionHeader
                title="Step 3 — Provider & Appointment Scheduling"
                subtitle="Select attending physician and consultation time slot"
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ gridColumn: 'span 2' }}>
                  <label className="label-ui">Attending Physician *</label>
                  <select
                    className="select-field"
                    value={formData.doctorId}
                    onChange={(e) => setFormData({ ...formData, doctorId: e.target.value })}
                  >
                    {doctors.map((d) => (
                      <option key={d.doctor_id} value={d.doctor_id}>
                        Dr. {d.first_name} {d.last_name} — {d.specialty} ({d.hospital_id})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label-ui">Appointment Date</label>
                  <input
                    type="date"
                    className="input-ui"
                    value={formData.appointmentDate}
                    onChange={(e) => setFormData({ ...formData, appointmentDate: e.target.value })}
                  />
                </div>

                <div>
                  <label className="label-ui">Time Slot</label>
                  <select
                    className="select-field"
                    value={formData.timeSlot}
                    onChange={(e) => setFormData({ ...formData, timeSlot: e.target.value })}
                  >
                    <option value="09:00-09:30">09:00 - 09:30 AM</option>
                    <option value="09:30-10:00">09:30 - 10:00 AM</option>
                    <option value="10:00-10:30">10:00 - 10:30 AM</option>
                    <option value="10:30-11:00">10:30 - 11:00 AM</option>
                    <option value="11:00-11:30">11:00 - 11:30 AM</option>
                    <option value="14:00-14:30">02:00 - 02:30 PM</option>
                    <option value="14:30-15:00">02:30 - 03:00 PM</option>
                    <option value="15:00-15:30">03:00 - 03:30 PM</option>
                  </select>
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                  <label className="label-ui">Reason for Consultation</label>
                  <input
                    type="text"
                    className="input-ui"
                    placeholder="e.g. Chest discomfort, regular checkup, lab follow-up..."
                    value={formData.visitReason}
                    onChange={(e) => setFormData({ ...formData, visitReason: e.target.value })}
                  />
                </div>
              </div>

              {/* Summary Preview */}
              <div
                style={{
                  marginTop: '1.5rem',
                  padding: '1rem',
                  background: 'var(--bg-elevated)',
                  borderRadius: 8,
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Intake Summary Preview
                </div>
                <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                  Registering <strong>{formData.firstName} {formData.lastName}</strong> with Dr.{' '}
                  {doctors.find((d) => d.doctor_id === formData.doctorId)?.last_name || formData.doctorId} on{' '}
                  <strong>{formData.appointmentDate}</strong> ({formData.timeSlot}).
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem' }}>
                <Button variant="secondary" onClick={() => setIntakeStep(2)}>
                  Back
                </Button>
                <Button
                  variant="primary"
                  loading={isSubmitting}
                  onClick={handleCompleteRegistration}
                >
                  <CheckCircle2 style={{ width: 14, height: 14 }} /> Complete Live Registration
                </Button>
              </div>
            </div>
          )}

          {/* STEP 4: CONFIRMATION & CARD */}
          {intakeStep === 4 && registeredPatient && (
            <div className="section-panel" style={{ maxWidth: 650, margin: '0 auto', textAlign: 'center' }}>
              <div
                style={{
                  width: 54,
                  height: 54,
                  borderRadius: '50%',
                  background: 'rgba(110, 231, 183, 0.1)',
                  border: '1px solid var(--border-accent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem',
                  color: 'var(--color-primary-light)',
                }}
              >
                <CheckCircle2 style={{ width: 28, height: 28 }} />
              </div>

              <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                Patient Successfully Registered
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.35rem 0 1.5rem' }}>
                Synchronized with hospital master records and Supabase PostgreSQL.
              </p>

              {/* Digital MRN Badge Card */}
              <div
                style={{
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-accent)',
                  borderRadius: 12,
                  padding: '1.5rem',
                  textAlign: 'left',
                  marginBottom: '1.5rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                      MEDION Medical Record Number (MRN)
                    </div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-primary-light)', letterSpacing: '0.5px' }}>
                      {registeredPatient.patient_id}
                    </div>
                  </div>
                  <Badge variant="green">Registered & Active</Badge>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '1rem',
                    marginTop: '1rem',
                    paddingTop: '1rem',
                    borderTop: '1px solid var(--border-subtle)',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Patient Name</div>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      {registeredPatient.first_name} {registeredPatient.last_name}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Phone</div>
                    <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                      {registeredPatient.phone || 'N/A'}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Blood Group</div>
                    <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                      {registeredPatient.blood_group || 'Not Recorded'}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Appointment ID</div>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      {registeredAppointment?.appointment_id} ({registeredAppointment?.time_slot})
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                <Button variant="primary" onClick={handleResetIntake}>
                  <UserPlus style={{ width: 14, height: 14 }} /> Register Another Patient
                </Button>
                <Button variant="secondary" onClick={() => setActiveTab('queue')}>
                  View Daily Queue
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: DOCTOR MASTER SCHEDULES */}
      {activeTab === 'schedules' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.25rem' }}>
          {doctors.map((d) => {
            const docAppointments = appointments.filter((a) => a.doctor_id === d.doctor_id);
            return (
              <div key={d.doctor_id} className="section-panel" style={{ margin: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                      Dr. {d.first_name} {d.last_name}
                    </h3>
                    <div style={{ fontSize: '0.78rem', color: 'var(--color-primary-light)', fontWeight: 500 }}>
                      {d.specialty} • {d.hospital_id}
                    </div>
                  </div>
                  <Badge variant="green">Active</Badge>
                </div>

                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                  Available: {d.available_days.join(', ')}
                </div>

                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                  Consultation Time Slots & Status
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1rem' }}>
                  {d.available_slots.map((slot) => {
                    const isBooked = docAppointments.some((a) => a.time_slot === slot && a.status !== 'CANCELLED');
                    return (
                      <span
                        key={slot}
                        style={{
                          fontSize: '0.72rem',
                          padding: '0.25rem 0.6rem',
                          borderRadius: 6,
                          background: isBooked ? 'rgba(239, 68, 68, 0.1)' : 'rgba(110, 231, 183, 0.08)',
                          color: isBooked ? 'var(--status-danger)' : 'var(--color-primary-light)',
                          border: `1px solid ${isBooked ? 'rgba(239, 68, 68, 0.2)' : 'var(--border-accent)'}`,
                          fontWeight: 500,
                        }}
                      >
                        {slot} {isBooked ? '• Booked' : '• Open'}
                      </span>
                    );
                  })}
                </div>

                <div style={{ paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Bookings Today: <strong>{docAppointments.length}</strong>
                  </span>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      setFormData((prev) => ({ ...prev, doctorId: d.doctor_id }));
                      setActiveTab('intake');
                      setIntakeStep(2);
                    }}
                  >
                    Book Slot
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
