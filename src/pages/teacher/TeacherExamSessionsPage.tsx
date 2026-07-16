import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { teacherPortalApi } from '../../api/teacherPortalApi';
import { PageHeader } from '../../components/layout/PageHeader';
import { TableScrollWrapper } from '../../components/ui/TableScrollWrapper';
import { useToast } from '../../context/ToastContext';
import type { TeacherExamSession } from '../../types/examResult';
import { formatExamDate, formatExamTime } from '../../utils/examFormat';
import {
  getExamResultStatusClass,
  getExamResultStatusLabel,
} from '../../utils/examResultStatus';
import '../../components/GradeTable.css';
import '../ExamResultsPage.css';
import '../PortalPages.css';

export function TeacherExamSessionsPage() {
  const { showToast } = useToast();
  const [sessions, setSessions] = useState<TeacherExamSession[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    try {
      const response = await teacherPortalApi.getExamSessions();
      setSessions(response.data);
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Failed to load exam sessions.');
      setSessions([]);
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  return (
    <div className="page-content portal-page">
      <PageHeader
        badge="Teacher Portal"
        title="Exam Results"
        description="Enter and submit marks for your assigned exam sessions."
        actions={
          <button type="button" className="btn btn--ghost" onClick={fetchSessions} disabled={loading}>
            Refresh
          </button>
        }
      />

      <section className="card grade-table-section">
        <TableScrollWrapper>
          {loading ? (
            <div className="table-loading">
              <div className="spinner" />
              <p>Loading exam sessions…</p>
            </div>
          ) : sessions.length === 0 ? (
            <div className="table-empty">
              <p>No published exam sessions assigned to you.</p>
            </div>
          ) : (
            <table className="grade-table">
              <thead>
                <tr>
                  <th>Exam</th>
                  <th>Grade</th>
                  <th>Subject</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((session) => (
                  <tr key={session.examSessionId}>
                    <td>{session.examTitle}</td>
                    <td>{session.gradeName}</td>
                    <td>{session.subjectName}</td>
                    <td>{formatExamDate(session.examDate)}</td>
                    <td>
                      {formatExamTime(session.startTime)}
                      {session.endTime ? ` – ${formatExamTime(session.endTime)}` : ''}
                    </td>
                    <td>
                      <span
                        className={`exam-result-status ${getExamResultStatusClass(session.resultStatus)}`}
                      >
                        {getExamResultStatusLabel(session.resultStatus)}
                      </span>
                    </td>
                    <td>
                      <Link
                        to={`/teacher/exams/${session.examSessionId}`}
                        className="btn btn--secondary btn--compact"
                      >
                        {session.resultStatus ? 'View / Edit' : 'Enter marks'}
                      </Link>
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
