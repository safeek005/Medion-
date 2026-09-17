import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowRight,
  Shield,
  Users,
  Stethoscope,
  Briefcase,
  Building,
  ChevronRight,
  HeartPulse,
  FileText,
  Database,
  ShieldCheck,
  Microscope,
  Calendar,
  Sparkles,
  Activity,
  Pill,
  BarChart3,
  Cpu,
  CheckCircle2,
  Lock,
  ArrowLeft,
  FlaskConical,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';

interface CoreAutomationItem {
  number: number;
  name: string;
  agent: string;
  desc: string;
}

interface CapabilityItem {
  title: string;
  desc: string;
  icon: React.ReactNode;
}

interface PortalConfig {
  id: string;
  roleName: string;
  title: string;
  subtitle: string;
  badge: string;
  accentColor: string;
  accentBg: string;
  icon: React.ReactNode;
  description: string;
  coreAutomations: CoreAutomationItem[];
  supportingCapabilities: CapabilityItem[];
  ctaText: string;
  targetPath: string;
}

const PORTAL_CONFIGS: Record<string, PortalConfig> = {
  patient: {
    id: 'patient',
    roleName: 'Patient Portal',
    title: 'Patient Health Portal',
    subtitle: 'Your personal health journey, simplified and secured.',
    badge: 'MEDION HEALTH • PATIENT PORTAL',
    accentColor: 'var(--teal-intelligent, #0d9488)',
    accentBg: 'rgba(13, 148, 136, 0.08)',
    icon: <HeartPulse style={{ width: 34, height: 34, color: 'var(--teal-intelligent, #0d9488)' }} />,
    description:
      'Welcome to the MEDION Patient Health Portal. Designed for patients and family caregivers, this secure environment provides unified access to your longitudinal medical records, direct appointment scheduling, verified diagnostic results, and instant insurance coverage intelligence—backed by MEDION’s autonomous clinical agent network.',
    coreAutomations: [
      {
        number: 1,
        name: 'Appointment Booking',
        agent: 'Appointment Agent',
        desc: 'Natural-language conversational scheduling with doctor slot matching, physician availability verification, and automated confirmation.',
      },
      {
        number: 2,
        name: 'Lab Report Explanation',
        agent: 'Medical Agent',
        desc: 'AI-driven clinical translation of laboratory parameters against reference ranges, providing clear, physician-grounded health interpretations.',
      },
      {
        number: 3,
        name: 'Insurance Coverage Check',
        agent: 'Insurance Agent',
        desc: 'Real-time policy validation, deductible tracking, copay calculation, and procedure pre-authorization verification before consultations.',
      },
    ],
    supportingCapabilities: [
      {
        title: 'Record Management',
        desc: 'Secure, isolated access to your complete Electronic Medical Record (EMR), historical vitals, and assigned primary care team.',
        icon: <FileText style={{ width: 20, height: 20, color: 'var(--teal-intelligent, #0d9488)' }} />,
      },
      {
        title: 'Smart Appointments',
        desc: 'View scheduled visits, check into upcoming consultations, review doctor notes, and manage cancellations with zero friction.',
        icon: <Calendar style={{ width: 20, height: 20, color: 'var(--teal-intelligent, #0d9488)' }} />,
      },
      {
        title: 'AI Health Assistant',
        desc: 'Ask MEDION provides safe, multi-turn clinical answers, medication adherence guidance, and dietary wellness advice.',
        icon: <Sparkles style={{ width: 20, height: 20, color: 'var(--teal-intelligent, #0d9488)' }} />,
      },
    ],
    ctaText: 'ENTER PATIENT WORKSPACE',
    targetPath: '/patient',
  },
  doctor: {
    id: 'doctor',
    roleName: 'Physician / Attending Specialist',
    title: 'Clinical Workspace',
    subtitle: 'Physician-centered clinical workflow with AI-driven diagnostic assistance.',
    badge: 'MEDION HEALTH • CLINICAL CARE',
    accentColor: 'var(--emerald-vibrant, #059669)',
    accentBg: 'rgba(5, 150, 105, 0.08)',
    icon: <Stethoscope style={{ width: 34, height: 34, color: 'var(--emerald-vibrant, #059669)' }} />,
    description:
      'The MEDION Clinical Workspace is an enterprise clinical operating system tailored for attending physicians, surgeons, and specialists. Review patient charts with AI summarization, generate safety-checked electronic prescriptions, and review diagnostic panels with instant anomaly flagging.',
    coreAutomations: [
      {
        number: 1,
        name: 'Clinical Summary Generation',
        agent: 'Medical Agent',
        desc: 'Automated synthesis of longitudinal patient records into high-density clinical summaries and active problem lists.',
      },
      {
        number: 2,
        name: 'Prescription Safety Validation',
        agent: 'Medical Agent',
        desc: 'Real-time drug-drug interaction screening, dosage sanity checks, and allergy contraindication prevention.',
      },
      {
        number: 3,
        name: 'Diagnostic Trend Analysis',
        agent: 'Medical Agent',
        desc: 'Longitudinal biomarker tracking across sequential lab orders with automated clinical alerting for rapid deterioration.',
      },
    ],
    supportingCapabilities: [
      {
        title: 'Patient Census Review',
        desc: 'Real-time inpatient census, scheduled outpatient clinic rosters, and rapid triage prioritization.',
        icon: <Users style={{ width: 20, height: 20, color: 'var(--emerald-vibrant, #059669)' }} />,
      },
      {
        title: 'Smart Prescribing (eRx)',
        desc: 'Instant pharmacological drafting with formulation guides, duration parameters, and pharmacy dispatch.',
        icon: <Pill style={{ width: 20, height: 20, color: 'var(--emerald-vibrant, #059669)' }} />,
      },
      {
        title: 'Clinical Scribe AI',
        desc: 'Convert complex clinical queries into structured documentation and review agent reasoning traces.',
        icon: <Sparkles style={{ width: 20, height: 20, color: 'var(--emerald-vibrant, #059669)' }} />,
      },
    ],
    ctaText: 'ENTER CLINICAL WORKSPACE',
    targetPath: '/doctor',
  },
  nurse: {
    id: 'nurse',
    roleName: 'Nursing Staff & Triage Coordinator',
    title: 'Nursing & Triage Operations',
    subtitle: 'Streamlining bedside triage, vitals recording, and medication administration.',
    badge: 'MEDION HEALTH • NURSING OPERATIONS',
    accentColor: 'var(--warning-amber, #d97706)',
    accentBg: 'rgba(217, 119, 6, 0.08)',
    icon: <Activity style={{ width: 34, height: 34, color: 'var(--warning-amber, #d97706)' }} />,
    description:
      'The MEDION Nursing Operations portal coordinates bedside clinical workflows, patient vital telemetry, shift handovers, and medication administration (eMAR). Empowering nursing teams with automated acuity scoring and immediate physician alerts.',
    coreAutomations: [
      {
        number: 1,
        name: 'Triage Acuity Scoring',
        agent: 'Nurse Agent',
        desc: 'Automated Early Warning Score (NEWS2) calculation based on entered vitals with threshold alerts to physicians.',
      },
      {
        number: 2,
        name: 'eMAR Medication Administration',
        agent: 'Nurse Agent',
        desc: 'Verification of scheduled medication doses against physician orders with bedside administration logging.',
      },
      {
        number: 3,
        name: 'Care Schedule Coordination',
        agent: 'Nurse Agent',
        desc: 'Automated shift task balancing, patient check-in notifications, and procedure prep checklists.',
      },
    ],
    supportingCapabilities: [
      {
        title: 'Real-Time Vitals Logging',
        desc: 'Rapid recording of blood pressure, SpO2, heart rate, temperature, and pain score with trend charts.',
        icon: <HeartPulse style={{ width: 20, height: 20, color: 'var(--warning-amber, #d97706)' }} />,
      },
      {
        title: 'Ward Patient Index',
        desc: 'Live ward bed occupancy view, assigned care levels, and isolation precautions.',
        icon: <Users style={{ width: 20, height: 20, color: 'var(--warning-amber, #d97706)' }} />,
      },
      {
        title: 'Ask MEDION Clinical Guides',
        desc: 'Instant bedside protocol retrieval for intravenous infusions, wound management, and post-op care.',
        icon: <Sparkles style={{ width: 20, height: 20, color: 'var(--warning-amber, #d97706)' }} />,
      },
    ],
    ctaText: 'ENTER NURSING WORKSPACE',
    targetPath: '/nurse',
  },
  laboratory: {
    id: 'lab',
    roleName: 'Diagnostic Laboratory & Pathology',
    title: 'Diagnostics & Laboratory',
    subtitle: 'High-throughput specimen accessioning, AI extraction, and clinical approvals.',
    badge: 'MEDION HEALTH • DIAGNOSTICS & LAB',
    accentColor: 'var(--ai-purple, #7c3aed)',
    accentBg: 'rgba(124, 58, 237, 0.08)',
    icon: <Microscope style={{ width: 34, height: 34, color: 'var(--ai-purple, #7c3aed)' }} />,
    description:
      'The MEDION Diagnostic Laboratory environment manages incoming specimen orders, analyzer results ingestion, automated AI OCR extraction, and pathologists review workflows—ensuring critical panic values reach physicians instantly.',
    coreAutomations: [
      {
        number: 1,
        name: 'Diagnostic Report Extraction',
        agent: 'Lab Agent',
        desc: 'AI-powered OCR and parameter parsing from raw hematology, biochemistry, and pathology analyzer feeds.',
      },
      {
        number: 2,
        name: 'Critical Value Flagging',
        agent: 'Lab Agent',
        desc: 'Immediate automated identification of life-threatening panic values with priority clinical routing.',
      },
      {
        number: 3,
        name: 'Physician Notification Dispatch',
        agent: 'Lab Agent',
        desc: 'Encrypted multi-channel dispatch of finalized diagnostic panels directly to ordering physicians.',
      },
    ],
    supportingCapabilities: [
      {
        title: 'Specimen Accessioning',
        desc: 'Sample barcode registration, tube type verification, and laboratory queue tracking.',
        icon: <Database style={{ width: 20, height: 20, color: 'var(--ai-purple, #7c3aed)' }} />,
      },
      {
        title: 'Diagnostic Panels Review',
        desc: 'Pathologist sign-off interface with reference range comparisons and re-run logs.',
        icon: <FlaskConical style={{ width: 20, height: 20, color: 'var(--ai-purple, #7c3aed)' }} />,
      },
      {
        title: 'Analyzer Audit Trail',
        desc: 'Quality control standards compliance, equipment calibration stamps, and operator signatures.',
        icon: <ShieldCheck style={{ width: 20, height: 20, color: 'var(--ai-purple, #7c3aed)' }} />,
      },
    ],
    ctaText: 'ENTER LABORATORY WORKSPACE',
    targetPath: '/laboratory',
  },
  insurance: {
    id: 'insurance',
    roleName: 'Payer Operations & Claims Officer',
    title: 'Insurance Operations & Claims',
    subtitle: 'Institutional claims adjudication, real-time eligibility, and settlement workflow.',
    badge: 'MEDION HEALTH • PAYER OPERATIONS',
    accentColor: 'var(--info-blue, #0284c7)',
    accentBg: 'rgba(2, 132, 199, 0.08)',
    icon: <Briefcase style={{ width: 34, height: 34, color: 'var(--info-blue, #0284c7)' }} />,
    description:
      'The MEDION Insurance & Payer Workspace is an institutional claims adjudication terminal for insurance desk officers and clearinghouse administrators. Review hospital claims, execute rules-based automated adjudications, verify coverage eligibility, and manage settlement variance.',
    coreAutomations: [
      {
        number: 1,
        name: 'Automated Claim Adjudication',
        agent: 'Insurance Agent',
        desc: 'Rules-based policy validation, ICD-10 medical necessity matching, and allowable benefit calculation.',
      },
      {
        number: 2,
        name: 'Pre-Authorization Processing',
        agent: 'Insurance Agent',
        desc: 'Evaluation of surgical and high-cost pharmaceutical pre-auth requests against policy exclusions.',
      },
      {
        number: 3,
        name: 'Settlement Reconciliation',
        agent: 'Insurance Agent',
        desc: 'Automated hospital remittance tracking, copay variance adjustments, and payout status updates.',
      },
    ],
    supportingCapabilities: [
      {
        title: 'Enrolled Member Policies',
        desc: 'Master registry of active insurance policies, covered family members, and annual deductibles.',
        icon: <FileText style={{ width: 20, height: 20, color: 'var(--info-blue, #0284c7)' }} />,
      },
      {
        title: 'Hospital Claims Queue',
        desc: 'Incoming claims desk with automated risk scoring, documentation check, and settlement action bar.',
        icon: <ShieldCheck style={{ width: 20, height: 20, color: 'var(--info-blue, #0284c7)' }} />,
      },
      {
        title: 'Financial Audit Ledger',
        desc: 'Immutable transaction history of claim decisions, approval timestamps, and officer IDs.',
        icon: <Database style={{ width: 20, height: 20, color: 'var(--info-blue, #0284c7)' }} />,
      },
    ],
    ctaText: 'ENTER INSURANCE WORKSPACE',
    targetPath: '/insurance',
  },
  hospital: {
    id: 'hospital',
    roleName: 'Hospital Administrator / Medical Director',
    title: 'Hospital Command Center',
    subtitle: 'Executive oversight, resource allocation, and institutional security governance.',
    badge: 'MEDION HEALTH • EXECUTIVE COMMAND',
    accentColor: 'var(--forest-brand, #0d9488)',
    accentBg: 'rgba(13, 148, 136, 0.08)',
    icon: <Building style={{ width: 34, height: 34, color: 'var(--forest-brand, #0d9488)' }} />,
    description:
      'The MEDION Hospital Command Center provides executive leadership and hospital administrators with top-level operational intelligence. Monitor institution-wide patient throughput, bed capacity forecasts, medical staff utilization, and live security telemetry across all departments.',
    coreAutomations: [
      {
        number: 1,
        name: 'Bed Capacity & Census Forecasting',
        agent: 'Admin Agent',
        desc: 'Departmental occupancy forecasting based on admission and discharge trend modeling.',
      },
      {
        number: 2,
        name: 'Security & Access Audit Telemetry',
        agent: 'Admin Agent',
        desc: 'Continuous surveillance of cross-role security boundaries and cryptographic audit log verification.',
      },
      {
        number: 3,
        name: 'Multi-Agent Pipeline Monitoring',
        agent: 'Admin Agent',
        desc: 'Real-time health monitoring of all autonomous core agents and external integration endpoints.',
      },
    ],
    supportingCapabilities: [
      {
        title: 'Institutional Census',
        desc: 'Aggregated inpatient and outpatient census across all clinical wings and specialized ICUs.',
        icon: <Users style={{ width: 20, height: 20, color: 'var(--forest-brand, #0d9488)' }} />,
      },
      {
        title: 'Throughput Analytics',
        desc: 'Average length of stay, readmission metrics, doctor utilization, and departmental KPI boards.',
        icon: <BarChart3 style={{ width: 20, height: 20, color: 'var(--forest-brand, #0d9488)' }} />,
      },
      {
        title: 'SNS Trace Architecture',
        desc: 'Live visual inspection drawer displaying distributed multi-agent execution steps and timings.',
        icon: <Cpu style={{ width: 20, height: 20, color: 'var(--forest-brand, #0d9488)' }} />,
      },
    ],
    ctaText: 'ENTER COMMAND CENTER',
    targetPath: '/hospital',
  },
  receptionist: {
    id: 'receptionist',
    roleName: 'Front Desk & Patient Intake Coordinator',
    title: 'Receptionist Workspace',
    subtitle: 'Streamlining patient registration, appointment scheduling, and front desk operations.',
    badge: 'MEDION HEALTH • FRONT DESK OPERATIONS',
    accentColor: 'var(--teal-intelligent, #0d9488)',
    accentBg: 'rgba(13, 148, 136, 0.08)',
    icon: <Users style={{ width: 34, height: 34, color: 'var(--teal-intelligent, #0d9488)' }} />,
    description:
      'The MEDION Receptionist Workspace coordinates patient intake, appointment scheduling, physician availability rosters, and front-desk check-in workflows powered by autonomous AI assistants.',
    coreAutomations: [
      {
        number: 1,
        name: 'Patient Intake & Document OCR',
        agent: 'Receptionist Agent',
        desc: 'Automated document processing and patient profile creation with multi-field identity verification.',
      },
      {
        number: 2,
        name: 'Appointment Scheduling',
        agent: 'Appointment Agent',
        desc: 'Real-time multi-physician schedule matching, slot reservation, and instant cross-portal synchronization.',
      },
      {
        number: 3,
        name: 'Front Desk AI Operations',
        agent: 'Receptionist Agent',
        desc: 'Conversational assistant for rapid patient lookup, clinic queue management, and visit check-ins.',
      },
    ],
    supportingCapabilities: [
      {
        title: 'Patient Roster & Index',
        desc: 'Unified patient index with instant search, identity verification, and registration status.',
        icon: <Users style={{ width: 20, height: 20, color: 'var(--teal-intelligent, #0d9488)' }} />,
      },
      {
        title: 'Clinic Calendar & Scheduling',
        desc: 'Master scheduling view across all attending doctors, time slots, and specialty departments.',
        icon: <Calendar style={{ width: 20, height: 20, color: 'var(--teal-intelligent, #0d9488)' }} />,
      },
      {
        title: 'Ask MEDION Front Desk',
        desc: 'AI command center for scheduling visits, patient lookups, and clinic workflow automation.',
        icon: <Sparkles style={{ width: 20, height: 20, color: 'var(--teal-intelligent, #0d9488)' }} />,
      },
    ],
    ctaText: 'ENTER RECEPTIONIST WORKSPACE',
    targetPath: '/receptionist',
  },
};

// Aliases for route mapping
PORTAL_CONFIGS['lab'] = PORTAL_CONFIGS['laboratory'];

export const PortalLandingPage: React.FC = () => {
  const { role } = useParams<{ role: string }>();
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [role]);

  const configKey = (role || 'patient').toLowerCase().trim();
  const config = PORTAL_CONFIGS[configKey] || PORTAL_CONFIGS['patient'];

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--bg-app, #f8fafc)',
        color: 'var(--text-primary, #0f172a)',
        fontFamily: 'var(--font-sans)',
        display: 'flex',
        flexDirection: 'column',
        opacity: isVisible ? 1 : 0,
        transition: 'opacity 0.25s ease-out',
      }}
    >
      {/* ========================================================================= */}
      {/* 1. TOP INSTITUTIONAL HEADER BAR                                           */}
      {/* ========================================================================= */}
      <header
        style={{
          height: 68,
          background: 'rgba(255, 255, 255, 0.94)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: '1px solid var(--border-subtle, #e2e8f0)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 2.5rem',
          position: 'sticky',
          top: 0,
          zIndex: 40,
        }}
      >
        <div
          onClick={() => navigate('/')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.85rem',
            cursor: 'pointer',
          }}
        >
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 'var(--radius-md, 8px)',
              background: 'linear-gradient(135deg, var(--forest-brand, #0d9488) 0%, #07382d 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: 'var(--shadow-sm, 0 1px 3px rgba(15,23,42,0.06))',
              border: '1px solid rgba(13, 148, 136, 0.3)',
            }}
          >
            <HeartPulse style={{ width: 20, height: 20, color: 'var(--mint-accent, #5eead4)' }} />
          </div>
          <div>
            <div
              style={{
                fontSize: '1.25rem',
                fontWeight: 800,
                letterSpacing: '-0.035em',
                color: 'var(--text-primary, #0f172a)',
                lineHeight: 1.15,
              }}
            >
              MEDION <span style={{ color: 'var(--forest-brand, #0d9488)', fontWeight: 600 }}>HEALTH</span>
            </div>
            <div
              style={{
                fontSize: '0.68rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'var(--text-muted, #64748b)',
              }}
            >
              Enterprise Autonomous Operating System
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: config.accentColor,
              background: config.accentBg,
              padding: '0.35rem 0.85rem',
              borderRadius: 'var(--radius-full, 9999px)',
              border: `1px solid ${config.accentColor}33`,
            }}
          >
            {config.badge}
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/login')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
          >
            Switch Role
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
          >
            All Portals
          </Button>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. HERO PRESENTATION SECTION                                              */}
      {/* ========================================================================= */}
      <section
        style={{
          background: `linear-gradient(180deg, ${config.accentBg} 0%, rgba(255,255,255,0) 100%), var(--bg-app, #f8fafc)`,
          padding: '4rem 2rem 3.5rem',
          borderBottom: '1px solid var(--border-subtle, #e2e8f0)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          position: 'relative',
        }}
      >
        <div style={{ maxWidth: 860, margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {/* Emblem Icon */}
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 'var(--radius-xl, 16px)',
              background: '#ffffff',
              border: '1px solid var(--border-subtle, #e2e8f0)',
              boxShadow: 'var(--shadow-md, 0 4px 12px -2px rgba(15,23,42,0.08))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.5rem',
            }}
          >
            {config.icon}
          </div>

          {/* Kicker */}
          <div
            style={{
              fontSize: '0.78rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: config.accentColor,
              marginBottom: '0.65rem',
            }}
          >
            {config.badge}
          </div>

          {/* Main Display Title */}
          <h1
            style={{
              fontSize: '3rem',
              fontWeight: 800,
              letterSpacing: '-0.04em',
              lineHeight: 1.15,
              color: 'var(--text-primary, #0f172a)',
              margin: '0 0 1rem 0',
            }}
          >
            {config.title}
          </h1>

          {/* Subtitle */}
          <p
            style={{
              fontSize: '1.25rem',
              fontWeight: 400,
              lineHeight: 1.6,
              color: 'var(--text-secondary, #334155)',
              margin: '0 0 2rem 0',
              maxWidth: 680,
            }}
          >
            {config.subtitle}
          </p>

          {/* Primary CTA Button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              className="btn-ui"
              onClick={() => navigate(config.targetPath)}
              style={{
                backgroundColor: config.accentColor,
                color: '#ffffff',
                padding: '0.85rem 2rem',
                fontSize: '1.02rem',
                fontWeight: 600,
                borderRadius: 'var(--radius-md, 8px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 4px 14px rgba(15, 23, 42, 0.12)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.75rem',
                cursor: 'pointer',
                transition: 'all 0.18s ease',
              }}
            >
              {config.ctaText}
              <ArrowRight style={{ width: 18, height: 18 }} />
            </button>

            <button
              className="btn-ui btn-secondary-ui"
              onClick={() => navigate('/login')}
              style={{
                padding: '0.85rem 1.6rem',
                fontSize: '0.94rem',
                fontWeight: 500,
                borderRadius: 'var(--radius-md, 8px)',
              }}
            >
              Switch Account
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. ARCHITECTURAL CONTENT GRID (ABOUT + AUTOMATIONS + CAPABILITIES)        */}
      {/* ========================================================================= */}
      <main
        style={{
          flex: 1,
          maxWidth: 1200,
          width: '100%',
          margin: '0 auto',
          padding: '3.5rem 2rem 5rem',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
            gap: '2.5rem',
            alignItems: 'start',
          }}
        >
          {/* ===================================================================== */}
          {/* LEFT COLUMN: ABOUT THIS PORTAL + 3 CORE AUTOMATIONS                   */}
          {/* ===================================================================== */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* About Card */}
            <div
              style={{
                background: 'var(--bg-surface, #ffffff)',
                border: '1px solid var(--border-subtle, #e2e8f0)',
                borderRadius: 'var(--radius-xl, 16px)',
                padding: '2rem',
                boxShadow: 'var(--shadow-sm, 0 1px 3px rgba(15,23,42,0.06))',
              }}
            >
              <div
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: 'var(--text-muted, #64748b)',
                  marginBottom: '0.4rem',
                }}
              >
                Architecture & Scope
              </div>
              <h2
                style={{
                  fontSize: '1.45rem',
                  fontWeight: 700,
                  color: 'var(--text-primary, #0f172a)',
                  letterSpacing: '-0.025em',
                  margin: '0 0 1rem 0',
                }}
              >
                About This Portal
              </h2>
              <p
                style={{
                  fontSize: '0.94rem',
                  lineHeight: 1.65,
                  color: 'var(--text-secondary, #334155)',
                  margin: 0,
                }}
              >
                {config.description}
              </p>
            </div>

            {/* Core Automations Card */}
            <div
              style={{
                background: 'var(--bg-surface, #ffffff)',
                border: '1px solid var(--border-subtle, #e2e8f0)',
                borderRadius: 'var(--radius-xl, 16px)',
                padding: '2rem',
                boxShadow: 'var(--shadow-sm, 0 1px 3px rgba(15,23,42,0.06))',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <div>
                  <div
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      color: config.accentColor,
                    }}
                  >
                    Phase 1 Implementation
                  </div>
                  <h3
                    style={{
                      fontSize: '1.25rem',
                      fontWeight: 700,
                      color: 'var(--text-primary, #0f172a)',
                      letterSpacing: '-0.02em',
                      margin: '0.2rem 0 0 0',
                    }}
                  >
                    Core Automations
                  </h3>
                </div>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: config.accentColor,
                    background: config.accentBg,
                    padding: '0.3rem 0.65rem',
                    borderRadius: 'var(--radius-sm, 6px)',
                  }}
                >
                  <Sparkles style={{ width: 14, height: 14 }} /> Autonomous
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {config.coreAutomations.map((auto) => (
                  <div
                    key={auto.number}
                    style={{
                      padding: '1.15rem',
                      borderRadius: 'var(--radius-lg, 12px)',
                      background: 'var(--bg-surface-secondary, #f1f5f9)',
                      border: '1px solid var(--border-subtle, #e2e8f0)',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.95rem',
                    }}
                  >
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 'var(--radius-full, 9999px)',
                        background: config.accentColor,
                        color: '#ffffff',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        marginTop: 2,
                      }}
                    >
                      {auto.number}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <div style={{ fontSize: '0.94rem', fontWeight: 700, color: 'var(--text-primary, #0f172a)' }}>
                          {auto.name}
                        </div>
                        <span
                          style={{
                            fontSize: '0.7rem',
                            fontWeight: 600,
                            fontFamily: 'var(--font-mono)',
                            color: 'var(--text-muted, #64748b)',
                            background: '#ffffff',
                            padding: '0.15rem 0.5rem',
                            borderRadius: 4,
                            border: '1px solid var(--border-subtle, #e2e8f0)',
                          }}
                        >
                          {auto.agent}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary, #334155)', lineHeight: 1.5, marginTop: '0.35rem' }}>
                        {auto.desc}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ===================================================================== */}
          {/* RIGHT COLUMN: SUPPORTING CAPABILITIES + SECURITY ASSURANCE           */}
          {/* ===================================================================== */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Supporting Capabilities Panel */}
            <div
              style={{
                background: 'var(--bg-surface, #ffffff)',
                border: '1px solid var(--border-subtle, #e2e8f0)',
                borderRadius: 'var(--radius-xl, 16px)',
                padding: '2rem',
                boxShadow: 'var(--shadow-sm, 0 1px 3px rgba(15,23,42,0.06))',
              }}
            >
              <div
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: 'var(--text-muted, #64748b)',
                  marginBottom: '0.4rem',
                }}
              >
                Platform Ecosystem
              </div>
              <h3
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  color: 'var(--text-primary, #0f172a)',
                  letterSpacing: '-0.02em',
                  margin: '0 0 1.25rem 0',
                }}
              >
                Supporting Capabilities
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {config.supportingCapabilities.map((cap, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '1.15rem',
                      borderRadius: 'var(--radius-lg, 12px)',
                      border: '1px solid var(--border-subtle, #e2e8f0)',
                      background: '#ffffff',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.95rem',
                      transition: 'border-color 0.15s ease',
                    }}
                  >
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 'var(--radius-md, 8px)',
                        background: config.accentBg,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {cap.icon}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.94rem', fontWeight: 700, color: 'var(--text-primary, #0f172a)' }}>
                        {cap.title}
                      </div>
                      <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary, #334155)', lineHeight: 1.5, marginTop: '0.25rem' }}>
                        {cap.desc}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Enterprise Security Box */}
            <div
              style={{
                background: 'var(--navy-midnight, #0f172a)',
                color: '#ffffff',
                borderRadius: 'var(--radius-xl, 16px)',
                padding: '2rem',
                boxShadow: 'var(--shadow-md, 0 4px 12px -2px rgba(15,23,42,0.08))',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.85rem' }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 'var(--radius-md, 8px)',
                    background: 'rgba(13, 148, 136, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--mint-accent, #5eead4)',
                  }}
                >
                  <ShieldCheck style={{ width: 18, height: 18 }} />
                </div>
                <div style={{ fontSize: '0.94rem', fontWeight: 700, color: '#ffffff' }}>
                  Enterprise Role & Data Isolation
                </div>
              </div>

              <p style={{ fontSize: '0.82rem', lineHeight: 1.6, color: 'rgba(255, 255, 255, 0.75)', margin: '0 0 1.25rem 0' }}>
                MEDION enforces cryptographic session isolation and server-side Role-Based Access Control (RBAC). Patient sessions are strictly isolated to their own authenticated health records, while administrative queues and clinical workspaces require institutional privileges.
              </p>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1.25rem',
                  fontSize: '0.74rem',
                  color: 'var(--mint-accent, #5eead4)',
                  fontWeight: 600,
                  flexWrap: 'wrap',
                }}
              >
                <span>✓ Zero Cross-Patient Data Leakage</span>
                <span>✓ HTTP 403 Route Interception</span>
                <span>✓ HIPAA / GDPR Guardrails</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ========================================================================= */}
      {/* 4. FOOTER                                                                 */}
      {/* ========================================================================= */}
      <footer
        style={{
          borderTop: '1px solid var(--border-subtle, #e2e8f0)',
          background: 'var(--bg-surface, #ffffff)',
          padding: '1.75rem 2.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          fontSize: '0.8rem',
          color: 'var(--text-muted, #64748b)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontWeight: 700, color: 'var(--text-primary, #0f172a)' }}>MEDION AGENT</span>
          <span>•</span>
          <span>Healthcare Autonomous Agent Architecture</span>
          <span>•</span>
          <span>v2.4.0 Phase 1</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <span style={{ cursor: 'pointer' }} onClick={() => navigate('/portal-info/patient')}>Patient Portal</span>
          <span style={{ cursor: 'pointer' }} onClick={() => navigate('/portal-info/doctor')}>Clinical</span>
          <span style={{ cursor: 'pointer' }} onClick={() => navigate('/portal-info/nurse')}>Nursing</span>
          <span style={{ cursor: 'pointer' }} onClick={() => navigate('/portal-info/laboratory')}>Laboratory</span>
          <span style={{ cursor: 'pointer' }} onClick={() => navigate('/portal-info/insurance')}>Insurance</span>
          <span style={{ cursor: 'pointer' }} onClick={() => navigate('/portal-info/hospital')}>Hospital Admin</span>
        </div>
      </footer>
    </div>
  );
};

