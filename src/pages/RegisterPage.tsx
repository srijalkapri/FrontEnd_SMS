import { FormEvent, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { authApi } from '../api/authApi';
import { PasswordInput } from '../components/auth/PasswordInput';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getHomeRouteForRole } from '../utils/roles';
import './AuthPages.css';

export function RegisterPage() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const { showToast } = useToast();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isLoading && isAuthenticated && user) {
    return <Navigate to={getHomeRouteForRole(user.role)} replace />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!username.trim() || !password || !fullName.trim() || !email.trim()) {
      showToast('error', 'Please fill in all required fields.');
      return;
    }

    if (password !== confirmPassword) {
      showToast('error', 'Passwords do not match.');
      return;
    }

    setSubmitting(true);

    try {
      const response = await authApi.register({
        username: username.trim(),
        password,
        confirmPassword,
        fullName: fullName.trim(),
        email: email.trim(),
      });

      setSubmitted(true);
      showToast('success', response.data || 'Registration submitted successfully.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Registration failed.';
      showToast('error', message);
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="auth-card">
        <div className="auth-card__header">
          <div className="auth-card__logo" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1 className="auth-card__title">Registration submitted</h1>
          <p className="auth-card__subtitle">
            Your account is pending admin approval. You will be able to sign in once an
            administrator approves your request.
          </p>
        </div>
        <Link to="/login" className="auth-form__submit auth-form__submit--link">
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="auth-card">
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
        <h1 className="auth-card__title">Create an account</h1>
        <p className="auth-card__subtitle">Register to request access to the admin portal</p>
      </div>

      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label" htmlFor="fullName">
            Full name
          </label>
          <input
            id="fullName"
            type="text"
            className="form-input"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            autoComplete="name"
            placeholder="Enter your full name"
            disabled={submitting}
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            className="form-input"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            placeholder="Enter your email"
            disabled={submitting}
          />
        </div>

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
            placeholder="Choose a username"
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
            autoComplete="new-password"
            placeholder="Create a password"
            disabled={submitting}
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="confirmPassword">
            Confirm password
          </label>
          <PasswordInput
            id="confirmPassword"
            value={confirmPassword}
            onChange={setConfirmPassword}
            autoComplete="new-password"
            placeholder="Confirm your password"
            disabled={submitting}
          />
        </div>

        <button type="submit" className="auth-form__submit" disabled={submitting}>
          {submitting ? 'Submitting…' : 'Create account'}
        </button>
      </form>

      <p className="auth-card__footer">
        Already have an account? <Link to="/login">Sign in</Link>
      </p>
    </div>
  );
}
