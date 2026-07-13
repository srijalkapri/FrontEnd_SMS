import { useEffect, useState } from 'react';
import './Toast.css';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: number;
  type: ToastType;
  message: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: number) => void;
}

const TOAST_TITLES: Record<ToastType, string> = {
  success: 'Success',
  error: 'Error',
  info: 'Notice',
};

const AUTO_DISMISS_MS = 4500;

export function ToastContainer({ toasts, onDismiss }: ToastProps) {
  return (
    <div className="toast-container" aria-live="polite">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function ToastIcon({ type }: { type: ToastType }) {
  if (type === 'success') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );
  }

  if (type === 'error') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" aria-hidden="true">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" aria-hidden="true">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
      />
    </svg>
  );
}

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: ToastMessage;
  onDismiss: (id: number) => void;
}) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => onDismiss(toast.id), AUTO_DISMISS_MS);

    return () => window.clearTimeout(timer);
  }, [onDismiss, toast.id]);

  useEffect(() => {
    if (!exiting) {
      return;
    }

    const timer = window.setTimeout(() => onDismiss(toast.id), 250);
    return () => window.clearTimeout(timer);
  }, [exiting, onDismiss, toast.id]);

  function handleDismiss() {
    setExiting(true);
  }

  return (
    <div
      className={`toast toast--${toast.type} ${exiting ? 'toast--exit' : ''}`}
      role="alert"
      style={{ ['--toast-duration' as string]: `${AUTO_DISMISS_MS}ms` }}
    >
      <div className="toast__icon-wrap" aria-hidden="true">
        <ToastIcon type={toast.type} />
      </div>

      <div className="toast__content">
        <p className="toast__title">{TOAST_TITLES[toast.type]}</p>
        <p className="toast__message">{toast.message}</p>
      </div>

      <button
        type="button"
        className="toast__close"
        onClick={handleDismiss}
        aria-label="Dismiss notification"
      >
        <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path
            fillRule="evenodd"
            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      <span className="toast__progress" aria-hidden="true" />
    </div>
  );
}
