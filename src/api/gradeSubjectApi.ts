import type {
  CreateGradeSubjectRequest,
  GradeSubject,
  UpdateGradeSubjectRequest,
} from '../types/gradeSubject';
import type { PaginationQuery, PagedResult } from '../types/pagination';
import { buildPaginationQueryString } from '../utils/paginationQuery';
import { request } from './apiClient';

const BASE_URL = '/api/GradeSubject';

export interface GradeSubjectPagedQuery extends PaginationQuery {
  isOptional?: boolean;
}

export const gradeSubjectApi = {
  getAll: () => request<GradeSubject[]>(`${BASE_URL}/GetAllGradeSubjects`),

  getPaged: (params: GradeSubjectPagedQuery) => {
    const qs = buildPaginationQueryString({
      PageNumber: params.pageNumber,
      PageSize: params.pageSize,
      Search: params.search,
      SortBy: params.sortBy,
      SortDirection: params.sortDirection,
      isOptional: params.isOptional,
    });
    return request<PagedResult<GradeSubject>>(`${BASE_URL}/GetGradeSubjectsPaged?${qs}`);
  },

  getByGradeIdPaged: (gradeId: number, params: GradeSubjectPagedQuery) => {
    const qs = buildPaginationQueryString({
      gradeId,
      PageNumber: params.pageNumber,
      PageSize: params.pageSize,
      Search: params.search,
      SortBy: params.sortBy,
      SortDirection: params.sortDirection,
      isOptional: params.isOptional,
    });
    return request<PagedResult<GradeSubject>>(
      `${BASE_URL}/GetGradeSubjectsByGradeIdPaged?${qs}`,
    );
  },

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
