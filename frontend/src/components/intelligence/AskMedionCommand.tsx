import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  Code,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Stethoscope,
  Layers,
  Search,
  Check,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  FileText,
  Calendar,
  ShieldAlert,
} from 'lucide-react';
import { executeAssistantAction } from '../../api/medionApi';
import { UserRole, WorkbenchResponse, ExecutionTraceStep } from '../../types';
import { HumanResponseRenderer } from './HumanResponseRenderer';
import { ConfirmationDialog } from '../ui/ConfirmationDialog';
import { useAuth } from '../../services/authService';

interface AskMedionCommandProps {
  role: UserRole;
  onTraceGenerated: (step: ExecutionTraceStep) => void;
  onOpenTraceDrawer: () => void;
}

export const AskMedionCommand: React.FC<AskMedionCommandProps> = ({
  role,
  onTraceGenerated,
  onOpenTraceDrawer,
}) => {
  const location = useLocation();
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeStage, setActiveStage] = useState<number>(0);
  const [lastResponse, setLastResponse] = useState<WorkbenchResponse | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [pendingConfirmation, setPendingConfirmation] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    actionPayload?: any;
  }>({
    isOpen: false,
    title: '',
    description: '',
  });

  // Extract contextual patient_id or claim_id from current route path
  const getRouteContext = (): Record<string, any> => {
    const context: Record<string, any> = {};
    const parts = location.pathname.split('/').filter(Boolean);

    if (parts.length >= 3 && parts[1] === 'patients') {
      context.patient_id = parts[2];
    } else if (role === 'patient') {
      context.patient_id = user?.id || 'PAT-1025';
    }

    return context;
  };

  const lifecycleStages = [
    { label: 'Understanding Request', desc: 'Request semantics & clinical intent mapped' },
    { label: 'Checking Context', desc: 'Active patient record & facility verified' },
    { label: 'Specialized Agent Routing', desc: 'Routed to domain workflow agent' },
    { label: 'Verifying Ground-Truth', desc: 'PostgreSQL / Supabase data verified' },
  ];

  const getSuggestedPrompts = () => {
    switch (role) {
      case 'patient':
        return [
          'Check my upcoming appointment with Dr. Mehta',
          'Explain my latest lab report in plain language',
          'Check my insurance pre-authorization status',
          'List my active medications & refill schedule',
        ];
      case 'doctor':
        return [
          'Summarize this patient\'s history',
          'Compare recent lab reports',
          'Check antihypertensive titration guidance',
          'Find available cardiology appointments',
        ];
      case 'nurse':
        return [
          'Review vitals due in Ward 3B',
          'Check eMAR pending medication tasks',
          'Identify high-acuity inpatients',
          'Check specimen collection order status',
        ];
      case 'hospital':
        return [
          'Analyze emergency department throughput',
          'Summarize bed utilization across wards',
          'Check pending insurance pre-authorizations',
          'Audit recent clinical chart accesses',
        ];
      case 'lab':
        return [
          'Filter STAT diagnostic queue',
          'Trigger AI lab report extraction',
          'Check abnormal biomarker flags',
          'Verify specimen chain of custody',
        ];
      case 'insurance':
        return [
          'Review pending pre-authorization claims',
          'Check policy coverage limits and benefits',
          'Verify diagnosis code concordance',
          'Audit high-value inpatient claims',
        ];
      default:
        return [
          'Check upcoming appointments',
          'Search verified patient records',
          'Ask anything about clinical workflows',
        ];
    }
  };

  const executePrompt = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    setQuery(textToSend);
    setLoading(true);
    setActiveStage(1);
    setLastResponse(null);
    setIsExpanded(true);

    const timer1 = setTimeout(() => setActiveStage(2), 220);
    const timer2 = setTimeout(() => setActiveStage(3), 480);

    const routeContext = getRouteContext();
    const startTime = performance.now();

    const response = await executeAssistantAction(textToSend, role, routeContext);
    const durationMs = Math.round(performance.now() - startTime);

    clearTimeout(timer1);
    clearTimeout(timer2);
    setActiveStage(3);
    setLoading(false);
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

  const suggestions = getSuggestedPrompts();

  return (
    <div
      style={{
        background: '#ffffff',
        borderBottom: '1px solid var(--border-subtle)',
        padding: '0.65rem 1.5rem',
      }}
    >
      <div style={{ maxWidth: 1240, margin: '0 auto' }}>
        {/* Docked AI Input Bar */}
        <form onSubmit={handleCommandSubmit}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              background: 'var(--bg-surface-secondary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '0.45rem 0.85rem',
              transition: 'all 0.15s ease',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                color: 'var(--teal-intelligent)',
                fontWeight: 600,
                fontSize: '0.8rem',
                paddingRight: '0.5rem',
                borderRight: '1px solid var(--border-subtle)',
              }}
            >
              <Sparkles style={{ width: 15, height: 15 }} />
              <span>Ask MEDION</span>
            </div>

            <input
              type="text"
              placeholder="Ask anything about your healthcare workflow... e.g. 'Summarize this patient's history' or 'Explain latest lab results'"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{
                flex: 1,
                border: 'none',
                background: 'transparent',
                outline: 'none',
                fontSize: '0.86rem',
                color: 'var(--text-primary)',
                fontFamily: 'inherit',
              }}
            />

            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="btn-ui btn-primary-ui"
              style={{
                padding: '0.35rem 0.85rem',
                fontSize: '0.8rem',
                borderRadius: 'var(--radius-xs)',
              }}
            >
              {loading ? 'Analyzing...' : 'Execute'} <ArrowRight style={{ width: 13, height: 13 }} />
            </button>

            {lastResponse && (
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="btn-ui btn-ghost-ui"
                style={{ padding: '0.35rem', color: 'var(--text-muted)' }}
                title={isExpanded ? 'Collapse response' : 'Expand response'}
              >
                {isExpanded ? <ChevronUp style={{ width: 16, height: 16 }} /> : <ChevronDown style={{ width: 16, height: 16 }} />}
              </button>
            )}
          </div>
        </form>

        {/* Suggested Clinical Action Pills */}
        {!lastResponse && !loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Suggested Actions:
            </span>
            {suggestions.map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => executePrompt(prompt)}
                style={{
                  padding: '0.18rem 0.6rem',
                  borderRadius: 'var(--radius-xs)',
                  background: 'transparent',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-secondary)',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  transition: 'all 0.12s ease',
                }}
                className="hover:border-teal-600 hover:text-teal-700"
              >
                {prompt}
              </button>
            ))}
          </div>
        )}

        {/* Active Multi-Agent Orchestration Lifecycle */}
        {(loading || (lastResponse && isExpanded)) && (
          <div
            style={{
              marginTop: '0.75rem',
              background: '#ffffff',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '0.85rem 1.15rem',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            {/* Real-time Multi-Stage Progress */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBottom: '0.65rem',
                borderBottom: '1px solid var(--border-subtle)',
                marginBottom: '0.75rem',
                gap: '0.75rem',
                overflowX: 'auto',
              }}
            >
              {lifecycleStages.map((stage, idx) => {
                const isDone = idx <= activeStage;
                const isCurrent = idx === activeStage && loading;
                return (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.74rem' }}>
                    <div
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: '50%',
                        background: isDone ? 'var(--teal-subtle)' : 'var(--bg-surface-secondary)',
                        border: '1px solid',
                        borderColor: isDone ? 'var(--teal-border)' : 'var(--border-subtle)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: isDone ? 'var(--teal-intelligent)' : 'var(--text-muted)',
                        fontWeight: 700,
                        fontSize: '0.68rem',
                      }}
                    >
                      {isDone ? '✓' : idx + 1}
                    </div>
                    <div>
                      <span style={{ fontWeight: isDone ? 600 : 400, color: isDone ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                        {stage.label}
                      </span>
                    </div>
                    {idx < lifecycleStages.length - 1 && (
                      <span style={{ color: 'var(--text-tertiary)', margin: '0 0.25rem' }}>→</span>
                    )}
                  </div>
                );
              })}

              {role !== 'patient' && onOpenTraceDrawer && (
                <button
                  onClick={onOpenTraceDrawer}
                  className="btn-ui btn-ghost-ui"
                  style={{
                    fontSize: '0.72rem',
                    padding: '0.2rem 0.5rem',
                    color: 'var(--teal-intelligent)',
                    marginLeft: 'auto',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <Code style={{ width: 12, height: 12 }} /> Trace Execution
                </button>
              )}
            </div>

            {/* AI Response Output */}
            {lastResponse && (
              <div>
                <HumanResponseRenderer response={lastResponse} />

                {/* Clinical Disclaimer & Safety Notice */}
                <div
                  style={{
                    marginTop: '0.85rem',
                    padding: '0.55rem 0.85rem',
                    borderRadius: 'var(--radius-xs)',
                    background: 'var(--bg-surface-secondary)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.72rem',
                    color: 'var(--text-muted)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <ShieldCheck style={{ width: 14, height: 14, color: 'var(--teal-intelligent)' }} />
                    <span>
                      AI assists. Clinicians decide. Grounded against verified institutional records.
                    </span>
                  </div>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem' }}>
                    Workflow: {lastResponse.workflow_id}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Sensitive Action Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={pendingConfirmation.isOpen}
        title={pendingConfirmation.title}
        summary={pendingConfirmation.description}
        confirmLabel="Confirm & Authorize Action"
        cancelLabel="Cancel"
        onConfirm={() => {
          setPendingConfirmation({ isOpen: false, title: '', description: '' });
        }}
        onClose={() => {
          setPendingConfirmation({ isOpen: false, title: '', description: '' });
        }}
      />
    </div>
  );
};
