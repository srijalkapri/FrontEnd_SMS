import type {
  TeacherExamResultBatch,
  TeacherExamSession,
  TeacherSaveExamResultsRequest,
} from '../types/examResult';
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

  getExamSessions: () => request<TeacherExamSession[]>(`${BASE_URL}/ExamSessions`),

  getExamResults: (examSessionId: number) =>
    request<TeacherExamResultBatch>(`${BASE_URL}/ExamResults/${examSessionId}`),

  saveExamResultsDraft: (data: TeacherSaveExamResultsRequest) =>
    request<string>(`${BASE_URL}/ExamResults/SaveDraft`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  submitExamResults: (data: TeacherSaveExamResultsRequest) =>
    request<string>(`${BASE_URL}/ExamResults/Submit`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};
