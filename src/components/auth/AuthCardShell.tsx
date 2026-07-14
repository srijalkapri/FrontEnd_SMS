import type { ReactNode } from 'react';

interface AuthCardShellProps {
  busy?: boolean;
  overlayTitle?: string;
  overlayHint?: string;
  children: ReactNode;
}

export function AuthCardShell({
  busy = false,
  overlayTitle,
  overlayHint,
  children,
}: AuthCardShellProps) {
  return (
    <div className={`auth-card${busy ? ' auth-card--busy' : ''}`}>
      {busy && (
        <div className="auth-card__overlay" role="status" aria-live="polite">
          <span className="auth-spinner auth-spinner--lg" aria-hidden="true" />
          {overlayTitle && <p className="auth-card__overlay-title">{overlayTitle}</p>}
          {overlayHint && <p className="auth-card__overlay-hint">{overlayHint}</p>}
        </div>
      )}
      {children}
    </div>
  );
}
