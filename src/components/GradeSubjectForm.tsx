import { FormEvent, useEffect, useMemo, useState } from 'react';
import type { Grade } from '../types/grade';
import type { GradeSubject } from '../types/gradeSubject';
import type { Subject } from '../types/subject';
import type { Teacher } from '../types/teacher';
import './GradeSubjectForm.css';

interface GradeSubjectFormProps {
  editingItem: GradeSubject | null;
  grades: Grade[];
  subjects: Subject[];
  teachers: Teacher[];
  existingMappings: GradeSubject[];
  onSubmit: (
    gradeId: number,
    subjectId: number,
    teacherId: number,
    isOptional: boolean,
    id?: number,
  ) => Promise<void>;
  onCancelEdit: () => void;
  loading: boolean;
  embedded?: boolean;
}

export function GradeSubjectForm({
  editingItem,
  grades,
  subjects,
  teachers,
  existingMappings,
  onSubmit,
  onCancelEdit,
  loading,
  embedded = false,
}: GradeSubjectFormProps) {
  const [gradeId, setGradeId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [teacherId, setTeacherId] = useState('');
  const [isOptional, setIsOptional] = useState('false');
  const [errors, setErrors] = useState<{
    gradeId?: string;
    subjectId?: string;
    teacherId?: string;
    isOptional?: string;
  }>({});

  useEffect(() => {
    if (editingItem) {
      setGradeId(String(editingItem.gradeId));
      setSubjectId(String(editingItem.subjectId));
      setTeacherId(editingItem.teachers[0] ? String(editingItem.teachers[0].id) : '');
      setIsOptional(String(editingItem.isOptional));
    } else {
      setGradeId('');
      setSubjectId('');
      setTeacherId('');
      setIsOptional('false');
    }
    setErrors({});
  }, [editingItem]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const parsedGradeId = parseInt(gradeId, 10);
    const parsedSubjectId = parseInt(subjectId, 10);
    const parsedTeacherId = parseInt(teacherId, 10);
    const nextErrors: { gradeId?: string; subjectId?: string; teacherId?: string; isOptional?: string } = {};

    if (isNaN(parsedGradeId) || parsedGradeId <= 0) {
      nextErrors.gradeId = 'Please select a grade.';
    }
    if (isNaN(parsedSubjectId) || parsedSubjectId <= 0) {
      nextErrors.subjectId = 'Please select a subject.';
    }
    if (isNaN(parsedTeacherId) || parsedTeacherId <= 0) {
      nextErrors.teacherId = 'Please select a teacher.';
    }
    if (isOptional !== 'true' && isOptional !== 'false') {
      nextErrors.isOptional = 'Please select subject type.';
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    await onSubmit(
      parsedGradeId,
      parsedSubjectId,
      parsedTeacherId,
      isOptional === 'true',
      editingItem?.id,
    );
    if (!editingItem) {
      setGradeId('');
      setSubjectId('');
      setTeacherId('');
      setIsOptional('false');
    }
  };

  const parsedGradeId = gradeId ? parseInt(gradeId, 10) : NaN;

  const mappedSubjectIdsForGrade = useMemo(() => {
    if (isNaN(parsedGradeId) || parsedGradeId <= 0) return new Set<number>();

    return new Set(
      existingMappings
        .filter(
          (mapping) =>
            mapping.gradeId === parsedGradeId &&
            mapping.id !== editingItem?.id,
        )
        .map((mapping) => mapping.subjectId),
    );
  }, [parsedGradeId, existingMappings, editingItem?.id]);

  const availableSubjects = useMemo(
    () => subjects.filter((subject) => !mappedSubjectIdsForGrade.has(subject.id)),
    [subjects, mappedSubjectIdsForGrade],
  );

  const canSubmit =
    grades.length > 0 &&
    teachers.length > 0 &&
    !!gradeId &&
    availableSubjects.length > 0;

  const isEditing = !!editingItem;

  const formContent = (
    <form className={embedded ? 'embedded-form' : 'grade-subject-form'} onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="gradeId" className="form-label">
          Grade
        </label>
        <select
          id="gradeId"
          className={`form-input ${errors.gradeId ? 'form-input--error' : ''}`}
          value={gradeId}
          onChange={(e) => {
            setGradeId(e.target.value);
            setSubjectId('');
            if (errors.gradeId) setErrors((prev) => ({ ...prev, gradeId: undefined }));
            if (errors.subjectId) setErrors((prev) => ({ ...prev, subjectId: undefined }));
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

      <div className="form-group">
        <label htmlFor="subjectId" className="form-label">
          Subject
        </label>
        <select
          id="subjectId"
          className={`form-input ${errors.subjectId ? 'form-input--error' : ''}`}
          value={subjectId}
          onChange={(e) => {
            setSubjectId(e.target.value);
            if (errors.subjectId) setErrors((prev) => ({ ...prev, subjectId: undefined }));
          }}
          disabled={loading || subjects.length === 0 || !gradeId || availableSubjects.length === 0}
        >
          <option value="">Select a subject...</option>
          {availableSubjects.map((subject) => (
            <option key={subject.id} value={subject.id}>
              {subject.name}
            </option>
          ))}
        </select>
        {errors.subjectId && <span className="form-error">{errors.subjectId}</span>}
        {subjects.length === 0 && (
          <span className="form-error">No subjects available. Create a subject first.</span>
        )}
        {subjects.length > 0 && gradeId && availableSubjects.length === 0 && (
          <span className="form-error">
            All subjects are already mapped for this grade.
          </span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="isOptional" className="form-label">
          Subject Type
        </label>
        <select
          id="isOptional"
          className={`form-input ${errors.isOptional ? 'form-input--error' : ''}`}
          value={isOptional}
          onChange={(e) => {
            setIsOptional(e.target.value);
            if (errors.isOptional) setErrors((prev) => ({ ...prev, isOptional: undefined }));
          }}
          disabled={loading}
        >
          <option value="false">Compulsory</option>
          <option value="true">Optional</option>
        </select>
        {errors.isOptional && <span className="form-error">{errors.isOptional}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="teacherId" className="form-label">
          Teacher
        </label>
        <select
          id="teacherId"
          className={`form-input ${errors.teacherId ? 'form-input--error' : ''}`}
          value={teacherId}
          onChange={(e) => {
            setTeacherId(e.target.value);
            if (errors.teacherId) setErrors((prev) => ({ ...prev, teacherId: undefined }));
          }}
          disabled={loading || teachers.length === 0}
        >
          <option value="">Select a teacher...</option>
          {teachers.map((teacher) => (
            <option key={teacher.id} value={teacher.id}>
              {teacher.name}
            </option>
          ))}
        </select>
        {errors.teacherId && <span className="form-error">{errors.teacherId}</span>}
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
            disabled={loading || !canSubmit}
          >
            {loading ? (
              <>
                <span className="spinner spinner--sm" />
                {isEditing ? 'Updating...' : 'Creating...'}
              </>
            ) : isEditing ? (
              'Update Grade Subject'
            ) : (
              'Create Grade Subject'
            )}
          </button>
        </div>
      ) : (
        <button
          type="submit"
          className={`btn btn--primary ${loading ? 'btn--loading' : ''}`}
          disabled={loading || !canSubmit}
        >
          {loading ? (
            <>
              <span className="spinner spinner--sm" />
              {isEditing ? 'Updating...' : 'Creating...'}
            </>
          ) : isEditing ? (
            'Update Grade Subject'
          ) : (
            'Create Grade Subject'
          )}
        </button>
      )}
    </form>
  );

  if (embedded) return formContent;

  return (
    <section className="card grade-subject-form-section">
      <div className="card__header">
        <div>
          <h2 className="card__title">
            {isEditing ? 'Update Grade Subject' : 'Create Grade Subject'}
          </h2>
          <p className="card__subtitle">
            {isEditing
              ? `Editing mapping #${editingItem.id}`
              : 'Link a grade to a subject and assign a teacher'}
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
