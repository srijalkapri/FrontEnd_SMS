import type { CSSProperties, ReactNode } from 'react';
import '../../pages/AuthPages.css';
import './AuthCardShell.css';

export type AuthCardStatus = 'idle' | 'loading' | 'success';

interface AuthCardShellProps {
  status?: AuthCardStatus;
  /** @deprecated Use status="loading" instead */
  busy?: boolean;
  overlayTitle?: string;
  overlayHint?: string;
  successTitle?: string;
  successHint?: string;
  children: ReactNode;
}

export function AuthCardShell({
  status,
  busy = false,
  overlayTitle,
  overlayHint,
  successTitle = 'Welcome back!',
  successHint = 'Opening your portal…',
  children,
}: AuthCardShellProps) {
  const resolvedStatus: AuthCardStatus =
    status ?? (busy ? 'loading' : 'idle');
  const isBusy = resolvedStatus === 'loading' || resolvedStatus === 'success';

  return (
    <div
      className={`auth-card auth-card--animated${
        isBusy ? ' auth-card--busy' : ''
      }${resolvedStatus === 'success' ? ' auth-card--success' : ''}`}
    >
      {resolvedStatus === 'loading' && (
        <div className="auth-card__overlay auth-card__overlay--loading" role="status" aria-live="polite">
          <div className="auth-card__loader-ring" aria-hidden="true">
            <span className="auth-spinner auth-spinner--lg" />
          </div>
          {overlayTitle && <p className="auth-card__overlay-title">{overlayTitle}</p>}
          {overlayHint && <p className="auth-card__overlay-hint">{overlayHint}</p>}
        </div>
      )}

      {resolvedStatus === 'success' && (
        <div className="auth-card__overlay auth-card__overlay--success" role="status" aria-live="polite">
          <div className="auth-card__success-burst" aria-hidden="true">
            {Array.from({ length: 8 }).map((_, index) => (
              <span key={index} style={{ '--burst-i': index } as CSSProperties} />
            ))}
          </div>
          <div className="auth-card__success-check" aria-hidden="true">
            <svg viewBox="0 0 52 52">
              <circle className="auth-card__success-circle" cx="26" cy="26" r="24" />
              <path className="auth-card__success-path" d="M14 27l7 7 16-16" />
            </svg>
          </div>
          <p className="auth-card__overlay-title auth-card__overlay-title--success">{successTitle}</p>
          <p className="auth-card__overlay-hint">{successHint}</p>
        </div>
      )}

      {children}
    </div>
  );
}
