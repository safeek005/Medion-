/**
 * MEDION AGENT - Frontend Application Engine
 * Primary Master Orchestrator: SNS Agent Workbench
 */

// Centralized Configuration - SNS Workbench Webhook Endpoint
const CONFIG = {
  // SNS Workbench Webhook URL (Master Orchestrator)
  workbenchWebhookUrl: localStorage.getItem('MEDION_WORKBENCH_URL') || 'https://api.agents.snsihub.ai/webhook/c52f49ea-9ddb-45bd-ad60-728faebaa8bd',
  // Local FastAPI Backend Health Check Endpoint
  backendHealthUrl: `${window.location.origin}/health`
};

let activeRole = 'doctor';
let workflowCounter = 100;

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
  initUI();
  checkBackendHealth();
  setInterval(checkBackendHealth, 15000);
});

function initUI() {
  const urlInput = document.getElementById('workbench-url-input');
  if (urlInput) urlInput.value = CONFIG.workbenchWebhookUrl;
}

function saveConfig() {
  const urlInput = document.getElementById('workbench-url-input');
  if (urlInput) {
    CONFIG.workbenchWebhookUrl = urlInput.value.trim();
    localStorage.setItem('MEDION_WORKBENCH_URL', CONFIG.workbenchWebhookUrl);
    alert('SNS Workbench Webhook URL updated successfully!');
  }
}

// Check Backend Health
async function checkBackendHealth() {
  const statusElem = document.getElementById('backend-status-text');
  if (!statusElem) return;

  try {
    const res = await fetch(CONFIG.backendHealthUrl);
    if (res.ok) {
      statusElem.textContent = 'Backend Service Layer Connected';
      statusElem.parentElement.style.borderColor = 'rgba(16, 185, 129, 0.3)';
    } else {
      statusElem.textContent = 'Backend Service Degraded';
    }
  } catch (err) {
    statusElem.textContent = 'Backend Service Unavailable';
    statusElem.parentElement.style.borderColor = 'rgba(244, 63, 94, 0.3)';
  }
}

// Switch Role Portals
function switchRole(role) {
  activeRole = role;
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.portal-view').forEach(view => view.classList.remove('active'));

  if (event && event.currentTarget) {
    event.currentTarget.classList.add('active');
  }
  const viewElem = document.getElementById(`portal-${role}`);
  if (viewElem) viewElem.classList.add('active');
}

/**
 * Primary Core Request Dispatcher
 * Sends ALL natural-language and structured requests directly to the SNS Agent Workbench Webhook.
 * NO client-side pre-routing or silent direct backend bypasses.
 */
async function sendRequestToOrchestrator(requestPayload) {
  workflowCounter++;
  const workflowId = requestPayload.workflow_id || `WF-${activeRole.toUpperCase().slice(0,3)}-${workflowCounter}`;
  requestPayload.workflow_id = workflowId;

  const startTime = performance.now();
  let responseData = null;
  let success = false;

  const targetUrl = CONFIG.workbenchWebhookUrl;

  try {
    const res = await fetch(targetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestPayload)
    });

    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      responseData = await res.json();
    } else {
      const rawText = await res.text();
      responseData = { success: res.ok, result: rawText };
    }
    success = res.ok;
  } catch (err) {
    // Network / HTTP / Timeout Error Handling without throwing unhandled exceptions or crashing
    responseData = {
      success: false,
      error: `Failed to communicate with SNS Agent Workbench Webhook (${targetUrl}): ${err.message}`,
      status: 'connection_error'
    };
    success = false;
  }

  const duration = Math.round(performance.now() - startTime);

  // Record Real-Time Activity Trace
  addActivityTrace(
    workflowId,
    requestPayload.portal_source || activeRole,
    requestPayload.agent_target || 'main_orchestrator',
    requestPayload.action || 'nlu_route',
    duration,
    success,
    requestPayload,
    responseData
  );

  return responseData;
}

// Render Workflow Activity Panel
function addActivityTrace(workflowId, portalSource, targetAgent, action, duration, success, request, response) {
  const activityLog = document.getElementById('activity-log');
  if (!activityLog) return;

  const item = document.createElement('div');
  item.className = 'trace-item';
  if (!success) item.style.borderLeftColor = 'var(--rose)';

  item.innerHTML = `
    <div class="trace-header">
      <span>${workflowId} • ${action}</span>
      <span style="color: ${success ? 'var(--emerald)' : 'var(--rose)'};">${duration}ms</span>
    </div>
    <div class="trace-flow">
      ${portalSource.toUpperCase()} PORTAL ➔ SNS WORKBENCH ➔ ${targetAgent.toUpperCase()} AGENT
    </div>
    <div class="trace-json">${JSON.stringify(response, null, 2)}</div>
  `;

  activityLog.insertBefore(item, activityLog.firstChild);
  if (activityLog.children.length > 10) {
    activityLog.removeChild(activityLog.lastChild);
  }
}

/* ==================== DOCTOR PORTAL ACTIONS ==================== */
async function executeDoctorAction(actionType) {
  const patientId = document.getElementById('doc-patient-id').value.trim() || 'PAT-1001';
  const reportId = document.getElementById('doc-report-id').value.trim() || 'LABR-1001';
  const outputBox = document.getElementById('doctor-output');

  outputBox.textContent = `Submitting '${actionType}' request to SNS Agent Workbench...`;

  let payload = {};
  let targetAgent = 'medical';

  if (actionType === 'search_patient') {
    targetAgent = 'patient';
    payload = { query: patientId };
  } else if (actionType === 'analyze_lab_report') {
    payload = { patient_id: patientId, report_id: reportId };
  } else if (actionType === 'compare_lab_reports') {
    payload = { patient_id: patientId, current_report_id: 'LABR-1002', previous_report_id: 'LABR-1001' };
  } else if (actionType === 'get_medical_summary') {
    payload = { patient_id: patientId };
  } else if (actionType === 'explain_lab_report') {
    payload = { patient_id: patientId, report_id: reportId, audience: 'doctor' };
  }

  const request = {
    agent_target: targetAgent,
    action: actionType,
    portal_source: 'doctor',
    payload: payload
  };

  const result = await sendRequestToOrchestrator(request);
  outputBox.textContent = JSON.stringify(result, null, 2);
}

/* ==================== NURSE PORTAL ACTIONS ==================== */
async function executeNurseAction(actionType) {
  const patientId = document.getElementById('nurse-patient-id').value.trim() || 'PAT-1001';
  const billId = document.getElementById('nurse-bill-id').value.trim() || 'BILL-1001';
  const claimId = document.getElementById('nurse-claim-id').value.trim() || 'CLM-1001';
  const outputBox = document.getElementById('nurse-output');

  outputBox.textContent = `Submitting nurse request '${actionType}' to SNS Agent Workbench...`;

  let payload = {};
  if (actionType === 'verify_insurance') payload = { patient_id: patientId };
  else if (actionType === 'get_coverage') payload = { patient_id: patientId, service_type: 'CONSULTATION' };
  else if (actionType === 'prepare_claim') payload = { patient_id: patientId, bill_id: billId, service_type: 'CONSULTATION' };
  else if (actionType === 'submit_claim') payload = { claim_id: claimId };

  const request = {
    agent_target: 'insurance',
    action: actionType,
    portal_source: 'nurse',
    payload: payload
  };

  const result = await sendRequestToOrchestrator(request);
  outputBox.textContent = JSON.stringify(result, null, 2);
}

/* ==================== PATIENT PORTAL ACTIONS ==================== */
async function executePatientAction(actionType) {
  const patientId = document.getElementById('pat-id-field').value.trim() || 'PAT-1001';
  const outputBox = document.getElementById('patient-output');

  outputBox.textContent = `Submitting patient record request for ${patientId} to SNS Agent Workbench...`;

  let payload = { patient_id: patientId };
  let targetAgent = 'patient';

  if (actionType === 'explain_lab_report_patient') {
    targetAgent = 'medical';
    actionType = 'explain_lab_report';
    payload = { patient_id: patientId, report_id: 'LABR-1001', audience: 'patient' };
  }

  const request = {
    agent_target: targetAgent,
    action: actionType,
    portal_source: 'patient',
    payload: payload
  };

  const result = await sendRequestToOrchestrator(request);
  outputBox.textContent = JSON.stringify(result, null, 2);
}

/* ==================== LAB PORTAL ACTIONS ==================== */
async function executeLabAction(actionType) {
  const reportId = document.getElementById('lab-report-input').value.trim() || 'LABR-1001';
  const outputBox = document.getElementById('lab-output');

  outputBox.textContent = `Dispatching lab action '${actionType}' for ${reportId} to SNS Agent Workbench...`;

  const request = {
    agent_target: 'medical',
    action: actionType,
    portal_source: 'lab',
    payload: { report_id: reportId, patient_id: 'PAT-1001' }
  };

  const result = await sendRequestToOrchestrator(request);
  outputBox.textContent = JSON.stringify(result, null, 2);
}

/* ==================== HOSPITAL PORTAL ACTIONS ==================== */
async function executeHospitalAction(actionType) {
  const docId = document.getElementById('hosp-doc-id').value.trim() || 'DOC-101';
  const date = document.getElementById('hosp-date').value.trim() || '2024-09-10';
  const aptId = document.getElementById('hosp-apt-id').value.trim() || 'APT-1001';
  const outputBox = document.getElementById('hospital-output');

  outputBox.textContent = `Submitting hospital action '${actionType}' to SNS Agent Workbench...`;

  let payload = {};
  if (actionType === 'get_available_slots') payload = { doctor_id: docId, date: date };
  else if (actionType === 'book_appointment') payload = { patient_id: 'PAT-1001', doctor_id: docId, hospital_id: 'HOSP-001', date: date, time_slot: '11:00-11:30', reason: 'Consultation' };
  else if (actionType === 'get_appointment') payload = { appointment_id: aptId };
  else if (actionType === 'cancel_appointment') payload = { appointment_id: aptId };

  const request = {
    agent_target: 'appointment',
    action: actionType,
    portal_source: 'hospital',
    payload: payload
  };

  const result = await sendRequestToOrchestrator(request);
  outputBox.textContent = JSON.stringify(result, null, 2);
}

/* ==================== CONVERSATIONAL AI CHAT ==================== */
function handleChatKeyPress(event) {
  if (event.key === 'Enter') {
    sendChatMessage();
  }
}

async function sendChatMessage() {
  const inputElem = document.getElementById('chat-input');
  const messageText = inputElem.value.trim();
  if (!messageText) return;

  const messagesContainer = document.getElementById('chat-messages');

  // Render User Message Bubble
  const userBubble = document.createElement('div');
  userBubble.className = 'chat-bubble user';
  userBubble.textContent = messageText;
  messagesContainer.appendChild(userBubble);

  inputElem.value = '';
  messagesContainer.scrollTop = messagesContainer.scrollHeight;

  // Render Loading Indicator
  const assistantBubble = document.createElement('div');
  assistantBubble.className = 'chat-bubble assistant';
  assistantBubble.textContent = "Routing request through SNS Agent Workbench Master Orchestrator...";
  messagesContainer.appendChild(assistantBubble);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;

  // Send raw natural-language query to SNS Agent Workbench Master Orchestrator
  // NO client-side pre-routing or hard-coded target agents
  const requestPayload = {
    portal_source: activeRole,
    message: messageText,
    user_role: activeRole
  };

  const response = await sendRequestToOrchestrator(requestPayload);

  // Helper function to safely extract & format response text
  assistantBubble.innerHTML = formatWorkbenchResponse(response);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

/**
 * Safely format Workbench responses for display in the UI
 * Handles structured JSON, text strings, summaries, and error objects without crashing.
 */
function formatWorkbenchResponse(response) {
  if (!response) {
    return `<span style="color: var(--rose);">No response returned from SNS Agent Workbench.</span>`;
  }

  if (response.error) {
    return `<span style="color: var(--rose); font-weight: 500;">Error: ${response.error}</span>`;
  }

  if (typeof response.result === 'string' && response.result.trim()) {
    return response.result;
  }

  if (response.result && typeof response.result === 'object') {
    return `<pre style="font-family: var(--font-mono); font-size: 0.75rem; white-space: pre-wrap;">${JSON.stringify(response.result, null, 2)}</pre>`;
  }

  if (response.output) {
    if (typeof response.output.summary === 'string' && response.output.summary) {
      let html = response.output.summary;
      if (response.output.result_data) {
        html += `<pre style="font-family: var(--font-mono); font-size: 0.72rem; margin-top: 0.4rem; white-space: pre-wrap;">${JSON.stringify(response.output.result_data, null, 2)}</pre>`;
      }
      return html;
    }
    return `<pre style="font-family: var(--font-mono); font-size: 0.75rem; white-space: pre-wrap;">${JSON.stringify(response.output, null, 2)}</pre>`;
  }

  if (response.items && Array.isArray(response.items) && response.items.length > 0) {
    return `<pre style="font-family: var(--font-mono); font-size: 0.75rem; white-space: pre-wrap;">${JSON.stringify(response.items[0], null, 2)}</pre>`;
  }

  return `<pre style="font-family: var(--font-mono); font-size: 0.75rem; white-space: pre-wrap;">${JSON.stringify(response, null, 2)}</pre>`;
}
