import { FormEvent, useState } from 'react';
import type { Subject } from '../types/subject';
import './SearchGrade.css';

interface SearchSubjectProps {
  subjects: Subject[];
  onSearch: (id: number) => Promise<Subject | null>;
  loading: boolean;
  embedded?: boolean;
}

export function SearchSubject({
  subjects,
  onSearch,
  loading,
  embedded = false,
}: SearchSubjectProps) {
  const [subjectId, setSubjectId] = useState('');
  const [result, setResult] = useState<Subject | null>(null);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const id = parseInt(subjectId, 10);

    if (isNaN(id) || id <= 0) {
      setError('Please select a subject.');
      setResult(null);
      setSearched(false);
      return;
    }

    setError('');
    setSearched(true);
    const subject = await onSearch(id);
    setResult(subject);
  };

  const selectedName = subjects.find((s) => s.id === parseInt(subjectId, 10))?.name;

  const searchForm = (
    <form className={embedded ? 'embedded-form' : 'search-grade-form'} onSubmit={handleSubmit}>
      <div className={embedded ? 'form-group' : 'search-grade-form__row'}>
        <div className={embedded ? undefined : 'form-group search-grade-form__input'}>
          <label htmlFor={embedded ? 'subjectIdModal' : 'subjectId'} className="form-label">
            Subject
          </label>
          <select
            id={embedded ? 'subjectIdModal' : 'subjectId'}
            className={`form-input ${error ? 'form-input--error' : ''}`}
            value={subjectId}
            onChange={(e) => {
              setSubjectId(e.target.value);
              if (error) setError('');
              setSearched(false);
            }}
            disabled={loading || subjects.length === 0}
          >
            <option value="">Select a subject...</option>
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name}
              </option>
            ))}
          </select>
          {error && <span className="form-error">{error}</span>}
          {subjects.length === 0 && (
            <span className="form-error">No subjects available.</span>
          )}
        </div>
        {!embedded && (
          <button
            type="submit"
            className={`btn btn--secondary ${loading ? 'btn--loading' : ''}`}
            disabled={loading || subjects.length === 0}
          >
            {loading ? (
              <>
                <span className="spinner spinner--sm" />
                Searching...
              </>
            ) : (
              'Fetch Subject'
            )}
          </button>
        )}
      </div>
      {embedded && (
        <div className="embedded-form__actions">
          <button
            type="submit"
            className={`btn btn--primary ${loading ? 'btn--loading' : ''}`}
            disabled={loading || subjects.length === 0}
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
              <span className="search-result__label">Subject Name</span>
              <span className="search-result__value">{result.name}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="search-result__empty">
          No subject found{selectedName ? ` for ${selectedName}` : ''}.
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
          <h2 className="card__title">Find Subject</h2>
          <p className="card__subtitle">Look up a specific subject</p>
        </div>
      </div>
      {searchForm}
      {resultBlock}
    </section>
  );
}
