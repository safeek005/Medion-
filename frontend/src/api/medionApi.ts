import {
  MOCK_PRESCRIPTIONS,
  MOCK_NOTIFICATIONS,
  PrescriptionItem,
  NotificationItem,
} from '../data/mockDatasets';
import { PatientProfile, LabReportItem, AppointmentItem, WorkbenchRequest, WorkbenchResponse } from '../types';
import { dispatchToWorkbench, generateWorkflowId } from './workbench';
import { dataService } from '../services/dataService';

// Centralized API & Service Layer for MEDION Frontend powered by Persistent Data Layer
export async function searchPatients(query: string): Promise<PatientProfile[]> {
  return dataService.searchPatients(query);
}

export async function getPatientById(patientId: string): Promise<PatientProfile | null> {
  return dataService.getPatientById(patientId);
}

export async function getLabReportById(reportId: string): Promise<LabReportItem | null> {
  return dataService.getLabReportById(reportId);
}

export async function getAppointments(): Promise<AppointmentItem[]> {
  return dataService.getAppointments();
}

export async function getPrescriptions(): Promise<PrescriptionItem[]> {
  return MOCK_PRESCRIPTIONS;
}

export async function getNotifications(): Promise<NotificationItem[]> {
  return MOCK_NOTIFICATIONS;
}

/**
 * Synchronizes confirmed database entities returned by MEDION Agent actions
 * into the client-side shared database.
 */
function syncAgentResultWithDatabase(response: WorkbenchResponse) {
  if (!response || !response.success || !response.output) return;

  const resData = response.output.result_data || {};
  const action = response.action_performed || resData.target_action || resData.intent || '';

  // 1. Patient Registration / Updates
  if (action === 'register_patient' || resData.patient?.created_at || (resData.patient && !dataService.getPatientById(resData.patient.patient_id))) {
    if (resData.patient) {
      dataService.createPatient(resData.patient);
    }
  } else if (action === 'update_patient' && resData.patient) {
    dataService.updatePatient(resData.patient.patient_id, resData.patient);
  }

  // 2. Appointment Booking / Rescheduling / Cancellation
  if (action === 'book_appointment' && resData.appointment) {
    dataService.bookAppointment(resData.appointment);
  } else if (action === 'cancel_appointment' && resData.appointment_id) {
    dataService.cancelAppointment(resData.appointment_id);
  } else if (action === 'reschedule_appointment' && resData.appointment) {
    dataService.bookAppointment(resData.appointment); // bookAppointment updates if ID exists
  }

  // 3. Claims
  if (action === 'submit_claim' && resData.claim) {
    dataService.submitClaim(resData.claim);
  }

  // 4. Conversation Context Tracking for Multi-turn
  if (resData.needs_clarification && resData.context) {
    dataService.setConversationContext(resData.context);
  } else if (resData.needs_clarification && resData.awaiting_action) {
    dataService.setConversationContext({
      action: resData.awaiting_action,
      patient_name: resData.patient_name,
      doctor_id: resData.doctor_id,
      patient_id: resData.patient_id,
    });
  } else if (response.success && !resData.needs_clarification) {
    // Operation completed successfully, clear active multi-turn context
    dataService.clearConversationContext();
  }
}

// Centralized Workbench Dispatcher
export async function dispatchWorkbench(request: WorkbenchRequest): Promise<WorkbenchResponse> {
  // Attach active conversation context if present
  const activeCtx = dataService.getConversationContext();
  if (activeCtx && request.payload && !request.payload.conversation_context) {
    request.payload.conversation_context = activeCtx;
  }

  const res = await dispatchToWorkbench(request);
  syncAgentResultWithDatabase(res);
  return res;
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
  return await dispatchWorkbench(req);
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
  return await dispatchWorkbench(req);
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
  return await dispatchWorkbench(req);
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
  return await dispatchWorkbench(req);
}

export async function executeAssistantAction(
  message: string,
  portalSource: string = 'doctor',
  contextPayload: Record<string, any> = {}
): Promise<WorkbenchResponse> {
  const activeCtx = dataService.getConversationContext();
  const req: WorkbenchRequest = {
    workflow_id: generateWorkflowId(portalSource),
    agent_target: 'assistant',
    action: 'interpret_request',
    portal_source: portalSource,
    user_role: portalSource,
    payload: {
      message,
      portal_source: portalSource,
      user_role: portalSource,
      conversation_context: activeCtx,
      ...contextPayload,
    },
  };
  return await dispatchWorkbench(req);
}

