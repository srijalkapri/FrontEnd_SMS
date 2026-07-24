import type { StudentExamResultSchedule } from '../types/examResult';
import type { ApplyReExamRequest, ReExamRequest } from '../types/reExam';
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

  getResults: (examScheduleId?: number) => {
    const qs = examScheduleId != null ? `?examScheduleId=${examScheduleId}` : '';
    return request<StudentExamResultSchedule[]>(`${BASE_URL}/Results${qs}`);
  },

  getReExams: () => request<ReExamRequest[]>(`${BASE_URL}/ReExams`),

  applyForReExam: (data: ApplyReExamRequest) =>
    request<string>(`${BASE_URL}/ReExams/Apply`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};
