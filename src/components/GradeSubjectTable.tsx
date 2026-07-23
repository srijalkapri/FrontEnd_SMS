import type { GradeSubject } from '../types/gradeSubject';
import type { TablePaginationProps } from '../types/pagination';
import { getSubjectTypeLabel } from '../utils/subjectType';
import { PaginationControls } from './ui/PaginationControls';
import { TableScrollWrapper } from './ui/TableScrollWrapper';
import './GradeSubjectTable.css';

interface GradeSubjectTableProps extends Partial<TablePaginationProps> {
  items: GradeSubject[];
  loading: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onEdit: (item: GradeSubject) => void;
  onDelete: (item: GradeSubject) => void;
  onRefresh: () => void;
}

export function GradeSubjectTable({
  items,
  loading,
  searchQuery,
  onSearchChange,
  onEdit,
  onDelete,
  onRefresh,
  totalCount = 0,
  pageNumber = 1,
  pageSize = 10,
  totalPages = 0,
  hasPreviousPage = false,
  hasNextPage = false,
  onPageChange,
  onPageSizeChange,
}: GradeSubjectTableProps) {
  return (
    <section className="card grade-subject-table-section">
      <div className="card__header">
        <div>
          <h2 className="card__title">All Grade Subjects</h2>
          <p className="card__subtitle">
            {totalCount} mapping{totalCount !== 1 ? 's' : ''} total
          </p>
        </div>
        <div className="grade-subject-table__actions">
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
              placeholder="Search grade, subject, teacher..."
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

      <TableScrollWrapper>
        {loading && items.length === 0 ? (
          <div className="table-loading">
            <div className="spinner" />
            <p>Loading grade subjects...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="table-empty">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
              />
            </svg>
            <p>
              {searchQuery
                ? 'No mappings match your search.'
                : 'No grade subjects found. Create one to get started.'}
            </p>
          </div>
        ) : (
          <table className="grade-subject-table">
            <thead>
              <tr>
                <th className="grade-subject-table__index-col">#</th>
                <th>Grade</th>
                <th>Subject</th>
                <th>Type</th>
                <th>Teachers</th>
                <th className="grade-subject-table__actions-col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={item.id}>
                  <td>
                    <span className="row-index">{(pageNumber - 1) * pageSize + index + 1}</span>
                  </td>
                  <td>
                    <div className="cell-primary">{item.gradeName}</div>
                  </td>
                  <td>
                    <div className="cell-primary">{item.subjectName}</div>
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
                        <span className="cell-secondary">—</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="row-actions">
                      <button
                        className="btn btn--icon btn--edit"
                        onClick={() => onEdit(item)}
                        title="Edit mapping"
                      >
                        <svg viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                      </button>
                      <button
                        className="btn btn--icon btn--delete"
                        onClick={() => onDelete(item)}
                        title="Delete mapping"
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
