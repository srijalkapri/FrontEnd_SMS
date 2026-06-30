import type { CreateGradeRequest, Grade, UpdateGradeRequest } from '../types/grade';
import { request } from './apiClient';

const BASE_URL = '/api/Grade';

export const gradeApi = {
  getAll: () => request<Grade[]>(`${BASE_URL}/GetAllGrades`),

  getById: (id: number) =>
    request<Grade>(`${BASE_URL}/GetGradeById?id=${id}`),

  create: (data: CreateGradeRequest) =>
    request<number>(`${BASE_URL}/CreateGrade`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: number, data: UpdateGradeRequest) =>
    request<number>(`${BASE_URL}/UpdateGrade?Id=${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: number) =>
    request<number>(`${BASE_URL}/DeleteGrade?id=${id}`, {
      method: 'DELETE',
    }),
};
