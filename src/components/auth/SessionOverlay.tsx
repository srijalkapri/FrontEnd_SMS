import type { CSSProperties } from 'react';
import type { SessionOverlayMode } from '../../context/SessionOverlayContext';
import './SessionOverlay.css';

interface SessionOverlayProps {
  mode: SessionOverlayMode;
  message: string;
}

export function SessionOverlay({ mode, message }: SessionOverlayProps) {
  if (mode === 'none') return null;

  const isLogout = mode === 'logout';

  return (
    <div
      className={`session-overlay session-overlay--${mode}`}
      role="status"
      aria-live="polite"
      aria-label={message}
    >
      <div className="session-overlay__backdrop" />
      <div className="session-overlay__particles" aria-hidden="true">
        {Array.from({ length: 12 }).map((_, index) => (
          <span
            key={index}
            className="session-overlay__particle"
            style={{ '--i': index } as CSSProperties}
          />
        ))}
      </div>

      <div className="session-overlay__card">
        <div className={`session-overlay__icon session-overlay__icon--${mode}`}>
          {isLogout ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"
              />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
        <p className="session-overlay__title">{message}</p>
        <p className="session-overlay__subtitle">
          {isLogout ? 'Thanks for using School Management' : 'Redirecting to your portal…'}
        </p>
        <div className="session-overlay__bar" aria-hidden="true">
          <span className="session-overlay__bar-fill" />
        </div>
      </div>
    </div>
  );
}
