import { useCallback, useEffect, useMemo, useState } from 'react';
import { gradeApi } from '../api/gradeApi';
import { gradeSubjectApi } from '../api/gradeSubjectApi';
import { teacherApi } from '../api/teacherApi';
import { ConfirmDeleteModal } from '../components/ConfirmDeleteModal';
import { GradeForm } from '../components/GradeForm';
import { GradeTable } from '../components/GradeTable';
import { PageHeader } from '../components/layout/PageHeader';
import { SearchGradeSubject } from '../components/SearchGradeSubject';
import { FormModal } from '../components/ui/FormModal';
import { useToast } from '../context/ToastContext';
import { usePagedList } from '../hooks/usePagedList';
import type { Grade } from '../types/grade';
import type { GradeCatalogEntry } from '../types/gradeCurriculum';
import type { GradeSubject } from '../types/gradeSubject';
import type { Teacher } from '../types/teacher';
import { buildGradeCatalog } from '../utils/gradeCurriculum';

export function GradesPage() {
  const { showToast } = useToast();
  const [mappings, setMappings] = useState<GradeSubject[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [formLoading, setFormLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [editingGrade, setEditingGrade] = useState<Grade | null>(null);
  const [deletingGrade, setDeletingGrade] = useState<GradeCatalogEntry | null>(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);

  const fetchPage = useCallback(async (query: Parameters<typeof gradeApi.getPaged>[0]) => {
    const response = await gradeApi.getPaged(query);
    return response.data;
  }, []);

  const {
    items: pagedGrades,
    loading,
    error,
    pageNumber,
    pageSize,
    search: searchQuery,
    totalCount,
    totalPages,
    hasPreviousPage,
    hasNextPage,
    setPageNumber,
    setPageSize,
    setSearch: setSearchQuery,
    refresh: refreshGrades,
  } = usePagedList({ fetchPage });

  useEffect(() => {
    if (error) {
      showToast('error', error);
    }
  }, [error, showToast]);

  const fetchLookups = useCallback(async () => {
    try {
      const [mappingsResponse, teachersResponse] = await Promise.all([
        gradeSubjectApi.getAll(),
        teacherApi.getAll(),
      ]);
      setMappings(mappingsResponse.data);
      setTeachers(teachersResponse.data);
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Failed to load lookup data');
    }
  }, [showToast]);

  useEffect(() => {
    void fetchLookups();
  }, [fetchLookups]);

  const entries = useMemo(
    () => buildGradeCatalog(pagedGrades, mappings),
    [pagedGrades, mappings],
  );

  const refresh = useCallback(async () => {
    await Promise.all([refreshGrades(), fetchLookups()]);
  }, [refreshGrades, fetchLookups]);

  const closeFormModal = () => {
    setShowFormModal(false);
    setEditingGrade(null);
  };

  const openCreateModal = () => {
    setEditingGrade(null);
    setShowFormModal(true);
  };

  const openEditModal = (grade: GradeCatalogEntry) => {
    setEditingGrade(grade);
    setShowFormModal(true);
  };

  const handleCreateOrUpdate = async (
    className: string,
    level: number,
    classTeacherId: number | null,
    id?: number,
  ) => {
    setFormLoading(true);
    try {
      if (id) {
        const response = await gradeApi.update(id, { className, level, classTeacherId });
        showToast('success', response.message);
        closeFormModal();
      } else {
        const response = await gradeApi.create({ className, level, classTeacherId });
        showToast('success', response.message);
        closeFormModal();
      }
      await refresh();
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Operation failed');
    } finally {
      setFormLoading(false);
    }
  };

  const handleGradeSubjectSearch = async (id: number): Promise<GradeSubject | null> => {
    setSearchLoading(true);
    try {
      const response = await gradeSubjectApi.getById(id);
      showToast('success', response.message);
      return response.data;
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Grade subject not found');
      return null;
    } finally {
      setSearchLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingGrade) return;

    setDeleteLoading(true);
    try {
      const response = await gradeApi.delete(deletingGrade.id);
      showToast('success', response.message);
      setDeletingGrade(null);
      if (editingGrade?.id === deletingGrade.id) {
        closeFormModal();
      }
      await refresh();
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Delete failed');
    } finally {
      setDeleteLoading(false);
    }
  };

  const gradesForLookup = entries;

  return (
    <div className="page-content">
      <PageHeader
        badge="Academic Management"
        title="Grades"
        description="Manage class levels, assign class teachers, and view mapped subjects."
        actions={
          <>
            <button type="button" className="btn btn--ghost" onClick={() => setShowSearchModal(true)}>
              Lookup
            </button>
            <button type="button" className="btn btn--primary" onClick={openCreateModal}>
              + Add Grade
            </button>
          </>
        }
      />

      <GradeTable
        grades={entries}
        loading={loading}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onEdit={openEditModal}
        onDelete={setDeletingGrade}
        onRefresh={refresh}
        totalCount={totalCount}
        pageNumber={pageNumber}
        pageSize={pageSize}
        totalPages={totalPages}
        hasPreviousPage={hasPreviousPage}
        hasNextPage={hasNextPage}
        onPageChange={setPageNumber}
        onPageSizeChange={setPageSize}
      />

      <FormModal
        open={showFormModal}
        title={editingGrade ? 'Update Grade' : 'Create Grade'}
        subtitle={
          editingGrade
            ? `Editing grade #${editingGrade.id}`
            : 'Add a new class and assign a class teacher'
        }
        onClose={closeFormModal}
      >
        <GradeForm
          embedded
          editingGrade={editingGrade}
          teachers={teachers}
          onSubmit={handleCreateOrUpdate}
          onCancelEdit={closeFormModal}
          loading={formLoading}
        />
      </FormModal>

      <FormModal
        open={showSearchModal}
        title="Find Grade"
        subtitle="Select a grade and subject to look up"
        onClose={() => setShowSearchModal(false)}
      >
        <SearchGradeSubject
          embedded
          grades={gradesForLookup}
          items={mappings}
          onSearch={handleGradeSubjectSearch}
          loading={searchLoading}
        />
      </FormModal>

      <ConfirmDeleteModal
        open={!!deletingGrade}
        title="Delete Grade"
        message={
          <>
            Are you sure you want to delete{' '}
            <strong>{deletingGrade?.className}</strong> (ID #{deletingGrade?.id})? This action
            cannot be undone.
          </>
        }
        confirmLabel="Delete Grade"
        loading={deleteLoading}
        onConfirm={handleDelete}
        onCancel={() => setDeletingGrade(null)}
      />
    </div>
  );
}
