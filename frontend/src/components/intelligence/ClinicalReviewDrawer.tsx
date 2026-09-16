import React, { useState } from 'react';
import { Drawer } from '../ui/Drawer';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { AlertCircle, ShieldAlert, Sparkles, CheckCircle2, XCircle, Edit3, User, Stethoscope, AlertTriangle } from 'lucide-react';

export interface ProposedClinicalAction {
  id: string;
  actionType: 'prescription_change' | 'lab_order' | 'triage_escalation' | 'claim_authorization' | 'discharge_order';
  title: string;
  patient: {
    id: string;
    name: string;
    dob?: string;
    allergies?: string[];
  };
  currentStatus: string;
  proposedChange: {
    item: string;
    detail: string;
    previous?: string;
  };
  clinicalRationale: string;
  contraindications?: string[];
  reviewingClinician: {
    name: string;
    role: string;
    department: string;
  };
}

export interface ClinicalReviewDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  proposal: ProposedClinicalAction | null;
  onApprove: (proposal: ProposedClinicalAction, notes?: string) => Promise<void> | void;
  onReject: (proposal: ProposedClinicalAction, reason: string) => Promise<void> | void;
  onModify?: (proposal: ProposedClinicalAction) => void;
}

export const ClinicalReviewDrawer: React.FC<ClinicalReviewDrawerProps> = ({
  isOpen,
  onClose,
  proposal,
  onApprove,
  onReject,
  onModify,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rejectMode, setRejectMode] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [clinicalNotes, setClinicalNotes] = useState('');

  if (!proposal) return null;

  const handleApprove = async () => {
    setIsSubmitting(true);
    try {
      await onApprove(proposal, clinicalNotes);
      setIsSubmitting(false);
      onClose();
    } catch {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) return;
    setIsSubmitting(true);
    try {
      await onReject(proposal, rejectReason);
      setIsSubmitting(false);
      setRejectMode(false);
      onClose();
    } catch {
      setIsSubmitting(false);
    }
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={() => {
        setRejectMode(false);
        onClose();
      }}
      title="Human-in-the-Loop Clinical Review"
      subtitle="MEDION Intelligence Recommendation Protocol"
      width="lg"
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          {!rejectMode ? (
            <>
              <Button
                variant="danger"
                size="sm"
                onClick={() => setRejectMode(true)}
                disabled={isSubmitting}
              >
                <XCircle style={{ width: 14, height: 14 }} /> Reject Proposal
              </Button>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {onModify && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => onModify(proposal)}
                    disabled={isSubmitting}
                  >
                    <Edit3 style={{ width: 14, height: 14 }} /> Modify Parameters
                  </Button>
                )}
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleApprove}
                  disabled={isSubmitting}
                >
                  <CheckCircle2 style={{ width: 14, height: 14 }} />
                  {isSubmitting ? 'Signing Action...' : 'Approve & Sign Order'}
                </Button>
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', width: '100%' }}>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setRejectMode(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleReject}
                disabled={isSubmitting || !rejectReason.trim()}
              >
                Confirm Rejection
              </Button>
            </div>
          )}
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Patient Identity Banner */}
        <div
          style={{
            background: 'var(--bg-app)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem 1.15rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: 'var(--forest-tint)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--forest-brand)',
              }}
            >
              <User style={{ width: 20, height: 20 }} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>
                  {proposal.patient.name}
                </span>
                <Badge variant="brand">{proposal.patient.id}</Badge>
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                {proposal.patient.dob ? `DOB: ${proposal.patient.dob}` : 'Hospital Inpatient Chart'}
              </div>
            </div>
          </div>

          {/* Allergy Alert Pill */}
          {proposal.patient.allergies && proposal.patient.allergies.length > 0 && (
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 600, color: 'var(--danger-red)' }}>
                Documented Allergies
              </div>
              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                {proposal.patient.allergies.join(', ')}
              </div>
            </div>
          )}
        </div>

        {/* Contraindication Alert Box */}
        {proposal.contraindications && proposal.contraindications.length > 0 && (
          <div
            style={{
              padding: '0.85rem 1rem',
              borderRadius: 'var(--radius-md)',
              background: 'var(--warning-amber-bg)',
              border: '1px solid var(--warning-amber-border)',
              display: 'flex',
              gap: '0.65rem',
              color: '#92400e',
              fontSize: '0.84rem',
              lineHeight: 1.5,
            }}
          >
            <AlertTriangle style={{ width: 18, height: 18, flexShrink: 0, marginTop: '0.1rem', color: 'var(--warning-amber)' }} />
            <div>
              <strong style={{ display: 'block', marginBottom: '0.2rem' }}>Potential Clinical Interaction Warning:</strong>
              {proposal.contraindications.map((c, i) => (
                <div key={i}>• {c}</div>
              ))}
            </div>
          </div>
        )}

        {/* Before vs Proposed Comparison Panel */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '1rem',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '1.25rem',
          }}
        >
          <div>
            <span style={{ fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)', fontWeight: 600 }}>
              Current Status / Regimen
            </span>
            <div style={{ marginTop: '0.4rem', fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              {proposal.currentStatus}
            </div>
            {proposal.proposedChange.previous && (
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                {proposal.proposedChange.previous}
              </div>
            )}
          </div>

          <div style={{ borderLeft: '1px dashed var(--border-subtle)', paddingLeft: '1rem' }}>
            <span style={{ fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--forest-brand)', fontWeight: 700 }}>
              Proposed Intervention
            </span>
            <div style={{ marginTop: '0.4rem', fontSize: '0.92rem', fontWeight: 700, color: 'var(--forest-brand)' }}>
              {proposal.proposedChange.item}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              {proposal.proposedChange.detail}
            </div>
          </div>
        </div>

        {/* Clinical Rationale & Agent Evidence */}
        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '1.25rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem', color: 'var(--forest-brand)', fontWeight: 600, fontSize: '0.85rem' }}>
            <Sparkles style={{ width: 15, height: 15 }} />
            MEDION Agent Clinical Rationale
          </div>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.55, margin: 0 }}>
            {proposal.clinicalRationale}
          </p>
        </div>

        {/* Reviewing Clinician Badge */}
        <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Stethoscope style={{ width: 14, height: 14 }} />
          Authorizing Physician: <strong>{proposal.reviewingClinician.name}</strong> ({proposal.reviewingClinician.department})
        </div>

        {/* Rejection Reason Form (when Reject is chosen) */}
        {rejectMode ? (
          <div style={{ marginTop: '0.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: '0.35rem', color: 'var(--danger-red)' }}>
              Clinical Reason for Rejection / Counter-Indication *
            </label>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Provide clinical rationale for rejecting this recommendation (e.g. recent adverse reaction, clinical preference, alternative protocol)..."
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--danger-red)',
                fontSize: '0.85rem',
                fontFamily: 'var(--font-sans)',
                outline: 'none',
              }}
              required
            />
          </div>
        ) : (
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: '0.35rem', color: 'var(--text-muted)' }}>
              Optional Clinician Chart Notes
            </label>
            <textarea
              rows={2}
              value={clinicalNotes}
              onChange={(e) => setClinicalNotes(e.target.value)}
              placeholder="Add personal clinical remarks before counter-signing into the EHR chart..."
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-strong)',
                fontSize: '0.85rem',
                fontFamily: 'var(--font-sans)',
                outline: 'none',
              }}
            />
          </div>
        )}
      </div>
    </Drawer>
  );
};
