import { FormEvent, useEffect, useState } from 'react';
import type { Grade } from '../types/grade';
import type { Teacher } from '../types/teacher';
import './GradeForm.css';

interface GradeFormProps {
  editingGrade: Grade | null;
  teachers: Teacher[];
  onSubmit: (className: string, classTeacherId: number | null, id?: number) => Promise<void>;
  onCancelEdit: () => void;
  loading: boolean;
  embedded?: boolean;
}

export function GradeForm({
  editingGrade,
  teachers,
  onSubmit,
  onCancelEdit,
  loading,
  embedded = false,
}: GradeFormProps) {
  const [className, setClassName] = useState('');
  const [classTeacherId, setClassTeacherId] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingGrade) {
      setClassName(editingGrade.className);
      setClassTeacherId(
        editingGrade.classTeacherId != null ? String(editingGrade.classTeacherId) : '',
      );
    } else {
      setClassName('');
      setClassTeacherId('');
    }
    setError('');
  }, [editingGrade]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = className.trim();

    if (!trimmed) {
      setError('Class name is required.');
      return;
    }

    const parsedTeacherId = classTeacherId ? parseInt(classTeacherId, 10) : null;
    const teacherId =
      parsedTeacherId && !isNaN(parsedTeacherId) && parsedTeacherId > 0 ? parsedTeacherId : null;

    setError('');
    await onSubmit(trimmed, teacherId, editingGrade?.id);
    if (!editingGrade) {
      setClassName('');
      setClassTeacherId('');
    }
  };

  const isEditing = !!editingGrade;

  const formContent = (
    <form className={embedded ? 'embedded-form' : 'grade-form'} onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="className" className="form-label">
          Class Name
        </label>
        <input
          id="className"
          type="text"
          className={`form-input ${error ? 'form-input--error' : ''}`}
          placeholder="e.g. Class 10"
          value={className}
          onChange={(e) => {
            setClassName(e.target.value);
            if (error) setError('');
          }}
          disabled={loading}
        />
        {error && <span className="form-error">{error}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="classTeacherId" className="form-label">
          Class Teacher
        </label>
        <select
          id="classTeacherId"
          className="form-input"
          value={classTeacherId}
          onChange={(e) => setClassTeacherId(e.target.value)}
          disabled={loading || teachers.length === 0}
        >
          <option value="">No class teacher</option>
          {teachers.map((teacher) => (
            <option key={teacher.id} value={teacher.id}>
              {teacher.name}
            </option>
          ))}
        </select>
        {teachers.length === 0 && (
          <span className="form-error">No teachers available. Create a teacher first.</span>
        )}
      </div>

      {embedded ? (
        <div className="embedded-form__actions">
          <button type="button" className="btn btn--ghost" onClick={onCancelEdit} disabled={loading}>
            Cancel
          </button>
          <button
            type="submit"
            className={`btn btn--primary ${loading ? 'btn--loading' : ''}`}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner spinner--sm" />
                {isEditing ? 'Updating...' : 'Creating...'}
              </>
            ) : isEditing ? (
              'Update Grade'
            ) : (
              'Create Grade'
            )}
          </button>
        </div>
      ) : (
        <button
          type="submit"
          className={`btn btn--primary ${loading ? 'btn--loading' : ''}`}
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="spinner spinner--sm" />
              {isEditing ? 'Updating...' : 'Creating...'}
            </>
          ) : isEditing ? (
            'Update Grade'
          ) : (
            'Create Grade'
          )}
        </button>
      )}
    </form>
  );

  if (embedded) return formContent;

  return (
    <section className="card grade-form-section">
      <div className="card__header">
        <div>
          <h2 className="card__title">{isEditing ? 'Update Grade' : 'Create Grade'}</h2>
          <p className="card__subtitle">
            {isEditing
              ? `Editing grade #${editingGrade.id}`
              : 'Add a new class and assign a class teacher'}
          </p>
        </div>
        {isEditing && (
          <button className="btn btn--ghost" onClick={onCancelEdit} type="button">
            Cancel
          </button>
        )}
      </div>
      {formContent}
    </section>
  );
}
