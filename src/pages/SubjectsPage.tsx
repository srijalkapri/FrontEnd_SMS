import { useCallback, useEffect, useState } from 'react';
import { subjectApi } from '../api/subjectApi';
import { ConfirmDeleteModal } from '../components/ConfirmDeleteModal';
import { PageHeader } from '../components/layout/PageHeader';
import { SubjectForm } from '../components/SubjectForm';
import { SubjectTable } from '../components/SubjectTable';
import { FormModal } from '../components/ui/FormModal';
import { useToast } from '../context/ToastContext';
import { usePagedList } from '../hooks/usePagedList';
import type { Subject } from '../types/subject';

export function SubjectsPage() {
  const { showToast } = useToast();
  const [formLoading, setFormLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [deletingSubject, setDeletingSubject] = useState<Subject | null>(null);
  const [showFormModal, setShowFormModal] = useState(false);

  const fetchPage = useCallback(
    async (query: Parameters<typeof subjectApi.getPaged>[0]) => {
      const response = await subjectApi.getPaged(query);
      return response.data;
    },
    [],
  );

  const {
    items: subjects,
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
    refresh: fetchSubjects,
  } = usePagedList({ fetchPage });

  useEffect(() => {
    if (error) {
      showToast('error', error);
    }
  }, [error, showToast]);

  const closeFormModal = () => {
    setShowFormModal(false);
    setEditingSubject(null);
  };

  const openCreateModal = () => {
    setEditingSubject(null);
    setShowFormModal(true);
  };

  const openEditModal = (subject: Subject) => {
    setEditingSubject(subject);
    setShowFormModal(true);
  };

  const handleCreateOrUpdate = async (name: string, id?: number) => {
    setFormLoading(true);
    try {
      if (id) {
        const response = await subjectApi.update(id, { name });
        showToast('success', response.message);
        closeFormModal();
      } else {
        const response = await subjectApi.create({ name });
        showToast('success', response.message);
        closeFormModal();
      }
      await fetchSubjects();
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Operation failed');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingSubject) return;

    setDeleteLoading(true);
    try {
      const response = await subjectApi.delete(deletingSubject.id);
      showToast('success', response.message);
      setDeletingSubject(null);
      if (editingSubject?.id === deletingSubject.id) {
        closeFormModal();
      }
      await fetchSubjects();
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
        title="Subjects"
        description="Manage curriculum subjects offered across grades."
        actions={
          <button type="button" className="btn btn--primary" onClick={openCreateModal}>
            + Add Subject
          </button>
        }
      />

      <SubjectTable
        subjects={subjects}
        loading={loading}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onEdit={openEditModal}
        onDelete={setDeletingSubject}
        onRefresh={fetchSubjects}
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
        title={editingSubject ? 'Update Subject' : 'Create Subject'}
        subtitle={
          editingSubject
            ? `Editing subject #${editingSubject.id}`
            : 'Add a new subject to the system'
        }
        onClose={closeFormModal}
      >
        <SubjectForm
          embedded
          editingSubject={editingSubject}
          onSubmit={handleCreateOrUpdate}
          onCancelEdit={closeFormModal}
          loading={formLoading}
        />
      </FormModal>

      <ConfirmDeleteModal
        open={!!deletingSubject}
        title="Delete Subject"
        message={
          <>
            Are you sure you want to delete{' '}
            <strong>{deletingSubject?.name}</strong> (ID #{deletingSubject?.id})? This action
            cannot be undone.
          </>
        }
        confirmLabel="Delete Subject"
        loading={deleteLoading}
        onConfirm={handleDelete}
        onCancel={() => setDeletingSubject(null)}
      />
    </div>
  );
}
