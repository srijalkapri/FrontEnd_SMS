import { useCallback, useEffect, useState } from 'react';
import { gradeApi } from '../api/gradeApi';
import { studentApi } from '../api/studentApi';
import { ConfirmDeleteModal } from '../components/ConfirmDeleteModal';
import { PageHeader } from '../components/layout/PageHeader';
import { SearchStudent } from '../components/SearchStudent';
import { StudentForm } from '../components/StudentForm';
import { StudentTable } from '../components/StudentTable';
import { FormModal } from '../components/ui/FormModal';
import { useToast } from '../context/ToastContext';
import type { Grade } from '../types/grade';
import type { Student } from '../types/student';

export function StudentsPage() {
  const { showToast } = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [deletingStudent, setDeletingStudent] = useState<Student | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [detailsPrefillId, setDetailsPrefillId] = useState<number | null>(null);
  const [prefillResult, setPrefillResult] = useState<Student | null>(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const response = await studentApi.getAll();
      setStudents(response.data);
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Failed to load students');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const fetchGrades = useCallback(async () => {
    try {
      const response = await gradeApi.getAll();
      setGrades(response.data);
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Failed to load grades');
    }
  }, [showToast]);

  useEffect(() => {
    fetchStudents();
    fetchGrades();
  }, [fetchStudents, fetchGrades]);

  const closeFormModal = () => {
    setShowFormModal(false);
    setEditingStudent(null);
  };

  const openCreateModal = () => {
    setEditingStudent(null);
    setShowFormModal(true);
  };

  const openEditModal = (student: Student) => {
    setEditingStudent(student);
    setShowFormModal(true);
  };

  const closeSearchModal = () => {
    setShowSearchModal(false);
    setDetailsPrefillId(null);
    setPrefillResult(null);
  };

  const openSearchModal = () => {
    setDetailsPrefillId(null);
    setPrefillResult(null);
    setShowSearchModal(true);
  };

  const handleCreateOrUpdate = async (
    name: string,
    gradeId: number,
    phoneNo: string,
    email: string,
    id?: number,
  ) => {
    setFormLoading(true);
    try {
      if (id) {
        const response = await studentApi.update(id, { name, gradeId, phoneNo, email });
        showToast('success', response.message);
        closeFormModal();
      } else {
        const response = await studentApi.create({ name, gradeId, phoneNo, email });
        showToast('success', response.message);
        closeFormModal();
      }
      await fetchStudents();
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Operation failed');
    } finally {
      setFormLoading(false);
    }
  };

  const handleSearch = async (id: number): Promise<Student | null> => {
    setSearchLoading(true);
    try {
      const response = await studentApi.getById(id);
      showToast('success', response.message);
      return response.data;
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Student not found');
      return null;
    } finally {
      setSearchLoading(false);
    }
  };

  const handleViewDetails = async (student: Student) => {
    setDetailsPrefillId(student.id);
    setPrefillResult(null);
    setShowSearchModal(true);
    setSearchLoading(true);

    try {
      const response = await studentApi.getById(student.id);
      showToast('success', response.message);
      setPrefillResult(response.data);
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Student not found');
      setPrefillResult(null);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingStudent) return;

    setDeleteLoading(true);
    try {
      const response = await studentApi.delete(deletingStudent.id);
      showToast('success', response.message);
      setDeletingStudent(null);
      if (editingStudent?.id === deletingStudent.id) {
        closeFormModal();
      }
      await fetchStudents();
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
        title="Students"
        description="Manage student records and view enrolled subjects and teachers."
        actions={
          <>
            <button type="button" className="btn btn--ghost" onClick={openSearchModal}>
              Lookup
            </button>
            <button type="button" className="btn btn--primary" onClick={openCreateModal}>
              + Add Student
            </button>
          </>
        }
      />

      <StudentTable
        students={students}
        loading={loading}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onEdit={openEditModal}
        onDelete={setDeletingStudent}
        onViewDetails={handleViewDetails}
        onRefresh={fetchStudents}
      />

      <FormModal
        open={showFormModal}
        title={editingStudent ? 'Update Student' : 'Create Student'}
        subtitle={
          editingStudent
            ? `Editing student #${editingStudent.id}`
            : 'Add a new student to the system'
        }
        onClose={closeFormModal}
      >
        <StudentForm
          embedded
          editingStudent={editingStudent}
          grades={grades}
          onSubmit={handleCreateOrUpdate}
          onCancelEdit={closeFormModal}
          loading={formLoading}
        />
      </FormModal>

      <FormModal
        open={showSearchModal}
        title={detailsPrefillId ? 'Student Details' : 'Find Student'}
        subtitle={
          detailsPrefillId
            ? `Viewing details for student #${detailsPrefillId}`
            : 'Look up a student with subjects and teachers'
        }
        onClose={closeSearchModal}
      >
        <SearchStudent
          embedded
          students={students}
          onSearch={handleSearch}
          loading={searchLoading}
          prefillId={detailsPrefillId}
          initialResult={prefillResult}
        />
      </FormModal>

      <ConfirmDeleteModal
        open={!!deletingStudent}
        title="Delete Student"
        message={
          <>
            Delete <strong>{deletingStudent?.name}</strong> (ID #{deletingStudent?.id})? This will
            remove the student from the active list.
          </>
        }
        confirmLabel="Delete Student"
        loading={deleteLoading}
        onConfirm={handleDelete}
        onCancel={() => setDeletingStudent(null)}
      />
    </div>
  );
}
