import { FormEvent, useRef, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AuthCardShell } from '../components/auth/AuthCardShell';
import { AuthSubmitButton } from '../components/auth/AuthSubmitButton';
import { PasswordInput } from '../components/auth/PasswordInput';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { runWithSlowNotice, withTimeout } from '../utils/asyncRequest';
import { getHomeRouteForRole, isPathAllowedForRole, parseUserRole } from '../utils/roles';
import './AuthPages.css';

export function LoginPage() {
  const { login, isAuthenticated, isLoading, user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from;

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [slowNotice, setSlowNotice] = useState(false);
  const slowToastShown = useRef(false);

  if (isLoading) {
    return (
      <AuthCardShell busy overlayTitle="Checking session…">
        <div className="auth-card__header">
          <p className="auth-card__subtitle">Please wait</p>
        </div>
      </AuthCardShell>
    );
  }

  if (isAuthenticated && user) {
    const destination =
      from && isPathAllowedForRole(from, user.role) ? from : getHomeRouteForRole(user.role);

    if (destination !== '/login') {
      return <Navigate to={destination} replace />;
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!username.trim() || !password) {
      showToast('error', 'Please enter your username and password.');
      return;
    }

    setSubmitting(true);
    setSlowNotice(false);
    slowToastShown.current = false;

    try {
      const loggedInUser = await runWithSlowNotice(
        withTimeout(login({ username: username.trim(), password })),
        () => {
          setSlowNotice(true);
          if (!slowToastShown.current) {
            slowToastShown.current = true;
            showToast('info', 'Server is waking up… This may take up to a minute.');
          }
        },
      );

      const destination =
        from && isPathAllowedForRole(from, loggedInUser.role)
          ? from
          : getHomeRouteForRole(loggedInUser.role);

      if (destination === '/login' || !parseUserRole(loggedInUser.role)) {
        showToast(
          'error',
          `Signed in, but role "${loggedInUser.role || 'unknown'}" is not supported.`,
        );
        setSubmitting(false);
        return;
      }

      showToast('success', 'Login successful.');
      navigate(destination, { replace: true });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Login failed. Please try again.';
      showToast('error', message);
      setSubmitting(false);
      setSlowNotice(false);
    }
  }

  return (
    <AuthCardShell
      busy={submitting}
      overlayTitle="Signing in…"
      overlayHint={
        slowNotice ? 'Server is waking up. This can take up to a minute on first request.' : undefined
      }
    >
      <div className="auth-card__header">
        <div className="auth-card__logo" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5"
            />
          </svg>
        </div>
        <h1 className="auth-card__title">School Management</h1>
        <p className="auth-card__subtitle">Sign in to your portal</p>
      </div>

      <form className="auth-form" onSubmit={handleSubmit} aria-busy={submitting}>
        <div className="form-group">
          <label className="form-label" htmlFor="username">
            Username
          </label>
          <input
            id="username"
            type="text"
            className="form-input"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            autoComplete="username"
            placeholder="Enter username"
            disabled={submitting}
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="password">
            Password
          </label>
          <PasswordInput
            id="password"
            value={password}
            onChange={setPassword}
            autoComplete="current-password"
            placeholder="Enter password"
            disabled={submitting}
          />
        </div>

        <AuthSubmitButton loading={submitting} loadingLabel="Signing in…" label="Sign in" />
      </form>

      <p className="auth-card__footer">
        Need an account? <Link to="/register">Create one</Link>
      </p>
    </AuthCardShell>
  );
}
