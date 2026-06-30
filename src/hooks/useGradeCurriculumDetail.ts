import { useCallback, useEffect, useState } from 'react';
import { gradeApi } from '../api/gradeApi';
import { gradeSubjectApi } from '../api/gradeSubjectApi';
import { useToast } from '../context/ToastContext';
import type { Grade } from '../types/grade';
import type { GradeSubject } from '../types/gradeSubject';

export function useGradeCurriculumDetail(gradeId: number) {
  const { showToast } = useToast();
  const [grade, setGrade] = useState<Grade | null>(null);
  const [subjects, setSubjects] = useState<GradeSubject[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    setNotFound(false);

    try {
      const [gradeResponse, mappingsResponse] = await Promise.all([
        gradeApi.getById(gradeId),
        gradeSubjectApi.getAll(),
      ]);

      setGrade(gradeResponse.data);
      setSubjects(
        mappingsResponse.data
          .filter((mapping) => mapping.gradeId === gradeId)
          .sort((a, b) => a.subjectName.localeCompare(b.subjectName)),
      );
    } catch (err) {
      setGrade(null);
      setSubjects([]);
      setNotFound(true);
      showToast('error', err instanceof Error ? err.message : 'Grade not found');
    } finally {
      setLoading(false);
    }
  }, [gradeId, showToast]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { grade, subjects, loading, notFound, refresh };
}
