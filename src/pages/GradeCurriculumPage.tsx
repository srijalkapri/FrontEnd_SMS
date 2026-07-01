import { Link, Navigate, useParams } from 'react-router-dom';
import { GradeCurriculumTable } from '../components/GradeCurriculumTable';
import { PageHeader } from '../components/layout/PageHeader';
import { useGradeCurriculumDetail } from '../hooks/useGradeCurriculumDetail';
import './GradeCurriculumPage.css';

export function GradeCurriculumPage() {
  const { gradeId: gradeIdParam } = useParams<{ gradeId: string }>();
  const gradeId = parseInt(gradeIdParam ?? '', 10);

  const {
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
  } = useGradeCurriculumDetail(Number.isNaN(gradeId) ? 0 : gradeId);

  if (Number.isNaN(gradeId) || gradeId <= 0) {
    return <Navigate to="/grades" replace />;
  }

  if (!loading && notFound) {
    return <Navigate to="/grades" replace />;
  }

  return (
    <div className="page-content grade-curriculum-page">
      <Link to="/grades" className="grade-curriculum-page__back">
        <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path
            fillRule="evenodd"
            d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
            clipRule="evenodd"
          />
        </svg>
        Back to Grades
      </Link>

      <PageHeader
        badge="Academic Management"
        title={grade ? `${grade.className} — Subjects` : 'Grade Subjects'}
        description={
          grade
            ? `All subjects mapped to ${grade.className} and their assigned teachers.`
            : 'Loading grade curriculum...'
        }
        actions={
          <Link to="/grade-subjects" className="btn btn--primary">
            Manage Mappings
          </Link>
        }
      />

      <GradeCurriculumTable
        subjects={subjects}
        loading={loading}
        searchQuery={search}
        onSearchChange={setSearch}
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
    </div>
  );
}
