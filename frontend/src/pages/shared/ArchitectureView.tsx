import React, { useState } from 'react';
import {
  Layers,
  Sparkles,
  Database,
  CheckCircle2,
  Cpu,
  ArrowDown,
  ShieldCheck,
  UserCheck,
  Stethoscope,
  Calendar,
  FileText,
  Activity,
  ArrowRight,
} from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

export const ArchitectureView: React.FC = () => {
  const [activeStep, setActiveStep] = useState<number | null>(null);

  const architectureLayers = [
    {
      step: 1,
      title: 'USER REQUEST & INTENT INTAKE',
      desc: 'Natural language clinical request, portal action, or diagnostic order captured from Physician, Nurse, Patient, or Admin.',
      subtext: 'Channels: Ask MEDION Copilot, eMAR Scanner, OPD Triage, Diagnostic Order Requisition',
      color: '#0284c7',
    },
    {
      step: 2,
      title: 'MEDION AI / INTENT UNDERSTANDING',
      desc: 'Semantic entity extraction, ICD-10/LOINC clinical mapping, role-based boundary verification, and audience framing.',
      subtext: 'Engine: Clinical Ontology & Multi-Role Intent Router',
      color: '#7c3aed',
    },
    {
      step: 3,
      title: 'MEDION MULTI-AGENT ORCHESTRATOR',
      desc: 'Determines optimal execution graph, manages state, enforces HIPAA/NDHM privacy boundaries, and routes to specialized agents.',
      subtext: 'Protocol: Deterministic Workflow Router & Telemetry Collector',
      color: '#0d9488',
    },
    {
      step: 4,
      title: 'SPECIALIZED CLINICAL WORKFLOW AGENTS',
      desc: 'Specialized MEDION agents executing deterministic analytical workflows and clinical decision support. AI assists. Clinicians decide.',
      subtext: 'Specialized Agents:',
      isAgentGrid: true,
      color: '#059669',
    },
    {
      step: 5,
      title: 'DATABASE & INTEGRATION WORKFLOW',
      desc: 'Ground-truth EHR tables, laboratory information system (LIS), FHIR resources, and payer claims clearinghouses.',
      subtext: 'Storage: PostgreSQL / Supabase with Row-Level Security (RLS) & Audit Telemetry',
      color: '#0f766e',
    },
    {
      step: 6,
      title: 'CLINICIAN SAFETY GATE & UI SYNCHRONIZATION',
      desc: 'Two-step confirmation gates, explicit clinician authorization for sensitive orders, and real-time state hydration.',
      subtext: 'Safety Motto: AI assists. Clinicians decide.',
      color: '#d97706',
    },
  ];

  const agents = [
    {
      name: 'Patient Agent',
      focus: 'Longitudinal EHR Master',
      tasks: 'get_patient_history, update_profile, care_timeline',
      color: '#059669',
    },
    {
      name: 'Medical Agent',
      focus: 'Diagnostics & Therapeutics',
      tasks: 'analyze_lab_report, check_interactions, clinical_summary',
      color: '#0d9488',
    },
    {
      name: 'Appointment Agent',
      focus: 'Hospital Schedule Engine',
      tasks: 'get_available_slots, book_consultation, reschedule',
      color: '#0284c7',
    },
    {
      name: 'Insurance Agent',
      focus: 'Payer Adjudication & Pre-Auth',
      tasks: 'verify_eligibility, process_claim, coverage_check',
      color: '#7c3aed',
    },
    {
      name: 'Assistant Agent',
      focus: 'Multi-Modal Dialogue & Triage',
      tasks: 'interpret_request, natural_explanation, routing',
      color: '#d97706',
    },
  ];

  return (
    <div style={{ padding: '1.5rem 2rem', maxWidth: 1180, margin: '0 auto' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '2rem',
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
              <Layers style={{ width: 18, height: 18 }} />
            </div>
            <h2 className="h2" style={{ margin: 0 }}>
              MEDION Multi-Agent Clinical Operating System Architecture
            </h2>
            <Badge variant="brand">ENTERPRISE SYSTEM GRAPH</Badge>
          </div>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', margin: '0.25rem 0 0' }}>
            Interactive technical architecture showcase: end-to-end execution flow from intent understanding through specialized MEDION agents to verified EHR synchronization.
          </p>
        </div>
      </div>

      {/* Visual Pipeline Stack */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {architectureLayers.map((layer, idx) => (
          <React.Fragment key={layer.step}>
            <div
              onMouseEnter={() => setActiveStep(layer.step)}
              onMouseLeave={() => setActiveStep(null)}
              style={{
                background: activeStep === layer.step ? 'var(--bg-surface-secondary)' : '#ffffff',
                border: '1px solid',
                borderColor: activeStep === layer.step ? layer.color : 'var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '1.25rem 1.5rem',
                boxShadow: activeStep === layer.step ? 'var(--shadow-md)' : 'var(--shadow-xs)',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <span
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: 4,
                      background: layer.color,
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                    }}
                  >
                    0{layer.step}
                  </span>
                  <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '0.02em' }}>
                    {layer.title}
                  </h4>
                </div>
                <Badge variant="neutral">Layer 0{layer.step}</Badge>
              </div>

              <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', margin: '0 0 0.5rem' }}>
                {layer.desc}
              </p>

              {/* Specialized Agents Subgrid */}
              {layer.isAgentGrid ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', marginTop: '0.75rem' }}>
                  {agents.map((ag) => (
                    <div
                      key={ag.name}
                      style={{
                        padding: '0.85rem',
                        borderRadius: 'var(--radius-sm)',
                        background: '#ffffff',
                        border: '1px solid var(--border-subtle)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.3rem',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: ag.color }} />
                        <span style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--text-primary)' }}>
                          {ag.name}
                        </span>
                      </div>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{ag.focus}</span>
                      <span
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.68rem',
                          color: 'var(--text-secondary)',
                          background: 'var(--bg-surface-secondary)',
                          padding: '0.2rem 0.4rem',
                          borderRadius: 3,
                          marginTop: '0.2rem',
                        }}
                      >
                        {ag.tasks}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  {layer.subtext}
                </div>
              )}
            </div>

            {idx < architectureLayers.length - 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', margin: '-0.35rem 0' }}>
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    background: 'var(--bg-surface-secondary)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--text-muted)',
                  }}
                >
                  <ArrowDown style={{ width: 12, height: 12 }} />
                </div>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
