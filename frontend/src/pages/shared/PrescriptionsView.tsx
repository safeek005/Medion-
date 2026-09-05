import React from 'react';
import { MOCK_PRESCRIPTIONS } from '../../data/mockDatasets';
import { Badge } from '../../components/ui/Badge';
import { FileText } from 'lucide-react';

export const PrescriptionsView: React.FC = () => {
  return (
    <div style={{ padding: '2rem', maxWidth: 1150, margin: '0 auto' }}>
      <div style={{ marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-subtle)' }}>
        <h2 className="h2">Prescriptions & Medication History</h2>
        <p className="text-muted" style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
          Read-only pharmaceutical prescriptions issued across patient records
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {MOCK_PRESCRIPTIONS.map((rx) => (
          <div key={rx.prescription_id} className="section-panel" style={{ marginBottom: 0 }}>
            <div className="section-header">
              <div>
                <h3 className="h3">Prescription {rx.prescription_id}</h3>
                <p className="text-muted" style={{ fontSize: '0.78rem', marginTop: '0.15rem' }}>
                  Patient: {rx.patient_id} • Prescribing Physician: {rx.doctor_id} • Issued: {rx.issued_date}
                </p>
              </div>
              <Badge variant="green">{rx.refills_remaining} Refills Remaining</Badge>
            </div>

            <table className="table-ui">
              <thead>
                <tr>
                  <th>Medication Name</th>
                  <th>Dosage</th>
                  <th>Frequency</th>
                  <th>Duration</th>
                  <th>Instructions</th>
                </tr>
              </thead>
              <tbody>
                {rx.medications.map((m, i) => (
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
        ))}
      </div>
    </div>
  );
};
