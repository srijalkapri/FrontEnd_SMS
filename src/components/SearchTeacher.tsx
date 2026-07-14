import { FormEvent, useEffect, useState } from 'react';
import type { Teacher, TeacherDetails } from '../types/teacher';
import { getSubjectTypeLabel } from '../utils/subjectType';
import './SearchGrade.css';
import { TableScrollWrapper } from './ui/TableScrollWrapper';
import './SearchGradeSubject.css';

interface SearchTeacherProps {
  teachers: Teacher[];
  onSearch: (id: number) => Promise<Teacher | null>;
  onSearchDetails: (id: number) => Promise<TeacherDetails | null>;
  loading: boolean;
  detailsLoading: boolean;
  prefillId?: number | null;
  initialDetails?: TeacherDetails | null;
  embedded?: boolean;
}

export function SearchTeacher({
  teachers,
  onSearch,
  onSearchDetails,
  loading,
  detailsLoading,
  prefillId,
  initialDetails = null,
  embedded = false,
}: SearchTeacherProps) {
  const [teacherId, setTeacherId] = useState('');
  const [basicResult, setBasicResult] = useState<Teacher | null>(null);
  const [detailsResult, setDetailsResult] = useState<TeacherDetails | null>(null);
  const [searchedBasic, setSearchedBasic] = useState(false);
  const [searchedDetails, setSearchedDetails] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!prefillId) return;

    setTeacherId(String(prefillId));
    setError('');
    setSearchedBasic(false);
    setBasicResult(null);
    setSearchedDetails(true);
    setDetailsResult(initialDetails?.id === prefillId ? initialDetails : null);
  }, [prefillId, initialDetails]);

  const parseId = (): number | null => {
    const id = parseInt(teacherId, 10);
    if (isNaN(id) || id <= 0) {
      setError('Please select a teacher.');
      setBasicResult(null);
      setDetailsResult(null);
      setSearchedBasic(false);
      setSearchedDetails(false);
      return null;
    }
    setError('');
    return id;
  };

  const handleBasicSearch = async (e: FormEvent) => {
    e.preventDefault();
    const id = parseId();
    if (!id) return;

    setSearchedBasic(true);
    setSearchedDetails(false);
    setDetailsResult(null);
    const teacher = await onSearch(id);
    setBasicResult(teacher);
  };

  const handleDetailsSearch = async (e: FormEvent) => {
    e.preventDefault();
    const id = parseId();
    if (!id) return;

    setSearchedDetails(true);
    setSearchedBasic(false);
    setBasicResult(null);
    const details = await onSearchDetails(id);
    setDetailsResult(details);
  };

  const isLoading = loading || detailsLoading;
  const selectedName = teachers.find((t) => t.id === parseInt(teacherId, 10))?.name;

  const searchForm = (
    <form
      className={embedded ? 'embedded-form' : 'search-grade-form'}
      onSubmit={handleBasicSearch}
    >
      <div className={embedded ? 'form-group' : 'search-grade-form__row'}>
        <div className={embedded ? undefined : 'form-group search-grade-form__input'}>
          <label htmlFor={embedded ? 'teacherIdModal' : 'teacherId'} className="form-label">
            Teacher
          </label>
          <select
            id={embedded ? 'teacherIdModal' : 'teacherId'}
            className={`form-input ${error ? 'form-input--error' : ''}`}
            value={teacherId}
            onChange={(e) => {
              setTeacherId(e.target.value);
              if (error) setError('');
              setSearchedBasic(false);
              setSearchedDetails(false);
            }}
            disabled={isLoading || teachers.length === 0}
          >
            <option value="">Select a teacher...</option>
            {teachers.map((teacher) => (
              <option key={teacher.id} value={teacher.id}>
                {teacher.name}
              </option>
            ))}
          </select>
          {error && <span className="form-error">{error}</span>}
          {teachers.length === 0 && (
            <span className="form-error">No teachers available.</span>
          )}
        </div>
        {!embedded && (
          <>
            <button
              type="submit"
              className={`btn btn--secondary ${loading ? 'btn--loading' : ''}`}
              disabled={isLoading || teachers.length === 0}
            >
              {loading ? (
                <>
                  <span className="spinner spinner--sm" />
                  Searching...
                </>
              ) : (
                'Fetch Teacher'
              )}
            </button>
            <button
              type="button"
              className={`btn btn--ghost ${detailsLoading ? 'btn--loading' : ''}`}
              disabled={isLoading || teachers.length === 0}
              onClick={handleDetailsSearch}
            >
              {detailsLoading ? (
                <>
                  <span className="spinner spinner--sm" />
                  Loading...
                </>
              ) : (
                'View Details'
              )}
            </button>
          </>
        )}
      </div>
      {embedded && (
        <div className="embedded-form__actions embedded-form__actions--stacked">
          <button
            type="submit"
            className={`btn btn--primary ${loading ? 'btn--loading' : ''}`}
            disabled={isLoading || teachers.length === 0}
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
          <button
            type="button"
            className={`btn btn--ghost ${detailsLoading ? 'btn--loading' : ''}`}
            disabled={isLoading || teachers.length === 0}
            onClick={handleDetailsSearch}
          >
            {detailsLoading ? (
              <>
                <span className="spinner spinner--sm" />
                Loading...
              </>
            ) : (
              'View Details'
            )}
          </button>
        </div>
      )}
    </form>
  );

  const basicResultBlock = searchedBasic && !loading && (
    <div className="search-result">
      {basicResult ? (
        <div className="search-result__card">
          <div className="search-result__badge">Found</div>
          <div className="search-result__details">
            <div className="search-result__field">
              <span className="search-result__label">ID</span>
              <span className="grade-id">#{basicResult.id}</span>
            </div>
            <div className="search-result__field">
              <span className="search-result__label">Teacher Name</span>
              <span className="search-result__value">{basicResult.name}</span>
            </div>
            <div className="search-result__field">
              <span className="search-result__label">Phone</span>
              <span className="search-result__value">{basicResult.phoneNo}</span>
            </div>
            <div className="search-result__field">
              <span className="search-result__label">Email</span>
              <a className="contact-link" href={`mailto:${basicResult.email}`}>
                {basicResult.email}
              </a>
            </div>
          </div>
        </div>
      ) : (
        <div className="search-result__empty">
          No teacher found{selectedName ? ` for ${selectedName}` : ''}.
        </div>
      )}
    </div>
  );

  const detailsResultBlock = searchedDetails && !detailsLoading && (
    <div className="search-result">
      {detailsResult ? (
        <div className="search-result__card search-result__card--stacked">
          <div className="search-result__badge">Details</div>
          <div className="search-result__details search-result__details--grid">
            <div className="search-result__field">
              <span className="search-result__label">ID</span>
              <span className="grade-id">#{detailsResult.id}</span>
            </div>
            <div className="search-result__field">
              <span className="search-result__label">Teacher Name</span>
              <span className="search-result__value">{detailsResult.name}</span>
            </div>
            <div className="search-result__field">
              <span className="search-result__label">Phone</span>
              <span className="search-result__value">{detailsResult.phoneNo}</span>
            </div>
            <div className="search-result__field">
              <span className="search-result__label">Email</span>
              <a className="contact-link" href={`mailto:${detailsResult.email}`}>
                {detailsResult.email}
              </a>
            </div>
            <div className="search-result__field search-result__field--full">
              <span className="search-result__label">Assigned Grade Subjects</span>
              {detailsResult.assignedGradeSubjectTeachers.length > 0 ? (
                <TableScrollWrapper>
                  <table className="grade-table">
                    <thead>
                      <tr>
                        <th>Grade</th>
                        <th>Subject</th>
                        <th>Type</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detailsResult.assignedGradeSubjectTeachers.map((assignment) => (
                        <tr key={assignment.id}>
                          <td>{assignment.gradeName}</td>
                          <td>{assignment.subjectName}</td>
                          <td>
                            <span
                              className={`teacher-tag ${assignment.isOptional ? 'teacher-tag--optional' : 'teacher-tag--compulsory'}`}
                            >
                              {getSubjectTypeLabel(assignment.isOptional)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
</TableScrollWrapper>
              ) : (
                <span className="search-result__muted">No grade subjects assigned</span>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="search-result__empty">
          No teacher found{selectedName ? ` for ${selectedName}` : ''}.
        </div>
      )}
    </div>
  );

  if (embedded) {
    return (
      <>
        {searchForm}
        {basicResultBlock}
        {detailsResultBlock}
      </>
    );
  }

  return (
    <section className="card search-grade-section">
      <div className="card__header">
        <div>
          <h2 className="card__title">Find Teacher</h2>
          <p className="card__subtitle">Look up a teacher or view full details</p>
        </div>
      </div>
      {searchForm}
      {basicResultBlock}
      {detailsResultBlock}
    </section>
  );
}
