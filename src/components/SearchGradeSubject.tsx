import { FormEvent, useState } from 'react';
import type { Grade } from '../types/grade';
import type { GradeSubject } from '../types/gradeSubject';
import { getSubjectTypeLabel } from '../utils/subjectType';
import './SearchGrade.css';
import './SearchGradeSubject.css';

interface SearchGradeSubjectProps {
  items: GradeSubject[];
  grades?: Grade[];
  onSearch: (id: number) => Promise<GradeSubject | null>;
  loading: boolean;
  embedded?: boolean;
}

export function SearchGradeSubject({
  items,
  grades: gradesProp,
  onSearch,
  loading,
  embedded = false,
}: SearchGradeSubjectProps) {
  const [gradeId, setGradeId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [result, setResult] = useState<GradeSubject | null>(null);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');

  const gradesFromMappings = Array.from(
    new Map(
      items.map((item) => [item.gradeId, { id: item.gradeId, name: item.gradeName }]),
    ).values(),
  ).sort((a, b) => a.name.localeCompare(b.name));

  const grades = gradesProp
    ? gradesProp
        .map((grade) => ({ id: grade.id, name: grade.className }))
        .sort((a, b) => a.name.localeCompare(b.name))
    : gradesFromMappings;

  const parsedGradeId = parseInt(gradeId, 10);
  const subjectsForGrade = items.filter(
    (item) => !isNaN(parsedGradeId) && item.gradeId === parsedGradeId,
  );

  const selected = items.find(
    (item) =>
      item.gradeId === parsedGradeId && item.subjectId === parseInt(subjectId, 10),
  );

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!selected) {
      setError('Please select a grade and grade subject.');
      setResult(null);
      setSearched(false);
      return;
    }

    setError('');
    setSearched(true);
    const item = await onSearch(selected.id);
    setResult(item);
  };

  const searchForm = (
    <form
      className={embedded ? 'embedded-form' : 'search-grade-subject-form'}
      onSubmit={handleSubmit}
    >
      <div className={embedded ? undefined : 'search-grade-subject-form__row'}>
        <div className={embedded ? 'form-group' : 'form-group search-grade-subject-form__input'}>
          <label htmlFor={embedded ? 'searchGradeIdModal' : 'searchGradeId'} className="form-label">
            Grade
          </label>
          <select
            id={embedded ? 'searchGradeIdModal' : 'searchGradeId'}
            className={`form-input ${error && !gradeId ? 'form-input--error' : ''}`}
            value={gradeId}
            onChange={(e) => {
              setGradeId(e.target.value);
              setSubjectId('');
              if (error) setError('');
              setSearched(false);
            }}
            disabled={loading || grades.length === 0}
          >
            <option value="">Select a grade...</option>
            {grades.map((grade) => (
              <option key={grade.id} value={grade.id}>
                {grade.name}
              </option>
            ))}
          </select>
          {grades.length === 0 && (
            <span className="form-error">No grades available.</span>
          )}
        </div>

        <div className={embedded ? 'form-group' : 'form-group search-grade-subject-form__input'}>
          <label
            htmlFor={embedded ? 'searchSubjectIdModal' : 'searchSubjectId'}
            className="form-label"
          >
            Grade Subject
          </label>
          <select
            id={embedded ? 'searchSubjectIdModal' : 'searchSubjectId'}
            className={`form-input ${error && gradeId && !subjectId ? 'form-input--error' : ''}`}
            value={subjectId}
            onChange={(e) => {
              setSubjectId(e.target.value);
              if (error) setError('');
              setSearched(false);
            }}
            disabled={loading || !gradeId || subjectsForGrade.length === 0}
          >
            <option value="">Select a subject...</option>
            {subjectsForGrade.map((item) => (
              <option key={item.id} value={item.subjectId}>
                {item.subjectName}
              </option>
            ))}
          </select>
          {gradeId && subjectsForGrade.length === 0 && (
            <span className="form-error">No subjects mapped to this grade.</span>
          )}
          {error && <span className="form-error">{error}</span>}
        </div>
        {!embedded && (
          <button
            type="submit"
            className={`btn btn--secondary ${loading ? 'btn--loading' : ''}`}
            disabled={loading || grades.length === 0}
          >
            {loading ? (
              <>
                <span className="spinner spinner--sm" />
                Searching...
              </>
            ) : (
              'Fetch Mapping'
            )}
          </button>
        )}
      </div>
      {embedded && (
        <div className="embedded-form__actions">
          <button
            type="submit"
            className={`btn btn--primary ${loading ? 'btn--loading' : ''}`}
            disabled={loading || grades.length === 0}
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
        <div className="search-result__card search-result__card--stacked">
          <div className="search-result__badge">Found</div>
          <div className="search-result__details search-result__details--grid">
            <div className="search-result__field">
              <span className="search-result__label">ID</span>
              <span className="grade-id">#{result.id}</span>
            </div>
            <div className="search-result__field">
              <span className="search-result__label">Grade</span>
              <span className="search-result__value">{result.gradeName}</span>
            </div>
            <div className="search-result__field">
              <span className="search-result__label">Subject</span>
              <span className="search-result__value">{result.subjectName}</span>
            </div>
            <div className="search-result__field">
              <span className="search-result__label">Subject Type</span>
              <span
                className={`teacher-tag ${result.isOptional ? 'teacher-tag--optional' : 'teacher-tag--compulsory'}`}
              >
                {getSubjectTypeLabel(result.isOptional)}
              </span>
            </div>
            <div className="search-result__field search-result__field--full">
              <span className="search-result__label">Teachers</span>
              <div className="teacher-tags">
                {result.teachers.length > 0 ? (
                  result.teachers.map((teacher) => (
                    <span key={teacher.id} className="teacher-tag">
                      {teacher.name}
                    </span>
                  ))
                ) : (
                  <span className="search-result__muted">No teachers assigned</span>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="search-result__empty">
          No mapping found
          {selected ? ` for ${selected.gradeName} — ${selected.subjectName}` : ''}.
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
    <section className="card search-grade-subject-section">
      <div className="card__header">
        <div>
          <h2 className="card__title">Find Grade Subject</h2>
          <p className="card__subtitle">Look up a specific grade-subject mapping</p>
        </div>
      </div>
      {searchForm}
      {resultBlock}
    </section>
  );
}
