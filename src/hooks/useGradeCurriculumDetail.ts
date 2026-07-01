import { useCallback, useEffect, useState } from 'react';
import { gradeApi } from '../api/gradeApi';
import { gradeSubjectApi } from '../api/gradeSubjectApi';
import { useToast } from '../context/ToastContext';
import { usePagedList } from '../hooks/usePagedList';
import type { Grade } from '../types/grade';

export function useGradeCurriculumDetail(gradeId: number) {
  const { showToast } = useToast();
  const [grade, setGrade] = useState<Grade | null>(null);
  const [notFound, setNotFound] = useState(false);

  const fetchPage = useCallback(
    async (query: Parameters<typeof gradeSubjectApi.getByGradeIdPaged>[1]) => {
      const response = await gradeSubjectApi.getByGradeIdPaged(gradeId, query);
      return response.data;
    },
    [gradeId],
  );

  const {
    items: subjects,
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
  } = usePagedList({
    fetchPage,
    enabled: gradeId > 0,
  });

  useEffect(() => {
    if (!gradeId || gradeId <= 0) {
      return;
    }

    let cancelled = false;

    async function loadGrade() {
      setNotFound(false);
      try {
        const response = await gradeApi.getById(gradeId);
        if (!cancelled) {
          setGrade(response.data);
        }
      } catch (err) {
        if (!cancelled) {
          setGrade(null);
          setNotFound(true);
          showToast('error', err instanceof Error ? err.message : 'Grade not found');
        }
      }
    }

    void loadGrade();

    return () => {
      cancelled = true;
    };
  }, [gradeId, showToast]);

  useEffect(() => {
    if (error) {
      showToast('error', error);
    }
  }, [error, showToast]);

  return {
    grade,
    subjects,
    loading,
    notFound,
    refresh,
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
  };
}
