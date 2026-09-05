export type UserRole = 'doctor' | 'nurse' | 'patient' | 'lab' | 'insurance' | 'hospital';

export type CoreAgentName = 'patient' | 'medical' | 'appointment' | 'insurance' | 'assistant';

export interface PatientProfile {
  patient_id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: string;
  blood_group: string;
  phone: string;
  email: string;
  address: string;
  emergency_contact: {
    name: string;
    relationship: string;
    phone: string;
  };
  primary_doctor_id: string;
  insurance_policy_id: string;
}

export interface LabReportItem {
  report_id: string;
  patient_id: string;
  laboratory_id: string;
  doctor_id: string;
  test_type: string;
  test_date: string;
  results: Array<{
    parameter: string;
    value: number;
    unit: string;
    reference_range: string;
    is_abnormal?: boolean;
    abnormality_direction?: 'HIGH' | 'LOW' | 'NORMAL';
  }>;
  status: string;
}

export interface AppointmentItem {
  appointment_id: string;
  patient_id: string;
  doctor_id: string;
  hospital_id: string;
  date: string;
  time_slot: string;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'RESCHEDULED';
  reason: string;
}

export interface WorkbenchRequest {
  workflow_id?: string;
  agent_target?: CoreAgentName;
  action?: string;
  portal_source?: string;
  message?: string;
  user_role?: string;
  payload?: Record<string, any>;
}

export interface AgentOutput {
  agent_id: string;
  agent_name: string;
  agent_type: string;
  summary: string;
  result_data: Record<string, any>;
  next_recommended_action?: string;
}

export interface WorkbenchResponse {
  success: boolean;
  workflow_id?: string;
  target_agent?: string;
  action_performed?: string;
  output?: AgentOutput;
  result?: any;
  errors?: string[];
  execution_trace?: any;
  timestamp?: string;
}

export interface ExecutionTraceStep {
  id: string;
  timestamp: string;
  workflowId: string;
  portalSource: string;
  agentTarget: string;
  action: string;
  durationMs: number;
  success: boolean;
  request: WorkbenchRequest;
  response: WorkbenchResponse;
}
