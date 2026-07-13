import { useCallback, useEffect, useState } from 'react';
import { studentPortalApi } from '../../api/studentPortalApi';
import { PageHeader } from '../../components/layout/PageHeader';
import { useToast } from '../../context/ToastContext';
import type { StudentSubject } from '../../types/student';
import { getSubjectTypeLabel } from '../../utils/subjectType';
import '../../components/GradeTable.css';
import '../PortalPages.css';

export function StudentSubjectsPage() {
  const { showToast } = useToast();
  const [subjects, setSubjects] = useState<StudentSubject[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSubjects = useCallback(async () => {
    setLoading(true);
    try {
      const response = await studentPortalApi.getSubjects();
      setSubjects(response.data);
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Failed to load subjects.');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  return (
    <div className="page-content portal-page">
      <PageHeader
        badge="Student Portal"
        title="My Subjects"
        description="Subjects in your grade curriculum."
        actions={
          <button type="button" className="btn btn--ghost" onClick={fetchSubjects} disabled={loading}>
            Refresh
          </button>
        }
      />

      <section className="card grade-table-section">
        <div className="table-wrapper">
          {loading ? (
            <div className="table-loading">
              <div className="spinner" />
              <p>Loading subjects…</p>
            </div>
          ) : subjects.length === 0 ? (
            <div className="table-empty">
              <p>No subjects found.</p>
            </div>
          ) : (
            <table className="grade-table">
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Type</th>
                  <th>Teachers</th>
                </tr>
              </thead>
              <tbody>
                {subjects.map((subject) => (
                  <tr key={subject.id}>
                    <td>{subject.subjectName}</td>
                    <td>
                      <span
                        className={`teacher-tag ${subject.isOptional ? 'teacher-tag--optional' : 'teacher-tag--compulsory'}`}
                      >
                        {getSubjectTypeLabel(subject.isOptional)}
                      </span>
                    </td>
                    <td>
                      {subject.teachers.length > 0
                        ? subject.teachers.map((t) => t.name).join(', ')
                        : '—'}
                    </td>
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
