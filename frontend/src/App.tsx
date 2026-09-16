import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { UserRole, ExecutionTraceStep } from './types';

import { LandingPage } from './pages/landing/LandingPage';
import { PortalLandingPage } from './pages/landing/PortalLandingPage';
import { LoginPage } from './pages/auth/LoginPage';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { AskMedionCommand } from './components/intelligence/AskMedionCommand';
import { ExecutionTraceDrawer } from './components/intelligence/ExecutionTraceDrawer';
import { GlobalSearchModal } from './components/intelligence/GlobalSearchModal';
import { dataService } from './services/dataService';
import { useAuth } from './services/authService';
import { RoleRouteGuard } from './components/auth/RoleRouteGuard';

import { DoctorWorkspace } from './pages/doctor/DoctorWorkspace';
import { NurseWorkspace } from './pages/nurse/NurseWorkspace';
import { ReceptionistWorkspace } from './pages/receptionist/ReceptionistWorkspace';
import { PatientWorkspace } from './pages/patient/PatientWorkspace';
import { PatientInsuranceView } from './pages/patient/PatientInsuranceView';
import { PatientLabView } from './pages/patient/PatientLabView';
import { PatientRecordsView } from './pages/patient/PatientRecordsView';
import { PatientAppointmentsView } from './pages/patient/PatientAppointmentsView';
import { PatientPrescriptionsView } from './pages/patient/PatientPrescriptionsView';
import { LabWorkspace } from './pages/lab/LabWorkspace';
import { InsuranceWorkspace } from './pages/insurance/InsuranceWorkspace';
import { HospitalAdminWorkspace } from './pages/hospital/HospitalAdminWorkspace';

import { PatientsView } from './pages/shared/PatientsView';
import { AppointmentsView } from './pages/shared/AppointmentsView';
import { PrescriptionsView } from './pages/shared/PrescriptionsView';
import { NotificationsView } from './pages/shared/NotificationsView';
import { ProfileView } from './pages/shared/ProfileView';
import { SettingsView } from './pages/shared/SettingsView';
import { AiWorkspaceView } from './pages/shared/AiWorkspaceView';
import { DoctorsView, NursesView, LaboratoriesView, AnalyticsView } from './pages/shared/HospitalSubViews';
import { AuditSecurityView } from './pages/shared/AuditSecurityView';
import { AgentActivityView } from './pages/shared/AgentActivityView';
import { ArchitectureView } from './pages/shared/ArchitectureView';

function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const getRoleFromPath = (): UserRole => {
    const p = location.pathname;
    if (p.startsWith('/nurse')) return 'nurse';
    if (p.startsWith('/receptionist')) return 'receptionist';
    if (p.startsWith('/patient')) return 'patient';
    if (p.startsWith('/laboratory')) return 'lab';
    if (p.startsWith('/insurance')) return 'insurance';
    if (p.startsWith('/hospital')) return 'hospital';
    return 'doctor';
  };

  const activeRole = user?.role || getRoleFromPath();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isTraceDrawerOpen, setIsTraceDrawerOpen] = useState(false);
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState(false);
  const [executionTraces, setExecutionTraces] = useState<ExecutionTraceStep[]>([]);

  useEffect(() => {
    dataService.syncFromSupabase();
  }, []);

  // Global Keyboard Shortcut: Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsGlobalSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleTraceGenerated = (step: ExecutionTraceStep) => {
    setExecutionTraces((prev) => [step, ...prev]);
  };

  const handleRoleChange = (role: UserRole) => {
    navigate(`/portal-info/${role}`);
  };

  return (
    <div className="app-container">
      {/* Role-Specific Minimal Sidebar */}
      <Sidebar
        role={activeRole}
        onRoleChange={handleRoleChange}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        onLogout={() => navigate('/')}
      />

      <div className="main-content">
        {/* Top Header */}
        <Header
          role={activeRole}
          onOpenTraceDrawer={() => setIsTraceDrawerOpen(true)}
          onOpenGlobalSearch={() => setIsGlobalSearchOpen(true)}
        />

        {/* Global Ask MEDION Command Bar (Staff & Clinical Workspaces Only) */}
        {activeRole !== 'patient' && (
          <AskMedionCommand
            role={activeRole}
            onTraceGenerated={handleTraceGenerated}
            onOpenTraceDrawer={() => setIsTraceDrawerOpen(true)}
          />
        )}

        {/* Role Workspace Routes with Mandatory RoleRouteGuards */}
        <main style={{ flex: 1 }}>
          <Routes>
            {/* Doctor Routes */}
            <Route path="/doctor" element={<RoleRouteGuard allowedRoles={['doctor']}><DoctorWorkspace onTraceGenerated={handleTraceGenerated} /></RoleRouteGuard>} />
            <Route path="/doctor/patients" element={<RoleRouteGuard allowedRoles={['doctor']}><PatientsView onTraceGenerated={handleTraceGenerated} onOpenTraceDrawer={() => setIsTraceDrawerOpen(true)} /></RoleRouteGuard>} />
            <Route path="/doctor/patients/:patientId" element={<RoleRouteGuard allowedRoles={['doctor']}><PatientsView onTraceGenerated={handleTraceGenerated} onOpenTraceDrawer={() => setIsTraceDrawerOpen(true)} /></RoleRouteGuard>} />
            <Route path="/doctor/appointments" element={<RoleRouteGuard allowedRoles={['doctor']}><AppointmentsView /></RoleRouteGuard>} />
            <Route path="/doctor/prescriptions" element={<RoleRouteGuard allowedRoles={['doctor']}><PrescriptionsView /></RoleRouteGuard>} />
            <Route path="/doctor/lab-reports" element={<RoleRouteGuard allowedRoles={['doctor']}><LabWorkspace onTraceGenerated={handleTraceGenerated} /></RoleRouteGuard>} />
            <Route path="/doctor/ai" element={<RoleRouteGuard allowedRoles={['doctor']}><AiWorkspaceView role="doctor" onTraceGenerated={handleTraceGenerated} onOpenTraceDrawer={() => setIsTraceDrawerOpen(true)} /></RoleRouteGuard>} />
            <Route path="/doctor/agent-activity" element={<RoleRouteGuard allowedRoles={['doctor']}><AgentActivityView /></RoleRouteGuard>} />
            <Route path="/doctor/audit" element={<RoleRouteGuard allowedRoles={['doctor']}><AuditSecurityView /></RoleRouteGuard>} />
            <Route path="/doctor/notifications" element={<RoleRouteGuard allowedRoles={['doctor']}><NotificationsView /></RoleRouteGuard>} />
            <Route path="/doctor/profile" element={<RoleRouteGuard allowedRoles={['doctor']}><ProfileView role="doctor" /></RoleRouteGuard>} />
            <Route path="/doctor/settings" element={<RoleRouteGuard allowedRoles={['doctor']}><SettingsView /></RoleRouteGuard>} />

            {/* Nurse Routes */}
            <Route path="/nurse" element={<RoleRouteGuard allowedRoles={['nurse']}><NurseWorkspace onTraceGenerated={handleTraceGenerated} /></RoleRouteGuard>} />
            <Route path="/nurse/patients" element={<RoleRouteGuard allowedRoles={['nurse']}><PatientsView onTraceGenerated={handleTraceGenerated} onOpenTraceDrawer={() => setIsTraceDrawerOpen(true)} /></RoleRouteGuard>} />
            <Route path="/nurse/patients/:patientId" element={<RoleRouteGuard allowedRoles={['nurse']}><PatientsView onTraceGenerated={handleTraceGenerated} onOpenTraceDrawer={() => setIsTraceDrawerOpen(true)} /></RoleRouteGuard>} />
            <Route path="/nurse/appointments" element={<RoleRouteGuard allowedRoles={['nurse']}><AppointmentsView /></RoleRouteGuard>} />
            <Route path="/nurse/prescriptions" element={<RoleRouteGuard allowedRoles={['nurse']}><PrescriptionsView /></RoleRouteGuard>} />
            <Route path="/nurse/lab-reports" element={<RoleRouteGuard allowedRoles={['nurse']}><LabWorkspace onTraceGenerated={handleTraceGenerated} /></RoleRouteGuard>} />
            <Route path="/nurse/insurance" element={<RoleRouteGuard allowedRoles={['nurse']}><InsuranceWorkspace onTraceGenerated={handleTraceGenerated} /></RoleRouteGuard>} />
            <Route path="/nurse/ai" element={<RoleRouteGuard allowedRoles={['nurse']}><AiWorkspaceView role="nurse" onTraceGenerated={handleTraceGenerated} onOpenTraceDrawer={() => setIsTraceDrawerOpen(true)} /></RoleRouteGuard>} />
            <Route path="/nurse/agent-activity" element={<RoleRouteGuard allowedRoles={['nurse']}><AgentActivityView /></RoleRouteGuard>} />
            <Route path="/nurse/notifications" element={<RoleRouteGuard allowedRoles={['nurse']}><NotificationsView /></RoleRouteGuard>} />
            <Route path="/nurse/profile" element={<RoleRouteGuard allowedRoles={['nurse']}><ProfileView role="nurse" /></RoleRouteGuard>} />
            <Route path="/nurse/settings" element={<RoleRouteGuard allowedRoles={['nurse']}><SettingsView /></RoleRouteGuard>} />

            {/* Receptionist Routes */}
            <Route path="/receptionist" element={<RoleRouteGuard allowedRoles={['receptionist']}><ReceptionistWorkspace onTraceGenerated={handleTraceGenerated} /></RoleRouteGuard>} />
            <Route path="/receptionist/intake" element={<RoleRouteGuard allowedRoles={['receptionist']}><ReceptionistWorkspace onTraceGenerated={handleTraceGenerated} defaultTab="intake" /></RoleRouteGuard>} />
            <Route path="/receptionist/appointments" element={<RoleRouteGuard allowedRoles={['receptionist']}><AppointmentsView /></RoleRouteGuard>} />
            <Route path="/receptionist/patients" element={<RoleRouteGuard allowedRoles={['receptionist']}><PatientsView onTraceGenerated={handleTraceGenerated} onOpenTraceDrawer={() => setIsTraceDrawerOpen(true)} /></RoleRouteGuard>} />
            <Route path="/receptionist/patients/:patientId" element={<RoleRouteGuard allowedRoles={['receptionist']}><PatientsView onTraceGenerated={handleTraceGenerated} onOpenTraceDrawer={() => setIsTraceDrawerOpen(true)} /></RoleRouteGuard>} />
            <Route path="/receptionist/ai" element={<RoleRouteGuard allowedRoles={['receptionist']}><AiWorkspaceView role="receptionist" onTraceGenerated={handleTraceGenerated} onOpenTraceDrawer={() => setIsTraceDrawerOpen(true)} /></RoleRouteGuard>} />
            <Route path="/receptionist/notifications" element={<RoleRouteGuard allowedRoles={['receptionist']}><NotificationsView /></RoleRouteGuard>} />
            <Route path="/receptionist/profile" element={<RoleRouteGuard allowedRoles={['receptionist']}><ProfileView role="receptionist" /></RoleRouteGuard>} />
            <Route path="/receptionist/settings" element={<RoleRouteGuard allowedRoles={['receptionist']}><SettingsView /></RoleRouteGuard>} />

            {/* Patient Routes - Strictly Isolated to Patient's Own Records */}
            <Route path="/patient" element={<RoleRouteGuard allowedRoles={['patient']}><PatientWorkspace onTraceGenerated={handleTraceGenerated} /></RoleRouteGuard>} />
            <Route path="/patient/appointments" element={<RoleRouteGuard allowedRoles={['patient']}><PatientAppointmentsView onTraceGenerated={handleTraceGenerated} /></RoleRouteGuard>} />
            <Route path="/patient/records" element={<RoleRouteGuard allowedRoles={['patient']}><PatientRecordsView onTraceGenerated={handleTraceGenerated} /></RoleRouteGuard>} />
            <Route path="/patient/prescriptions" element={<RoleRouteGuard allowedRoles={['patient']}><PatientPrescriptionsView onTraceGenerated={handleTraceGenerated} /></RoleRouteGuard>} />
            <Route path="/patient/lab-reports" element={<RoleRouteGuard allowedRoles={['patient']}><PatientLabView onTraceGenerated={handleTraceGenerated} /></RoleRouteGuard>} />
            <Route path="/patient/insurance" element={<RoleRouteGuard allowedRoles={['patient']}><PatientInsuranceView onTraceGenerated={handleTraceGenerated} /></RoleRouteGuard>} />
            <Route path="/patient/ai" element={<RoleRouteGuard allowedRoles={['patient']}><AiWorkspaceView role="patient" onTraceGenerated={handleTraceGenerated} onOpenTraceDrawer={() => setIsTraceDrawerOpen(true)} /></RoleRouteGuard>} />
            <Route path="/patient/notifications" element={<RoleRouteGuard allowedRoles={['patient']}><NotificationsView /></RoleRouteGuard>} />
            <Route path="/patient/profile" element={<RoleRouteGuard allowedRoles={['patient']}><ProfileView role="patient" /></RoleRouteGuard>} />
            <Route path="/patient/settings" element={<RoleRouteGuard allowedRoles={['patient']}><SettingsView /></RoleRouteGuard>} />

            {/* Laboratory Routes */}
            <Route path="/laboratory" element={<RoleRouteGuard allowedRoles={['lab']}><LabWorkspace onTraceGenerated={handleTraceGenerated} /></RoleRouteGuard>} />
            <Route path="/laboratory/patients" element={<RoleRouteGuard allowedRoles={['lab']}><PatientsView onTraceGenerated={handleTraceGenerated} onOpenTraceDrawer={() => setIsTraceDrawerOpen(true)} /></RoleRouteGuard>} />
            <Route path="/laboratory/patients/:patientId" element={<RoleRouteGuard allowedRoles={['lab']}><PatientsView onTraceGenerated={handleTraceGenerated} onOpenTraceDrawer={() => setIsTraceDrawerOpen(true)} /></RoleRouteGuard>} />
            <Route path="/laboratory/reports" element={<RoleRouteGuard allowedRoles={['lab']}><LabWorkspace onTraceGenerated={handleTraceGenerated} /></RoleRouteGuard>} />
            <Route path="/laboratory/report-processing" element={<RoleRouteGuard allowedRoles={['lab']}><LabWorkspace onTraceGenerated={handleTraceGenerated} /></RoleRouteGuard>} />
            <Route path="/laboratory/ai" element={<RoleRouteGuard allowedRoles={['lab']}><AiWorkspaceView role="lab" onTraceGenerated={handleTraceGenerated} onOpenTraceDrawer={() => setIsTraceDrawerOpen(true)} /></RoleRouteGuard>} />
            <Route path="/laboratory/agent-activity" element={<RoleRouteGuard allowedRoles={['lab']}><AgentActivityView /></RoleRouteGuard>} />
            <Route path="/laboratory/notifications" element={<RoleRouteGuard allowedRoles={['lab']}><NotificationsView /></RoleRouteGuard>} />
            <Route path="/laboratory/profile" element={<RoleRouteGuard allowedRoles={['lab']}><ProfileView role="lab" /></RoleRouteGuard>} />
            <Route path="/laboratory/settings" element={<RoleRouteGuard allowedRoles={['lab']}><SettingsView /></RoleRouteGuard>} />

            {/* Insurance Staff Routes */}
            <Route path="/insurance" element={<RoleRouteGuard allowedRoles={['insurance']}><InsuranceWorkspace onTraceGenerated={handleTraceGenerated} /></RoleRouteGuard>} />
            <Route path="/insurance/policies" element={<RoleRouteGuard allowedRoles={['insurance']}><InsuranceWorkspace onTraceGenerated={handleTraceGenerated} /></RoleRouteGuard>} />
            <Route path="/insurance/claims" element={<RoleRouteGuard allowedRoles={['insurance']}><InsuranceWorkspace onTraceGenerated={handleTraceGenerated} /></RoleRouteGuard>} />
            <Route path="/insurance/patients" element={<RoleRouteGuard allowedRoles={['insurance']}><PatientsView onTraceGenerated={handleTraceGenerated} onOpenTraceDrawer={() => setIsTraceDrawerOpen(true)} /></RoleRouteGuard>} />
            <Route path="/insurance/patients/:patientId" element={<RoleRouteGuard allowedRoles={['insurance']}><PatientsView onTraceGenerated={handleTraceGenerated} onOpenTraceDrawer={() => setIsTraceDrawerOpen(true)} /></RoleRouteGuard>} />
            <Route path="/insurance/ai" element={<RoleRouteGuard allowedRoles={['insurance']}><AiWorkspaceView role="insurance" onTraceGenerated={handleTraceGenerated} onOpenTraceDrawer={() => setIsTraceDrawerOpen(true)} /></RoleRouteGuard>} />
            <Route path="/insurance/audit" element={<RoleRouteGuard allowedRoles={['insurance']}><AuditSecurityView /></RoleRouteGuard>} />
            <Route path="/insurance/notifications" element={<RoleRouteGuard allowedRoles={['insurance']}><NotificationsView /></RoleRouteGuard>} />
            <Route path="/insurance/profile" element={<RoleRouteGuard allowedRoles={['insurance']}><ProfileView role="insurance" /></RoleRouteGuard>} />
            <Route path="/insurance/settings" element={<RoleRouteGuard allowedRoles={['insurance']}><SettingsView /></RoleRouteGuard>} />

            {/* Hospital Administration Routes */}
            <Route path="/hospital" element={<RoleRouteGuard allowedRoles={['hospital']}><HospitalAdminWorkspace onTraceGenerated={handleTraceGenerated} /></RoleRouteGuard>} />
            <Route path="/hospital/patients" element={<RoleRouteGuard allowedRoles={['hospital']}><PatientsView onTraceGenerated={handleTraceGenerated} onOpenTraceDrawer={() => setIsTraceDrawerOpen(true)} /></RoleRouteGuard>} />
            <Route path="/hospital/patients/:patientId" element={<RoleRouteGuard allowedRoles={['hospital']}><PatientsView onTraceGenerated={handleTraceGenerated} onOpenTraceDrawer={() => setIsTraceDrawerOpen(true)} /></RoleRouteGuard>} />
            <Route path="/hospital/doctors" element={<RoleRouteGuard allowedRoles={['hospital']}><DoctorsView /></RoleRouteGuard>} />
            <Route path="/hospital/nurses" element={<RoleRouteGuard allowedRoles={['hospital']}><NursesView /></RoleRouteGuard>} />
            <Route path="/hospital/appointments" element={<RoleRouteGuard allowedRoles={['hospital']}><AppointmentsView /></RoleRouteGuard>} />
            <Route path="/hospital/laboratories" element={<RoleRouteGuard allowedRoles={['hospital']}><LaboratoriesView /></RoleRouteGuard>} />
            <Route path="/hospital/insurance" element={<RoleRouteGuard allowedRoles={['hospital']}><InsuranceWorkspace onTraceGenerated={handleTraceGenerated} /></RoleRouteGuard>} />
            <Route path="/hospital/analytics" element={<RoleRouteGuard allowedRoles={['hospital']}><AnalyticsView /></RoleRouteGuard>} />
            <Route path="/hospital/ai" element={<RoleRouteGuard allowedRoles={['hospital']}><AiWorkspaceView role="hospital" onTraceGenerated={handleTraceGenerated} onOpenTraceDrawer={() => setIsTraceDrawerOpen(true)} /></RoleRouteGuard>} />
            <Route path="/hospital/agent-activity" element={<RoleRouteGuard allowedRoles={['hospital']}><AgentActivityView /></RoleRouteGuard>} />
            <Route path="/hospital/audit" element={<RoleRouteGuard allowedRoles={['hospital']}><AuditSecurityView /></RoleRouteGuard>} />
            <Route path="/hospital/architecture" element={<RoleRouteGuard allowedRoles={['hospital']}><ArchitectureView /></RoleRouteGuard>} />
            <Route path="/hospital/notifications" element={<RoleRouteGuard allowedRoles={['hospital']}><NotificationsView /></RoleRouteGuard>} />
            <Route path="/hospital/profile" element={<RoleRouteGuard allowedRoles={['hospital']}><ProfileView role="hospital" /></RoleRouteGuard>} />
            <Route path="/hospital/settings" element={<RoleRouteGuard allowedRoles={['hospital']}><SettingsView /></RoleRouteGuard>} />

            {/* Direct / Unprefixed Canonical Route Redirects */}
            <Route path="/appointments" element={<Navigate to={user?.role === 'patient' ? '/patient/appointments' : (user?.role === 'receptionist' ? '/receptionist/appointments' : (user?.role === 'hospital' ? '/hospital/appointments' : '/doctor/appointments'))} replace />} />
            <Route path="/prescriptions" element={<Navigate to={user?.role === 'patient' ? '/patient/prescriptions' : '/doctor/prescriptions'} replace />} />
            <Route path="/patients" element={<Navigate to={user?.role === 'patient' ? '/patient/records' : (user ? (user.role === 'lab' ? '/laboratory/patients' : `/${user.role}/patients`) : '/doctor/patients')} replace />} />
            <Route path="/records" element={<Navigate to={user?.role === 'patient' ? '/patient/records' : '/doctor/patients'} replace />} />
            <Route path="/claims" element={<Navigate to={user?.role === 'patient' ? '/patient/insurance' : '/insurance/claims'} replace />} />
            <Route path="/preauthorization" element={<Navigate to={user?.role === 'patient' ? '/patient/insurance' : '/insurance'} replace />} />
            <Route path="/lab" element={<Navigate to="/laboratory" replace />} />
            <Route path="/hospital-admin" element={<Navigate to="/hospital" replace />} />

            <Route path="*" element={<Navigate to={user ? (user.role === 'lab' ? '/laboratory' : `/${user.role}`) : "/doctor"} replace />} />
          </Routes>
        </main>
      </div>

      {/* Global Spotlight Search Modal */}
      <GlobalSearchModal
        isOpen={isGlobalSearchOpen}
        onClose={() => setIsGlobalSearchOpen(false)}
        onSelectPatient={(pId) => {
          navigate(`/${activeRole}/patients/${pId}`);
        }}
      />

      {/* Technical Architecture Execution View Drawer */}
      <ExecutionTraceDrawer
        isOpen={isTraceDrawerOpen}
        onClose={() => setIsTraceDrawerOpen(false)}
        traces={executionTraces}
      />
    </div>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingWrapper />} />
        <Route path="/login" element={<LoginWrapper />} />
        <Route path="/portal-info/:role" element={<PortalLandingPage />} />
        <Route path="/:role/landing" element={<PortalLandingPage />} />
        <Route path="/*" element={<AppLayout />} />
      </Routes>
    </BrowserRouter>
  );
}

function LandingWrapper() {
  const navigate = useNavigate();
  return <LandingPage onExplore={() => navigate('/login')} onSignIn={() => navigate('/login')} />;
}

function LoginWrapper() {
  const navigate = useNavigate();
  return (
    <LoginPage
      onLoginSuccess={(role) => {
        navigate(`/portal-info/${role}`);
      }}
    />
  );
}

export default App;
