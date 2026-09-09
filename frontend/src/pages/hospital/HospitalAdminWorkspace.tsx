import React, { useState } from 'react';
import {
  Building2,
  Users,
  Activity,
  Shield,
  BarChart3,
  Calendar,
  UserPlus,
  Clock,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  FileText,
  FlaskConical,
  ShieldCheck,
  Search,
  Filter,
  Plus,
  Lock,
} from 'lucide-react';
import { PageHeader, SectionHeader } from '../../components/common/SharedComponents';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { DataTable } from '../../components/ui/DataTable';
import {
  useSharedAppointments,
  useSharedPatients,
  useSharedDoctors,
  useSharedClaims,
  useSharedLabReports,
} from '../../services/dataService';
import { ExecutionTraceStep } from '../../types';

interface HospitalAdminWorkspaceProps {
  onTraceGenerated?: (step: ExecutionTraceStep) => void;
}

export const HospitalAdminWorkspace: React.FC<HospitalAdminWorkspaceProps> = ({ onTraceGenerated }) => {
  const [activeTab, setActiveTab] = useState<'organization' | 'operations' | 'bi' | 'security'>('organization');

  // Shared Data Sources
  const appointments = useSharedAppointments();
  const patients = useSharedPatients();
  const doctors = useSharedDoctors();
  const claims = useSharedClaims();
  const labReports = useSharedLabReports();

  // Organization Staff State & Invite Modal
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    name: '',
    email: '',
    role: 'Doctor',
    department: 'Cardiology',
    facility: 'HOSP-001 (Main Campus)',
  });

  const [staffList, setStaffList] = useState([
    { id: 'DOC-101', name: 'Dr. Rajesh Mehta', role: 'Doctor', department: 'Cardiology', facility: 'HOSP-001', status: 'ACTIVE', email: 'dr.mehta@medionhealth.org' },
    { id: 'DOC-102', name: 'Dr. Anita Deshmukh', role: 'Doctor', department: 'Endocrinology', facility: 'HOSP-001', status: 'ACTIVE', email: 'dr.anita@medionhealth.org' },
    { id: 'DOC-103', name: 'Dr. Suresh Rao', role: 'Doctor', department: 'General Medicine', facility: 'HOSP-002', status: 'ACTIVE', email: 'dr.suresh@cityhospital.org' },
    { id: 'NUR-201', name: 'Nurse Reka', role: 'Nurse', department: 'Clinical Operations', facility: 'HOSP-001', status: 'ACTIVE', email: 'nurse.reka@medionhealth.org' },
    { id: 'NUR-202', name: 'Nurse Sunita', role: 'Nurse', department: 'ICU & Ambulatory', facility: 'HOSP-001', status: 'ACTIVE', email: 'nurse.sunita@medionhealth.org' },
    { id: 'REC-301', name: 'Priya Sharma', role: 'Receptionist', department: 'Front Desk & Triage', facility: 'HOSP-001', status: 'ACTIVE', email: 'reception.priya@medionhealth.org' },
    { id: 'LAB-401', name: 'Dr. Vikram Patel', role: 'Lab Technologist', department: 'Central Diagnostics', facility: 'LAB-001', status: 'ACTIVE', email: 'lab.patel@medionhealth.org' },
    { id: 'INS-501', name: 'Kavita Iyer', role: 'Insurance Officer', department: 'Claims Adjudication', facility: 'HOSP-001', status: 'ACTIVE', email: 'claims.kavita@medionhealth.org' },
  ]);

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteForm.name || !inviteForm.email) return;

    const newStaff = {
      id: `${inviteForm.role.slice(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
      name: inviteForm.name,
      role: inviteForm.role,
      department: inviteForm.department,
      facility: inviteForm.facility.split(' ')[0],
      status: 'INVITED',
      email: inviteForm.email,
    };

    setStaffList([newStaff, ...staffList]);
    setInviteSuccess(true);
    setTimeout(() => {
      setInviteSuccess(false);
      setIsInviteModalOpen(false);
      setInviteForm({
        name: '',
        email: '',
        role: 'Doctor',
        department: 'Cardiology',
        facility: 'HOSP-001 (Main Campus)',
      });
    }, 1500);
  };

  // Staff Table Columns
  const staffColumns = [
    {
      key: 'id',
      header: 'Staff ID',
      sortable: true,
      render: (s: typeof staffList[0]) => (
        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{s.id}</span>
      ),
    },
    {
      key: 'name',
      header: 'Practitioner / Staff Name',
      sortable: true,
      render: (s: typeof staffList[0]) => (
        <div>
          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{s.name}</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{s.email}</div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'System Role',
      sortable: true,
      render: (s: typeof staffList[0]) => (
        <Badge variant={s.role === 'Doctor' ? 'brand' : s.role === 'Nurse' ? 'green' : 'neutral'}>
          {s.role}
        </Badge>
      ),
    },
    {
      key: 'department',
      header: 'Department / Unit',
      sortable: true,
      render: (s: typeof staffList[0]) => <span>{s.department}</span>,
    },
    {
      key: 'facility',
      header: 'Facility Affiliation',
      sortable: true,
      render: (s: typeof staffList[0]) => <span>{s.facility}</span>,
    },
    {
      key: 'status',
      header: 'Account Status',
      sortable: true,
      render: (s: typeof staffList[0]) => (
        <Badge variant={s.status === 'ACTIVE' ? 'green' : 'amber'}>{s.status}</Badge>
      ),
    },
  ];

  return (
    <div style={{ padding: '2rem', maxWidth: 1280, margin: '0 auto' }}>
      <PageHeader
        title="MEDION Command Center"
        subtitle="MEDION Hospital Network (HOSP-001) • Executive Operations, Clinical Staff Roster & Intelligence"
        badge={<Badge variant="green">HOSP-001 Operational</Badge>}
        actions={
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button
              variant={activeTab === 'organization' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setActiveTab('organization')}
            >
              <Users style={{ width: 14, height: 14 }} /> Organization Roster
            </Button>
            <Button
              variant={activeTab === 'operations' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setActiveTab('operations')}
            >
              <Activity style={{ width: 14, height: 14 }} /> Clinical Operations
            </Button>
            <Button
              variant={activeTab === 'bi' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setActiveTab('bi')}
            >
              <BarChart3 style={{ width: 14, height: 14 }} /> Business Intelligence
            </Button>
            <Button
              variant={activeTab === 'security' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setActiveTab('security')}
            >
              <Shield style={{ width: 14, height: 14 }} /> Security & Audit
            </Button>
          </div>
        }
      />

      {/* TAB 1: ORGANIZATION ROSTER */}
      {activeTab === 'organization' && (
        <div>
          {/* Summary Metric Panels */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <div className="section-panel" style={{ margin: 0 }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Active Practitioners</div>
              <div style={{ fontSize: '1.65rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0.25rem 0' }}>3 Physicians</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-primary-light)' }}>Cardiology, Endo, GenMed</div>
            </div>

            <div className="section-panel" style={{ margin: 0 }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Clinical Nursing Staff</div>
              <div style={{ fontSize: '1.65rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0.25rem 0' }}>2 Registered Nurses</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-primary-light)' }}>Floor & Ambulatory Care</div>
            </div>

            <div className="section-panel" style={{ margin: 0 }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Patient Front Desk</div>
              <div style={{ fontSize: '1.65rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0.25rem 0' }}>1 Active Desk</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-primary-light)' }}>Online Intake Station</div>
            </div>

            <div className="section-panel" style={{ margin: 0 }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Diagnostic & Payer Units</div>
              <div style={{ fontSize: '1.65rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0.25rem 0' }}>2 Integrated Units</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-primary-light)' }}>LAB-001 & Star Health</div>
            </div>
          </div>

          {/* Master Roster Table */}
          <div className="section-panel" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                  Hospital Personnel & Access Registry
                </h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '0.2rem 0 0' }}>
                  Manage authenticated clinical and administrative users across network branches
                </p>
              </div>
              <Button variant="primary" size="sm" onClick={() => setIsInviteModalOpen(true)}>
                <UserPlus style={{ width: 14, height: 14 }} /> Invite Practitioner / Staff
              </Button>
            </div>

            <DataTable
              columns={staffColumns}
              data={staffList}
              searchPlaceholder="Filter staff by name, ID, role or department..."
              pageSize={8}
            />
          </div>

          {/* Invite Practitioner Modal */}
          {isInviteModalOpen && (
            <div
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0,0,0,0.7)',
                backdropFilter: 'blur(8px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                padding: '1rem',
              }}
            >
              <div
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-accent)',
                  borderRadius: 12,
                  width: '100%',
                  maxWidth: 520,
                  padding: '1.75rem',
                  boxShadow: 'var(--shadow-elevation)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                    Invite Hospital Practitioner
                  </h3>
                  <button
                    onClick={() => setIsInviteModalOpen(false)}
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.1rem' }}
                  >
                    ✕
                  </button>
                </div>

                {inviteSuccess ? (
                  <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                    <CheckCircle2 style={{ width: 42, height: 42, color: 'var(--color-primary-light)', margin: '0 auto 0.75rem' }} />
                    <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      Invitation Dispatched
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                      Secure institutional onboarding token sent to {inviteForm.email}.
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSendInvite}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                      <div>
                        <label className="label-ui">Full Legal Name</label>
                        <input
                          type="text"
                          required
                          className="input-ui"
                          placeholder="e.g. Dr. Preethi Ramanathan"
                          value={inviteForm.name}
                          onChange={(e) => setInviteForm({ ...inviteForm, name: e.target.value })}
                        />
                      </div>

                      <div>
                        <label className="label-ui">Institutional Email Address</label>
                        <input
                          type="email"
                          required
                          className="input-ui"
                          placeholder="p.ramanathan@medionhealth.org"
                          value={inviteForm.email}
                          onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                        />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                        <div>
                          <label className="label-ui">System Role</label>
                          <select
                            className="select-field"
                            value={inviteForm.role}
                            onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value })}
                          >
                            <option value="Doctor">Doctor / Physician</option>
                            <option value="Nurse">Registered Nurse</option>
                            <option value="Receptionist">Receptionist</option>
                            <option value="Lab Technologist">Lab Technologist</option>
                            <option value="Insurance Officer">Insurance Officer</option>
                          </select>
                        </div>
                        <div>
                          <label className="label-ui">Department</label>
                          <select
                            className="select-field"
                            value={inviteForm.department}
                            onChange={(e) => setInviteForm({ ...inviteForm, department: e.target.value })}
                          >
                            <option value="Cardiology">Cardiology</option>
                            <option value="Endocrinology">Endocrinology</option>
                            <option value="General Medicine">General Medicine</option>
                            <option value="Critical Care / ICU">Critical Care / ICU</option>
                            <option value="Front Desk & Intake">Front Desk & Intake</option>
                            <option value="Diagnostics">Diagnostics</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="label-ui">Assigned Facility</label>
                        <select
                          className="select-field"
                          value={inviteForm.facility}
                          onChange={(e) => setInviteForm({ ...inviteForm, facility: e.target.value })}
                        >
                          <option value="HOSP-001 (Main Campus)">HOSP-001 (Main Campus)</option>
                          <option value="HOSP-002 (City Annex)">HOSP-002 (City Annex)</option>
                          <option value="LAB-001 (Central Lab)">LAB-001 (Central Lab)</option>
                        </select>
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.5rem' }}>
                      <Button variant="secondary" type="button" onClick={() => setIsInviteModalOpen(false)}>
                        Cancel
                      </Button>
                      <Button variant="primary" type="submit">
                        Send Secure Invitation
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: CLINICAL OPERATIONS */}
      {activeTab === 'operations' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
            <div className="section-panel" style={{ margin: 0 }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Inpatient Bed Capacity
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0.25rem 0' }}>
                78% Occupied
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-primary-light)' }}>
                156 of 200 Beds Allocated • 44 Available
              </div>
            </div>

            <div className="section-panel" style={{ margin: 0 }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Total Registered Patients
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0.25rem 0' }}>
                {patients.length} Active Records
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-primary-light)' }}>
                100% Verified in Master Index
              </div>
            </div>

            <div className="section-panel" style={{ margin: 0 }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Total Consultation Load
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0.25rem 0' }}>
                {appointments.length} Appointments
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-primary-light)' }}>
                {appointments.filter((a) => a.status === 'COMPLETED').length} Fulfilled •{' '}
                {appointments.filter((a) => a.status === 'SCHEDULED').length} Scheduled
              </div>
            </div>

            <div className="section-panel" style={{ margin: 0 }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Avg Lab Turnaround
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0.25rem 0' }}>
                4.2 Hours
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-primary-light)' }}>
                NABL Accredited Standard Speed
              </div>
            </div>
          </div>

          {/* Departmental Capacity Breakdown */}
          <div className="section-panel">
            <SectionHeader
              title="Departmental Service Capacity & Occupancy"
              subtitle="Real-time clinical throughput across clinical divisions"
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[
                { dept: 'Cardiology (OPD & Catheterization Lab)', occupancy: 85, capacity: '34/40 Beds', head: 'Dr. Rajesh Mehta' },
                { dept: 'Endocrinology & Diabetic Day Care', occupancy: 62, capacity: '15/24 Beds', head: 'Dr. Anita Deshmukh' },
                { dept: 'General Medicine & Acute Care', occupancy: 92, capacity: '46/50 Beds', head: 'Dr. Suresh Rao' },
                { dept: 'Intensive Care Unit (ICU)', occupancy: 70, capacity: '14/20 Beds', head: 'Nurse Sunita' },
              ].map((d) => (
                <div key={d.dept} style={{ padding: '0.75rem', background: 'var(--bg-elevated)', borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                    <div>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.88rem' }}>{d.dept}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>• Lead: {d.head}</span>
                    </div>
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>{d.capacity} ({d.occupancy}%)</span>
                  </div>
                  <div style={{ width: '100%', height: 6, background: 'var(--bg-card)', borderRadius: 3, overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${d.occupancy}%`,
                        height: '100%',
                        background: d.occupancy > 90 ? 'var(--status-danger)' : d.occupancy > 75 ? 'var(--status-warning)' : 'var(--color-primary)',
                        borderRadius: 3,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: BUSINESS INTELLIGENCE */}
      {activeTab === 'bi' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
            <div className="section-panel" style={{ margin: 0 }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Gross Clinical Volume
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0.25rem 0' }}>
                ₹38,45,000
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-primary-light)' }}>
                ↑ 14.2% Month-over-Month
              </div>
            </div>

            <div className="section-panel" style={{ margin: 0 }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Insurance Claim Velocity
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0.25rem 0' }}>
                {claims.length} Claims
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-primary-light)' }}>
                ₹{(claims.reduce((acc, c) => acc + (c.claim_amount || 0), 0)).toLocaleString()} In Process
              </div>
            </div>

            <div className="section-panel" style={{ margin: 0 }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Diagnostic Tests Processed
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0.25rem 0' }}>
                {labReports.length * 14} Panels
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-primary-light)' }}>
                100% Reference Normalized
              </div>
            </div>
          </div>

          <div className="section-panel">
            <SectionHeader
              title="Revenue & Operational Throughput Trends"
              subtitle="Clinical capacity utilization vs payer settlement efficiency"
            />
            <div
              style={{
                height: 200,
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'space-between',
                gap: '1rem',
                padding: '1.5rem 1rem 0.5rem',
                borderBottom: '1px solid var(--border-subtle)',
              }}
            >
              {[
                { month: 'Apr', val: 45, rev: '₹28L' },
                { month: 'May', val: 58, rev: '₹31L' },
                { month: 'Jun', val: 68, rev: '₹34L' },
                { month: 'Jul', val: 74, rev: '₹36L' },
                { month: 'Aug', val: 82, rev: '₹37L' },
                { month: 'Sep (Current)', val: 88, rev: '₹38.4L' },
              ].map((m) => (
                <div key={m.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--color-primary-light)', fontWeight: 600, marginBottom: '0.35rem' }}>
                    {m.rev}
                  </div>
                  <div
                    style={{
                      width: '100%',
                      maxWidth: 45,
                      height: `${m.val}%`,
                      background: 'linear-gradient(180deg, var(--color-primary-light) 0%, var(--color-primary) 100%)',
                      borderRadius: '4px 4px 0 0',
                    }}
                  />
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                    {m.month}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: SECURITY & AUDIT */}
      {activeTab === 'security' && (
        <div>
          <div className="section-panel" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
            <SectionHeader
              title="Access Control Role Policies"
              subtitle="Strict role-based authorization rules separating patient confidentiality and provider boundaries"
            />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
              {[
                { role: 'Doctor', perms: 'Read/Write assigned patient records, clinical notes, prescriptions, and lab orders.' },
                { role: 'Nurse', perms: 'Read patient charts, administer medications, record vitals, update bed triage.' },
                { role: 'Receptionist', perms: 'Create patient demographics, check duplicates, book and modify appointments.' },
                { role: 'Laboratory', perms: 'Access diagnostic work orders, input specimen parameters, flag critical bounds.' },
                { role: 'Insurance', perms: 'Adjudicate submitted claims, verify policy copay limits, approve disbursements.' },
                { role: 'Hospital Admin', perms: 'Manage institutional directory, audit multi-agent dispatches, capacity telemetry.' },
              ].map((p) => (
                <div key={p.role} style={{ padding: '1rem', background: 'var(--bg-elevated)', borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                    <Lock style={{ width: 14, height: 14, color: 'var(--color-primary-light)' }} />
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.85rem' }}>{p.role} Scope</span>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.4 }}>
                    {p.perms}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="section-panel">
            <SectionHeader
              title="Multi-Agent Security Audit Trail"
              subtitle="Immutable record of deterministic agent invocations and database operations"
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {[
                { id: 'AUD-8891', agent: 'patient_registration', action: 'CREATE patient', status: 'AUTHORIZED', time: '10 mins ago', user: 'Receptionist' },
                { id: 'AUD-8890', agent: 'appointment', action: 'UPDATE status -> COMPLETED', status: 'AUTHORIZED', time: '25 mins ago', user: 'Doctor' },
                { id: 'AUD-8889', agent: 'medical', action: 'ANALYZE lab_report LABR-1001', status: 'AUTHORIZED', time: '1 hour ago', user: 'Lab Technologist' },
                { id: 'AUD-8888', agent: 'insurance', action: 'ADJUDICATE claim CLM-1001', status: 'AUTHORIZED', time: '3 hours ago', user: 'Claims Officer' },
              ].map((a) => (
                <div
                  key={a.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 1rem',
                    background: 'var(--bg-elevated)',
                    borderRadius: 6,
                    border: '1px solid var(--border-subtle)',
                    fontSize: '0.8rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ fontWeight: 600, color: 'var(--color-primary-light)' }}>{a.id}</span>
                    <Badge variant="brand">{a.agent}</Badge>
                    <span style={{ color: 'var(--text-primary)' }}>{a.action}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>by {a.user}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <Badge variant="green">{a.status}</Badge>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>{a.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
