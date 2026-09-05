import React, { useState } from 'react';
import { MOCK_APPOINTMENTS } from '../../data/mockDatasets';
import { AppointmentItem } from '../../types';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { PageHeader, SectionHeader } from '../../components/common/SharedComponents';
import { Calendar, Clock, Plus, X, CheckCircle2 } from 'lucide-react';

export const AppointmentsView: React.FC = () => {
  const [appointments, setAppointments] = useState<AppointmentItem[]>(MOCK_APPOINTMENTS);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  // New Appointment Form State
  const [newPatientId, setNewPatientId] = useState('PAT-1001');
  const [newDoctorId, setNewDoctorId] = useState('DOC-101');
  const [newDate, setNewDate] = useState('2024-09-15');
  const [newTimeSlot, setNewTimeSlot] = useState('14:00-14:30');
  const [newReason, setNewReason] = useState('Routine Cardiology Consultation');

  const handleBookSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newApt: AppointmentItem = {
      appointment_id: `APT-${1000 + appointments.length + 1}`,
      patient_id: newPatientId,
      doctor_id: newDoctorId,
      hospital_id: 'HOSP-001',
      date: newDate,
      time_slot: newTimeSlot,
      status: 'SCHEDULED',
      reason: newReason,
    };

    setAppointments([newApt, ...appointments]);
    setIsModalOpen(false);
    setNotificationMsg(`Appointment ${newApt.appointment_id} scheduled successfully for ${newDate}!`);
    setTimeout(() => setNotificationMsg(null), 4000);
  };

  const handleCancelApt = (id: string) => {
    setAppointments(appointments.map(a => a.appointment_id === id ? { ...a, status: 'CANCELLED' } : a));
    setNotificationMsg(`Appointment ${id} has been cancelled.`);
    setTimeout(() => setNotificationMsg(null), 4000);
  };

  return (
    <div style={{ padding: '2rem', maxWidth: 1150, margin: '0 auto' }}>
      <PageHeader
        title="Appointments & Clinical Scheduling"
        subtitle="Manage physician availability, patient bookings, and department schedules"
        badge={<Badge variant="green">Master Schedule</Badge>}
        actions={
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button variant={viewMode === 'list' ? 'primary' : 'secondary'} size="sm" onClick={() => setViewMode('list')}>
              List View
            </Button>
            <Button variant={viewMode === 'calendar' ? 'primary' : 'secondary'} size="sm" onClick={() => setViewMode('calendar')}>
              Calendar View
            </Button>
            <Button variant="primary" size="sm" onClick={() => setIsModalOpen(true)}>
              <Plus style={{ width: 14, height: 14 }} /> Book Appointment
            </Button>
          </div>
        }
      />

      {/* Action Notification Banner */}
      {notificationMsg && (
        <div style={{ marginBottom: '1.25rem', background: 'var(--forest-green-light)', border: '1px solid var(--forest-green)', color: 'var(--forest-green)', borderRadius: 8, padding: '0.75rem 1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle2 style={{ width: 16, height: 16 }} />
          <span>{notificationMsg}</span>
        </div>
      )}

      {viewMode === 'list' ? (
        <div className="section-panel">
          <SectionHeader title="Scheduled Clinical Appointments" />
          <table className="table-ui">
            <thead>
              <tr>
                <th>Appointment ID</th>
                <th>Patient ID</th>
                <th>Doctor ID</th>
                <th>Facility</th>
                <th>Date & Slot</th>
                <th>Reason for Visit</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((apt) => (
                <tr key={apt.appointment_id}>
                  <td style={{ fontWeight: 600 }}>{apt.appointment_id}</td>
                  <td>{apt.patient_id}</td>
                  <td>{apt.doctor_id}</td>
                  <td>{apt.hospital_id}</td>
                  <td>{apt.date} ({apt.time_slot})</td>
                  <td>{apt.reason}</td>
                  <td>
                    {apt.status === 'SCHEDULED' ? (
                      <Badge variant="green">{apt.status}</Badge>
                    ) : (
                      <Badge variant="red">{apt.status}</Badge>
                    )}
                  </td>
                  <td>
                    {apt.status !== 'CANCELLED' && (
                      <Button variant="ghost" size="sm" onClick={() => handleCancelApt(apt.appointment_id)} style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', color: 'var(--danger-red)' }}>
                        Cancel
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="section-panel">
          <SectionHeader title="September 2024 Clinical Calendar" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem', textAlign: 'center' }}>
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
              <div key={day} style={{ fontWeight: 600, fontSize: '0.8rem', padding: '0.5rem', background: 'var(--bg-surface-secondary)' }}>{day}</div>
            ))}
            {Array.from({ length: 30 }).map((_, i) => {
              const dayNum = i + 1;
              const hasApt = dayNum === 10 || dayNum === 12 || dayNum === 15;
              return (
                <div
                  key={i}
                  style={{
                    height: 80,
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 6,
                    padding: '0.35rem',
                    textAlign: 'left',
                    background: hasApt ? 'var(--forest-green-light)' : 'var(--bg-surface)',
                  }}
                >
                  <div style={{ fontWeight: 600, fontSize: '0.75rem' }}>{dayNum}</div>
                  {hasApt && (
                    <div style={{ fontSize: '0.7rem', color: 'var(--forest-green)', marginTop: '0.25rem', fontWeight: 600 }}>
                      ● Scheduled
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Book Appointment Modal */}
      {isModalOpen && (
        <>
          <div className="drawer-overlay" onClick={() => setIsModalOpen(false)} />
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 480, maxWidth: '90vw', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 12, padding: '1.75rem', boxShadow: 'var(--shadow-lg)', zIndex: 102 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 className="h3">Schedule New Appointment</h3>
              <button className="btn-ui btn-ghost-ui" onClick={() => setIsModalOpen(false)} style={{ padding: '0.2rem' }}>
                <X style={{ width: 18, height: 18 }} />
              </button>
            </div>

            <form onSubmit={handleBookSubmit}>
              <div style={{ marginBottom: '0.85rem' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Patient ID</label>
                <input type="text" className="command-input" style={{ width: '100%', background: 'var(--bg-app)', border: '1px solid var(--border-strong)', padding: '0.55rem', borderRadius: 6 }} value={newPatientId} onChange={(e) => setNewPatientId(e.target.value)} required />
              </div>

              <div style={{ marginBottom: '0.85rem' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Doctor ID</label>
                <input type="text" className="command-input" style={{ width: '100%', background: 'var(--bg-app)', border: '1px solid var(--border-strong)', padding: '0.55rem', borderRadius: 6 }} value={newDoctorId} onChange={(e) => setNewDoctorId(e.target.value)} required />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.85rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Date</label>
                  <input type="date" className="command-input" style={{ width: '100%', background: 'var(--bg-app)', border: '1px solid var(--border-strong)', padding: '0.55rem', borderRadius: 6 }} value={newDate} onChange={(e) => setNewDate(e.target.value)} required />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Time Slot</label>
                  <input type="text" className="command-input" style={{ width: '100%', background: 'var(--bg-app)', border: '1px solid var(--border-strong)', padding: '0.55rem', borderRadius: 6 }} value={newTimeSlot} onChange={(e) => setNewTimeSlot(e.target.value)} required />
                </div>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Reason for Visit</label>
                <input type="text" className="command-input" style={{ width: '100%', background: 'var(--bg-app)', border: '1px solid var(--border-strong)', padding: '0.55rem', borderRadius: 6 }} value={newReason} onChange={(e) => setNewReason(e.target.value)} required />
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button type="submit" variant="primary">Confirm Schedule</Button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
};
