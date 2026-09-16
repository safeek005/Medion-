import React, { useState } from 'react';
import {
  Cpu,
  Sparkles,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  RefreshCw,
  Layers,
  ArrowRight,
  ShieldCheck,
  Stethoscope,
  Calendar,
  FileText,
} from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

interface AgentTaskRecord {
  id: string;
  agent: 'Patient Agent' | 'Medical Agent' | 'Appointment Agent' | 'Insurance Agent' | 'Assistant Agent';
  action: string;
  targetResource: string;
  status: 'COMPLETED' | 'EXECUTING' | 'VERIFIED' | 'FAILED';
  timestamp: string;
  durationMs: number;
  groundTruthRecord: string;
  resultSummary: string;
}

export const AgentActivityView: React.FC = () => {
  const [selectedAgent, setSelectedAgent] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const agentRecords: AgentTaskRecord[] = [
    {
      id: 'TASK-8041',
      agent: 'Medical Agent',
      action: 'analyze_lab_report',
      targetResource: 'LABR-1001 • Lipid Panel',
      status: 'COMPLETED',
      timestamp: 'Today, 11:41:32 AM',
      durationMs: 342,
      groundTruthRecord: 'Postgres / Supabase lab_reports table',
      resultSummary: 'Identified elevated LDL (142 mg/dL) & borderline microcytic hemoglobin (10.4 g/dL). Clinician summary formatted.',
    },
    {
      id: 'TASK-8040',
      agent: 'Appointment Agent',
      action: 'get_available_slots',
      targetResource: 'DOC-101 (Dr. Rajesh Mehta)',
      status: 'COMPLETED',
      timestamp: 'Today, 11:40:18 AM',
      durationMs: 215,
      groundTruthRecord: 'Postgres appointments & doctor schedules',
      resultSummary: 'Verified 4 open consult windows for Thursday Sep 12 (10:00 AM, 11:30 AM, 02:00 PM, 03:30 PM).',
    },
    {
      id: 'TASK-8039',
      agent: 'Patient Agent',
      action: 'get_patient_history',
      targetResource: 'PAT-1001 (Arun Kumar)',
      status: 'COMPLETED',
      timestamp: 'Today, 11:39:52 AM',
      durationMs: 280,
      groundTruthRecord: 'Verified EHR Longitudinal Patient Master',
      resultSummary: 'Compiled 4 care encounters, 3 active medications, and baseline ambulatory blood pressure data.',
    },
    {
      id: 'TASK-8038',
      agent: 'Insurance Agent',
      action: 'verify_eligibility',
      targetResource: 'POL-701 • Star Health',
      status: 'VERIFIED',
      timestamp: 'Today, 11:35:10 AM',
      durationMs: 410,
      groundTruthRecord: 'Star Health Payer Gateway API',
      resultSummary: 'Direct cashless co-pay 90% confirmed. Deductible satisfied. No pre-existing waiting period exclusion.',
    },
    {
      id: 'TASK-8037',
      agent: 'Assistant Agent',
      action: 'interpret_request',
      targetResource: 'Ask MEDION Copilot Query',
      status: 'COMPLETED',
      timestamp: 'Today, 11:32:45 AM',
      durationMs: 195,
      groundTruthRecord: 'Clinical Ontology & Router',
      resultSummary: 'Mapped user natural-language prompt to Medical Agent target with patient_id context extraction.',
    },
    {
      id: 'TASK-8036',
      agent: 'Medical Agent',
      action: 'check_drug_interactions',
      targetResource: 'Amlodipine + Atorvastatin',
      status: 'COMPLETED',
      timestamp: 'Today, 11:25:30 AM',
      durationMs: 230,
      groundTruthRecord: 'Formulary & Pharmacology Knowledge Base',
      resultSummary: 'No adverse cytochrome P450 competitive inhibition. Safe concurrent therapeutic combination.',
    },
    {
      id: 'TASK-8035',
      agent: 'Appointment Agent',
      action: 'reschedule_appointment',
      targetResource: 'APT-2002 • PAT-1002',
      status: 'COMPLETED',
      timestamp: 'Today, 11:12:08 AM',
      durationMs: 380,
      groundTruthRecord: 'Supabase appointments update',
      resultSummary: 'Rescheduled Sneha Sharma thyroid consult with Dr. Anita Deshmukh to Friday 11:30 AM.',
    },
  ];

  const getAgentColor = (agent: string) => {
    switch (agent) {
      case 'Medical Agent': return { text: '#0d9488', bg: '#f0fdfa' };
      case 'Appointment Agent': return { text: '#0284c7', bg: '#f0f9ff' };
      case 'Patient Agent': return { text: '#059669', bg: '#ecfdf5' };
      case 'Insurance Agent': return { text: '#7c3aed', bg: '#f5f3ff' };
      default: return { text: '#d97706', bg: '#fffbeb' };
    }
  };

  const filteredTasks = agentRecords.filter((rec) => {
    const matchesAgent = selectedAgent === 'ALL' || rec.agent === selectedAgent;
    const matchesSearch =
      rec.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.targetResource.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.resultSummary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesAgent && matchesSearch;
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
              <Cpu style={{ width: 18, height: 18 }} />
            </div>
            <h2 className="h2" style={{ margin: 0 }}>
              MEDION Multi-Agent Swarm Operations
            </h2>
            <Badge variant="brand">5 SPECIALIZED AGENTS ONLINE</Badge>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '0.25rem 0 0' }}>
            Real-time telemetry and task execution monitoring across Patient, Medical, Appointment, Insurance, and Assistant agents.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button variant="secondary" size="sm">
            <RefreshCw style={{ width: 13, height: 13 }} /> Refresh Stream
          </Button>
        </div>
      </div>

      {/* Agents Roster Strip */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        {[
          { name: 'Patient Agent', domain: 'Longitudinal EHR & Profiles', status: 'Optimal', latency: '240ms' },
          { name: 'Medical Agent', domain: 'Lab Analysis & Biomarkers', status: 'Optimal', latency: '310ms' },
          { name: 'Appointment Agent', domain: 'Schedules & Slot Allocation', status: 'Optimal', latency: '190ms' },
          { name: 'Insurance Agent', domain: 'Pre-Auth & Claims Adjudication', status: 'Optimal', latency: '360ms' },
          { name: 'Assistant Agent', domain: 'Intent Parsing & Router', status: 'Optimal', latency: '180ms' },
        ].map((ag, idx) => (
          <div key={idx} className="metric-strip-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {ag.name}
              </span>
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  background: 'var(--clinical-green)',
                  boxShadow: '0 0 6px var(--clinical-green)',
                }}
              />
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{ag.domain}</span>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
              <span>Status: <strong style={{ color: 'var(--clinical-green)' }}>{ag.status}</strong></span>
              <span>Avg Latency: <strong className="tabular-nums">{ag.latency}</strong></span>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Tabs & Search Bar */}
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
          {['ALL', 'Medical Agent', 'Appointment Agent', 'Patient Agent', 'Insurance Agent', 'Assistant Agent'].map((ag) => (
            <button
              key={ag}
              onClick={() => setSelectedAgent(ag)}
              style={{
                padding: '0.3rem 0.65rem',
                fontSize: '0.75rem',
                fontWeight: selectedAgent === ag ? 600 : 500,
                borderRadius: 'var(--radius-xs)',
                background: selectedAgent === ag ? 'var(--teal-intelligent)' : 'var(--bg-surface)',
                color: selectedAgent === ag ? '#ffffff' : 'var(--text-secondary)',
                border: '1px solid',
                borderColor: selectedAgent === ag ? 'var(--teal-intelligent)' : 'var(--border-subtle)',
                cursor: 'pointer',
              }}
            >
              {ag}
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
            width: 280,
          }}
        >
          <Search style={{ width: 14, height: 14, color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search tasks, methods, targets..."
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

      {/* Agent Tasks Table */}
      <div className="table-container">
        <table className="table-dense">
          <thead>
            <tr>
              <th>Task ID</th>
              <th>Specialized Agent</th>
              <th>Method Executed</th>
              <th>Target Resource</th>
              <th>Timestamp</th>
              <th>Latency</th>
              <th>Result Summary</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredTasks.map((t) => {
              const colors = getAgentColor(t.agent);
              return (
                <tr key={t.id}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: '0.72rem' }}>
                    {t.id}
                  </td>
                  <td>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        padding: '0.15rem 0.5rem',
                        borderRadius: 3,
                        background: colors.bg,
                        color: colors.text,
                        border: '1px solid rgba(0,0,0,0.06)',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {t.agent}
                    </span>
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.74rem', fontWeight: 600 }}>
                    {t.action}
                  </td>
                  <td style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                    {t.targetResource}
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.72rem', whiteSpace: 'nowrap' }}>
                    {t.timestamp}
                  </td>
                  <td className="tabular-nums" style={{ fontSize: '0.74rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {t.durationMs}ms
                  </td>
                  <td style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', maxWidth: 300 }}>
                    {t.resultSummary}
                  </td>
                  <td>
                    <Badge variant="green">{t.status}</Badge>
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
