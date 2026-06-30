import type { ClassTeacherSummary } from '../types/grade';

export type ClassTeacherValue = string | ClassTeacherSummary | null | undefined;

export function getClassTeacherName(classTeacher: ClassTeacherValue): string | null {
  if (classTeacher == null) {
    return null;
  }

  if (typeof classTeacher === 'string') {
    return classTeacher;
  }

  return classTeacher.name ?? null;
}
