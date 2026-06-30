import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { gradeApi } from '../api/gradeApi';
import { gradeSubjectApi } from '../api/gradeSubjectApi';
import { gradeSubjectTeacherApi } from '../api/gradeSubjectTeacherApi';
import { studentApi } from '../api/studentApi';
import { teacherApi } from '../api/teacherApi';
import { PageHeader } from '../components/layout/PageHeader';
import { TeacherAssignmentReportCard } from '../components/reports/TeacherAssignmentReportCard';
import { FormModal } from '../components/ui/FormModal';
import { useToast } from '../context/ToastContext';
import type { Grade } from '../types/grade';
import type { GradeSubject } from '../types/gradeSubject';
import type { GradeSubjectTeacher } from '../types/gradeSubjectTeacher';
import type { Student } from '../types/student';
import type { TeacherDetails } from '../types/teacher';
import { getSubjectTypeLabel } from '../utils/subjectType';
import {
  buildTeacherReportRows,
  hasActiveTeacherReportFilters,
  type TeacherReportFilters,
  type TeacherReportRow,
} from '../utils/teacherReportFilters';
import '../components/SearchGrade.css';
import '../components/SearchGradeSubject.css';
import './StudentReportPage.css';
import './TeacherReportPage.css';

export function TeacherReportPage() {
  const { showToast } = useToast();
  const [grades, setGrades] = useState<Grade[]>([]);
  const [mappings, setMappings] = useState<GradeSubject[]>([]);
  const [assignments, setAssignments] = useState<GradeSubjectTeacher[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [reportLoading, setReportLoading] = useState(false);
  const [filterError, setFilterError] = useState('');

  const [teacherId, setTeacherId] = useState('');
  const [name, setName] = useState('');
  const [gradeId, setGradeId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [subjectType, setSubjectType] = useState<'all' | 'compulsory' | 'optional'>('all');
  const [classTeacher, setClassTeacher] = useState<'all' | 'yes' | 'no'>('all');

  const [results, setResults] = useState<TeacherReportRow[]>([]);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [detailRow, setDetailRow] = useState<TeacherReportRow | null>(null);
  const [detailTeacher, setDetailTeacher] = useState<TeacherDetails | null>(null);
  const [detailLoadingRowId, setDetailLoadingRowId] = useState<number | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [gradesResponse, mappingsResponse, assignmentsResponse, studentsResponse] =
        await Promise.all([
          gradeApi.getAll(),
          gradeSubjectApi.getAll(),
          gradeSubjectTeacherApi.getAll(),
          studentApi.getAll(),
        ]);
      setGrades(gradesResponse.data);
      setMappings(mappingsResponse.data);
      setAssignments(assignmentsResponse.data);
      setStudents(studentsResponse.data);
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Failed to load report data');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const parsedGradeId = gradeId ? parseInt(gradeId, 10) : NaN;

  const subjectsForGrade = useMemo(() => {
    if (isNaN(parsedGradeId) || parsedGradeId <= 0) {
      const uniqueSubjects = new Map<number, string>();
      for (const mapping of mappings) {
        uniqueSubjects.set(mapping.subjectId, mapping.subjectName);
      }
      return Array.from(uniqueSubjects.entries())
        .map(([id, subjectName]) => ({ id, subjectName }))
        .sort((a, b) => a.subjectName.localeCompare(b.subjectName));
    }

    return mappings
      .filter((mapping) => mapping.gradeId === parsedGradeId)
      .map((mapping) => ({ id: mapping.subjectId, subjectName: mapping.subjectName }))
      .sort((a, b) => a.subjectName.localeCompare(b.subjectName));
  }, [mappings, parsedGradeId]);

  const buildFilters = (): TeacherReportFilters => {
    const parsedTeacherId = teacherId ? parseInt(teacherId, 10) : undefined;
    const parsedSubjectId = subjectId ? parseInt(subjectId, 10) : undefined;

    return {
      teacherId:
        parsedTeacherId && !isNaN(parsedTeacherId) && parsedTeacherId > 0
          ? parsedTeacherId
          : undefined,
      name: name.trim() || undefined,
      gradeId: !isNaN(parsedGradeId) && parsedGradeId > 0 ? parsedGradeId : undefined,
      subjectId:
        parsedSubjectId && !isNaN(parsedSubjectId) && parsedSubjectId > 0
          ? parsedSubjectId
          : undefined,
      subjectType,
      classTeacher,
    };
  };

  const handleGenerate = (e: FormEvent) => {
    e.preventDefault();
    const filters = buildFilters();

    if (!hasActiveTeacherReportFilters(filters)) {
      setFilterError('Set at least one filter before generating the report.');
      setResults([]);
      setHasGenerated(false);
      setShowDetailModal(false);
      setDetailRow(null);
      setDetailTeacher(null);
      return;
    }

    setFilterError('');
    setReportLoading(true);

    try {
      const filtered = buildTeacherReportRows(assignments, grades, students, filters);
      setResults(filtered);
      setHasGenerated(true);
      setShowDetailModal(false);
      setDetailRow(null);
      setDetailTeacher(null);
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Failed to generate report');
      setResults([]);
      setHasGenerated(true);
    } finally {
      setReportLoading(false);
    }
  };

  const handleClear = () => {
    setTeacherId('');
    setName('');
    setGradeId('');
    setSubjectId('');
    setSubjectType('all');
    setClassTeacher('all');
    setFilterError('');
    setResults([]);
    setHasGenerated(false);
    setShowDetailModal(false);
    setDetailRow(null);
    setDetailTeacher(null);
    setDetailLoadingRowId(null);
  };

  const handleViewReport = async (row: TeacherReportRow) => {
    setDetailLoadingRowId(row.rowId);
    setDetailRow(row);
    setShowDetailModal(true);
    setDetailTeacher(null);

    try {
      const response = await teacherApi.getDetails(row.teacherId);
      setDetailTeacher(response.data);

      const gradeStudents = students.filter((student) => student.gradeId === row.gradeId);
      setDetailRow({ ...row, students: gradeStudents });
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Failed to load teacher report');
      setShowDetailModal(false);
      setDetailRow(null);
    } finally {
      setDetailLoadingRowId(null);
    }
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setDetailRow(null);
    setDetailTeacher(null);
    setDetailLoadingRowId(null);
  };

  const isBusy = loading || reportLoading;

  return (
    <div className="page-content">
      <PageHeader
        badge="Reports"
        title="Teacher Report"
        description="Filter teachers by ID, name, grade, subject, subject type, or class teacher role."
        actions={
          <button type="button" className="btn btn--ghost" onClick={fetchData} disabled={loading}>
            Refresh data
          </button>
        }
      />

      <section className="card">
        <div className="card__header">
          <div>
            <h2 className="card__title">Filters</h2>
            <p className="card__subtitle">Combine one or more filters, then generate the report.</p>
          </div>
        </div>

        <form onSubmit={handleGenerate}>
          <div className="student-report-filters">
            <div className="form-group">
              <label htmlFor="reportTeacherId" className="form-label">
                ID
              </label>
              <input
                id="reportTeacherId"
                type="number"
                min={1}
                className="form-input"
                placeholder="Teacher ID"
                value={teacherId}
                onChange={(e) => {
                  setTeacherId(e.target.value);
                  if (filterError) setFilterError('');
                }}
                disabled={isBusy}
              />
            </div>

            <div className="form-group">
              <label htmlFor="reportTeacherName" className="form-label">
                Name
              </label>
              <input
                id="reportTeacherName"
                type="text"
                className="form-input"
                placeholder="Search by name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (filterError) setFilterError('');
                }}
                disabled={isBusy}
              />
            </div>

            <div className="form-group">
              <label htmlFor="reportTeacherGrade" className="form-label">
                Grade
              </label>
              <select
                id="reportTeacherGrade"
                className="form-input"
                value={gradeId}
                onChange={(e) => {
                  setGradeId(e.target.value);
                  setSubjectId('');
                  if (filterError) setFilterError('');
                }}
                disabled={isBusy || grades.length === 0}
              >
                <option value="">All grades</option>
                {grades.map((grade) => (
                  <option key={grade.id} value={grade.id}>
                    {grade.className}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="reportTeacherSubject" className="form-label">
                Subject
              </label>
              <select
                id="reportTeacherSubject"
                className="form-input"
                value={subjectId}
                onChange={(e) => {
                  setSubjectId(e.target.value);
                  if (filterError) setFilterError('');
                }}
                disabled={isBusy || subjectsForGrade.length === 0}
              >
                <option value="">All subjects</option>
                {subjectsForGrade.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.subjectName}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="reportTeacherSubjectType" className="form-label">
                Subject Type
              </label>
              <select
                id="reportTeacherSubjectType"
                className="form-input"
                value={subjectType}
                onChange={(e) => {
                  setSubjectType(e.target.value as 'all' | 'compulsory' | 'optional');
                  if (filterError) setFilterError('');
                }}
                disabled={isBusy}
              >
                <option value="all">All types</option>
                <option value="compulsory">Compulsory</option>
                <option value="optional">Optional</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="reportClassTeacher" className="form-label">
                Class Teacher
              </label>
              <select
                id="reportClassTeacher"
                className="form-input"
                value={classTeacher}
                onChange={(e) => {
                  setClassTeacher(e.target.value as 'all' | 'yes' | 'no');
                  if (filterError) setFilterError('');
                }}
                disabled={isBusy}
              >
                <option value="all">All</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>
          </div>

          {filterError && <span className="form-error">{filterError}</span>}

          <div className="student-report-filters__actions">
            <button
              type="submit"
              className={`btn btn--primary ${reportLoading ? 'btn--loading' : ''}`}
              disabled={isBusy}
            >
              {reportLoading ? (
                <>
                  <span className="spinner spinner--sm" />
                  Generating...
                </>
              ) : (
                'Generate Report'
              )}
            </button>
            <button
              type="button"
              className="btn btn--ghost"
              onClick={handleClear}
              disabled={isBusy}
            >
              Clear Filters
            </button>
          </div>
        </form>
      </section>

      {hasGenerated && (
        <section className="card">
          <div className="card__header">
            <div>
              <h2 className="card__title">Report Results</h2>
              <p className="card__subtitle">
                {results.length === 0
                  ? 'No teacher assignments matched your filters.'
                  : `${results.length} assignment${results.length === 1 ? '' : 's'} found.`}
              </p>
            </div>
          </div>

          {results.length > 0 && (
            <div className="table-wrapper">
              <table className="grade-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Grade</th>
                    <th>Subject</th>
                    <th>Subject Type</th>
                    <th>Class Teacher</th>
                    <th>Report</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((row) => (
                    <tr key={row.rowId}>
                      <td>
                        <span className="grade-id">#{row.teacherId}</span>
                      </td>
                      <td>{row.teacherName}</td>
                      <td>{row.gradeName}</td>
                      <td>{row.subjectName}</td>
                      <td>
                        <span
                          className={`teacher-tag ${row.isOptional ? 'teacher-tag--optional' : 'teacher-tag--compulsory'}`}
                        >
                          {getSubjectTypeLabel(row.isOptional)}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`teacher-tag ${row.isClassTeacher ? 'teacher-tag--compulsory' : ''}`}
                        >
                          {row.isClassTeacher ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          className={`btn btn--ghost student-report-view-btn ${detailLoadingRowId === row.rowId ? 'btn--loading' : ''}`}
                          onClick={() => handleViewReport(row)}
                          disabled={detailLoadingRowId !== null}
                        >
                          {detailLoadingRowId === row.rowId ? (
                            <>
                              <span className="spinner spinner--sm" />
                              Loading...
                            </>
                          ) : (
                            'View Report'
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      <FormModal
        open={showDetailModal}
        title="Teacher Report"
        subtitle={
          detailTeacher && detailRow
            ? `Report for ${detailTeacher.name} — ${detailRow.gradeName} / ${detailRow.subjectName}`
            : detailRow
              ? `Loading report for ${detailRow.teacherName}...`
              : 'Teacher report'
        }
        onClose={closeDetailModal}
      >
        {detailLoadingRowId && !detailTeacher ? (
          <div className="table-loading">
            <div className="spinner" />
            <p>Loading teacher report...</p>
          </div>
        ) : detailTeacher && detailRow ? (
          <TeacherAssignmentReportCard teacher={detailTeacher} row={detailRow} />
        ) : null}
      </FormModal>
    </div>
  );
}
