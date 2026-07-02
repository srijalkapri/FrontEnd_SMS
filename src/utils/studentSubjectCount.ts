import type { GradeSubject } from '../types/gradeSubject';
import type { Student } from '../types/student';

export function buildGradeSubjectCounts(mappings: GradeSubject[]): Map<number, number> {
  const counts = new Map<number, number>();

  for (const mapping of mappings) {
    counts.set(mapping.gradeId, (counts.get(mapping.gradeId) ?? 0) + 1);
  }

  return counts;
}

export function getStudentSubjectCount(
  student: Student,
  gradeSubjectCounts: Map<number, number>,
): number {
  if (student.subjects.length > 0) {
    return student.subjects.length;
  }

  const subjectCount = (student as Student & { subjectCount?: number }).subjectCount;
  if (typeof subjectCount === 'number') {
    return subjectCount;
  }

  return gradeSubjectCounts.get(student.gradeId) ?? 0;
}
