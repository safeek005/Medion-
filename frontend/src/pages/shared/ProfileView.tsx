import React from 'react';
import { UserRole } from '../../types';
import { User, ShieldCheck } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';

interface ProfileViewProps {
  role: UserRole;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ role }) => {
  const getProfileInfo = (r: UserRole) => {
    switch (r) {
      case 'doctor': return { name: 'Dr. Rajesh Mehta', title: 'Senior Cardiologist', department: 'Department of Cardiology', email: 'dr.mehta@medionhealth.org', phone: '+91 9876500001', facility: 'MEDION Hospital HOSP-001' };
      case 'nurse': return { name: 'Nurse Reka', title: 'Clinical Operations Lead', department: 'Inpatient & Ambulatory Operations', email: 'nurse.reka@medionhealth.org', phone: '+91 9876500002', facility: 'MEDION Hospital HOSP-001' };
      case 'patient': return { name: 'Arun Kumar', title: 'Registered Patient', department: 'General Care (PAT-1001)', email: 'arun.kumar@example.com', phone: '+91 9876543210', facility: 'MEDION Health System' };
      case 'lab': return { name: 'Lab Tech Manager', title: 'Laboratory Specialist', department: 'Diagnostic Pathology (LAB-001)', email: 'lab.tech@medionlabs.org', phone: '+91 9876500003', facility: 'Central Diagnostics Lab' };
      case 'insurance': return { name: 'Claims Officer', title: 'Payer Adjudicator', department: 'Insurance & Claims Operations', email: 'claims@medioncare.com', phone: '+91 9876500004', facility: 'Star Health & Allied Insurance' };
      case 'hospital': return { name: 'Hospital Administrator', title: 'Chief Operations Officer', department: 'Executive Hospital Administration', email: 'admin@medionhealth.org', phone: '+91 9876500005', facility: 'MEDION Health Network' };
    }
  };

  const info = getProfileInfo(role);

  return (
    <div style={{ padding: '2rem', maxWidth: 900, margin: '0 auto' }}>
      <div style={{ marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-subtle)' }}>
        <h2 className="h2">User Profile</h2>
        <p className="text-muted" style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
          Identity details and role authorizations
        </p>
      </div>

      <div className="section-panel">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.5rem' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--forest-green-light)', color: 'var(--forest-green)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.5rem' }}>
            {info.name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h3 className="h3">{info.name}</h3>
            <div className="text-muted" style={{ fontSize: '0.85rem' }}>{info.title} • {info.department}</div>
            <div style={{ marginTop: '0.35rem' }}>
              <Badge variant="green"><ShieldCheck style={{ width: 12, height: 12 }} /> Authorized Role: {role.toUpperCase()}</Badge>
            </div>
          </div>
        </div>

        <table className="table-ui">
          <tbody>
            <tr><td className="text-muted">Full Name</td><td>{info.name}</td></tr>
            <tr><td className="text-muted">Primary Email</td><td>{info.email}</td></tr>
            <tr><td className="text-muted">Phone Contact</td><td>{info.phone}</td></tr>
            <tr><td className="text-muted">Associated Facility</td><td>{info.facility}</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
