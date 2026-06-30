import type { ReactNode } from 'react';
import './DeleteModal.css';

interface ConfirmDeleteModalProps {
  open: boolean;
  title: string;
  message: ReactNode;
  confirmLabel: string;
  loading: boolean;
  confirmVariant?: 'danger' | 'primary';
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDeleteModal({
  open,
  title,
  message,
  confirmLabel,
  loading,
  confirmVariant = 'danger',
  onConfirm,
  onCancel,
}: ConfirmDeleteModalProps) {
  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onCancel} role="dialog" aria-modal="true">
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
            />
          </svg>
        </div>
        <h3 className="modal__title">{title}</h3>
        <p className="modal__message">{message}</p>
        <div className="modal__actions">
          <button className="btn btn--ghost" onClick={onCancel} disabled={loading}>
            Cancel
          </button>
          <button
            className={`btn ${confirmVariant === 'primary' ? 'btn--primary' : 'btn--danger'} ${loading ? 'btn--loading' : ''}`}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner spinner--sm" />
                {confirmVariant === 'primary' ? 'Working...' : 'Deleting...'}
              </>
            ) : (
              confirmLabel
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
