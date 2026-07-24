import { FormEvent, useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { studentPortalApi } from '../../api/studentPortalApi';
import { PageHeader } from '../../components/layout/PageHeader';
import { FormModal } from '../../components/ui/FormModal';
import { TableScrollWrapper } from '../../components/ui/TableScrollWrapper';
import { useToast } from '../../context/ToastContext';
import type { StudentExamResultSchedule, StudentExamResultSubject } from '../../types/examResult';
import { formatMarks } from '../../utils/examResultFormat';
import { getReExamStatusClass, getReExamStatusLabel } from '../../utils/reExamStatus';
import '../../components/GradeTable.css';
import '../ExamResultsPage.css';
import '../PortalPages.css';

export function StudentResultsPage() {
  const { showToast } = useToast();
  const [results, setResults] = useState<StudentExamResultSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [applyLoading, setApplyLoading] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<StudentExamResultSubject | null>(null);
  const [reason, setReason] = useState('');

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

  const openApplyModal = (subject: StudentExamResultSubject) => {
    setSelectedSubject(subject);
    setReason('');
    setShowApplyModal(true);
  };

  const closeApplyModal = () => {
    if (applyLoading) return;
    setShowApplyModal(false);
    setSelectedSubject(null);
    setReason('');
  };

  const handleApply = async (event: FormEvent) => {
    event.preventDefault();
    if (!selectedSubject) return;

    setApplyLoading(true);
    try {
      const response = await studentPortalApi.applyForReExam({
        examSessionId: selectedSubject.examSessionId,
        reason: reason.trim() || null,
      });
      showToast('success', response.message || response.data);
      closeApplyModal();
      await fetchResults();
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Failed to apply for re-exam.');
    } finally {
      setApplyLoading(false);
    }
  };

  return (
    <div className="page-content portal-page">
      <PageHeader
        badge="Student Portal"
        title="My Exam Results"
        description="View your approved exam results and apply for re-exams when eligible."
        actions={
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Link to="/student/re-exams" className="btn btn--ghost">
              My re-exams
            </Link>
            <button type="button" className="btn btn--ghost" onClick={fetchResults} disabled={loading}>
              Refresh
            </button>
          </div>
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
                    <th>Re-exam</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {schedule.subjects.map((subject) => (
                    <tr key={`${subject.examSessionId}-${subject.subjectName}`}>
                      <td>
                        {subject.subjectName}
                        {subject.isReExamResult && (
                          <span
                            className="exam-result-status exam-result-status--approved"
                            style={{ marginLeft: '0.5rem' }}
                          >
                            Re-exam
                          </span>
                        )}
                      </td>
                      <td>
                        {formatMarks(subject.marksObtained, subject.totalMarks, subject.isAbsent)}
                        {subject.isReExamResult &&
                          subject.originalMarksObtained != null &&
                          subject.originalTotalMarks != null && (
                            <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginTop: '0.125rem' }}>
                              Was{' '}
                              {formatMarks(
                                subject.originalMarksObtained,
                                subject.originalTotalMarks,
                                subject.originalIsAbsent ?? false,
                              )}
                            </div>
                          )}
                      </td>
                      <td>{subject.isAbsent ? 'Yes' : 'No'}</td>
                      <td>
                        {subject.reExamStatus ? (
                          <span className={`exam-result-status ${getReExamStatusClass(subject.reExamStatus)}`}>
                            {getReExamStatusLabel(subject.reExamStatus)}
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td>
                        {subject.canApplyReExam ? (
                          <button
                            type="button"
                            className="btn btn--secondary btn--compact"
                            onClick={() => openApplyModal(subject)}
                          >
                            Apply
                          </button>
                        ) : (
                          '—'
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TableScrollWrapper>
          </section>
        ))
      )}

      <FormModal
        open={showApplyModal}
        title="Apply for re-exam"
        subtitle={selectedSubject ? selectedSubject.subjectName : undefined}
        onClose={closeApplyModal}
      >
        <form className="embedded-form" onSubmit={handleApply}>
          <div className="form-group">
            <label className="form-label" htmlFor="reexam-reason">
              Reason (optional)
            </label>
            <textarea
              id="reexam-reason"
              className="form-input"
              rows={4}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Explain why you need a re-exam"
              disabled={applyLoading}
            />
          </div>
          <div className="embedded-form__actions">
            <button type="button" className="btn btn--ghost" onClick={closeApplyModal} disabled={applyLoading}>
              Cancel
            </button>
            <button type="submit" className="btn btn--primary" disabled={applyLoading}>
              {applyLoading ? 'Submitting…' : 'Submit application'}
            </button>
          </div>
        </form>
      </FormModal>
    </div>
  );
}
