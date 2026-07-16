import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { examApi } from '../api/examApi';
import { PageHeader } from '../components/layout/PageHeader';
import { TableScrollWrapper } from '../components/ui/TableScrollWrapper';
import { useToast } from '../context/ToastContext';
import type { AdminPendingExamResult } from '../types/examResult';
import { formatResultDateTime } from '../utils/examResultFormat';
import '../components/GradeTable.css';
import './ExamResultsPage.css';

export function ResultApprovalsPage() {
  const { showToast } = useToast();
  const [approvals, setApprovals] = useState<AdminPendingExamResult[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchApprovals = useCallback(async () => {
    setLoading(true);
    try {
      const response = await examApi.getPendingResultApprovals();
      setApprovals(response.data);
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Failed to load pending approvals.');
      setApprovals([]);
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchApprovals();
  }, [fetchApprovals]);

  return (
    <div className="page-content exam-page">
      <PageHeader
        badge="Exam Results"
        title="Pending Approvals"
        description="Review and approve exam result submissions from teachers."
        actions={
          <button type="button" className="btn btn--ghost" onClick={fetchApprovals} disabled={loading}>
            Refresh
          </button>
        }
      />

      <section className="card grade-table-section">
        <TableScrollWrapper>
          {loading ? (
            <div className="table-loading">
              <div className="spinner" />
              <p>Loading pending approvals…</p>
            </div>
          ) : approvals.length === 0 ? (
            <div className="table-empty">
              <p>No result batches awaiting approval.</p>
            </div>
          ) : (
            <table className="grade-table">
              <thead>
                <tr>
                  <th>Batch</th>
                  <th>Exam</th>
                  <th>Grade</th>
                  <th>Subject</th>
                  <th>Teacher</th>
                  <th>Students</th>
                  <th>Submitted</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {approvals.map((approval) => (
                  <tr key={approval.batchId}>
                    <td>
                      <span className="grade-id">#{approval.batchId}</span>
                    </td>
                    <td>{approval.examTitle}</td>
                    <td>{approval.gradeName}</td>
                    <td>{approval.subjectName}</td>
                    <td>{approval.teacherName}</td>
                    <td>{approval.studentCount}</td>
                    <td>{formatResultDateTime(approval.submittedAtUtc)}</td>
                    <td>
                      <Link
                        to={`/exams/result-approvals/${approval.batchId}`}
                        className="btn btn--secondary btn--compact"
                      >
                        Review
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
