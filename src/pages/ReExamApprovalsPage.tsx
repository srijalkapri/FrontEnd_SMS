import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../components/layout/PageHeader';
import { TableScrollWrapper } from '../components/ui/TableScrollWrapper';
import { useToast } from '../context/ToastContext';
import { useAdminPendingLists } from '../hooks/useAdminPendingCounts';
import type { ReExamRequest } from '../types/reExam';
import { formatMarks, formatResultDateTime } from '../utils/examResultFormat';
import { getReExamStatusClass, getReExamStatusLabel } from '../utils/reExamStatus';
import '../components/GradeSubjectTable.css';
import '../components/GradeTable.css';
import './ExamResultsPage.css';
import './ExamSchedulesPage.css';

type ApprovalTab = 'requests' | 'marks';

function filterByName(items: ReExamRequest[], query: string): ReExamRequest[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return items;
  return items.filter((item) => item.studentName.toLowerCase().includes(normalized));
}

export function ReExamApprovalsPage() {
  const { showToast } = useToast();
  const { loadPendingReExams } = useAdminPendingLists();
  const [tab, setTab] = useState<ApprovalTab>('requests');
  const [requests, setRequests] = useState<ReExamRequest[]>([]);
  const [marks, setMarks] = useState<ReExamRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [nameQuery, setNameQuery] = useState('');

  const fetchAll = useCallback(
    async (force = false) => {
      setLoading(true);
      try {
        const data = await loadPendingReExams(force);
        setRequests(data.requests);
        setMarks(data.marks);
      } catch (err) {
        showToast('error', err instanceof Error ? err.message : 'Failed to load re-exam approvals.');
        setRequests([]);
        setMarks([]);
      } finally {
        setLoading(false);
      }
    },
    [loadPendingReExams, showToast],
  );

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const activeItems = tab === 'requests' ? requests : marks;
  const filteredItems = useMemo(() => filterByName(activeItems, nameQuery), [activeItems, nameQuery]);

  return (
    <div className="page-content exam-page">
      <PageHeader
        badge="Re-Exams"
        title="Re-Exam Approvals"
        description="Review student re-exam requests and submitted re-exam marks."
        actions={
          <button type="button" className="btn btn--ghost" onClick={() => fetchAll(true)} disabled={loading}>
            Refresh
          </button>
        }
      />

      <section className="card exam-results-lookup__filters-card">
        <div
          className="exam-results-lookup__mode"
          role="tablist"
          aria-label="Re-exam approval type"
        >
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'requests'}
            className={`exam-results-lookup__mode-btn${
              tab === 'requests' ? ' exam-results-lookup__mode-btn--active' : ''
            }`}
            onClick={() => setTab('requests')}
          >
            Pending requests ({requests.length})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'marks'}
            className={`exam-results-lookup__mode-btn${
              tab === 'marks' ? ' exam-results-lookup__mode-btn--active' : ''
            }`}
            onClick={() => setTab('marks')}
          >
            Pending marks ({marks.length})
          </button>
        </div>

        <div className="form-group" style={{ maxWidth: '24rem' }}>
          <label className="form-label" htmlFor="reexam-name-search">
            Search by student name
          </label>
          <div className="search-input exam-results-lookup__name-search">
            <svg className="search-input__icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path
                fillRule="evenodd"
                d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                clipRule="evenodd"
              />
            </svg>
            <input
              id="reexam-name-search"
              type="search"
              className="search-input__field"
              placeholder="Filter by name…"
              value={nameQuery}
              onChange={(event) => setNameQuery(event.target.value)}
            />
          </div>
        </div>
      </section>

      <section className="card grade-table-section">
        <TableScrollWrapper>
          {loading ? (
            <div className="table-loading">
              <div className="spinner" />
              <p>Loading re-exam approvals…</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="table-empty">
              <p>
                {nameQuery
                  ? 'No matching students in this list.'
                  : tab === 'requests'
                    ? 'No re-exam requests awaiting approval.'
                    : 'No re-exam marks awaiting approval.'}
              </p>
            </div>
          ) : (
            <table className="grade-table">
              <thead>
                <tr>
                  <th className="grade-subject-table__index-col">#</th>
                  <th>Student</th>
                  <th>Exam</th>
                  <th>Grade</th>
                  <th>Subject</th>
                  {tab === 'marks' ? <th>Marks</th> : <th>Original</th>}
                  <th>Submitted</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item, index) => (
                  <tr key={item.id}>
                    <td>
                      <span className="row-index">{index + 1}</span>
                    </td>
                    <td>{item.studentName}</td>
                    <td>{item.examTitle}</td>
                    <td>{item.gradeName}</td>
                    <td>{item.subjectName}</td>
                    <td>
                      {tab === 'marks'
                        ? formatMarks(item.marksObtained, item.totalMarks ?? 0, item.isAbsent)
                        : formatMarks(
                            item.originalMarksObtained,
                            item.originalTotalMarks,
                            item.originalIsAbsent,
                          )}
                    </td>
                    <td>
                      {formatResultDateTime(
                        tab === 'marks' ? item.marksSubmittedAtUtc : item.createdAtUtc,
                      )}
                    </td>
                    <td>
                      <span className={`exam-result-status ${getReExamStatusClass(item.status)}`}>
                        {getReExamStatusLabel(item.status)}
                      </span>
                    </td>
                    <td>
                      <Link
                        to={`/exams/re-exams/${item.id}`}
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
