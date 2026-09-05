import React from 'react';
import { X, CheckCircle2, Layers, Cpu, Server } from 'lucide-react';
import { ExecutionTraceStep } from '../../types';

interface ExecutionTraceDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  traces: ExecutionTraceStep[];
}

export const ExecutionTraceDrawer: React.FC<ExecutionTraceDrawerProps> = ({ isOpen, onClose, traces }) => {
  if (!isOpen) return null;

  const latestTrace = traces[0];

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
                      <div style={{ fontWeight: 600 }}>SNS Workbench Webhook</div>
                      <div className="text-muted" style={{ fontSize: '0.72rem' }}>Master Orchestrator Switch Router</div>
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
                      <div style={{ fontWeight: 600 }}>MEDION FastAPI Backend Tool</div>
                      <div className="text-muted" style={{ fontSize: '0.72rem' }}>POST /api/v1/workbench/dispatch</div>
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
                <h4 className="h4" style={{ marginBottom: '0.35rem', fontSize: '0.78rem' }}>Structured Response Payload</h4>
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
