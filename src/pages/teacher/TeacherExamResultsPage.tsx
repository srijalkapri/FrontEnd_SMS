import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { teacherPortalApi } from '../../api/teacherPortalApi';
import { PageHeader } from '../../components/layout/PageHeader';
import { TableScrollWrapper } from '../../components/ui/TableScrollWrapper';
import { useToast } from '../../context/ToastContext';
import type { ExamResultItemDraft, TeacherExamResultBatch } from '../../types/examResult';
import {
  draftsToRequestItems,
  formatResultDateTime,
  itemsToDrafts,
  validateExamResultDrafts,
} from '../../utils/examResultFormat';
import {
  getExamResultStatusClass,
  getExamResultStatusLabel,
  isExamResultEditable,
} from '../../utils/examResultStatus';
import '../../components/GradeTable.css';
import '../ExamResultsPage.css';
import '../PortalPages.css';

export function TeacherExamResultsPage() {
  const { examSessionId: examSessionIdParam } = useParams();
  const { showToast } = useToast();

  const examSessionId = examSessionIdParam ? parseInt(examSessionIdParam, 10) : NaN;

  const [batch, setBatch] = useState<TeacherExamResultBatch | null>(null);
  const [drafts, setDrafts] = useState<ExamResultItemDraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  const fetchResults = useCallback(async () => {
    if (isNaN(examSessionId) || examSessionId <= 0) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await teacherPortalApi.getExamResults(examSessionId);
      setBatch(response.data);
      setDrafts(itemsToDrafts(response.data.items));
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Failed to load exam results.');
      setBatch(null);
      setDrafts([]);
    } finally {
      setLoading(false);
    }
  }, [examSessionId, showToast]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  const editable = batch ? isExamResultEditable(batch.status) : false;

  const updateDraft = (studentId: number, patch: Partial<ExamResultItemDraft>) => {
    setDrafts((current) =>
      current.map((draft) => (draft.studentId === studentId ? { ...draft, ...patch } : draft)),
    );
  };

  const buildRequest = () => ({
    examSessionId,
    items: draftsToRequestItems(drafts),
  });

  const handleSaveDraft = async () => {
    if (!batch || !editable) return;

    const validationError = validateExamResultDrafts(drafts);
    if (validationError) {
      showToast('error', validationError);
      return;
    }

    setSaveLoading(true);
    try {
      const response = await teacherPortalApi.saveExamResultsDraft(buildRequest());
      showToast('success', response.message || response.data);
      await fetchResults();
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Failed to save draft.');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!batch || !editable) return;

    const validationError = validateExamResultDrafts(drafts);
    if (validationError) {
      showToast('error', validationError);
      return;
    }

    setSubmitLoading(true);
    try {
      const response = await teacherPortalApi.submitExamResults(buildRequest());
      showToast('success', response.message || response.data);
      await fetchResults();
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Failed to submit results.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const isBusy = saveLoading || submitLoading;

  const summary = useMemo(() => {
    let entered = 0;
    let absent = 0;

    for (const draft of drafts) {
      if (draft.isAbsent) {
        absent += 1;
      } else if (draft.marksObtained.trim() !== '') {
        entered += 1;
      }
    }

    return { entered, absent, total: drafts.length };
  }, [drafts]);

  if (loading) {
    return (
      <div className="page-content portal-page">
        <div className="table-loading">
          <div className="spinner" />
          <p>Loading exam results…</p>
        </div>
      </div>
    );
  }

  if (!batch) {
    return (
      <div className="page-content portal-page">
        <PageHeader
          badge="Teacher Portal"
          title="Session not found"
          description="This exam session could not be loaded."
          actions={
            <Link to="/teacher/exams" className="btn btn--ghost">
              Back to sessions
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
        title="Enter exam results"
        description={`Session #${batch.examSessionId}`}
        actions={
          <Link to="/teacher/exams" className="btn btn--ghost">
            Back to sessions
          </Link>
        }
      />

      <section className="card">
        <div className="exam-result-meta">
          <div className="exam-result-meta__item">
            <span className="exam-result-meta__label">Status</span>
            <span className={`exam-result-status ${getExamResultStatusClass(batch.status)}`}>
              {getExamResultStatusLabel(batch.status)}
            </span>
          </div>
          <div className="exam-result-meta__item">
            <span className="exam-result-meta__label">Submitted</span>
            <span className="exam-result-meta__value">
              {formatResultDateTime(batch.submittedAtUtc)}
            </span>
          </div>
          <div className="exam-result-meta__item">
            <span className="exam-result-meta__label">Reviewed</span>
            <span className="exam-result-meta__value">
              {formatResultDateTime(batch.reviewedAtUtc)}
            </span>
          </div>
          <div className="exam-result-meta__item">
            <span className="exam-result-meta__label">Students</span>
            <span className="exam-result-meta__value">{drafts.length}</span>
          </div>
        </div>

        {batch.reviewComment && (
          <div className="exam-result-review-comment">
            <strong>Admin comment:</strong> {batch.reviewComment}
          </div>
        )}

        {editable && (
          <div className="exam-result-actions">
            <button
              type="button"
              className="btn btn--secondary"
              onClick={handleSaveDraft}
              disabled={isBusy}
            >
              {saveLoading ? 'Saving…' : 'Save draft'}
            </button>
            <button
              type="button"
              className="btn btn--primary"
              onClick={handleSubmit}
              disabled={isBusy}
            >
              {submitLoading ? 'Submitting…' : 'Submit for approval'}
            </button>
          </div>
        )}

        <TableScrollWrapper>
          <table className="grade-table exam-result-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Marks obtained</th>
                <th>Total marks</th>
                <th>Absent</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {drafts.map((draft) => (
                <tr key={draft.studentId}>
                  <td>{draft.studentName}</td>
                  <td>
                    {editable ? (
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        className="form-input form-input--compact"
                        value={draft.marksObtained}
                        disabled={draft.isAbsent || isBusy}
                        onChange={(event) =>
                          updateDraft(draft.studentId, { marksObtained: event.target.value })
                        }
                      />
                    ) : (
                      draft.marksObtained || '—'
                    )}
                  </td>
                  <td>
                    {editable ? (
                      <input
                        type="number"
                        min={1}
                        step="0.01"
                        className="form-input form-input--compact"
                        value={draft.totalMarks}
                        disabled={isBusy}
                        onChange={(event) =>
                          updateDraft(draft.studentId, { totalMarks: event.target.value })
                        }
                      />
                    ) : (
                      draft.totalMarks
                    )}
                  </td>
                  <td>
                    <div className="exam-result-table__checkbox">
                      {editable ? (
                        <input
                          type="checkbox"
                          checked={draft.isAbsent}
                          disabled={isBusy}
                          onChange={(event) =>
                            updateDraft(draft.studentId, {
                              isAbsent: event.target.checked,
                              marksObtained: event.target.checked ? '' : draft.marksObtained,
                            })
                          }
                          aria-label={`Mark ${draft.studentName} absent`}
                        />
                      ) : (
                        draft.isAbsent ? 'Yes' : 'No'
                      )}
                    </div>
                  </td>
                  <td>
                    {editable ? (
                      <input
                        type="text"
                        className="form-input form-input--compact"
                        value={draft.remarks}
                        disabled={isBusy}
                        onChange={(event) =>
                          updateDraft(draft.studentId, { remarks: event.target.value })
                        }
                      />
                    ) : (
                      draft.remarks || '—'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableScrollWrapper>

        <div className="exam-result-summary">
          <div className="exam-result-summary__item">
            <span className="exam-result-summary__label">Total students</span>
            <span className="exam-result-summary__value">{summary.total}</span>
          </div>
          <div className="exam-result-summary__item">
            <span className="exam-result-summary__label">Marks entered</span>
            <span className="exam-result-summary__value">{summary.entered}</span>
          </div>
          <div className="exam-result-summary__item">
            <span className="exam-result-summary__label">Absent</span>
            <span className="exam-result-summary__value">{summary.absent}</span>
          </div>
        </div>
      </section>
    </div>
  );
}
