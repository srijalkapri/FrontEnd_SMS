import { useCallback, useEffect, useState } from 'react';
import { studentPortalApi } from '../../api/studentPortalApi';
import { PageHeader } from '../../components/layout/PageHeader';
import { TableScrollWrapper } from '../../components/ui/TableScrollWrapper';
import { useToast } from '../../context/ToastContext';
import type { StudentExamResultSchedule } from '../../types/examResult';
import { formatMarks } from '../../utils/examResultFormat';
import '../../components/GradeTable.css';
import '../ExamResultsPage.css';
import '../PortalPages.css';

export function StudentResultsPage() {
  const { showToast } = useToast();
  const [results, setResults] = useState<StudentExamResultSchedule[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchResults = useCallback(async () => {
    setLoading(true);
    try {
      const response = await studentPortalApi.getResults();
      setResults(response.data);
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Failed to load exam results.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  return (
    <div className="page-content portal-page">
      <PageHeader
        badge="Student Portal"
        title="My Exam Results"
        description="View your approved exam results by schedule."
        actions={
          <button type="button" className="btn btn--ghost" onClick={fetchResults} disabled={loading}>
            Refresh
          </button>
        }
      />

      {loading ? (
        <section className="card grade-table-section">
          <div className="table-loading">
            <div className="spinner" />
            <p>Loading results…</p>
          </div>
        </section>
      ) : results.length === 0 ? (
        <section className="card grade-table-section">
          <div className="table-empty">
            <p>No approved exam results available yet.</p>
          </div>
        </section>
      ) : (
        results.map((schedule) => (
          <section key={schedule.examScheduleId} className="card grade-table-section">
            <div className="exam-result-meta" style={{ marginBottom: '1rem' }}>
              <div className="exam-result-meta__item">
                <span className="exam-result-meta__label">Exam</span>
                <span className="exam-result-meta__value">{schedule.examTitle}</span>
              </div>
              <div className="exam-result-meta__item">
                <span className="exam-result-meta__label">Academic year</span>
                <span className="exam-result-meta__value">{schedule.academicYear || '—'}</span>
              </div>
              <div className="exam-result-meta__item">
                <span className="exam-result-meta__label">Total score</span>
                <span className="exam-result-meta__value">
                  {schedule.totalObtained} / {schedule.totalMarks}
                </span>
              </div>
              <div className="exam-result-meta__item">
                <span className="exam-result-meta__label">Percentage</span>
                <span className="exam-result-meta__value">{schedule.percentage.toFixed(2)}%</span>
              </div>
            </div>

            <TableScrollWrapper>
              <table className="grade-table">
                <thead>
                  <tr>
                    <th>Subject</th>
                    <th>Marks</th>
                    <th>Absent</th>
                    <th>Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {schedule.subjects.map((subject) => (
                    <tr key={subject.subjectName}>
                      <td>{subject.subjectName}</td>
                      <td>
                        {formatMarks(subject.marksObtained, subject.totalMarks, subject.isAbsent)}
                      </td>
                      <td>{subject.isAbsent ? 'Yes' : 'No'}</td>
                      <td>{subject.remarks || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TableScrollWrapper>
          </section>
        ))
      )}
    </div>
  );
}
