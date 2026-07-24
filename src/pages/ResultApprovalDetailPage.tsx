import { FormEvent, useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { examApi } from '../api/examApi';
import { PageHeader } from '../components/layout/PageHeader';
import { FormModal } from '../components/ui/FormModal';
import { TableScrollWrapper } from '../components/ui/TableScrollWrapper';
import { useToast } from '../context/ToastContext';
import type { AdminExamResultReview } from '../types/examResult';
import { formatMarks, formatResultDateTime } from '../utils/examResultFormat';
import {
  getExamResultStatusClass,
  getExamResultStatusLabel,
} from '../utils/examResultStatus';
import { notifyAdminPendingChanged } from '../hooks/useAdminPendingCounts';
import '../components/GradeTable.css';
import './ExamResultsPage.css';

export function ResultApprovalDetailPage() {
  const { batchId: batchIdParam } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const batchId = batchIdParam ? parseInt(batchIdParam, 10) : NaN;

  const [review, setReview] = useState<AdminExamResultReview | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [comment, setComment] = useState('');
  const [formError, setFormError] = useState('');

  const fetchReview = useCallback(async () => {
    if (isNaN(batchId) || batchId <= 0) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await examApi.getResultApprovalBatch(batchId);
      setReview(response.data);
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Failed to load result batch.');
      setReview(null);
    } finally {
      setLoading(false);
    }
  }, [batchId, showToast]);

  useEffect(() => {
    fetchReview();
  }, [fetchReview]);

  const closeModals = () => {
    if (actionLoading) return;
    setShowApproveModal(false);
    setShowRejectModal(false);
    setComment('');
    setFormError('');
  };

  const handleApprove = async (event: FormEvent) => {
    event.preventDefault();
    if (!review) return;

    setActionLoading(true);
    try {
      const response = await examApi.approveResultBatch(review.batchId, {
        comment: comment.trim() || null,
      });
      showToast('success', response.message || response.data);
      notifyAdminPendingChanged();
      navigate('/exams/result-approvals');
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Failed to approve results.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (event: FormEvent) => {
    event.preventDefault();
    if (!review) return;

    if (!comment.trim()) {
      setFormError('A comment is required when rejecting results.');
      return;
    }

    setActionLoading(true);
    try {
      const response = await examApi.rejectResultBatch(review.batchId, {
        comment: comment.trim(),
      });
      showToast('success', response.message || response.data);
      notifyAdminPendingChanged();
      navigate('/exams/result-approvals');
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Failed to reject results.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-content exam-page">
        <div className="table-loading">
          <div className="spinner" />
          <p>Loading result batch…</p>
        </div>
      </div>
    );
  }

  if (!review) {
    return (
      <div className="page-content exam-page">
        <PageHeader
          badge="Exam Results"
          title="Batch not found"
          description="This result batch could not be loaded."
          actions={
            <Link to="/exams/result-approvals" className="btn btn--ghost">
              Back to approvals
            </Link>
          }
        />
      </div>
    );
  }

  const canReview = review.status === 'PendingApproval';

  return (
    <div className="page-content exam-page">
      <PageHeader
        badge="Exam Results"
        title={`Review batch #${review.batchId}`}
        description={`${review.examTitle} · ${review.gradeName} · ${review.subjectName}`}
        actions={
          <Link to="/exams/result-approvals" className="btn btn--ghost">
            Back to approvals
          </Link>
        }
      />

      <section className="card">
        <div className="exam-result-meta">
          <div className="exam-result-meta__item">
            <span className="exam-result-meta__label">Status</span>
            <span className={`exam-result-status ${getExamResultStatusClass(review.status)}`}>
              {getExamResultStatusLabel(review.status)}
            </span>
          </div>
          <div className="exam-result-meta__item">
            <span className="exam-result-meta__label">Teacher</span>
            <span className="exam-result-meta__value">{review.teacherName}</span>
          </div>
          <div className="exam-result-meta__item">
            <span className="exam-result-meta__label">Submitted</span>
            <span className="exam-result-meta__value">
              {formatResultDateTime(review.submittedAtUtc)}
            </span>
          </div>
          <div className="exam-result-meta__item">
            <span className="exam-result-meta__label">Students</span>
            <span className="exam-result-meta__value">{review.items.length}</span>
          </div>
        </div>

        {review.reviewComment && (
          <div className="exam-result-review-comment">
            <strong>Previous comment:</strong> {review.reviewComment}
          </div>
        )}

        {canReview && (
          <div className="exam-result-actions">
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

        <TableScrollWrapper>
          <table className="grade-table exam-result-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Marks</th>
                <th>Absent</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {review.items.map((item) => (
                <tr key={item.studentId}>
                  <td>{item.studentName}</td>
                  <td>{formatMarks(item.marksObtained, item.totalMarks, item.isAbsent)}</td>
                  <td>{item.isAbsent ? 'Yes' : 'No'}</td>
                  <td>{item.remarks || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableScrollWrapper>
      </section>

      <FormModal
        open={showApproveModal}
        title="Approve results"
        subtitle={`Batch #${review.batchId} · ${review.subjectName}`}
        onClose={closeModals}
      >
        <form className="embedded-form" onSubmit={handleApprove}>
          <div className="form-group">
            <label className="form-label" htmlFor="approve-comment">
              Comment (optional)
            </label>
            <textarea
              id="approve-comment"
              className="form-input"
              rows={3}
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              placeholder="Add an optional note for the teacher"
            />
          </div>
          <div className="embedded-form__actions">
            <button type="button" className="btn btn--ghost" onClick={closeModals} disabled={actionLoading}>
              Cancel
            </button>
            <button type="submit" className="btn btn--primary" disabled={actionLoading}>
              {actionLoading ? 'Approving…' : 'Approve results'}
            </button>
          </div>
        </form>
      </FormModal>

      <FormModal
        open={showRejectModal}
        title="Reject results"
        subtitle={`Batch #${review.batchId} · ${review.subjectName}`}
        onClose={closeModals}
      >
        <form className="embedded-form" onSubmit={handleReject}>
          <div className="form-group">
            <label className="form-label" htmlFor="reject-comment">
              Comment (required)
            </label>
            <textarea
              id="reject-comment"
              className="form-input"
              rows={3}
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              placeholder="Explain why these results are being rejected"
              required
            />
            {formError && <p className="form-error">{formError}</p>}
          </div>
          <div className="embedded-form__actions">
            <button type="button" className="btn btn--ghost" onClick={closeModals} disabled={actionLoading}>
              Cancel
            </button>
            <button type="submit" className="btn btn--danger" disabled={actionLoading}>
              {actionLoading ? 'Rejecting…' : 'Reject results'}
            </button>
          </div>
        </form>
      </FormModal>
    </div>
  );
}
