import {
  MOCK_PATIENTS_LIST,
  MOCK_LAB_REPORT,
  MOCK_APPOINTMENTS,
  MOCK_PRESCRIPTIONS,
  MOCK_NOTIFICATIONS,
  PrescriptionItem,
  NotificationItem,
} from '../data/mockDatasets';
import { PatientProfile, LabReportItem, AppointmentItem, WorkbenchRequest, WorkbenchResponse } from '../types';
import { dispatchToWorkbench, generateWorkflowId } from './workbench';

// Centralized API & Service Layer for MEDION Frontend
export async function searchPatients(query: string): Promise<PatientProfile[]> {
  const q = query.toLowerCase();
  return MOCK_PATIENTS_LIST.filter(
    (p) =>
      `${p.first_name} ${p.last_name}`.toLowerCase().includes(q) ||
      p.patient_id.toLowerCase().includes(q) ||
      p.phone.includes(q) ||
      p.email.toLowerCase().includes(q)
  );
}

export async function getPatientById(patientId: string): Promise<PatientProfile | null> {
  return MOCK_PATIENTS_LIST.find((p) => p.patient_id === patientId) || null;
}

export async function getLabReportById(reportId: string): Promise<LabReportItem | null> {
  if (reportId === 'LABR-1001') return MOCK_LAB_REPORT;
  return null;
}

export async function getAppointments(): Promise<AppointmentItem[]> {
  return MOCK_APPOINTMENTS;
}

export async function getPrescriptions(): Promise<PrescriptionItem[]> {
  return MOCK_PRESCRIPTIONS;
}

export async function getNotifications(): Promise<NotificationItem[]> {
  return MOCK_NOTIFICATIONS;
}

// Centralized Workbench Dispatcher
export async function dispatchWorkbench(request: WorkbenchRequest): Promise<WorkbenchResponse> {
  return await dispatchToWorkbench(request);
}

// Domain Action Workbench Dispatchers (Structured Requests)
export async function executePatientAction(
  action: string,
  payload: Record<string, any>,
  portalSource: string = 'doctor'
): Promise<WorkbenchResponse> {
  const req: WorkbenchRequest = {
    workflow_id: generateWorkflowId(portalSource),
    agent_target: 'patient',
    action,
    portal_source: portalSource,
    payload,
  };
  return await dispatchToWorkbench(req);
}

export async function executeMedicalAction(
  action: string,
  payload: Record<string, any>,
  portalSource: string = 'doctor'
): Promise<WorkbenchResponse> {
  const req: WorkbenchRequest = {
    workflow_id: generateWorkflowId(portalSource),
    agent_target: 'medical',
    action,
    portal_source: portalSource,
    payload,
  };
  return await dispatchToWorkbench(req);
}

export async function executeAppointmentAction(
  action: string,
  payload: Record<string, any>,
  portalSource: string = 'doctor'
): Promise<WorkbenchResponse> {
  const req: WorkbenchRequest = {
    workflow_id: generateWorkflowId(portalSource),
    agent_target: 'appointment',
    action,
    portal_source: portalSource,
    payload,
  };
  return await dispatchToWorkbench(req);
}

export async function executeInsuranceAction(
  action: string,
  payload: Record<string, any>,
  portalSource: string = 'doctor'
): Promise<WorkbenchResponse> {
  const req: WorkbenchRequest = {
    workflow_id: generateWorkflowId(portalSource),
    agent_target: 'insurance',
    action,
    portal_source: portalSource,
    payload,
  };
  return await dispatchToWorkbench(req);
}

export async function executeAssistantAction(
  message: string,
  portalSource: string = 'doctor',
  contextPayload: Record<string, any> = {}
): Promise<WorkbenchResponse> {
  const req: WorkbenchRequest = {
    workflow_id: generateWorkflowId(portalSource),
    agent_target: 'assistant',
    action: 'interpret_request',
    portal_source: portalSource,
    payload: { message, ...contextPayload },
  };
  return await dispatchToWorkbench(req);
}
