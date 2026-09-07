import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { MOCK_PATIENTS_LIST, MOCK_LAB_REPORT, MOCK_PRESCRIPTIONS, MOCK_APPOINTMENTS } from '../../data/mockDatasets';
import { PatientProfile, ExecutionTraceStep } from '../../types';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { dispatchToWorkbench } from '../../api/workbench';
import { HumanResponseRenderer } from '../../components/intelligence/HumanResponseRenderer';
import {
  Search,
  ArrowLeft,
  Calendar,
  FileText,
  FlaskConical,
  ShieldCheck,
  Sparkles,
  TrendingDown,
  Code,
  CheckCircle2,
  AlertTriangle,
  User,
} from 'lucide-react';

interface PatientsViewProps {
  onTraceGenerated?: (step: ExecutionTraceStep) => void;
  onOpenTraceDrawer?: () => void;
}

export const PatientsView: React.FC<PatientsViewProps> = ({ onTraceGenerated, onOpenTraceDrawer }) => {
  const { patientId } = useParams<{ patientId?: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<'all' | 'active' | 'recent'>('all');
  const [activeTab, setActiveTab] = useState<'overview' | 'medical' | 'lab' | 'comparison' | 'prescriptions' | 'appointments' | 'insurance' | 'claims'>('overview');

  // AI Context Query State inside Patient Profile
  const [aiLoading, setAiLoading] = useState(false);
  const [aiOutput, setAiOutput] = useState<any>(null);

  // Derive current role prefix (e.g. /doctor, /nurse, /hospital)
  const getRolePrefix = () => {
    if (location.pathname.startsWith('/nurse')) return '/nurse';
    if (location.pathname.startsWith('/patient')) return '/patient';
    if (location.pathname.startsWith('/laboratory')) return '/laboratory';
    if (location.pathname.startsWith('/insurance')) return '/insurance';
    if (location.pathname.startsWith('/hospital')) return '/hospital';
    return '/doctor';
  };

  const rolePrefix = getRolePrefix();

  // Find active patient from route or fallback to selected
  const activePatientId = patientId || 'PAT-1001';
  const selectedPatient = MOCK_PATIENTS_LIST.find(p => p.patient_id === activePatientId) || MOCK_PATIENTS_LIST[0];

  // Filter patients list
  const filteredPatients = MOCK_PATIENTS_LIST.filter(p => {
    const matchesSearch =
      `${p.first_name} ${p.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.patient_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.phone.includes(searchQuery) ||
      p.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const handlePatientSelect = (pId: string) => {
    navigate(`${rolePrefix}/patients/${pId}`);
  };

  // Ask MEDION within Patient Context
  const handleContextualAiAction = async (promptText: string, actionType: string, targetAgent: any = 'medical') => {
    setAiLoading(true);
    setAiOutput(null);

    const requestPayload = {
      workflow_id: `WF-PATCONTEXT-${Date.now().toString().slice(-4)}`,
      agent_target: targetAgent,
      action: actionType,
      portal_source: 'doctor',
      payload: { patient_id: selectedPatient.patient_id, report_id: 'LABR-1001', message: promptText },
    };

    const startTime = performance.now();
    const response = await dispatchToWorkbench(requestPayload);
    const duration = Math.round(performance.now() - startTime);

    setAiLoading(false);
    setAiOutput(response);

    if (onTraceGenerated) {
      onTraceGenerated({
        id: `TR-${Date.now().toString().slice(-4)}`,
        timestamp: new Date().toLocaleTimeString(),
        workflowId: requestPayload.workflow_id,
        portalSource: 'doctor',
        agentTarget: targetAgent,
        action: actionType,
        durationMs: duration,
        success: response.success !== false,
        request: requestPayload,
        response: response,
      });
    }
  };

  // View 1: Detailed Patient Profile Flagship View (when URL has :patientId or detail mode)
  const isDetailView = Boolean(patientId);

  return (
    <div style={{ padding: '2rem', maxWidth: 1200, margin: '0 auto' }}>
      {/* If in Patient Detail Route (/doctor/patients/PAT-1001) */}
      {isDetailView ? (
        <div>
          {/* Header Navigation Back */}
          <div style={{ marginBottom: '1.25rem' }}>
            <button
              onClick={() => navigate(`${rolePrefix}/patients`)}
              className="btn-ui btn-ghost-ui"
              style={{ fontSize: '0.82rem', padding: '0.35rem 0.65rem', color: 'var(--text-muted)' }}
            >
              <ArrowLeft style={{ width: 15, height: 15 }} /> Back to Patients Directory
            </button>
          </div>

          {/* Flagship Patient Identity Context Banner */}
          <div className="section-panel" style={{ padding: '1.75rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '0.35rem' }}>
                  <h1 className="h1" style={{ fontSize: '1.85rem' }}>{selectedPatient.first_name} {selectedPatient.last_name}</h1>
                  <span className="badge-ui badge-green">{selectedPatient.patient_id}</span>
                  <span className="badge-ui badge-neutral">{selectedPatient.gender} • DOB {selectedPatient.date_of_birth}</span>
                </div>
                <div className="text-secondary" style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
                  Primary Doctor: <strong>Dr. Rajesh Mehta ({selectedPatient.primary_doctor_id})</strong> • Policy: <strong>{selectedPatient.insurance_policy_id}</strong> • Blood Group: <strong>{selectedPatient.blood_group}</strong>
                </div>
              </div>

              {/* Contextual Ask MEDION Trigger */}
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleContextualAiAction(`Analyze ${selectedPatient.first_name}'s latest lab report`, 'analyze_lab_report')}
                  disabled={aiLoading}
                >
                  <Sparkles style={{ width: 14, height: 14 }} /> {aiLoading ? 'Analyzing...' : 'Ask MEDION: Analyze Labs'}
                </Button>
              </div>
            </div>

            {/* Contextual AI Output Container */}
            {aiOutput && (
              <div style={{ marginTop: '1.25rem', background: 'var(--bg-app)', border: '1px solid var(--border-subtle)', borderRadius: 8, padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--forest-green)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    MEDION-Generated Clinical Insight ({aiOutput.target_agent || 'Medical Agent'})
                  </span>
                  {onOpenTraceDrawer && (
                    <button className="btn-ui btn-ghost-ui" onClick={onOpenTraceDrawer} style={{ fontSize: '0.75rem', padding: '0.2rem' }}>
                      <Code style={{ width: 13, height: 13 }} /> Trace Execution ➔
                    </button>
                  )}
                </div>
                <div style={{ marginTop: '0.5rem' }}>
                  <HumanResponseRenderer response={aiOutput} />
                </div>
              </div>
            )}
          </div>

          {/* Stateful Clinical Profile Tabs */}
          <div className="section-panel" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '1.25rem', borderBottom: '1px solid var(--border-subtle)', marginBottom: '1.5rem', overflowX: 'auto' }}>
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'medical', label: 'Medical Records' },
                { id: 'lab', label: 'Lab Reports' },
                { id: 'comparison', label: 'Lab Comparison' },
                { id: 'prescriptions', label: 'Prescriptions' },
                { id: 'appointments', label: 'Appointments' },
                { id: 'insurance', label: 'Insurance' },
                { id: 'claims', label: 'Bills & Claims' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  style={{
                    padding: '0.6rem 0.25rem',
                    background: 'none',
                    border: 'none',
                    borderBottom: activeTab === tab.id ? '2.5px solid var(--forest-green)' : '2.5px solid transparent',
                    color: activeTab === tab.id ? 'var(--forest-green)' : 'var(--text-muted)',
                    fontWeight: activeTab === tab.id ? 600 : 400,
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* TAB 1: OVERVIEW */}
            {activeTab === 'overview' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                <div>
                  <h4 className="h4" style={{ marginBottom: '0.85rem' }}>Patient Demographics & Contact</h4>
                  <table className="table-ui">
                    <tbody>
                      <tr><td className="text-muted">Full Name</td><td style={{ fontWeight: 600 }}>{selectedPatient.first_name} {selectedPatient.last_name}</td></tr>
                      <tr><td className="text-muted">Patient ID</td><td>{selectedPatient.patient_id}</td></tr>
                      <tr><td className="text-muted">Date of Birth</td><td>{selectedPatient.date_of_birth}</td></tr>
                      <tr><td className="text-muted">Gender & Blood Group</td><td>{selectedPatient.gender} ({selectedPatient.blood_group})</td></tr>
                      <tr><td className="text-muted">Phone Number</td><td>{selectedPatient.phone}</td></tr>
                      <tr><td className="text-muted">Email Address</td><td>{selectedPatient.email}</td></tr>
                      <tr><td className="text-muted">Residential Address</td><td>{selectedPatient.address}</td></tr>
                    </tbody>
                  </table>
                </div>

                <div>
                  <h4 className="h4" style={{ marginBottom: '0.85rem' }}>Emergency Contact & Attending Care</h4>
                  <table className="table-ui">
                    <tbody>
                      <tr><td className="text-muted">Emergency Contact Name</td><td style={{ fontWeight: 600 }}>{selectedPatient.emergency_contact.name}</td></tr>
                      <tr><td className="text-muted">Relationship</td><td>{selectedPatient.emergency_contact.relationship}</td></tr>
                      <tr><td className="text-muted">Emergency Phone</td><td>{selectedPatient.emergency_contact.phone}</td></tr>
                      <tr><td className="text-muted">Primary Physician</td><td>Dr. Rajesh Mehta ({selectedPatient.primary_doctor_id})</td></tr>
                      <tr><td className="text-muted">Insurance Policy ID</td><td>{selectedPatient.insurance_policy_id}</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 2: MEDICAL RECORDS */}
            {activeTab === 'medical' && (
              <div>
                <h4 className="h4" style={{ marginBottom: '1rem' }}>Clinical Encounter History</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ background: 'var(--bg-app)', border: '1px solid var(--border-subtle)', borderRadius: 8, padding: '1.1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Routine Cardiology Follow-up & Hypertension Assessment</span>
                      <span className="text-muted" style={{ fontSize: '0.78rem' }}>2024-06-14</span>
                    </div>
                    <div className="text-muted" style={{ fontSize: '0.8rem', marginBottom: '0.5rem' }}>Physician: Dr. Rajesh Mehta (DOC-101)</div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      Patient presents for 3-month cardiology follow-up. Blood pressure recorded at 132/84 mmHg. Reported slight lethargy. Diagnostic blood panel (LABR-1001) ordered to evaluate hemoglobin and lipid levels.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: LAB REPORTS & DETAIL VIEW */}
            {activeTab === 'lab' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <div>
                    <h4 className="h4">{MOCK_LAB_REPORT.test_type} ({MOCK_LAB_REPORT.report_id})</h4>
                    <span className="text-muted" style={{ fontSize: '0.78rem' }}>Collection Date: {MOCK_LAB_REPORT.test_date} • Laboratory: {MOCK_LAB_REPORT.laboratory_id}</span>
                  </div>
                  <Button variant="secondary" size="sm" onClick={() => setActiveTab('comparison')}>
                    <TrendingDown style={{ width: 14, height: 14 }} /> Compare with Previous LABR-1002
                  </Button>
                </div>

                <table className="table-ui" style={{ marginBottom: '1.5rem' }}>
                  <thead>
                    <tr>
                      <th>Diagnostic Parameter</th>
                      <th>Measured Result</th>
                      <th>Reference Bounds</th>
                      <th>Clinical Indicator</th>
                    </tr>
                  </thead>
                  <tbody>
                    {MOCK_LAB_REPORT.results.map((r, i) => (
                      <tr key={i}>
                        <td style={{ fontWeight: 500 }}>{r.parameter}</td>
                        <td>{r.value} {r.unit}</td>
                        <td className="text-muted">{r.reference_range}</td>
                        <td>
                          {r.is_abnormal ? (
                            <Badge variant="amber">{r.abnormality_direction}</Badge>
                          ) : (
                            <Badge variant="green">NORMAL</Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Structured MEDION Insight Section */}
                <div style={{ background: 'var(--bg-app)', border: '1px solid var(--border-subtle)', borderRadius: 8, padding: '1rem' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--forest-green)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.25rem' }}>
                    MEDION-Generated Clinical Insight
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    Low Hemoglobin (10.4 g/dL vs ref 13.5–17.5) and mildly elevated Total Cholesterol (215 mg/dL vs ref &lt;200) detected. Recommend iron supplementation and dietary lipid evaluation.
                  </p>
                </div>
              </div>
            )}

            {/* TAB 4: LAB COMPARISON (LABR-1002 vs LABR-1001) */}
            {activeTab === 'comparison' && (
              <div>
                <h4 className="h4" style={{ marginBottom: '0.5rem' }}>Laboratory Trend Comparison (LABR-1002 vs LABR-1001)</h4>
                <p className="text-muted" style={{ fontSize: '0.8rem', marginBottom: '1.25rem' }}>
                  Comparing previous baseline diagnostic results with current panel
                </p>

                <table className="table-ui">
                  <thead>
                    <tr>
                      <th>Parameter</th>
                      <th>Previous Value (LABR-1002)</th>
                      <th>Current Value (LABR-1001)</th>
                      <th>Reference Bounds</th>
                      <th>Clinical Trend</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ fontWeight: 500 }}>Hemoglobin</td>
                      <td>11.8 g/dL</td>
                      <td>10.4 g/dL</td>
                      <td className="text-muted">13.5 - 17.5</td>
                      <td><Badge variant="amber">↓ Decreasing (Low)</Badge></td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: 500 }}>Total Cholesterol</td>
                      <td>230.0 mg/dL</td>
                      <td>215.0 mg/dL</td>
                      <td className="text-muted">&lt; 200</td>
                      <td><Badge variant="green">↓ Improving (High)</Badge></td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: 500 }}>Fasting Blood Sugar</td>
                      <td>95.0 mg/dL</td>
                      <td>92.0 mg/dL</td>
                      <td className="text-muted">70 - 99</td>
                      <td><Badge variant="green">→ Stable (Normal)</Badge></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {/* TAB 5: PRESCRIPTIONS */}
            {activeTab === 'prescriptions' && (
              <div>
                <h4 className="h4" style={{ marginBottom: '1rem' }}>Active Prescriptions (RX-1001)</h4>
                <table className="table-ui">
                  <thead>
                    <tr>
                      <th>Medication Name</th>
                      <th>Dosage</th>
                      <th>Frequency</th>
                      <th>Duration</th>
                      <th>Physician Instructions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {MOCK_PRESCRIPTIONS[0].medications.map((m, i) => (
                      <tr key={i}>
                        <td style={{ fontWeight: 600 }}>{m.name}</td>
                        <td>{m.dosage}</td>
                        <td>{m.frequency}</td>
                        <td>{m.duration_days} days</td>
                        <td className="text-muted">{m.instructions}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* TAB 6: APPOINTMENTS */}
            {activeTab === 'appointments' && (
              <div>
                <h4 className="h4" style={{ marginBottom: '1rem' }}>Scheduled Appointments</h4>
                <table className="table-ui">
                  <thead>
                    <tr>
                      <th>Appointment ID</th>
                      <th>Attending Doctor</th>
                      <th>Date & Slot</th>
                      <th>Reason for Visit</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {MOCK_APPOINTMENTS.map((apt, i) => (
                      <tr key={i}>
                        <td style={{ fontWeight: 600 }}>{apt.appointment_id}</td>
                        <td>{apt.doctor_id}</td>
                        <td>{apt.date} ({apt.time_slot})</td>
                        <td>{apt.reason}</td>
                        <td><Badge variant="green">{apt.status}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* TAB 7: INSURANCE */}
            {activeTab === 'insurance' && (
              <div>
                <h4 className="h4" style={{ marginBottom: '1rem' }}>Active Policy (POL-701)</h4>
                <table className="table-ui">
                  <tbody>
                    <tr><td className="text-muted">Policy ID</td><td style={{ fontWeight: 600 }}>POL-701</td></tr>
                    <tr><td className="text-muted">Policy Number</td><td>SH-2024-998811</td></tr>
                    <tr><td className="text-muted">Plan Type</td><td>Comprehensive Health Shield</td></tr>
                    <tr><td className="text-muted">Coverage Amount</td><td>₹500,000</td></tr>
                    <tr><td className="text-muted">Remaining Coverage</td><td>₹425,000</td></tr>
                    <tr><td className="text-muted">Copay Percentage</td><td>10%</td></tr>
                    <tr><td className="text-muted">Policy Status</td><td><Badge variant="green">ACTIVE</Badge></td></tr>
                  </tbody>
                </table>
              </div>
            )}

            {/* TAB 8: BILLS & CLAIMS */}
            {activeTab === 'claims' && (
              <div>
                <h4 className="h4" style={{ marginBottom: '1rem' }}>Submitted Claims & Adjudication Status</h4>
                <table className="table-ui" style={{ marginBottom: '1.5rem' }}>
                  <thead>
                    <tr>
                      <th>Claim ID</th>
                      <th>Bill ID</th>
                      <th>Service Type</th>
                      <th>Claim Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ fontWeight: 600 }}>CLM-1001</td>
                      <td>BILL-1001</td>
                      <td>Cardiology Consultation & Diagnostic Panel</td>
                      <td>₹4,500</td>
                      <td><Badge variant="amber">UNDER REVIEW</Badge></td>
                    </tr>
                  </tbody>
                </table>

                {/* Refined Claim Timeline */}
                <div style={{ background: 'var(--bg-app)', border: '1px solid var(--border-subtle)', borderRadius: 8, padding: '1.25rem' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Claim Adjudication Lifecycle
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ textAlign: 'center' }}><span style={{ fontWeight: 700, color: 'var(--forest-green)' }}>✓</span> <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Prepared</span></div>
                    <div style={{ flex: 1, height: 2, background: 'var(--forest-green)', margin: '0 0.5rem' }}></div>
                    <div style={{ textAlign: 'center' }}><span style={{ fontWeight: 700, color: 'var(--forest-green)' }}>✓</span> <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Submitted</span></div>
                    <div style={{ flex: 1, height: 2, background: 'var(--forest-green)', margin: '0 0.5rem' }}></div>
                    <div style={{ textAlign: 'center' }}><span style={{ fontWeight: 700, color: 'var(--forest-green)' }}>●</span> <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--forest-green)' }}>Under Review</span></div>
                    <div style={{ flex: 1, height: 2, background: 'var(--border-subtle)', margin: '0 0.5rem' }}></div>
                    <div style={{ textAlign: 'center' }}><span style={{ color: 'var(--text-muted)' }}>○</span> <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Approved</span></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* View 2: Refined Clinical Patient Directory (/doctor/patients) */
        <div>
          <div style={{ marginBottom: '1.75rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-subtle)' }}>
            <h2 className="h2">Patients Directory</h2>
            <p className="text-muted" style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
              Clinical records and patient management directory
            </p>
          </div>

          <div className="section-panel">
            {/* Search Bar & Category Filters */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', gap: '1rem' }}>
              <div className="command-input-container" style={{ flex: 1, maxWidth: 450, padding: '0.45rem 0.85rem' }}>
                <Search style={{ width: 16, height: 16, color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  className="command-input"
                  placeholder="Search patient name, ID, phone, or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => setFilterCategory('all')}
                  className={`btn-ui ${filterCategory === 'all' ? 'btn-primary-ui' : 'btn-ghost-ui'}`}
                  style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem' }}
                >
                  All Patients
                </button>
                <button
                  onClick={() => setFilterCategory('active')}
                  className={`btn-ui ${filterCategory === 'active' ? 'btn-primary-ui' : 'btn-ghost-ui'}`}
                  style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem' }}
                >
                  Active
                </button>
              </div>
            </div>

            {/* Refined Clinical Patients Table */}
            {filteredPatients.length > 0 ? (
              <table className="table-ui">
                <thead>
                  <tr>
                    <th>Patient Name</th>
                    <th>Patient ID</th>
                    <th>DOB / Gender</th>
                    <th>Contact Phone</th>
                    <th>Primary Physician</th>
                    <th>Insurance Policy</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPatients.map((p) => (
                    <tr
                      key={p.patient_id}
                      style={{ cursor: 'pointer' }}
                      onClick={() => handlePatientSelect(p.patient_id)}
                    >
                      <td style={{ fontWeight: 600 }}>{p.first_name} {p.last_name}</td>
                      <td><Badge variant="green">{p.patient_id}</Badge></td>
                      <td className="text-muted">{p.date_of_birth} ({p.gender})</td>
                      <td className="text-muted">{p.phone}</td>
                      <td>{p.primary_doctor_id}</td>
                      <td>{p.insurance_policy_id}</td>
                      <td><Badge variant="green">Active</Badge></td>
                      <td>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePatientSelect(p.patient_id);
                          }}
                          style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
                        >
                          View Profile ➔
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                No patient records match the search query "{searchQuery}".
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
