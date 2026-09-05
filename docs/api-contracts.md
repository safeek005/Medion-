# MEDION AGENT - API Contracts & Endpoint Specification

All machine-to-machine communication uses structured JSON over HTTPS.

---

## 1. System Health Endpoint

- **Endpoint**: `GET /api/v1/health`
- **Response**:
```json
{
  "success": true,
  "message": "MEDION AGENT Backend API is healthy and operational",
  "data": {
    "status": "UP",
    "phase": "Phase 1 - Foundation",
    "agents_registered": [
      "Patient Agent",
      "Medical Agent",
      "Appointment Agent",
      "Insurance Agent",
      "Assistant Agent"
    ]
  },
  "error": null,
  "timestamp": "2024-09-02T12:00:00Z"
}
```

---

## 2. Mock Data Inspection Endpoints

- **Endpoint**: `GET /api/v1/mock-data/{collection_name}`
- **Parameters**: `collection_name` (e.g. `patients`, `doctors`, `appointments`, `lab_reports`, `insurance_claims`)
- **Query Param**: `search` (Optional, filters patient records)

- **Endpoint**: `GET /api/v1/mock-data/{collection_name}/{key}/{value}`
- **Example**: `GET /api/v1/mock-data/patients/patient_id/PAT-1001`

---

## 3. SNS Workbench Dispatch Endpoint (`POST /api/v1/workbench/dispatch`)

### Patient Agent Action 1: `register_patient`
- **Request**:
```json
{
  "workflow_id": "WF-PAT-001",
  "agent_target": "patient",
  "action": "register_patient",
  "portal_source": "nurse",
  "payload": {
    "full_name": "Arun Kumar",
    "date_of_birth": "2003-05-14",
    "gender": "Male",
    "phone": "9876543210",
    "email": "arun.new@example.com",
    "address": "Coimbatore",
    "blood_group": "O+"
  }
}
```
- **Response**:
```json
{
  "success": true,
  "workflow_id": "WF-PAT-001",
  "target_agent": "Patient Agent",
  "action_performed": "register_patient",
  "output": {
    "agent_id": "AGENT-PATIENT-01",
    "agent_name": "Patient Agent",
    "agent_type": "DATA",
    "summary": "Registered new patient PAT-1004 (Arun Kumar).",
    "result_data": {
      "success": true,
      "patient_id": "PAT-1004",
      "message": "Patient Arun Kumar registered successfully.",
      "patient": {
        "patient_id": "PAT-1004",
        "first_name": "Arun",
        "last_name": "Kumar",
        "dob": "2003-05-14",
        "gender": "Male",
        "phone": "9876543210",
        "email": "arun.new@example.com",
        "address": "Coimbatore"
      }
    }
  }
}
```

### Patient Agent Action 2: `get_patient`
- **Request**: `{"agent_target": "patient", "action": "get_patient", "payload": {"patient_id": "PAT-1001"}}`

### Patient Agent Action 3: `search_patient`
- **Request**: `{"agent_target": "patient", "action": "search_patient", "payload": {"name": "Arun"}}`

### Patient Agent Action 4: `update_patient`
- **Request**:
```json
{
  "agent_target": "patient",
  "action": "update_patient",
  "payload": {
    "patient_id": "PAT-1001",
    "updates": {
      "phone": "9999999999",
      "email": "newemail@example.com",
      "address": "Coimbatore"
    }
  }
}
```

### Patient Agent Action 5: `get_patient_history`
- **Request**: `{"agent_target": "patient", "action": "get_patient_history", "payload": {"patient_id": "PAT-1001"}}`
- **Response History Keys**: `profile`, `medical_records`, `lab_reports`, `appointments`, `prescriptions`, `insurance_policies`, `bills`, `insurance_claims`, `notifications`.

---

### Medical Agent Action 1: `extract_lab_report`
- **Request**: `{"agent_target": "medical", "action": "extract_lab_report", "payload": {"patient_id": "PAT-1001", "report_id": "LABR-1001"}}`

### Medical Agent Action 2: `analyze_lab_report`
- **Request**:
```json
{
  "workflow_id": "WF-MED-001",
  "agent_target": "medical",
  "action": "analyze_lab_report",
  "portal_source": "doctor",
  "payload": {
    "patient_id": "PAT-1001",
    "report_id": "LABR-1001"
  }
}
```
- **Response**:
```json
{
  "success": true,
  "workflow_id": "WF-MED-001",
  "target_agent": "Medical Agent",
  "action_performed": "analyze_lab_report",
  "output": {
    "agent_id": "AGENT-MEDICAL-02",
    "agent_name": "Medical Agent",
    "agent_type": "HYBRID",
    "summary": "Analyzed 3 parameters. Found 2 abnormal value(s). Priority: HIGH.",
    "result_data": {
      "success": true,
      "patient_id": "PAT-1001",
      "report_id": "LABR-1001",
      "priority": "HIGH",
      "abnormal_count": 2,
      "total_count": 3,
      "findings": [
        {
          "test_name": "Hemoglobin",
          "value": 10.4,
          "unit": "g/dL",
          "reference_low": 13.5,
          "reference_high": 17.5,
          "raw_reference": "13.5 - 17.5",
          "status": "LOW",
          "flagged": true
        }
      ],
      "doctor_review_recommended": true
    }
  }
}
```

### Medical Agent Action 3: `compare_lab_reports`
- **Request**: `{"agent_target": "medical", "action": "compare_lab_reports", "payload": {"patient_id": "PAT-1001", "current_report_id": "LABR-1002", "previous_report_id": "LABR-1001"}}`

### Medical Agent Action 4: `get_medical_summary`
- **Request**: `{"agent_target": "medical", "action": "get_medical_summary", "payload": {"patient_id": "PAT-1001"}}`

### Medical Agent Action 5: `explain_lab_report`
- **Request**: `{"agent_target": "medical", "action": "explain_lab_report", "payload": {"patient_id": "PAT-1001", "report_id": "LABR-1001", "audience": "patient"}}`
- **Audience Options**: `"doctor"` (Clinical format) | `"patient"` (Accessible explanation)

---

### Appointment Agent Actions (`agent_target`: `appointment`)

1. **`get_available_slots`**:
   - **Request**: `{"workflow_id": "WF-APT-001", "agent_target": "appointment", "action": "get_available_slots", "payload": {"doctor_id": "DOC-101", "date": "2024-09-10"}}`
2. **`book_appointment`**:
   - **Request**: `{"workflow_id": "WF-APT-002", "agent_target": "appointment", "action": "book_appointment", "payload": {"patient_id": "PAT-1001", "doctor_id": "DOC-101", "hospital_id": "HOSP-001", "date": "2024-09-10", "time_slot": "11:00-11:30", "reason": "Consultation"}}`
3. **`get_appointment`**:
   - **Request**: `{"agent_target": "appointment", "action": "get_appointment", "payload": {"appointment_id": "APT-1001"}}`
4. **`cancel_appointment`**:
   - **Request**: `{"agent_target": "appointment", "action": "cancel_appointment", "payload": {"appointment_id": "APT-1001"}}`
5. **`reschedule_appointment`**:
   - **Request**: `{"agent_target": "appointment", "action": "reschedule_appointment", "payload": {"appointment_id": "APT-1001", "new_date": "2024-09-15", "new_time_slot": "11:00-11:30"}}`

---

### Insurance Agent Actions (`agent_target`: `insurance`)

1. **`verify_insurance`**:
   - **Request**: `{"workflow_id": "WF-INS-001", "agent_target": "insurance", "action": "verify_insurance", "payload": {"patient_id": "PAT-1001"}}`
2. **`get_coverage`**:
   - **Request**: `{"agent_target": "insurance", "action": "get_coverage", "payload": {"patient_id": "PAT-1001", "service_type": "CONSULTATION"}}`
3. **`prepare_claim`**:
   - **Request**: `{"agent_target": "insurance", "action": "prepare_claim", "payload": {"patient_id": "PAT-1001", "bill_id": "BILL-1001", "service_type": "CONSULTATION"}}`
4. **`submit_claim`**:
   - **Request**: `{"workflow_id": "WF-INS-002", "agent_target": "insurance", "action": "submit_claim", "payload": {"claim_id": "CLM-1001"}}`
   - **Mock Adjudication Result**: `status`: `APPROVED`, `approved_amount`: `5197.5`.
5. **`get_claim_status`**:
   - **Request**: `{"agent_target": "insurance", "action": "get_claim_status", "payload": {"claim_id": "CLM-1001"}}`

---

### Assistant Agent Actions (`agent_target`: `assistant`)

1. **`interpret_request`**:
   - **Request**: `{"workflow_id": "WF-AST-001", "agent_target": "assistant", "action": "interpret_request", "payload": {"message": "Analyze LABR-1001 for PAT-1001", "user_role": "doctor"}}`
   - **Response**: `{"success": true, "intent": "analyze_lab_report", "target_agent": "medical", "target_action": "analyze_lab_report", "confidence": 0.95, "required_parameters": {"report_id": "LABR-1001", "patient_id": "PAT-1001"}, "missing_parameters": []}`
2. **`extract_parameters`**:
   - **Request**: `{"agent_target": "assistant", "action": "extract_parameters", "payload": {"message": "Book appointment for PAT-1001 with DOC-101 on 2024-09-10 at 10:00"}}`
   - **Response**: `{"success": true, "parameters": {"patient_id": "PAT-1001", "doctor_id": "DOC-101", "date": "2024-09-10", "time_slot": "10:00"}}`
3. **`create_workbench_request`**:
   - **Request**: `{"agent_target": "assistant", "action": "create_workbench_request", "payload": {"intent": "verify_insurance", "parameters": {"patient_id": "PAT-1001"}, "portal_source": "nurse"}}`
   - **Response**: `{"success": true, "workbench_request": {"workflow_id": "WF-AST-INSURANCE-001", "agent_target": "insurance", "action": "verify_insurance", "portal_source": "nurse", "payload": {"patient_id": "PAT-1001"}}}`
4. **`format_response`**:
   - **Request**: `{"agent_target": "assistant", "action": "format_response", "payload": {"specialized_agent_result": {"success": true, "summary": "Policy POL-701 is ACTIVE."}, "user_role": "patient"}}`
   - **Response**: `{"success": true, "user_role": "patient", "formatted_text": "Hello! Here is your update: Policy POL-701 is ACTIVE."}`
5. **`handle_clarification`**:
   - **Request**: `{"agent_target": "assistant", "action": "handle_clarification", "payload": {"target_action": "book_appointment", "missing_parameters": ["doctor_id", "date"]}}`
   - **Response**: `{"success": true, "needs_clarification": true, "clarification_question": "To proceed with book_appointment, please provide: doctor_id, date."}`




