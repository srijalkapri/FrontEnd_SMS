import type { PromotionRequest, PromotionResult } from '../types/promotion';
import type { CreateStudentRequest, Student, UpdateStudentRequest } from '../types/student';
import { request } from './apiClient';

const BASE_URL = '/api/Student';

export const studentApi = {
  getAll: () => request<Student[]>(`${BASE_URL}/GetAllStudents`),

  getByGrade: (gradeId: number) =>
    request<Student[]>(`${BASE_URL}/GetStudentsByGrade?gradeId=${gradeId}`),

  previewPromotion: (data: PromotionRequest) =>
    request<PromotionResult>(`${BASE_URL}/PreviewPromotion`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  promoteStudents: (data: PromotionRequest) =>
    request<PromotionResult>(`${BASE_URL}/PromoteStudents`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getById: (id: number) =>
    request<Student>(`${BASE_URL}/GetStudentById?id=${id}`),

  create: (data: CreateStudentRequest) =>
    request<number>(`${BASE_URL}/CreateStudent`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: number, data: UpdateStudentRequest) =>
    request<number>(`${BASE_URL}/UpdateStudent?id=${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: number) =>
    request<number>(`${BASE_URL}/DeleteStudent?id=${id}`, {
      method: 'DELETE',
    }),

  restore: (id: number) =>
    request<number>(`${BASE_URL}/RestoreStudent?id=${id}`, {
      method: 'PUT',
    }),
};
