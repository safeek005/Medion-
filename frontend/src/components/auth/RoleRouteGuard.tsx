import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, LogIn, Lock } from 'lucide-react';
import { UserRole } from '../../types';
import { useAuth } from '../../services/authService';
import { Button } from '../ui/Button';

interface RoleRouteGuardProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
}

export const RoleRouteGuard: React.FC<RoleRouteGuardProps> = ({ allowedRoles, children }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // 1. Unauthenticated -> Redirect to Login with state
  if (!user) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-app, #f8fafc)', padding: '1.5rem', fontFamily: 'var(--font-sans)' }}>
        <div style={{ maxWidth: 440, width: '100%', backgroundColor: '#ffffff', borderRadius: 'var(--radius-lg, 16px)', padding: '2.5rem', border: '1px solid var(--border-subtle, #e2e8f0)', boxShadow: 'var(--shadow-lg, 0 10px 25px -5px rgba(0,0,0,0.08))', textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, borderRadius: 'var(--radius-md, 12px)', backgroundColor: 'var(--warning-subtle, #fffbeb)', border: '1px solid var(--warning-border, #fef3c7)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem', color: 'var(--warning-amber, #d97706)' }}>
            <Lock style={{ width: 32, height: 32 }} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary, #0f172a)', margin: '0 0 0.5rem' }}>Authentication Required</h2>
          <p style={{ color: 'var(--text-secondary, #475569)', fontSize: '0.875rem', lineHeight: 1.5, margin: '0 0 1.5rem' }}>
            You must be signed in to access this workspace. Please authenticate with your institutional or patient credentials.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <Button
              className="w-full justify-center"
              onClick={() => navigate('/login')}
            >
              <LogIn style={{ width: 16, height: 16, marginRight: 8 }} /> Sign In to MEDION
            </Button>
            <Button
              variant="secondary"
              className="w-full justify-center"
              onClick={() => navigate('/')}
            >
              Return to Landing Page
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // 2. Authenticated but Role Unauthorized -> Hard Block with Access Denied Screen
  if (!allowedRoles.includes(user.role)) {
    const userWorkspacePath = user.role === 'lab' ? '/laboratory' : `/${user.role}`;
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-app, #f8fafc)', padding: '1.5rem', fontFamily: 'var(--font-sans)' }}>
        <div style={{ maxWidth: 540, width: '100%', backgroundColor: '#ffffff', borderRadius: 'var(--radius-lg, 16px)', padding: '2.5rem', border: '1px solid #fee2e2', boxShadow: 'var(--shadow-xl, 0 20px 25px -5px rgba(0,0,0,0.1))', textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, borderRadius: 'var(--radius-md, 12px)', backgroundColor: '#fef2f2', border: '1px solid #fecaca', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem', color: '#dc2626' }}>
            <ShieldAlert style={{ width: 36, height: 36 }} />
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', padding: '0.25rem 0.75rem', borderRadius: 999, fontSize: '0.75rem', fontWeight: 600, backgroundColor: '#fee2e2', color: '#b91c1c', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Security Boundary Violation Intercepted
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary, #0f172a)', margin: '0 0 0.5rem' }}>Access Denied (HTTP 403)</h2>
          <p style={{ color: 'var(--text-secondary, #475569)', fontSize: '0.875rem', lineHeight: 1.6, margin: '0 0 1.5rem' }}>
            Your authenticated session as <strong style={{ color: 'var(--text-primary, #0f172a)' }}>{user.name} ({user.role.toUpperCase()})</strong> does not have permission to access the requested route (
            <code style={{ fontSize: '0.78rem', backgroundColor: '#f1f5f9', padding: '0.15rem 0.35rem', borderRadius: 4, color: '#334155' }}>{location.pathname}</code>).
          </p>

          <div style={{ padding: '1rem', borderRadius: 'var(--radius-md, 10px)', backgroundColor: '#f8fafc', border: '1px solid var(--border-subtle, #e2e8f0)', textAlign: 'left', fontSize: '0.78rem', color: '#475569', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ fontWeight: 600, color: 'var(--text-primary, #0f172a)' }}>Enforced Security Boundaries:</div>
            <div>• Patient accounts are strictly isolated from administrative insurance queues, claims adjudication, and hospital command.</div>
            <div>• Direct URL tampering and cross-role session escalations are blocked by MEDION RBAC guards.</div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'center' }}>
            <Button
              className="justify-center"
              onClick={() => navigate(userWorkspacePath)}
            >
              <ArrowLeft style={{ width: 16, height: 16, marginRight: 8 }} /> Return to My {user.role.toUpperCase()} Workspace
            </Button>
            <Button
              variant="secondary"
              className="justify-center"
              onClick={() => navigate('/login')}
            >
              Switch Account
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // 3. Authorized -> Render the requested view
  return <>{children}</>;
};
