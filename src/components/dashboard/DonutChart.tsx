import { useId } from 'react';
import type { ChartDatum } from '../../utils/dashboardCharts';
import { getExamResultStatusLabel } from '../../utils/examResultStatus';
import { buildPieSlices, describeDonutSlice, lightenColor } from '../../utils/chartGeometry';
import './Dashboard.css';

interface DonutChartProps {
  data: ChartDatum[];
  formatLabel?: (label: string) => string;
  size?: number;
}

export function DonutChart({ data, formatLabel, size = 200 }: DonutChartProps) {
  const uid = useId().replace(/:/g, '');
  const slices = buildPieSlices(data, 3);
  const total = data.reduce((sum, item) => sum + item.value, 0);
  if (total === 0) return null;

  const cx = size / 2;
  const cy = size / 2;
  const outerRadius = size / 2 - 10;
  const innerRadius = outerRadius * 0.62;

  const defaultFormatLabel = (label: string) => {
    if (['Draft', 'PendingApproval', 'Approved', 'Rejected', 'Not started'].includes(label)) {
      return getExamResultStatusLabel(label as Parameters<typeof getExamResultStatusLabel>[0]);
    }
    return label;
  };

  const labelFormatter = formatLabel ?? defaultFormatLabel;

  return (
    <div className="dashboard-donut">
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

        {slices.map((slice, index) => (
          <path
            key={slice.label}
            d={describeDonutSlice(cx, cy, outerRadius, innerRadius, slice.startAngle, slice.endAngle)}
            fill={`url(#donutGrad-${uid}-${index})`}
            className="dashboard-donut__slice"
            style={{ animationDelay: `${index * 0.08}s` }}
            filter={`url(#donutGlow-${uid})`}
          />
        ))}

        <text x={cx} y={cy - 4} textAnchor="middle" className="dashboard-donut__center-value">
          {total}
        </text>
        <text x={cx} y={cy + 14} textAnchor="middle" className="dashboard-donut__center-label">
          total
        </text>
      </svg>

      <div className="dashboard-donut__legend">
        {slices.map((slice) => (
          <div key={slice.label} className="dashboard-legend-item dashboard-legend-item--compact">
            <span
              className="dashboard-legend-item__dot"
              style={{ background: slice.color, boxShadow: `0 0 6px ${slice.color}66` }}
            />
            <span className="dashboard-legend-item__label">{labelFormatter(slice.label)}</span>
            <span className="dashboard-legend-item__value">
              {slice.value}
              <span className="dashboard-legend-item__pct">({slice.percent}%)</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
