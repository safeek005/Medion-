import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Sparkles, ArrowRight, Code } from 'lucide-react';
import { executeAssistantAction } from '../../api/medionApi';
import { UserRole, WorkbenchResponse, ExecutionTraceStep, WorkbenchRequest } from '../../types';
import { HumanResponseRenderer } from './HumanResponseRenderer';

interface AskMedionCommandProps {
  role: UserRole;
  onTraceGenerated: (step: ExecutionTraceStep) => void;
  onOpenTraceDrawer: () => void;
}

export const AskMedionCommand: React.FC<AskMedionCommandProps> = ({ role, onTraceGenerated, onOpenTraceDrawer }) => {
  const location = useLocation();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<string | null>(null);
  const [lastResponse, setLastResponse] = useState<WorkbenchResponse | null>(null);

  // Extract contextual patient_id or claim_id from current route path
  const getRouteContext = (): Record<string, any> => {
    const context: Record<string, any> = {};
    const parts = location.pathname.split('/').filter(Boolean);

    // If viewing patient profile (e.g. /doctor/patients/PAT-1001)
    if (parts.length >= 3 && parts[1] === 'patients') {
      context.patient_id = parts[2];
    } else {
      context.patient_id = 'PAT-1001'; // Default active patient context for demo
    }

    return context;
  };

  const executePrompt = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    setQuery(textToSend);
    setLoading(true);
    setCurrentStep('Understanding your request and preparing response...');
    setLastResponse(null);

    const routeContext = getRouteContext();
    const startTime = performance.now();

    const response = await executeAssistantAction(textToSend, role, routeContext);
    const durationMs = Math.round(performance.now() - startTime);

    setLoading(false);
    setCurrentStep('Analysis Complete');
    setLastResponse(response);

    const traceStep: ExecutionTraceStep = {
      id: `TR-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toLocaleTimeString(),
      workflowId: response.workflow_id || `WF-FE-${Date.now()}-A7K2`,
      portalSource: role,
      agentTarget: response.target_agent || 'assistant',
      action: response.action_performed || 'interpret_request',
      durationMs: durationMs,
      success: response.success !== false,
      request: {
        agent_target: 'assistant',
        action: 'interpret_request',
        portal_source: role,
        payload: { message: textToSend, ...routeContext },
      },
      response: response,
    };

    onTraceGenerated(traceStep);
  };

  const handleCommandSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    executePrompt(query);
  };

  return (
    <div className="command-bar-wrapper">
      <form onSubmit={handleCommandSubmit}>
        <div className="command-input-container">
          <Sparkles style={{ width: 18, height: 18, color: 'var(--forest-green)' }} />
          <input
            type="text"
            className="command-input"
            placeholder='Ask MEDION... (e.g. "Book with Dr Rajesh tomorrow at 10 AM" or "Check my insurance coverage")'
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit" className="btn-ui btn-primary-ui" disabled={loading} style={{ padding: '0.45rem 1.1rem' }}>
            {loading ? 'Processing...' : 'Ask'} <ArrowRight style={{ width: 14, height: 14 }} />
          </button>
        </div>
      </form>

      {/* MEDION Intelligence Processing Flow */}
      {loading && (
        <div style={{ maxWidth: 1100, margin: '0.65rem auto 0', fontSize: '0.8rem', color: 'var(--forest-green)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500 }}>
          <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: 'var(--forest-green)', animation: 'pulse 1.5s infinite' }}></span>
          <span>{currentStep}</span>
        </div>
      )}

      {/* MEDION Insight Response Container */}
      {lastResponse && !loading && (
        <div style={{ maxWidth: 1100, margin: '0.75rem auto 0', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '1rem 1.25rem', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: lastResponse.success ? 'var(--forest-green)' : 'var(--danger-red)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              MEDION Insight • {lastResponse.target_agent ? `${lastResponse.target_agent.charAt(0).toUpperCase() + lastResponse.target_agent.slice(1)} Agent` : 'Assistant Agent'}
            </span>
            <button className="btn-ui btn-ghost-ui" onClick={onOpenTraceDrawer} style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}>
              <Code style={{ width: 14, height: 14 }} /> View Execution Architecture ➔
            </button>
          </div>
          {lastResponse.errors && lastResponse.errors.length > 0 ? (
            <div style={{ fontSize: '0.88rem', color: 'var(--danger-red)', lineHeight: 1.5 }}>
              {lastResponse.errors[0]}
            </div>
          ) : (
            <HumanResponseRenderer
              response={lastResponse}
              onSelectPrompt={(selectedPrompt) => executePrompt(selectedPrompt)}
              onRetry={() => executePrompt(query)}
            />
          )}
        </div>
      )}
    </div>
  );
};
