import { FormEvent, useEffect, useState } from 'react';
import type { Grade } from '../types/grade';
import type { Student } from '../types/student';
import { validateEmail, validatePhoneNumber } from '../utils/contactValidation';
import './GradeForm.css';

interface StudentFormProps {
  editingStudent: Student | null;
  grades: Grade[];
  onSubmit: (
    name: string,
    gradeId: number,
    phoneNo: string,
    email: string,
    id?: number,
  ) => Promise<void>;
  onCancelEdit: () => void;
  loading: boolean;
  embedded?: boolean;
}

export function StudentForm({
  editingStudent,
  grades,
  onSubmit,
  onCancelEdit,
  loading,
  embedded = false,
}: StudentFormProps) {
  const [name, setName] = useState('');
  const [gradeId, setGradeId] = useState('');
  const [phoneNo, setPhoneNo] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<{
    name?: string;
    gradeId?: string;
    phoneNo?: string;
    email?: string;
  }>({});

  useEffect(() => {
    if (editingStudent) {
      setName(editingStudent.name);
      setGradeId(String(editingStudent.gradeId));
      setPhoneNo(editingStudent.phoneNo);
      setEmail(editingStudent.email);
    } else {
      setName('');
      setGradeId('');
      setPhoneNo('');
      setEmail('');
    }
    setErrors({});
  }, [editingStudent]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedPhone = phoneNo.trim();
    const trimmedEmail = email.trim();
    const parsedGradeId = parseInt(gradeId, 10);
    const nextErrors: {
      name?: string;
      gradeId?: string;
      phoneNo?: string;
      email?: string;
    } = {};

    if (!trimmedName) {
      nextErrors.name = 'Student name is required.';
    }
    if (isNaN(parsedGradeId) || parsedGradeId <= 0) {
      nextErrors.gradeId = 'Please select a grade.';
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
    await onSubmit(trimmedName, parsedGradeId, trimmedPhone, trimmedEmail, editingStudent?.id);
    if (!editingStudent) {
      setName('');
      setGradeId('');
      setPhoneNo('');
      setEmail('');
    }
  };

  const isEditing = !!editingStudent;

  const formContent = (
    <form className={embedded ? 'embedded-form' : 'grade-form'} onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="studentName" className="form-label">
          Student Name
        </label>
        <input
          id="studentName"
          type="text"
          className={`form-input ${errors.name ? 'form-input--error' : ''}`}
          placeholder="e.g. Aaryan"
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
        <label htmlFor="studentPhoneNumber" className="form-label">
          Phone Number
        </label>
        <input
          id="studentPhoneNumber"
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
        <label htmlFor="studentEmail" className="form-label">
          Email
        </label>
        <input
          id="studentEmail"
          type="email"
          className={`form-input ${errors.email ? 'form-input--error' : ''}`}
          placeholder="e.g. aaryan@school.edu"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
          }}
          disabled={loading}
        />
        {errors.email && <span className="form-error">{errors.email}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="studentGradeId" className="form-label">
          Grade
        </label>
        <select
          id="studentGradeId"
          className={`form-input ${errors.gradeId ? 'form-input--error' : ''}`}
          value={gradeId}
          onChange={(e) => {
            setGradeId(e.target.value);
            if (errors.gradeId) setErrors((prev) => ({ ...prev, gradeId: undefined }));
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
        {errors.gradeId && <span className="form-error">{errors.gradeId}</span>}
        {grades.length === 0 && (
          <span className="form-error">No grades available. Create a grade first.</span>
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
            disabled={loading || grades.length === 0}
          >
            {loading ? (
              <>
                <span className="spinner spinner--sm" />
                {isEditing ? 'Updating...' : 'Creating...'}
              </>
            ) : isEditing ? (
              'Update Student'
            ) : (
              'Create Student'
            )}
          </button>
        </div>
      ) : (
        <button
          type="submit"
          className={`btn btn--primary ${loading ? 'btn--loading' : ''}`}
          disabled={loading || grades.length === 0}
        >
          {loading ? (
            <>
              <span className="spinner spinner--sm" />
              {isEditing ? 'Updating...' : 'Creating...'}
            </>
          ) : isEditing ? (
            'Update Student'
          ) : (
            'Create Student'
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
          <h2 className="card__title">{isEditing ? 'Update Student' : 'Create Student'}</h2>
          <p className="card__subtitle">
            {isEditing
              ? `Editing student #${editingStudent.id}`
              : 'Add a new student to the system'}
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
