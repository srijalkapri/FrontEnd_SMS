import type { Subject } from '../types/subject';
import type { TablePaginationProps } from '../types/pagination';
import { PaginationControls } from './ui/PaginationControls';
import { TableScrollWrapper } from './ui/TableScrollWrapper';
import './GradeTable.css';

interface SubjectTableProps extends Partial<TablePaginationProps> {
  subjects: Subject[];
  loading: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onEdit: (subject: Subject) => void;
  onDelete: (subject: Subject) => void;
  onRefresh: () => void;
}

export function SubjectTable({
  subjects,
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
}: SubjectTableProps) {
  return (
    <section className="card grade-table-section">
      <div className="card__header">
        <div>
          <h2 className="card__title">All Subjects</h2>
          <p className="card__subtitle">
            {totalCount} subject{totalCount !== 1 ? 's' : ''} total
          </p>
        </div>
        <div className="grade-table__actions">
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
              placeholder="Search by name or ID..."
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
                : 'No subjects found. Create one to get started.'}
            </p>
          </div>
        ) : (
          <table className="grade-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Subject Name</th>
                <th className="grade-table__actions-col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {subjects.map((subject) => (
                <tr key={subject.id}>
                  <td>
                    <span className="grade-id">#{subject.id}</span>
                  </td>
                  <td>
                    <span className="grade-name">{subject.name}</span>
                  </td>
                  <td>
                    <div className="row-actions">
                      <button
                        className="btn btn--icon btn--edit"
                        onClick={() => onEdit(subject)}
                        title="Edit subject"
                      >
                        <svg viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                      </button>
                      <button
                        className="btn btn--icon btn--delete"
                        onClick={() => onDelete(subject)}
                        title="Delete subject"
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
