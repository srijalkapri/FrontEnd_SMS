import { useCallback, useEffect, useState } from 'react';
import { teacherApi } from '../api/teacherApi';
import { ConfirmDeleteModal } from '../components/ConfirmDeleteModal';
import { PageHeader } from '../components/layout/PageHeader';
import { SearchTeacher } from '../components/SearchTeacher';
import { TeacherForm } from '../components/TeacherForm';
import { TeacherTable } from '../components/TeacherTable';
import { FormModal } from '../components/ui/FormModal';
import { useToast } from '../context/ToastContext';
import type { Teacher, TeacherDetails } from '../types/teacher';

export function TeachersPage() {
  const { showToast } = useToast();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [deletingTeacher, setDeletingTeacher] = useState<Teacher | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [detailsPrefillId, setDetailsPrefillId] = useState<number | null>(null);
  const [prefillDetails, setPrefillDetails] = useState<TeacherDetails | null>(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);

  const fetchTeachers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await teacherApi.getAll();
      setTeachers(response.data);
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Failed to load teachers');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchTeachers();
  }, [fetchTeachers]);

  const closeFormModal = () => {
    setShowFormModal(false);
    setEditingTeacher(null);
  };

  const openCreateModal = () => {
    setEditingTeacher(null);
    setShowFormModal(true);
  };

  const openEditModal = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setShowFormModal(true);
  };

  const closeSearchModal = () => {
    setShowSearchModal(false);
    setDetailsPrefillId(null);
    setPrefillDetails(null);
  };

  const openSearchModal = () => {
    setDetailsPrefillId(null);
    setPrefillDetails(null);
    setShowSearchModal(true);
  };

  const handleCreateOrUpdate = async (
    name: string,
    phoneNo: string,
    email: string,
    id?: number,
  ) => {
    setFormLoading(true);
    try {
      if (id) {
        const response = await teacherApi.update(id, { name, phoneNo, email });
        showToast('success', response.message);
        closeFormModal();
      } else {
        const response = await teacherApi.create({ name, phoneNo, email });
        showToast('success', response.message);
        closeFormModal();
      }
      await fetchTeachers();
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Operation failed');
    } finally {
      setFormLoading(false);
    }
  };

  const handleSearch = async (id: number): Promise<Teacher | null> => {
    setSearchLoading(true);
    try {
      const response = await teacherApi.getById(id);
      showToast('success', response.message);
      return response.data;
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Teacher not found');
      return null;
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSearchDetails = async (id: number): Promise<TeacherDetails | null> => {
    setDetailsLoading(true);
    try {
      const response = await teacherApi.getDetails(id);
      showToast('success', response.message);
      return response.data;
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Teacher not found');
      return null;
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleViewDetails = async (teacher: Teacher) => {
    setDetailsPrefillId(teacher.id);
    setPrefillDetails(null);
    setShowSearchModal(true);
    setDetailsLoading(true);

    try {
      const response = await teacherApi.getDetails(teacher.id);
      showToast('success', response.message);
      setPrefillDetails(response.data);
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Teacher not found');
      setPrefillDetails(null);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingTeacher) return;

    setDeleteLoading(true);
    try {
      const response = await teacherApi.delete(deletingTeacher.id);
      showToast('success', response.message);
      setDeletingTeacher(null);
      if (editingTeacher?.id === deletingTeacher.id) {
        closeFormModal();
      }
      await fetchTeachers();
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Delete failed');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="page-content">
      <PageHeader
        badge="Directory"
        title="Teachers"
        description="Manage teaching staff and view their grade-subject assignments."
        actions={
          <>
            <button type="button" className="btn btn--ghost" onClick={openSearchModal}>
              Lookup
            </button>
            <button type="button" className="btn btn--primary" onClick={openCreateModal}>
              + Add Teacher
            </button>
          </>
        }
      />

      <TeacherTable
        teachers={teachers}
        loading={loading}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onEdit={openEditModal}
        onDelete={setDeletingTeacher}
        onViewDetails={handleViewDetails}
        onRefresh={fetchTeachers}
      />

      <FormModal
        open={showFormModal}
        title={editingTeacher ? 'Update Teacher' : 'Create Teacher'}
        subtitle={
          editingTeacher
            ? `Editing teacher #${editingTeacher.id}`
            : 'Add a new teacher to the system'
        }
        onClose={closeFormModal}
      >
        <TeacherForm
          embedded
          editingTeacher={editingTeacher}
          onSubmit={handleCreateOrUpdate}
          onCancelEdit={closeFormModal}
          loading={formLoading}
        />
      </FormModal>

      <FormModal
        open={showSearchModal}
        title={detailsPrefillId ? 'Teacher Details' : 'Find Teacher'}
        subtitle={
          detailsPrefillId
            ? `Viewing details for teacher #${detailsPrefillId}`
            : 'Look up a teacher or view full details'
        }
        onClose={closeSearchModal}
      >
        <SearchTeacher
          embedded
          teachers={teachers}
          onSearch={handleSearch}
          onSearchDetails={handleSearchDetails}
          loading={searchLoading}
          detailsLoading={detailsLoading}
          prefillId={detailsPrefillId}
          initialDetails={prefillDetails}
        />
      </FormModal>

      <ConfirmDeleteModal
        open={!!deletingTeacher}
        title="Delete Teacher"
        message={
          <>
            Delete <strong>{deletingTeacher?.name}</strong> (ID #{deletingTeacher?.id})? This will
            remove the teacher from the active list. Teachers assigned as class teachers cannot be
            deleted.
          </>
        }
        confirmLabel="Delete Teacher"
        loading={deleteLoading}
        onConfirm={handleDelete}
        onCancel={() => setDeletingTeacher(null)}
      />
    </div>
  );
}
