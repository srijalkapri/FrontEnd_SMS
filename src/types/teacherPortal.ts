import type { ClassTeacherSummary, Grade } from './grade';

export interface TeacherPortalProfile {
  id: number;
  name: string;
  email: string;
  phoneNo: string;
}

export interface TeacherPortalStudent {
  id: number;
  name: string;
  email: string;
  phoneNo: string;
  gradeId: number;
  gradeName: string;
  classTeacherId?: number | null;
  classTeacher?: ClassTeacherSummary | null;
  subjects: unknown[];
}

export interface TeacherPortalSubject {
  gradeId: number;
  gradeName: string;
  subjectId: number;
  subjectName: string;
  isOptional: boolean;
}

export interface TeacherPortalOverview {
  profile: TeacherPortalProfile;
  classes: Grade[];
  students: TeacherPortalStudent[];
  subjects: TeacherPortalSubject[];
}
