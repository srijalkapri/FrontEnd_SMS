import { useCallback, useEffect, useState } from 'react';
import { gradeApi } from '../api/gradeApi';
import { gradeSubjectApi } from '../api/gradeSubjectApi';
import { useToast } from '../context/ToastContext';
import type { GradeCatalogEntry } from '../types/gradeCurriculum';
import type { GradeSubject } from '../types/gradeSubject';
import { buildGradeCatalog } from '../utils/gradeCurriculum';

export function useGradeCatalog() {
  const { showToast } = useToast();
  const [entries, setEntries] = useState<GradeCatalogEntry[]>([]);
  const [mappings, setMappings] = useState<GradeSubject[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [gradesResponse, mappingsResponse] = await Promise.all([
        gradeApi.getAll(),
        gradeSubjectApi.getAll(),
      ]);

      setMappings(mappingsResponse.data);
      setEntries(buildGradeCatalog(gradesResponse.data, mappingsResponse.data));
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Failed to load grade catalog');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { entries, mappings, loading, refresh };
}
