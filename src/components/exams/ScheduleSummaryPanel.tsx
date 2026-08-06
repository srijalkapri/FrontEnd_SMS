import { TableScrollWrapper } from '../ui/TableScrollWrapper';
import type { ExamResultStats, StudentExamResultSummary } from '../../types/examResult';
import {
  DIVISION_BAND_HINT,
  DIVISION_OPTIONS,
  formatPercentage,
  getDivisionBadgeClass,
} from '../../utils/examResultDivision';

export interface ScheduleSummaryPanelProps {
  examScheduleId: number;
  stats: ExamResultStats | null;
  summaries: StudentExamResultSummary[];
  totalCount: number;
  hasActiveFilters: boolean;
  loading: boolean;
  division: string;
  minPercentage: string;
  maxPercentage: string;
  onDivisionChange: (value: string) => void;
  onMinPercentageChange: (value: string) => void;
  onMaxPercentageChange: (value: string) => void;
  onClearFilters: () => void;
  onRefresh: () => void;
}

export function ScheduleSummaryPanel({
  examScheduleId,
  stats,
  summaries,
  totalCount,
  hasActiveFilters,
  loading,
  division,
  minPercentage,
  maxPercentage,
  onDivisionChange,
  onMinPercentageChange,
  onMaxPercentageChange,
  onClearFilters,
  onRefresh,
}: ScheduleSummaryPanelProps) {
  return (
    <section className="exam-result-summary-panel" aria-label="Result summaries">
      <div className="exam-result-summary-panel__header">
        <div>
          <h3 className="exam-result-summary-panel__title">Class result summary</h3>
          <p className="exam-result-summary-panel__hint">{DIVISION_BAND_HINT}</p>
        </div>
        <div className="exam-result-summary-panel__actions">
          <button
            type="button"
            className="btn btn--ghost"
            onClick={onRefresh}
            disabled={loading}
          >
            Refresh
          </button>
        </div>
      </div>

      {stats ? (
        <div className="exam-result-stats-grid">
          <div className="exam-result-stats-grid__item">
            <span className="exam-result-stats-grid__label">Total</span>
            <span className="exam-result-stats-grid__value">{stats.totalStudents}</span>
          </div>
          <div className="exam-result-stats-grid__item exam-result-stats-grid__item--pass">
            <span className="exam-result-stats-grid__label">Passed</span>
            <span className="exam-result-stats-grid__value">{stats.passed ?? 0}</span>
          </div>
          <div className="exam-result-stats-grid__item exam-result-stats-grid__item--fail">
            <span className="exam-result-stats-grid__label">Failed</span>
            <span className="exam-result-stats-grid__value">{stats.failed ?? 0}</span>
          </div>
          <div className="exam-result-stats-grid__item">
            <span className="exam-result-stats-grid__label">Distinction</span>
            <span className="exam-result-stats-grid__value">{stats.distinction ?? 0}</span>
          </div>
          <div className="exam-result-stats-grid__item">
            <span className="exam-result-stats-grid__label">First</span>
            <span className="exam-result-stats-grid__value">{stats.first ?? 0}</span>
          </div>
          <div className="exam-result-stats-grid__item">
            <span className="exam-result-stats-grid__label">Second</span>
            <span className="exam-result-stats-grid__value">{stats.second ?? 0}</span>
          </div>
          <div className="exam-result-stats-grid__item">
            <span className="exam-result-stats-grid__label">Third</span>
            <span className="exam-result-stats-grid__value">{stats.third ?? 0}</span>
          </div>
        </div>
      ) : !loading ? (
        <p className="exam-result-summary-panel__empty-note">
          No summary stats yet for schedule #{examScheduleId}.
        </p>
      ) : null}

      <div className="exam-result-summary-filters">
        <div className="form-group">
          <label className="form-label" htmlFor="summary-division">
            Division
          </label>
          <select
            id="summary-division"
            className="form-input"
            value={division}
            onChange={(event) => onDivisionChange(event.target.value)}
            disabled={loading}
          >
            <option value="">All divisions</option>
            {DIVISION_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="summary-min-pct">
            Min %
          </label>
          <input
            id="summary-min-pct"
            type="number"
            className="form-input"
            min={0}
            max={100}
            step={0.01}
            placeholder="e.g. 70"
            value={minPercentage}
            onChange={(event) => onMinPercentageChange(event.target.value)}
            disabled={loading}
          />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="summary-max-pct">
            Max %
          </label>
          <input
            id="summary-max-pct"
            type="number"
            className="form-input"
            min={0}
            max={100}
            step={0.01}
            placeholder="e.g. 100"
            value={maxPercentage}
            onChange={(event) => onMaxPercentageChange(event.target.value)}
            disabled={loading}
          />
        </div>
        <div className="exam-result-summary-filters__actions">
          <button
            type="button"
            className="btn btn--ghost"
            onClick={onClearFilters}
            disabled={loading || !hasActiveFilters}
          >
            Clear filters
          </button>
        </div>
      </div>

      <div className="exam-result-summary-panel__meta">
        {loading
          ? 'Loading summaries…'
          : hasActiveFilters
            ? `Showing ${summaries.length} of ${totalCount} student${totalCount === 1 ? '' : 's'}`
            : `${totalCount} student${totalCount === 1 ? '' : 's'}`}
      </div>

      {loading ? (
        <div className="table-loading table-loading--compact">
          <div className="spinner" />
          <p>Loading summaries…</p>
        </div>
      ) : summaries.length === 0 ? (
        <div className="exam-result-summary-panel__empty">
          <p>
            {hasActiveFilters
              ? 'No students match these filters. Try another division or clear filters.'
              : totalCount === 0
                ? 'No summary rows found for this schedule.'
                : 'No students to display.'}
          </p>
        </div>
      ) : (
        <TableScrollWrapper>
          <table className="grade-table exam-result-summary-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Total</th>
                <th>%</th>
                <th>Division</th>
                <th>Result</th>
              </tr>
            </thead>
            <tbody>
              {summaries.map((row) => (
                <tr key={row.studentId}>
                  <td>
                    <div className="exam-result-summary-table__student">
                      <span className="grade-name">{row.studentName}</span>
                      <span className="grade-id">#{row.studentId}</span>
                    </div>
                  </td>
                  <td className="exam-result-summary-table__num">
                    {row.totalObtained} / {row.totalMarks}
                  </td>
                  <td className="exam-result-summary-table__num">
                    {formatPercentage(row.percentage)}
                  </td>
                  <td>
                    <span className={getDivisionBadgeClass(String(row.division))}>
                      {row.division}
                    </span>
                  </td>
                  <td>
                    <span
                      className={
                        row.isPassed
                          ? 'exam-result-status exam-result-status--approved'
                          : 'exam-result-status exam-result-status--rejected'
                      }
                    >
                      {row.isPassed ? 'Passed' : 'Failed'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableScrollWrapper>
      )}
    </section>
  );
}
