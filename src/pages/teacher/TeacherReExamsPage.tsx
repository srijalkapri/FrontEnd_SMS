import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { teacherPortalApi } from '../../api/teacherPortalApi';
import { PageHeader } from '../../components/layout/PageHeader';
import { TableScrollWrapper } from '../../components/ui/TableScrollWrapper';
import { useToast } from '../../context/ToastContext';
import type { ReExamRequest } from '../../types/reExam';
import { formatMarks } from '../../utils/examResultFormat';
import { canTeacherSubmitReExamMarks, getReExamStatusClass, getReExamStatusLabel } from '../../utils/reExamStatus';
import '../../components/GradeSubjectTable.css';
import '../../components/GradeTable.css';
import '../ExamResultsPage.css';
import '../PortalPages.css';

export function TeacherReExamsPage() {
  const { showToast } = useToast();
  const [items, setItems] = useState<ReExamRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [nameQuery, setNameQuery] = useState('');

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const response = await teacherPortalApi.getReExams();
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

  const filteredItems = useMemo(() => {
    const normalized = nameQuery.trim().toLowerCase();
    if (!normalized) return items;
    return items.filter((item) => item.studentName.toLowerCase().includes(normalized));
  }, [items, nameQuery]);

  return (
    <div className="page-content portal-page">
      <PageHeader
        badge="Teacher Portal"
        title="Re-Exams"
        description="Enter marks for approved student re-exam requests."
        actions={
          <button type="button" className="btn btn--ghost" onClick={fetchItems} disabled={loading}>
            Refresh
          </button>
        }
      />

      <section className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="form-group" style={{ maxWidth: '24rem', margin: 0 }}>
          <label className="form-label" htmlFor="teacher-reexam-search">
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
              id="teacher-reexam-search"
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
              <p>Loading re-exam requests…</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="table-empty">
              <p>{nameQuery ? 'No matching students.' : 'No re-exam requests assigned to you.'}</p>
            </div>
          ) : (
            <table className="grade-table">
              <thead>
                <tr>
                  <th className="grade-subject-table__index-col">#</th>
                  <th>Student</th>
                  <th>Exam</th>
                  <th>Subject</th>
                  <th>Original</th>
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
                    <td>{item.subjectName}</td>
                    <td>
                      {formatMarks(
                        item.originalMarksObtained,
                        item.originalTotalMarks,
                        item.originalIsAbsent,
                      )}
                    </td>
                    <td>
                      <span className={`exam-result-status ${getReExamStatusClass(item.status)}`}>
                        {getReExamStatusLabel(item.status)}
                      </span>
                    </td>
                    <td>
                      <Link
                        to={`/teacher/re-exams/${item.id}`}
                        className="btn btn--secondary btn--compact"
                      >
                        {canTeacherSubmitReExamMarks(item.status) ? 'Enter marks' : 'View'}
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
