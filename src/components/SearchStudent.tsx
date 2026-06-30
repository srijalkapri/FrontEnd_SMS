import { FormEvent, useEffect, useState } from 'react';
import { StudentDetailsCard } from './reports/StudentDetailsCard';
import type { Student } from '../types/student';
import './SearchGrade.css';
import './SearchGradeSubject.css';

interface SearchStudentProps {
  students: Student[];
  onSearch: (id: number) => Promise<Student | null>;
  loading: boolean;
  prefillId?: number | null;
  initialResult?: Student | null;
  embedded?: boolean;
}

export function SearchStudent({
  students,
  onSearch,
  loading,
  prefillId,
  initialResult = null,
  embedded = false,
}: SearchStudentProps) {
  const [gradeId, setGradeId] = useState('');
  const [studentId, setStudentId] = useState('');
  const [result, setResult] = useState<Student | null>(null);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');

  const grades = Array.from(
    new Map(
      students.map((student) => [student.gradeId, { id: student.gradeId, name: student.gradeName }]),
    ).values(),
  ).sort((a, b) => a.name.localeCompare(b.name));

  const parsedGradeId = parseInt(gradeId, 10);
  const studentsForGrade = students.filter(
    (student) => !isNaN(parsedGradeId) && student.gradeId === parsedGradeId,
  );

  const selectedStudent = students.find((student) => student.id === parseInt(studentId, 10));

  useEffect(() => {
    if (!prefillId) return;

    const prefillStudent =
      initialResult?.id === prefillId
        ? initialResult
        : students.find((student) => student.id === prefillId);

    setGradeId(prefillStudent ? String(prefillStudent.gradeId) : '');
    setStudentId(String(prefillId));
    setError('');
    setSearched(true);
    setResult(initialResult?.id === prefillId ? initialResult : null);
  }, [prefillId, initialResult, students]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const id = parseInt(studentId, 10);

    if (!selectedStudent || isNaN(id) || id <= 0) {
      setError('Please select a grade and student.');
      setResult(null);
      setSearched(false);
      return;
    }

    setError('');
    setSearched(true);
    const student = await onSearch(id);
    setResult(student);
  };

  const searchForm = (
    <form className={embedded ? 'embedded-form' : 'search-grade-form'} onSubmit={handleSubmit}>
      <div className={embedded ? undefined : 'search-grade-form__row'}>
        <div className={embedded ? 'form-group' : 'form-group search-grade-form__input'}>
          <label htmlFor={embedded ? 'searchStudentGradeIdModal' : 'searchStudentGradeId'} className="form-label">
            Grade
          </label>
          <select
            id={embedded ? 'searchStudentGradeIdModal' : 'searchStudentGradeId'}
            className={`form-input ${error && !gradeId ? 'form-input--error' : ''}`}
            value={gradeId}
            onChange={(e) => {
              setGradeId(e.target.value);
              setStudentId('');
              if (error) setError('');
              setSearched(false);
            }}
            disabled={loading || students.length === 0}
          >
            <option value="">Select a grade...</option>
            {grades.map((grade) => (
              <option key={grade.id} value={grade.id}>
                {grade.name}
              </option>
            ))}
          </select>
          {students.length === 0 && (
            <span className="form-error">No students available.</span>
          )}
        </div>

        <div className={embedded ? 'form-group' : 'form-group search-grade-form__input'}>
          <label htmlFor={embedded ? 'studentIdModal' : 'studentId'} className="form-label">
            Student
          </label>
          <select
            id={embedded ? 'studentIdModal' : 'studentId'}
            className={`form-input ${error && gradeId && !studentId ? 'form-input--error' : ''}`}
            value={studentId}
            onChange={(e) => {
              setStudentId(e.target.value);
              if (error) setError('');
              setSearched(false);
            }}
            disabled={loading || !gradeId || studentsForGrade.length === 0}
          >
            <option value="">Select a student...</option>
            {studentsForGrade.map((student) => (
              <option key={student.id} value={student.id}>
                {student.name}
              </option>
            ))}
          </select>
          {error && <span className="form-error">{error}</span>}
        </div>
        {!embedded && (
          <button
            type="submit"
            className={`btn btn--secondary ${loading ? 'btn--loading' : ''}`}
            disabled={loading || students.length === 0}
          >
            {loading ? (
              <>
                <span className="spinner spinner--sm" />
                Searching...
              </>
            ) : (
              'Fetch Student'
            )}
          </button>
        )}
      </div>
      {embedded && (
        <div className="embedded-form__actions">
          <button
            type="submit"
            className={`btn btn--primary ${loading ? 'btn--loading' : ''}`}
            disabled={loading || students.length === 0}
          >
            {loading ? (
              <>
                <span className="spinner spinner--sm" />
                Searching...
              </>
            ) : (
              'Search'
            )}
          </button>
        </div>
      )}
    </form>
  );

  const resultBlock = searched && !loading && (
    <div className="search-result">
      {result ? (
        <StudentDetailsCard student={result} />
      ) : (
        <div className="search-result__empty">
          No student found{selectedStudent ? ` for ${selectedStudent.name}` : ''}.
        </div>
      )}
    </div>
  );

  if (embedded) {
    return (
      <>
        {searchForm}
        {resultBlock}
      </>
    );
  }

  return (
    <section className="card search-grade-section">
      <div className="card__header">
        <div>
          <h2 className="card__title">Find Student</h2>
          <p className="card__subtitle">Look up a student with subjects and teachers</p>
        </div>
      </div>
      {searchForm}
      {resultBlock}
    </section>
  );
}
