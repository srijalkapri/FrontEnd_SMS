import { useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import type { ChartDatum } from '../../utils/dashboardCharts';
import { AnimatedNumber } from './AnimatedNumber';
import './Dashboard.css';

interface EnrollmentChartProps {
  data: ChartDatum[];
  totalStudents: number;
}

/** Prefer grade number (Class 10 → "10"); fall back to short unique label. */
function gradeBadge(label: string): string {
  const digits = label.match(/\d+/);
  if (digits) return digits[0];
  const cleaned = label.replace(/[^a-zA-Z0-9]/g, '');
  return cleaned.slice(0, 3).toUpperCase() || '—';
}

function gradeStatus(
  value: number,
  largestValue: number,
  average: number,
  enrolledCount: number,
): string {
  if (value === 0) return 'Empty';
  if (value === largestValue && enrolledCount > 1) return 'Largest';
  if (value >= average) return 'Above avg';
  return 'Enrolled';
}

export function EnrollmentChart({ data, totalStudents }: EnrollmentChartProps) {
  const [activeGrade, setActiveGrade] = useState<string | null>(null);

  const enrolledGrades = useMemo(() => data.filter((item) => item.value > 0), [data]);
  const emptyGrades = useMemo(() => data.filter((item) => item.value === 0), [data]);

  const ranked = useMemo(
    () =>
      [...data]
        .map((item) => ({
          ...item,
          share: totalStudents > 0 ? Math.round((item.value / totalStudents) * 100) : 0,
        }))
        .sort((a, b) => b.value - a.value || a.label.localeCompare(b.label)),
    [data, totalStudents],
  );

  const largestGrade = enrolledGrades.reduce(
    (best, item) => (item.value > best.value ? item : best),
    enrolledGrades[0] ?? { label: '—', value: 0, color: '#6366f1' },
  );

  const averagePerActive =
    enrolledGrades.length > 0 ? totalStudents / enrolledGrades.length : 0;

  const topShare =
    totalStudents > 0 && largestGrade.value > 0
      ? Math.round((largestGrade.value / totalStudents) * 100)
      : 0;

  const secondLargest = ranked.find((g) => g.value > 0 && g.label !== largestGrade.label);
  const leadGap =
    totalStudents > 0 && secondLargest
      ? Math.max(0, Math.round(((largestGrade.value - secondLargest.value) / totalStudents) * 100))
      : topShare;

  const concentrationScore =
    totalStudents > 0
      ? Math.round(
          enrolledGrades.reduce((sum, grade) => {
            const share = grade.value / totalStudents;
            return sum + share * share;
          }, 0) * 100,
        )
      : 0;

  const balanceLabel =
    topShare >= 70 ? 'Top-heavy' : topShare >= 50 ? 'Concentrated' : 'Balanced';

  const activeItem = ranked.find((g) => g.label === activeGrade) ?? null;
  const maxValue = Math.max(...data.map((d) => d.value), 1);

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
    <div className="dashboard-enrollment dashboard-enrollment--advanced dashboard-enrollment--animate">
      <div className="dashboard-enrollment__kpi-strip">
        {[
          { label: 'Total enrolled', value: totalStudents, accent: true },
          { label: 'Active grades', value: enrolledGrades.length },
          { label: 'Empty grades', value: emptyGrades.length },
          { label: 'Avg / active', value: Math.round(averagePerActive * 10) / 10 },
          { label: 'Top share', value: `${topShare}%` },
        ].map((kpi, index) => (
          <div
            key={kpi.label}
            className={`dashboard-enrollment__kpi${kpi.accent ? ' dashboard-enrollment__kpi--accent' : ''}`}
            style={{ animationDelay: `${0.08 + index * 0.06}s` } as CSSProperties}
          >
            <span className="dashboard-enrollment__kpi-label">{kpi.label}</span>
            <span className="dashboard-enrollment__kpi-value">
              {typeof kpi.value === 'number' ? (
                <AnimatedNumber value={kpi.value} duration={750} />
              ) : (
                kpi.value
              )}
            </span>
          </div>
        ))}
      </div>

      <div className="dashboard-enrollment__stage">
        <div className="dashboard-enrollment__stage-head">
          <div>
            <p className="dashboard-enrollment__stage-title">Enrollment race by grade</p>
            <p className="dashboard-enrollment__stage-sub">
              Ranked by headcount · hover a row for focus details
            </p>
          </div>
          <div className="dashboard-enrollment__stage-chips">
            <span className="dashboard-enrollment__chip dashboard-enrollment__chip--primary">
              {balanceLabel}
            </span>
            <span className="dashboard-enrollment__chip">
              Concentration {concentrationScore}
            </span>
            <span className="dashboard-enrollment__chip">
              Lead gap {leadGap}%
            </span>
          </div>
        </div>

        <div className="dashboard-enrollment__race" role="list" aria-label="Enrollment by grade ranked">
          {ranked.map((item, index) => {
            const isActive = activeGrade === item.label;
            const isDimmed = activeGrade !== null && !isActive;
            const barPct = Math.max(4, Math.round((item.value / maxValue) * 100));
            const status = gradeStatus(
              item.value,
              largestGrade.value,
              averagePerActive,
              enrolledGrades.length,
            );
            const delay = 0.12 + index * 0.08;

            return (
              <button
                key={item.label}
                type="button"
                role="listitem"
                className={[
                  'dashboard-enrollment__race-row',
                  isActive ? 'dashboard-enrollment__race-row--active' : '',
                  isDimmed ? 'dashboard-enrollment__race-row--dimmed' : '',
                  item.value === 0 ? 'dashboard-enrollment__race-row--empty' : '',
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
                onFocus={() => setActiveGrade(item.label)}
                onBlur={() => setActiveGrade(null)}
              >
                <span className="dashboard-enrollment__race-rank">#{index + 1}</span>
                <span className="dashboard-enrollment__race-badge">{gradeBadge(item.label)}</span>
                <span className="dashboard-enrollment__race-name" title={item.label}>
                  {item.label}
                </span>
                <span className="dashboard-enrollment__race-track">
                  <span
                    className="dashboard-enrollment__race-fill"
                    style={
                      {
                        '--bar-width': `${item.value === 0 ? 0 : barPct}%`,
                        animationDelay: `${delay + 0.12}s`,
                      } as CSSProperties
                    }
                  />
                  {isActive && item.value > 0 && (
                    <span className="dashboard-enrollment__race-float">
                      {item.value} · {item.share}%
                    </span>
                  )}
                </span>
                <span className="dashboard-enrollment__race-stats">
                  <span className="dashboard-enrollment__race-count">
                    <AnimatedNumber value={item.value} duration={700 + index * 60} />
                  </span>
                  <span className="dashboard-enrollment__race-share">{item.share}%</span>
                </span>
                <span className="dashboard-enrollment__race-status">{status}</span>
              </button>
            );
          })}
        </div>

        <div
          className={`dashboard-enrollment__focus${activeItem ? ' dashboard-enrollment__focus--live' : ''}`}
          aria-live="polite"
        >
          {activeItem ? (
            <>
              <span
                className="dashboard-enrollment__focus-swatch"
                style={{ background: activeItem.color }}
              />
              <div className="dashboard-enrollment__focus-copy">
                <strong>{activeItem.label}</strong>
                <span>
                  {activeItem.value === 0
                    ? 'No students enrolled in this grade yet'
                    : `${activeItem.value} student${activeItem.value === 1 ? '' : 's'} · ${activeItem.share}% of school total · rank #${ranked.findIndex((g) => g.label === activeItem.label) + 1}`}
                </span>
              </div>
              {activeItem.value > 0 && (
                <span className="dashboard-enrollment__focus-delta">
                  {activeItem.value === largestGrade.value
                    ? `Leading by ${leadGap}% share`
                    : `${Math.max(0, topShare - activeItem.share)}% behind top grade`}
                </span>
              )}
            </>
          ) : (
            <p className="dashboard-enrollment__focus-idle">
              Hover a grade to inspect share, rank, and lead distance
            </p>
          )}
        </div>
      </div>

      <div className="dashboard-enrollment__cards">
        {ranked.map((item, index) => {
          const isEmpty = item.value === 0;
          const isActive = activeGrade === item.label;
          const isDimmed = activeGrade !== null && !isActive;
          const status = gradeStatus(
            item.value,
            largestGrade.value,
            averagePerActive,
            enrolledGrades.length,
          );
          const delay = 0.35 + index * 0.08;

          return (
            <article
              key={item.label}
              className={[
                'dashboard-enrollment__card',
                isEmpty ? 'dashboard-enrollment__card--empty' : '',
                isActive ? 'dashboard-enrollment__card--active' : '',
                isDimmed ? 'dashboard-enrollment__card--dimmed' : '',
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
              <div className="dashboard-enrollment__card-top">
                <span className="dashboard-enrollment__card-badge">{gradeBadge(item.label)}</span>
                <div className="dashboard-enrollment__card-titles">
                  <h4>{item.label}</h4>
                  <p>
                    Rank #{index + 1}
                    {!isEmpty && ` · ${status}`}
                  </p>
                </div>
                <div className="dashboard-enrollment__card-count">
                  <AnimatedNumber value={item.value} duration={800 + index * 70} />
                  <span>student{item.value === 1 ? '' : 's'}</span>
                </div>
              </div>

              <div className="dashboard-enrollment__card-meter" aria-hidden="true">
                <span
                  className="dashboard-enrollment__card-meter-fill"
                  style={
                    {
                      '--fill-pct': `${item.share}%`,
                      animationDelay: `${delay + 0.15}s`,
                    } as CSSProperties
                  }
                />
              </div>

              <div className="dashboard-enrollment__card-foot">
                <span>{isEmpty ? 'Awaiting enrollment' : `${item.share}% of school total`}</span>
                <span className="dashboard-enrollment__card-tag">{status}</span>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
