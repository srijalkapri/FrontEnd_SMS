import type { Student } from '../types/student';
import type { Grade } from '../types/grade';
import type { TablePaginationProps } from '../types/pagination';
import { PaginationControls } from './ui/PaginationControls';
import { TableScrollWrapper } from './ui/TableScrollWrapper';
import './GradeTable.css';

interface StudentTableProps extends Partial<TablePaginationProps> {
  students: Student[];
  loading: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onEdit: (student: Student) => void;
  onDelete: (student: Student) => void;
  onViewDetails: (student: Student) => void;
  onRefresh: () => void;
  getSubjectCount?: (student: Student) => number;
  grades?: Grade[];
  gradeFilter?: string;
  onGradeFilterChange?: (value: string) => void;
  selectedGradeLabel?: string;
}

export function StudentTable({
  students,
  loading,
  searchQuery,
  onSearchChange,
  onEdit,
  onDelete,
  onViewDetails,
  onRefresh,
  totalCount = 0,
  pageNumber = 1,
  pageSize = 10,
  totalPages = 0,
  hasPreviousPage = false,
  hasNextPage = false,
  onPageChange,
  onPageSizeChange,
  getSubjectCount = (student) => student.subjects.length,
  grades = [],
  gradeFilter = '',
  onGradeFilterChange,
  selectedGradeLabel,
}: StudentTableProps) {
  const hasGradeSelection = gradeFilter !== '';
  const tableTitle = selectedGradeLabel ? `${selectedGradeLabel} Students` : 'Students';

  return (
    <section className="card grade-table-section">
      <div className="card__header">
        <div>
          <h2 className="card__title">{tableTitle}</h2>
          <p className="card__subtitle">
            {hasGradeSelection
              ? `${totalCount} student${totalCount !== 1 ? 's' : ''} total`
              : 'Select a class to load students'}
          </p>
        </div>
      </div>

      <div className="grade-table-toolbar">
        {onGradeFilterChange && (
          <div className="grade-table-toolbar__filters">
            <label className="grade-table-toolbar__label" htmlFor="student-grade-filter">
              Class
            </label>
            <select
              id="student-grade-filter"
              className="form-input grade-table-toolbar__select"
              value={gradeFilter}
              onChange={(e) => onGradeFilterChange(e.target.value)}
              disabled={loading && hasGradeSelection}
            >
              <option value="">Select class…</option>
              <option value="all">All classes</option>
              {grades.map((grade) => (
                <option key={grade.id} value={grade.id}>
                  {grade.className}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="grade-table-toolbar__actions">
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
              placeholder="Search name, phone, email..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="search-input__field"
              disabled={!hasGradeSelection}
            />
          </div>
          <button
            className="btn btn--ghost"
            onClick={onRefresh}
            disabled={loading || !hasGradeSelection}
          >
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

      <TableScrollWrapper>
        {!hasGradeSelection ? (
          <div className="table-empty">
            <p>Select a class from the dropdown to view students.</p>
          </div>
        ) : loading && students.length === 0 ? (
          <div className="table-loading">
            <div className="spinner" />
            <p>Loading students...</p>
          </div>
        ) : students.length === 0 ? (
          <div className="table-empty">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
              />
            </svg>
            <p>
              {searchQuery
                ? 'No students match your search.'
                : 'No students found in this class.'}
            </p>
          </div>
        ) : (
          <table className="grade-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Grade</th>
                <th>Subjects</th>
                <th className="grade-table__actions-col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id}>
                  <td>
                    <span className="grade-id">#{student.id}</span>
                  </td>
                  <td>
                    <span className="grade-name">{student.name}</span>
                  </td>
                  <td>{student.phoneNo}</td>
                  <td>
                    <a className="contact-link" href={`mailto:${student.email}`}>
                      {student.email}
                    </a>
                  </td>
                  <td>{student.gradeName}</td>
                  <td>
                    <span className="grade-id">{getSubjectCount(student)}</span>
                  </td>
                  <td>
                    <div className="row-actions">
                      <button
                        className="btn btn--icon btn--edit"
                        onClick={() => onViewDetails(student)}
                        title="View details"
                      >
                        <svg viewBox="0 0 20 20" fill="currentColor">
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                          <path
                            fillRule="evenodd"
                            d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                      <button
                        className="btn btn--icon btn--edit"
                        onClick={() => onEdit(student)}
                        title="Edit student"
                      >
                        <svg viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                      </button>
                      <button
                        className="btn btn--icon btn--delete"
                        onClick={() => onDelete(student)}
                        title="Delete student"
                      >
                        <svg viewBox="0 0 20 20" fill="currentColor">
                          <path
                            fillRule="evenodd"
                            d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </TableScrollWrapper>

      {onPageChange && onPageSizeChange && hasGradeSelection && (
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
