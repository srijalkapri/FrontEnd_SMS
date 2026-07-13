import { useCallback, useEffect, useState } from 'react';
import { teacherPortalApi } from '../../api/teacherPortalApi';
import { PageHeader } from '../../components/layout/PageHeader';
import { useToast } from '../../context/ToastContext';
import type { TeacherPortalSubject } from '../../types/teacherPortal';
import { getSubjectTypeLabel } from '../../utils/subjectType';
import '../../components/GradeTable.css';
import '../PortalPages.css';

export function TeacherSubjectsPage() {
  const { showToast } = useToast();
  const [subjects, setSubjects] = useState<TeacherPortalSubject[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSubjects = useCallback(async () => {
    setLoading(true);
    try {
      const response = await teacherPortalApi.getSubjects();
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
        badge="Teacher Portal"
        title="My Subjects"
        description="Subjects you teach across grades."
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
                  <th>Grade</th>
                  <th>Subject</th>
                  <th>Type</th>
                </tr>
              </thead>
              <tbody>
                {subjects.map((subject) => (
                  <tr key={`${subject.gradeId}-${subject.subjectId}`}>
                    <td>{subject.gradeName}</td>
                    <td>{subject.subjectName}</td>
                    <td>
                      <span
                        className={`teacher-tag ${subject.isOptional ? 'teacher-tag--optional' : 'teacher-tag--compulsory'}`}
                      >
                        {getSubjectTypeLabel(subject.isOptional)}
                      </span>
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
