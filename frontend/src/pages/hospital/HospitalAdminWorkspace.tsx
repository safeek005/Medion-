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
  Layers,
} from 'lucide-react';
import { PageHeader, SectionHeader } from '../../components/common/SharedComponents';
import { WorkspaceHeader } from '../../components/common/WorkspaceHeader';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { DataTable } from '../../components/ui/DataTable';
import { MOCK_HOSPITAL_METRICS } from '../../data/mockDatasets';
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
  const [activeTab, setActiveTab] = useState<'command' | 'clinical' | 'triage' | 'organization' | 'operations' | 'bi' | 'security'>('command');

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

  // Surgical Theatre Suite Data
  const orTheatres = [
    { id: 'OR-1', name: 'Suite 1 (Cardiothoracic)', status: 'ACTIVE', procedure: 'Coronary Artery Bypass (CABG)', lead: 'Dr. Rajesh Mehta', elapsed: '2h 15m / 3h 00m', progress: 75 },
    { id: 'OR-2', name: 'Suite 2 (Orthopedic / Trauma)', status: 'ACTIVE', procedure: 'Total Knee Arthroplasty', lead: 'Dr. A. Joshi', elapsed: '1h 10m / 2h 00m', progress: 58 },
    { id: 'OR-3', name: 'Suite 3 (Neurosurgery)', status: 'ACTIVE', procedure: 'Craniotomy & Tumor Resection', lead: 'Dr. S. Verma', elapsed: '3h 40m / 4h 30m', progress: 81 },
    { id: 'OR-4', name: 'Suite 4 (General / Colorectal)', status: 'TURNOVER', procedure: 'Sterilization & Tray Prep', lead: 'Charge Tech Sunita', elapsed: '14m / 25m TAT', progress: 56 },
    { id: 'OR-5', name: 'Suite 5 (Minimally Invasive / Lap)', status: 'ACTIVE', procedure: 'Laparoscopic Cholecystectomy', lead: 'Dr. Suresh Rao', elapsed: '35m / 1h 15m', progress: 46 },
    { id: 'OR-6', name: 'Suite 6 (Pediatric / ENT)', status: 'ACTIVE', procedure: 'Tympanoplasty & Myringotomy', lead: 'Dr. Anita Deshmukh', elapsed: '45m / 1h 00m', progress: 75 },
    { id: 'OR-7', name: 'Suite 7 (Vascular / Endovascular)', status: 'TURNOVER', procedure: 'Decontamination Cycle Active', lead: 'Sterile Processing Team', elapsed: '08m / 25m TAT', progress: 32 },
    { id: 'OR-8', name: 'Suite 8 (Emergency Dedicated STAT)', status: 'STANDBY', procedure: 'Standby for Polytrauma / Code Red', lead: 'Trauma On-Call Team', elapsed: 'Immediate Readiness', progress: 100 },
  ];

  return (
    <div style={{ padding: '1.75rem 2.25rem', maxWidth: 1280, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <WorkspaceHeader
        title="Hospital Operations"
        subtitle="Coimbatore Medical Center • Main Campus • Real-Time Command Center"
        facility="Coimbatore Medical Center (Main Campus)"
        department="Enterprise Operations Command & System Governance"
        statusText="Surge Protocol: Tier 2 Active (ICU 95%)"
        statusVariant="critical"
        metrics={[
          { label: 'Licensed Beds', value: '382/450 (84.8%)' },
          { label: 'ICU Critical Occupancy', value: '38/40 (95%)', accent: 'var(--status-danger)' },
          { label: 'ED Wait Time', value: '18m (14 Waiting)' },
          { label: 'OR Utilization', value: '6 of 8 ORs Active' },
        ]}
        actions={
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <Button
              variant={activeTab === 'command' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setActiveTab('command')}
            >
              <Activity style={{ width: 14, height: 14 }} /> Executive Deck
            </Button>
            <Button
              variant={activeTab === 'clinical' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setActiveTab('clinical')}
            >
              <Users style={{ width: 14, height: 14 }} /> Clinical Matrix
            </Button>
            <Button
              variant={activeTab === 'triage' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setActiveTab('triage')}
            >
              <Activity style={{ width: 14, height: 14 }} /> Capacity & Triage
            </Button>
            <Button
              variant={activeTab === 'organization' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setActiveTab('organization')}
            >
              <Building2 style={{ width: 14, height: 14 }} /> Personnel
            </Button>
            <Button
              variant={activeTab === 'operations' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setActiveTab('operations')}
            >
              <Layers style={{ width: 14, height: 14 }} /> Dept Load
            </Button>
            <Button
              variant={activeTab === 'bi' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setActiveTab('bi')}
            >
              <BarChart3 style={{ width: 14, height: 14 }} /> Financial BI
            </Button>
            <Button
              variant={activeTab === 'security' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setActiveTab('security')}
            >
              <Shield style={{ width: 14, height: 14 }} /> Security
            </Button>
          </div>
        }
      />

      {/* TAB 0: FLAGSHIP OPERATIONS COMMAND DECK */}
      {activeTab === 'command' && (
        <div>
          {/* Operational Bottleneck Exception Banner */}
          <div
            style={{
              background: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              borderRadius: 8,
              padding: '0.85rem 1.15rem',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.85rem',
            }}
          >
            <AlertTriangle style={{ width: 18, height: 18, color: 'var(--status-danger)', marginTop: 2, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--status-danger)', letterSpacing: '0.3px' }}>
                  OPERATIONAL ALERTS (Coimbatore Medical Center • 3 Active Surge & Safety Exceptions)
                </span>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Updated 45s ago via Telemetry Stream</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.65rem', marginTop: '0.45rem' }}>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', background: 'var(--bg-card)', padding: '0.45rem 0.65rem', borderRadius: 6, border: '1px solid var(--border-subtle)' }}>
                  <strong style={{ color: 'var(--status-danger)' }}>• ICU Cap (95%):</strong> 38/40 occupied. Recommend Step-down transfer evaluation for Beds 402 and 405.
                </div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', background: 'var(--bg-card)', padding: '0.45rem 0.65rem', borderRadius: 6, border: '1px solid var(--border-subtle)' }}>
                  <strong style={{ color: '#f59e0b' }}>• STAT Troponin TAT:</strong> 34 mins (Bench: 30m). Central Pathology Analyzer #2 undergoing auto-calibration.
                </div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', background: 'var(--bg-card)', padding: '0.45rem 0.65rem', borderRadius: 6, border: '1px solid var(--border-subtle)' }}>
                  <strong style={{ color: '#f59e0b' }}>• ED Inpatient Bed Hold:</strong> 3 patients admitted awaiting bed turnover in Inpatient Ward 3B.
                </div>
              </div>
            </div>
          </div>

          {/* 7 Top Executive Command Metrics Strip (Section 16) */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
              gap: '0.85rem',
              marginBottom: '1.25rem',
            }}
          >
            {[
              { label: 'Patients Today', val: '184', sub: '88 OPD • 96 IPD', color: 'var(--text-primary)' },
              { label: 'Admissions', val: '28', sub: 'Today (8 Pending Bed)', color: 'var(--teal-intelligent)' },
              { label: 'Discharges', val: '22', sub: '18 Cleared • 4 Pending', color: 'var(--clinical-green)' },
              { label: 'Appointments', val: '142', sub: 'Master Schedule', color: 'var(--text-primary)' },
              { label: 'Bed Occupancy', val: '84.8%', sub: '382 / 450 Occupied', color: 'var(--warning-amber)' },
              { label: 'Critical Results', val: '3', sub: 'STAT Panic Alert', color: 'var(--danger-red)' },
              { label: 'Pending Claims', val: '14', sub: '$184,200 Under Review', color: 'var(--teal-intelligent)' },
            ].map((m, i) => (
              <div key={i} className="metric-strip-card" style={{ padding: '0.85rem 1rem' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                  {m.label}
                </span>
                <div className="tabular-nums" style={{ fontSize: '1.45rem', fontWeight: 800, color: m.color, marginTop: '0.15rem' }}>
                  {m.val}
                </div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{m.sub}</span>
              </div>
            ))}
          </div>

          {/* MEDION Multi-Agent Swarm Orchestration Telemetry */}
          <div className="section-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <div>
                <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                  MEDION Multi-Agent Swarm Orchestration Health
                </h4>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  Active autonomous nodes, deterministic routing latency, and human-in-the-loop oversight
                </span>
              </div>
              <Badge variant="brand">ALL 5 NODES HEALTHY</Badge>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '0.75rem' }}>
              <div style={{ background: 'var(--bg-elevated)', padding: '0.75rem', borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Active Swarm Nodes</div>
                <div style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--color-primary-light)', margin: '0.2rem 0' }}>5 / 5 Online</div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>Medical, Lab, Rx, Claim, Patient</div>
              </div>

              <div style={{ background: 'var(--bg-elevated)', padding: '0.75rem', borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Workflow Throughput</div>
                <div style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0.2rem 0' }}>142 / hr</div>
                <div style={{ fontSize: '0.68rem', color: 'var(--color-primary-light)' }}>↑ 18% peak hospital surge</div>
              </div>

              <div style={{ background: 'var(--bg-elevated)', padding: '0.75rem', borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Avg Agent Latency</div>
                <div style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0.2rem 0' }}>380 ms</div>
                <div style={{ fontSize: '0.68rem', color: 'var(--color-primary-light)' }}>Deterministic state machine</div>
              </div>

              <div style={{ background: 'var(--bg-elevated)', padding: '0.75rem', borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Decision Validation</div>
                <div style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--color-primary-light)', margin: '0.2rem 0' }}>99.4%</div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>Zero ungrounded hallucinations</div>
              </div>

              <div style={{ background: 'var(--bg-elevated)', padding: '0.75rem', borderRadius: 8, border: '1px solid rgba(245, 158, 11, 0.35)' }}>
                <div style={{ fontSize: '0.7rem', color: '#f59e0b', textTransform: 'uppercase', fontWeight: 600 }}>Human-In-The-Loop</div>
                <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#f59e0b', margin: '0.2rem 0' }}>3 Pending</div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>Awaiting physician countersign</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: CLINICAL MATRIX */}
      {activeTab === 'clinical' && (
        <div>
          {/* Department Operations Command Matrix */}
          <div className="section-panel" style={{ padding: '1.25rem 1.5rem', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                  Department Operations Command Matrix
                </h4>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                  Patient volume, on-duty clinical staffing, throughput status, and active operational bottlenecks
                </span>
              </div>
              <Badge variant="brand">5 Major Clinical Departments</Badge>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table className="table-ui" style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th>Department</th>
                    <th>Patient Load</th>
                    <th>Capacity</th>
                    <th>Staff</th>
                    <th>Operational Status</th>
                    <th>Bottleneck</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    {
                      dept: 'Emergency',
                      patients: '34 Active Triage',
                      capacity: '92% Surge',
                      staff: '8 MDs • 14 RNs on duty',
                      status: 'Surge Tier 2',
                      statusVariant: 'red' as const,
                      tasks: '2 STAT cardiac read-backs, 3 inpatient bed holds',
                    },
                    {
                      dept: 'Cardiology',
                      patients: '28 Patients (12 OPD, 16 IPD)',
                      capacity: '85% Utilized',
                      staff: '5 Cardiologists • 9 RNs',
                      status: 'Normal Capacity',
                      statusVariant: 'green' as const,
                      tasks: '4 echo reviews, 1 medication titration proposal',
                    },
                    {
                      dept: 'Neurology',
                      patients: '19 Patients (Ward 4A)',
                      capacity: '70% Utilized',
                      staff: '4 Neurologists • 6 RNs',
                      status: 'Optimal',
                      statusVariant: 'green' as const,
                      tasks: '2 MRI scan evaluations, 1 EEG telemetry review',
                    },
                    {
                      dept: 'Orthopedics',
                      patients: '22 Patients (OR Suite)',
                      capacity: '88% High Load',
                      staff: '6 Surgeons • 8 RNs',
                      status: 'High OR Load (87.5%)',
                      statusVariant: 'amber' as const,
                      tasks: '3 post-op recovery check-ins, 1 surgical turnover',
                    },
                    {
                      dept: 'General Medicine',
                      patients: '46 Patients (Wards 2A & 2B)',
                      capacity: '94% High Vol',
                      staff: '7 Physicians • 12 RNs',
                      status: 'High Volume',
                      statusVariant: 'amber' as const,
                      tasks: '5 discharge summaries pending, 4 lab panels ordered',
                    },
                  ].map((dept, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{dept.dept}</td>
                      <td className="tabular-nums" style={{ fontWeight: 600 }}>{dept.patients}</td>
                      <td>
                        <span style={{ fontWeight: 700, fontSize: '0.8rem', color: dept.capacity.includes('Surge') || dept.capacity.includes('94%') ? 'var(--danger-red)' : 'var(--teal-intelligent)' }}>
                          {dept.capacity}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.82rem' }}>{dept.staff}</td>
                      <td>
                        <Badge variant={dept.statusVariant}>{dept.status}</Badge>
                      </td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{dept.tasks}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB: CAPACITY & TRIAGE */}
      {activeTab === 'triage' && (
        <div>
          {/* Core Operations Deck Grid: Bed Surge + ED Triage */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>
            {/* Live Hospital Capacity Card */}
            <div className="section-panel" style={{ margin: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <div>
                  <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                    Hospital Capacity (Beds, ICU, Emergency, Operating Rooms)
                  </h4>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Real-time sensor & eMAR occupancy telemetry</span>
                </div>
                <Badge variant="amber">84.8% CAPACITY</Badge>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {/* Total Capacity Bar */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', marginBottom: '0.25rem' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Total Licensed Inpatient Beds</span>
                    <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>382 / 450 (68 Available)</span>
                  </div>
                  <div style={{ width: '100%', height: 7, background: 'var(--bg-elevated)', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ width: '84.8%', height: '100%', background: 'var(--status-warning)', borderRadius: 4 }} />
                  </div>
                </div>

                {/* Sub-units Breakdown */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.25rem' }}>
                  <div style={{ background: 'var(--bg-elevated)', padding: '0.5rem 0.65rem', borderRadius: 6, border: '1px solid var(--border-subtle)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--status-danger)' }}>ICU Critical Care</span>
                      <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--status-danger)' }}>95.0%</span>
                    </div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>38 / 40 Beds</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--status-danger)', fontWeight: 600 }}>SURGE CODE ACTIVATED</div>
                  </div>

                  <div style={{ background: 'var(--bg-elevated)', padding: '0.5rem 0.65rem', borderRadius: 6, border: '1px solid var(--border-subtle)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Step-Down Intermediate</span>
                      <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-primary)' }}>84.0%</span>
                    </div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>42 / 50 Beds</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--color-primary-light)' }}>8 Beds Ready for Admission</div>
                  </div>

                  <div style={{ background: 'var(--bg-elevated)', padding: '0.5rem 0.65rem', borderRadius: 6, border: '1px solid var(--border-subtle)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Medical / Surgical Floor</span>
                      <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-primary)' }}>83.6%</span>
                    </div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>276 / 330 Beds</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--color-primary-light)' }}>54 Beds Available</div>
                  </div>

                  <div style={{ background: 'var(--bg-elevated)', padding: '0.5rem 0.65rem', borderRadius: 6, border: '1px solid var(--border-subtle)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Emergency Observation</span>
                      <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-primary)' }}>86.7%</span>
                    </div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>26 / 30 Bays</div>
                    <div style={{ fontSize: '0.65rem', color: '#f59e0b' }}>4 Rapid Turn Bays Open</div>
                  </div>
                </div>
              </div>
            </div>

            {/* ED Emergency Throughput & Acuity */}
            <div className="section-panel" style={{ margin: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <div>
                  <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                    Emergency Dept (ED) Throughput
                  </h4>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Active triage queue & patient wait-time telemetry</span>
                </div>
                <Badge variant="green">AVERAGE WAIT: 18m</Badge>
              </div>

              {/* Waiting Count & Acuity Pills */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '0.6rem', borderRadius: 6, textAlign: 'center' }}>
                  <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--status-danger)' }}>2</div>
                  <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--status-danger)' }}>RED STAT</div>
                  <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>Immediate / 0m wait</div>
                </div>

                <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '0.6rem', borderRadius: 6, textAlign: 'center' }}>
                  <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#f59e0b' }}>5</div>
                  <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#f59e0b' }}>AMBER URGENT</div>
                  <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>Avg wait: 12 mins</div>
                </div>

                <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '0.6rem', borderRadius: 6, textAlign: 'center' }}>
                  <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--color-primary-light)' }}>7</div>
                  <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--color-primary-light)' }}>GREEN STABLE</div>
                  <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>Avg wait: 24 mins</div>
                </div>
              </div>

              {/* Throughput Metrics */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.74rem' }}>
                <div style={{ background: 'var(--bg-elevated)', padding: '0.5rem 0.65rem', borderRadius: 6, border: '1px solid var(--border-subtle)' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Admissions Today:</span>{' '}
                  <strong style={{ color: 'var(--text-primary)' }}>42 Patients</strong>
                </div>
                <div style={{ background: 'var(--bg-elevated)', padding: '0.5rem 0.65rem', borderRadius: 6, border: '1px solid var(--border-subtle)' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Left Without Being Seen:</span>{' '}
                  <strong style={{ color: 'var(--color-primary-light)' }}>0.8% (Target &lt;2%)</strong>
                </div>
                <div style={{ background: 'var(--bg-elevated)', padding: '0.5rem 0.65rem', borderRadius: 6, border: '1px solid var(--border-subtle)' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Door-to-Doctor Time:</span>{' '}
                  <strong style={{ color: 'var(--text-primary)' }}>14.2 Mins</strong>
                </div>
                <div style={{ background: 'var(--bg-elevated)', padding: '0.5rem 0.65rem', borderRadius: 6, border: '1px solid var(--border-subtle)' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Ambulance Offload Time:</span>{' '}
                  <strong style={{ color: 'var(--text-primary)' }}>9.5 Mins</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Surgical Suite Operations Matrix (8 OR Theatres) */}
          <div className="section-panel" style={{ marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <div>
                <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                  Surgical Suite Operations Matrix (8 Operating Theatres)
                </h4>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  Suite utilization: 87.5% • 28 Procedures Scheduled Today • 19 Completed • 6 Active Now • 2 Turnover
                </span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <span className="priority-badge-critical" style={{ fontSize: '0.66rem' }}>6 ACTIVE CASES</span>
                <span className="priority-badge-warning" style={{ fontSize: '0.66rem' }}>2 TURNOVER / STERILE</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.65rem' }}>
              {orTheatres.map((or) => (
                <div
                  key={or.id}
                  style={{
                    background: 'var(--bg-elevated)',
                    border: or.status === 'ACTIVE' ? '1px solid rgba(110, 231, 183, 0.35)' : or.status === 'TURNOVER' ? '1px solid rgba(245, 158, 11, 0.35)' : '1px solid var(--border-subtle)',
                    borderRadius: 8,
                    padding: '0.75rem 0.85rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                    <span style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-primary)' }}>{or.name}</span>
                    <span
                      style={{
                        fontSize: '0.62rem',
                        fontWeight: 700,
                        padding: '0.12rem 0.45rem',
                        borderRadius: 4,
                        background: or.status === 'ACTIVE' ? 'rgba(16, 185, 129, 0.15)' : or.status === 'TURNOVER' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                        color: or.status === 'ACTIVE' ? 'var(--color-primary-light)' : or.status === 'TURNOVER' ? '#f59e0b' : '#60a5fa',
                      }}
                    >
                      {or.status}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500, marginBottom: '0.2rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {or.procedure}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                    <span>Lead: {or.lead}</span>
                    <span>{or.elapsed}</span>
                  </div>
                  <div style={{ width: '100%', height: 4, background: 'var(--bg-card)', borderRadius: 2, overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${or.progress}%`,
                        height: '100%',
                        background: or.status === 'ACTIVE' ? 'var(--color-primary-light)' : or.status === 'TURNOVER' ? '#f59e0b' : '#60a5fa',
                        borderRadius: 2,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

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
