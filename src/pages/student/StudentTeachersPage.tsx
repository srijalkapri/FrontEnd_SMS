import { useCallback, useEffect, useState } from 'react';
import { studentPortalApi } from '../../api/studentPortalApi';
import { PageHeader } from '../../components/layout/PageHeader';
import { useToast } from '../../context/ToastContext';
import type { StudentTeacher } from '../../types/student';
import '../../components/GradeTable.css';
import { TableScrollWrapper } from '../../components/ui/TableScrollWrapper';
import '../PortalPages.css';

export function StudentTeachersPage() {
  const { showToast } = useToast();
  const [teachers, setTeachers] = useState<StudentTeacher[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTeachers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await studentPortalApi.getTeachers();
      setTeachers(response.data);
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Failed to load teachers.');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchTeachers();
  }, [fetchTeachers]);

  return (
    <div className="page-content portal-page">
      <PageHeader
        badge="Student Portal"
        title="My Teachers"
        description="Teachers assigned to your subjects."
        actions={
          <button type="button" className="btn btn--ghost" onClick={fetchTeachers} disabled={loading}>
            Refresh
          </button>
        }
      />

      <section className="card grade-table-section">
        <TableScrollWrapper>
          {loading ? (
            <div className="table-loading">
              <div className="spinner" />
              <p>Loading teachers…</p>
            </div>
          ) : teachers.length === 0 ? (
            <div className="table-empty">
              <p>No teachers found.</p>
            </div>
          ) : (
            <table className="grade-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                </tr>
              </thead>
              <tbody>
                {teachers.map((teacher) => (
                  <tr key={teacher.id}>
                    <td>
                      <span className="grade-id">#{teacher.id}</span>
                    </td>
                    <td>{teacher.name}</td>
                    <td>
                      <a className="contact-link" href={`mailto:${teacher.email}`}>
                        {teacher.email}
                      </a>
                    </td>
                    <td>{teacher.phoneNo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </TableScrollWrapper>
      </section>
    </div>
  );
}
