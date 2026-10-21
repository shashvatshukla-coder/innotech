import React, { useState } from 'react';
import { Modal } from '../../components/ui/modal';
import { Button } from '../../components/ui/button';
import { SafetyIncident } from '../../types';
import { useAuth } from '../auth/auth-context';

export interface IncidentReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  incident: SafetyIncident | null;
  onSubmit: (note: string, markReviewed: boolean) => Promise<void>;
  isLoading?: boolean;
}

export const IncidentReviewModal: React.FC<IncidentReviewModalProps> = ({
  isOpen,
  onClose,
  incident,
  onSubmit,
  isLoading = false,
}) => {
  const { currentUser } = useAuth();
  const [note, setNote] = useState('');
  const [markReviewed, setMarkReviewed] = useState(true);

  if (!incident) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!note.trim()) return;
    await onSubmit(note, markReviewed);
    setNote('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Review Safety Incident ${incident.id}`}
      description="Add formal audit review notes and update driver safety triage status."
      maxWidth="md"
      footer={
        <>
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="review-form"
            variant="primary"
            isLoading={isLoading}
            disabled={!note.trim()}
          >
            Submit Audit Review
          </Button>
        </>
      }
    >
      <form id="review-form" onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-md space-y-1 font-mono">
          <div><span className="text-slate-500 font-sans">Driver:</span> {incident.driverName}</div>
          <div><span className="text-slate-500 font-sans">Vehicle:</span> {incident.vehicleReg}</div>
          <div><span className="text-slate-500 font-sans">Category:</span> {incident.category.replace(/_/g, ' ')}</div>
          <div><span className="text-slate-500 font-sans">Current Status:</span> {incident.reviewStatus}</div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Safety Review Notes & Assessment
          </label>
          <textarea
            required
            rows={4}
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Document driver coaching actions taken, verification of false/true positive, or mandated rest break..."
            className="w-full rounded-md border border-slate-300 p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 shadow-subtle placeholder:text-slate-400"
          />
        </div>

        <div className="flex items-center gap-2 pt-1">
          <input
            type="checkbox"
            id="markReviewedCheckbox"
            checked={markReviewed}
            onChange={e => setMarkReviewed(e.target.checked)}
            className="rounded border-slate-300 text-brand-600 focus:ring-brand-500 h-4 w-4"
          />
          <label htmlFor="markReviewedCheckbox" className="text-xs text-slate-700 font-medium cursor-pointer">
            Mark this incident as reviewed and resolved
          </label>
        </div>

        <div className="text-[11px] text-slate-500 italic">
          Audited by: {currentUser?.name || 'Safety Officer'} ({currentUser?.role || 'reviewer'})
        </div>
      </form>
    </Modal>
  );
};
