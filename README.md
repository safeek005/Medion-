# MEDION AGENT

**MEDION AGENT** is a college-level AI healthcare management and automation prototype system powered by specialized AI agents, SNS Workbench workflow orchestration, interconnected mock healthcare data, and multiple user portals.

> [!IMPORTANT]
> **Prototype System Notice**: MEDION AGENT is a functional demonstration/prototype for academic and educational purposes. It relies exclusively on synthetic mock healthcare data and simulated external integrations.

---

## 🏛️ Core Architecture

```text
User Portal (Doctor, Nurse, Patient, Lab, Hospital)
       ↓
SNS Workbench (Workflow Orchestration)
       ↓
Specialized MEDION Agents (Patient, Medical, Appointment, Insurance, Assistant)
       ↓
Mock Healthcare Ecosystem / Mock External Systems
```

---

## 🤖 The 5 Core Agents

1. **Patient Agent** (DATA / RULE - **Phase 2 Implemented**): Patient registration, auto ID generation (`PAT-xxxx`), deterministic multi-field search, profile retrieval, profile updates with strict boundary control, and full history aggregation across all mock datasets.
2. **Medical Agent** (AI / HYBRID - **Phase 3 Implemented**): Lab report extraction, reference range parsing, abnormality detection (`LOW`/`NORMAL`/`HIGH`/`UNKNOWN`), report trend comparison, clinical medical summary, and audience-tailored AI explanation (`doctor` vs `patient`) with deterministic fallback and strict safety disclaimers (no autonomous diagnosis).
3. **Appointment Agent** (DATA / RULE - **Phase 4 Implemented**): Doctor slot availability calculation, appointment booking (`APT-xxxx`), retrieval, cancellation while preserving record history, and rescheduling with conflict prevention.
4. **Insurance Agent** (RULE / HYBRID - **Phase 4 Implemented**): Policy verification, active eligibility checking, copay & coverage calculation, structured claim preparation (`CLM-xxxx`), and claim submission to `MockInsuranceService` external simulation for adjudication.
5. **Assistant Agent** (AI / HYBRID - **Phase 5 Implemented**): Natural-language query interface for Doctor, Nurse, and Patient portals. Performs intent recognition, entity parameter extraction across all 20 domain actions, Workbench request generation, role-aware response formatting, missing parameter detection, and clarification prompts with deterministic fallback and strict safety boundaries.

---

## 📁 Project Structure

```text
medion-agent/
├── README.md
├── .env.example
├── .gitignore
├── backend/
│   ├── app/
│   │   ├── agents/            # Base agent architecture & agent skeletons
│   │   │   ├── base.py
│   │   │   ├── patient/
│   │   │   ├── medical/
│   │   │   ├── appointment/
│   │   │   ├── insurance/
│   │   │   └── assistant/
│   │   ├── api/               # FastAPI endpoints (health, mock-data, workbench router)
│   │   ├── models/            # Shared Pydantic data schemas & Workbench wrappers
│   │   ├── services/          # Mock database loader service
│   │   └── main.py            # FastAPI entrypoint
│   ├── requirements.txt
│   └── tests/                 # Automated Pytest suite
├── mock-data/                 # 14 interconnected synthetic JSON datasets
├── frontend/                  # User portal skeleton directories (Doctor, Nurse, Patient, Lab, Hospital)
├── docs/                      # Technical documentation (architecture, agents, api-contracts, workbench)
└── scripts/                   # Data validation & setup helper scripts
```

---

## 🚀 Getting Started

### Prerequisites
- Python 3.10+ installed

### Setup Backend Environment

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # Windows (PowerShell)
   .\venv\Scripts\Activate.ps1
   # Linux/macOS
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

### Running the System

Start the FastAPI backend server:
```bash
uvicorn app.main:app --reload --port 8000
```
- API Base URL: `http://localhost:8000`
- Interactive API Docs (Swagger): `http://localhost:8000/docs`
- Health Check: `http://localhost:8000/health`

### Running Verification & Tests

Run mock data link integrity validation:
```bash
python scripts/verify_mock_data.py
```

Run test suite:
```bash
pytest backend/tests
```
