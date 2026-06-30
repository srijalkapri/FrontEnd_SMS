import { FormEvent, useEffect, useState } from 'react';
import type { Teacher } from '../types/teacher';
import { validateEmail, validatePhoneNumber } from '../utils/contactValidation';
import './GradeForm.css';

interface TeacherFormProps {
  editingTeacher: Teacher | null;
  onSubmit: (name: string, phoneNo: string, email: string, id?: number) => Promise<void>;
  onCancelEdit: () => void;
  loading: boolean;
  embedded?: boolean;
}

export function TeacherForm({
  editingTeacher,
  onSubmit,
  onCancelEdit,
  loading,
  embedded = false,
}: TeacherFormProps) {
  const [name, setName] = useState('');
  const [phoneNo, setPhoneNo] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<{ name?: string; phoneNo?: string; email?: string }>({});

  useEffect(() => {
    if (editingTeacher) {
      setName(editingTeacher.name);
      setPhoneNo(editingTeacher.phoneNo);
      setEmail(editingTeacher.email);
    } else {
      setName('');
      setPhoneNo('');
      setEmail('');
    }
    setErrors({});
  }, [editingTeacher]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedPhone = phoneNo.trim();
    const trimmedEmail = email.trim();
    const nextErrors: { name?: string; phoneNo?: string; email?: string } = {};

    if (!trimmedName) {
      nextErrors.name = 'Teacher name is required.';
    }

    const phoneError = validatePhoneNumber(trimmedPhone);
    if (phoneError) {
      nextErrors.phoneNo = phoneError;
    }

    const emailError = validateEmail(trimmedEmail);
    if (emailError) {
      nextErrors.email = emailError;
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    await onSubmit(trimmedName, trimmedPhone, trimmedEmail, editingTeacher?.id);
    if (!editingTeacher) {
      setName('');
      setPhoneNo('');
      setEmail('');
    }
  };

  const isEditing = !!editingTeacher;

  const formContent = (
    <form className={embedded ? 'embedded-form' : 'grade-form'} onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="teacherName" className="form-label">
          Teacher Name
        </label>
        <input
          id="teacherName"
          type="text"
          className={`form-input ${errors.name ? 'form-input--error' : ''}`}
          placeholder="e.g. Ravi"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
          }}
          disabled={loading}
        />
        {errors.name && <span className="form-error">{errors.name}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="teacherPhoneNumber" className="form-label">
          Phone Number
        </label>
        <input
          id="teacherPhoneNumber"
          type="tel"
          className={`form-input ${errors.phoneNo ? 'form-input--error' : ''}`}
          placeholder="e.g. 9841234567"
          inputMode="numeric"
          maxLength={10}
          value={phoneNo}
          onChange={(e) => {
            setPhoneNo(e.target.value);
            if (errors.phoneNo) setErrors((prev) => ({ ...prev, phoneNo: undefined }));
          }}
          disabled={loading}
        />
        {errors.phoneNo && <span className="form-error">{errors.phoneNo}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="teacherEmail" className="form-label">
          Email
        </label>
        <input
          id="teacherEmail"
          type="email"
          className={`form-input ${errors.email ? 'form-input--error' : ''}`}
          placeholder="e.g. ravi@school.edu"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
          }}
          disabled={loading}
        />
        {errors.email && <span className="form-error">{errors.email}</span>}
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
              'Update Teacher'
            ) : (
              'Create Teacher'
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
            'Update Teacher'
          ) : (
            'Create Teacher'
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
          <h2 className="card__title">{isEditing ? 'Update Teacher' : 'Create Teacher'}</h2>
          <p className="card__subtitle">
            {isEditing
              ? `Editing teacher #${editingTeacher.id}`
              : 'Add a new teacher to the system'}
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
