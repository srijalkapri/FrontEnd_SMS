import { useCallback, useEffect, useState } from 'react';
import { authApi } from '../api/authApi';
import { gradeApi } from '../api/gradeApi';
import { studentApi } from '../api/studentApi';
import { teacherApi } from '../api/teacherApi';
import { ConfirmDeleteModal } from '../components/ConfirmDeleteModal';
import { PageHeader } from '../components/layout/PageHeader';
import { FormModal } from '../components/ui/FormModal';
import { useToast } from '../context/ToastContext';
import type { ApproveUserRequest, PendingUser, UserRole } from '../types/auth';
import type { Grade } from '../types/grade';
import type { Student } from '../types/student';
import type { Teacher } from '../types/teacher';
import '../components/GradeTable.css';

const ROLE_OPTIONS: UserRole[] = ['SuperAdmin', 'Teacher', 'Student'];

type ProfileMode = 'link' | 'create';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export function PendingUsersPage() {
  const { showToast } = useToast();
  const [users, setUsers] = useState<PendingUser[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);
  const [lookupsLoading, setLookupsLoading] = useState(false);
  const [approvingUser, setApprovingUser] = useState<PendingUser | null>(null);
  const [rejectingUser, setRejectingUser] = useState<PendingUser | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole>('Teacher');
  const [profileMode, setProfileMode] = useState<ProfileMode>('link');
  const [teacherId, setTeacherId] = useState('');
  const [studentId, setStudentId] = useState('');
  const [gradeId, setGradeId] = useState('');
  const [phoneNo, setPhoneNo] = useState('');
  const [formError, setFormError] = useState('');
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

  const fetchLookups = useCallback(async () => {
    setLookupsLoading(true);
    try {
      const [teachersResponse, studentsResponse, gradesResponse] = await Promise.all([
        teacherApi.getAll(),
        studentApi.getAll(),
        gradeApi.getAll(),
      ]);
      setTeachers(teachersResponse.data);
      setStudents(studentsResponse.data);
      setGrades(gradesResponse.data);
    } catch (error) {
      showToast('error', error instanceof Error ? error.message : 'Failed to load lookup data.');
    } finally {
      setLookupsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchPendingUsers();
  }, [fetchPendingUsers]);

  function resetApproveForm(role: UserRole = 'Teacher') {
    setSelectedRole(role);
    setProfileMode('link');
    setTeacherId('');
    setStudentId('');
    setGradeId('');
    setPhoneNo('');
    setFormError('');
  }

  function openApproveModal(user: PendingUser) {
    resetApproveForm('Teacher');
    setApprovingUser(user);
    void fetchLookups();
  }

  function closeApproveModal() {
    if (!actionLoading) {
      setApprovingUser(null);
      resetApproveForm();
    }
  }

  function closeRejectModal() {
    if (!actionLoading) {
      setRejectingUser(null);
    }
  }

  function buildApprovePayload(): ApproveUserRequest | null {
    if (selectedRole === 'SuperAdmin') {
      return { role: 'SuperAdmin' };
    }

    if (selectedRole === 'Teacher') {
      if (profileMode === 'link') {
        const parsedTeacherId = parseInt(teacherId, 10);
        if (!parsedTeacherId || parsedTeacherId <= 0) {
          setFormError('Select an existing teacher to link.');
          return null;
        }
        return { role: 'Teacher', teacherId: parsedTeacherId };
      }

      const trimmedPhone = phoneNo.trim();
      if (!trimmedPhone) {
        setFormError('Phone number is required to create a teacher profile.');
        return null;
      }
      return { role: 'Teacher', phoneNo: trimmedPhone };
    }

    if (profileMode === 'link') {
      const parsedStudentId = parseInt(studentId, 10);
      if (!parsedStudentId || parsedStudentId <= 0) {
        setFormError('Select an existing student to link.');
        return null;
      }
      return { role: 'Student', studentId: parsedStudentId };
    }

    const parsedGradeId = parseInt(gradeId, 10);
    const trimmedPhone = phoneNo.trim();
    if (!parsedGradeId || parsedGradeId <= 0) {
      setFormError('Select a grade for the new student profile.');
      return null;
    }
    if (!trimmedPhone) {
      setFormError('Phone number is required to create a student profile.');
      return null;
    }
    return { role: 'Student', gradeId: parsedGradeId, phoneNo: trimmedPhone };
  }

  async function handleApprove() {
    if (!approvingUser) return;

    setFormError('');
    const payload = buildApprovePayload();
    if (!payload) return;

    setActionLoading(true);
    try {
      await authApi.approveUser(approvingUser.id, payload);
      showToast('success', `${approvingUser.fullName} approved as ${selectedRole}.`);
      setApprovingUser(null);
      resetApproveForm();
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
        size="lg"
      >
        <div className="form-group">
          <label className="form-label" htmlFor="approve-role">
            Role
          </label>
          <select
            id="approve-role"
            className="form-input"
            value={selectedRole}
            onChange={(event) => {
              setSelectedRole(event.target.value as UserRole);
              setProfileMode('link');
              setFormError('');
            }}
            disabled={actionLoading}
          >
            {ROLE_OPTIONS.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </div>

        {selectedRole === 'Teacher' && (
          <>
            <div className="form-group">
              <label className="form-label" htmlFor="teacher-profile-mode">
                Teacher profile
              </label>
              <select
                id="teacher-profile-mode"
                className="form-input"
                value={profileMode}
                onChange={(event) => {
                  setProfileMode(event.target.value as ProfileMode);
                  setFormError('');
                }}
                disabled={actionLoading || lookupsLoading}
              >
                <option value="link">Link existing teacher</option>
                <option value="create">Create new teacher profile</option>
              </select>
            </div>
            {profileMode === 'link' ? (
              <div className="form-group">
                <label className="form-label" htmlFor="approve-teacher-id">
                  Existing teacher
                </label>
                <select
                  id="approve-teacher-id"
                  className="form-input"
                  value={teacherId}
                  onChange={(event) => setTeacherId(event.target.value)}
                  disabled={actionLoading || lookupsLoading}
                >
                  <option value="">Select teacher…</option>
                  {teachers.map((teacher) => (
                    <option key={teacher.id} value={teacher.id}>
                      #{teacher.id} — {teacher.name}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="form-group">
                <label className="form-label" htmlFor="approve-teacher-phone">
                  Phone number
                </label>
                <input
                  id="approve-teacher-phone"
                  type="tel"
                  className="form-input"
                  value={phoneNo}
                  onChange={(event) => setPhoneNo(event.target.value)}
                  placeholder="e.g. 9800000001"
                  disabled={actionLoading}
                />
              </div>
            )}
          </>
        )}

        {selectedRole === 'Student' && (
          <>
            <div className="form-group">
              <label className="form-label" htmlFor="student-profile-mode">
                Student profile
              </label>
              <select
                id="student-profile-mode"
                className="form-input"
                value={profileMode}
                onChange={(event) => {
                  setProfileMode(event.target.value as ProfileMode);
                  setFormError('');
                }}
                disabled={actionLoading || lookupsLoading}
              >
                <option value="link">Link existing student</option>
                <option value="create">Create new student profile</option>
              </select>
            </div>
            {profileMode === 'link' ? (
              <div className="form-group">
                <label className="form-label" htmlFor="approve-student-id">
                  Existing student
                </label>
                <select
                  id="approve-student-id"
                  className="form-input"
                  value={studentId}
                  onChange={(event) => setStudentId(event.target.value)}
                  disabled={actionLoading || lookupsLoading}
                >
                  <option value="">Select student…</option>
                  {students.map((student) => (
                    <option key={student.id} value={student.id}>
                      #{student.id} — {student.name}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <>
                <div className="form-group">
                  <label className="form-label" htmlFor="approve-student-grade">
                    Grade
                  </label>
                  <select
                    id="approve-student-grade"
                    className="form-input"
                    value={gradeId}
                    onChange={(event) => setGradeId(event.target.value)}
                    disabled={actionLoading || lookupsLoading}
                  >
                    <option value="">Select grade…</option>
                    {grades.map((grade) => (
                      <option key={grade.id} value={grade.id}>
                        {grade.className}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="approve-student-phone">
                    Phone number
                  </label>
                  <input
                    id="approve-student-phone"
                    type="tel"
                    className="form-input"
                    value={phoneNo}
                    onChange={(event) => setPhoneNo(event.target.value)}
                    placeholder="e.g. 9800000002"
                    disabled={actionLoading}
                  />
                </div>
              </>
            )}
          </>
        )}

        {formError && <span className="form-error">{formError}</span>}

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
            disabled={actionLoading || lookupsLoading}
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
