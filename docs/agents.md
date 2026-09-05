# MEDION AGENT - Core AI Agents Specification

MEDION AGENT uses **5 core agents**. Each agent is assigned an execution classification based on operational requirements.

---

## 1. Patient Agent (Phase 2 Implemented)

- **Agent ID**: `AGENT-PATIENT-01`
- **Classification**: `DATA` / `RULE` (Strictly deterministic — **No LLM**)
- **Responsibilities**:
  - Patient registration and unique sequential ID generation (`PAT-xxxx`).
  - Single patient profile retrieval by ID.
  - Deterministic patient search by name, phone, email, or Patient ID with partial matching.
  - Profile updates (permitted fields: phone, email, address, emergency contact, primary doctor ID, insurance policy ID).
  - Aggregating complete medical and administrative history across mock datasets.
- **Strict Boundary Control**: Profile updates **never** modify cross-domain collections (`medical_records`, `lab_reports`, `prescriptions`, `insurance_policies`, `appointments`, `bills`, `insurance_claims`, `notifications`) or alter `patient_id`.
- **Supported Actions**:
  1. `register_patient`: Validates fields, checks duplicates, generates `PAT-xxxx` ID, saves patient record.
  2. `get_patient`: Retrieves patient profile by `patient_id`.
  3. `search_patient`: Performs multi-field search returning matching patient profiles.
  4. `update_patient`: Mutates allowed profile attributes while keeping `patient_id` and cross-domain data immutable.
  5. `get_patient_history`: Aggregates profile alongside all linked medical records, lab reports, appointments, prescriptions, policies, bills, claims, and notifications.


---

## 2. Medical Agent (Phase 3 Implemented)

- **Agent ID**: `AGENT-MEDICAL-02`
- **Classification**: `AI` / `HYBRID` (Deterministic rules for evaluation + LLM explanation engine with fallback)
- **Responsibilities**:
  - Normalizing raw/mock lab reports and parsing reference range formats (`13-17`, `13 to 17`, `<= 200`, `>= 50`).
  - Abnormality classification (`LOW`, `NORMAL`, `HIGH`, `UNKNOWN`) and clinical priority calculation (`HIGH`, `MEDIUM`, `LOW`).
  - Numerical report comparison calculating absolute change, percentage change (safely handling zero division as `None`), and trends (`INCREASING`, `DECREASING`, `STABLE`, `NEW`, `MISSING_FROM_CURRENT`).
  - Aggregating clinical medical summaries for patients.
  - Generating audience-tailored natural language explanations (`doctor` vs `patient`).
- **LLM Provider & Fallback Engine**: Uses `MedicalAIProvider` to call external LLM if credentials (`OPENAI_API_KEY`/`GEMINI_API_KEY`) are present; seamlessly falls back to structured deterministic templates when offline/unconfigured.
- **Critical Medical Safety Boundaries**:
  - **NO autonomous diagnosis** (identifies observed data & reference range deviations, but explicitly refrains from claiming definitive diagnosis).
  - **NO prescriptions**, medication modifications, treatment plans, or emergency directives.
  - Read-only data access (does not mutate patient records, prescriptions, insurance, or appointments).
- **Supported Actions**:
  1. `extract_lab_report`: Normalizes report test parameters and parses reference range bounds.
  2. `analyze_lab_report`: Evaluates test values against reference ranges, flags abnormal parameters, assigns priority.
  3. `compare_lab_reports`: Calculates numerical diffs, percentage changes, and trend directions between current and previous lab reports.
  4. `get_medical_summary`: Aggregates clinical visit records, lab reports, prescriptions, and flagged abnormal values.
  5. `explain_lab_report`: Produces concise clinical summaries for doctors or accessible, reassuring breakdowns for patients.


---

## 3. Appointment Agent (Phase 4 Implemented)

- **Agent ID**: `AGENT-APPOINTMENT-03`
- **Classification**: `DATA` / `RULE` (Strictly deterministic — **No LLM**)
- **Responsibilities**:
  - Deterministic slot calculation inspecting doctor master schedules vs booked appointments.
  - Booking new appointments (`APT-xxxx`) with patient, doctor, and slot validation.
  - Appointment retrieval and status management.
  - Cancellation tracking while preserving history.
  - Rescheduling to new valid slots with conflict prevention.
- **Cross-Domain Isolation**: Only mutates `appointments` collection. Does not alter patient profiles, medical records, lab reports, prescriptions, policies, or claims.
- **Supported Actions**:
  1. `get_available_slots`: Evaluates doctor master availability against existing bookings for a target date.
  2. `book_appointment`: Validates patient/doctor/hospital, verifies slot availability, creates `APT-xxxx` record.
  3. `get_appointment`: Fetches complete appointment record by ID.
  4. `cancel_appointment`: Updates status to `CANCELLED` (preserves historical record).
  5. `reschedule_appointment`: Validates new slot availability, updates appointment date/time while keeping `appointment_id` immutable.

---

## 4. Insurance Agent (Phase 4 Implemented)

- **Agent ID**: `AGENT-INSURANCE-04`
- **Classification**: `RULE` / `HYBRID` (Deterministic policy rules & mock payer adjudication)
- **Responsibilities**:
  - Verifying patient policy active status and eligibility.
  - Looking up coverage percentages and copay breakdown for specified service types.
  - Preparing structured claims (`CLM-xxxx`) using real bill figures.
  - Submitting claims to `MockInsuranceService` external payer simulation for adjudication (`APPROVED`, `PARTIALLY_APPROVED`, `REJECTED`, `UNDER_REVIEW`).
  - Claim status and adjudication notes lookup.
- **Cross-Domain Isolation**: Only mutates `insurance_claims` collection. Does not alter patient profiles, medical records, lab reports, prescriptions, or appointments.
- **Supported Actions**:
  1. `verify_insurance`: Checks policy active status and eligibility.
  2. `get_coverage`: Returns coverage percentage and copay breakdown for a service.
  3. `prepare_claim`: Builds `CLM-xxxx` claim record from patient policy and bill figures.
  4. `submit_claim`: Sends claim to `MockInsuranceService` simulation and updates adjudication status.
  5. `get_claim_status`: Fetches claim status and adjudication notes by ID.


---

## 5. Assistant Agent (Phase 5 Implemented)

- **Agent ID**: `AGENT-ASSISTANT-05`
- **Classification**: `AI` / `HYBRID` (Deterministic regex/keyword parser + LLM provider fallback engine)
- **Responsibilities**:
  - Natural-language interface for Doctor, Nurse, and Patient portals.
  - Classifying user intent across all 20 actions in Patient, Medical, Appointment, and Insurance domains.
  - Extracting structured parameters (`PAT-xxxx`, `DOC-xxxx`, `LABR-xxxx`, `APT-xxxx`, `CLM-xxxx`, `BILL-xxxx`, `POL-xxxx`, dates, times, audiences).
  - Building valid `WorkbenchRequest` payloads for SNS Workbench to dispatch.
  - Formatting specialized agent results into role-aware text (`doctor`, `nurse`, `patient`).
  - Handling missing parameter clarification and resolving ambiguous requests.
- **Architectural & Safety Boundaries**:
  - **Assistant ≠ Orchestrator**: SNS Workbench is the orchestrator. Assistant produces structured routing requests; it does **NOT** call core agents directly.
  - **Fact Primacy**: Response formatting is strictly grounded in domain agent results (`specialized_agent_result`). Never fabricates clinical findings, insurance status, or appointment bookings.
  - Read-only data access (does not mutate domain datasets).
- **Supported Actions**:
  1. `interpret_request`: Identifies intent, target agent/action, confidence score, required parameters, and missing parameters.
  2. `extract_parameters`: Extracts structured IDs, dates, times, and entity fields from natural text.
  3. `create_workbench_request`: Converts intent & parameters into a valid `WorkbenchRequest` dictionary payload.
  4. `format_response`: Formats specialized agent result JSON into role-aware text (`doctor`, `nurse`, `patient`).
  5. `handle_clarification`: Generates focused clarification prompts for missing parameters or ambiguous intents.

