# MEDION AGENT System Architecture

## 1. Executive Summary

MEDION AGENT is a college-level AI healthcare management and workflow automation prototype. It demonstrates how multiple specialized AI agents, orchestrated by SNS Workbench, can interact with interconnected mock healthcare databases to automate clinical and administrative operations.

---

## 2. Architectural Layers

```text
                       USER (Portals)
                         │
                         ▼
                 ASSISTANT AGENT
                   AI / HYBRID
                         │
                Intent + Parameters
                         │
                         ▼
                  SNS WORKBENCH
                   ORCHESTRATOR
                         │
        ┌────────────────┼────────────────┐
        ▼                ▼                ▼
     PATIENT          MEDICAL        APPOINTMENT
      AGENT            AGENT            AGENT
        │                │                │
        └────────────────┼────────────────┘
                         ▼
                    INSURANCE
                      AGENT
```

> [!IMPORTANT]
> **Architectural Distinction**:
> - **Assistant Agent ≠ Orchestrator**: The Assistant Agent is an Intent Parsing + Parameter Extraction + Response Formatting layer. It converts natural text into structured Workbench requests.
> - **SNS Workbench = Orchestrator**: SNS Workbench is the primary workflow orchestrator that dispatches actions to specialized core agents. The Assistant Agent does **NOT** call specialized core agents directly.

---

## 3. Data & Agent Flow Sequence

1. **User Request**: User sends natural-language query via Portal (e.g. "Analyze LABR-1001 for PAT-1001").
2. **Intent Parsing**: Assistant Agent interprets intent, extracts parameters (`report_id: LABR-1001`, `patient_id: PAT-1001`), and builds a structured `WorkbenchRequest`.
3. **Workbench Orchestration**: SNS Workbench dispatches `WorkbenchRequest` to target agent (`Medical Agent`).
4. **Specialized Processing**:
   - `Patient Agent` (DATA/RULE) handles patient records & history.
   - `Medical Agent` (AI/HYBRID) performs lab evaluation & clinical summaries.
   - `Appointment Agent` (DATA/RULE) manages slot booking & schedule updates.
   - `Insurance Agent` (RULE/HYBRID) handles eligibility & claim adjudication.
5. **Result Dispatch**: Target agent returns structured `WorkbenchResponse` to SNS Workbench.
6. **Response Formatting**: SNS Workbench routes response to Assistant Agent (`format_response`), which generates role-aware natural text for Doctor, Nurse, or Patient.
7. **Portal Update**: SNS Workbench updates Portal UI.

---

## 4. Isolation & Safety Boundaries

- **Strict Isolation**: MEDION AGENT runs independently without external project dependencies.
- **Synthetic Data**: Uses 100% mock JSON datasets containing synthetic patient names, record numbers, and clinical parameters.
- **No Real Healthcare Integration**: Simulated interfaces eliminate any risk to real clinical software or live patient data.
