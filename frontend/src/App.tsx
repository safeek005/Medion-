import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { UserRole, ExecutionTraceStep } from './types';

import { LandingPage } from './pages/landing/LandingPage';
import { LoginPage } from './pages/auth/LoginPage';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { AskMedionCommand } from './components/intelligence/AskMedionCommand';
import { ExecutionTraceDrawer } from './components/intelligence/ExecutionTraceDrawer';
import { dataService } from './services/dataService';
import { useEffect } from 'react';

import { DoctorWorkspace } from './pages/doctor/DoctorWorkspace';
import { NurseWorkspace } from './pages/nurse/NurseWorkspace';
import { PatientWorkspace } from './pages/patient/PatientWorkspace';
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

function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const getRoleFromPath = (): UserRole => {
    const p = location.pathname;
    if (p.startsWith('/nurse')) return 'nurse';
    if (p.startsWith('/patient')) return 'patient';
    if (p.startsWith('/laboratory')) return 'lab';
    if (p.startsWith('/insurance')) return 'insurance';
    if (p.startsWith('/hospital')) return 'hospital';
    return 'doctor';
  };

  const activeRole = getRoleFromPath();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isTraceDrawerOpen, setIsTraceDrawerOpen] = useState(false);
  const [executionTraces, setExecutionTraces] = useState<ExecutionTraceStep[]>([]);

  useEffect(() => {
    dataService.syncFromSupabase();
  }, []);

  const handleTraceGenerated = (step: ExecutionTraceStep) => {
    setExecutionTraces((prev) => [step, ...prev]);
  };

  const handleRoleChange = (role: UserRole) => {
    const targetPath = role === 'lab' ? '/laboratory' : `/${role}`;
    navigate(targetPath);
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
        <Header role={activeRole} onOpenTraceDrawer={() => setIsTraceDrawerOpen(true)} />

        {/* Global Ask MEDION Command Bar */}
        <AskMedionCommand
          role={activeRole}
          onTraceGenerated={handleTraceGenerated}
          onOpenTraceDrawer={() => setIsTraceDrawerOpen(true)}
        />

        {/* Role Workspace Routes */}
        <main style={{ flex: 1 }}>
          <Routes>
            {/* Doctor Routes */}
            <Route path="/doctor" element={<DoctorWorkspace onTraceGenerated={handleTraceGenerated} />} />
            <Route path="/doctor/patients" element={<PatientsView onTraceGenerated={handleTraceGenerated} onOpenTraceDrawer={() => setIsTraceDrawerOpen(true)} />} />
            <Route path="/doctor/patients/:patientId" element={<PatientsView onTraceGenerated={handleTraceGenerated} onOpenTraceDrawer={() => setIsTraceDrawerOpen(true)} />} />
            <Route path="/doctor/appointments" element={<AppointmentsView />} />
            <Route path="/doctor/prescriptions" element={<PrescriptionsView />} />
            <Route path="/doctor/lab-reports" element={<LabWorkspace onTraceGenerated={handleTraceGenerated} />} />
            <Route path="/doctor/ai" element={<AiWorkspaceView role="doctor" onTraceGenerated={handleTraceGenerated} onOpenTraceDrawer={() => setIsTraceDrawerOpen(true)} />} />
            <Route path="/doctor/notifications" element={<NotificationsView />} />
            <Route path="/doctor/profile" element={<ProfileView role="doctor" />} />
            <Route path="/doctor/settings" element={<SettingsView />} />

            {/* Nurse Routes */}
            <Route path="/nurse" element={<NurseWorkspace onTraceGenerated={handleTraceGenerated} />} />
            <Route path="/nurse/patients" element={<PatientsView onTraceGenerated={handleTraceGenerated} onOpenTraceDrawer={() => setIsTraceDrawerOpen(true)} />} />
            <Route path="/nurse/patients/:patientId" element={<PatientsView onTraceGenerated={handleTraceGenerated} onOpenTraceDrawer={() => setIsTraceDrawerOpen(true)} />} />
            <Route path="/nurse/appointments" element={<AppointmentsView />} />
            <Route path="/nurse/prescriptions" element={<PrescriptionsView />} />
            <Route path="/nurse/lab-reports" element={<LabWorkspace onTraceGenerated={handleTraceGenerated} />} />
            <Route path="/nurse/insurance" element={<InsuranceWorkspace onTraceGenerated={handleTraceGenerated} />} />
            <Route path="/nurse/ai" element={<AiWorkspaceView role="nurse" onTraceGenerated={handleTraceGenerated} onOpenTraceDrawer={() => setIsTraceDrawerOpen(true)} />} />
            <Route path="/nurse/notifications" element={<NotificationsView />} />
            <Route path="/nurse/profile" element={<ProfileView role="nurse" />} />
            <Route path="/nurse/settings" element={<SettingsView />} />

            {/* Patient Routes */}
            <Route path="/patient" element={<PatientWorkspace onTraceGenerated={handleTraceGenerated} />} />
            <Route path="/patient/appointments" element={<AppointmentsView />} />
            <Route path="/patient/prescriptions" element={<PrescriptionsView />} />
            <Route path="/patient/lab-reports" element={<LabWorkspace onTraceGenerated={handleTraceGenerated} />} />
            <Route path="/patient/insurance" element={<InsuranceWorkspace onTraceGenerated={handleTraceGenerated} />} />
            <Route path="/patient/ai" element={<AiWorkspaceView role="patient" onTraceGenerated={handleTraceGenerated} onOpenTraceDrawer={() => setIsTraceDrawerOpen(true)} />} />
            <Route path="/patient/notifications" element={<NotificationsView />} />
            <Route path="/patient/profile" element={<ProfileView role="patient" />} />
            <Route path="/patient/settings" element={<SettingsView />} />

            {/* Laboratory Routes */}
            <Route path="/laboratory" element={<LabWorkspace onTraceGenerated={handleTraceGenerated} />} />
            <Route path="/laboratory/patients" element={<PatientsView onTraceGenerated={handleTraceGenerated} onOpenTraceDrawer={() => setIsTraceDrawerOpen(true)} />} />
            <Route path="/laboratory/patients/:patientId" element={<PatientsView onTraceGenerated={handleTraceGenerated} onOpenTraceDrawer={() => setIsTraceDrawerOpen(true)} />} />
            <Route path="/laboratory/reports" element={<LabWorkspace onTraceGenerated={handleTraceGenerated} />} />
            <Route path="/laboratory/report-processing" element={<LabWorkspace onTraceGenerated={handleTraceGenerated} />} />
            <Route path="/laboratory/ai" element={<AiWorkspaceView role="lab" onTraceGenerated={handleTraceGenerated} onOpenTraceDrawer={() => setIsTraceDrawerOpen(true)} />} />
            <Route path="/laboratory/notifications" element={<NotificationsView />} />
            <Route path="/laboratory/profile" element={<ProfileView role="lab" />} />
            <Route path="/laboratory/settings" element={<SettingsView />} />

            {/* Insurance Routes */}
            <Route path="/insurance" element={<InsuranceWorkspace onTraceGenerated={handleTraceGenerated} />} />
            <Route path="/insurance/policies" element={<InsuranceWorkspace onTraceGenerated={handleTraceGenerated} />} />
            <Route path="/insurance/claims" element={<InsuranceWorkspace onTraceGenerated={handleTraceGenerated} />} />
            <Route path="/insurance/patients" element={<PatientsView onTraceGenerated={handleTraceGenerated} onOpenTraceDrawer={() => setIsTraceDrawerOpen(true)} />} />
            <Route path="/insurance/patients/:patientId" element={<PatientsView onTraceGenerated={handleTraceGenerated} onOpenTraceDrawer={() => setIsTraceDrawerOpen(true)} />} />
            <Route path="/insurance/ai" element={<AiWorkspaceView role="insurance" onTraceGenerated={handleTraceGenerated} onOpenTraceDrawer={() => setIsTraceDrawerOpen(true)} />} />
            <Route path="/insurance/notifications" element={<NotificationsView />} />
            <Route path="/insurance/profile" element={<ProfileView role="insurance" />} />
            <Route path="/insurance/settings" element={<SettingsView />} />

            {/* Hospital Administration Routes */}
            <Route path="/hospital" element={<HospitalAdminWorkspace onTraceGenerated={handleTraceGenerated} />} />
            <Route path="/hospital/patients" element={<PatientsView onTraceGenerated={handleTraceGenerated} onOpenTraceDrawer={() => setIsTraceDrawerOpen(true)} />} />
            <Route path="/hospital/patients/:patientId" element={<PatientsView onTraceGenerated={handleTraceGenerated} onOpenTraceDrawer={() => setIsTraceDrawerOpen(true)} />} />
            <Route path="/hospital/doctors" element={<DoctorsView />} />
            <Route path="/hospital/nurses" element={<NursesView />} />
            <Route path="/hospital/appointments" element={<AppointmentsView />} />
            <Route path="/hospital/laboratories" element={<LaboratoriesView />} />
            <Route path="/hospital/insurance" element={<InsuranceWorkspace onTraceGenerated={handleTraceGenerated} />} />
            <Route path="/hospital/analytics" element={<AnalyticsView />} />
            <Route path="/hospital/ai" element={<AiWorkspaceView role="hospital" onTraceGenerated={handleTraceGenerated} onOpenTraceDrawer={() => setIsTraceDrawerOpen(true)} />} />
            <Route path="/hospital/notifications" element={<NotificationsView />} />
            <Route path="/hospital/profile" element={<ProfileView role="hospital" />} />
            <Route path="/hospital/settings" element={<SettingsView />} />

            <Route path="*" element={<Navigate to="/doctor" replace />} />
          </Routes>
        </main>
      </div>

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
        const path = role === 'lab' ? '/laboratory' : `/${role}`;
        navigate(path);
      }}
    />
  );
}

export default App;
