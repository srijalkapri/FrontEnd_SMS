import { useCallback, useEffect, useState } from 'react';
import { teacherPortalApi } from '../../api/teacherPortalApi';
import { PageHeader } from '../../components/layout/PageHeader';
import { useToast } from '../../context/ToastContext';
import type { Grade } from '../../types/grade';
import '../../components/GradeTable.css';
import { TableScrollWrapper } from '../../components/ui/TableScrollWrapper';
import '../PortalPages.css';

export function TeacherClassesPage() {
  const { showToast } = useToast();
  const [classes, setClasses] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchClasses = useCallback(async () => {
    setLoading(true);
    try {
      const response = await teacherPortalApi.getClasses();
      setClasses(response.data);
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Failed to load classes.');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  return (
    <div className="page-content portal-page">
      <PageHeader
        badge="Teacher Portal"
        title="My Classes"
        description="Grades and classes you are associated with."
        actions={
          <button type="button" className="btn btn--ghost" onClick={fetchClasses} disabled={loading}>
            Refresh
          </button>
        }
      />

      <section className="card grade-table-section">
        <TableScrollWrapper>
          {loading ? (
            <div className="table-loading">
              <div className="spinner" />
              <p>Loading classes…</p>
            </div>
          ) : classes.length === 0 ? (
            <div className="table-empty">
              <p>No classes found.</p>
            </div>
          ) : (
            <table className="grade-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Class</th>
                  <th>Class Teacher</th>
                </tr>
              </thead>
              <tbody>
                {classes.map((grade) => (
                  <tr key={grade.id}>
                    <td>
                      <span className="grade-id">#{grade.id}</span>
                    </td>
                    <td>{grade.className}</td>
                    <td>
                      {typeof grade.classTeacher === 'object' && grade.classTeacher
                        ? grade.classTeacher.name
                        : '—'}
                    </td>
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
