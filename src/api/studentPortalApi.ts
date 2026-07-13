import type { StudentPortalOverview, StudentPortalProfile } from '../types/studentPortal';
import type { Grade } from '../types/grade';
import type { StudentSubject, StudentTeacher } from '../types/student';
import { request } from './apiClient';

const BASE_URL = '/api/StudentPortal';

export const studentPortalApi = {
  getOverview: () => request<StudentPortalOverview>(`${BASE_URL}/Overview`),

  getMe: () => request<StudentPortalProfile>(`${BASE_URL}/Me`),

  getGrade: () => request<Grade>(`${BASE_URL}/Grade`),

  getSubjects: () => request<StudentSubject[]>(`${BASE_URL}/Subjects`),

  getTeachers: () => request<StudentTeacher[]>(`${BASE_URL}/Teachers`),
};
