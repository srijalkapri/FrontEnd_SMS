import type { PagedResult } from '../types/pagination';

type PagedResultLike = Record<string, unknown>;

function toNumber(value: unknown, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function extractItems<T>(raw: PagedResultLike): T[] {
  const knownKeys = [
    'items',
    'Items',
    'results',
    'Results',
    'records',
    'Records',
    'data',
    'Data',
    'schedules',
    'Schedules',
    'students',
    'Students',
    'teachers',
    'Teachers',
    'subjects',
    'Subjects',
    'grades',
    'Grades',
  ];

  for (const key of knownKeys) {
    const value = raw[key];
    if (Array.isArray(value)) {
      return value as T[];
    }
  }

  for (const [key, value] of Object.entries(raw)) {
    if (Array.isArray(value) && key !== 'errors') {
      return value as T[];
    }
  }

  return [];
}

export function normalizePagedResult<T>(raw: unknown): PagedResult<T> {
  if (!raw || typeof raw !== 'object') {
    return {
      items: [],
      pageNumber: 1,
      pageSize: 10,
      totalCount: 0,
      totalPages: 0,
      hasPreviousPage: false,
      hasNextPage: false,
    };
  }

  const source = raw as PagedResultLike;
  const items = extractItems<T>(source);
  const pageSize = toNumber(source.pageSize ?? source.PageSize, 10);
  const pageNumber = toNumber(
    source.pageNumber ?? source.PageNumber ?? source.page ?? source.Page,
    1,
  );
  const totalCount = toNumber(
    source.totalCount ??
      source.TotalCount ??
      source.totalRecords ??
      source.TotalRecords ??
      source.count ??
      source.Count,
    items.length,
  );
  const totalPages = toNumber(
    source.totalPages ?? source.TotalPages,
    pageSize > 0 ? Math.max(1, Math.ceil(totalCount / pageSize)) : 1,
  );

  return {
    items,
    pageNumber,
    pageSize,
    totalCount,
    totalPages,
    hasPreviousPage: Boolean(
      source.hasPreviousPage ?? source.HasPreviousPage ?? pageNumber > 1,
    ),
    hasNextPage: Boolean(
      source.hasNextPage ?? source.HasNextPage ?? pageNumber < totalPages,
    ),
  };
}
