export interface GradeSubjectTeacher {
  id: number;
  gradeSubjectId: number;
  gradeId: number;
  gradeName: string;
  subjectId: number;
  subjectName: string;
  isOptional: boolean;
  teacherId: number;
  teacherName: string;
}

export interface CreateGradeSubjectTeacherRequest {
  gradeSubjectId: number;
  teacherId: number;
}

export interface UpdateGradeSubjectTeacherRequest {
  gradeSubjectId: number;
  teacherId: number;
}
