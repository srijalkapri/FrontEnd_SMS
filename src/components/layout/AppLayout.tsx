import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AdminPendingCountsProvider } from '../../hooks/useAdminPendingCounts';
import { AppTopBar } from './AppTopBar';
import { PageTransition } from './PageTransition';
import { Sidebar } from './Sidebar';
import './AppLayout.css';

function isAdminDashboard(pathname: string) {
  return pathname === '/';
}

export function AppLayout() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { pathname } = useLocation();
  const showTopBar = isAdminDashboard(pathname);

  return (
    <AdminPendingCountsProvider>
      <div className="app-shell">
        {mobileNavOpen && (
          <button
            type="button"
            className="app-shell__backdrop"
            aria-label="Close navigation"
            onClick={() => setMobileNavOpen(false)}
          />
        )}
        <Sidebar
          mobileOpen={mobileNavOpen}
          onNavigate={() => setMobileNavOpen(false)}
          showAccountControls={!showTopBar}
        />
        <div className="app-shell__main">
          {showTopBar ? (
            <AppTopBar
              title="School Management"
              homeTo="/"
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
                to="/"
                className="mobile-topbar__title"
                onClick={(event) => {
                  event.preventDefault();
                  setMobileNavOpen(false);
                  window.location.assign('/');
                }}
              >
                School Management
              </Link>
            </header>
          )}
          <main className="app-content">
            <PageTransition />
          </main>
        </div>
      </div>
    </AdminPendingCountsProvider>
  );
}
