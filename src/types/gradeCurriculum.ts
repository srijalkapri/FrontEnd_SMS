import type { Grade } from './grade';

export interface GradeSubjectSummary {
  id: number;
  subjectId: number;
  subjectName: string;
  isOptional: boolean;
}

export interface GradeCatalogEntry extends Grade {
  subjects: GradeSubjectSummary[];
}
