import type {
  TeacherPortalOverview,
  TeacherPortalProfile,
  TeacherPortalStudent,
  TeacherPortalSubject,
} from '../types/teacherPortal';
import type { Grade } from '../types/grade';
import { request } from './apiClient';

const BASE_URL = '/api/TeacherPortal';

export const teacherPortalApi = {
  getOverview: () => request<TeacherPortalOverview>(`${BASE_URL}/Overview`),

  getMe: () => request<TeacherPortalProfile>(`${BASE_URL}/Me`),

  getClasses: () => request<Grade[]>(`${BASE_URL}/Classes`),

  getStudents: () => request<TeacherPortalStudent[]>(`${BASE_URL}/Students`),

  getSubjects: () => request<TeacherPortalSubject[]>(`${BASE_URL}/Subjects`),
};
