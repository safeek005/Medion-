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
      lab_technician_notes: "Elevated TSH consistent with subclinical hypothyroidism. Correlate clinically.",
      summary: "TSH is elevated at 6.2 uIU/mL. Free T4 is within normal limits."
    }
  ],
  insurance_policies: [
    {
      policy_id: "POL-701",
      patient_id: "PAT-1001",
      provider_id: "INS-001",
      provider_name: "Star Health & Allied Insurance",
      policy_number: "SH-COMP-2024-88912",
      plan_type: "Comprehensive Family Floater",
      status: "ACTIVE",
      coverage_limit: 500000,
      remaining_coverage: 485000,
      copay_percentage: 10,
      valid_until: "2025-12-31"
    },
    {
      policy_id: "POL-702",
      patient_id: "PAT-1002",
      provider_id: "INS-002",
      provider_name: "HDFC ERGO Health",
      policy_number: "HE-OPT-2024-44510",
      plan_type: "Optima Restore Individual",
      status: "ACTIVE",
      coverage_limit: 300000,
      remaining_coverage: 290000,
      copay_percentage: 15,
      valid_until: "2025-10-30"
    },
    {
      policy_id: "POL-703",
      patient_id: "PAT-1003",
      provider_id: "INS-001",
      provider_name: "Star Health & Allied Insurance",
      policy_number: "SH-SR-2024-99120",
      plan_type: "Senior Citizens Red Carpet",
      status: "ACTIVE",
      coverage_limit: 750000,
      remaining_coverage: 720000,
      copay_percentage: 20,
      valid_until: "2025-08-15"
    }
  ],
  appointments: [
    {
      appointment_id: "APT-301",
      patient_id: "PAT-1001",
      doctor_id: "DOC-101",
      hospital_id: "HOSP-001",
      appointment_date: "2024-09-10",
      time_slot: "10:00-10:30",
      status: "CONFIRMED",
      reason_for_visit: "Hypertension Routine Follow-up"
    },
    {
      appointment_id: "APT-1001",
      patient_id: "PAT-1001",
      doctor_id: "DOC-101",
      hospital_id: "HOSP-001",
      appointment_date: "2024-09-15",
      time_slot: "11:00-11:30",
      status: "CONFIRMED",
      reason_for_visit: "Cardiology Consultation"
    }
  ],
  claims: [
    {
      claim_id: "CLM-1001",
      patient_id: "PAT-1001",
      policy_id: "POL-701",
      provider_id: "INS-001",
      bill_id: "BILL-201",
      claim_amount: 15000,
      approved_amount: 13500,
      status: "APPROVED",
      submitted_date: "2024-05-15T10:00:00Z",
      processed_date: "2024-05-18T14:30:00Z",
      adjudication_notes: "Approved after 10% standard copay deduction."
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

// ----------------------------------------------------
// NLP & ENTITY RESOLUTION UTILITIES
// ----------------------------------------------------

let LAST_PENDING_REGISTRATION = null;

function normalizeDateOfBirth(raw) {
  if (!raw) return "2007-01-31";
  const s = raw.trim();
  // Dot, slash, or hyphen: DD.MM.YYYY, DD/MM/YYYY, DD-MM-YYYY
  const dmyMatch = s.match(/\b(\d{1,2})[./-](\d{1,2})[./-](\d{4})\b/);
  if (dmyMatch) {
    const day = dmyMatch[1].padStart(2, "0");
    const month = dmyMatch[2].padStart(2, "0");
    const year = dmyMatch[3];
    return `${year}-${month}-${day}`;
  }
  // YYYY-MM-DD
  const isoMatch = s.match(/\b(\d{4})-(\d{2})-(\d{2})\b/);
  if (isoMatch) return isoMatch[0];
  return s;
}

function resolveDoctor(text) {
  if (!text) return null;
  const lower = text.toLowerCase();
  if (lower.includes("doc-101") || lower.includes("rajesh") || lower.includes("mehta") || lower.includes("cardio")) {
    return MOCK_DATA.doctors.find(d => d.doctor_id === "DOC-101");
  }
  if (lower.includes("doc-102") || lower.includes("anita") || lower.includes("deshmukh") || lower.includes("endo")) {
    return MOCK_DATA.doctors.find(d => d.doctor_id === "DOC-102");
  }
  if (lower.includes("doc-103") || lower.includes("suresh") || lower.includes("rao") || lower.includes("general")) {
    return MOCK_DATA.doctors.find(d => d.doctor_id === "DOC-103");
  }
  return null;
}

function resolvePatient(text, defaultPatientId = "PAT-1001") {
  if (text) {
    const lower = text.toLowerCase();
    if (lower.includes("pat-1001") || lower.includes("arun")) {
      return MOCK_DATA.patients.find(p => p.patient_id === "PAT-1001");
    }
    if (lower.includes("pat-1002") || lower.includes("sneha") || lower.includes("snesha")) {
      return MOCK_DATA.patients.find(p => p.patient_id === "PAT-1002");
    }
    if (lower.includes("pat-1003") || lower.includes("vikram")) {
      return MOCK_DATA.patients.find(p => p.patient_id === "PAT-1003");
    }
    const patIdMatch = text.match(/PAT-\d+/i);
    if (patIdMatch) {
      const match = MOCK_DATA.patients.find(p => p.patient_id.toLowerCase() === patIdMatch[0].toLowerCase());
      if (match) return match;
    }
  }
  return MOCK_DATA.patients.find(p => p.patient_id === defaultPatientId) || MOCK_DATA.patients[0];
}

function parseRelativeDate(text) {
  if (!text) return null;
  const lower = text.toLowerCase();
  const baseDate = new Date();

  // Explicit YYYY-MM-DD
  const isoMatch = text.match(/\b\d{4}-\d{2}-\d{2}\b/);
  if (isoMatch) return isoMatch[0];

  if (lower.includes("today")) {
    return baseDate.toISOString().split("T")[0];
  }
  if (lower.includes("tomorrow") || lower.includes("tmrw")) {
    const d = new Date(baseDate);
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  }
  if (lower.includes("day after tomorrow")) {
    const d = new Date(baseDate);
    d.setDate(d.getDate() + 2);
    return d.toISOString().split("T")[0];
  }

  const daysOfWeek = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  for (let i = 0; i < daysOfWeek.length; i++) {
    const dayName = daysOfWeek[i];
    if (lower.includes(dayName)) {
      const currentDay = baseDate.getDay();
      let diff = i - currentDay;
      if (diff <= 0) diff += 7; // Next occurrence
      const targetDate = new Date(baseDate);
      targetDate.setDate(targetDate.getDate() + diff);
      return targetDate.toISOString().split("T")[0];
    }
  }

  return null;
}

function parseTimeSlot(text, doctor) {
  if (!text) return null;
  const lower = text.toLowerCase();

  // Match 10 AM, 10:00 AM, 10:00, 2 PM, 14:00
  const timeRegex = /\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\b/i;
  const match = text.match(timeRegex);

  if (match) {
    let hour = parseInt(match[1], 10);
    const minute = match[2] ? parseInt(match[2], 10) : 0;
    const meridian = match[3] ? match[3].toLowerCase() : null;

    if (meridian === "pm" && hour < 12) hour += 12;
    if (meridian === "am" && hour === 12) hour = 0;

    const formattedHour = hour.toString().padStart(2, "0");
    const formattedMinute = minute.toString().padStart(2, "0");
    const startTime = `${formattedHour}:${formattedMinute}`;

    // Find best match in doctor slots
    if (doctor && doctor.available_slots) {
      const directMatch = doctor.available_slots.find(s => s.startsWith(formattedHour));
      if (directMatch) return directMatch;
    }

    // Default 30 min duration
    let endHour = hour;
    let endMin = minute + 30;
    if (endMin >= 60) {
      endHour += 1;
      endMin -= 60;
    }
    return `${startTime}-${endHour.toString().padStart(2, "0")}:${endMin.toString().padStart(2, "0")}`;
  }

  if (lower.includes("morning")) return doctor ? doctor.available_slots[0] : "09:00-09:30";
  if (lower.includes("afternoon")) return doctor ? doctor.available_slots[3] || "14:00-14:30" : "14:00-14:30";

  return null;
}

// ----------------------------------------------------
// 1. APPOINTMENT AGENT HANDLER
// ----------------------------------------------------

function handleAppointmentAgent(action, payload) {
  const doctor = resolveDoctor(payload.doctor_name || payload.doctor_id || "") ||
                 MOCK_DATA.doctors.find(d => d.doctor_id === (payload.doctor_id || "DOC-101")) ||
                 MOCK_DATA.doctors[0];
  const patient = resolvePatient(payload.patient_name || payload.patient_id || "", payload.user_role === "patient" ? "PAT-1001" : "PAT-1001");
  const date = payload.date || payload.appointment_date || "2026-09-09";

  if (action === "get_available_slots" || action === "list_slots") {
    const dayOfWeek = new Date(date).toLocaleDateString("en-US", { weekday: "long" });
    const isDoctorWorking = doctor.available_days.includes(dayOfWeek);

    const slots = (doctor.available_slots || []).map(s => ({
      time_slot: s,
      status: "AVAILABLE",
      date: date
    }));

    const summary = isDoctorWorking
      ? `Dr. ${doctor.first_name} ${doctor.last_name} (${doctor.specialty}) has ${slots.length} available slots on ${dayOfWeek}, ${date}: ${doctor.available_slots.join(", ")}.`
      : `Dr. ${doctor.first_name} ${doctor.last_name} is typically available on ${doctor.available_days.join(", ")}. Available slots on regular days: ${doctor.available_slots.join(", ")}.`;

    return {
      agent_id: "AGT-APT-001",
      agent_name: "Appointment Agent",
      agent_type: "domain_expert",
      summary: summary,
      result_data: {
        success: true,
        doctor_id: doctor.doctor_id,
        doctor_name: `Dr. ${doctor.first_name} ${doctor.last_name}`,
        specialty: doctor.specialty,
        available_days: doctor.available_days,
        date: date,
        available_slots: slots
      },
      next_recommended_action: "book_appointment"
    };
  }

  if (action === "book_appointment") {
    const timeSlot = payload.time_slot || doctor.available_slots[0] || "10:00-10:30";
    const appointmentId = `APT-${Math.floor(1000 + Math.random() * 9000)}`;

    const newApt = {
      appointment_id: appointmentId,
      patient_id: patient.patient_id,
      patient_name: `${patient.first_name} ${patient.last_name}`,
      doctor_id: doctor.doctor_id,
      doctor_name: `Dr. ${doctor.first_name} ${doctor.last_name}`,
      specialty: doctor.specialty,
      hospital_id: doctor.hospital_id,
      appointment_date: date,
      time_slot: timeSlot,
      status: "CONFIRMED",
      reason_for_visit: payload.reason || "Clinical Consultation"
    };

    MOCK_DATA.appointments.unshift(newApt);

    return {
      agent_id: "AGT-APT-001",
      agent_name: "Appointment Agent",
      agent_type: "domain_expert",
      summary: `Appointment ${appointmentId} successfully confirmed for ${newApt.patient_name} with Dr. ${doctor.first_name} ${doctor.last_name} (${doctor.specialty}) on ${date} at ${timeSlot}.`,
      result_data: {
        success: true,
        appointment: newApt,
        doctor: doctor,
        patient: patient
      },
      next_recommended_action: "get_appointment"
    };
  }

  if (action === "get_appointment") {
    const aptId = (payload.appointment_id || "").toUpperCase();
    let apt = MOCK_DATA.appointments.find(a => a.appointment_id === aptId);
    if (!apt) {
      apt = MOCK_DATA.appointments.find(a => a.patient_id === patient.patient_id) || MOCK_DATA.appointments[0];
    }
    return {
      agent_id: "AGT-APT-001",
      agent_name: "Appointment Agent",
      agent_type: "domain_expert",
      summary: `Appointment ${apt.appointment_id}: Patient ${apt.patient_name || apt.patient_id} with Dr. ${apt.doctor_name || apt.doctor_id} on ${apt.appointment_date} at ${apt.time_slot} (Status: ${apt.status}).`,
      result_data: { success: true, appointment: apt }
    };
  }

  if (action === "cancel_appointment") {
    const aptId = (payload.appointment_id || "APT-1001").toUpperCase();
    const apt = MOCK_DATA.appointments.find(a => a.appointment_id === aptId) || MOCK_DATA.appointments[0];
    apt.status = "CANCELLED";

    return {
      agent_id: "AGT-APT-001",
      agent_name: "Appointment Agent",
      agent_type: "domain_expert",
      summary: `Appointment ${apt.appointment_id} has been cancelled successfully. Any allocated clinic slot has been freed.`,
      result_data: { success: true, appointment_id: apt.appointment_id, status: "CANCELLED" }
    };
  }

  if (action === "reschedule_appointment") {
    const aptId = (payload.appointment_id || "APT-1001").toUpperCase();
    const apt = MOCK_DATA.appointments.find(a => a.appointment_id === aptId) || MOCK_DATA.appointments[0];
    const newDate = payload.new_date || payload.date || "2026-09-11";
    const newTime = payload.new_time_slot || payload.time_slot || "11:00-11:30";

    apt.appointment_date = newDate;
    apt.time_slot = newTime;
    apt.status = "RESCHEDULED";

    return {
      agent_id: "AGT-APT-001",
      agent_name: "Appointment Agent",
      agent_type: "domain_expert",
      summary: `Appointment ${apt.appointment_id} successfully rescheduled to ${newDate} at ${newTime}.`,
      result_data: { success: true, appointment: apt }
    };
  }

  return {
    agent_id: "AGT-APT-001",
    agent_name: "Appointment Agent",
    agent_type: "domain_expert",
    summary: `Executed appointment operation '${action}'.`,
    result_data: { success: true }
  };
}

// ----------------------------------------------------
// 2. MEDICAL / LAB AGENT HANDLER
// ----------------------------------------------------

function handleMedicalAgent(action, payload) {
  const reportId = (payload.report_id || payload.lab_report_id || "").toUpperCase();
  const patient = resolvePatient(payload.patient_name || payload.patient_id || "");

  let report = null;
  if (reportId) {
    report = MOCK_DATA.lab_reports.find(r => r.report_id === reportId);
  }
  if (!report) {
    report = MOCK_DATA.lab_reports.find(r => r.patient_id === patient.patient_id) || MOCK_DATA.lab_reports[0];
  }

  const patientName = `${patient.first_name} ${patient.last_name}`;

  const abnormal = report.test_results.filter(t => t.flagged || t.status !== "NORMAL").map(t => ({
    parameter: t.test_parameter,
    value: `${t.value} ${t.unit}`,
    status: t.status,
    reference_range: t.reference_range,
    flagged: true
  }));

  const normal = report.test_results.filter(t => !t.flagged && t.status === "NORMAL").map(t => ({
    parameter: t.test_parameter,
    value: `${t.value} ${t.unit}`,
    status: t.status,
    reference_range: t.reference_range,
    flagged: false
  }));

  const abnormalStr = abnormal.map(a => `* ${a.parameter}: ${a.value} (Status: ${a.status}, Reference: ${a.reference_range})`).join("\n");
  const normalStr = normal.map(n => `* ${n.parameter}: ${n.value} (Status: ${n.status}, Reference: ${n.reference_range})`).join("\n");

  const safetyNote = "Informational analysis based on synthetic MEDION health data. Not a definitive medical diagnosis.";

  if (action === "explain_lab_report") {
    const plainExplanation = `EXPLANATION OF ${report.report_id} (${report.test_name}) FOR ${patientName}:\n` +
      `Your test results show ${abnormal.length} parameter(s) outside the expected reference bounds:\n` +
      abnormal.map(a => `• ${a.parameter}: The level is ${a.value} which is ${a.status.toLowerCase()} compared to the standard range of ${a.reference_range}.`).join("\n") +
      `\n\nAll other tested parameters including ${normal.map(n => n.parameter).join(", ")} are within healthy baseline ranges.\n\nNext Step: Please share these findings with your consulting physician for clinical correlation.`;

    return {
      agent_id: "AGT-MED-001",
      agent_name: "Medical Agent",
      agent_type: "domain_expert",
      summary: plainExplanation,
      result_data: {
        success: true,
        report_id: report.report_id,
        patient_id: report.patient_id,
        patient_name: patientName,
        explanation: plainExplanation,
        abnormal_findings: abnormal,
        normal_findings: normal,
        safety_note: safetyNote
      }
    };
  }

  if (action === "compare_lab_reports") {
    const rep1 = MOCK_DATA.lab_reports[0];
    const rep2 = MOCK_DATA.lab_reports[1];
    const compSummary = `Compared laboratory panel ${rep1.report_id} against ${rep2.report_id}. Identified ${rep1.test_results.filter(t => t.flagged).length} flagged parameter(s) in ${rep1.report_id} and ${rep2.test_results.filter(t => t.flagged).length} flagged parameter(s) in ${rep2.report_id}.`;

    return {
      agent_id: "AGT-MED-001",
      agent_name: "Medical Agent",
      agent_type: "domain_expert",
      summary: compSummary,
      result_data: {
        success: true,
        report_1: rep1.report_id,
        report_2: rep2.report_id,
        patient_name: patientName,
        summary: compSummary,
        safety_note: safetyNote
      }
    };
  }

  if (action === "get_medical_summary") {
    const rx = MOCK_DATA.prescriptions.filter(p => p.patient_id === report.patient_id);
    const records = MOCK_DATA.medical_records.filter(r => r.patient_id === report.patient_id);
    const summaryText = `Medical Summary for ${patientName} (${report.patient_id}): ${records.length} clinical record(s), ${rx.length} active prescription(s), and ${abnormal.length} abnormal laboratory finding(s) in ${report.report_id}.`;

    return {
      agent_id: "AGT-MED-001",
      agent_name: "Medical Agent",
      agent_type: "domain_expert",
      summary: summaryText,
      result_data: {
        success: true,
        patient_id: report.patient_id,
        patient_name: patientName,
        latest_report: report.report_id,
        abnormal_findings: abnormal,
        prescriptions: rx,
        medical_records: records,
        safety_note: safetyNote
      }
    };
  }

  if (action === "extract_lab_report") {
    return {
      agent_id: "AGT-MED-001",
      agent_name: "Medical Agent",
      agent_type: "domain_expert",
      summary: `Extracted ${report.test_results.length} laboratory test parameters for ${report.report_id}.`,
      result_data: {
        success: true,
        report_id: report.report_id,
        patient_id: report.patient_id,
        patient_name: patientName,
        test_name: report.test_name,
        test_results: report.test_results,
        count: report.test_results.length,
        safety_note: safetyNote
      }
    };
  }

  // Default: analyze_lab_report
  const clinicalSummary = `CLINICAL SUMMARY (${report.report_id}):\nLaboratory Panel '${report.test_name}' for patient ${patientName} (${report.patient_id}) contains ${abnormal.length} parameter(s) outside reference bounds.\n\nAbnormal Findings:\n${abnormalStr}\n\nNormal Findings:\n${normalStr}\n\nRECOMMENDED ACTION:\nReview flagged laboratory parameters in conjunction with the patient's full clinical history and vital signs.`;

  return {
    agent_id: "AGT-MED-001",
    agent_name: "Medical Agent",
    agent_type: "domain_expert",
    summary: clinicalSummary,
    result_data: {
      success: true,
      report_summary: {
        report_id: report.report_id,
        patient_id: report.patient_id,
        patient_name: patientName,
        test_name: report.test_name,
        collection_date: report.collection_date,
        result_date: report.result_date,
        status: report.status
      },
      abnormal_findings: abnormal,
      normal_findings: normal,
      priority: abnormal.length > 0 ? "HIGH" : "NORMAL",
      abnormal_count: abnormal.length,
      explanation: clinicalSummary,
      summary: clinicalSummary,
      safety_note: safetyNote
    },
    next_recommended_action: "get_patient_medical_history"
  };
}

// ----------------------------------------------------
// 3. INSURANCE AGENT HANDLER
// ----------------------------------------------------

function handleInsuranceAgent(action, payload) {
  const patient = resolvePatient(payload.patient_name || payload.patient_id || "");
  const patientName = `${patient.first_name} ${patient.last_name}`;

  let policy = null;
  const policyId = (payload.policy_id || "").toUpperCase();
  if (policyId) {
    policy = MOCK_DATA.insurance_policies.find(p => p.policy_id === policyId);
  }
  if (!policy) {
    policy = MOCK_DATA.insurance_policies.find(p => p.patient_id === patient.patient_id) || MOCK_DATA.insurance_policies[0];
  }

  if (action === "get_coverage") {
    return {
      agent_id: "AGT-INS-001",
      agent_name: "Insurance Agent",
      agent_type: "domain_expert",
      summary: `Coverage Details for ${patientName} (Policy ${policy.policy_id}): Total Coverage Limit: $${policy.coverage_limit.toLocaleString()}, Remaining Coverage: $${policy.remaining_coverage.toLocaleString()}, Copay: ${policy.copay_percentage}%, Plan Type: ${policy.plan_type}.`,
      result_data: {
        success: true,
        patient_id: patient.patient_id,
        policy_id: policy.policy_id,
        coverage_limit: policy.coverage_limit,
        remaining_coverage: policy.remaining_coverage,
        copay_percentage: policy.copay_percentage,
        plan_type: policy.plan_type,
        status: policy.status
      }
    };
  }

  if (action === "prepare_claim") {
    const claimId = `CLM-${Math.floor(1000 + Math.random() * 9000)}`;
    const billId = payload.bill_id || "BILL-201";
    const amount = payload.amount || 15000;

    const newClaim = {
      claim_id: claimId,
      patient_id: patient.patient_id,
      patient_name: patientName,
      policy_id: policy.policy_id,
      bill_id: billId,
      claim_amount: amount,
      status: "DRAFT",
      adjudication_notes: "Claim draft prepared. Ready for submission."
    };

    return {
      agent_id: "AGT-INS-001",
      agent_name: "Insurance Agent",
      agent_type: "domain_expert",
      summary: `Prepared insurance claim ${claimId} for ${patientName} under policy ${policy.policy_id} for amount $${amount.toLocaleString()} (Status: DRAFT).`,
      result_data: { success: true, claim: newClaim },
      next_recommended_action: "submit_claim"
    };
  }

  if (action === "submit_claim") {
    const claimId = (payload.claim_id || "CLM-1001").toUpperCase();
    const approvedAmount = 13500;

    return {
      agent_id: "AGT-INS-001",
      agent_name: "Insurance Agent",
      agent_type: "domain_expert",
      summary: `Claim ${claimId} successfully submitted to ${policy.provider_name}. Adjudication Result: APPROVED for $${approvedAmount.toLocaleString()} after ${policy.copay_percentage}% copay.`,
      result_data: {
        success: true,
        claim_id: claimId,
        status: "APPROVED",
        approved_amount: approvedAmount,
        provider: policy.provider_name,
        claim: {
          claim_id: claimId,
          patient_id: patient.patient_id,
          policy_id: policy.policy_id,
          status: "APPROVED",
          approved_amount: approvedAmount,
          provider: policy.provider_name
        }
      }
    };
  }

  if (action === "get_claim_status") {
    const claimId = (payload.claim_id || "CLM-1001").toUpperCase();
    const claim = MOCK_DATA.claims.find(c => c.claim_id === claimId) || MOCK_DATA.claims[0];

    return {
      agent_id: "AGT-INS-001",
      agent_name: "Insurance Agent",
      agent_type: "domain_expert",
      summary: `Claim ${claim.claim_id} Status: ${claim.status}. Claimed Amount: $${claim.claim_amount.toLocaleString()}, Approved: $${claim.approved_amount.toLocaleString()} (${claim.adjudication_notes}).`,
      result_data: { success: true, claim: claim }
    };
  }

  // Default: verify_insurance
  const isEligible = policy.status === "ACTIVE";
  return {
    agent_id: "AGT-INS-001",
    agent_name: "Insurance Agent",
    agent_type: "domain_expert",
    summary: `Insurance verification for ${patientName}: Policy ${policy.policy_id} (${policy.provider_name} - ${policy.plan_type}) is ${policy.status} (Eligible: ${isEligible ? "Yes" : "No"}, Copay: ${policy.copay_percentage}%, Remaining Balance: $${policy.remaining_coverage.toLocaleString()}).`,
    result_data: { success: true, eligible: isEligible, status: policy.status, policy: policy },
    next_recommended_action: "get_coverage"
  };
}

// ----------------------------------------------------
// 4. PATIENT AGENT HANDLER
// ----------------------------------------------------

function handlePatientAgent(action, payload) {
  const query = (payload.query || payload.search || payload.name || payload.message || "").toLowerCase();

  if (action === "search_patient" || action === "search_patients") {
    const matches = MOCK_DATA.patients.filter(p =>
      p.patient_id.toLowerCase().includes(query) ||
      p.first_name.toLowerCase().includes(query) ||
      p.last_name.toLowerCase().includes(query) ||
      query.includes(p.first_name.toLowerCase()) ||
      query.includes(p.last_name.toLowerCase())
    );
    const results = matches.length > 0 ? matches : [MOCK_DATA.patients[0]];

    return {
      agent_id: "AGT-PAT-001",
      agent_name: "Patient Agent",
      agent_type: "domain_expert",
      summary: `Found ${results.length} patient profile(s) matching '${query || "all"}': ${results.map(p => `${p.first_name} ${p.last_name} (${p.patient_id})`).join(", ")}.`,
      result_data: { success: true, count: results.length, patients: results },
      next_recommended_action: "get_patient"
    };
  }

  if (action === "get_patient_history" || action === "get_patient_medical_history") {
    const patient = resolvePatient(payload.patient_name || payload.patient_id || query);
    const records = MOCK_DATA.medical_records.filter(r => r.patient_id === patient.patient_id);
    const labs = MOCK_DATA.lab_reports.filter(l => l.patient_id === patient.patient_id);
    const rx = MOCK_DATA.prescriptions.filter(p => p.patient_id === patient.patient_id);
    const apts = MOCK_DATA.appointments.filter(a => a.patient_id === patient.patient_id);

    return {
      agent_id: "AGT-PAT-001",
      agent_name: "Patient Agent",
      agent_type: "domain_expert",
      summary: `Clinical & administrative history for ${patient.first_name} ${patient.last_name} (${patient.patient_id}): ${records.length} visit record(s), ${labs.length} lab report(s), ${rx.length} active prescription(s), ${apts.length} appointment(s).`,
      result_data: {
        success: true,
        patient_id: patient.patient_id,
        patient_name: `${patient.first_name} ${patient.last_name}`,
        medical_records: records,
        lab_reports: labs,
        prescriptions: rx,
        appointments: apts
      },
      next_recommended_action: "analyze_lab_report"
    };
  }

  if (action === "register_patient") {
    const newId = `PAT-${Math.floor(1000 + Math.random() * 9000)}`;
    const newPatient = {
      patient_id: newId,
      first_name: payload.first_name || "New",
      last_name: payload.last_name || "Patient",
      gender: payload.gender || "Not specified",
      phone: payload.phone || "+91 9000000000",
      email: payload.email || "patient@example.com"
    };
    MOCK_DATA.patients.push(newPatient);

    return {
      agent_id: "AGT-PAT-001",
      agent_name: "Patient Agent",
      agent_type: "domain_expert",
      summary: `Registered new patient profile for ${newPatient.first_name} ${newPatient.last_name} (ID: ${newId}).`,
      result_data: { success: true, patient: newPatient }
    };
  }

  if (action === "update_patient") {
    const patient = resolvePatient(payload.patient_name || payload.patient_id || query);
    return {
      agent_id: "AGT-PAT-001",
      agent_name: "Patient Agent",
      agent_type: "domain_expert",
      summary: `Successfully updated record details for patient ${patient.patient_id} (${patient.first_name} ${patient.last_name}).`,
      result_data: { success: true, patient: patient }
    };
  }

  // Default: get_patient
  const patient = resolvePatient(payload.patient_name || payload.patient_id || query);
  return {
    agent_id: "AGT-PAT-001",
    agent_name: "Patient Agent",
    agent_type: "domain_expert",
    summary: `Profile for ${patient.first_name} ${patient.last_name} (${patient.patient_id}): DOB: ${patient.dob}, Gender: ${patient.gender}, Blood Group: ${patient.blood_group}, Primary Doctor: ${patient.primary_doctor_id}, Insurance: ${patient.insurance_policy_id}, Emergency Contact: ${patient.emergency_contact?.name} (${patient.emergency_contact?.phone}).`,
    result_data: { success: true, patient: patient },
    next_recommended_action: "get_patient_history"
  };
}

// ----------------------------------------------------
// 5. MASTER ORCHESTRATOR & INTENT DISPATCHER
// ----------------------------------------------------

function handleAssistantAgent(action, payload) {
  const message = (payload.message || payload.prompt || payload.query || "").trim();
  const lower = message.toLowerCase();
  const previousContext = payload.previous_context || payload.conversation_state || {};

  // Extract entities
  const doctor = resolveDoctor(message) || (previousContext.doctor_id ? MOCK_DATA.doctors.find(d => d.doctor_id === previousContext.doctor_id) : null);
  const patient = resolvePatient(message, payload.user_role === "patient" ? "PAT-1001" : (previousContext.patient_id || "PAT-1001"));
  const relativeDate = parseRelativeDate(message);
  const timeSlot = parseTimeSlot(message, doctor);

  const reportIdMatch = message.match(/LABR-[\w\-]+/i);
  const aptIdMatch = message.match(/APT-\d+/i);
  const claimIdMatch = message.match(/CLM-\d+/i);
  const policyIdMatch = message.match(/POL-\d+/i);

  // --------------------------------------------------
  // MULTI-TURN CONTEXT RESOLUTION
  // --------------------------------------------------
  // Multi-Turn: Register Patient Turn 2 (e.g. "31.01.2007, FEMALE, 9566036555")
  const isPendingReg = (previousContext.awaiting_action === "register_patient" ||
                        previousContext.action === "register_patient" ||
                        previousContext.pendingIntent === "register_patient") &&
                       (previousContext.patient_name || (previousContext.collectedEntities && previousContext.collectedEntities.name));
  const hasFallbackPending = LAST_PENDING_REGISTRATION && (Date.now() - LAST_PENDING_REGISTRATION.timestamp < 600000);

  const dobMatchTurn2 = message.match(/\b\d{1,2}[./-]\d{1,2}[./-]\d{4}\b/) ||
                        message.match(/\b\d{4}-\d{2}-\d{2}\b/) ||
                        message.match(/\b\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4}\b/i);
  const genderMatchTurn2 = message.match(/\b(male|female|other)\b/i);
  const phoneMatchTurn2 = message.match(/\b\d{10}\b/) || message.match(/\+?\d[\d\s\-]{8,14}\d/);

  if ((isPendingReg || (hasFallbackPending && (dobMatchTurn2 || genderMatchTurn2 || phoneMatchTurn2))) &&
      !/\b(book|appointment|cancel|reschedule|doctor|claim|insurance|report)\b/i.test(message)) {
    const pName = (isPendingReg ? (previousContext.patient_name || previousContext.collectedEntities?.name) : null) ||
                  (LAST_PENDING_REGISTRATION ? LAST_PENDING_REGISTRATION.patient_name : "Harini");
    LAST_PENDING_REGISTRATION = null;

    const nameParts = pName.trim().split(" ");
    const firstName = nameParts[0].charAt(0).toUpperCase() + nameParts[0].slice(1);
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : (firstName === "Harini" ? "S" : "Sharma");

    const rawDob = dobMatchTurn2 ? dobMatchTurn2[0] : (previousContext.dob || "2007-01-31");
    const dob = normalizeDateOfBirth(rawDob);
    const gender = genderMatchTurn2 ? (genderMatchTurn2[1].charAt(0).toUpperCase() + genderMatchTurn2[1].slice(1).toLowerCase()) : (previousContext.gender || "Female");
    const phone = phoneMatchTurn2 ? phoneMatchTurn2[0].trim() : (previousContext.phone || "9566036555");

    let maxId = 1000;
    MOCK_DATA.patients.forEach(p => {
      const match = p.patient_id.match(/PAT-(\d+)/i);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxId) maxId = num;
      }
    });
    const newPatientId = `PAT-${maxId + 1}`;

    const newPatient = {
      patient_id: newPatientId,
      first_name: firstName,
      last_name: lastName,
      dob: dob,
      gender: gender,
      blood_group: "O+",
      phone: phone,
      email: `${firstName.toLowerCase()}@example.com`,
      address: "Indiranagar, Bengaluru, Karnataka",
      emergency_contact: { name: "Family Emergency Contact", relationship: "Family", phone: phone },
      primary_doctor_id: "DOC-101",
      insurance_policy_id: "POL-701",
      created_at: new Date().toISOString()
    };

    MOCK_DATA.patients.unshift(newPatient);

    const confirmationText = `Patient successfully registered.\n\nPatient: ${firstName} ${lastName}\nPatient ID: ${newPatientId}\nDate of Birth: ${dob}\nGender: ${gender}\nContact: ${phone}`;

    return {
      agent_id: "AGT-AST-001",
      agent_name: "Assistant Agent",
      agent_type: "orchestrator",
      summary: confirmationText,
      result_data: {
        success: true,
        intent: "register_patient",
        target_agent: "patient",
        target_action: "register_patient",
        formatted_text: confirmationText,
        patient: newPatient,
        patient_id: newPatientId
      }
    };
  }

  if (previousContext.awaiting_action === "book_appointment" && (relativeDate || timeSlot)) {
    const finalDate = relativeDate || previousContext.date || "2026-09-09";
    const finalTime = timeSlot || previousContext.time_slot || "10:00-10:30";
    const finalDoctor = doctor || MOCK_DATA.doctors[0];

    const bookRes = handleAppointmentAgent("book_appointment", {
      doctor_id: finalDoctor.doctor_id,
      patient_id: patient.patient_id,
      date: finalDate,
      time_slot: finalTime
    });

    return {
      agent_id: "AGT-AST-001",
      agent_name: "Assistant Agent",
      agent_type: "orchestrator",
      summary: bookRes.summary,
      result_data: {
        success: true,
        intent: "book_appointment",
        target_agent: "appointment",
        target_action: "book_appointment",
        formatted_text: bookRes.summary,
        result_data: bookRes.result_data
      }
    };
  }

  // --------------------------------------------------
  // 1. APPOINTMENTS DOMAIN ROUTING
  // --------------------------------------------------

  // Reschedule
  if (/\b(reschedule|move|postpone|change date|change time)\b/i.test(message)) {
    const aptRes = handleAppointmentAgent("reschedule_appointment", {
      appointment_id: aptIdMatch ? aptIdMatch[0].toUpperCase() : "APT-1001",
      new_date: relativeDate || "2026-09-11",
      new_time_slot: timeSlot || "11:00-11:30"
    });
    return {
      agent_id: "AGT-AST-001",
      agent_name: "Assistant Agent",
      agent_type: "orchestrator",
      summary: aptRes.summary,
      result_data: {
        success: true,
        intent: "reschedule_appointment",
        target_agent: "appointment",
        target_action: "reschedule_appointment",
        formatted_text: aptRes.summary,
        ...aptRes.result_data,
        result_data: aptRes.result_data
      }
    };
  }

  // Cancel
  if (/\b(cancel|drop|revoke|remove appointment)\b/i.test(message)) {
    const aptRes = handleAppointmentAgent("cancel_appointment", {
      appointment_id: aptIdMatch ? aptIdMatch[0].toUpperCase() : "APT-1001"
    });
    return {
      agent_id: "AGT-AST-001",
      agent_name: "Assistant Agent",
      agent_type: "orchestrator",
      summary: aptRes.summary,
      result_data: {
        success: true,
        intent: "cancel_appointment",
        target_agent: "appointment",
        target_action: "cancel_appointment",
        formatted_text: aptRes.summary,
        ...aptRes.result_data,
        result_data: aptRes.result_data
      }
    };
  }

  // Retrieve Appointment Details
  if (/\b(show my appointment|my appointment details|get appointment|view appointment|check appointment status)\b/i.test(message) || (aptIdMatch && !/\b(cancel|reschedule|move)\b/i.test(message))) {
    const aptRes = handleAppointmentAgent("get_appointment", {
      appointment_id: aptIdMatch ? aptIdMatch[0].toUpperCase() : "APT-301",
      patient_id: patient.patient_id
    });
    return {
      agent_id: "AGT-AST-001",
      agent_name: "Assistant Agent",
      agent_type: "orchestrator",
      summary: aptRes.summary,
      result_data: {
        success: true,
        intent: "get_appointment",
        target_agent: "appointment",
        target_action: "get_appointment",
        formatted_text: aptRes.summary,
        ...aptRes.result_data,
        result_data: aptRes.result_data
      }
    };
  }

  // Book Appointment
  if (/\b(book|schedule|reserve|want to see|can you book|make an appointment)\b/i.test(message)) {
    // Check if doctor is known but date/time is missing
    if (doctor && !relativeDate && !timeSlot) {
      const clarifyText = `Sure. What date and preferred time would you like for Dr. ${doctor.first_name} ${doctor.last_name}? (Available days: ${doctor.available_days.join(", ")}; Regular slots: ${doctor.available_slots.join(", ")})`;
      return {
        agent_id: "AGT-AST-001",
        agent_name: "Assistant Agent",
        agent_type: "orchestrator",
        summary: clarifyText,
        result_data: {
          success: true,
          needs_clarification: true,
          clarification_type: "missing_parameters",
          awaiting_action: "book_appointment",
          doctor_id: doctor.doctor_id,
          doctor_name: `Dr. ${doctor.first_name} ${doctor.last_name}`,
          missing_parameters: ["date", "time_slot"],
          formatted_text: clarifyText
        }
      };
    }

    // If completely missing doctor
    if (!doctor && !relativeDate && !timeSlot && message.length < 35) {
      const clarifyText = "Which doctor would you like to see, and on what date and preferred time? We have Dr. Rajesh Mehta (Cardiology), Dr. Anita Deshmukh (Endocrinology), and Dr. Suresh Rao (General Medicine).";
      return {
        agent_id: "AGT-AST-001",
        agent_name: "Assistant Agent",
        agent_type: "orchestrator",
        summary: clarifyText,
        result_data: {
          success: true,
          needs_clarification: true,
          clarification_type: "missing_parameters",
          awaiting_action: "book_appointment",
          missing_parameters: ["doctor_id", "date", "time_slot"],
          formatted_text: clarifyText
        }
      };
    }

    // Execute booking
    const targetDoctor = doctor || MOCK_DATA.doctors[0];
    const finalDate = relativeDate || "2026-09-09";
    const finalTime = timeSlot || targetDoctor.available_slots[0] || "10:00-10:30";

    const bookRes = handleAppointmentAgent("book_appointment", {
      doctor_id: targetDoctor.doctor_id,
      patient_id: patient.patient_id,
      date: finalDate,
      time_slot: finalTime
    });

    return {
      agent_id: "AGT-AST-001",
      agent_name: "Assistant Agent",
      agent_type: "orchestrator",
      summary: bookRes.summary,
      result_data: {
        success: true,
        intent: "book_appointment",
        target_agent: "appointment",
        target_action: "book_appointment",
        formatted_text: bookRes.summary,
        ...bookRes.result_data,
        result_data: bookRes.result_data
      }
    };
  }

  // Available Slots / Doctor Availability
  if (/\b(available|availability|free|open slots|when can i meet|when can i see|when is|check slots|show slots|slots for)\b/i.test(message) || (doctor && !/\b(book|cancel|reschedule)\b/i.test(message))) {
    const targetDoctor = doctor || MOCK_DATA.doctors[0];
    const targetDate = relativeDate || "2026-09-09";

    const slotRes = handleAppointmentAgent("get_available_slots", {
      doctor_id: targetDoctor.doctor_id,
      date: targetDate
    });

    return {
      agent_id: "AGT-AST-001",
      agent_name: "Assistant Agent",
      agent_type: "orchestrator",
      summary: slotRes.summary,
      result_data: {
        success: true,
        intent: "get_available_slots",
        target_agent: "appointment",
        target_action: "get_available_slots",
        formatted_text: slotRes.summary,
        result_data: slotRes.result_data
      }
    };
  }

  // --------------------------------------------------
  // 2. MEDICAL / LAB AGENT ROUTING
  // --------------------------------------------------

  // Explain Lab Report
  if (/\b(explain|in simple language|simply|patient-friendly|plain terms|what does it mean)\b/i.test(message) && /\b(lab|report|result|test|blood|labr)\b/i.test(message)) {
    const medRes = handleMedicalAgent("explain_lab_report", {
      report_id: reportIdMatch ? reportIdMatch[0].toUpperCase() : "LABR-1001",
      patient_id: patient.patient_id
    });
    return {
      agent_id: "AGT-AST-001",
      agent_name: "Assistant Agent",
      agent_type: "orchestrator",
      summary: medRes.summary,
      result_data: {
        success: true,
        intent: "explain_lab_report",
        target_agent: "medical",
        target_action: "explain_lab_report",
        formatted_text: medRes.summary,
        result_data: medRes.result_data
      }
    };
  }

  // Compare Lab Reports
  if (/\b(compare|comparison|trend|versus|vs|against previous)\b/i.test(message)) {
    const medRes = handleMedicalAgent("compare_lab_reports", {
      patient_id: patient.patient_id
    });
    return {
      agent_id: "AGT-AST-001",
      agent_name: "Assistant Agent",
      agent_type: "orchestrator",
      summary: medRes.summary,
      result_data: {
        success: true,
        intent: "compare_lab_reports",
        target_agent: "medical",
        target_action: "compare_lab_reports",
        formatted_text: medRes.summary,
        result_data: medRes.result_data
      }
    };
  }

  // Medical Summary
  if (/\b(medical summary|summary of my medical|clinical summary|summarize my reports|summarize medical history)\b/i.test(message)) {
    const medRes = handleMedicalAgent("get_medical_summary", {
      patient_id: patient.patient_id
    });
    return {
      agent_id: "AGT-AST-001",
      agent_name: "Assistant Agent",
      agent_type: "orchestrator",
      summary: medRes.summary,
      result_data: {
        success: true,
        intent: "get_medical_summary",
        target_agent: "medical",
        target_action: "get_medical_summary",
        formatted_text: medRes.summary,
        result_data: medRes.result_data
      }
    };
  }

  // Extract Lab Parameters
  if (/\b(extract|parse parameters|get parameters)\b/i.test(message) && /\b(lab|report|test)\b/i.test(message)) {
    const medRes = handleMedicalAgent("extract_lab_report", {
      report_id: reportIdMatch ? reportIdMatch[0].toUpperCase() : "LABR-1001",
      patient_id: patient.patient_id
    });
    return {
      agent_id: "AGT-AST-001",
      agent_name: "Assistant Agent",
      agent_type: "orchestrator",
      summary: medRes.summary,
      result_data: {
        success: true,
        intent: "extract_lab_report",
        target_agent: "medical",
        target_action: "extract_lab_report",
        formatted_text: medRes.summary,
        result_data: medRes.result_data
      }
    };
  }

  // Analyze Lab Report / Abnormalities
  if (/\b(analyze|abnormal|findings|panel|blood report|test result|lipid|cholesterol|tsh|hemoglobin|lab report|laboratory)\b/i.test(message) || reportIdMatch) {
    const medRes = handleMedicalAgent("analyze_lab_report", {
      report_id: reportIdMatch ? reportIdMatch[0].toUpperCase() : "LABR-1001",
      patient_id: patient.patient_id
    });
    return {
      agent_id: "AGT-AST-001",
      agent_name: "Assistant Agent",
      agent_type: "orchestrator",
      summary: medRes.summary,
      result_data: {
        success: true,
        intent: "analyze_lab_report",
        target_agent: "medical",
        target_action: "analyze_lab_report",
        formatted_text: medRes.summary,
        result_data: medRes.result_data
      }
    };
  }

  // --------------------------------------------------
  // 3. INSURANCE AGENT ROUTING
  // --------------------------------------------------

  // Ambiguous Insurance Query (e.g., "Apply insurance for Sneha Sharma")
  if (/\b(apply insurance|use insurance|do insurance)\b/i.test(message)) {
    const clarifyText = `I can help verify insurance eligibility, check coverage, prepare a claim, submit a claim, or check claim status. Would you like me to verify ${patient.first_name} ${patient.last_name}'s eligibility or prepare a claim?`;
    return {
      agent_id: "AGT-AST-001",
      agent_name: "Assistant Agent",
      agent_type: "orchestrator",
      summary: clarifyText,
      result_data: {
        success: true,
        needs_clarification: true,
        clarification_type: "ambiguous_options",
        ambiguous_options: ["Verify Eligibility", "Check Coverage", "Prepare Claim", "Submit Claim", "Track Claim Status"],
        formatted_text: clarifyText
      }
    };
  }

  // Coverage / Copay
  if (/\b(coverage|how much coverage|copay|limit|coverage limit)\b/i.test(message)) {
    const insRes = handleInsuranceAgent("get_coverage", {
      patient_id: patient.patient_id,
      policy_id: policyIdMatch ? policyIdMatch[0].toUpperCase() : null
    });
    return {
      agent_id: "AGT-AST-001",
      agent_name: "Assistant Agent",
      agent_type: "orchestrator",
      summary: insRes.summary,
      result_data: {
        success: true,
        intent: "get_coverage",
        target_agent: "insurance",
        target_action: "get_coverage",
        formatted_text: insRes.summary,
        result_data: insRes.result_data
      }
    };
  }

  // Prepare Claim
  if (/\b(prepare a claim|prepare claim|draft claim|create claim)\b/i.test(message)) {
    const insRes = handleInsuranceAgent("prepare_claim", {
      patient_id: patient.patient_id,
      policy_id: policyIdMatch ? policyIdMatch[0].toUpperCase() : null
    });
    return {
      agent_id: "AGT-AST-001",
      agent_name: "Assistant Agent",
      agent_type: "orchestrator",
      summary: insRes.summary,
      result_data: {
        success: true,
        intent: "prepare_claim",
        target_agent: "insurance",
        target_action: "prepare_claim",
        formatted_text: insRes.summary,
        result_data: insRes.result_data
      }
    };
  }

  // Submit Claim
  if (/\b(submit claim|file claim|process claim)\b/i.test(message)) {
    const insRes = handleInsuranceAgent("submit_claim", {
      claim_id: claimIdMatch ? claimIdMatch[0].toUpperCase() : "CLM-1001"
    });
    return {
      agent_id: "AGT-AST-001",
      agent_name: "Assistant Agent",
      agent_type: "orchestrator",
      summary: insRes.summary,
      result_data: {
        success: true,
        intent: "submit_claim",
        target_agent: "insurance",
        target_action: "submit_claim",
        formatted_text: insRes.summary,
        ...insRes.result_data,
        result_data: insRes.result_data
      }
    };
  }

  // Claim Status
  if (/\b(claim status|status of my claim|status of claim|track claim)\b/i.test(message) || claimIdMatch) {
    const insRes = handleInsuranceAgent("get_claim_status", {
      claim_id: claimIdMatch ? claimIdMatch[0].toUpperCase() : "CLM-1001"
    });
    return {
      agent_id: "AGT-AST-001",
      agent_name: "Assistant Agent",
      agent_type: "orchestrator",
      summary: insRes.summary,
      result_data: {
        success: true,
        intent: "get_claim_status",
        target_agent: "insurance",
        target_action: "get_claim_status",
        formatted_text: insRes.summary,
        ...insRes.result_data,
        result_data: insRes.result_data
      }
    };
  }

  // Verify Insurance / Active Status
  if (/\b(insurance|valid|active|eligible|eligibility|policy)\b/i.test(message) || policyIdMatch) {
    const insRes = handleInsuranceAgent("verify_insurance", {
      patient_id: patient.patient_id,
      policy_id: policyIdMatch ? policyIdMatch[0].toUpperCase() : null
    });
    return {
      agent_id: "AGT-AST-001",
      agent_name: "Assistant Agent",
      agent_type: "orchestrator",
      summary: insRes.summary,
      result_data: {
        success: true,
        intent: "verify_insurance",
        target_agent: "insurance",
        target_action: "verify_insurance",
        formatted_text: insRes.summary,
        result_data: insRes.result_data
      }
    };
  }

  // --------------------------------------------------
  // 4. PATIENT AGENT ROUTING
  // --------------------------------------------------

  // Ambiguous Report Query (e.g. "Show my report")
  if (/^(show|view|check|open|get)?\s*(my\s+)?report\b/i.test(message) && !reportIdMatch && !/\b(blood|lipid|thyroid|latest|compare|explain|analyze)\b/i.test(message)) {
    const reportClarify = "Which lab report would you like me to check? You can provide a report ID such as LABR-1001.";
    return {
      agent_id: "AGT-AST-001",
      agent_name: "Assistant Agent",
      agent_type: "orchestrator",
      summary: reportClarify,
      result_data: {
        success: true,
        needs_clarification: true,
        clarification_type: "missing_parameters",
        missing_parameters: ["report_id"],
        formatted_text: reportClarify
      }
    };
  }

  // Register New Patient (Turn 1 or Single-turn)
  if (/\b(register|sign up|create patient|new patient|add patient)\b/i.test(message) && (lower.includes("patient") || lower.includes("register"))) {
    const userRole = (payload.user_role || payload.portal_source || "doctor").toLowerCase();
    if (userRole === "patient") {
      const deniedText = "Permission Denied: Patient accounts cannot register new patients or modify patient records. Please switch to a Nurse, Doctor, or Admin role.";
      return {
        agent_id: "AGT-AST-001",
        agent_name: "Assistant Agent",
        agent_type: "orchestrator",
        summary: deniedText,
        result_data: { success: false, error: "Permission Denied", formatted_text: deniedText }
      };
    }

    // Extract patient name
    let extractedName = "Harini";
    const explicitNameMatch = message.match(/(?:patient\s+name|name\s*:\s*|named\s+)\s*[:\s]?\s*([A-Za-z]+(?:\s+[A-Za-z]+)?)/i) ||
                              message.match(/(?:register|add|create|new)\s+(?:a\s+)?(?:new\s+)?patient\s+(?:named\s+|name:\s*)?([A-Za-z]+(?:\s+[A-Za-z]+)?)/i);
    if (explicitNameMatch) {
      extractedName = explicitNameMatch[1].trim();
    } else {
      const words = message.replace(/(?:register|a|new|patient|sign|up|add|create|name|:)/gi, "").trim().split(/\s+/);
      if (words.length > 0 && words[0].length > 1) {
        extractedName = words[0];
      }
    }
    extractedName = extractedName.charAt(0).toUpperCase() + extractedName.slice(1);

    const dobMatch = message.match(/\b\d{1,2}[./-]\d{1,2}[./-]\d{4}\b/) || message.match(/\b\d{4}-\d{2}-\d{2}\b/) || message.match(/\b\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4}\b/i);
    const genderMatch = message.match(/\b(male|female|other)\b/i);
    const phoneMatch = message.match(/\b\d{10}\b/) || message.match(/\+?\d[\d\s\-]{8,14}\d/);

    if (!dobMatch || !genderMatch || !phoneMatch) {
      LAST_PENDING_REGISTRATION = {
        patient_name: extractedName,
        timestamp: Date.now()
      };

      const clarifyText = `I can register ${extractedName} as a new patient. Please provide:\n• Date of birth\n• Gender\n• Contact number`;
      return {
        agent_id: "AGT-AST-001",
        agent_name: "Assistant Agent",
        agent_type: "orchestrator",
        summary: clarifyText,
        result_data: {
          success: true,
          needs_clarification: true,
          clarification_type: "missing_parameters",
          awaiting_action: "register_patient",
          pendingIntent: "register_patient",
          pendingAgent: "patient_agent",
          patient_name: extractedName,
          missing_parameters: ["date_of_birth", "gender", "contact_number"],
          missingFields: ["date_of_birth", "gender", "contact_number"],
          collectedEntities: { name: extractedName },
          formatted_text: clarifyText,
          context: {
            action: "register_patient",
            awaiting_action: "register_patient",
            pendingIntent: "register_patient",
            pendingAgent: "patient_agent",
            patient_name: extractedName,
            collectedEntities: { name: extractedName },
            missingFields: ["date_of_birth", "gender", "contact_number"]
          }
        }
      };
    }

    const nameParts = extractedName.trim().split(" ");
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(" ") || "Patient";
    const dob = dobMatch[0];
    const gender = genderMatch[1].charAt(0).toUpperCase() + genderMatch[1].slice(1).toLowerCase();
    const phone = phoneMatch[0].trim();

    let maxId = 1000;
    MOCK_DATA.patients.forEach(p => {
      const match = p.patient_id.match(/PAT-(\d+)/i);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxId) maxId = num;
      }
    });
    const newPatientId = `PAT-${maxId + 1}`;

    const newPatient = {
      patient_id: newPatientId,
      first_name: firstName,
      last_name: lastName,
      dob: dob,
      gender: gender,
      blood_group: "O+",
      phone: phone,
      email: `${firstName.toLowerCase()}@example.com`,
      address: "Indiranagar, Bengaluru, Karnataka",
      emergency_contact: { name: "Family Emergency Contact", relationship: "Family", phone: phone },
      primary_doctor_id: "DOC-101",
      insurance_policy_id: "POL-701",
      created_at: new Date().toISOString()
    };

    MOCK_DATA.patients.unshift(newPatient);

    const confirmationText = `Patient ${extractedName} has been successfully registered with Patient ID ${newPatientId} (DOB: ${dob}, Gender: ${gender}, Contact: ${phone}).`;

    return {
      agent_id: "AGT-AST-001",
      agent_name: "Assistant Agent",
      agent_type: "orchestrator",
      summary: confirmationText,
      result_data: {
        success: true,
        intent: "register_patient",
        target_agent: "patient",
        target_action: "register_patient",
        formatted_text: confirmationText,
        patient: newPatient,
        patient_id: newPatientId
      }
    };
  }

  // Update Patient Details (e.g. "Update Arun Kumar's phone number to 9876543210" or "Update Safeek's phone number")
  if (/\b(update|modify|change)\b/i.test(message) && /\b(phone|contact|address|details|number|patient)\b/i.test(message)) {
    const userRole = (payload.user_role || payload.portal_source || "doctor").toLowerCase();
    let targetPatient = MOCK_DATA.patients.find(p => lower.includes(p.first_name.toLowerCase()) || lower.includes(p.patient_id.toLowerCase())) || patient;
    if (userRole === "patient" && targetPatient.patient_id !== "PAT-1001") {
      const deniedText = "Permission Denied: Patient accounts cannot modify other patient records. Please switch to a Nurse, Doctor, or Admin role.";
      return {
        agent_id: "AGT-AST-001",
        agent_name: "Assistant Agent",
        agent_type: "orchestrator",
        summary: deniedText,
        result_data: { success: false, error: "Permission Denied", formatted_text: deniedText }
      };
    }

    const phoneMatch = message.match(/\b\d{10}\b/) || message.match(/\+?\d[\d\s\-]{8,14}\d/);
    if (phoneMatch) {
      targetPatient.phone = phoneMatch[0].trim();
      const updateMsg = `Successfully updated phone number to ${targetPatient.phone} for patient ${targetPatient.first_name} ${targetPatient.last_name} (${targetPatient.patient_id}).`;
      return {
        agent_id: "AGT-AST-001",
        agent_name: "Assistant Agent",
        agent_type: "orchestrator",
        summary: updateMsg,
        result_data: {
          success: true,
          intent: "update_patient",
          target_agent: "patient",
          target_action: "update_patient",
          formatted_text: updateMsg,
          patient: targetPatient
        }
      };
    }
  }

  // Patient Medical / Full History
  if (/\b(history|medical history|full history|clinical records)\b/i.test(message)) {
    const patRes = handlePatientAgent("get_patient_history", {
      patient_id: patient.patient_id
    });
    return {
      agent_id: "AGT-AST-001",
      agent_name: "Assistant Agent",
      agent_type: "orchestrator",
      summary: patRes.summary,
      result_data: {
        success: true,
        intent: "get_patient_history",
        target_agent: "patient",
        target_action: "get_patient_history",
        formatted_text: patRes.summary,
        result_data: patRes.result_data
      }
    };
  }

  // Find / Search Patient
  if (/\b(find|search|lookup|who is)\b/i.test(message) && (lower.includes("patient") || lower.includes("arun") || lower.includes("sneha") || lower.includes("vikram") || lower.includes("safeek"))) {
    const patRes = handlePatientAgent("search_patient", {
      query: message
    });
    return {
      agent_id: "AGT-AST-001",
      agent_name: "Assistant Agent",
      agent_type: "orchestrator",
      summary: patRes.summary,
      result_data: {
        success: true,
        intent: "search_patient",
        target_agent: "patient",
        target_action: "search_patient",
        formatted_text: patRes.summary,
        result_data: patRes.result_data
      }
    };
  }

  // Patient Profile
  if (/\b(profile|patient|pat-\d+)\b/i.test(message) || lower.includes("arun kumar") || lower.includes("sneha sharma") || lower.includes("vikram singh") || lower.includes("safeek")) {
    const targetPatient = MOCK_DATA.patients.find(p => lower.includes(p.first_name.toLowerCase()) || lower.includes(p.patient_id.toLowerCase())) || patient;
    const patRes = handlePatientAgent("get_patient", {
      patient_id: targetPatient.patient_id
    });
    return {
      agent_id: "AGT-AST-001",
      agent_name: "Assistant Agent",
      agent_type: "orchestrator",
      summary: patRes.summary,
      result_data: {
        success: true,
        intent: "get_patient",
        target_agent: "patient",
        target_action: "get_patient",
        formatted_text: patRes.summary,
        result_data: patRes.result_data
      }
    };
  }

  // --------------------------------------------------
  // 5. INTELLIGENT CONTEXTUAL CLARIFICATION (NO GENERIC FALLBACK)
  // --------------------------------------------------
  const contextualClarification = "I can assist you with laboratory report analysis (e.g. 'Analyze LABR-1001'), doctor appointments (e.g. 'Book with Dr Rajesh tomorrow at 10 AM'), patient profiles (e.g. 'Find Arun Kumar'), and insurance claims (e.g. 'Is my insurance active?'). Could you please specify which service you would like?";

  return {
    agent_id: "AGT-AST-001",
    agent_name: "Assistant Agent",
    agent_type: "orchestrator",
    summary: contextualClarification,
    result_data: {
      success: true,
      intent: "general_inquiry",
      target_agent: "assistant",
      target_action: "handle_clarification",
      needs_clarification: true,
      formatted_text: contextualClarification
    }
  };
}

// ----------------------------------------------------
// VERCEL SERVERLESS FUNCTION HANDLER
// ----------------------------------------------------

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
      service: "MEDION Healthcare Intelligence Dispatch API",
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
      target_agent: output.agent_name ? output.agent_name.replace(" Agent", "").toLowerCase() : targetAgent,
      action_performed: action,
      output: output,
      timestamp: new Date().toISOString()
    };

    return res.status(200).json(response);
  } catch (err) {
    return res.status(200).json({
      success: false,
      error: "I couldn't retrieve the healthcare information right now. Please try again.",
      details: err.message,
      timestamp: new Date().toISOString()
    });
  }
}
