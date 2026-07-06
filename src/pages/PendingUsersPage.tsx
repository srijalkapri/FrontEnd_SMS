import { useCallback, useEffect, useState } from 'react';
import { authApi } from '../api/authApi';
import { ConfirmDeleteModal } from '../components/ConfirmDeleteModal';
import { PageHeader } from '../components/layout/PageHeader';
import { FormModal } from '../components/ui/FormModal';
import { useToast } from '../context/ToastContext';
import type { PendingUser, UserRole } from '../types/auth';
import '../components/GradeTable.css';

const ROLE_OPTIONS: UserRole[] = ['Teacher', 'Admin'];

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export function PendingUsersPage() {
  const { showToast } = useToast();
  const [users, setUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [approvingUser, setApprovingUser] = useState<PendingUser | null>(null);
  const [rejectingUser, setRejectingUser] = useState<PendingUser | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole>('Teacher');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchPendingUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await authApi.getPendingUsers();
      setUsers(response.data);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load pending users.';
      showToast('error', message);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchPendingUsers();
  }, [fetchPendingUsers]);

  function openApproveModal(user: PendingUser) {
    setSelectedRole('Teacher');
    setApprovingUser(user);
  }

  function closeApproveModal() {
    if (!actionLoading) {
      setApprovingUser(null);
    }
  }

  function closeRejectModal() {
    if (!actionLoading) {
      setRejectingUser(null);
    }
  }

  async function handleApprove() {
    if (!approvingUser) return;

    setActionLoading(true);
    try {
      await authApi.approveUser(approvingUser.id, { role: selectedRole });
      showToast('success', `${approvingUser.fullName} approved as ${selectedRole}.`);
      setApprovingUser(null);
      await fetchPendingUsers();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to approve user.';
      showToast('error', message);
    } finally {
      setActionLoading(false);
    }
  }

  async function handleReject() {
    if (!rejectingUser) return;

    setActionLoading(true);
    try {
      await authApi.rejectUser(rejectingUser.id);
      showToast('success', `${rejectingUser.fullName}'s registration was rejected.`);
      setRejectingUser(null);
      await fetchPendingUsers();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to reject user.';
      showToast('error', message);
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <div className="page-content">
      <PageHeader
        badge="Administration"
        title="Pending registrations"
        description="Review and approve or reject user registration requests before they can access the portal."
        actions={
          <button
            type="button"
            className="btn btn--ghost"
            onClick={fetchPendingUsers}
            disabled={loading}
          >
            Refresh
          </button>
        }
      />

      <section className="card grade-table-section">
        <div className="card__header">
          <div>
            <h2 className="card__title">Awaiting approval</h2>
            <p className="card__subtitle">
              {loading ? 'Loading…' : `${users.length} pending request${users.length !== 1 ? 's' : ''}`}
            </p>
          </div>
        </div>

        <div className="table-wrapper">
          {loading && users.length === 0 ? (
            <div className="table-loading">
              <div className="spinner" />
              <p>Loading pending users…</p>
            </div>
          ) : users.length === 0 ? (
            <div className="table-empty">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                />
              </svg>
              <p>No pending registration requests.</p>
            </div>
          ) : (
            <table className="grade-table">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Full name</th>
                  <th>Email</th>
                  <th>Registered</th>
                  <th className="grade-table__actions-col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.username}</td>
                    <td>
                      <span className="grade-name">{user.fullName}</span>
                    </td>
                    <td>
                      <a className="contact-link" href={`mailto:${user.email}`}>
                        {user.email}
                      </a>
                    </td>
                    <td>{formatDate(user.createdAt)}</td>
                    <td>
                      <div className="row-actions">
                        <button
                          type="button"
                          className="btn btn--primary btn--compact"
                          onClick={() => openApproveModal(user)}
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          className="btn btn--danger btn--compact"
                          onClick={() => setRejectingUser(user)}
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      <FormModal
        open={approvingUser !== null}
        title="Approve registration"
        subtitle={
          approvingUser
            ? `Assign a role to ${approvingUser.fullName} (${approvingUser.username})`
            : undefined
        }
        onClose={closeApproveModal}
      >
        <div className="form-group">
          <label className="form-label" htmlFor="approve-role">
            Role
          </label>
          <select
            id="approve-role"
            className="form-input"
            value={selectedRole}
            onChange={(event) => setSelectedRole(event.target.value as UserRole)}
            disabled={actionLoading}
          >
            {ROLE_OPTIONS.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </div>
        <div className="embedded-form__actions">
          <button
            type="button"
            className="btn btn--ghost"
            onClick={closeApproveModal}
            disabled={actionLoading}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn--primary"
            onClick={handleApprove}
            disabled={actionLoading}
          >
            {actionLoading ? 'Approving…' : 'Approve user'}
          </button>
        </div>
      </FormModal>

      <ConfirmDeleteModal
        open={rejectingUser !== null}
        title="Reject registration"
        message={
          rejectingUser ? (
            <>
              Are you sure you want to reject <strong>{rejectingUser.fullName}</strong> (
              {rejectingUser.username})? This action cannot be undone.
            </>
          ) : (
            ''
          )
        }
        confirmLabel="Reject"
        loading={actionLoading}
        onConfirm={handleReject}
        onCancel={closeRejectModal}
      />
    </div>
  );
}
