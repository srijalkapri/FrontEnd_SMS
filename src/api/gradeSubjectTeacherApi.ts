import type {
  CreateGradeSubjectTeacherRequest,
  GradeSubjectTeacher,
  UpdateGradeSubjectTeacherRequest,
} from '../types/gradeSubjectTeacher';
import { request } from './apiClient';

const BASE_URL = '/api/GradeSubjectTeacher';

export const gradeSubjectTeacherApi = {
  getAll: () =>
    request<GradeSubjectTeacher[]>(`${BASE_URL}/GetAllGradeSubjectTeachers`),

  getById: (id: number) =>
    request<GradeSubjectTeacher>(`${BASE_URL}/GetGradeSubjectTeacherById?id=${id}`),

  create: (data: CreateGradeSubjectTeacherRequest) =>
    request<number>(`${BASE_URL}/CreateGradeSubjectTeacher`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: number, data: UpdateGradeSubjectTeacherRequest) =>
    request<number>(`${BASE_URL}/UpdateGradeSubjectTeacher?id=${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),


  

  delete: (id: number) =>
    request<number>(`${BASE_URL}/DeleteGradeSubjectTeacher?id=${id}`, {
      method: 'DELETE',
    }),
};
