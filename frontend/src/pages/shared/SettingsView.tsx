import React from 'react';
import { Settings, ShieldCheck, Bell, Database } from 'lucide-react';

export const SettingsView: React.FC = () => {
  return (
    <div style={{ padding: '2rem', maxWidth: 900, margin: '0 auto' }}>
      <div style={{ marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-subtle)' }}>
        <h2 className="h2">Application Settings & System Preferences</h2>
        <p className="text-muted" style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
          Configure system notifications, security policies, and AI integration parameters
        </p>
      </div>

      <div className="section-panel" style={{ marginBottom: '1.5rem' }}>
        <h3 className="h3" style={{ marginBottom: '1rem' }}>SNS Agent Workbench Configuration</h3>
        <table className="table-ui">
          <tbody>
            <tr><td className="text-muted">Workbench Webhook Endpoint</td><td><span className="text-mono" style={{ fontSize: '0.8rem' }}>https://api.agents.snsihub.ai/webhook/c52f49ea-9ddb-45bd-ad60-728faebaa8bd</span></td></tr>
            <tr><td className="text-muted">FastAPI Service Dispatch API</td><td><span className="text-mono" style={{ fontSize: '0.8rem' }}>POST /api/v1/workbench/dispatch</span></td></tr>
            <tr><td className="text-muted">Master Orchestrator Mode</td><td>Automatic NLU Intent & Tool Routing</td></tr>
          </tbody>
        </table>
      </div>

      <div className="section-panel">
        <h3 className="h3" style={{ marginBottom: '1rem' }}>System Preferences</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>Real-time Notifications</div>
              <div className="text-muted" style={{ fontSize: '0.78rem' }}>Receive portal alerts for abnormal lab values & claim status changes</div>
            </div>
            <input type="checkbox" defaultChecked style={{ accentColor: 'var(--forest-green)', width: 18, height: 18 }} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>Execution Trace Drawer</div>
              <div className="text-muted" style={{ fontSize: '0.78rem' }}>Enable technical architectural trace button in header</div>
            </div>
            <input type="checkbox" defaultChecked style={{ accentColor: 'var(--forest-green)', width: 18, height: 18 }} />
          </div>
        </div>
      </div>
    </div>
  );
};
