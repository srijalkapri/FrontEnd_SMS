import { FormEvent, useEffect, useMemo, useState } from 'react';
import { authApi } from '../api/authApi';
import { gradeApi } from '../api/gradeApi';
import { PageHeader } from '../components/layout/PageHeader';
import { useToast } from '../context/ToastContext';
import type {
  AdminCreateAdminRequest,
  AdminCreateStudentRequest,
  AdminCreateTeacherRequest,
} from '../types/auth';
import type { Grade } from '../types/grade';
import './AdminCreateUsersPage.css';

type CreateTarget = 'student' | 'teacher' | 'admin';

const initialStudent = {
  username: '',
  password: '',
  name: '',
  email: '',
  phoneNo: '',
  gradeId: '',
};

const initialTeacher = {
  username: '',
  password: '',
  name: '',
  email: '',
  phoneNo: '',
};

const initialAdmin = {
  username: '',
  password: '',
  fullName: '',
  email: '',
};

export function AdminCreateUsersPage() {
  const { showToast } = useToast();

  const [activeTarget, setActiveTarget] = useState<CreateTarget>('student');
  const [grades, setGrades] = useState<Grade[]>([]);
  const [gradesLoading, setGradesLoading] = useState(false);

  const [student, setStudent] = useState(initialStudent);
  const [teacher, setTeacher] = useState(initialTeacher);
  const [admin, setAdmin] = useState(initialAdmin);

  const [submitting, setSubmitting] = useState<CreateTarget | null>(null);

  useEffect(() => {
    async function loadGrades() {
      setGradesLoading(true);
      try {
        const response = await gradeApi.getAll();
        setGrades(response.data);
      } catch (error) {
        showToast('error', error instanceof Error ? error.message : 'Failed to load grades.');
      } finally {
        setGradesLoading(false);
      }
    }

    void loadGrades();
  }, [showToast]);

  const sortedGrades = useMemo(
    () =>
      [...grades].sort(
        (a, b) => (a.level ?? 0) - (b.level ?? 0) || a.className.localeCompare(b.className),
      ),
    [grades],
  );

  async function handleStudentSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!student.username || !student.password || !student.name || !student.email || !student.phoneNo) {
      showToast('error', 'Please fill all student fields.');
      return;
    }

    const parsedGradeId = Number.parseInt(student.gradeId, 10);
    if (!parsedGradeId || parsedGradeId <= 0) {
      showToast('error', 'Please select a valid grade.');
      return;
    }

    const payload: AdminCreateStudentRequest = {
      username: student.username.trim(),
      password: student.password,
      name: student.name.trim(),
      email: student.email.trim(),
      phoneNo: student.phoneNo.trim(),
      gradeId: parsedGradeId,
    };

    setSubmitting('student');
    try {
      await authApi.adminCreateStudent(payload);
      showToast('success', `Student account "${payload.username}" created successfully.`);
      setStudent(initialStudent);
    } catch (error) {
      showToast('error', error instanceof Error ? error.message : 'Failed to create student.');
    } finally {
      setSubmitting(null);
    }
  }

  async function handleTeacherSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!teacher.username || !teacher.password || !teacher.name || !teacher.email || !teacher.phoneNo) {
      showToast('error', 'Please fill all teacher fields.');
      return;
    }

    const payload: AdminCreateTeacherRequest = {
      username: teacher.username.trim(),
      password: teacher.password,
      name: teacher.name.trim(),
      email: teacher.email.trim(),
      phoneNo: teacher.phoneNo.trim(),
    };

    setSubmitting('teacher');
    try {
      await authApi.adminCreateTeacher(payload);
      showToast('success', `Teacher account "${payload.username}" created successfully.`);
      setTeacher(initialTeacher);
    } catch (error) {
      showToast('error', error instanceof Error ? error.message : 'Failed to create teacher.');
    } finally {
      setSubmitting(null);
    }
  }

  async function handleAdminSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!admin.username || !admin.password || !admin.fullName || !admin.email) {
      showToast('error', 'Please fill all admin fields.');
      return;
    }

    const payload: AdminCreateAdminRequest = {
      username: admin.username.trim(),
      password: admin.password,
      fullName: admin.fullName.trim(),
      email: admin.email.trim(),
    };

    setSubmitting('admin');
    try {
      await authApi.adminCreateAdmin(payload);
      showToast('success', `Admin account "${payload.username}" created successfully.`);
      setAdmin(initialAdmin);
    } catch (error) {
      showToast('error', error instanceof Error ? error.message : 'Failed to create admin.');
    } finally {
      setSubmitting(null);
    }
  }

  return (
    <div className="page-content">
      <PageHeader
        badge="Administration"
        title="Create system users"
        description="Create student, teacher, and admin users directly using AdminCreate APIs."
        icon="administration"
      />

      <section className="card admin-create-users">
        <div className="admin-create-users__tabs" role="tablist" aria-label="Create user type">
          <button
            type="button"
            role="tab"
            aria-selected={activeTarget === 'student'}
            className={`btn btn--ghost ${activeTarget === 'student' ? 'admin-create-users__tab--active' : ''}`}
            onClick={() => setActiveTarget('student')}
          >
            Create Student
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTarget === 'teacher'}
            className={`btn btn--ghost ${activeTarget === 'teacher' ? 'admin-create-users__tab--active' : ''}`}
            onClick={() => setActiveTarget('teacher')}
          >
            Create Teacher
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTarget === 'admin'}
            className={`btn btn--ghost ${activeTarget === 'admin' ? 'admin-create-users__tab--active' : ''}`}
            onClick={() => setActiveTarget('admin')}
          >
            Create Admin
          </button>
        </div>

        {activeTarget === 'student' && (
          <form className="admin-create-users__form" onSubmit={handleStudentSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="student-username">Username</label>
              <input
                id="student-username"
                className="form-input"
                value={student.username}
                onChange={(event) => setStudent((prev) => ({ ...prev, username: event.target.value }))}
                placeholder="student_username"
                disabled={submitting !== null}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="student-password">Password</label>
              <input
                id="student-password"
                type="password"
                className="form-input"
                value={student.password}
                onChange={(event) => setStudent((prev) => ({ ...prev, password: event.target.value }))}
                placeholder="Enter password"
                disabled={submitting !== null}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="student-name">Name</label>
              <input
                id="student-name"
                className="form-input"
                value={student.name}
                onChange={(event) => setStudent((prev) => ({ ...prev, name: event.target.value }))}
                placeholder="Student full name"
                disabled={submitting !== null}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="student-email">Email</label>
              <input
                id="student-email"
                type="email"
                className="form-input"
                value={student.email}
                onChange={(event) => setStudent((prev) => ({ ...prev, email: event.target.value }))}
                placeholder="student@example.com"
                disabled={submitting !== null}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="student-phone">Phone No</label>
              <input
                id="student-phone"
                className="form-input"
                value={student.phoneNo}
                onChange={(event) => setStudent((prev) => ({ ...prev, phoneNo: event.target.value }))}
                placeholder="98XXXXXXXX"
                disabled={submitting !== null}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="student-grade">Grade</label>
              <select
                id="student-grade"
                className="form-input"
                value={student.gradeId}
                onChange={(event) => setStudent((prev) => ({ ...prev, gradeId: event.target.value }))}
                disabled={submitting !== null || gradesLoading}
              >
                <option value="">Select grade…</option>
                {sortedGrades.map((grade) => (
                  <option key={grade.id} value={grade.id}>
                    {grade.className}
                  </option>
                ))}
              </select>
            </div>
            <div className="admin-create-users__actions">
              <button type="submit" className="btn btn--primary" disabled={submitting !== null || gradesLoading}>
                {submitting === 'student' ? 'Creating student…' : 'Create Student'}
              </button>
            </div>
          </form>
        )}

        {activeTarget === 'teacher' && (
          <form className="admin-create-users__form" onSubmit={handleTeacherSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="teacher-username">Username</label>
              <input
                id="teacher-username"
                className="form-input"
                value={teacher.username}
                onChange={(event) => setTeacher((prev) => ({ ...prev, username: event.target.value }))}
                placeholder="teacher_username"
                disabled={submitting !== null}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="teacher-password">Password</label>
              <input
                id="teacher-password"
                type="password"
                className="form-input"
                value={teacher.password}
                onChange={(event) => setTeacher((prev) => ({ ...prev, password: event.target.value }))}
                placeholder="Enter password"
                disabled={submitting !== null}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="teacher-name">Name</label>
              <input
                id="teacher-name"
                className="form-input"
                value={teacher.name}
                onChange={(event) => setTeacher((prev) => ({ ...prev, name: event.target.value }))}
                placeholder="Teacher full name"
                disabled={submitting !== null}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="teacher-email">Email</label>
              <input
                id="teacher-email"
                type="email"
                className="form-input"
                value={teacher.email}
                onChange={(event) => setTeacher((prev) => ({ ...prev, email: event.target.value }))}
                placeholder="teacher@example.com"
                disabled={submitting !== null}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="teacher-phone">Phone No</label>
              <input
                id="teacher-phone"
                className="form-input"
                value={teacher.phoneNo}
                onChange={(event) => setTeacher((prev) => ({ ...prev, phoneNo: event.target.value }))}
                placeholder="98XXXXXXXX"
                disabled={submitting !== null}
              />
            </div>
            <div className="admin-create-users__actions">
              <button type="submit" className="btn btn--primary" disabled={submitting !== null}>
                {submitting === 'teacher' ? 'Creating teacher…' : 'Create Teacher'}
              </button>
            </div>
          </form>
        )}

        {activeTarget === 'admin' && (
          <form className="admin-create-users__form" onSubmit={handleAdminSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="admin-username">Username</label>
              <input
                id="admin-username"
                className="form-input"
                value={admin.username}
                onChange={(event) => setAdmin((prev) => ({ ...prev, username: event.target.value }))}
                placeholder="admin_username"
                disabled={submitting !== null}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="admin-password">Password</label>
              <input
                id="admin-password"
                type="password"
                className="form-input"
                value={admin.password}
                onChange={(event) => setAdmin((prev) => ({ ...prev, password: event.target.value }))}
                placeholder="Enter password"
                disabled={submitting !== null}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="admin-fullname">Full Name</label>
              <input
                id="admin-fullname"
                className="form-input"
                value={admin.fullName}
                onChange={(event) => setAdmin((prev) => ({ ...prev, fullName: event.target.value }))}
                placeholder="Admin full name"
                disabled={submitting !== null}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="admin-email">Email</label>
              <input
                id="admin-email"
                type="email"
                className="form-input"
                value={admin.email}
                onChange={(event) => setAdmin((prev) => ({ ...prev, email: event.target.value }))}
                placeholder="admin@example.com"
                disabled={submitting !== null}
              />
            </div>
            <div className="admin-create-users__actions">
              <button type="submit" className="btn btn--primary" disabled={submitting !== null}>
                {submitting === 'admin' ? 'Creating admin…' : 'Create Admin'}
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}
