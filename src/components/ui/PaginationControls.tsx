import type { TablePaginationProps } from '../../types/pagination';
import './PaginationControls.css';

interface PaginationControlsProps extends TablePaginationProps {
  loading?: boolean;
}

const PAGE_SIZE_OPTIONS = [10, 25, 50];

export function PaginationControls({
  totalCount,
  pageNumber,
  pageSize,
  totalPages,
  hasPreviousPage,
  hasNextPage,
  onPageChange,
  onPageSizeChange,
  loading = false,
}: PaginationControlsProps) {
  if (totalCount === 0) {
    return null;
  }

  const start = (pageNumber - 1) * pageSize + 1;
  const end = Math.min(pageNumber * pageSize, totalCount);

  return (
    <div className="pagination">
      <div className="pagination__info">
        Showing {start}–{end} of {totalCount}
      </div>

      <div className="pagination__controls">
        <label className="pagination__size">
          <span>Rows</span>
          <select
            value={pageSize}
            onChange={(event) => onPageSizeChange(Number(event.target.value))}
            disabled={loading}
          >
            {PAGE_SIZE_OPTIONS.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>

        <span className="pagination__page">
          Page {pageNumber} of {Math.max(totalPages, 1)}
        </span>

        <button
          type="button"
          className="btn btn--ghost btn--compact"
          onClick={() => onPageChange(pageNumber - 1)}
          disabled={loading || !hasPreviousPage}
        >
          Previous
        </button>
        <button
          type="button"
          className="btn btn--ghost btn--compact"
          onClick={() => onPageChange(pageNumber + 1)}
          disabled={loading || !hasNextPage}
        >
          Next
        </button>
      </div>
    </div>
  );
}
