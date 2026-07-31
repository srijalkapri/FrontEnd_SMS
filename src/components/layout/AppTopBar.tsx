import { Link } from 'react-router-dom';
import { useSignOut } from '../../hooks/useSignOut';
import { ThemeToggle } from './ThemeToggle';
import '../../pages/AuthPages.css';
import './AppTopBar.css';

interface AppTopBarProps {
  title: string;
  homeTo: string;
  onOpenMobileNav?: () => void;
  onNavigate?: () => void;
}

export function AppTopBar({
  title,
  homeTo,
  onOpenMobileNav,
  onNavigate,
}: AppTopBarProps) {
  const { signOut, signingOut } = useSignOut(onNavigate);

  return (
    <header className="app-topbar">
      <div className="app-topbar__start">
        {onOpenMobileNav && (
          <button
            type="button"
            className="app-topbar__menu"
            aria-label="Open navigation"
            onClick={onOpenMobileNav}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>
        )}
        <Link
          to={homeTo}
          className="app-topbar__title"
          onClick={(event) => {
            event.preventDefault();
            onNavigate?.();
            window.location.assign(homeTo);
          }}
        >
          {title}
        </Link>
      </div>

      <div className="app-topbar__actions">
        <ThemeToggle />

        <button
          type="button"
          className={`app-topbar__logout${signingOut ? ' app-topbar__logout--loading' : ''}`}
          onClick={() => void signOut()}
          disabled={signingOut}
          aria-busy={signingOut}
        >
          {signingOut ? (
            <span className="auth-spinner auth-spinner--inline" aria-hidden="true" />
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"
              />
            </svg>
          )}
          <span className="app-topbar__logout-label">
            {signingOut ? 'Signing out…' : 'Sign out'}
          </span>
        </button>
      </div>
    </header>
  );
}
