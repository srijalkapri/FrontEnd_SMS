import type { GradeSubject } from '../types/gradeSubject';
import type { TablePaginationProps } from '../types/pagination';
import { getSubjectTypeLabel } from '../utils/subjectType';
import { PaginationControls } from './ui/PaginationControls';
import './GradeCurriculumTable.css';
import './GradeSubjectTable.css';
import './GradeTable.css';
import './SearchGradeSubject.css';

interface GradeCurriculumTableProps extends Partial<TablePaginationProps> {
  subjects: GradeSubject[];
  loading: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onRefresh: () => void;
}

export function GradeCurriculumTable({
  subjects,
  loading,
  searchQuery,
  onSearchChange,
  onRefresh,
  totalCount = 0,
  pageNumber = 1,
  pageSize = 10,
  totalPages = 0,
  hasPreviousPage = false,
  hasNextPage = false,
  onPageChange,
  onPageSizeChange,
}: GradeCurriculumTableProps) {
  return (
    <section className="card grade-curriculum-table-section">
      <div className="card__header">
        <div>
          <h2 className="card__title">Mapped Subjects</h2>
          <p className="card__subtitle">
            {totalCount} subject{totalCount !== 1 ? 's' : ''} in this grade
          </p>
        </div>
        <div className="grade-curriculum-table__actions">
          <div className="search-input">
            <svg className="search-input__icon" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                clipRule="evenodd"
              />
            </svg>
            <input
              type="text"
              placeholder="Search subject or teacher..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="search-input__field"
            />
          </div>
          <button className="btn btn--ghost" onClick={onRefresh} disabled={loading}>
            <svg
              className={`btn__icon ${loading ? 'btn__icon--spin' : ''}`}
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                clipRule="evenodd"
              />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      <div className="table-wrapper">
        {loading && subjects.length === 0 ? (
          <div className="table-loading">
            <div className="spinner" />
            <p>Loading subjects...</p>
          </div>
        ) : subjects.length === 0 ? (
          <div className="table-empty">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
              />
            </svg>
            <p>
              {searchQuery
                ? 'No subjects match your search.'
                : 'No subjects mapped to this grade yet.'}
            </p>
          </div>
        ) : (
          <table className="grade-subject-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Subject</th>
                <th>Type</th>
                <th>Teachers</th>
              </tr>
            </thead>
            <tbody>
              {subjects.map((item) => (
                <tr key={item.id}>
                  <td>
                    <span className="grade-id">#{item.id}</span>
                  </td>
                  <td>
                    <div className="cell-primary">{item.subjectName}</div>
                    <div className="cell-secondary">Subject ID: {item.subjectId}</div>
                  </td>
                  <td>
                    <span
                      className={`teacher-tag ${item.isOptional ? 'teacher-tag--optional' : 'teacher-tag--compulsory'}`}
                    >
                      {getSubjectTypeLabel(item.isOptional)}
                    </span>
                  </td>
                  <td>
                    <div className="teacher-tags">
                      {item.teachers.length > 0 ? (
                        item.teachers.map((teacher) => (
                          <span key={teacher.id} className="teacher-tag">
                            {teacher.name}
                          </span>
                        ))
                      ) : (
                        <span className="cell-secondary">No teacher assigned</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {onPageChange && onPageSizeChange && (
        <PaginationControls
          totalCount={totalCount}
          pageNumber={pageNumber}
          pageSize={pageSize}
          totalPages={totalPages}
          hasPreviousPage={hasPreviousPage}
          hasNextPage={hasNextPage}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
          loading={loading}
        />
      )}
    </section>
  );
}
