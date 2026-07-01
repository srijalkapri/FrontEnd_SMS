import type {
  AddExamSessionRequest,
  BulkUpdateExamSessionsRequest,
  CreateExamScheduleRequest,
  ExamSchedule,
  UpdateExamScheduleRequest,
  UpdateExamSessionRequest,
} from '../types/exam';
import type { PaginationQuery, PagedResult } from '../types/pagination';
import { buildPaginationQueryString } from '../utils/paginationQuery';
import { request } from './apiClient';

const BASE_URL = '/api/Exam';

export const examApi = {
  getAllSchedules: () => request<ExamSchedule[]>(`${BASE_URL}/GetAllSchedules`),

  getSchedulesPaged: (params: PaginationQuery) => {
    const qs = buildPaginationQueryString({
      PageNumber: params.pageNumber,
      PageSize: params.pageSize,
      Search: params.search,
      SortBy: params.sortBy,
      SortDirection: params.sortDirection,
    });
    return request<PagedResult<ExamSchedule>>(`${BASE_URL}/GetSchedulesPaged?${qs}`);
  },

  getSchedulesByGradePaged: (gradeId: number, params: PaginationQuery) => {
    const qs = buildPaginationQueryString({
      gradeId,
      PageNumber: params.pageNumber,
      PageSize: params.pageSize,
      Search: params.search,
      SortBy: params.sortBy,
      SortDirection: params.sortDirection,
    });
    return request<PagedResult<ExamSchedule>>(`${BASE_URL}/GetSchedulesByGradePaged?${qs}`);
  },

  getScheduleById: (id: number) =>
    request<ExamSchedule>(`${BASE_URL}/GetScheduleById?id=${id}`),

  getSchedulesByGrade: (gradeId: number) =>
    request<ExamSchedule[]>(`${BASE_URL}/GetSchedulesByGrade?gradeId=${gradeId}`),

  createSchedule: (data: CreateExamScheduleRequest) =>
    request<number>(`${BASE_URL}/CreateSchedule`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateSchedule: (id: number, data: UpdateExamScheduleRequest) =>
    request<number>(`${BASE_URL}/UpdateSchedule?id=${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteSchedule: (id: number) =>
    request<number>(`${BASE_URL}/DeleteSchedule?id=${id}`, {
      method: 'DELETE',
    }),

  updateSession: (id: number, data: UpdateExamSessionRequest) =>
    request<number>(`${BASE_URL}/UpdateSession?id=${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  bulkUpdateSessions: (data: BulkUpdateExamSessionsRequest) =>
    request<boolean>(`${BASE_URL}/BulkUpdateSessions`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  addSession: (data: AddExamSessionRequest) =>
    request<number>(`${BASE_URL}/AddSession`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  deleteSession: (id: number) =>
    request<number>(`${BASE_URL}/DeleteSession?id=${id}`, {
      method: 'DELETE',
    }),
};
