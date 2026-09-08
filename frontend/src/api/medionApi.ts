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
  if (!response || response.success === false) return;

  const rawRes = response.result || response.output || (response as any).data || {};
  const resData = (typeof rawRes === 'object' && rawRes !== null)
    ? (rawRes.result_data || rawRes)
    : {};

  const action = response.action_performed || resData.target_action || resData.intent || resData.action || '';

  // 1. Patient Registration / Updates
  const patient = resData.patient || (response as any).patient || (action === 'register_patient' && resData.patient_id ? resData : null);
  if (action === 'register_patient' && patient) {
    dataService.createPatient(patient);
  } else if (action === 'update_patient' && patient) {
    dataService.updatePatient(patient.patient_id, patient);
  } else if (patient && patient.patient_id && !dataService.getPatientById(patient.patient_id)) {
    dataService.createPatient(patient);
  }

  // 2. Appointment Booking / Rescheduling / Cancellation
  const appointment = resData.appointment || (response as any).appointment || (action === 'book_appointment' && resData.appointment_id ? resData : null);
  const appointmentId = resData.appointment_id || (response as any).appointment_id || appointment?.appointment_id;

  if (action === 'cancel_appointment' && appointmentId) {
    dataService.cancelAppointment(appointmentId);
  } else if (action === 'reschedule_appointment' && appointment) {
    dataService.bookAppointment(appointment);
  } else if (action === 'book_appointment' && appointment) {
    dataService.bookAppointment(appointment);
  } else if (appointment && appointment.appointment_id) {
    if (appointment.status === 'CANCELLED') {
      dataService.cancelAppointment(appointment.appointment_id);
    } else {
      dataService.bookAppointment(appointment);
    }
  }

  // 3. Claims
  const claim = resData.claim || (response as any).claim;
  if ((action === 'submit_claim' || action === 'prepare_claim') && claim) {
    dataService.submitClaim(claim);
  }

  // 4. Conversation Context Tracking for Multi-turn
  const needsClarification = Boolean(
    resData.needs_clarification ||
    (response as any).needs_clarification ||
    resData.clarification_question
  );

  if (needsClarification) {
    const ctx = resData.context || (response as any).context || {
      pending_action: resData.target_action || resData.awaiting_action || action,
      collected_entities: resData.parameters_used || resData.extracted_parameters || {},
      missing_fields: resData.missing_parameters || [],
    };
    dataService.setConversationContext(ctx);
  } else if (response.success && !needsClarification) {
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
