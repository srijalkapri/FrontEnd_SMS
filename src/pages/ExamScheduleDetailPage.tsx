import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { examApi } from '../api/examApi';
import { teacherApi } from '../api/teacherApi';
import { ConfirmDeleteModal } from '../components/ConfirmDeleteModal';
import { PageHeader } from '../components/layout/PageHeader';
import { useToast } from '../context/ToastContext';
import {
  ExamScheduleStatus,
  type ExamSchedule,
  type ExamSessionDraft,
} from '../types/exam';
import type { Teacher } from '../types/teacher';
import {
  draftToBulkItem,
  formatExamDate,
  sessionToDraft,
} from '../utils/examFormat';
import { getExamStatusLabel, isExamSchedulePublished } from '../utils/examStatus';
import { getSubjectTypeLabel } from '../utils/subjectType';
import '../components/GradeTable.css';
import '../components/SearchGradeSubject.css';
import './ExamSchedulesPage.css';

export function ExamScheduleDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const scheduleId = id ? parseInt(id, 10) : NaN;

  const [schedule, setSchedule] = useState<ExamSchedule | null>(null);
  const [sessionDrafts, setSessionDrafts] = useState<ExamSessionDraft[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [publishLoading, setPublishLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [title, setTitle] = useState('');
  const [academicYear, setAcademicYear] = useState('');
  const [metaError, setMetaError] = useState('');

  const isPublished = schedule ? isExamSchedulePublished(schedule.status) : false;

  const fetchSchedule = useCallback(async () => {
    if (isNaN(scheduleId) || scheduleId <= 0) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [scheduleResponse, teachersResponse] = await Promise.all([
        examApi.getScheduleById(scheduleId),
        teacherApi.getAll(),
      ]);
      setSchedule(scheduleResponse.data);
      setSessionDrafts(scheduleResponse.data.sessions.map(sessionToDraft));
      setTitle(scheduleResponse.data.title);
      setAcademicYear(scheduleResponse.data.academicYear);
      setTeachers(teachersResponse.data);
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Failed to load exam schedule');
      setSchedule(null);
    } finally {
      setLoading(false);
    }
  }, [scheduleId, showToast]);

  useEffect(() => {
    fetchSchedule();
  }, [fetchSchedule]);

  const configuredCount = useMemo(() => {
    if (!schedule) return 0;
    return sessionDrafts.filter(
      (draft) => draft.examDate && draft.invigilatorTeacherId,
    ).length;
  }, [schedule, sessionDrafts]);

  const updateDraft = (sessionId: number, patch: Partial<ExamSessionDraft>) => {
    setSessionDrafts((current) =>
      current.map((draft) => (draft.id === sessionId ? { ...draft, ...patch } : draft)),
    );
  };

  const handleSaveSessions = async () => {
    if (!schedule) return;

    setSaveLoading(true);
    try {
      const response = await examApi.bulkUpdateSessions({
        examScheduleId: schedule.id,
        sessions: sessionDrafts.map(draftToBulkItem),
      });
      showToast('success', response.message);
      await fetchSchedule();
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Failed to save sessions');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleSaveMeta = async (e: FormEvent) => {
    e.preventDefault();
    if (!schedule) return;

    const trimmedTitle = title.trim();
    const trimmedYear = academicYear.trim();

    if (!trimmedTitle || !trimmedYear) {
      setMetaError('Title and academic year are required.');
      return;
    }

    setMetaError('');
    setSaveLoading(true);
    try {
      const response = await examApi.updateSchedule(schedule.id, {
        title: trimmedTitle,
        academicYear: trimmedYear,
        status: schedule.status,
      });
      showToast('success', response.message);
      await fetchSchedule();
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Failed to update schedule');
    } finally {
      setSaveLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!schedule) return;

    const incomplete = sessionDrafts.filter(
      (draft) => !draft.examDate || !draft.invigilatorTeacherId,
    );

    if (incomplete.length > 0) {
      showToast(
        'error',
        `${incomplete.length} session${incomplete.length !== 1 ? 's' : ''} still need a date and invigilator.`,
      );
      return;
    }

    setPublishLoading(true);
    try {
      await examApi.bulkUpdateSessions({
        examScheduleId: schedule.id,
        sessions: sessionDrafts.map(draftToBulkItem),
      });

      const response = await examApi.updateSchedule(schedule.id, {
        title: title.trim(),
        academicYear: academicYear.trim(),
        status: ExamScheduleStatus.Published,
      });
      showToast('success', response.message);
      await fetchSchedule();
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Failed to publish schedule');
    } finally {
      setPublishLoading(false);
    }
  };

  const handleUnpublish = async () => {
    if (!schedule) return;

    setPublishLoading(true);
    try {
      const response = await examApi.updateSchedule(schedule.id, {
        title: title.trim(),
        academicYear: academicYear.trim(),
        status: ExamScheduleStatus.Draft,
      });
      showToast('success', response.message);
      await fetchSchedule();
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Failed to unpublish schedule');
    } finally {
      setPublishLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!schedule) return;

    setDeleteLoading(true);
    try {
      const response = await examApi.deleteSchedule(schedule.id);
      showToast('success', response.message);
      navigate('/exams');
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Delete failed');
    } finally {
      setDeleteLoading(false);
    }
  };

  const isBusy = loading || saveLoading || publishLoading || deleteLoading;

  if (loading) {
    return (
      <div className="page-content exam-page">
        <div className="exam-empty">
          <span className="spinner" />
          <p>Loading exam schedule...</p>
        </div>
      </div>
    );
  }

  if (!schedule) {
    return (
      <div className="page-content exam-page">
        <div className="exam-empty">
          <p className="exam-empty__title">Schedule not found</p>
          <Link to="/exams" className="btn btn--primary">
            Back to schedules
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-content exam-page">
      <PageHeader
        badge="Exam Schedules"
        title={schedule.title}
        description={`${schedule.gradeName} · ${schedule.academicYear}`}
        actions={
          <div className="exam-detail-actions">
            <Link to="/exams" className="btn btn--ghost">
              Back
            </Link>
            {!isPublished && (
              <button
                type="button"
                className={`btn btn--primary ${publishLoading ? 'btn--loading' : ''}`}
                onClick={handlePublish}
                disabled={isBusy}
              >
                {publishLoading ? (
                  <>
                    <span className="spinner spinner--sm" />
                    Publishing...
                  </>
                ) : (
                  'Publish'
                )}
              </button>
            )}
            {isPublished && (
              <button
                type="button"
                className="btn btn--secondary"
                onClick={handleUnpublish}
                disabled={isBusy}
              >
                Unpublish
              </button>
            )}
            <button
              type="button"
              className="btn btn--ghost"
              onClick={() => setShowDeleteModal(true)}
              disabled={isBusy}
            >
              Delete
            </button>
          </div>
        }
      />

      <section className="card">
        <div className="exam-detail-meta">
          <div className="exam-detail-meta__item">
            <span className="exam-detail-meta__label">Grade</span>
            <span className="exam-detail-meta__value">{schedule.gradeName}</span>
          </div>
          <div className="exam-detail-meta__item">
            <span className="exam-detail-meta__label">Status</span>
            <span className="exam-detail-meta__value">
              <span
                className={`exam-status ${isPublished ? 'exam-status--published' : 'exam-status--draft'}`}
              >
                {getExamStatusLabel(schedule.status)}
              </span>
            </span>
          </div>
          <div className="exam-detail-meta__item">
            <span className="exam-detail-meta__label">Sessions configured</span>
            <span className="exam-detail-meta__value">
              {configuredCount}/{schedule.sessions.length}
            </span>
          </div>
          <div className="exam-detail-meta__item">
            <span className="exam-detail-meta__label">Created</span>
            <span className="exam-detail-meta__value">{formatExamDate(schedule.createdAt)}</span>
          </div>
        </div>

        <form onSubmit={handleSaveMeta}>
          <div className="exam-meta-form">
            <div className="form-group">
              <label htmlFor="scheduleTitle" className="form-label">
                Title
              </label>
              <input
                id="scheduleTitle"
                type="text"
                className="form-input"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (metaError) setMetaError('');
                }}
                disabled={isBusy || isPublished}
              />
            </div>
            <div className="form-group">
              <label htmlFor="scheduleYear" className="form-label">
                Academic year
              </label>
              <input
                id="scheduleYear"
                type="text"
                className="form-input"
                value={academicYear}
                onChange={(e) => {
                  setAcademicYear(e.target.value);
                  if (metaError) setMetaError('');
                }}
                disabled={isBusy || isPublished}
              />
            </div>
          </div>
          {metaError && <p className="form-error">{metaError}</p>}
          {!isPublished && (
            <div className="exam-meta-form__actions">
              <button
                type="submit"
                className={`btn btn--secondary ${saveLoading ? 'btn--loading' : ''}`}
                disabled={isBusy}
              >
                Save details
              </button>
            </div>
          )}
        </form>
      </section>

      <section className="card grade-table-section">
        <div className="card__header">
          <div>
            <h2 className="card__title">Exam sessions</h2>
            <p className="card__subtitle">
              Assign a date, time, and invigilator for each subject exam.
            </p>
          </div>
          {!isPublished && (
            <button
              type="button"
              className={`btn btn--primary ${saveLoading ? 'btn--loading' : ''}`}
              onClick={handleSaveSessions}
              disabled={isBusy}
            >
              {saveLoading ? (
                <>
                  <span className="spinner spinner--sm" />
                  Saving...
                </>
              ) : (
                'Save sessions'
              )}
            </button>
          )}
        </div>

        {schedule.sessions.length === 0 ? (
          <div className="exam-empty">
            <p className="exam-empty__title">No sessions yet</p>
            <p>Sessions are created automatically when the schedule is generated from grade subjects.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="grade-table exam-session-table">
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Type</th>
                  <th>Date</th>
                  <th>Start</th>
                  <th>End</th>
                  <th>Invigilator</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {schedule.sessions.map((session) => {
                  const draft =
                    sessionDrafts.find((item) => item.id === session.id) ?? sessionToDraft(session);

                  return (
                    <tr key={session.id}>
                      <td>
                        <span className="exam-session-subject">{session.subjectName}</span>
                      </td>
                      <td>
                        <span
                          className={`teacher-tag ${session.isOptional ? 'teacher-tag--optional' : 'teacher-tag--compulsory'}`}
                        >
                          {getSubjectTypeLabel(session.isOptional)}
                        </span>
                      </td>
                      <td>
                        <input
                          type="date"
                          className="form-input form-input--compact"
                          value={draft.examDate}
                          onChange={(e) => updateDraft(session.id, { examDate: e.target.value })}
                          disabled={isBusy || isPublished}
                        />
                      </td>
                      <td>
                        <input
                          type="time"
                          className="form-input form-input--compact"
                          value={draft.startTime}
                          onChange={(e) => updateDraft(session.id, { startTime: e.target.value })}
                          disabled={isBusy || isPublished}
                        />
                      </td>
                      <td>
                        <input
                          type="time"
                          className="form-input form-input--compact"
                          value={draft.endTime}
                          onChange={(e) => updateDraft(session.id, { endTime: e.target.value })}
                          disabled={isBusy || isPublished}
                        />
                      </td>
                      <td>
                        <select
                          className="form-input form-input--compact"
                          value={draft.invigilatorTeacherId}
                          onChange={(e) =>
                            updateDraft(session.id, { invigilatorTeacherId: e.target.value })
                          }
                          disabled={isBusy || isPublished}
                        >
                          <option value="">Select teacher</option>
                          {teachers.map((teacher) => (
                            <option key={teacher.id} value={teacher.id}>
                              {teacher.name}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <input
                          type="text"
                          className="form-input form-input--compact"
                          placeholder="Optional notes"
                          value={draft.notes}
                          onChange={(e) => updateDraft(session.id, { notes: e.target.value })}
                          disabled={isBusy || isPublished}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <ConfirmDeleteModal
        open={showDeleteModal}
        title="Delete exam schedule"
        message={
          <>
            Delete <strong>{schedule.title}</strong> for <strong>{schedule.gradeName}</strong>?
          </>
        }
        confirmLabel="Delete schedule"
        loading={deleteLoading}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
      />
    </div>
  );
}
