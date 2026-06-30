export interface Teacher {
  id: number;
  name: string;
}

export interface GradeSubject {
  id: number;
  gradeId: number;
  gradeName: string;
  subjectId: number;
  subjectName: string;
  isOptional: boolean;
  teachers: Teacher[];
}

export interface CreateGradeSubjectRequest {
  gradeId: number;
  subjectId: number;
  isOptional: boolean;
}

export interface UpdateGradeSubjectRequest {
  gradeId: number;
  subjectId: number;
  isOptional: boolean;
}
