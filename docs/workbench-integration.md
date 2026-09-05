# MEDION AGENT - SNS Workbench Integration Guide

## 1. Overview

SNS Workbench acts as the primary orchestrator between user portals and MEDION AGENT's 5 core agents.

```text
User Portal  ──(HTTP POST)──>  SNS Workbench  ──(Dispatch)──>  MEDION Agent API  ──(Structured JSON)──>  SNS Workbench  ──(Update)──>  Portal
```

---

## 2. Trigger Payload Standard

SNS Workbench invokes MEDION AGENT by sending a `POST` request to `/api/v1/workbench/dispatch`.

### Fields Required:
1. `workflow_id`: Unique identifier tracking the end-to-end workflow execution.
2. `agent_target`: Target core agent (`patient`, `medical`, `appointment`, `insurance`, `assistant`).
3. `action`: Domain action to perform.
4. `portal_source`: Portal submitting the request (`doctor`, `nurse`, `patient`, `lab`, `hospital`).
5. `payload`: Key-value JSON parameters for execution.

---

## 3. Sample Workflow Dispatch Mapping

| Portal Source | Target Agent | Action | Next Workflow Step |
| :--- | :--- | :--- | :--- |
| **Patient Portal** | `appointment` | `get_available_slots` | Display doctor slot availability calendar |
| **Patient Portal** | `appointment` | `book_appointment` | Confirm appointment (`APT-xxxx`) & update portal schedule |
| **Nurse Portal** | `insurance` | `verify_insurance` | Verify policy active status & copay percentage |
| **Nurse Portal** | `insurance` | `prepare_claim` | Prepare claim (`CLM-xxxx`) from bill & policy data |
| **Nurse Portal** | `insurance` | `submit_claim` | Submit claim to `MockInsuranceService` & receive adjudication |
| **Lab Portal** | `medical` | `extract_lab_report` | Normalize report parameters & parse reference bounds |
| **Doctor Portal** | `medical` | `analyze_lab_report` | Flag abnormal values to Doctor Portal |
| **Doctor Portal** | `patient` | `get_patient_history` | Retrieve multi-dataset aggregated history for patient |

---

### Scenario C: Assistant Agent Intent Parsing & Workbench Routing Workflow
```text
Doctor Portal   ──>  Assistant Agent (interpret_request)   ──>  Output Intent: analyze_lab_report
Assistant Agent ──>  Assistant Agent (create_workbench)    ──>  Build WorkbenchRequest (Medical Agent)
SNS Workbench   ──>  Medical Agent (analyze_lab_report)   ──>  Return Lab Analysis Output
SNS Workbench   ──>  Assistant Agent (format_response)     ──>  Generate Role-Aware Clinical Brief
```

### Scenario D: Assistant Agent Clarification Workflow
```text
Patient Portal  ──>  Assistant Agent (interpret_request)   ──>  "Book appointment for PAT-1001"
Assistant Agent ──>  Detect Missing Parameters             ──>  Missing: doctor_id, date, time_slot
Assistant Agent ──>  Assistant Agent (handle_clarification)──>  Prompt: "Please specify doctor and date."
```


