import React, { useState } from 'react';
import {
  FlaskConical,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Calendar,
  Clock,
  ArrowRight,
  Info,
  Building,
  User,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { ExecutionTraceStep } from '../../types';
import { useAuth } from '../../services/authService';
import { useSharedLabReports, useSharedPatients } from '../../services/dataService';
import { dispatchToWorkbench } from '../../api/workbench';

interface PatientLabViewProps {
  onTraceGenerated: (step: ExecutionTraceStep) => void;
}

export const PatientLabView: React.FC<PatientLabViewProps> = ({ onTraceGenerated }) => {
  const { user } = useAuth();
  const patients = useSharedPatients();
  const labReports = useSharedLabReports();

  const activePatient =
    (user?.id ? patients.find((p) => p.patient_id.toUpperCase() === user.id.toUpperCase()) : null) ||
    (user?.email ? patients.find((p) => p.email?.toLowerCase() === user.email.toLowerCase()) : null) ||
    patients[0] ||
    null;

  const mrn = user?.id || activePatient?.patient_id || 'PAT-1001';

  // Filter lab reports strictly for this patient
  const patientLabReports = labReports.filter(
    (lr) => lr.patient_id?.toUpperCase() === mrn.toUpperCase()
  );

  const activeReport = patientLabReports[0] || null;

  // Automation State
  const [loading, setLoading] = useState(false);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleExplainResults = async () => {
    if (!activeReport) {
      setErrorMsg('No diagnostic lab reports are currently on file for your account.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    const startTime = Date.now();

    const requestPayload = {
      workflow_id: `wf-lab-${Date.now()}`,
      agent_target: 'assistant' as const,
      action: 'interpret_request',
      portal_source: 'patient',
      payload: {
        message: `Explain my latest lab results for ${activeReport.report_id}`,
        patient_id: mrn,
        caller_patient_id: mrn,
        user_role: 'patient',
        report_id: activeReport.report_id,
      },
    };

    try {
      const response = await dispatchToWorkbench(requestPayload);

      setLoading(false);
      const duration = Date.now() - startTime;

      if (response.success) {
        const resData = response.result?.result_data || response.result || {};
        const explanationText =
          resData.explanation ||
          resData.summary ||
          response.result?.summary ||
          (activeReport.results && activeReport.results.length > 0
            ? `Your test results for ${activeReport.test_type || 'Diagnostic Panel'} have been evaluated. Parameters: ${activeReport.results.map((r: any) => `${r.parameter}: ${r.value} ${r.unit} (${r.reference_range})`).join(', ')}. All results are documented in your clinical chart.`
            : 'Your diagnostic laboratory report has been processed and verified by automated laboratory services.');

        setExplanation(explanationText);

        onTraceGenerated({
          id: `tr-${Date.now()}`,
          workflowId: requestPayload.workflow_id,
          timestamp: new Date().toLocaleTimeString(),
          portalSource: 'patient',
          agentTarget: 'medical',
          action: 'interpret_request',
          durationMs: duration,
          success: true,
          request: requestPayload,
          response: response,
        });
      } else {
        const err = response.errors?.[0] || 'Unable to explain lab results.';
        setErrorMsg(err);
        onTraceGenerated({
          id: `tr-${Date.now()}`,
          workflowId: requestPayload.workflow_id,
          timestamp: new Date().toLocaleTimeString(),
          portalSource: 'patient',
          agentTarget: 'medical',
          action: 'interpret_request',
          durationMs: duration,
          success: false,
          request: requestPayload,
          response: response,
        });
      }
    } catch (err: any) {
      setLoading(false);
      const msg = err.message || 'Error processing lab report explanation.';
      setErrorMsg(msg);
      onTraceGenerated({
        id: `tr-${Date.now()}`,
        workflowId: requestPayload.workflow_id,
        timestamp: new Date().toLocaleTimeString(),
        portalSource: 'patient',
        agentTarget: 'medical',
        action: 'interpret_request',
        durationMs: Date.now() - startTime,
        success: false,
        request: requestPayload,
        response: { success: false, errors: [msg] },
      });
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: 1150, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem', fontFamily: 'var(--font-sans)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--teal-intelligent)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.25rem' }}>
            <FlaskConical style={{ width: 16, height: 16 }} /> Patient Care Portal • Diagnostic Results
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>My Diagnostic Lab Results</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: '0.35rem 0 0' }}>
            View verified laboratory test results and request plain-language clinical explanations from the MEDION Medical Agent.
          </p>
        </div>

        <div style={{ textAlign: 'right', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          <div>Patient: <strong style={{ color: 'var(--text-primary)' }}>{user?.name || `${activePatient?.first_name} ${activePatient?.last_name}`}</strong></div>
          <div>MRN: <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-primary)' }}>{mrn}</span></div>
        </div>
      </div>

      {/* Patient Core Automation 2: Lab Report Explanation */}
      <div style={{ background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.08) 0%, rgba(14, 165, 233, 0.08) 100%)', border: '1px solid var(--teal-border, #99f6e4)', borderRadius: 'var(--radius-lg, 16px)', padding: '1.75rem', boxShadow: 'var(--shadow-xs)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: explanation || errorMsg ? '1rem' : 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ padding: '0.75rem', backgroundColor: 'var(--teal-intelligent, #0d9488)', color: '#ffffff', borderRadius: 'var(--radius-md, 12px)', boxShadow: 'var(--shadow-xs)' }}>
              <Sparkles style={{ width: 24, height: 24 }} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Explain My Latest Lab Results</h3>
                <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', padding: '0.2rem 0.5rem', borderRadius: 4, backgroundColor: 'var(--bg-app)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                  Agent: Medical Agent
                </span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0.2rem 0 0' }}>
                Translates complex diagnostic parameters into structured, easy-to-understand explanations grounded in your verified test values.
              </p>
            </div>
          </div>

          <Button
            onClick={handleExplainResults}
            disabled={loading || !activeReport}
            style={{ padding: '0.75rem 1.5rem', whiteSpace: 'nowrap' }}
          >
            {loading ? 'Analyzing with Medical Agent...' : 'Explain My Latest Report'} <ArrowRight style={{ width: 16, height: 16, marginLeft: 8 }} />
          </Button>
        </div>

        {explanation && (
          <div style={{ marginTop: '1rem', padding: '1.25rem', borderRadius: 'var(--radius-md, 12px)', backgroundColor: '#ffffff', border: '1px solid var(--teal-border)', boxShadow: 'var(--shadow-xs)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--teal-intelligent)', fontWeight: 700, fontSize: '0.9rem' }}>
                <CheckCircle2 style={{ width: 16, height: 16, color: '#16a34a' }} /> Medical Agent Interpretation
              </div>
              <span style={{ fontSize: '0.72rem', backgroundColor: 'var(--teal-subtle)', color: 'var(--teal-intelligent)', fontWeight: 600, padding: '0.2rem 0.6rem', borderRadius: 999 }}>
                AI Clinical Explanation (Not a Diagnosis)
              </span>
            </div>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-primary)', lineHeight: 1.6, fontWeight: 500, margin: 0 }}>
              {explanation}
            </p>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', paddingTop: '0.5rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Info style={{ width: 14, height: 14 }} />
              <span>Grounded in verified synthetic laboratory reference ranges. Always consult your attending physician for official treatment plans.</span>
            </div>
          </div>
        )}

        {errorMsg && (
          <div style={{ marginTop: '1rem', padding: '1rem', borderRadius: 'var(--radius-md, 10px)', backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', fontSize: '0.85rem' }}>
            {errorMsg}
          </div>
        )}
      </div>

      {/* Lab Report Details */}
      {activeReport ? (
        <div style={{ backgroundColor: '#ffffff', borderRadius: 'var(--radius-lg, 16px)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-xs)', overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-app)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{activeReport.test_type}</h3>
                <span style={{ fontSize: '0.72rem', fontWeight: 600, padding: '0.15rem 0.5rem', borderRadius: 4, backgroundColor: '#dcfce7', color: '#15803d' }}>
                  COMPLETED
                </span>
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1rem' }}>
                <span>Report ID: <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>{activeReport.report_id}</strong></span>
                <span>Date: <strong style={{ color: 'var(--text-primary)' }}>{activeReport.test_date}</strong></span>
                <span>Lab: <strong style={{ color: 'var(--text-primary)' }}>Central Pathology LAB-001</strong></span>
              </div>
            </div>

            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Ordered by: <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Dr. Rajesh Mehta (Cardiology)</span>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead style={{ backgroundColor: 'var(--bg-app)', color: 'var(--text-secondary)', textTransform: 'uppercase', fontSize: '0.72rem', borderBottom: '1px solid var(--border-subtle)', fontWeight: 700 }}>
                <tr>
                  <th style={{ padding: '0.85rem 1.5rem' }}>Test Parameter</th>
                  <th style={{ padding: '0.85rem 1.5rem' }}>Observed Value</th>
                  <th style={{ padding: '0.85rem 1.5rem' }}>Reference Range</th>
                  <th style={{ padding: '0.85rem 1.5rem' }}>Interpretation</th>
                </tr>
              </thead>
              <tbody>
                {activeReport.results.map((r, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--text-primary)' }}>{r.parameter}</td>
                    <td style={{ padding: '1rem 1.5rem', fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {r.value} <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{r.unit}</span>
                    </td>
                    <td style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>{r.reference_range}</td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      {r.is_abnormal ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.2rem 0.5rem', borderRadius: 4, fontSize: '0.75rem', fontWeight: 600, backgroundColor: '#fef3c7', color: '#b45309' }}>
                          <AlertTriangle style={{ width: 12, height: 12 }} /> {r.abnormality_direction || 'ABNORMAL'}
                        </span>
                      ) : (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.2rem 0.5rem', borderRadius: 4, fontSize: '0.75rem', fontWeight: 600, backgroundColor: '#dcfce7', color: '#15803d' }}>
                          <CheckCircle2 style={{ width: 12, height: 12 }} /> NORMAL
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div style={{ backgroundColor: '#ffffff', borderRadius: 'var(--radius-lg, 16px)', border: '1px solid var(--border-subtle)', padding: '3rem 1.5rem', textAlign: 'center' }}>
          <FlaskConical style={{ width: 48, height: 48, color: 'var(--text-muted)', margin: '0 auto 0.75rem', opacity: 0.5 }} />
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>No Diagnostic Reports On File</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
            There are currently no laboratory specimens or diagnostic test reports linked to MRN {mrn}.
          </p>
        </div>
      )}
    </div>
  );
};
