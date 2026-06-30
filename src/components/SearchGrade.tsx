import { FormEvent, useState } from 'react';
import type { Grade } from '../types/grade';
import './SearchGrade.css';

interface SearchGradeProps {
  grades: Grade[];
  onSearch: (id: number) => Promise<Grade | null>;
  loading: boolean;
  embedded?: boolean;
}

export function SearchGrade({ grades, onSearch, loading, embedded = false }: SearchGradeProps) {
  const [gradeId, setGradeId] = useState('');
  const [result, setResult] = useState<Grade | null>(null);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const id = parseInt(gradeId, 10);

    if (isNaN(id) || id <= 0) {
      setError('Please select a grade.');
      setResult(null);
      setSearched(false);
      return;
    }

    setError('');
    setSearched(true);
    const grade = await onSearch(id);
    setResult(grade);
  };

  const selectedName = grades.find((g) => g.id === parseInt(gradeId, 10))?.className;

  const searchForm = (
    <form className={embedded ? 'embedded-form' : 'search-grade-form'} onSubmit={handleSubmit}>
      <div className={embedded ? 'form-group' : 'search-grade-form__row'}>
        <div className={embedded ? undefined : 'form-group search-grade-form__input'}>
          <label htmlFor={embedded ? 'gradeIdModal' : 'gradeId'} className="form-label">
            Grade
          </label>
          <select
            id={embedded ? 'gradeIdModal' : 'gradeId'}
            className={`form-input ${error ? 'form-input--error' : ''}`}
            value={gradeId}
            onChange={(e) => {
              setGradeId(e.target.value);
              if (error) setError('');
              setSearched(false);
            }}
            disabled={loading || grades.length === 0}
          >
            <option value="">Select a grade...</option>
            {grades.map((grade) => (
              <option key={grade.id} value={grade.id}>
                {grade.className}
              </option>
            ))}
          </select>
          {error && <span className="form-error">{error}</span>}
          {grades.length === 0 && (
            <span className="form-error">No grades available.</span>
          )}
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
              'Fetch Grade'
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
        <div className="search-result__card">
          <div className="search-result__badge">Found</div>
          <div className="search-result__details">
            <div className="search-result__field">
              <span className="search-result__label">ID</span>
              <span className="grade-id">#{result.id}</span>
            </div>
            <div className="search-result__field">
              <span className="search-result__label">Class Name</span>
              <span className="search-result__value">{result.className}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="search-result__empty">
          No grade found{selectedName ? ` for ${selectedName}` : ''}.
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
          <h2 className="card__title">Find Grade</h2>
          <p className="card__subtitle">Look up a specific grade</p>
        </div>
      </div>
      {searchForm}
      {resultBlock}
    </section>
  );
}
