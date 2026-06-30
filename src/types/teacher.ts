import type { SoftDeleteFields } from './softDelete';

export interface Teacher extends SoftDeleteFields {
  id: number;
  name: string;
  phoneNo: string;
  email: string;
}

export interface AssignedGradeSubjectTeacher {
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

export interface TeacherDetails extends Teacher {
  assignedGradeSubjectTeachers: AssignedGradeSubjectTeacher[];
}

export interface CreateTeacherRequest {
  name: string;
  phoneNo: string;
  email: string;
}

export interface UpdateTeacherRequest {
  name: string;
  phoneNo: string;
  email: string;
}
