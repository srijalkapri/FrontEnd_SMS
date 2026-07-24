import { useCallback, useEffect, useState } from 'react';
import { studentPortalApi } from '../../api/studentPortalApi';
import { PageHeader } from '../../components/layout/PageHeader';
import { TableScrollWrapper } from '../../components/ui/TableScrollWrapper';
import { useToast } from '../../context/ToastContext';
import type { ReExamRequest } from '../../types/reExam';
import { formatMarks, formatResultDateTime } from '../../utils/examResultFormat';
import { getReExamStatusClass, getReExamStatusLabel } from '../../utils/reExamStatus';
import '../../components/GradeSubjectTable.css';
import '../../components/GradeTable.css';
import '../ExamResultsPage.css';
import '../PortalPages.css';

export function StudentReExamsPage() {
  const { showToast } = useToast();
  const [items, setItems] = useState<ReExamRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const response = await studentPortalApi.getReExams();
      setItems(response.data);
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Failed to load re-exam requests.');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  return (
    <div className="page-content portal-page">
      <PageHeader
        badge="Student Portal"
        title="My Re-Exams"
        description="Track your re-exam applications and updated marks."
        actions={
          <button type="button" className="btn btn--ghost" onClick={fetchItems} disabled={loading}>
            Refresh
          </button>
        }
      />

      <section className="card grade-table-section">
        <TableScrollWrapper>
          {loading ? (
            <div className="table-loading">
              <div className="spinner" />
              <p>Loading re-exam requests…</p>
            </div>
          ) : items.length === 0 ? (
            <div className="table-empty">
              <p>No re-exam requests yet. Apply from My Results if you are eligible.</p>
            </div>
          ) : (
            <table className="grade-table">
              <thead>
                <tr>
                  <th className="grade-subject-table__index-col">#</th>
                  <th>Exam</th>
                  <th>Subject</th>
                  <th>Original</th>
                  <th>Re-exam marks</th>
                  <th>Status</th>
                  <th>Applied</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={item.id}>
                    <td>
                      <span className="row-index">{index + 1}</span>
                    </td>
                    <td>{item.examTitle}</td>
                    <td>{item.subjectName}</td>
                    <td>
                      {formatMarks(
                        item.originalMarksObtained,
                        item.originalTotalMarks,
                        item.originalIsAbsent,
                      )}
                    </td>
                    <td>
                      {item.marksSubmittedAtUtc
                        ? formatMarks(item.marksObtained, item.totalMarks ?? 0, item.isAbsent)
                        : '—'}
                    </td>
                    <td>
                      <span className={`exam-result-status ${getReExamStatusClass(item.status)}`}>
                        {getReExamStatusLabel(item.status)}
                      </span>
                    </td>
                    <td>{formatResultDateTime(item.createdAtUtc)}</td>
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
