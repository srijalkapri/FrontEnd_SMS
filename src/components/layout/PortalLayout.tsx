import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AppTopBar } from './AppTopBar';
import { PageTransition } from './PageTransition';
import { PortalSidebar, type PortalKind } from './PortalSidebar';
import './AppLayout.css';

interface PortalLayoutProps {
  portal: PortalKind;
}

function isPortalDashboard(pathname: string, portal: PortalKind) {
  return pathname === (portal === 'teacher' ? '/teacher' : '/student');
}

export function PortalLayout({ portal }: PortalLayoutProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { pathname } = useLocation();
  const homeRoute = portal === 'teacher' ? '/teacher' : '/student';
  const title = portal === 'teacher' ? 'Teacher Portal' : 'Student Portal';
  const showTopBar = isPortalDashboard(pathname, portal);

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
        showAccountControls={!showTopBar}
      />
      <div className="app-shell__main">
        {showTopBar ? (
          <AppTopBar
            title={title}
            homeTo={homeRoute}
            onOpenMobileNav={() => setMobileNavOpen(true)}
            onNavigate={() => setMobileNavOpen(false)}
          />
        ) : (
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
            <Link
              to={homeRoute}
              className="mobile-topbar__title"
              onClick={(event) => {
                event.preventDefault();
                setMobileNavOpen(false);
                window.location.assign(homeRoute);
              }}
            >
              {title}
            </Link>
          </header>
        )}
        <main className="app-content">
          <PageTransition />
        </main>
      </div>
    </div>
  );
}
