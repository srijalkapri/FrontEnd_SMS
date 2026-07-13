import { useCallback, useEffect, useState } from 'react';
import { teacherPortalApi } from '../../api/teacherPortalApi';
import { PageHeader } from '../../components/layout/PageHeader';
import { useToast } from '../../context/ToastContext';
import type { TeacherPortalStudent } from '../../types/teacherPortal';
import '../../components/GradeTable.css';
import '../PortalPages.css';

export function TeacherStudentsPage() {
  const { showToast } = useToast();
  const [students, setStudents] = useState<TeacherPortalStudent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const response = await teacherPortalApi.getStudents();
      setStudents(response.data);
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Failed to load students.');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  return (
    <div className="page-content portal-page">
      <PageHeader
        badge="Teacher Portal"
        title="My Students"
        description="Students in your classes."
        actions={
          <button type="button" className="btn btn--ghost" onClick={fetchStudents} disabled={loading}>
            Refresh
          </button>
        }
      />

      <section className="card grade-table-section">
        <div className="table-wrapper">
          {loading ? (
            <div className="table-loading">
              <div className="spinner" />
              <p>Loading students…</p>
            </div>
          ) : students.length === 0 ? (
            <div className="table-empty">
              <p>No students found.</p>
            </div>
          ) : (
            <table className="grade-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Grade</th>
                  <th>Email</th>
                  <th>Phone</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.id}>
                    <td>
                      <span className="grade-id">#{student.id}</span>
                    </td>
                    <td>{student.name}</td>
                    <td>{student.gradeName}</td>
                    <td>
                      <a className="contact-link" href={`mailto:${student.email}`}>
                        {student.email}
                      </a>
                    </td>
                    <td>{student.phoneNo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}
