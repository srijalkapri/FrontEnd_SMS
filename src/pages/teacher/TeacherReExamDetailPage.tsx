import { FormEvent, useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { teacherPortalApi } from '../../api/teacherPortalApi';
import { PageHeader } from '../../components/layout/PageHeader';
import { useToast } from '../../context/ToastContext';
import type { ReExamRequest } from '../../types/reExam';
import { formatMarks, formatResultDateTime } from '../../utils/examResultFormat';
import {
  canTeacherSubmitReExamMarks,
  getReExamStatusClass,
  getReExamStatusLabel,
} from '../../utils/reExamStatus';
import '../../components/GradeTable.css';
import '../ExamResultsPage.css';
import '../ExamSchedulesPage.css';
import '../PortalPages.css';

export function TeacherReExamDetailPage() {
  const { id: idParam } = useParams();
  const { showToast } = useToast();

  const id = idParam ? parseInt(idParam, 10) : NaN;

  const [item, setItem] = useState<ReExamRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);

  const [marksObtained, setMarksObtained] = useState('');
  const [totalMarks, setTotalMarks] = useState('100');
  const [isAbsent, setIsAbsent] = useState(false);
  const [remarks, setRemarks] = useState('');

  const fetchItem = useCallback(async () => {
    if (isNaN(id) || id <= 0) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await teacherPortalApi.getReExamById(id);
      setItem(response.data);
      setMarksObtained(
        response.data.marksObtained != null ? String(response.data.marksObtained) : '',
      );
      setTotalMarks(String(response.data.totalMarks ?? response.data.originalTotalMarks ?? 100));
      setIsAbsent(response.data.isAbsent);
      setRemarks(response.data.marksRemarks ?? '');
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Failed to load re-exam request.');
      setItem(null);
    } finally {
      setLoading(false);
    }
  }, [id, showToast]);

  useEffect(() => {
    fetchItem();
  }, [fetchItem]);

  const editable = item ? canTeacherSubmitReExamMarks(item.status) : false;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!item || !editable) return;

    const total = Number(totalMarks);
    if (!Number.isFinite(total) || total <= 0) {
      showToast('error', 'Total marks must be greater than 0.');
      return;
    }

    if (!isAbsent && marksObtained.trim() === '') {
      showToast('error', 'Marks obtained is required when student is not absent.');
      return;
    }

    const obtained = isAbsent ? null : Number(marksObtained);
    if (!isAbsent && (!Number.isFinite(obtained!) || obtained! < 0 || obtained! > total)) {
      showToast('error', 'Marks obtained must be between 0 and total marks.');
      return;
    }

    setSubmitLoading(true);
    try {
      const response = await teacherPortalApi.submitReExamMarks(item.id, {
        marksObtained: obtained,
        totalMarks: total,
        isAbsent,
        remarks: remarks.trim() || null,
      });
      showToast('success', response.message || response.data);
      await fetchItem();
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Failed to submit re-exam marks.');
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-content portal-page">
        <div className="table-loading">
          <div className="spinner" />
          <p>Loading re-exam request…</p>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="page-content portal-page">
        <PageHeader
          badge="Teacher Portal"
          title="Re-exam not found"
          description="This re-exam request could not be loaded."
          actions={
            <Link to="/teacher/re-exams" className="btn btn--ghost">
              Back to re-exams
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="page-content portal-page">
      <PageHeader
        badge="Teacher Portal"
        title={item.studentName}
        description={`${item.examTitle} · ${item.subjectName}`}
        actions={
          <Link to="/teacher/re-exams" className="btn btn--ghost">
            Back to re-exams
          </Link>
        }
      />

      <section className="card">
        <div className="exam-result-meta">
          <div className="exam-result-meta__item">
            <span className="exam-result-meta__label">Status</span>
            <span className={`exam-result-status ${getReExamStatusClass(item.status)}`}>
              {getReExamStatusLabel(item.status)}
            </span>
          </div>
          <div className="exam-result-meta__item">
            <span className="exam-result-meta__label">Original marks</span>
            <span className="exam-result-meta__value">
              {formatMarks(item.originalMarksObtained, item.originalTotalMarks, item.originalIsAbsent)}
            </span>
          </div>
          <div className="exam-result-meta__item">
            <span className="exam-result-meta__label">Requested</span>
            <span className="exam-result-meta__value">{formatResultDateTime(item.createdAtUtc)}</span>
          </div>
          {item.marksSubmittedAtUtc && (
            <div className="exam-result-meta__item">
              <span className="exam-result-meta__label">Submitted</span>
              <span className="exam-result-meta__value">
                {formatResultDateTime(item.marksSubmittedAtUtc)}
              </span>
            </div>
          )}
        </div>

        {item.studentReason && (
          <p style={{ marginBottom: '1rem', color: 'var(--color-text-muted)', fontSize: '0.9375rem' }}>
            <strong>Student reason:</strong> {item.studentReason}
          </p>
        )}

        {item.marksReviewComment && (
          <div className="exam-result-review-comment">
            <strong>Previous review comment:</strong> {item.marksReviewComment}
          </div>
        )}

        {editable ? (
          <form className="embedded-form" onSubmit={handleSubmit}>
            <div className="exam-result-meta" style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="reexam-total-marks">
                  Total marks
                </label>
                <input
                  id="reexam-total-marks"
                  type="number"
                  min={1}
                  className="form-input"
                  value={totalMarks}
                  onChange={(event) => setTotalMarks(event.target.value)}
                  disabled={submitLoading}
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="reexam-marks-obtained">
                  Marks obtained
                </label>
                <input
                  id="reexam-marks-obtained"
                  type="number"
                  min={0}
                  className="form-input"
                  value={marksObtained}
                  onChange={(event) => setMarksObtained(event.target.value)}
                  disabled={submitLoading || isAbsent}
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="reexam-absent">
                  Absent
                </label>
                <label className="exam-form__checkbox" htmlFor="reexam-absent" style={{ marginTop: '0.5rem' }}>
                  <input
                    id="reexam-absent"
                    type="checkbox"
                    checked={isAbsent}
                    onChange={(event) => setIsAbsent(event.target.checked)}
                    disabled={submitLoading}
                  />
                  Mark as absent
                </label>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reexam-remarks">
                Remarks (optional)
              </label>
              <textarea
                id="reexam-remarks"
                className="form-input"
                rows={3}
                value={remarks}
                onChange={(event) => setRemarks(event.target.value)}
                disabled={submitLoading}
              />
            </div>

            <div className="embedded-form__actions">
              <button type="submit" className="btn btn--primary" disabled={submitLoading}>
                {submitLoading ? 'Submitting…' : 'Submit marks for approval'}
              </button>
            </div>
          </form>
        ) : item.marksSubmittedAtUtc ? (
          <div className="exam-result-summary">
            <div className="exam-result-summary__item">
              <span className="exam-result-summary__label">Submitted marks</span>
              <span className="exam-result-summary__value">
                {formatMarks(item.marksObtained, item.totalMarks ?? 0, item.isAbsent)}
              </span>
            </div>
            {item.marksRemarks && (
              <div className="exam-result-summary__item">
                <span className="exam-result-summary__label">Remarks</span>
                <span className="exam-result-summary__value">{item.marksRemarks}</span>
              </div>
            )}
          </div>
        ) : null}
      </section>
    </div>
  );
}
