import { useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { PortalSidebar, type PortalKind } from './PortalSidebar';
import { ThemeToggle } from './ThemeToggle';
import './AppLayout.css';

interface PortalLayoutProps {
  portal: PortalKind;
}

export function PortalLayout({ portal }: PortalLayoutProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const homeRoute = portal === 'teacher' ? '/teacher' : '/student';
  const title = portal === 'teacher' ? 'Teacher Portal' : 'Student Portal';

  return (
    <div className="app-shell">
      {mobileNavOpen && (
        <button
          type="button"
          className="app-shell__backdrop"
          aria-label="Close navigation"
          onClick={() => setMobileNavOpen(false)}
        />
      )}
      <PortalSidebar
        portal={portal}
        mobileOpen={mobileNavOpen}
        onNavigate={() => setMobileNavOpen(false)}
      />
      <div className="app-shell__main">
        <header className="mobile-topbar">
          <button
            type="button"
            className="mobile-topbar__menu"
            aria-label="Open navigation"
            onClick={() => setMobileNavOpen(true)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>
          <Link to={homeRoute} className="mobile-topbar__title" onClick={() => setMobileNavOpen(false)}>
            {title}
          </Link>
          <div className="mobile-topbar__theme">
            <ThemeToggle />
          </div>
        </header>
        <main className="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
