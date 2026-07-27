import type { CSSProperties } from 'react';
import { useId, useMemo, useState } from 'react';
import type { ChartDatum } from '../../utils/dashboardCharts';
import { getExamResultStatusLabel } from '../../utils/examResultStatus';
import { buildPieSlices, describeDonutSlice, lightenColor } from '../../utils/chartGeometry';
import './Dashboard.css';

interface DonutChartProps {
  data: ChartDatum[];
  formatLabel?: (label: string) => string;
  size?: number;
  centerLabel?: string;
  valueUnit?: string;
}

function pluralize(count: number, unit: string): string {
  if (count === 1) return `1 ${unit}`;
  if (unit.endsWith('s')) return `${count} ${unit}`;
  return `${count} ${unit}s`;
}

export function DonutChart({
  data,
  formatLabel,
  size = 200,
  centerLabel = 'total',
  valueUnit = 'item',
}: DonutChartProps) {
  const uid = useId().replace(/:/g, '');
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const slices = useMemo(() => buildPieSlices(data, 3), [data]);
  const total = useMemo(() => data.reduce((sum, item) => sum + item.value, 0), [data]);

  if (total === 0) return null;

  const cx = size / 2;
  const cy = size / 2;
  const outerRadius = size / 2 - 10;
  const innerRadius = outerRadius * 0.62;
  const active = activeIndex != null ? slices[activeIndex] : null;

  const defaultFormatLabel = (label: string) => {
    if (['Draft', 'PendingApproval', 'Approved', 'Rejected', 'Not started'].includes(label)) {
      return getExamResultStatusLabel(label as Parameters<typeof getExamResultStatusLabel>[0]);
    }
    return label;
  };

  const labelFormatter = formatLabel ?? defaultFormatLabel;
  const activeLabel = active ? labelFormatter(active.label) : null;

  return (
    <div className="dashboard-donut">
      <div className="dashboard-donut__visual">
        <svg
          className="dashboard-donut__ring"
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          role="img"
          aria-label="Donut chart"
        >
          <defs>
            <filter id={`donutGlow-${uid}`} x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            {slices.map((slice, index) => (
              <linearGradient
                key={`dgrad-${slice.label}`}
                id={`donutGrad-${uid}-${index}`}
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor={lightenColor(slice.color ?? '#6366f1', 0.2)} />
                <stop offset="100%" stopColor={slice.color ?? '#6366f1'} />
              </linearGradient>
            ))}
          </defs>

          {slices.map((slice, index) => {
            const isActive = activeIndex === index;
            const isDimmed = activeIndex !== null && !isActive;

            return (
              <path
                key={slice.label}
                d={describeDonutSlice(
                  cx,
                  cy,
                  outerRadius,
                  innerRadius,
                  slice.startAngle,
                  slice.endAngle,
                )}
                fill={`url(#donutGrad-${uid}-${index})`}
                className={[
                  'dashboard-donut__slice',
                  isActive ? 'dashboard-donut__slice--active' : '',
                  isDimmed ? 'dashboard-donut__slice--dimmed' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                style={{ animationDelay: `${index * 0.08}s` }}
                filter={`url(#donutGlow-${uid})`}
                onMouseEnter={() => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
              >
                <title>
                  {[
                    labelFormatter(slice.label),
                    `${slice.percent}%`,
                    ...(slice.details ?? []),
                  ].join(' · ')}
                </title>
              </path>
            );
          })}

          <text x={cx} y={cy - 4} textAnchor="middle" className="dashboard-donut__center-value">
            {active ? active.value : total}
          </text>
          <text x={cx} y={cy + 14} textAnchor="middle" className="dashboard-donut__center-label">
            {activeLabel ?? centerLabel}
          </text>
        </svg>

        {active && activeLabel && (
          <div
            className="dashboard-chart-tooltip"
            role="tooltip"
            style={{ '--slice-color': active.color ?? '#6366f1' } as CSSProperties}
          >
            <div className="dashboard-chart-tooltip__head">
              <span
                className="dashboard-chart-tooltip__dot"
                style={{ background: active.color }}
              />
              <strong className="dashboard-chart-tooltip__title">{activeLabel}</strong>
              <span className="dashboard-chart-tooltip__pct">{active.percent}%</span>
            </div>
            <p className="dashboard-chart-tooltip__meta">
              {pluralize(active.value, valueUnit)} · {active.percent}% of {total}
            </p>
            {active.details && active.details.length > 0 && (
              <div className="dashboard-chart-tooltip__details">
                <span className="dashboard-chart-tooltip__details-label">
                  {active.detailsLabel ?? 'Includes'}
                </span>
                <ul className="dashboard-chart-tooltip__list">
                  {active.details.map((detail) => (
                    <li key={detail}>{detail}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="dashboard-donut__legend">
        {slices.map((slice, index) => {
          const isActive = activeIndex === index;
          return (
            <button
              key={slice.label}
              type="button"
              className={[
                'dashboard-legend-item',
                'dashboard-legend-item--compact',
                'dashboard-legend-item--interactive',
                isActive ? 'dashboard-legend-item--active' : '',
                activeIndex !== null && !isActive ? 'dashboard-legend-item--dimmed' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              onMouseEnter={() => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
              onFocus={() => setActiveIndex(index)}
              onBlur={() => setActiveIndex(null)}
            >
              <span
                className="dashboard-legend-item__dot"
                style={{ background: slice.color, boxShadow: `0 0 6px ${slice.color}66` }}
              />
              <span className="dashboard-legend-item__label">{labelFormatter(slice.label)}</span>
              <span className="dashboard-legend-item__value">
                {isActive ? `${slice.percent}%` : slice.value}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
