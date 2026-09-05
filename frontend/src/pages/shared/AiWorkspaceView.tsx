import React, { useState } from 'react';
import { UserRole, ExecutionTraceStep } from '../../types';
import { Sparkles, ArrowRight, Code } from 'lucide-react';
import { dispatchToWorkbench } from '../../api/workbench';
import { Button } from '../../components/ui/Button';

interface AiWorkspaceViewProps {
  role: UserRole;
  onTraceGenerated: (step: ExecutionTraceStep) => void;
  onOpenTraceDrawer: () => void;
}

export const AiWorkspaceView: React.FC<AiWorkspaceViewProps> = ({ role, onTraceGenerated, onOpenTraceDrawer }) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<string | null>(null);
  const [response, setResponse] = useState<any>(null);

  const samplePrompts = [
    "Analyze Arun Kumar's latest laboratory report (LABR-1001)",
    "Compare LABR-1002 with previous LABR-1001 for patient PAT-1001",
    "Verify insurance eligibility for policy POL-701",
    "Check available cardiology appointment slots for Dr. Rajesh Mehta on 2024-09-10",
    "Explain lab results for LABR-1001 in patient-friendly terms",
  ];

  const handleExecute = async (promptText: string) => {
    setQuery(promptText);
    setLoading(true);
    setResponse(null);
    setCurrentStep('Dispatching query to Master Orchestrator via SNS Workbench Webhook...');

    const requestPayload = {
      portal_source: role,
      message: promptText,
      user_role: role,
    };

    const startTime = performance.now();
    const res = await dispatchToWorkbench(requestPayload);
    const duration = Math.round(performance.now() - startTime);

    setLoading(false);
    setCurrentStep('Analysis Complete');
    setResponse(res);

    onTraceGenerated({
      id: `TR-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toLocaleTimeString(),
      workflowId: res.workflow_id || `WF-${role.toUpperCase()}-${Date.now().toString().slice(-3)}`,
      portalSource: role,
      agentTarget: res.target_agent || 'master_orchestrator',
      action: res.action_performed || 'natural_language_query',
      durationMs: duration,
      success: res.success !== false,
      request: requestPayload,
      response: res,
    });
  };

  return (
    <div style={{ padding: '2rem', maxWidth: 1050, margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <div className="badge-ui badge-green" style={{ marginBottom: '0.75rem' }}>
          <Sparkles style={{ width: 14, height: 14 }} /> MEDION Intelligence Center
        </div>
        <h2 className="h2" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Ask MEDION</h2>
        <p className="text-muted" style={{ fontSize: '0.9rem', maxWidth: 650, margin: '0 auto' }}>
          Orchestrated healthcare intelligence engine powered by 5 specialized core agents and SNS Workbench.
        </p>
      </div>

      <div className="section-panel">
        <form onSubmit={(e) => { e.preventDefault(); if (query.trim()) handleExecute(query); }}>
          <div className="command-input-container" style={{ padding: '0.75rem 1rem' }}>
            <Sparkles style={{ width: 20, height: 20, color: 'var(--forest-green)' }} />
            <input
              type="text"
              className="command-input"
              style={{ fontSize: '0.95rem' }}
              placeholder="Ask MEDION any clinical, administrative, or operational question..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button type="submit" className="btn-ui btn-primary-ui" disabled={loading} style={{ padding: '0.55rem 1.25rem' }}>
              {loading ? 'Processing...' : 'Run Query'} <ArrowRight style={{ width: 16, height: 16 }} />
            </button>
          </div>
        </form>

        <div style={{ marginTop: '1.25rem' }}>
          <div className="text-muted" style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.5rem' }}>
            Suggested Queries
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {samplePrompts.map((p, i) => (
              <button
                key={i}
                onClick={() => handleExecute(p)}
                className="btn-ui btn-secondary-ui"
                style={{ fontSize: '0.78rem', padding: '0.4rem 0.75rem' }}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading && (
        <div className="section-panel" style={{ textAlign: 'center', color: 'var(--forest-green)' }}>
          <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', background: 'var(--forest-green)', animation: 'pulse 1.5s infinite', marginRight: 8 }}></span>
          <span>{currentStep}</span>
        </div>
      )}

      {response && !loading && (
        <div className="section-panel">
          <div className="section-header">
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--forest-green)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                MEDION Insight • {response.target_agent || 'Master Orchestrator'}
              </span>
            </div>
            <Button variant="ghost" size="sm" onClick={onOpenTraceDrawer} style={{ fontSize: '0.75rem' }}>
              <Code style={{ width: 14, height: 14 }} /> View Execution Architecture
            </Button>
          </div>

          <div style={{ fontSize: '0.9rem', lineHeight: 1.6, color: 'var(--text-primary)', whiteSpace: 'pre-wrap', marginBottom: '1.25rem' }}>
            {typeof response.result === 'string' ? response.result : response.output?.summary || JSON.stringify(response.result || response, null, 2)}
          </div>

          <details style={{ background: 'var(--bg-app)', padding: '0.75rem', borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
            <summary style={{ cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)' }}>View Raw JSON Payload</summary>
            <pre style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', marginTop: '0.5rem', overflowX: 'auto' }}>
              {JSON.stringify(response, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
};
