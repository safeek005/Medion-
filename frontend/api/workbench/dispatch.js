// Vercel Serverless Function: MEDION Agent Cloud Dispatch API
// Endpoint: /api/workbench/dispatch and /api/v1/workbench/dispatch

const MOCK_DATA = {
  patients: [
    {
      patient_id: "PAT-1001",
      first_name: "Arun",
      last_name: "Kumar",
      dob: "1982-05-14",
      gender: "Male",
      blood_group: "O+",
      phone: "+91 9876543210",
      email: "arun.kumar@example.com",
      address: "42 MG Road, Indiranagar, Bengaluru, Karnataka",
      emergency_contact: { name: "Priya Kumar", relationship: "Spouse", phone: "+91 9876543211" },
      primary_doctor_id: "DOC-101",
      insurance_policy_id: "POL-701",
      created_at: "2024-01-10T09:30:00Z"
    },
    {
      patient_id: "PAT-1002",
      first_name: "Sneha",
      last_name: "Sharma",
      dob: "1990-11-22",
      gender: "Female",
      blood_group: "A+",
      phone: "+91 9812345678",
      email: "sneha.sharma@example.com",
      address: "15 Park Street, Koramangala, Bengaluru, Karnataka",
      emergency_contact: { name: "Rajesh Sharma", relationship: "Father", phone: "+91 9812345679" },
      primary_doctor_id: "DOC-102",
      insurance_policy_id: "POL-702",
      created_at: "2024-02-15T11:00:00Z"
    },
    {
      patient_id: "PAT-1003",
      first_name: "Vikram",
      last_name: "Singh",
      dob: "1975-08-03",
      gender: "Male",
      blood_group: "B-",
      phone: "+91 9988776655",
      email: "vikram.singh@example.com",
      address: "88 Outer Ring Road, Whitefield, Bengaluru, Karnataka",
      emergency_contact: { name: "Ananya Singh", relationship: "Spouse", phone: "+91 9988776656" },
      primary_doctor_id: "DOC-101",
      insurance_policy_id: "POL-703",
      created_at: "2024-03-01T14:20:00Z"
    }
  ],
  doctors: [
    {
      doctor_id: "DOC-101",
      first_name: "Rajesh",
      last_name: "Mehta",
      specialty: "Cardiology",
      qualification: "MD, DM (Cardiology)",
      hospital_id: "HOSP-001",
      phone: "+91 9123456780",
      email: "dr.mehta@medionhealth.org",
      available_days: ["Monday", "Wednesday", "Friday"],
      available_slots: ["09:00-09:30", "10:00-10:30", "11:00-11:30", "14:00-14:30", "15:00-15:30"]
    },
    {
      doctor_id: "DOC-102",
      first_name: "Anita",
      last_name: "Deshmukh",
      specialty: "Endocrinology",
      qualification: "MD, DNB (Endocrinology)",
      hospital_id: "HOSP-001",
      phone: "+91 9123456781",
      email: "dr.anita@medionhealth.org",
      available_days: ["Tuesday", "Thursday", "Saturday"],
      available_slots: ["09:30-10:00", "10:30-11:00", "11:30-12:00", "14:30-15:00"]
    },
    {
      doctor_id: "DOC-103",
      first_name: "Suresh",
      last_name: "Rao",
      specialty: "General Medicine",
      qualification: "MBBS, MD (Internal Medicine)",
      hospital_id: "HOSP-002",
      phone: "+91 9123456782",
      email: "dr.suresh@cityhospital.org",
      available_days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      available_slots: ["09:00-09:30", "09:30-10:00", "10:00-10:30", "11:00-11:30"]
    }
  ],
  lab_reports: [
    {
      report_id: "LABR-1001",
      patient_id: "PAT-1001",
      doctor_id: "DOC-101",
      lab_id: "LAB-001",
      test_name: "Comprehensive Blood & Lipid Panel",
      collection_date: "2024-06-14T08:00:00Z",
      result_date: "2024-06-14T16:30:00Z",
      status: "COMPLETED",
      test_results: [
        { test_parameter: "Hemoglobin", value: 10.4, unit: "g/dL", reference_range: "13.5 - 17.5", status: "LOW", flagged: true },
        { test_parameter: "Total Cholesterol", value: 215.0, unit: "mg/dL", reference_range: "< 200", status: "HIGH", flagged: true },
        { test_parameter: "Fasting Blood Sugar", value: 92.0, unit: "mg/dL", reference_range: "70 - 99", status: "NORMAL", flagged: false }
      ],
      lab_technician_notes: "Sample hemolyzed slightly; repeat CBC if anemia symptoms persist.",
      summary: "Low hemoglobin (10.4 g/dL) and mildly elevated Total Cholesterol (215 mg/dL) detected."
    },
    {
      report_id: "LABR-1002",
      patient_id: "PAT-1002",
      doctor_id: "DOC-102",
      lab_id: "LAB-001",
      test_name: "Thyroid Profile (T3, T4, TSH)",
      collection_date: "2024-07-19T07:30:00Z",
      result_date: "2024-07-19T14:00:00Z",
      status: "COMPLETED",
      test_results: [
        { test_parameter: "TSH", value: 6.2, unit: "uIU/mL", reference_range: "0.4 - 4.2", status: "HIGH", flagged: true },
        { test_parameter: "Free T4", value: 1.1, unit: "ng/dL", reference_range: "0.8 - 1.8", status: "NORMAL", flagged: false }
      ],
      lab_technician_notes: "All control runs within expected range.",
      summary: "TSH elevated at 6.2 uIU/mL indicating subclinical hypothyroidism."
    }
  ],
  insurance_policies: [
    {
      policy_id: "POL-701",
      patient_id: "PAT-1001",
      provider_id: "INS-501",
      policy_number: "SH-2024-998811",
      policy_holder_name: "Arun Kumar",
      plan_type: "Comprehensive Health Shield",
      coverage_amount: 500000.0,
      remaining_coverage: 425000.0,
      copay_percentage: 10.0,
      status: "ACTIVE",
      valid_from: "2024-01-01",
      valid_to: "2024-12-31"
    },
    {
      policy_id: "POL-702",
      patient_id: "PAT-1002",
      provider_id: "INS-502",
      policy_number: "AP-2024-554422",
      policy_holder_name: "Sneha Sharma",
      plan_type: "Executive Gold Mediclaim",
      coverage_amount: 1000000.0,
      remaining_coverage: 1000000.0,
      copay_percentage: 5.0,
      status: "ACTIVE",
      valid_from: "2024-01-01",
      valid_to: "2024-12-31"
    },
    {
      policy_id: "POL-703",
      patient_id: "PAT-1003",
      provider_id: "INS-501",
      policy_number: "SH-2024-332211",
      policy_holder_name: "Vikram Singh",
      plan_type: "Senior Health Care",
      coverage_amount: 300000.0,
      remaining_coverage: 180000.0,
      copay_percentage: 15.0,
      status: "ACTIVE",
      valid_from: "2024-01-01",
      valid_to: "2024-12-31"
    }
  ],
  appointments: [
    {
      appointment_id: "APT-301",
      patient_id: "PAT-1001",
      doctor_id: "DOC-101",
      hospital_id: "HOSP-001",
      date: "2024-09-10",
      time_slot: "10:00-10:30",
      status: "SCHEDULED",
      purpose: "Cardiac Follow-up",
      notes: "Routine quarterly ECG & Lipid evaluation"
    }
  ],
  medical_records: [
    {
      record_id: "MED-201",
      patient_id: "PAT-1001",
      doctor_id: "DOC-101",
      visit_date: "2024-05-10",
      diagnosis: "Essential Hypertension, Mild Dyslipidemia",
      symptoms: ["Occasional dizziness", "Mild morning headaches"],
      treatment_plan: "Lifestyle modification, low sodium diet, daily brisk walking 30 mins.",
      vital_signs: { blood_pressure: "138/88 mmHg", heart_rate: 76, temperature: "98.4 F", weight_kg: 78.5, height_cm: 175 }
    }
  ],
  prescriptions: [
    {
      prescription_id: "RX-501",
      patient_id: "PAT-1001",
      doctor_id: "DOC-101",
      date_prescribed: "2024-05-10",
      status: "ACTIVE",
      medications: [
        { name: "Telmisartan", dosage: "40mg", frequency: "Once daily in the morning", duration: "90 days", instructions: "Take with or after food" },
        { name: "Atorvastatin", dosage: "10mg", frequency: "Once daily at bedtime", duration: "90 days", instructions: "Take at night" }
      ]
    }
  ]
};

// 1. Patient Agent Operations
function handlePatientAgent(action, payload) {
  if (action === "get_patient") {
    const patientId = payload.patient_id || "PAT-1001";
    const patient = MOCK_DATA.patients.find(p => p.patient_id.toLowerCase() === patientId.toLowerCase()) ||
                    MOCK_DATA.patients.find(p => (p.first_name + " " + p.last_name).toLowerCase().includes(patientId.toLowerCase())) ||
                    MOCK_DATA.patients[0];
    return {
      agent_id: "AGT-PAT-001",
      agent_name: "Patient Agent",
      agent_type: "domain_expert",
      summary: `Retrieved profile for patient ${patient.patient_id} (${patient.first_name} ${patient.last_name}).`,
      result_data: { success: true, patient },
      next_recommended_action: "get_patient_medical_history"
    };
  }
  if (action === "search_patients") {
    const query = (payload.query || payload.search || "").toLowerCase();
    const patients = MOCK_DATA.patients.filter(p =>
      p.patient_id.toLowerCase().includes(query) ||
      p.first_name.toLowerCase().includes(query) ||
      p.last_name.toLowerCase().includes(query)
    );
    return {
      agent_id: "AGT-PAT-001",
      agent_name: "Patient Agent",
      agent_type: "domain_expert",
      summary: `Found ${patients.length} matching patient(s).`,
      result_data: { success: true, count: patients.length, patients },
      next_recommended_action: "get_patient"
    };
  }
  if (action === "get_patient_medical_history") {
    const patientId = payload.patient_id || "PAT-1001";
    const records = MOCK_DATA.medical_records.filter(r => r.patient_id === patientId);
    const labs = MOCK_DATA.lab_reports.filter(l => l.patient_id === patientId);
    const rx = MOCK_DATA.prescriptions.filter(p => p.patient_id === patientId);
    return {
      agent_id: "AGT-PAT-001",
      agent_name: "Patient Agent",
      agent_type: "domain_expert",
      summary: `Retrieved clinical history for ${patientId}: ${records.length} record(s), ${labs.length} lab report(s), ${rx.length} prescription(s).`,
      result_data: { success: true, patient_id: patientId, medical_records: records, lab_reports: labs, prescriptions: rx },
      next_recommended_action: "analyze_lab_report"
    };
  }
  return {
    agent_id: "AGT-PAT-001",
    agent_name: "Patient Agent",
    agent_type: "domain_expert",
    summary: `Executed ${action} successfully.`,
    result_data: { success: true }
  };
}

// 2. Medical Agent Operations
function handleMedicalAgent(action, payload) {
  if (action === "analyze_lab_report" || action === "interpret_lab_results" || action === "get_lab_report") {
    const reportId = payload.report_id || payload.lab_report_id || "LABR-1001";
    const patientId = payload.patient_id || "PAT-1001";
    let report = MOCK_DATA.lab_reports.find(r => r.report_id.toLowerCase() === reportId.toLowerCase());
    if (!report) {
      report = MOCK_DATA.lab_reports.find(r => r.patient_id.toLowerCase() === patientId.toLowerCase()) || MOCK_DATA.lab_reports[0];
    }
    const abnormal = report.test_results.filter(t => t.flagged || t.status !== "NORMAL");
    const abnormalStr = abnormal.map(a => `* ${a.test_parameter}: ${a.value} ${a.unit} (Status: ${a.status}, Reference: ${a.reference_range})`).join("\n");
    const explanation = `CLINICAL SUMMARY (${report.report_id}):\nLaboratory Panel '${report.test_name}' for patient ${report.patient_id} contains ${abnormal.length} parameter(s) outside reference bounds.\n\nAbnormal Findings:\n${abnormalStr}\n\nRECOMMENDED ACTION:\nReview flagged laboratory parameters in conjunction with the patient's full clinical history and vital signs.`;

    return {
      agent_id: "AGT-MED-001",
      agent_name: "Medical Agent",
      agent_type: "domain_expert",
      summary: explanation,
      result_data: {
        success: true,
        report_id: report.report_id,
        patient_id: report.patient_id,
        test_name: report.test_name,
        collection_date: report.collection_date,
        status: report.status,
        abnormal_results: abnormal,
        test_results: report.test_results,
        priority: abnormal.length > 0 ? "HIGH" : "NORMAL",
        abnormal_count: abnormal.length,
        summary: explanation,
        explanation: explanation
      },
      next_recommended_action: "get_patient_medical_history"
    };
  }
  if (action === "get_prescriptions") {
    const patientId = payload.patient_id || "PAT-1001";
    const rx = MOCK_DATA.prescriptions.filter(p => p.patient_id === patientId);
    return {
      agent_id: "AGT-MED-001",
      agent_name: "Medical Agent",
      agent_type: "domain_expert",
      summary: `Found ${rx.length} active prescription(s) for patient ${patientId}.`,
      result_data: { success: true, prescriptions: rx }
    };
  }
  return {
    agent_id: "AGT-MED-001",
    agent_name: "Medical Agent",
    agent_type: "domain_expert",
    summary: `Executed medical action ${action}.`,
    result_data: { success: true }
  };
}

// 3. Appointment Agent Operations
function handleAppointmentAgent(action, payload) {
  if (action === "get_available_slots" || action === "list_slots") {
    const doctorId = payload.doctor_id || "DOC-101";
    const doctor = MOCK_DATA.doctors.find(d => d.doctor_id.toLowerCase() === doctorId.toLowerCase()) || MOCK_DATA.doctors[0];
    const date = payload.date || "2024-09-10";
    const slots = (doctor.available_slots || []).map(s => ({ time_slot: s, status: "AVAILABLE", date }));
    return {
      agent_id: "AGT-APT-001",
      agent_name: "Appointment Agent",
      agent_type: "domain_expert",
      summary: `Found ${slots.length} available slot(s) for Dr. ${doctor.last_name} on ${date}. (Available Slots: ${doctor.available_slots.join(", ")})`,
      result_data: { success: true, doctor_id: doctor.doctor_id, doctor_name: `Dr. ${doctor.first_name} ${doctor.last_name}`, date, available_slots: slots },
      next_recommended_action: "book_appointment"
    };
  }
  if (action === "book_appointment") {
    const appointmentId = `APT-${Math.floor(100 + Math.random() * 900)}`;
    const apt = {
      appointment_id: appointmentId,
      patient_id: payload.patient_id || "PAT-1001",
      doctor_id: payload.doctor_id || "DOC-101",
      date: payload.date || "2024-09-10",
      time_slot: payload.time_slot || "10:00-10:30",
      status: "CONFIRMED"
    };
    return {
      agent_id: "AGT-APT-001",
      agent_name: "Appointment Agent",
      agent_type: "domain_expert",
      summary: `Appointment ${appointmentId} confirmed for patient ${apt.patient_id} with Dr. ${apt.doctor_id} on ${apt.date} at ${apt.time_slot}.`,
      result_data: { success: true, appointment: apt }
    };
  }
  return {
    agent_id: "AGT-APT-001",
    agent_name: "Appointment Agent",
    agent_type: "domain_expert",
    summary: `Executed appointment action ${action}.`,
    result_data: { success: true }
  };
}

// 4. Insurance Agent Operations
function handleInsuranceAgent(action, payload) {
  if (action === "verify_insurance" || action === "check_eligibility" || action === "get_policy") {
    const patientId = payload.patient_id || "PAT-1001";
    const policyId = payload.policy_id;
    let policy = null;
    if (policyId) {
      policy = MOCK_DATA.insurance_policies.find(p => p.policy_id.toLowerCase() === policyId.toLowerCase());
    }
    if (!policy) {
      policy = MOCK_DATA.insurance_policies.find(p => p.patient_id.toLowerCase() === patientId.toLowerCase()) || MOCK_DATA.insurance_policies[0];
    }
    return {
      agent_id: "AGT-INS-001",
      agent_name: "Insurance Agent",
      agent_type: "domain_expert",
      summary: `Insurance verification for patient ${patientId}: Policy ${policy.policy_id} (${policy.plan_type}) is ACTIVE (Eligible: True, Copay: ${policy.copay_percentage}%, Remaining: $${policy.remaining_coverage.toLocaleString()}).`,
      result_data: { success: true, eligible: true, status: policy.status, policy },
      next_recommended_action: "submit_claim"
    };
  }
  return {
    agent_id: "AGT-INS-001",
    agent_name: "Insurance Agent",
    agent_type: "domain_expert",
    summary: `Executed insurance action ${action}.`,
    result_data: { success: true }
  };
}

// 5. Assistant Agent NLP Orchestration & Parser
function handleAssistantAgent(action, payload) {
  const message = payload.message || payload.prompt || payload.query || "";
  const lower = message.toLowerCase();

  // Route to Appointment (check appointment before medical to prioritize scheduling terms)
  if (/\b(slot|slots|appointment|appointments|schedule|scheduling|available|availability|book|booking)\b/i.test(message) || /DOC-\d+/i.test(message)) {
    const docMatch = message.match(/DOC-\d+/i);
    const aptResult = handleAppointmentAgent("get_available_slots", {
      doctor_id: docMatch ? docMatch[0].toUpperCase() : "DOC-101",
      date: "2024-09-10"
    });
    return {
      agent_id: "AGT-AST-001",
      agent_name: "Assistant Agent",
      agent_type: "orchestrator",
      summary: aptResult.summary,
      result_data: {
        success: true,
        intent: "get_available_slots",
        target_agent: "appointment",
        target_action: "get_available_slots",
        formatted_text: aptResult.summary,
        result_data: aptResult.result_data
      }
    };
  }

  // Route to Medical
  if (/\b(lab|labs|laboratory|report|reports|analyze|analysis|findings|panel|hemoglobin|cholesterol|tsh|blood)\b/i.test(message) || /LABR-\d+/i.test(message)) {
    const reportMatch = message.match(/LABR-\d+/i);
    const patientMatch = message.match(/PAT-\d+/i);
    const medResult = handleMedicalAgent("analyze_lab_report", {
      report_id: reportMatch ? reportMatch[0].toUpperCase() : "LABR-1001",
      patient_id: patientMatch ? patientMatch[0].toUpperCase() : "PAT-1001"
    });
    return {
      agent_id: "AGT-AST-001",
      agent_name: "Assistant Agent",
      agent_type: "orchestrator",
      summary: medResult.summary,
      result_data: {
        success: true,
        intent: "analyze_lab_report",
        target_agent: "medical",
        target_action: "analyze_lab_report",
        formatted_text: medResult.summary,
        explanation: medResult.summary,
        result_data: medResult.result_data
      }
    };
  }

  // Route to Insurance
  if (/\b(insurance|eligibility|eligible|policy|policies|coverage|copay|claim|claims)\b/i.test(message) || /POL-\d+/i.test(message) || /INS-\d+/i.test(message)) {
    const patMatch = message.match(/PAT-\d+/i);
    const insResult = handleInsuranceAgent("verify_insurance", {
      patient_id: patMatch ? patMatch[0].toUpperCase() : "PAT-1001"
    });
    return {
      agent_id: "AGT-AST-001",
      agent_name: "Assistant Agent",
      agent_type: "orchestrator",
      summary: insResult.summary,
      result_data: {
        success: true,
        intent: "verify_insurance",
        target_agent: "insurance",
        target_action: "verify_insurance",
        formatted_text: insResult.summary,
        result_data: insResult.result_data
      }
    };
  }

  // Route to Patient
  if (lower.includes("patient") || lower.includes("pat-") || lower.includes("arun") || lower.includes("profile")) {
    const patMatch = message.match(/PAT-\d+/i);
    const patResult = handlePatientAgent("get_patient", {
      patient_id: patMatch ? patMatch[0].toUpperCase() : (lower.includes("arun") ? "PAT-1001" : "PAT-1001")
    });
    return {
      agent_id: "AGT-AST-001",
      agent_name: "Assistant Agent",
      agent_type: "orchestrator",
      summary: `[CLINICAL BRIEF] ${patResult.summary} (Gender: ${patResult.result_data.patient.gender}, Blood Group: ${patResult.result_data.patient.blood_group}, Primary Doctor: ${patResult.result_data.patient.primary_doctor_id}, Policy: ${patResult.result_data.patient.insurance_policy_id})`,
      result_data: {
        success: true,
        intent: "get_patient",
        target_agent: "patient",
        target_action: "get_patient",
        formatted_text: patResult.summary,
        result_data: patResult.result_data
      }
    };
  }

  // Fallback
  return {
    agent_id: "AGT-AST-001",
    agent_name: "Assistant Agent",
    agent_type: "orchestrator",
    summary: "Hello! I am MEDION Clinical Assistant. I can assist you with laboratory report analysis, patient profile lookups, doctor appointment scheduling, and insurance verification.",
    result_data: {
      success: true,
      intent: "general_inquiry",
      target_agent: "assistant",
      target_action: "handle_clarification"
    }
  };
}

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method === "GET") {
    return res.status(200).json({
      status: "online",
      service: "MEDION Cloud Dispatch API",
      agents: ["patient", "medical", "appointment", "insurance", "assistant"]
    });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : (req.body || {});
    const targetAgent = (body.agent_target || body.target_agent || "assistant").toLowerCase();
    const action = body.action || body.target_action || "interpret_request";
    const payload = body.payload || body;
    const workflowId = body.workflow_id || `WF-${targetAgent.toUpperCase()}-${Date.now()}`;

    let output;
    switch (targetAgent) {
      case "patient":
        output = handlePatientAgent(action, payload);
        break;
      case "medical":
        output = handleMedicalAgent(action, payload);
        break;
      case "appointment":
        output = handleAppointmentAgent(action, payload);
        break;
      case "insurance":
        output = handleInsuranceAgent(action, payload);
        break;
      case "assistant":
      default:
        output = handleAssistantAgent(action, payload);
        break;
    }

    const response = {
      success: true,
      workflow_id: workflowId,
      target_agent: targetAgent,
      action_performed: action,
      output: output,
      timestamp: new Date().toISOString()
    };

    return res.status(200).json(response);
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message,
      timestamp: new Date().toISOString()
    });
  }
}
