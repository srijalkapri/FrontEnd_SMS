import type { Grade } from './grade';
import type { StudentSubject, StudentTeacher } from './student';

export interface StudentPortalProfile {
  id: number;
  name: string;
  email: string;
  phoneNo: string;
  gradeId: number;
  gradeName: string;
}

export interface StudentPortalOverview {
  profile: StudentPortalProfile;
  grade: Grade;
  subjects: StudentSubject[];
  teachers: StudentTeacher[];
}
