import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSignOut } from '../../hooks/useSignOut';
import { ThemeToggle } from './ThemeToggle';
import '../../pages/AuthPages.css';
import './Sidebar.css';

export type PortalKind = 'teacher' | 'student';

interface PortalSidebarProps {
  portal: PortalKind;
  mobileOpen?: boolean;
  onNavigate?: () => void;
}

interface NavItem {
  to: string;
  label: string;
  icon: string;
  end?: boolean;
}

const teacherNav: NavItem[] = [
  { to: '/teacher', label: 'Overview', icon: 'home', end: true },
  { to: '/teacher/profile', label: 'My Profile', icon: 'users' },
  { to: '/teacher/classes', label: 'My Classes', icon: 'layers' },
  { to: '/teacher/students', label: 'My Students', icon: 'student' },
  { to: '/teacher/subjects', label: 'My Subjects', icon: 'book' },
  { to: '/teacher/exams', label: 'Exam Results', icon: 'exam' },
];

const teacherSettingsNav: NavItem[] = [
  { to: '/teacher/settings/appearance', label: 'Appearance', icon: 'palette' },
];

const studentNav: NavItem[] = [
  { to: '/student', label: 'Overview', icon: 'home', end: true },
  { to: '/student/profile', label: 'My Profile', icon: 'student' },
  { to: '/student/grade', label: 'My Grade', icon: 'layers' },
  { to: '/student/subjects', label: 'My Subjects', icon: 'book' },
  { to: '/student/teachers', label: 'My Teachers', icon: 'users' },
  { to: '/student/results', label: 'My Results', icon: 'exam' },
];

const studentSettingsNav: NavItem[] = [
  { to: '/student/settings/appearance', label: 'Appearance', icon: 'palette' },
];

function NavIcon({ name }: { name: string }) {
  switch (name) {
    case 'home':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
        </svg>
      );
    case 'layers':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 8.25h12M6 12h12m-7.5 3.75h7.5M3.75 5.25h16.5a.75.75 0 01.75.75v12a.75.75 0 01-.75.75H3.75a.75.75 0 01-.75-.75v-12a.75.75 0 01.75-.75z" />
        </svg>
      );
    case 'book':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
        </svg>
      );
    case 'users':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
        </svg>
      );
    case 'student':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
        </svg>
      );
    case 'palette':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4.098 19.902a3.75 3.75 0 005.304 0l6.401-6.402a3.75 3.75 0 00-5.304-5.304l-6.4 6.402a3.75 3.75 0 000 5.304z"
          />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 9h.008v.008H15V9z" />
        </svg>
      );
    case 'exam':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 9.75h18M4.5 7.5h15a1.5 1.5 0 011.5 1.5v10.5a1.5 1.5 0 01-1.5 1.5h-15a1.5 1.5 0 01-1.5-1.5V9a1.5 1.5 0 011.5-1.5z" />
        </svg>
      );
    default:
      return null;
  }
}

export function PortalSidebar({ portal, mobileOpen = false, onNavigate }: PortalSidebarProps) {
  const { user } = useAuth();
  const { signOut, signingOut } = useSignOut(onNavigate);
  const navItems = portal === 'teacher' ? teacherNav : studentNav;
  const settingsNav = portal === 'teacher' ? teacherSettingsNav : studentSettingsNav;
  const homeRoute = portal === 'teacher' ? '/teacher' : '/student';
  const portalTitle = portal === 'teacher' ? 'Teacher Portal' : 'Student Portal';

  return (
    <aside className={`sidebar ${mobileOpen ? 'sidebar--open' : ''}`}>
      <NavLink
        to={homeRoute}
        onClick={onNavigate}
        className={({ isActive }) =>
          `sidebar__brand ${isActive ? 'sidebar__brand--active' : ''}`
        }
        end
      >
        <div className="sidebar__logo">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5"
            />
          </svg>
        </div>
        <div>
          <div className="sidebar__title">School Management</div>
          <div className="sidebar__subtitle">{portalTitle}</div>
        </div>
      </NavLink>

      <nav className="sidebar__nav">
        <div className="sidebar__group">
          <div className="sidebar__group-label">Menu</div>
          <ul className="sidebar__list">
            {navItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.end}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
                  }
                >
                  <span className="sidebar__link-icon">
                    <NavIcon name={item.icon} />
                  </span>
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>

        <div className="sidebar__group">
          <div className="sidebar__group-label">Settings</div>
          <ul className="sidebar__list">
            {settingsNav.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.end}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
                  }
                >
                  <span className="sidebar__link-icon">
                    <NavIcon name={item.icon} />
                  </span>
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      <div className="sidebar__footer">
        {user && (
          <div className="sidebar__user">
            <div className="sidebar__user-avatar" aria-hidden="true">
              {user.fullName.charAt(0).toUpperCase()}
            </div>
            <div className="sidebar__user-info">
              <div className="sidebar__user-name">{user.fullName}</div>
              <div className="sidebar__user-role">{user.role}</div>
            </div>
          </div>
        )}
        <ThemeToggle />
        <button
          type="button"
          className={`sidebar__logout${signingOut ? ' sidebar__logout--loading' : ''}`}
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
          {signingOut ? 'Signing out…' : 'Sign out'}
        </button>
      </div>
    </aside>
  );
}
