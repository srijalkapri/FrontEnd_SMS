import type {
  CreateGradeSubjectRequest,
  GradeSubject,
  UpdateGradeSubjectRequest,
} from '../types/gradeSubject';
import { request } from './apiClient';

const BASE_URL = '/api/GradeSubject';

export const gradeSubjectApi = {
  getAll: () => request<GradeSubject[]>(`${BASE_URL}/GetAllGradeSubjects`),

  getById: (id: number) =>
    request<GradeSubject>(`${BASE_URL}/GetGradeSubjectById?id=${id}`),

  create: (data: CreateGradeSubjectRequest) =>
    request<number>(`${BASE_URL}/CreateGradeSubject`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: number, data: UpdateGradeSubjectRequest) =>
    request<number>(`${BASE_URL}/UpdateGradeSubject?id=${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: number) =>
    request<number>(`${BASE_URL}/DeleteGradeSubject?id=${id}`, {
      method: 'DELETE',
    }),
};
