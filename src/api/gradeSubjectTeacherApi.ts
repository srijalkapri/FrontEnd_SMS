import type {
  CreateGradeSubjectTeacherRequest,
  GradeSubjectTeacher,
  UpdateGradeSubjectTeacherRequest,
} from '../types/gradeSubjectTeacher';
import type { PaginationQuery, PagedResult } from '../types/pagination';
import { buildPaginationQueryString } from '../utils/paginationQuery';
import { request } from './apiClient';

const BASE_URL = '/api/GradeSubjectTeacher';

export const gradeSubjectTeacherApi = {
  getAll: () =>
    request<GradeSubjectTeacher[]>(`${BASE_URL}/GetAllGradeSubjectTeachers`),

  getPaged: (params: PaginationQuery) => {
    const qs = buildPaginationQueryString({
      PageNumber: params.pageNumber,
      PageSize: params.pageSize,
      Search: params.search,
      SortBy: params.sortBy,
      SortDirection: params.sortDirection,
    });
    return request<PagedResult<GradeSubjectTeacher>>(
      `${BASE_URL}/GetGradeSubjectTeachersPaged?${qs}`,
    );
  },

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
