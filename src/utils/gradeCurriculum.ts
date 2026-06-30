import type { Grade } from '../types/grade';
import type { GradeCatalogEntry, GradeSubjectSummary } from '../types/gradeCurriculum';
import type { GradeSubject } from '../types/gradeSubject';

export function buildGradeCatalog(
  grades: Grade[],
  mappings: GradeSubject[],
): GradeCatalogEntry[] {
  const subjectsByGradeId = new Map<number, GradeSubjectSummary[]>();

  for (const mapping of mappings) {
    const subjects = subjectsByGradeId.get(mapping.gradeId) ?? [];
    subjects.push({
      id: mapping.id,
      subjectId: mapping.subjectId,
      subjectName: mapping.subjectName,
      isOptional: mapping.isOptional,
    });
    subjectsByGradeId.set(mapping.gradeId, subjects);
  }

  return grades.map((grade) => ({
    ...grade,
    subjects: (subjectsByGradeId.get(grade.id) ?? []).sort((a, b) =>
      a.subjectName.localeCompare(b.subjectName),
    ),
  }));
}
