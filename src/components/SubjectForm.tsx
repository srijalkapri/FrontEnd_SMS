import { FormEvent, useEffect, useState } from 'react';
import type { Subject } from '../types/subject';
import './GradeForm.css';

interface SubjectFormProps {
  editingSubject: Subject | null;
  onSubmit: (name: string, id?: number) => Promise<void>;
  onCancelEdit: () => void;
  loading: boolean;
  embedded?: boolean;
}

export function SubjectForm({
  editingSubject,
  onSubmit,
  onCancelEdit,
  loading,
  embedded = false,
}: SubjectFormProps) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingSubject) {
      setName(editingSubject.name);
    } else {
      setName('');
    }
    setError('');
  }, [editingSubject]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();

    if (!trimmed) {
      setError('Subject name is required.');
      return;
    }

    setError('');
    await onSubmit(trimmed, editingSubject?.id);
    if (!editingSubject) {
      setName('');
    }
  };

  const isEditing = !!editingSubject;

  const formContent = (
    <form className={embedded ? 'embedded-form' : 'grade-form'} onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="subjectName" className="form-label">
          Subject Name
        </label>
        <input
          id="subjectName"
          type="text"
          className={`form-input ${error ? 'form-input--error' : ''}`}
          placeholder="e.g. Mathematics"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (error) setError('');
          }}
          disabled={loading}
        />
        {error && <span className="form-error">{error}</span>}
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
              'Update Subject'
            ) : (
              'Create Subject'
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
            'Update Subject'
          ) : (
            'Create Subject'
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
          <h2 className="card__title">{isEditing ? 'Update Subject' : 'Create Subject'}</h2>
          <p className="card__subtitle">
            {isEditing
              ? `Editing subject #${editingSubject.id}`
              : 'Add a new subject to the system'}
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
