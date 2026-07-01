import type { CreateSubjectRequest, Subject, UpdateSubjectRequest } from '../types/subject';
import type { PaginationQuery, PagedResult } from '../types/pagination';
import { buildPaginationQueryString } from '../utils/paginationQuery';
import { request } from './apiClient';

const BASE_URL = '/api/Subject';

export const subjectApi = {
  getAll: () => request<Subject[]>(`${BASE_URL}/GetAllSubjects`),

  getPaged: (params: PaginationQuery) => {
    const qs = buildPaginationQueryString({
      PageNumber: params.pageNumber,
      PageSize: params.pageSize,
      Search: params.search,
      SortBy: params.sortBy,
      SortDirection: params.sortDirection,
    });
    return request<PagedResult<Subject>>(`${BASE_URL}/GetSubjectsPaged?${qs}`);
  },

  getById: (id: number) =>
    request<Subject>(`${BASE_URL}/GetSubjectById?id=${id}`),

  create: (data: CreateSubjectRequest) =>
    request<number>(`${BASE_URL}/CreateSubject`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: number, data: UpdateSubjectRequest) =>
    request<number>(`${BASE_URL}/UpdateSubject?id=${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: number) =>
    request<number>(`${BASE_URL}/DeleteSubject?id=${id}`, {
      method: 'DELETE',
    }),
};
