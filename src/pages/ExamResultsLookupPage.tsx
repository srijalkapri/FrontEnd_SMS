import { FormEvent, useCallback, useEffect, useState } from 'react';
import { examApi } from '../api/examApi';
import { gradeApi } from '../api/gradeApi';
import { studentApi } from '../api/studentApi';
import { PageHeader } from '../components/layout/PageHeader';
import { TableScrollWrapper } from '../components/ui/TableScrollWrapper';
import { useToast } from '../context/ToastContext';
import type { ExamSchedule } from '../types/exam';
import type {
  AdminScheduleMarks,
  AdminStudentMarksRecord,
  StudentExamResultSchedule,
  StudentExamResultSubject,
} from '../types/examResult';
import type { Grade } from '../types/grade';
import type { Student } from '../types/student';
import { formatMarks } from '../utils/examResultFormat';
import '../components/GradeTable.css';
import './ExamResultsPage.css';
import './ExamSchedulesPage.css';

type LookupMode = 'schedule' | 'student';

async function resolveStudentByName(name: string, gradeId?: number): Promise<Student> {
  const search = name.trim();
  if (!search) {
    throw new Error('Enter a student name.');
  }

  const query = { pageNumber: 1, pageSize: 25, search };
  const response =
    gradeId != null && gradeId > 0
      ? await studentApi.getByGradePaged(gradeId, query)
      : await studentApi.getPaged(query);

  const items = response.data.items;
  const normalized = search.toLowerCase();
  const exactMatches = items.filter((student) => student.name.toLowerCase() === normalized);
  if (exactMatches.length === 1) {
    return exactMatches[0];
  }

  const partialMatches = items.filter((student) => student.name.toLowerCase().includes(normalized));
  if (partialMatches.length === 1) {
    return partialMatches[0];
  }

  if (partialMatches.length > 1) {
    throw new Error('Multiple students match that name. Select a class or refine your search.');
  }

  throw new Error('No student found with that name.');
}

function SubjectMarksTable({ subjects }: { subjects: StudentExamResultSubject[] }) {
  return (
    <TableScrollWrapper>
      <table className="grade-table">
        <thead>
          <tr>
            <th>Subject</th>
            <th>Marks</th>
            <th>Absent</th>
            <th>Remarks</th>
          </tr>
        </thead>
        <tbody>
          {subjects.map((subject) => (
            <tr key={subject.subjectName}>
              <td>{subject.subjectName}</td>
              <td>{formatMarks(subject.marksObtained, subject.totalMarks, subject.isAbsent)}</td>
              <td>{subject.isAbsent ? 'Yes' : 'No'}</td>
              <td>{subject.remarks || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </TableScrollWrapper>
  );
}

function ScheduleResultsView({ data }: { data: AdminScheduleMarks }) {
  if (data.students.length === 0) {
    return (
      <div className="table-empty">
        <p>No approved results for this exam schedule yet.</p>
      </div>
    );
  }

  return (
    <div className="exam-results-lookup__results">
      <div className="exam-result-meta exam-results-lookup__overview">
        <div className="exam-result-meta__item">
          <span className="exam-result-meta__label">Exam</span>
          <span className="exam-result-meta__value">{data.examTitle}</span>
        </div>
        <div className="exam-result-meta__item">
          <span className="exam-result-meta__label">Grade</span>
          <span className="exam-result-meta__value">{data.gradeName}</span>
        </div>
        <div className="exam-result-meta__item">
          <span className="exam-result-meta__label">Academic year</span>
          <span className="exam-result-meta__value">{data.academicYear || '—'}</span>
        </div>
        <div className="exam-result-meta__item">
          <span className="exam-result-meta__label">Students</span>
          <span className="exam-result-meta__value">{data.students.length}</span>
        </div>
      </div>

      {data.students.map((student) => (
        <article key={student.studentId} className="exam-results-lookup__student-block">
          <div className="exam-results-lookup__block-header">
            <p className="exam-results-lookup__block-title">{student.studentName}</p>
            <div className="exam-results-lookup__block-stats">
              <span className="exam-results-lookup__stat-pill">
                <span className="exam-results-lookup__stat-label">Score</span>
                <span className="exam-results-lookup__stat-value">
                  {student.totalObtained} / {student.totalMarks}
                </span>
              </span>
              <span className="exam-results-lookup__stat-pill">
                <span className="exam-results-lookup__stat-label">Percentage</span>
                <span className="exam-results-lookup__stat-value">
                  {student.percentage.toFixed(2)}%
                </span>
              </span>
            </div>
          </div>
          <div className="exam-results-lookup__block-body">
            <SubjectMarksTable subjects={student.subjects} />
          </div>
        </article>
      ))}
    </div>
  );
}

function StudentScheduleCard({ schedule }: { schedule: StudentExamResultSchedule }) {
  return (
    <article className="exam-results-lookup__exam-block">
      <div className="exam-results-lookup__block-header">
        <p className="exam-results-lookup__block-title">{schedule.examTitle}</p>
        <div className="exam-results-lookup__block-stats">
          <span className="exam-results-lookup__stat-pill">
            <span className="exam-results-lookup__stat-label">Year</span>
            <span className="exam-results-lookup__stat-value">{schedule.academicYear || '—'}</span>
          </span>
          <span className="exam-results-lookup__stat-pill">
            <span className="exam-results-lookup__stat-label">Score</span>
            <span className="exam-results-lookup__stat-value">
              {schedule.totalObtained} / {schedule.totalMarks}
            </span>
          </span>
          <span className="exam-results-lookup__stat-pill">
            <span className="exam-results-lookup__stat-label">Percentage</span>
            <span className="exam-results-lookup__stat-value">
              {schedule.percentage.toFixed(2)}%
            </span>
          </span>
        </div>
      </div>
      <div className="exam-results-lookup__block-body">
        <SubjectMarksTable subjects={schedule.subjects} />
      </div>
    </article>
  );
}

function StudentResultsView({ data }: { data: AdminStudentMarksRecord }) {
  if (data.results.length === 0) {
    return (
      <div className="table-empty">
        <p>No approved results for this student yet.</p>
      </div>
    );
  }

  return (
    <div className="exam-results-lookup__results">
      <div className="exam-result-meta exam-result-meta--compact exam-results-lookup__overview">
        <div className="exam-result-meta__item">
          <span className="exam-result-meta__label">Student</span>
          <span className="exam-result-meta__value">{data.studentName}</span>
        </div>
        <div className="exam-result-meta__item">
          <span className="exam-result-meta__label">Grade</span>
          <span className="exam-result-meta__value">{data.gradeName}</span>
        </div>
        <div className="exam-result-meta__item">
          <span className="exam-result-meta__label">Exams</span>
          <span className="exam-result-meta__value">{data.results.length}</span>
        </div>
      </div>

      {data.results.map((schedule) => (
        <StudentScheduleCard key={schedule.examScheduleId} schedule={schedule} />
      ))}
    </div>
  );
}

export function ExamResultsLookupPage() {
  const { showToast } = useToast();
  const [mode, setMode] = useState<LookupMode>('schedule');

  const [schedules, setSchedules] = useState<ExamSchedule[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [optionsLoading, setOptionsLoading] = useState(true);

  const [gradeFilter, setGradeFilter] = useState('');
  const [scheduleId, setScheduleId] = useState('');
  const [studentNameQuery, setStudentNameQuery] = useState('');
  const [studentScheduleFilter, setStudentScheduleFilter] = useState('');

  const [scheduleResults, setScheduleResults] = useState<AdminScheduleMarks | null>(null);
  const [studentResults, setStudentResults] = useState<AdminStudentMarksRecord | null>(null);
  const [resultsLoading, setResultsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const parsedGradeId = gradeFilter ? parseInt(gradeFilter, 10) : NaN;

  const fetchOptions = useCallback(async () => {
    setOptionsLoading(true);
    try {
      const [schedulesResponse, gradesResponse] = await Promise.all([
        examApi.getAllSchedules(),
        gradeApi.getAll(),
      ]);
      setSchedules(schedulesResponse.data);
      setGrades(gradesResponse.data);
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Failed to load lookup options.');
    } finally {
      setOptionsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchOptions();
  }, [fetchOptions]);

  const filteredSchedules = schedules.filter((schedule) => {
    if (!isNaN(parsedGradeId) && parsedGradeId > 0) {
      return schedule.gradeId === parsedGradeId;
    }
    return true;
  });

  const resetFilters = () => {
    setGradeFilter('');
    setScheduleId('');
    setStudentNameQuery('');
    setStudentScheduleFilter('');
    setScheduleResults(null);
    setStudentResults(null);
    setHasSearched(false);
  };

  const handleModeChange = (nextMode: LookupMode) => {
    setMode(nextMode);
    resetFilters();
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setHasSearched(true);
    setScheduleResults(null);
    setStudentResults(null);
    setResultsLoading(true);

    try {
      if (mode === 'schedule') {
        const id = parseInt(scheduleId, 10);
        if (isNaN(id) || id <= 0) {
          showToast('error', 'Select an exam schedule.');
          setHasSearched(false);
          return;
        }
        const response = await examApi.getResultsBySchedule(id);
        setScheduleResults(response.data);
      } else {
        const name = studentNameQuery.trim();
        if (!name) {
          showToast('error', 'Enter a student name.');
          setHasSearched(false);
          return;
        }

        const student = await resolveStudentByName(
          name,
          !isNaN(parsedGradeId) && parsedGradeId > 0 ? parsedGradeId : undefined,
        );

        const scheduleFilterId = studentScheduleFilter
          ? parseInt(studentScheduleFilter, 10)
          : undefined;
        const response = await examApi.getResultsByStudent(
          student.id,
          scheduleFilterId && scheduleFilterId > 0 ? scheduleFilterId : undefined,
        );
        setStudentResults(response.data);
      }
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Failed to load exam results.');
    } finally {
      setResultsLoading(false);
    }
  };

  return (
    <div className="page-content exam-page">
      <PageHeader
        badge="Exam Results"
        title="Published Results"
        description="View approved exam marks by schedule or by student."
        actions={
          <button
            type="button"
            className="btn btn--ghost"
            onClick={fetchOptions}
            disabled={optionsLoading}
          >
            Refresh lists
          </button>
        }
      />

      <section className="card exam-results-lookup__filters-card">
        <div className="card__header">
          <div>
            <h2 className="card__title">Find results</h2>
            <p className="card__subtitle">
              {mode === 'schedule'
                ? 'Choose an exam schedule to view all published marks.'
                : 'Search by student name to view published marks.'}
            </p>
          </div>
        </div>

        <div
          className="exam-results-lookup__mode"
          role="tablist"
          aria-label="Results lookup mode"
        >
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'schedule'}
            className={`exam-results-lookup__mode-btn${
              mode === 'schedule' ? ' exam-results-lookup__mode-btn--active' : ''
            }`}
            onClick={() => handleModeChange('schedule')}
          >
            By schedule
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'student'}
            className={`exam-results-lookup__mode-btn${
              mode === 'student' ? ' exam-results-lookup__mode-btn--active' : ''
            }`}
            onClick={() => handleModeChange('student')}
          >
            By student
          </button>
        </div>

        <form className="exam-results-lookup__form" onSubmit={handleSubmit}>
          <div
            className={`exam-results-lookup__filters${
              mode === 'student' ? ' exam-results-lookup__filters--student' : ''
            }`}
          >
            <div className="form-group">
              <label className="form-label" htmlFor="results-grade-filter">
                Class (optional)
              </label>
              <select
                id="results-grade-filter"
                className="form-input"
                value={gradeFilter}
                onChange={(event) => {
                  setGradeFilter(event.target.value);
                  setScheduleId('');
                  setStudentNameQuery('');
                  setStudentScheduleFilter('');
                  setScheduleResults(null);
                  setStudentResults(null);
                  setHasSearched(false);
                }}
                disabled={optionsLoading}
              >
                <option value="">All classes</option>
                {grades.map((grade) => (
                  <option key={grade.id} value={grade.id}>
                    {grade.className}
                  </option>
                ))}
              </select>
            </div>

            {mode === 'schedule' ? (
              <div className="form-group">
                <label className="form-label" htmlFor="results-schedule">
                  Exam schedule
                </label>
                <select
                  id="results-schedule"
                  className="form-input"
                  value={scheduleId}
                  onChange={(event) => setScheduleId(event.target.value)}
                  disabled={optionsLoading}
                  required
                >
                  <option value="">Select exam schedule…</option>
                  {filteredSchedules.map((schedule) => (
                    <option key={schedule.id} value={schedule.id}>
                      {schedule.title} ({schedule.academicYear || '—'})
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <>
                <div className="form-group">
                  <label className="form-label" htmlFor="results-student-name">
                    Student name
                  </label>
                  <div className="search-input exam-results-lookup__name-search">
                    <svg className="search-input__icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path
                        fillRule="evenodd"
                        d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <input
                      id="results-student-name"
                      type="search"
                      className="search-input__field"
                      placeholder="Search by student name…"
                      value={studentNameQuery}
                      onChange={(event) => setStudentNameQuery(event.target.value)}
                      disabled={optionsLoading}
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="results-student-schedule">
                    Exam schedule (optional)
                  </label>
                  <select
                    id="results-student-schedule"
                    className="form-input"
                    value={studentScheduleFilter}
                    onChange={(event) => setStudentScheduleFilter(event.target.value)}
                    disabled={optionsLoading}
                  >
                    <option value="">All exams</option>
                    {filteredSchedules.map((schedule) => (
                      <option key={schedule.id} value={schedule.id}>
                        {schedule.title} ({schedule.academicYear || '—'})
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}

            <div className="exam-results-lookup__actions">
              <button
                type="button"
                className="btn btn--ghost"
                onClick={resetFilters}
                disabled={resultsLoading || optionsLoading}
              >
                Clear
              </button>
              <button
                type="submit"
                className="btn btn--primary"
                disabled={resultsLoading || optionsLoading}
              >
                {resultsLoading ? 'Loading…' : 'View results'}
              </button>
            </div>
          </div>
        </form>
      </section>

      {resultsLoading ? (
        <section className="card grade-table-section">
          <div className="table-loading">
            <div className="spinner" />
            <p>Loading published results…</p>
          </div>
        </section>
      ) : hasSearched ? (
        <section className="card exam-results-lookup__results-panel">
          <div className="exam-results-lookup__results-header">
            <h2 className="exam-results-lookup__results-title">Results</h2>
            <p className="exam-results-lookup__results-subtitle">
              Approved marks for your selected {mode === 'schedule' ? 'exam schedule' : 'student'}.
            </p>
          </div>
          {mode === 'schedule' && scheduleResults && <ScheduleResultsView data={scheduleResults} />}
          {mode === 'student' && studentResults && <StudentResultsView data={studentResults} />}
        </section>
      ) : (
        <section className="card">
          <div className="exam-results-lookup__empty">
            <p className="exam-results-lookup__empty-title">No results loaded yet</p>
            <p className="exam-results-lookup__empty-text">
              {mode === 'schedule'
                ? 'Select an exam schedule and click View results.'
                : 'Enter a student name and click View results.'}
            </p>
          </div>
        </section>
      )}
    </div>
  );
}
