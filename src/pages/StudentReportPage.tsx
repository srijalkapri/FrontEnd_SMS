import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { gradeApi } from '../api/gradeApi';
import { gradeSubjectApi } from '../api/gradeSubjectApi';
import { studentApi } from '../api/studentApi';
import { PageHeader } from '../components/layout/PageHeader';
import { StudentDetailsCard } from '../components/reports/StudentDetailsCard';
import { FormModal } from '../components/ui/FormModal';
import { useToast } from '../context/ToastContext';
import type { Grade } from '../types/grade';
import type { GradeSubject } from '../types/gradeSubject';
import type { Student } from '../types/student';
import {
  filterStudentsForReport,
  hasActiveStudentReportFilters,
  type StudentReportFilters,
} from '../utils/studentReportFilters';
import type { SubjectTypeFilter } from '../utils/subjectType';
import { downloadStudentReportCsv } from '../utils/studentReportExport';
import '../components/SearchGrade.css';
import '../components/SearchGradeSubject.css';
import './StudentReportPage.css';

export function StudentReportPage() {
  const { showToast } = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [mappings, setMappings] = useState<GradeSubject[]>([]);
  const [loading, setLoading] = useState(true);
  const [reportLoading, setReportLoading] = useState(false);
  const [filterError, setFilterError] = useState('');

  const [studentId, setStudentId] = useState('');
  const [name, setName] = useState('');
  const [gradeId, setGradeId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [subjectType, setSubjectType] = useState<'all' | 'compulsory' | 'optional'>('all');

  const [results, setResults] = useState<Student[]>([]);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [detailStudent, setDetailStudent] = useState<Student | null>(null);
  const [detailLoadingId, setDetailLoadingId] = useState<number | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [studentsResponse, gradesResponse, mappingsResponse] = await Promise.all([
        studentApi.getAll(),
        gradeApi.getAll(),
        gradeSubjectApi.getAll(),
      ]);
      setStudents(studentsResponse.data);
      setGrades(gradesResponse.data);
      setMappings(mappingsResponse.data);
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

  const buildFilters = (): StudentReportFilters => {
    const parsedId = studentId ? parseInt(studentId, 10) : undefined;
    const parsedSubjectId = subjectId ? parseInt(subjectId, 10) : undefined;

    return {
      id: parsedId && !isNaN(parsedId) && parsedId > 0 ? parsedId : undefined,
      name: name.trim() || undefined,
      gradeId: !isNaN(parsedGradeId) && parsedGradeId > 0 ? parsedGradeId : undefined,
      subjectId:
        parsedSubjectId && !isNaN(parsedSubjectId) && parsedSubjectId > 0
          ? parsedSubjectId
          : undefined,
      subjectType: subjectType as SubjectTypeFilter,
    };
  };

  const handleGenerate = async (e: FormEvent) => {
    e.preventDefault();
    const filters = buildFilters();

    if (!hasActiveStudentReportFilters(filters)) {
      setFilterError('Set at least one filter before generating the report.');
      setResults([]);
      setHasGenerated(false);
      setShowDetailModal(false);
      setDetailStudent(null);
      return;
    }

    setFilterError('');
    setReportLoading(true);

    try {
      let sourceStudents = students;

      if (filters.id) {
        const response = await studentApi.getById(filters.id);
        sourceStudents = [response.data];
      }

      const filtered = filterStudentsForReport(sourceStudents, filters);
      setResults(filtered);
      setHasGenerated(true);
      setShowDetailModal(false);
      setDetailStudent(null);
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Failed to generate report');
      setResults([]);
      setHasGenerated(true);
    } finally {
      setReportLoading(false);
    }
  };

  const handleClear = () => {
    setStudentId('');
    setName('');
    setGradeId('');
    setSubjectId('');
    setSubjectType('all');
    setFilterError('');
    setResults([]);
    setHasGenerated(false);
    setShowDetailModal(false);
    setDetailStudent(null);
    setDetailLoadingId(null);
  };

  const handleViewStudentReport = async (student: Student) => {
    setDetailLoadingId(student.id);
    setShowDetailModal(true);
    setDetailStudent(null);

    try {
      const response = await studentApi.getById(student.id);
      setDetailStudent(response.data);
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Failed to load student report');
      setShowDetailModal(false);
    } finally {
      setDetailLoadingId(null);
    }
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setDetailStudent(null);
    setDetailLoadingId(null);
  };

  const handleDownload = () => {
    if (!hasGenerated || results.length === 0) {
      return;
    }

    downloadStudentReportCsv(results);
    showToast('success', 'Report downloaded.');
  };

  const isBusy = loading || reportLoading;

  return (
    <div className="page-content">
      <PageHeader
        badge="Reports"
        title="Student Report"
        description="Filter students by ID, name, grade, subject, or subject type and generate a report."
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
              <label htmlFor="reportStudentId" className="form-label">
                ID
              </label>
              <input
                id="reportStudentId"
                type="number"
                min={1}
                className="form-input"
                placeholder="Student ID"
                value={studentId}
                onChange={(e) => {
                  setStudentId(e.target.value);
                  if (filterError) setFilterError('');
                }}
                disabled={isBusy}
              />
            </div>

            <div className="form-group">
              <label htmlFor="reportStudentName" className="form-label">
                Name
              </label>
              <input
                id="reportStudentName"
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
              <label htmlFor="reportStudentGrade" className="form-label">
                Grade
              </label>
              <select
                id="reportStudentGrade"
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
              <label htmlFor="reportStudentSubject" className="form-label">
                Subject
              </label>
              <select
                id="reportStudentSubject"
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
              <label htmlFor="reportSubjectType" className="form-label">
                Subject Type
              </label>
              <select
                id="reportSubjectType"
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
          <div className="card__header student-report-results__header">
            <div>
              <h2 className="card__title">Report Results</h2>
              <p className="card__subtitle">
                {results.length === 0
                  ? 'No students matched your filters.'
                  : `${results.length} student${results.length === 1 ? '' : 's'} found.`}
              </p>
            </div>
            {results.length > 0 && (
              <button
                type="button"
                className="btn btn--secondary"
                onClick={handleDownload}
                disabled={reportLoading}
              >
                Download Report
              </button>
            )}
          </div>

          {results.length > 0 && (
            <div className="table-wrapper">
              <table className="grade-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Grade</th>
                    <th>Phone</th>
                    <th>Email</th>
                    <th>Subjects</th>
                    <th>Report</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((student) => (
                    <tr key={student.id}>
                      <td>
                        <span className="grade-id">#{student.id}</span>
                      </td>
                      <td>{student.name}</td>
                      <td>{student.gradeName}</td>
                      <td>{student.phoneNo}</td>
                      <td>
                        <a className="contact-link" href={`mailto:${student.email}`}>
                          {student.email}
                        </a>
                      </td>
                      <td>{student.subjects.length}</td>
                      <td>
                        <button
                          type="button"
                          className={`btn btn--ghost student-report-view-btn ${detailLoadingId === student.id ? 'btn--loading' : ''}`}
                          onClick={() => handleViewStudentReport(student)}
                          disabled={detailLoadingId !== null}
                        >
                          {detailLoadingId === student.id ? (
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
        title="Student Report"
        subtitle={
          detailStudent
            ? `Report for ${detailStudent.name} (#${detailStudent.id})`
            : detailLoadingId
              ? `Loading report for student #${detailLoadingId}...`
              : 'Student report'
        }
        onClose={closeDetailModal}
      >
        {detailLoadingId && !detailStudent ? (
          <div className="table-loading">
            <div className="spinner" />
            <p>Loading student report...</p>
          </div>
        ) : detailStudent ? (
          <StudentDetailsCard student={detailStudent} />
        ) : null}
      </FormModal>
    </div>
  );
}
