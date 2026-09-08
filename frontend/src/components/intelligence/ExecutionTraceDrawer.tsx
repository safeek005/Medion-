import React from 'react';
import { X, CheckCircle2, Layers, Cpu, Server, Sparkles, Activity, AlertTriangle, ShieldCheck } from 'lucide-react';
import { ExecutionTraceStep } from '../../types';

interface ExecutionTraceDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  traces: ExecutionTraceStep[];
}

export const ExecutionTraceDrawer: React.FC<ExecutionTraceDrawerProps> = ({ isOpen, onClose, traces }) => {
  if (!isOpen) return null;

  const latestTrace = traces[0];
  const providerInfo =
    latestTrace?.providerInfo ||
    latestTrace?.response?.provider_info ||
    (latestTrace?.response?.output?.result_data as any)?.provider_info ||
    (latestTrace?.response?.result as any)?.provider_info ||
    {
      provider_name: 'MEDION Deterministic Healthcare Engine (Offline / Local)',
      is_fallback: true,
      fallback_reason: 'Default offline deterministic engine active (No external cloud LLM API key required)',
      endpoint_used: '/api/workbench/dispatch',
      model: 'Rule-based Slot Matcher & Domain Specialist'
    };

  return (
    <>
      <div className="drawer-overlay" onClick={onClose} />
      <div className="drawer-container">
        <div className="drawer-header">
          <div>
            <h3 className="h3">System Execution Architecture View</h3>
            <p className="text-muted" style={{ fontSize: '0.78rem', marginTop: '0.1rem' }}>
              Multi-agent orchestration trace for evaluators & reviewers
            </p>
          </div>
          <button className="btn-ui btn-ghost-ui" onClick={onClose} style={{ padding: '0.3rem' }}>
            <X style={{ width: 18, height: 18 }} />
          </button>
        </div>

        <div className="drawer-body">
          {/* Active AI Provider & Routing Pathway Card */}
          <div
            style={{
              marginBottom: '1.25rem',
              background: 'var(--bg-app)',
              border: '1px solid var(--border-subtle)',
              padding: '1rem',
              borderRadius: 8,
              borderLeft: providerInfo.is_fallback
                ? '4px solid #f59e0b'
                : '4px solid var(--forest-green)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Sparkles style={{ width: 15, height: 15, color: providerInfo.is_fallback ? '#f59e0b' : 'var(--forest-green)' }} />
                <h4 className="h4" style={{ fontSize: '0.82rem', margin: 0, fontWeight: 700 }}>
                  Active AI Provider & Routing Pathway
                </h4>
              </div>
              <span
                className="badge-ui"
                style={{
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  background: providerInfo.is_fallback ? '#fef3c7' : 'var(--forest-green-light)',
                  color: providerInfo.is_fallback ? '#92400e' : 'var(--forest-green)',
                  border: `1px solid ${providerInfo.is_fallback ? '#fde68a' : 'var(--forest-green)'}`
                }}
              >
                {providerInfo.is_fallback ? '⚡ Deterministic Fallback Active' : '✨ Live Cloud LLM Active'}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', fontSize: '0.76rem' }}>
              <div>
                <span className="text-muted" style={{ display: 'block', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.4px' }}>AI Provider Engine</span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{providerInfo.provider_name}</span>
              </div>
              <div>
                <span className="text-muted" style={{ display: 'block', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Inference / Slot Model</span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{providerInfo.model || 'Rule & Slot Matcher'}</span>
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <span className="text-muted" style={{ display: 'block', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Target Dispatch Endpoint</span>
                <code style={{ fontSize: '0.72rem', background: 'var(--bg-surface)', padding: '0.15rem 0.4rem', borderRadius: 4, border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                  {providerInfo.endpoint_used || '/api/workbench/dispatch'}
                </code>
              </div>
              {providerInfo.fallback_reason && (
                <div style={{ gridColumn: 'span 2', background: 'var(--bg-surface)', padding: '0.5rem 0.6rem', borderRadius: 6, border: '1px dashed var(--border-subtle)', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                  <span style={{ fontWeight: 600, color: providerInfo.is_fallback ? '#b45309' : 'var(--text-primary)' }}>Execution Mode: </span>
                  {providerInfo.fallback_reason}
                </div>
              )}
            </div>
          </div>

          {/* Core Registered Agents & External System Badges */}
          <div style={{ marginBottom: '1.25rem', background: 'var(--bg-app)', border: '1px solid var(--border-subtle)', padding: '1rem', borderRadius: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Cpu style={{ width: 14, height: 14, color: 'var(--forest-green)' }} />
              <h4 className="h4" style={{ fontSize: '0.8rem', margin: 0 }}>Registered 5 Core MEDION Agents</h4>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.75rem' }}>
              <span className="badge-ui badge-green">Patient Agent</span>
              <span className="badge-ui badge-green">Medical Agent</span>
              <span className="badge-ui badge-green">Appointment Agent</span>
              <span className="badge-ui badge-green">Insurance Agent</span>
              <span className="badge-ui badge-green">Assistant Agent</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border-subtle)' }}>
              <Server style={{ width: 13, height: 13, color: 'var(--text-muted)' }} />
              <span className="text-muted" style={{ fontSize: '0.74rem', fontWeight: 600 }}>External Mock Integrations</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              <span className="badge-ui" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-strong)', color: 'var(--text-secondary)' }}>Mock Insurance Service</span>
              <span className="badge-ui" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-strong)', color: 'var(--text-secondary)' }}>Mock Notification System</span>
            </div>
          </div>

          {latestTrace ? (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Execution Trace #{latestTrace.id}
                </span>
                <span className="badge-ui badge-green">
                  <CheckCircle2 style={{ width: 12, height: 12 }} /> {latestTrace.durationMs}ms
                </span>
              </div>

              {/* Execution Flow Diagram (Master Orchestrator Sequence) */}
              <div style={{ background: 'var(--bg-app)', padding: '1.1rem', borderRadius: 8, border: '1px solid var(--border-subtle)', marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--forest-green)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.75rem' }}>
                  Architecture Sequence (SNS Workbench Master Orchestrator)
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.82rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--forest-green-light)', color: 'var(--forest-green)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.75rem' }}>1</div>
                    <div>
                      <div style={{ fontWeight: 600 }}>User Request</div>
                      <div className="text-muted" style={{ fontSize: '0.72rem' }}>Portal Source: {latestTrace.portalSource.toUpperCase()}</div>
                    </div>
                  </div>

                  <div style={{ paddingLeft: 12, borderLeft: '2px solid var(--border-subtle)', marginLeft: 12, height: 10 }}></div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--forest-green-light)', color: 'var(--forest-green)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.75rem' }}>2</div>
                    <div>
                      <div style={{ fontWeight: 600 }}>SNS Workbench Webhook Dispatcher</div>
                      <div className="text-muted" style={{ fontSize: '0.72rem' }}>
                        Router: {providerInfo.endpoint_used || '/api/workbench/dispatch'} ({providerInfo.is_fallback ? 'Offline Fallback Engine' : 'Cloud Gemini LLM'})
                      </div>
                    </div>
                  </div>

                  <div style={{ paddingLeft: 12, borderLeft: '2px solid var(--border-subtle)', marginLeft: 12, height: 10 }}></div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--forest-green-light)', color: 'var(--forest-green)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.75rem' }}>3</div>
                    <div>
                      <div style={{ fontWeight: 600 }}>Target Core Agent</div>
                      <div className="text-muted" style={{ fontSize: '0.72rem' }}>{latestTrace.agentTarget.toUpperCase()} Agent (Action: {latestTrace.action})</div>
                    </div>
                  </div>

                  <div style={{ paddingLeft: 12, borderLeft: '2px solid var(--border-subtle)', marginLeft: 12, height: 10 }}></div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--forest-green-light)', color: 'var(--forest-green)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.75rem' }}>4</div>
                    <div>
                      <div style={{ fontWeight: 600 }}>Shared Healthcare Database Engine</div>
                      <div className="text-muted" style={{ fontSize: '0.72rem' }}>Validated CRUD State Sync & Role-aware Formatting</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payload Debug */}
              <div style={{ marginBottom: '1rem' }}>
                <h4 className="h4" style={{ marginBottom: '0.35rem', fontSize: '0.78rem' }}>Structured Request Payload</h4>
                <pre style={{ background: 'var(--bg-app)', padding: '0.75rem', borderRadius: 8, fontSize: '0.72rem', fontFamily: 'var(--font-mono)', overflowX: 'auto', border: '1px solid var(--border-subtle)' }}>
                  {JSON.stringify(latestTrace.request, null, 2)}
                </pre>
              </div>

              <div>
                <h4 className="h4" style={{ marginBottom: '0.35rem', fontSize: '0.78rem' }}>Structured Response Payload (Includes Provider Telemetry)</h4>
                <pre style={{ background: 'var(--bg-app)', padding: '0.75rem', borderRadius: 8, fontSize: '0.72rem', fontFamily: 'var(--font-mono)', overflowX: 'auto', border: '1px solid var(--border-subtle)' }}>
                  {JSON.stringify(latestTrace.response, null, 2)}
                </pre>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
              No execution trace recorded yet. Dispatch an action or query in the workspace to capture execution trace.
            </div>
          )}
        </div>
      </div>
    </>
  );
};
