import { FormEvent, useState } from 'react';
import type { Grade } from '../types/grade';

interface ExamScheduleFormProps {
  grades: Grade[];
  loading: boolean;
  onSubmit: (
    gradeId: number,
    title: string,
    academicYear: string,
    autoGenerateSessions: boolean,
  ) => Promise<void>;
  onCancel: () => void;
}

export function ExamScheduleForm({
  grades,
  loading,
  onSubmit,
  onCancel,
}: ExamScheduleFormProps) {
  const [gradeId, setGradeId] = useState('');
  const [title, setTitle] = useState('');
  const [academicYear, setAcademicYear] = useState('');
  const [autoGenerateSessions, setAutoGenerateSessions] = useState(true);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const parsedGradeId = parseInt(gradeId, 10);
    const trimmedTitle = title.trim();
    const trimmedYear = academicYear.trim();

    if (isNaN(parsedGradeId) || parsedGradeId <= 0) {
      setError('Select a grade.');
      return;
    }

    if (!trimmedTitle) {
      setError('Enter a schedule title.');
      return;
    }

    if (!trimmedYear) {
      setError('Enter an academic year.');
      return;
    }

    setError('');
    await onSubmit(parsedGradeId, trimmedTitle, trimmedYear, autoGenerateSessions);
  };

  return (
    <form className="embedded-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="examGradeId" className="form-label">
          Grade
        </label>
        <select
          id="examGradeId"
          className="form-input"
          value={gradeId}
          onChange={(e) => {
            setGradeId(e.target.value);
            if (error) setError('');
          }}
          disabled={loading}
        >
          <option value="">Select grade</option>
          {grades.map((grade) => (
            <option key={grade.id} value={grade.id}>
              {grade.className}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="examTitle" className="form-label">
          Title
        </label>
        <input
          id="examTitle"
          type="text"
          className="form-input"
          placeholder="e.g. Final Exam 2026"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (error) setError('');
          }}
          disabled={loading}
        />
      </div>

      <div className="form-group">
        <label htmlFor="examAcademicYear" className="form-label">
          Academic year
        </label>
        <input
          id="examAcademicYear"
          type="text"
          className="form-input"
          placeholder="e.g. 2025-2026"
          value={academicYear}
          onChange={(e) => {
            setAcademicYear(e.target.value);
            if (error) setError('');
          }}
          disabled={loading}
        />
      </div>

      <label className="exam-form__checkbox">
        <input
          type="checkbox"
          checked={autoGenerateSessions}
          onChange={(e) => setAutoGenerateSessions(e.target.checked)}
          disabled={loading}
        />
        Auto-generate sessions from grade subjects
      </label>

      {error && <p className="form-error">{error}</p>}

      <div className="embedded-form__actions">
        <button type="button" className="btn btn--ghost" onClick={onCancel} disabled={loading}>
          Cancel
        </button>
        <button type="submit" className={`btn btn--primary ${loading ? 'btn--loading' : ''}`} disabled={loading}>
          {loading ? (
            <>
              <span className="spinner spinner--sm" />
              Creating...
            </>
          ) : (
            'Create schedule'
          )}
        </button>
      </div>
    </form>
  );
}
