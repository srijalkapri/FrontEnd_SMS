import type { Student } from '../types/student';
import type { SubjectTypeFilter } from './subjectType';

export interface StudentReportFilters {
  id?: number;
  name?: string;
  gradeId?: number;
  subjectId?: number;
  subjectType?: SubjectTypeFilter;
}

export function hasActiveStudentReportFilters(filters: StudentReportFilters): boolean {
  return (
    (filters.id !== undefined && filters.id > 0) ||
    !!filters.name?.trim() ||
    (filters.gradeId !== undefined && filters.gradeId > 0) ||
    (filters.subjectId !== undefined && filters.subjectId > 0) ||
    (filters.subjectType !== undefined && filters.subjectType !== 'all')
  );
}

function matchesSubjectTypeFilter(
  student: Student,
  subjectId: number | undefined,
  subjectType: SubjectTypeFilter | undefined,
): boolean {
  if (!subjectType || subjectType === 'all') {
    return true;
  }

  const relevantSubjects = subjectId
    ? student.subjects.filter((subject) => subject.subjectId === subjectId)
    : student.subjects;

  if (relevantSubjects.length === 0) {
    return false;
  }

  if (subjectType === 'optional') {
    return relevantSubjects.some((subject) => subject.isOptional);
  }

  return relevantSubjects.some((subject) => !subject.isOptional);
}

export function filterStudentsForReport(
  students: Student[],
  filters: StudentReportFilters,
): Student[] {
  const nameQuery = filters.name?.trim().toLowerCase();

  return students.filter((student) => {
    if (filters.id !== undefined && filters.id > 0 && student.id !== filters.id) {
      return false;
    }

    if (nameQuery && !student.name.toLowerCase().includes(nameQuery)) {
      return false;
    }

    if (filters.gradeId !== undefined && filters.gradeId > 0 && student.gradeId !== filters.gradeId) {
      return false;
    }

    if (
      filters.subjectId !== undefined &&
      filters.subjectId > 0 &&
      !student.subjects.some((subject) => subject.subjectId === filters.subjectId)
    ) {
      return false;
    }

    if (
      !matchesSubjectTypeFilter(student, filters.subjectId, filters.subjectType)
    ) {
      return false;
    }

    return true;
  });
}
