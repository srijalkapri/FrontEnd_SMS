import type { CSSProperties } from 'react';
import type { ChartDatum } from '../../utils/dashboardCharts';
import { AnimatedNumber } from './AnimatedNumber';
import './Dashboard.css';

interface EnrollmentChartProps {
  data: ChartDatum[];
  totalStudents: number;
}

function gradeInitial(label: string): string {
  const parts = label.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return label.slice(0, 2).toUpperCase();
}

export function EnrollmentChart({ data, totalStudents }: EnrollmentChartProps) {
  const enrolledGrades = data.filter((item) => item.value > 0);
  const emptyGrades = data.filter((item) => item.value === 0);
  const largestGrade = enrolledGrades.reduce(
    (best, item) => (item.value > best.value ? item : best),
    enrolledGrades[0] ?? { label: '—', value: 0, color: '#6366f1' },
  );

  if (data.length === 0) {
    return (
      <div className="dashboard-enrollment__empty-side dashboard-enrollment__empty-side--animate">
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
      <div className="dashboard-enrollment__hero dashboard-enrollment__hero--animate">
        <div className="dashboard-enrollment__hero-stat">
          <AnimatedNumber
            value={totalStudents}
            className="dashboard-enrollment__hero-value"
          />
          <span className="dashboard-enrollment__hero-label">Total enrolled</span>
        </div>

        <div className="dashboard-enrollment__stack-wrap">
          <p className="dashboard-enrollment__stack-title">Distribution across grades</p>
          {totalStudents > 0 ? (
            <>
              <div className="dashboard-enrollment__stack" role="img" aria-label="Enrollment distribution">
                {enrolledGrades.map((item, index) => {
                  const widthPct = (item.value / totalStudents) * 100;
                  return (
                    <div
                      key={item.label}
                      className="dashboard-enrollment__stack-segment"
                      style={{
                        width: `${widthPct}%`,
                        background: `linear-gradient(180deg, ${item.color}dd, ${item.color})`,
                        animationDelay: `${0.15 + index * 0.12}s`,
                        '--segment-index': index,
                      } as CSSProperties}
                      title={`${item.label}: ${item.value} student${item.value === 1 ? '' : 's'} (${Math.round(widthPct)}%)`}
                    >
                      {widthPct >= 18 && (
                        <span
                          className="dashboard-enrollment__stack-label"
                          style={{ animationDelay: `${0.45 + index * 0.12}s` }}
                        >
                          {item.label} · {item.value}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="dashboard-enrollment__stack-legend">
                {enrolledGrades.map((item, index) => (
                  <span
                    key={item.label}
                    className="dashboard-enrollment__stack-key dashboard-enrollment__stack-key--animate"
                    style={{ animationDelay: `${0.5 + index * 0.08}s` }}
                  >
                    <span className="dashboard-enrollment__stack-dot" style={{ background: item.color }} />
                    {item.label} ({Math.round((item.value / totalStudents) * 100)}%)
                  </span>
                ))}
              </div>
            </>
          ) : (
            <div className="dashboard-enrollment__stack dashboard-enrollment__stack--empty">
              <span>No students enrolled yet</span>
            </div>
          )}
        </div>

        <div className="dashboard-enrollment__highlights">
          {[
            { value: enrolledGrades.length, label: 'Active grades', accent: false, delay: 0.2 },
            { value: emptyGrades.length, label: 'Empty grades', accent: false, delay: 0.28 },
            ...(largestGrade.value > 0
              ? [{ value: largestGrade.label, label: `Top grade (${largestGrade.value})`, accent: true, delay: 0.36 }]
              : []),
          ].map((pill) => (
            <div
              key={pill.label}
              className={`dashboard-enrollment__pill dashboard-enrollment__pill--animate${
                pill.accent ? ' dashboard-enrollment__pill--accent' : ''
              }`}
              style={{ animationDelay: `${pill.delay}s` }}
            >
              <span className="dashboard-enrollment__pill-value">
                {typeof pill.value === 'number' ? (
                  <AnimatedNumber value={pill.value} duration={700} />
                ) : (
                  pill.value
                )}
              </span>
              <span className="dashboard-enrollment__pill-label">{pill.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="dashboard-enrollment__grades">
        {data.map((item, index) => {
          const sharePct = totalStudents > 0 ? Math.round((item.value / totalStudents) * 100) : 0;
          const isEmpty = item.value === 0;
          const cardDelay = 0.25 + index * 0.1;

          return (
            <article
              key={item.label}
              className={`dashboard-enrollment__grade-card dashboard-enrollment__grade-card--animate${
                isEmpty ? ' dashboard-enrollment__grade-card--empty' : ''
              }`}
              style={{
                '--grade-accent': item.color,
                '--card-delay': `${cardDelay}s`,
                animationDelay: `${cardDelay}s`,
              } as CSSProperties}
            >
              <div
                className="dashboard-enrollment__grade-icon dashboard-enrollment__grade-icon--animate"
                style={{ animationDelay: `${cardDelay + 0.1}s` }}
              >
                {gradeInitial(item.label)}
              </div>
              <div className="dashboard-enrollment__grade-body">
                <div className="dashboard-enrollment__grade-header">
                  <h4 className="dashboard-enrollment__grade-name">{item.label}</h4>
                  <span className="dashboard-enrollment__grade-count">
                    <AnimatedNumber value={item.value} duration={800 + index * 80} />
                    <span className="dashboard-enrollment__grade-count-unit">
                      student{item.value === 1 ? '' : 's'}
                    </span>
                  </span>
                </div>
                <div className="dashboard-enrollment__grade-track">
                  <div
                    className="dashboard-enrollment__grade-fill dashboard-enrollment__grade-fill--animate"
                    style={{
                      '--fill-pct': `${sharePct}%`,
                      animationDelay: `${cardDelay + 0.2}s`,
                    } as CSSProperties}
                  />
                </div>
                <div className="dashboard-enrollment__grade-footer">
                  <span>{isEmpty ? 'No enrollment' : `${sharePct}% of school total`}</span>
                  {!isEmpty && (
                    <span
                      className="dashboard-enrollment__grade-badge dashboard-enrollment__grade-badge--animate"
                      style={{ animationDelay: `${cardDelay + 0.35}s` }}
                    >
                      {item.value === largestGrade.value && enrolledGrades.length > 1 ? 'Largest' : 'Enrolled'}
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
