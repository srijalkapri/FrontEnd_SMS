import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { gradeApi } from '../api/gradeApi';
import { studentApi } from '../api/studentApi';
import { ConfirmDeleteModal } from '../components/ConfirmDeleteModal';
import { PageHeader } from '../components/layout/PageHeader';
import { useToast } from '../context/ToastContext';
import type { Grade } from '../types/grade';
import type { PromotionResult } from '../types/promotion';
import type { Student } from '../types/student';
import './PromotionPage.css';
import '../components/GradeTable.css';

function FlowArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
      />
    </svg>
  );
}

function CheckCircleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

export function PromotionPage() {
  const { showToast } = useToast();
  const [grades, setGrades] = useState<Grade[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [preview, setPreview] = useState<PromotionResult | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [loadingGrades, setLoadingGrades] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [promoteLoading, setPromoteLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const [fromGradeId, setFromGradeId] = useState('');
  const [toGradeId, setToGradeId] = useState('');
  const [formError, setFormError] = useState('');

  const parsedFromGradeId = fromGradeId ? parseInt(fromGradeId, 10) : NaN;
  const parsedToGradeId = toGradeId ? parseInt(toGradeId, 10) : NaN;

  const fromGrade = grades.find((grade) => grade.id === parsedFromGradeId);
  const toGrade = grades.find((grade) => grade.id === parsedToGradeId);

  const fetchGrades = useCallback(async () => {
    setLoadingGrades(true);
    try {
      const response = await gradeApi.getAll();
      setGrades(response.data);
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Failed to load grades');
    } finally {
      setLoadingGrades(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchGrades();
  }, [fetchGrades]);

  const loadStudentsForGrade = useCallback(
    async (gradeId: number) => {
      setLoadingStudents(true);
      setStudents([]);
      setSelectedIds(new Set());
      setPreview(null);
      setSearchQuery('');

      try {
        const response = await studentApi.getByGrade(gradeId);
        setStudents(response.data);
        setSelectedIds(new Set(response.data.map((student) => student.id)));
      } catch (err) {
        showToast('error', err instanceof Error ? err.message : 'Failed to load students');
      } finally {
        setLoadingStudents(false);
      }
    },
    [showToast],
  );

  useEffect(() => {
    if (isNaN(parsedFromGradeId) || parsedFromGradeId <= 0) {
      setStudents([]);
      setSelectedIds(new Set());
      setPreview(null);
      return;
    }

    loadStudentsForGrade(parsedFromGradeId);
  }, [parsedFromGradeId, loadStudentsForGrade]);

  useEffect(() => {
    setPreview(null);
  }, [fromGradeId, toGradeId, selectedIds]);

  const targetGrades = useMemo(
    () => grades.filter((grade) => grade.id !== parsedFromGradeId),
    [grades, parsedFromGradeId],
  );

  const filteredStudents = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return students;

    return students.filter(
      (student) =>
        student.name.toLowerCase().includes(query) ||
        student.email.toLowerCase().includes(query) ||
        student.phoneNo.includes(query) ||
        student.id.toString().includes(query),
    );
  }, [students, searchQuery]);

  const allSelected = students.length > 0 && selectedIds.size === students.length;
  const someSelected = selectedIds.size > 0 && selectedIds.size < students.length;

  const step1Done = Boolean(fromGradeId);
  const step2Done = step1Done && students.length > 0;
  const step3Ready = step2Done && Boolean(toGradeId) && selectedIds.size > 0;

  const buildRequest = () => ({
    fromGradeId: parsedFromGradeId,
    toGradeId: parsedToGradeId,
    studentIds: Array.from(selectedIds),
  });

  const validateForm = (): boolean => {
    if (isNaN(parsedFromGradeId) || parsedFromGradeId <= 0) {
      setFormError('Select the source grade.');
      return false;
    }

    if (isNaN(parsedToGradeId) || parsedToGradeId <= 0) {
      setFormError('Select the target grade.');
      return false;
    }

    if (parsedFromGradeId === parsedToGradeId) {
      setFormError('Source and target grade must be different.');
      return false;
    }

    if (selectedIds.size === 0) {
      setFormError('Select at least one student to promote.');
      return false;
    }

    setFormError('');
    return true;
  };

  const handlePreview = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setPreviewLoading(true);
    try {
      const response = await studentApi.previewPromotion(buildRequest());
      setPreview(response.data);
      showToast('success', response.message);
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Failed to preview promotion');
      setPreview(null);
    } finally {
      setPreviewLoading(false);
    }
  };

  const handlePromote = async () => {
    if (!validateForm()) return;

    setPromoteLoading(true);
    try {
      const response = await studentApi.promoteStudents(buildRequest());
      showToast('success', response.message);
      setShowConfirmModal(false);
      setPreview(response.data);
      await loadStudentsForGrade(parsedFromGradeId);
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Promotion failed');
    } finally {
      setPromoteLoading(false);
    }
  };

  const toggleStudent = (studentId: number) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(studentId)) {
        next.delete(studentId);
      } else {
        next.add(studentId);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
      return;
    }
    setSelectedIds(new Set(students.map((student) => student.id)));
  };

  const handleClear = () => {
    setFromGradeId('');
    setToGradeId('');
    setStudents([]);
    setSelectedIds(new Set());
    setPreview(null);
    setFormError('');
    setSearchQuery('');
    setShowConfirmModal(false);
  };

  const isBusy = loadingGrades || loadingStudents || previewLoading || promoteLoading;

  return (
    <div className="page-content promotion-page">
      <PageHeader
        badge="Academic Management"
        title="Student Promotion"
        description="Bulk-promote students to the next grade at the end of the academic year."
        actions={
          <button type="button" className="btn btn--ghost" onClick={fetchGrades} disabled={loadingGrades}>
            Refresh
          </button>
        }
      />

      <section className="card promotion-setup">
        <div className="promotion-setup__steps">
          <span className={`promotion-step ${step1Done ? 'promotion-step--done' : 'promotion-step--active'}`}>
            <span className="promotion-step__num">1</span>
            Select grades
          </span>
          <span
            className={`promotion-step ${step2Done ? 'promotion-step--done' : step1Done ? 'promotion-step--active' : ''}`}
          >
            <span className="promotion-step__num">2</span>
            Review students
          </span>
          <span className={`promotion-step ${step3Ready ? 'promotion-step--active' : ''}`}>
            <span className="promotion-step__num">3</span>
            Preview &amp; promote
          </span>
        </div>

        <form onSubmit={handlePreview}>
          <div className="promotion-flow">
            <div className="promotion-flow__field">
              <span className="promotion-flow__label">Source grade</span>
              <select
                id="fromGradeId"
                className="form-input"
                value={fromGradeId}
                onChange={(e) => {
                  setFromGradeId(e.target.value);
                  setToGradeId('');
                  if (formError) setFormError('');
                }}
                disabled={isBusy}
              >
                <option value="">Choose current grade</option>
                {grades.map((grade) => (
                  <option key={grade.id} value={grade.id}>
                    {grade.className}
                  </option>
                ))}
              </select>
            </div>

            <div className="promotion-flow__arrow" aria-hidden="true">
              <FlowArrowIcon />
            </div>

            <div className="promotion-flow__field">
              <span className="promotion-flow__label">Target grade</span>
              <select
                id="toGradeId"
                className="form-input"
                value={toGradeId}
                onChange={(e) => {
                  setToGradeId(e.target.value);
                  if (formError) setFormError('');
                }}
                disabled={isBusy || !fromGradeId}
              >
                <option value="">Choose next grade</option>
                {targetGrades.map((grade) => (
                  <option key={grade.id} value={grade.id}>
                    {grade.className}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {formError && <p className="form-error">{formError}</p>}

          <div className="promotion-setup__footer">
            <p className="promotion-setup__hint">
              {fromGrade && toGrade
                ? `Students will move from ${fromGrade.className} to ${toGrade.className}. Preview before confirming.`
                : 'Select source and target grades, then choose which students to promote.'}
            </p>
            <div className="promotion-setup__actions">
              <button type="button" className="btn btn--ghost" onClick={handleClear} disabled={isBusy}>
                Reset
              </button>
              <button
                type="submit"
                className={`btn btn--secondary ${previewLoading ? 'btn--loading' : ''}`}
                disabled={isBusy || !fromGradeId || !toGradeId || selectedIds.size === 0}
              >
                {previewLoading ? (
                  <>
                    <span className="spinner spinner--sm" />
                    Previewing...
                  </>
                ) : (
                  'Preview'
                )}
              </button>
              <button
                type="button"
                className={`btn btn--primary ${promoteLoading ? 'btn--loading' : ''}`}
                disabled={isBusy || !fromGradeId || !toGradeId || selectedIds.size === 0}
                onClick={() => {
                  if (validateForm()) setShowConfirmModal(true);
                }}
              >
                Promote {selectedIds.size > 0 ? `(${selectedIds.size})` : ''}
              </button>
            </div>
          </div>
        </form>
      </section>

      {fromGradeId && (
        <div className="promotion-stats">
          <div className="promotion-stat-card">
            <span className="promotion-stat-card__label">In {fromGrade?.className ?? 'grade'}</span>
            <span className="promotion-stat-card__value">{students.length}</span>
          </div>
          <div className="promotion-stat-card">
            <span className="promotion-stat-card__label">Selected</span>
            <span className="promotion-stat-card__value promotion-stat-card__value--accent">
              {selectedIds.size}
            </span>
          </div>
          <div className="promotion-stat-card">
            <span className="promotion-stat-card__label">Ready to promote</span>
            <span className="promotion-stat-card__value promotion-stat-card__value--success">
              {preview?.promotedCount ?? '—'}
            </span>
          </div>
        </div>
      )}

      <section className="card grade-table-section promotion-students">
        <div className="card__header">
          <div>
            <h2 className="card__title">Student roster</h2>
            <p className="card__subtitle">
              {fromGrade
                ? `Students currently enrolled in ${fromGrade.className}`
                : 'Select a source grade to load the roster'}
            </p>
          </div>
        </div>

        {preview && fromGrade && toGrade && (
          <div className="promotion-preview-banner">
            <div className="promotion-preview-banner__content">
              <div className="promotion-preview-banner__icon">
                <CheckCircleIcon />
              </div>
              <div>
                <p className="promotion-preview-banner__title">Preview ready</p>
                <p className="promotion-preview-banner__text">
                  {preview.promotedCount} student{preview.promotedCount !== 1 ? 's' : ''} can move from{' '}
                  <strong>{fromGrade.className}</strong> to <strong>{toGrade.className}</strong>.
                </p>
              </div>
            </div>
            <div className="promotion-preview-banner__badges">
              <span className="promotion-badge promotion-badge--ready">
                Ready: {preview.promotedCount}
              </span>
              {preview.skippedCount > 0 && (
                <span className="promotion-badge promotion-badge--warn">
                  Skipped: {preview.skippedCount}
                </span>
              )}
            </div>
          </div>
        )}

        {!fromGradeId ? (
          <div className="promotion-state">
            <div className="promotion-state__icon">
              <UsersIcon />
            </div>
            <p className="promotion-state__title">No grade selected</p>
            <p className="promotion-state__text">
              Choose a source grade above to load students eligible for promotion.
            </p>
          </div>
        ) : loadingStudents ? (
          <div className="promotion-state">
            <span className="spinner" />
            <p className="promotion-state__text">Loading students...</p>
          </div>
        ) : students.length === 0 ? (
          <div className="promotion-state">
            <div className="promotion-state__icon">
              <UsersIcon />
            </div>
            <p className="promotion-state__title">No students in this grade</p>
            <p className="promotion-state__text">
              There are no students in {fromGrade?.className}. Choose a different source grade.
            </p>
          </div>
        ) : (
          <>
            <div className="promotion-students__toolbar">
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
                  placeholder="Search by name, email, or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input__field"
                  disabled={isBusy}
                />
              </div>
              <p className="promotion-students__count">
                <strong>{selectedIds.size}</strong> of {students.length} selected
              </p>
            </div>

            <div className="table-wrapper">
              <table className="grade-table">
                <thead>
                  <tr>
                    <th className="promotion-table__select-col">
                      <label className="promotion-table__select-all">
                        <input
                          type="checkbox"
                          className="promotion-table__checkbox"
                          checked={allSelected}
                          ref={(input) => {
                            if (input) input.indeterminate = someSelected;
                          }}
                          onChange={toggleSelectAll}
                          disabled={isBusy}
                          aria-label="Select all students"
                        />
                      </label>
                    </th>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={5}>
                        <div className="promotion-state promotion-state--compact">
                          <p className="promotion-state__text">No students match your search.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((student) => {
                      const isSelected = selectedIds.has(student.id);
                      return (
                        <tr
                          key={student.id}
                          className={isSelected ? 'promotion-row--selected' : undefined}
                        >
                          <td>
                            <label className="promotion-table__select-all">
                              <input
                                type="checkbox"
                                className="promotion-table__checkbox"
                                checked={isSelected}
                                onChange={() => toggleStudent(student.id)}
                                disabled={isBusy}
                                aria-label={`Select ${student.name}`}
                              />
                            </label>
                          </td>
                          <td>
                            <span className="grade-id">#{student.id}</span>
                          </td>
                          <td>
                            <span className="promotion-student-name">{student.name}</span>
                          </td>
                          <td>
                            <a className="contact-link" href={`mailto:${student.email}`}>
                              {student.email}
                            </a>
                          </td>
                          <td>{student.phoneNo}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {preview && preview.skippedStudents.length > 0 && (
          <div className="promotion-skipped">
            <p className="promotion-skipped__title">Skipped students</p>
            <div className="promotion-skipped__list">
              {preview.skippedStudents.map((skipped) => (
                <div key={skipped.studentId}>
                  Student #{skipped.studentId}
                  {skipped.reason ? ` — ${skipped.reason}` : ''}
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      <ConfirmDeleteModal
        open={showConfirmModal}
        title="Confirm promotion"
        message={
          fromGrade && toGrade ? (
            <>
              Move <strong>{selectedIds.size}</strong> student{selectedIds.size !== 1 ? 's' : ''} from{' '}
              <strong>{fromGrade.className}</strong> to <strong>{toGrade.className}</strong>? Their
              grade and subject enrollment will update immediately.
            </>
          ) : (
            'Promote the selected students?'
          )
        }
        confirmLabel="Confirm promotion"
        confirmVariant="primary"
        loading={promoteLoading}
        onConfirm={handlePromote}
        onCancel={() => setShowConfirmModal(false)}
      />
    </div>
  );
}
