import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { examApi } from '../api/examApi';
import { gradeApi } from '../api/gradeApi';
import { ConfirmDeleteModal } from '../components/ConfirmDeleteModal';
import { ExamScheduleForm } from '../components/ExamScheduleForm';
import { PageHeader } from '../components/layout/PageHeader';
import { FormModal } from '../components/ui/FormModal';
import { PaginationControls } from '../components/ui/PaginationControls';
import { useToast } from '../context/ToastContext';
import { usePagedList } from '../hooks/usePagedList';
import type { ExamSchedule } from '../types/exam';
import type { Grade } from '../types/grade';
import { countConfiguredSessions, formatExamDate } from '../utils/examFormat';
import { getExamStatusLabel, isExamSchedulePublished } from '../utils/examStatus';
import '../components/GradeTable.css';
import '../components/SearchGradeSubject.css';
import './ExamSchedulesPage.css';

export function ExamSchedulesPage() {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [grades, setGrades] = useState<Grade[]>([]);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [gradeFilter, setGradeFilter] = useState('');
  const [showFormModal, setShowFormModal] = useState(false);
  const [deletingSchedule, setDeletingSchedule] = useState<ExamSchedule | null>(null);

  const parsedGradeId = gradeFilter ? parseInt(gradeFilter, 10) : NaN;

  const fetchPage = useCallback(
    async (query: Parameters<typeof examApi.getSchedulesPaged>[0]) => {
      if (!isNaN(parsedGradeId) && parsedGradeId > 0) {
        const response = await examApi.getSchedulesByGradePaged(parsedGradeId, query);
        return response.data;
      }
      const response = await examApi.getSchedulesPaged(query);
      return response.data;
    },
    [parsedGradeId],
  );

  const {
    items: schedules,
    loading,
    error,
    pageNumber,
    pageSize,
    search: searchQuery,
    totalCount,
    totalPages,
    hasPreviousPage,
    hasNextPage,
    setPageNumber,
    setPageSize,
    setSearch: setSearchQuery,
    refresh: fetchData,
  } = usePagedList({ fetchPage });

  useEffect(() => {
    if (error) {
      showToast('error', error);
    }
  }, [error, showToast]);

  useEffect(() => {
    setPageNumber(1);
  }, [gradeFilter, setPageNumber]);

  const fetchGrades = useCallback(async () => {
    try {
      const gradesResponse = await gradeApi.getAll();
      setGrades(gradesResponse.data);
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Failed to load grades');
    }
  }, [showToast]);

  useEffect(() => {
    void fetchGrades();
  }, [fetchGrades]);

  const handleCreate = async (
    gradeId: number,
    title: string,
    academicYear: string,
    autoGenerateSessions: boolean,
  ) => {
    setFormLoading(true);
    try {
      const response = await examApi.createSchedule({
        gradeId,
        title,
        academicYear,
        autoGenerateSessions,
      });
      showToast('success', response.message);
      setShowFormModal(false);
      await fetchData();
      navigate(`/exams/${response.data}`);
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Failed to create schedule');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingSchedule) return;

    setDeleteLoading(true);
    try {
      const response = await examApi.deleteSchedule(deletingSchedule.id);
      showToast('success', response.message);
      setDeletingSchedule(null);
      await fetchData();
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Delete failed');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="page-content exam-page">
      <PageHeader
        badge="Academic Management"
        title="Exam Schedules"
        description="Create and manage exam timetables for each grade."
        actions={
          <>
            <button type="button" className="btn btn--ghost" onClick={fetchData} disabled={loading}>
              Refresh
            </button>
            <button type="button" className="btn btn--primary" onClick={() => setShowFormModal(true)}>
              + New schedule
            </button>
          </>
        }
      />

      <section className="card grade-table-section">
        <div className="card__header">
          <div>
            <h2 className="card__title">All schedules</h2>
            <p className="card__subtitle">
              {totalCount} schedule{totalCount !== 1 ? 's' : ''} total
            </p>
          </div>
        </div>

        <div className="exam-toolbar">
          <div className="exam-toolbar__filters">
            <select
              className="form-input"
              value={gradeFilter}
              onChange={(e) => setGradeFilter(e.target.value)}
              disabled={loading}
            >
              <option value="">All grades</option>
              {grades.map((grade) => (
                <option key={grade.id} value={grade.id}>
                  {grade.className}
                </option>
              ))}
            </select>
          </div>
          <div className="search-input">
            <svg className="search-input__icon" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                clipRule="evenodd"
              />
            </svg>
            <input
              type="text"
              placeholder="Search title, grade, year..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input__field"
              disabled={loading}
            />
          </div>
        </div>

        {loading && (schedules?.length ?? 0) === 0 ? (
          <div className="exam-empty">
            <span className="spinner" />
          </div>
        ) : (schedules?.length ?? 0) === 0 ? (
          <div className="exam-empty">
            <p className="exam-empty__title">No exam schedules found</p>
            <p>Create a schedule to assign exam dates and invigilators per subject.</p>
            <button type="button" className="btn btn--primary" onClick={() => setShowFormModal(true)}>
              + New schedule
            </button>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="grade-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Grade</th>
                  <th>Academic year</th>
                  <th>Status</th>
                  <th>Sessions</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {schedules.map((schedule) => {
                  const configured = countConfiguredSessions(schedule.sessions);
                  const published = isExamSchedulePublished(schedule.status);
                  const sessionCount = schedule.sessions?.length ?? 0;

                  return (
                    <tr key={schedule.id}>
                      <td>
                        <span className="grade-id">#{schedule.id}</span>
                      </td>
                      <td>{schedule.title}</td>
                      <td>{schedule.gradeName}</td>
                      <td>{schedule.academicYear}</td>
                      <td>
                        <span
                          className={`exam-status ${published ? 'exam-status--published' : 'exam-status--draft'}`}
                        >
                          {getExamStatusLabel(schedule.status)}
                        </span>
                      </td>
                      <td>
                        {configured}/{sessionCount} set
                      </td>
                      <td>{formatExamDate(schedule.createdAt)}</td>
                      <td>
                        <div className="grade-table__actions">
                          <Link to={`/exams/${schedule.id}`} className="btn btn--ghost btn--compact">
                            Manage
                          </Link>
                          <button
                            type="button"
                            className="btn btn--icon btn--delete"
                            onClick={() => setDeletingSchedule(schedule)}
                            aria-label={`Delete ${schedule.title}`}
                          >
                            <svg viewBox="0 0 20 20" fill="currentColor">
                              <path
                                fillRule="evenodd"
                                d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <PaginationControls
          totalCount={totalCount}
          pageNumber={pageNumber}
          pageSize={pageSize}
          totalPages={totalPages}
          hasPreviousPage={hasPreviousPage}
          hasNextPage={hasNextPage}
          onPageChange={setPageNumber}
          onPageSizeChange={setPageSize}
          loading={loading}
        />
      </section>

      <FormModal
        open={showFormModal}
        title="Create exam schedule"
        subtitle="Sessions will be generated from the grade's subject list."
        onClose={() => !formLoading && setShowFormModal(false)}
      >
        <ExamScheduleForm
          grades={grades}
          loading={formLoading}
          onSubmit={handleCreate}
          onCancel={() => setShowFormModal(false)}
        />
      </FormModal>

      <ConfirmDeleteModal
        open={!!deletingSchedule}
        title="Delete exam schedule"
        message={
          <>
            Delete <strong>{deletingSchedule?.title}</strong> for{' '}
            <strong>{deletingSchedule?.gradeName}</strong>? All sessions will be removed.
          </>
        }
        confirmLabel="Delete schedule"
        loading={deleteLoading}
        onConfirm={handleDelete}
        onCancel={() => setDeletingSchedule(null)}
      />
    </div>
  );
}
