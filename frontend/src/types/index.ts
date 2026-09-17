export type UserRole = 'doctor' | 'nurse' | 'patient' | 'lab' | 'insurance' | 'hospital' | 'receptionist';

export type CoreAgentName = 'patient' | 'medical' | 'appointment' | 'insurance' | 'assistant';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  organization: string;
  facility: string;
  department?: string;
  title?: string;
  phone?: string;
}

export interface PatientProfile {
  patient_id: string;
  first_name: string;
  last_name: string;
  date_of_birth?: string;
  dob?: string;
  gender?: string;
  blood_group?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  emergency_contact?: {
    name: string;
    relationship: string;
    phone: string;
  } | string | null;
  primary_doctor_id?: string | null;
  insurance_policy_id?: string | null;
  allergies?: string[] | string | null;
  chronic_conditions?: string[] | null;
  vitals?: {
    bp?: string;
    pulse?: number | string;
    spo2?: number | string;
    temp?: string;
    rr?: number | string;
    weight?: string;
    height?: string;
    notes?: string;
    last_taken?: string;
  } | null;
  created_at?: string;
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
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'RESCHEDULED' | 'IN_CONSULTATION' | string;
  reason: string;
  doctor_name?: string;
  patient_name?: string;
  specialty?: string;
  start_time?: string;
  end_time?: string;
  reason_for_visit?: string;
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

export interface ProviderInfo {
  provider_name: string;
  is_fallback: boolean;
  fallback_reason?: string | null;
  endpoint_used?: string;
  model?: string;
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
  provider_info?: ProviderInfo;
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
  providerInfo?: ProviderInfo;
}
