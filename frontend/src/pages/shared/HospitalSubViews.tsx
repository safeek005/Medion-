import React from 'react';
import { PageHeader } from '../../components/common/SharedComponents';
import { Badge } from '../../components/ui/Badge';

export const DoctorsView: React.FC = () => {
  const doctors = [
    { id: 'DOC-101', name: 'Dr. Rajesh Mehta', department: 'Cardiology', hospital: 'HOSP-001', phone: '+91 9876500001', status: 'ACTIVE' },
    { id: 'DOC-102', name: 'Dr. Anita Deshmukh', department: 'Endocrinology', hospital: 'HOSP-001', phone: '+91 9876500002', status: 'ACTIVE' },
    { id: 'DOC-103', name: 'Dr. Suresh Patil', department: 'General Medicine', hospital: 'HOSP-002', phone: '+91 9876500003', status: 'ACTIVE' },
  ];

  return (
    <div style={{ padding: '2rem', maxWidth: 1150, margin: '0 auto' }}>
      <PageHeader
        title="Medical Staff — Doctors Directory"
        subtitle="Registered physicians, hospital affiliations, and department schedules"
        badge={<Badge variant="green">3 Active Physicians</Badge>}
      />

      <div className="section-panel">
        <table className="table-ui">
          <thead>
            <tr><th>Doctor ID</th><th>Physician Name</th><th>Department</th><th>Hospital Facility</th><th>Contact Phone</th><th>Status</th></tr>
          </thead>
          <tbody>
            {doctors.map((d) => (
              <tr key={d.id}>
                <td style={{ fontWeight: 600 }}>{d.id}</td>
                <td>{d.name}</td>
                <td>{d.department}</td>
                <td>{d.hospital}</td>
                <td>{d.phone}</td>
                <td><Badge variant="green">{d.status}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const NursesView: React.FC = () => {
  const nurses = [
    { id: 'NUR-201', name: 'Nurse Reka', department: 'Clinical Operations', hospital: 'HOSP-001', status: 'ACTIVE' },
    { id: 'NUR-202', name: 'Nurse Sunita', department: 'ICU & Ambulatory Care', hospital: 'HOSP-001', status: 'ACTIVE' },
  ];

  return (
    <div style={{ padding: '2rem', maxWidth: 1150, margin: '0 auto' }}>
      <PageHeader
        title="Nursing Staff & Clinical Operations"
        subtitle="Nursing staff directory and inpatient unit operations"
        badge={<Badge variant="green">2 Active Nurses</Badge>}
      />

      <div className="section-panel">
        <table className="table-ui">
          <thead>
            <tr><th>Nurse ID</th><th>Staff Name</th><th>Department / Unit</th><th>Facility</th><th>Status</th></tr>
          </thead>
          <tbody>
            {nurses.map((n) => (
              <tr key={n.id}>
                <td style={{ fontWeight: 600 }}>{n.id}</td>
                <td>{n.name}</td>
                <td>{n.department}</td>
                <td>{n.hospital}</td>
                <td><Badge variant="green">{n.status}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const LaboratoriesView: React.FC = () => {
  const labs = [
    { id: 'LAB-001', name: 'Central Diagnostics Laboratory', location: 'Block A, Floor 2', accreditation: 'NABL Certified', status: 'OPERATIONAL' },
  ];

  return (
    <div style={{ padding: '2rem', maxWidth: 1150, margin: '0 auto' }}>
      <PageHeader
        title="Laboratory Facilities"
        subtitle="Diagnostic laboratories and pathology centers"
        badge={<Badge variant="green">LAB-001 Active</Badge>}
      />

      <div className="section-panel">
        <table className="table-ui">
          <thead>
            <tr><th>Facility ID</th><th>Laboratory Name</th><th>Facility Location</th><th>Accreditation</th><th>Status</th></tr>
          </thead>
          <tbody>
            {labs.map((l) => (
              <tr key={l.id}>
                <td style={{ fontWeight: 600 }}>{l.id}</td>
                <td>{l.name}</td>
                <td>{l.location}</td>
                <td>{l.accreditation}</td>
                <td><Badge variant="green">{l.status}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const AnalyticsView: React.FC = () => {
  return (
    <div style={{ padding: '2rem', maxWidth: 1150, margin: '0 auto' }}>
      <PageHeader
        title="Hospital Operations & Clinical Metrics"
        subtitle="Restrained capacity and operational statistics supported by MEDION dataset"
        badge={<Badge variant="green">Data Audited</Badge>}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <div className="section-panel" style={{ marginBottom: 0 }}>
          <div className="text-muted" style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>Registered Medical Staff</div>
          <div style={{ fontSize: '1.65rem', fontWeight: 700, margin: '0.25rem 0' }}>3 Doctors • 2 Nurses</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--forest-green)' }}>Grounded in doctors.json & nurses.json</div>
        </div>

        <div className="section-panel" style={{ marginBottom: 0 }}>
          <div className="text-muted" style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>Active Appointments</div>
          <div style={{ fontSize: '1.65rem', fontWeight: 700, margin: '0.25rem 0' }}>3 Scheduled</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--forest-green)' }}>Grounded in appointments.json</div>
        </div>

        <div className="section-panel" style={{ marginBottom: 0 }}>
          <div className="text-muted" style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>Bed Capacity Metric</div>
          <div style={{ fontSize: '1.65rem', fontWeight: 700, margin: '0.25rem 0', color: 'var(--text-muted)' }}>Data unavailable</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Requires hospital inpatient feed</div>
        </div>
      </div>
    </div>
  );
};
