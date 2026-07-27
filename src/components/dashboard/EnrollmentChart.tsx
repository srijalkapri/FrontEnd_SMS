import { useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import type { ChartDatum } from '../../utils/dashboardCharts';
import { AnimatedNumber } from './AnimatedNumber';
import './Dashboard.css';

interface EnrollmentChartProps {
  data: ChartDatum[];
  totalStudents: number;
}

/** Class 10 → "10", Grade A → "A", otherwise first 2 chars. */
function gradeBadge(label: string): string {
  const digits = label.match(/\d+/);
  if (digits) return digits[0];
  const letters = label.replace(/[^a-zA-Z]/g, '');
  if (letters.length >= 2) return letters.slice(0, 2).toUpperCase();
  return label.trim().slice(0, 2).toUpperCase() || '—';
}

export function EnrollmentChart({ data, totalStudents }: EnrollmentChartProps) {
  const [activeGrade, setActiveGrade] = useState<string | null>(null);

  const enrolledGrades = useMemo(() => data.filter((item) => item.value > 0), [data]);
  const emptyGrades = useMemo(() => data.filter((item) => item.value === 0), [data]);

  const largestGrade = useMemo(
    () =>
      enrolledGrades.reduce(
        (best, item) => (item.value > best.value ? item : best),
        enrolledGrades[0] ?? { label: '—', value: 0, color: '#6366f1' },
      ),
    [enrolledGrades],
  );

  const averagePerActive =
    enrolledGrades.length > 0 ? totalStudents / enrolledGrades.length : 0;

  if (data.length === 0) {
    return (
      <div className="dashboard-enrollment__empty-side">
        <svg className="dashboard-enrollment__empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342" />
        </svg>
        <p>No grades configured yet.</p>
        <p className="dashboard-chart-empty__hint">Create grades, then enroll students.</p>
      </div>
    );
  }

  return (
    <div className="dashboard-enrollment dashboard-enrollment--animate">
      <div className="dashboard-enrollment__summary">
        <div className="dashboard-enrollment__summary-total">
          <AnimatedNumber value={totalStudents} className="dashboard-enrollment__summary-value" />
          <span className="dashboard-enrollment__summary-label">Total enrolled</span>
        </div>

        <div className="dashboard-enrollment__summary-stats">
          <div className="dashboard-enrollment__stat">
            <strong><AnimatedNumber value={enrolledGrades.length} duration={700} /></strong>
            <span>Active grades</span>
          </div>
          <div className="dashboard-enrollment__stat">
            <strong><AnimatedNumber value={emptyGrades.length} duration={700} /></strong>
            <span>Empty grades</span>
          </div>
          {largestGrade.value > 0 && (
            <div className="dashboard-enrollment__stat dashboard-enrollment__stat--accent">
              <strong title={largestGrade.label}>{largestGrade.label}</strong>
              <span>Top grade ({largestGrade.value})</span>
            </div>
          )}
        </div>
      </div>

      <div className="dashboard-enrollment__distribution">
        <p className="dashboard-enrollment__section-title">Distribution across grades</p>

        {totalStudents > 0 ? (
          <>
            <div
              className="dashboard-enrollment__bar"
              role="img"
              aria-label="Enrollment distribution"
            >
              {enrolledGrades.map((item, index) => {
                const widthPct = (item.value / totalStudents) * 100;
                const isActive = activeGrade === item.label;
                const isDimmed = activeGrade !== null && !isActive;

                return (
                  <div
                    key={item.label}
                    className={[
                      'dashboard-enrollment__bar-seg',
                      isActive ? 'dashboard-enrollment__bar-seg--active' : '',
                      isDimmed ? 'dashboard-enrollment__bar-seg--dimmed' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    style={
                      {
                        width: `${widthPct}%`,
                        background: `linear-gradient(180deg, ${item.color}dd, ${item.color})`,
                        animationDelay: `${0.1 + index * 0.1}s`,
                      } as CSSProperties
                    }
                    title={`${item.label}: ${item.value} (${Math.round(widthPct)}%)`}
                    onMouseEnter={() => setActiveGrade(item.label)}
                    onMouseLeave={() => setActiveGrade(null)}
                  />
                );
              })}
            </div>

            <div className="dashboard-enrollment__legend">
              {enrolledGrades.map((item) => {
                const pct = Math.round((item.value / totalStudents) * 100);
                const isActive = activeGrade === item.label;
                const isDimmed = activeGrade !== null && !isActive;

                return (
                  <button
                    key={item.label}
                    type="button"
                    className={[
                      'dashboard-enrollment__legend-item',
                      isActive ? 'dashboard-enrollment__legend-item--active' : '',
                      isDimmed ? 'dashboard-enrollment__legend-item--dimmed' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    onMouseEnter={() => setActiveGrade(item.label)}
                    onMouseLeave={() => setActiveGrade(null)}
                  >
                    <span
                      className="dashboard-enrollment__legend-dot"
                      style={{ background: item.color }}
                    />
                    <span className="dashboard-enrollment__legend-name">{item.label}</span>
                    <span className="dashboard-enrollment__legend-meta">
                      {item.value} · {pct}%
                    </span>
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          <div className="dashboard-enrollment__bar dashboard-enrollment__bar--empty">
            No students enrolled yet
          </div>
        )}
      </div>

      <div className="dashboard-enrollment__grades">
        {data.map((item, index) => {
          const sharePct = totalStudents > 0 ? Math.round((item.value / totalStudents) * 100) : 0;
          const isEmpty = item.value === 0;
          const isLargest = !isEmpty && item.value === largestGrade.value && enrolledGrades.length > 1;
          const isAboveAvg = !isEmpty && item.value >= averagePerActive;
          const isActive = activeGrade === item.label;
          const isDimmed = activeGrade !== null && !isActive;
          const delay = 0.2 + index * 0.08;

          return (
            <article
              key={item.label}
              className={[
                'dashboard-enrollment__grade',
                isEmpty ? 'dashboard-enrollment__grade--empty' : '',
                isActive ? 'dashboard-enrollment__grade--active' : '',
                isDimmed ? 'dashboard-enrollment__grade--dimmed' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              style={
                {
                  '--grade-accent': item.color ?? '#6366f1',
                  animationDelay: `${delay}s`,
                } as CSSProperties
              }
              onMouseEnter={() => setActiveGrade(item.label)}
              onMouseLeave={() => setActiveGrade(null)}
            >
              <div className="dashboard-enrollment__grade-badge">{gradeBadge(item.label)}</div>

              <div className="dashboard-enrollment__grade-main">
                <div className="dashboard-enrollment__grade-head">
                  <h4 className="dashboard-enrollment__grade-name">{item.label}</h4>
                  <div className="dashboard-enrollment__grade-count">
                    <AnimatedNumber value={item.value} duration={750 + index * 60} />
                    <span>student{item.value === 1 ? '' : 's'}</span>
                  </div>
                </div>

                <div className="dashboard-enrollment__grade-track">
                  <div
                    className="dashboard-enrollment__grade-fill"
                    style={
                      {
                        '--fill-pct': `${sharePct}%`,
                        animationDelay: `${delay + 0.15}s`,
                      } as CSSProperties
                    }
                  />
                </div>

                <div className="dashboard-enrollment__grade-foot">
                  <span>{isEmpty ? 'No enrollment' : `${sharePct}% of school total`}</span>
                  {!isEmpty && (
                    <span className="dashboard-enrollment__grade-tag">
                      {isLargest ? 'Largest' : isAboveAvg ? 'Above avg' : 'Enrolled'}
                    </span>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
