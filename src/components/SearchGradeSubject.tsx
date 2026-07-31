import { FormEvent, useState } from 'react';
import type { Grade } from '../types/grade';
import type { GradeSubject } from '../types/gradeSubject';
import { getSubjectTypeLabel } from '../utils/subjectType';
import { SearchFoundPanel } from './ui/SearchFoundPanel';
import { TableScrollWrapper } from './ui/TableScrollWrapper';
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
  const [gradeResults, setGradeResults] = useState<GradeSubject[]>([]);
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
  const selectedGrade = grades.find((grade) => grade.id === parsedGradeId);
  const subjectsForGrade = items.filter(
    (item) => !isNaN(parsedGradeId) && item.gradeId === parsedGradeId,
  );

  const selected = items.find(
    (item) =>
      item.gradeId === parsedGradeId && item.subjectId === parseInt(subjectId, 10),
  );

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!gradeId || isNaN(parsedGradeId)) {
      setError('Please select a grade.');
      setResult(null);
      setGradeResults([]);
      setSearched(false);
      return;
    }

    setError('');
    setSearched(true);

    // Optional subject: return that single mapping.
    if (subjectId) {
      if (!selected) {
        setResult(null);
        setGradeResults([]);
        return;
      }
      const item = await onSearch(selected.id);
      setResult(item);
      setGradeResults([]);
      return;
    }

    // Grade only: list every subject mapped to that grade.
    setResult(null);
    setGradeResults(subjectsForGrade);
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
              setResult(null);
              setGradeResults([]);
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
            Grade subject <span className="form-label__optional">(optional)</span>
          </label>
          <select
            id={embedded ? 'searchSubjectIdModal' : 'searchSubjectId'}
            className="form-input"
            value={subjectId}
            onChange={(e) => {
              setSubjectId(e.target.value);
              if (error) setError('');
              setSearched(false);
              setResult(null);
              setGradeResults([]);
            }}
            disabled={loading || !gradeId || subjectsForGrade.length === 0}
          >
            <option value="">All subjects for this grade</option>
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

  const singleResultPanel = result ? (
    <SearchFoundPanel
      fields={[
        { label: 'Grade', value: result.gradeName },
        { label: 'Subject', value: result.subjectName },
        {
          label: 'Subject type',
          value: (
            <span
              className={`search-found-tag ${result.isOptional ? 'search-found-tag--warn' : 'search-found-tag--accent'}`}
            >
              {getSubjectTypeLabel(result.isOptional)}
            </span>
          ),
        },
        {
          label: 'Teachers',
          fullWidth: true,
          value:
            result.teachers.length > 0 ? (
              <span className="search-found-tags">
                {result.teachers.map((teacher) => (
                  <span key={teacher.id} className="search-found-tag">
                    {teacher.name}
                  </span>
                ))}
              </span>
            ) : (
              <span className="search-found__muted">No teachers assigned</span>
            ),
        },
      ]}
    />
  ) : null;

  const gradeListPanel =
    !subjectId && gradeResults.length > 0 ? (
      <SearchFoundPanel
        title="Search found"
        fields={[
          { label: 'Grade', value: selectedGrade?.name ?? gradeResults[0]?.gradeName ?? '—' },
          {
            label: 'Subjects',
            value: `${gradeResults.length} mapped subject${gradeResults.length === 1 ? '' : 's'}`,
          },
        ]}
      >
        <span className="search-found__extra-label">Subjects for this grade</span>
        <TableScrollWrapper>
          <table className="grade-table">
            <thead>
              <tr>
                <th>Subject</th>
                <th>Type</th>
                <th>Teachers</th>
              </tr>
            </thead>
            <tbody>
              {gradeResults.map((item) => (
                <tr key={item.id}>
                  <td>{item.subjectName}</td>
                  <td>
                    <span
                      className={`teacher-tag ${item.isOptional ? 'teacher-tag--optional' : 'teacher-tag--compulsory'}`}
                    >
                      {getSubjectTypeLabel(item.isOptional)}
                    </span>
                  </td>
                  <td>
                    {item.teachers.length > 0 ? (
                      <div className="teacher-tags">
                        {item.teachers.map((teacher) => (
                          <span key={teacher.id} className="teacher-tag">
                            {teacher.name}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="search-found__muted">No teachers assigned</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableScrollWrapper>
      </SearchFoundPanel>
    ) : null;

  const emptyPanel =
    searched &&
    !loading &&
    !result &&
    gradeResults.length === 0 ? (
      <SearchFoundPanel
        status="empty"
        emptyMessage={
          subjectId
            ? `No mapping found${selected ? ` for ${selected.gradeName} — ${selected.subjectName}` : ''}.`
            : `No subjects mapped${selectedGrade ? ` to ${selectedGrade.name}` : ' to this grade'}.`
        }
      />
    ) : null;

  const resultBlock = searched && !loading && (singleResultPanel || gradeListPanel || emptyPanel);

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
          <p className="card__subtitle">
            Select a grade to list subjects, or pick a subject for one mapping
          </p>
        </div>
      </div>
      {searchForm}
      {resultBlock}
    </section>
  );
}
