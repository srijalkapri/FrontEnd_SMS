import { useCallback, useEffect, useState } from 'react';
import { gradeApi } from '../api/gradeApi';
import { gradeSubjectApi } from '../api/gradeSubjectApi';
import { gradeSubjectTeacherApi } from '../api/gradeSubjectTeacherApi';
import { subjectApi } from '../api/subjectApi';
import { teacherApi } from '../api/teacherApi';
import { ConfirmDeleteModal } from '../components/ConfirmDeleteModal';
import { GradeSubjectForm } from '../components/GradeSubjectForm';
import { GradeSubjectTable } from '../components/GradeSubjectTable';
import { PageHeader } from '../components/layout/PageHeader';
import { SearchGradeSubject } from '../components/SearchGradeSubject';
import { FormModal } from '../components/ui/FormModal';
import { useToast } from '../context/ToastContext';
import { usePagedList } from '../hooks/usePagedList';
import type { Grade } from '../types/grade';
import type { GradeSubject } from '../types/gradeSubject';
import type { GradeSubjectTeacher } from '../types/gradeSubjectTeacher';
import type { Subject } from '../types/subject';
import type { Teacher } from '../types/teacher';

export function GradeSubjectsPage() {
  const { showToast } = useToast();
  const [grades, setGrades] = useState<Grade[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [assignments, setAssignments] = useState<GradeSubjectTeacher[]>([]);
  const [allMappings, setAllMappings] = useState<GradeSubject[]>([]);
  const [formLoading, setFormLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [editingItem, setEditingItem] = useState<GradeSubject | null>(null);
  const [deletingItem, setDeletingItem] = useState<GradeSubject | null>(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);

  const fetchPage = useCallback(
    async (query: Parameters<typeof gradeSubjectApi.getPaged>[0]) => {
      const response = await gradeSubjectApi.getPaged(query);
      return response.data;
    },
    [],
  );

  const {
    items,
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
    refresh: fetchItems,
  } = usePagedList({ fetchPage });

  useEffect(() => {
    if (error) {
      showToast('error', error);
    }
  }, [error, showToast]);

  const fetchLookups = useCallback(async () => {
    try {
      const [gradesResponse, subjectsResponse, teachersResponse, assignmentsResponse, mappingsResponse] =
        await Promise.all([
          gradeApi.getAll(),
          subjectApi.getAll(),
          teacherApi.getAll(),
          gradeSubjectTeacherApi.getAll(),
          gradeSubjectApi.getAll(),
        ]);
      setGrades(gradesResponse.data);
      setSubjects(subjectsResponse.data);
      setTeachers(teachersResponse.data);
      setAssignments(assignmentsResponse.data);
      setAllMappings(mappingsResponse.data);
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Failed to load form options');
    }
  }, [showToast]);

  useEffect(() => {
    void fetchLookups();
  }, [fetchLookups]);

  const closeFormModal = () => {
    setShowFormModal(false);
    setEditingItem(null);
  };

  const openCreateModal = () => {
    setEditingItem(null);
    setShowFormModal(true);
  };

  const openEditModal = (item: GradeSubject) => {
    setEditingItem(item);
    setShowFormModal(true);
  };

  const handleCreateOrUpdate = async (
    gradeId: number,
    subjectId: number,
    teacherId: number,
    isOptional: boolean,
    id?: number,
  ) => {
    setFormLoading(true);
    try {
      if (id) {
        const response = await gradeSubjectApi.update(id, { gradeId, subjectId, isOptional });

        const existingAssignment = assignments.find(
          (assignment) =>
            assignment.gradeSubjectId === id &&
            (editingItem?.teachers.some((teacher) => teacher.id === assignment.teacherId) ?? false),
        );

        if (existingAssignment) {
          if (existingAssignment.teacherId !== teacherId) {
            await gradeSubjectTeacherApi.update(existingAssignment.id, {
              gradeSubjectId: id,
              teacherId,
            });
          }
        } else {
          await gradeSubjectTeacherApi.create({ gradeSubjectId: id, teacherId });
        }

        showToast('success', response.message);
        closeFormModal();
      } else {
        const response = await gradeSubjectApi.create({ gradeId, subjectId, isOptional });
        await gradeSubjectTeacherApi.create({
          gradeSubjectId: response.data,
          teacherId,
        });
        showToast('success', response.message);
        closeFormModal();
      }
      await fetchItems();
      await fetchLookups();
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Operation failed');
    } finally {
      setFormLoading(false);
    }
  };

  const handleSearch = async (id: number): Promise<GradeSubject | null> => {
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
    if (!deletingItem) return;

    setDeleteLoading(true);
    try {
      const response = await gradeSubjectApi.delete(deletingItem.id);
      showToast('success', response.message);
      setDeletingItem(null);
      if (editingItem?.id === deletingItem.id) {
        closeFormModal();
      }
      await fetchItems();
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Delete failed');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="page-content">
      <PageHeader
        badge="Academic Management"
        title="Grade Subjects"
        description="Link grades to subjects and manage curriculum mappings."
        actions={
          <>
            <button type="button" className="btn btn--ghost" onClick={() => setShowSearchModal(true)}>
              Lookup
            </button>
            <button type="button" className="btn btn--primary" onClick={openCreateModal}>
              + Add Mapping
            </button>
          </>
        }
      />

      <GradeSubjectTable
        items={items}
        loading={loading}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onEdit={openEditModal}
        onDelete={setDeletingItem}
        onRefresh={fetchItems}
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
        title={editingItem ? 'Update Grade Subject' : 'Create Grade Subject'}
        subtitle={
          editingItem
            ? `Editing mapping #${editingItem.id}`
            : 'Link a grade to a subject and assign a teacher'
        }
        onClose={closeFormModal}
      >
        <GradeSubjectForm
          embedded
          editingItem={editingItem}
          grades={grades}
          subjects={subjects}
          teachers={teachers}
          existingMappings={allMappings}
          onSubmit={handleCreateOrUpdate}
          onCancelEdit={closeFormModal}
          loading={formLoading}
        />
      </FormModal>

      <FormModal
        open={showSearchModal}
        title="Find Grade Subject"
        subtitle="Select a grade-subject mapping to look up"
        onClose={() => setShowSearchModal(false)}
      >
        <SearchGradeSubject
          embedded
          items={items}
          onSearch={handleSearch}
          loading={searchLoading}
        />
      </FormModal>

      <ConfirmDeleteModal
        open={!!deletingItem}
        title="Delete Grade Subject"
        message={
          <>
            Are you sure you want to delete the mapping of{' '}
            <strong>{deletingItem?.gradeName}</strong> —{' '}
            <strong>{deletingItem?.subjectName}</strong> (ID #{deletingItem?.id})? This
            action cannot be undone.
          </>
        }
        confirmLabel="Delete Mapping"
        loading={deleteLoading}
        onConfirm={handleDelete}
        onCancel={() => setDeletingItem(null)}
      />
    </div>
  );
}
