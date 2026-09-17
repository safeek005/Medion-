import React from 'react';
import { UserRole } from '../../types';
import { User, ShieldCheck } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { useAuth } from '../../services/authService';

interface ProfileViewProps {
  role: UserRole;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ role }) => {
  const { user } = useAuth();

  const getProfileInfo = (r: UserRole) => {
    if (r === 'patient' && user) {
      return {
        name: user.name || 'Arun Kumar',
        title: 'Registered Patient',
        department: `Outpatient Services (${user.id || 'PAT-1001'})`,
        email: user.email || 'arun.kumar@example.com',
        phone: (user as any).phone || '+91 9123456789',
        facility: 'Coimbatore Medical Center (Main Campus)',
      };
    }
    switch (r) {
      case 'doctor': return { name: user?.name || 'Dr. Rajesh Mehta', title: 'Senior Cardiologist & Department Head', department: 'Department of Cardiology', email: user?.email || 'dr.mehta@medionhealth.org', phone: '+91 98765 00001', facility: 'Coimbatore Medical Center (Main Campus)' };
      case 'nurse': return { name: user?.name || 'Nurse Reka', title: 'Clinical Operations Lead', department: 'Inpatient & Ambulatory Operations', email: user?.email || 'nurse.reka@medionhealth.org', phone: '+91 98765 00002', facility: 'Coimbatore Medical Center (Main Campus)' };
      case 'patient': return { name: user?.name || 'Arun Kumar', title: 'Registered Patient', department: `Outpatient Services (${user?.id || 'PAT-1001'})`, email: user?.email || 'arun.kumar@example.com', phone: '+91 9123456789', facility: 'Coimbatore Medical Center (Main Campus)' };
      case 'lab': return { name: user?.name || 'Lab Tech Manager', title: 'Laboratory Specialist', department: 'Diagnostic Pathology (LAB-001)', email: user?.email || 'lab.tech@medionlabs.org', phone: '+91 98765 00003', facility: 'Central Diagnostics Lab • CMC Wing B' };
      case 'insurance': return { name: user?.name || 'Officer Rajesh Patel', title: 'Senior Adjudication Officer', department: 'Payer Relations & Claims Operations', email: user?.email || 'claims@medioncare.com', phone: '+91 98765 00004', facility: 'Star Health & Allied TPA Gateway' };
      case 'hospital': return { name: user?.name || 'Hospital Administrator', title: 'Chief Operating Officer', department: 'Executive Hospital Administration', email: user?.email || 'admin@medionhealth.org', phone: '+91 98765 00005', facility: 'Coimbatore Medical Center Network' };
      case 'receptionist': return { name: user?.name || 'Priya Sharma', title: 'Lead Receptionist & Triage', department: 'Front Desk & Ambulatory Intake', email: user?.email || 'reception.priya@medionhealth.org', phone: '+91 98765 00006', facility: 'Coimbatore Medical Center (Main Campus)' };
      default: return { name: user?.name || 'Clinical Staff Member', title: 'Clinical Staff', department: 'MEDION Healthcare', email: user?.email || 'staff@medionhealth.org', phone: '+91 98765 00000', facility: 'Coimbatore Medical Center (Main Campus)' };
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
