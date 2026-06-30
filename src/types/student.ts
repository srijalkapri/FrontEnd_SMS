import type { SoftDeleteFields } from './softDelete';

export interface StudentTeacher {
  id: number;
  name: string;
  email: string;
  phoneNo: string;
}

export interface StudentSubject {
  id: number;
  gradeId: number;
  gradeName: string;
  subjectId: number;
  subjectName: string;
  isOptional: boolean;
  teachers: StudentTeacher[];
}

export interface Student extends SoftDeleteFields {
  id: number;
  name: string;
  phoneNo: string;
  email: string;
  gradeId: number;
  gradeName: string;
  subjects: StudentSubject[];
}

export interface CreateStudentRequest {
  name: string;
  phoneNo: string;
  email: string;
  gradeId: number;
}

export interface UpdateStudentRequest {
  name: string;
  phoneNo: string;
  email: string;
  gradeId: number;
}
