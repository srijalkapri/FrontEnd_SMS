import { FormEvent, useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { examApi } from '../api/examApi';
import { PageHeader } from '../components/layout/PageHeader';
import { FormModal } from '../components/ui/FormModal';
import { useToast } from '../context/ToastContext';
import { notifyAdminPendingChanged } from '../hooks/useAdminPendingCounts';
import type { ReExamRequest } from '../types/reExam';
import { formatMarks, formatResultDateTime } from '../utils/examResultFormat';
import {
  canReviewReExamMarks,
  canReviewReExamRequest,
  getReExamStatusClass,
  getReExamStatusLabel,
} from '../utils/reExamStatus';
import '../components/GradeTable.css';
import './ExamResultsPage.css';

export function ReExamDetailPage() {
  const { id: idParam } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const id = idParam ? parseInt(idParam, 10) : NaN;

  const [item, setItem] = useState<ReExamRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [comment, setComment] = useState('');
  const [formError, setFormError] = useState('');

  const fetchItem = useCallback(async () => {
    if (isNaN(id) || id <= 0) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await examApi.getReExamById(id);
      setItem(response.data);
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

  const closeModals = () => {
    if (actionLoading) return;
    setShowApproveModal(false);
    setShowRejectModal(false);
    setComment('');
    setFormError('');
  };

  const reviewRequest = canReviewReExamRequest(item?.status ?? '');
  const reviewMarks = canReviewReExamMarks(item?.status ?? '');

  const handleApprove = async (event: FormEvent) => {
    event.preventDefault();
    if (!item) return;

    setActionLoading(true);
    try {
      const payload = { comment: comment.trim() || null };
      const response = reviewMarks
        ? await examApi.approveReExamMarks(item.id, payload)
        : await examApi.approveReExam(item.id, payload);
      showToast('success', response.message || response.data);
      notifyAdminPendingChanged();
      navigate('/exams/re-exams');
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Failed to approve.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (event: FormEvent) => {
    event.preventDefault();
    if (!item) return;

    if (reviewMarks && !comment.trim()) {
      setFormError('A comment is required when rejecting marks.');
      return;
    }

    setActionLoading(true);
    try {
      const payload = { comment: comment.trim() || null };
      const response = reviewMarks
        ? await examApi.rejectReExamMarks(item.id, payload)
        : await examApi.rejectReExam(item.id, payload);
      showToast('success', response.message || response.data);
      notifyAdminPendingChanged();
      navigate('/exams/re-exams');
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Failed to reject.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-content exam-page">
        <div className="table-loading">
          <div className="spinner" />
          <p>Loading re-exam request…</p>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="page-content exam-page">
        <PageHeader
          badge="Re-Exams"
          title="Request not found"
          description="This re-exam request could not be loaded."
          actions={
            <Link to="/exams/re-exams" className="btn btn--ghost">
              Back to approvals
            </Link>
          }
        />
      </div>
    );
  }

  const canReview = reviewRequest || reviewMarks;

  return (
    <div className="page-content exam-page">
      <PageHeader
        badge="Re-Exams"
        title={`${item.studentName} — ${item.subjectName}`}
        description={`${item.examTitle} · ${item.gradeName}`}
        actions={
          <Link to="/exams/re-exams" className="btn btn--ghost">
            Back to approvals
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
            <span className="exam-result-meta__label">Student</span>
            <span className="exam-result-meta__value">{item.studentName}</span>
          </div>
          <div className="exam-result-meta__item">
            <span className="exam-result-meta__label">Attempt</span>
            <span className="exam-result-meta__value">{item.attemptNumber}</span>
          </div>
          <div className="exam-result-meta__item">
            <span className="exam-result-meta__label">Requested</span>
            <span className="exam-result-meta__value">{formatResultDateTime(item.createdAtUtc)}</span>
          </div>
        </div>

        {item.studentReason && (
          <div className="exam-result-review-comment" style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg)' }}>
            <strong>Student reason:</strong> {item.studentReason}
          </div>
        )}

        <div className="exam-result-summary">
          <div className="exam-result-summary__item">
            <span className="exam-result-summary__label">Original marks</span>
            <span className="exam-result-summary__value">
              {formatMarks(item.originalMarksObtained, item.originalTotalMarks, item.originalIsAbsent)}
            </span>
          </div>
          {item.marksSubmittedAtUtc && (
            <div className="exam-result-summary__item">
              <span className="exam-result-summary__label">Re-exam marks</span>
              <span className="exam-result-summary__value">
                {formatMarks(item.marksObtained, item.totalMarks ?? 0, item.isAbsent)}
              </span>
            </div>
          )}
          {item.teacherName && (
            <div className="exam-result-summary__item">
              <span className="exam-result-summary__label">Teacher</span>
              <span className="exam-result-summary__value">{item.teacherName}</span>
            </div>
          )}
        </div>

        {item.marksRemarks && (
          <p style={{ marginTop: '1rem', color: 'var(--color-text-muted)', fontSize: '0.9375rem' }}>
            <strong>Teacher remarks:</strong> {item.marksRemarks}
          </p>
        )}

        {item.adminComment && (
          <p style={{ marginTop: '0.75rem', color: 'var(--color-text-muted)', fontSize: '0.9375rem' }}>
            <strong>Admin comment:</strong> {item.adminComment}
          </p>
        )}

        {item.marksReviewComment && (
          <p style={{ marginTop: '0.75rem', color: 'var(--color-text-muted)', fontSize: '0.9375rem' }}>
            <strong>Marks review comment:</strong> {item.marksReviewComment}
          </p>
        )}

        {canReview && (
          <div className="exam-result-actions" style={{ marginTop: '1.25rem' }}>
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => {
                setComment('');
                setFormError('');
                setShowApproveModal(true);
              }}
            >
              Approve
            </button>
            <button
              type="button"
              className="btn btn--danger"
              onClick={() => {
                setComment('');
                setFormError('');
                setShowRejectModal(true);
              }}
            >
              Reject
            </button>
          </div>
        )}
      </section>

      <FormModal
        open={showApproveModal}
        title={reviewMarks ? 'Approve re-exam marks' : 'Approve re-exam request'}
        subtitle={`${item.studentName} · ${item.subjectName}`}
        onClose={closeModals}
      >
        <form className="embedded-form" onSubmit={handleApprove}>
          <div className="form-group">
            <label className="form-label" htmlFor="approve-reexam-comment">
              Comment (optional)
            </label>
            <textarea
              id="approve-reexam-comment"
              className="form-input"
              rows={3}
              value={comment}
              onChange={(event) => setComment(event.target.value)}
            />
          </div>
          <div className="embedded-form__actions">
            <button type="button" className="btn btn--ghost" onClick={closeModals} disabled={actionLoading}>
              Cancel
            </button>
            <button type="submit" className="btn btn--primary" disabled={actionLoading}>
              {actionLoading ? 'Approving…' : 'Approve'}
            </button>
          </div>
        </form>
      </FormModal>

      <FormModal
        open={showRejectModal}
        title={reviewMarks ? 'Reject re-exam marks' : 'Reject re-exam request'}
        subtitle={`${item.studentName} · ${item.subjectName}`}
        onClose={closeModals}
      >
        <form className="embedded-form" onSubmit={handleReject}>
          <div className="form-group">
            <label className="form-label" htmlFor="reject-reexam-comment">
              Comment {reviewMarks ? '(required)' : '(optional)'}
            </label>
            <textarea
              id="reject-reexam-comment"
              className="form-input"
              rows={3}
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              required={reviewMarks}
            />
            {formError && <p className="form-error">{formError}</p>}
          </div>
          <div className="embedded-form__actions">
            <button type="button" className="btn btn--ghost" onClick={closeModals} disabled={actionLoading}>
              Cancel
            </button>
            <button type="submit" className="btn btn--danger" disabled={actionLoading}>
              {actionLoading ? 'Rejecting…' : 'Reject'}
            </button>
          </div>
        </form>
      </FormModal>
    </div>
  );
}
