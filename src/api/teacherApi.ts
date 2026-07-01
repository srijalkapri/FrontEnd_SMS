import type {
  CreateTeacherRequest,
  Teacher,
  TeacherDetails,
  UpdateTeacherRequest,
} from '../types/teacher';
import type { PaginationQuery, PagedResult } from '../types/pagination';
import { buildPaginationQueryString } from '../utils/paginationQuery';
import { request } from './apiClient';

const BASE_URL = '/api/Teacher';

export const teacherApi = {
  getAll: () => request<Teacher[]>(`${BASE_URL}/GetAllTeachers`),

  getPaged: (params: PaginationQuery) => {
    const qs = buildPaginationQueryString({
      PageNumber: params.pageNumber,
      PageSize: params.pageSize,
      Search: params.search,
      SortBy: params.sortBy,
      SortDirection: params.sortDirection,
    });
    return request<PagedResult<Teacher>>(`${BASE_URL}/GetTeachersPaged?${qs}`);
  },

  getById: (id: number) =>
    request<Teacher>(`${BASE_URL}/GetTeacherById?id=${id}`),

  getDetails: (id: number) =>
    request<TeacherDetails>(`${BASE_URL}/GetTeacherDetails?id=${id}`),

  create: (data: CreateTeacherRequest) =>
    request<number>(`${BASE_URL}/CreateTeacher`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: number, data: UpdateTeacherRequest) =>
    request<number>(`${BASE_URL}/UpdateTeacher?Id=${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: number) =>
    request<number>(`${BASE_URL}/DeleteTeacher?id=${id}`, {
      method: 'DELETE',
    }),

  restore: (id: number) =>
    request<number>(`${BASE_URL}/RestoreTeacher?id=${id}`, {
      method: 'PUT',
    }),
};
