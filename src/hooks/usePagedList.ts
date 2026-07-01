import { useCallback, useEffect, useState } from 'react';
import type { PagedResult, PaginationQuery } from '../types/pagination';
import { normalizePagedResult } from '../utils/normalizePagedResult';
import { useDebouncedValue } from './useDebouncedValue';

interface UsePagedListOptions<T> {
  fetchPage: (query: PaginationQuery) => Promise<PagedResult<T>>;
  initialPageSize?: number;
  enabled?: boolean;
}

export function usePagedList<T>({
  fetchPage,
  initialPageSize = 10,
  enabled = true,
}: UsePagedListOptions<T>) {
  const [items, setItems] = useState<T[]>([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [search, setSearchState] = useState('');
  const debouncedSearch = useDebouncedValue(search);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const setSearch = useCallback((value: string) => {
    setSearchState(value);
    setPageNumber(1);
  }, []);

  const refresh = useCallback(async () => {
    if (!enabled) {
      setItems([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = normalizePagedResult<T>(
        await fetchPage({
          pageNumber,
          pageSize,
          search: debouncedSearch.trim() || undefined,
        }),
      );

      setItems(result.items);
      setTotalCount(result.totalCount);
      setTotalPages(result.totalPages);
      setHasPreviousPage(result.hasPreviousPage);
      setHasNextPage(result.hasNextPage);

      if (result.totalPages > 0 && pageNumber > result.totalPages) {
        setPageNumber(result.totalPages);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
      setItems([]);
      setTotalCount(0);
      setTotalPages(0);
      setHasPreviousPage(false);
      setHasNextPage(false);
    } finally {
      setLoading(false);
    }
  }, [enabled, fetchPage, pageNumber, pageSize, debouncedSearch]);

  useEffect(() => {
    setPageNumber(1);
  }, [pageSize, enabled]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    items,
    loading,
    error,
    pageNumber,
    pageSize,
    search,
    totalCount,
    totalPages,
    hasPreviousPage,
    hasNextPage,
    setPageNumber,
    setPageSize,
    setSearch,
    refresh,
  };
}
