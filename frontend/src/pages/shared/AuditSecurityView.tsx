import React, { useState } from 'react';
import {
  Shield,
  ShieldCheck,
  Lock,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle2,
  FileText,
  User,
  Clock,
  Sparkles,
  RefreshCw,
  Building,
} from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

interface AuditLogEntry {
  id: string;
  timestamp: string;
  user: string;
  role: string;
  action: string;
  resource: string;
  category: 'ACCESS' | 'AI_ACTION' | 'DATA_CHANGE' | 'AUTH' | 'SENSITIVE_ORDER';
  facility: string;
  status: 'AUTHORIZED' | 'COMPLETED' | 'FLAGGED' | 'VERIFIED';
  ipAddress: string;
}

export const AuditSecurityView: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const auditLogs: AuditLogEntry[] = [
    {
      id: 'AUD-9021',
      timestamp: 'Today, 11:42:18 AM',
      user: 'Dr. Rajesh Mehta',
      role: 'Doctor',
      action: 'Viewed Longitudinal Clinical Record',
      resource: 'PAT-1001 (Arun Kumar)',
      category: 'ACCESS',
      facility: 'Coimbatore Medical Center (Main Campus)',
      status: 'AUTHORIZED',
      ipAddress: '10.120.4.18',
    },
    {
      id: 'AUD-9020',
      timestamp: 'Today, 11:40:55 AM',
      user: 'Medical Agent (Specialized AI)',
      role: 'AI System',
      action: 'Biomarker Extraction & Lipid Panel Synthesis',
      resource: 'LABR-1001',
      category: 'AI_ACTION',
      facility: 'Central Diagnostics Lab',
      status: 'VERIFIED',
      ipAddress: 'Internal Orchestrator',
    },
    {
      id: 'AUD-9019',
      timestamp: 'Today, 11:35:12 AM',
      user: 'Nurse Reka',
      role: 'Nurse',
      action: 'Administered 12:00 PM eMAR Medication Dose',
      resource: 'PAT-1001 (Bed 302-A)',
      category: 'DATA_CHANGE',
      facility: 'Coimbatore Medical Center • Ward 3B',
      status: 'COMPLETED',
      ipAddress: '10.120.3.42',
    },
    {
      id: 'AUD-9018',
      timestamp: 'Today, 11:30:04 AM',
      user: 'Appointment Agent (Specialized AI)',
      role: 'AI System',
      action: 'Slot Reservation & Conflict Verification',
      resource: 'APT-2026-881',
      category: 'AI_ACTION',
      facility: 'Coimbatore Medical Center',
      status: 'COMPLETED',
      ipAddress: 'Internal Orchestrator',
    },
    {
      id: 'AUD-9017',
      timestamp: 'Today, 11:30:22 AM',
      user: 'Kavita Iyer',
      role: 'Insurance',
      action: 'Pre-Authorization Adjudication Approved (90% Direct)',
      resource: 'POL-701 • Claim CLM-801',
      category: 'DATA_CHANGE',
      facility: 'Payer Liaison Gateway',
      status: 'AUTHORIZED',
      ipAddress: '192.168.10.45',
    },
    {
      id: 'AUD-9016',
      timestamp: 'Today, 11:15:40 AM',
      user: 'Priya Sharma',
      role: 'Receptionist',
      action: 'Outpatient Triage & Check-in',
      resource: 'PAT-1002 (Sneha Sharma)',
      category: 'ACCESS',
      facility: 'Coimbatore Medical Center • OPD Suite',
      status: 'COMPLETED',
      ipAddress: '10.120.2.14',
    },
    {
      id: 'AUD-9015',
      timestamp: 'Today, 10:55:18 AM',
      user: 'Dr. Vikram Patel',
      role: 'Lab Staff',
      action: 'Critical Result Verification & Escalation Flag',
      resource: 'LABR-1002 (Hemoglobin 8.2 g/dL)',
      category: 'DATA_CHANGE',
      facility: 'Central Pathology Laboratory',
      status: 'FLAGGED',
      ipAddress: '10.120.6.30',
    },
    {
      id: 'AUD-9014',
      timestamp: 'Today, 10:02:11 AM',
      user: 'Dr. Anita Deshmukh',
      role: 'Doctor',
      action: 'Signed Electronic Prescription & Lab Requisition',
      resource: 'RX-3021 • PAT-1002',
      category: 'SENSITIVE_ORDER',
      facility: 'Coimbatore Medical Center',
      status: 'AUTHORIZED',
      ipAddress: '10.120.4.22',
    },
  ];

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.resource.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'ALL' || log.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div style={{ padding: '1.5rem 2rem', maxWidth: 1280, margin: '0 auto' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '1.5rem',
          paddingBottom: '1rem',
          borderBottom: '1px solid var(--border-subtle)',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 6,
                background: 'var(--teal-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--teal-intelligent)',
              }}
            >
              <ShieldCheck style={{ width: 18, height: 18 }} />
            </div>
            <h2 className="h2" style={{ margin: 0 }}>
              Audit & Security Center
            </h2>
            <Badge variant="green">Compliance-Ready Controls</Badge>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '0.25rem 0 0' }}>
            Verified immutable audit trail for clinical chart access, specialized AI assistance, and clinician-authorized orders.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button variant="secondary" size="sm">
            <RefreshCw style={{ width: 13, height: 13 }} /> Refresh Stream
          </Button>
          <Button variant="secondary" size="sm">
            <FileText style={{ width: 13, height: 13 }} /> Export Compliance Report
          </Button>
        </div>
      </div>

      {/* Security Stat Summary Strip */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        {[
          { label: 'Total Verified Events (24h)', value: '1,428', badge: '100% Validated', variant: 'green' },
          { label: 'AI Agent Invocations', value: '412', badge: 'Deterministic', variant: 'brand' },
          { label: 'Sensitive Clinical Orders', value: '86', badge: 'Clinician Authorized', variant: 'brand' },
          { label: 'Security Exceptions', value: '0', badge: 'Zero Breaches', variant: 'green' },
        ].map((stat, idx) => (
          <div key={idx} className="metric-strip-card">
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
              {stat.label}
            </span>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
              <span className="clinical-stat-val" style={{ fontSize: '1.5rem', color: 'var(--text-primary)' }}>
                {stat.value}
              </span>
              <Badge variant={stat.variant as any}>{stat.badge}</Badge>
            </div>
          </div>
        ))}
      </div>

      {/* Filters Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
          marginBottom: '1rem',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
          {[
            { id: 'ALL', label: 'All Events' },
            { id: 'AI_ACTION', label: 'AI Workflow Assistance' },
            { id: 'ACCESS', label: 'Record Access' },
            { id: 'SENSITIVE_ORDER', label: 'Clinician Orders' },
            { id: 'DATA_CHANGE', label: 'Data Modifications' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              style={{
                padding: '0.3rem 0.65rem',
                fontSize: '0.75rem',
                fontWeight: selectedCategory === cat.id ? 600 : 500,
                borderRadius: 'var(--radius-xs)',
                background: selectedCategory === cat.id ? 'var(--teal-intelligent)' : 'var(--bg-surface)',
                color: selectedCategory === cat.id ? '#ffffff' : 'var(--text-secondary)',
                border: '1px solid',
                borderColor: selectedCategory === cat.id ? 'var(--teal-intelligent)' : 'var(--border-subtle)',
                cursor: 'pointer',
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-xs)',
            padding: '0.3rem 0.65rem',
            width: 260,
          }}
        >
          <Search style={{ width: 14, height: 14, color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search audit logs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              border: 'none',
              outline: 'none',
              fontSize: '0.78rem',
              color: 'var(--text-primary)',
              background: 'transparent',
              width: '100%',
            }}
          />
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="table-container">
        <table className="table-dense">
          <thead>
            <tr>
              <th>Log ID</th>
              <th>Timestamp</th>
              <th>Actor & Role</th>
              <th>Action Performed</th>
              <th>Target Resource</th>
              <th>Facility / Node</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.map((log) => {
              const isAi = log.category === 'AI_ACTION';
              return (
                <tr key={log.id}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: '0.72rem' }}>
                    {log.id}
                  </td>
                  <td style={{ color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                    {log.timestamp}
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                      {isAi ? (
                        <Sparkles style={{ width: 13, height: 13, color: 'var(--teal-intelligent)' }} />
                      ) : (
                        <User style={{ width: 13, height: 13, color: 'var(--text-muted)' }} />
                      )}
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{log.user}</div>
                        <span style={{ fontSize: '0.66rem', color: isAi ? 'var(--teal-intelligent)' : 'var(--text-muted)' }}>
                          {log.role}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td style={{ fontWeight: 500 }}>{log.action}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                    {log.resource}
                  </td>
                  <td style={{ fontSize: '0.72rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                    {log.facility}
                  </td>
                  <td>
                    <span
                      style={{
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        padding: '0.12rem 0.45rem',
                        borderRadius: 3,
                        background:
                          log.status === 'FLAGGED'
                            ? 'var(--warning-amber-bg)'
                            : log.status === 'VERIFIED'
                            ? 'var(--teal-subtle)'
                            : 'var(--clinical-green-bg)',
                        color:
                          log.status === 'FLAGGED'
                            ? 'var(--warning-amber)'
                            : log.status === 'VERIFIED'
                            ? 'var(--teal-intelligent)'
                            : 'var(--clinical-green)',
                        border: '1px solid',
                        borderColor:
                          log.status === 'FLAGGED'
                            ? 'var(--warning-amber-border)'
                            : 'transparent',
                      }}
                    >
                      {log.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
