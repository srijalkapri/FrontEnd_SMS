import { useId } from 'react';
import type { ChartDatum } from '../../utils/dashboardCharts';
import { truncateLabel } from '../../utils/dashboardCharts';
import './Dashboard.css';

interface LineChartProps {
  data: ChartDatum[];
  height?: number;
}

export function LineChart({ data, height = 220 }: LineChartProps) {
  const uid = useId().replace(/:/g, '');
  if (data.length === 0) return null;

  const padding = { top: 28, right: 24, bottom: 40, left: 24 };
  const width = 520;
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const values = data.map((d) => d.value);
  const minVal = Math.min(...values, 0);
  const maxVal = Math.max(...values, 100);
  const range = maxVal - minVal || 1;

  const points = data.map((item, index) => {
    const x =
      data.length === 1
        ? padding.left + chartWidth / 2
        : padding.left + (index / (data.length - 1)) * chartWidth;
    const y = padding.top + chartHeight - ((item.value - minVal) / range) * chartHeight;
    return { x, y, item };
  });

  const smoothPath = buildSmoothPath(points);
  const areaPath = [
    smoothPath.replace(/^M/, `M ${points[0].x} ${padding.top + chartHeight} L`),
    `L ${points[points.length - 1].x} ${padding.top + chartHeight} Z`,
  ].join(' ');

  const primaryColor = data[0]?.color ?? '#6366f1';

  return (
    <div className="dashboard-line-wrap">
      <svg
        className="dashboard-line-chart"
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label="Line chart"
      >
        <defs>
          <linearGradient id={`lineArea-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={primaryColor} stopOpacity="0.35" />
            <stop offset="100%" stopColor={primaryColor} stopOpacity="0" />
          </linearGradient>
          <filter id={`lineGlow-${uid}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {[0, 25, 50, 75, 100].map((tick) => {
          const y = padding.top + chartHeight - ((tick - minVal) / range) * chartHeight;
          if (y < padding.top - 2 || y > padding.top + chartHeight + 2) return null;
          return (
            <g key={tick}>
              <line
                x1={padding.left}
                y1={y}
                x2={padding.left + chartWidth}
                y2={y}
                stroke="var(--color-border)"
                strokeWidth="1"
                strokeDasharray="5 5"
                opacity="0.6"
              />
              <text x={padding.left - 6} y={y + 4} textAnchor="end" className="dashboard-line-chart__axis-label">
                {tick}%
              </text>
            </g>
          );
        })}

        <path d={areaPath} fill={`url(#lineArea-${uid})`} className="dashboard-line-chart__area" />
        <path
          d={smoothPath}
          fill="none"
          stroke={primaryColor}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter={`url(#lineGlow-${uid})`}
          className="dashboard-line-chart__line"
        />

        {points.map(({ x, y, item }, index) => (
          <g key={item.label}>
            <circle cx={x} cy={y} r="8" fill={item.color ?? primaryColor} opacity="0.2" />
            <circle
              cx={x}
              cy={y}
              r="5"
              fill="var(--color-bg-card, #141b2e)"
              stroke={item.color ?? primaryColor}
              strokeWidth="2.5"
              className="dashboard-line-chart__dot"
              style={{ animationDelay: `${index * 0.1}s` }}
            />
            <text x={x} y={y - 14} textAnchor="middle" className="dashboard-line-chart__value-label">
              {item.value}%
            </text>
            <text
              x={x}
              y={padding.top + chartHeight + 22}
              textAnchor="middle"
              className="dashboard-line-chart__axis-label"
            >
              {truncateLabel(item.label, 14)}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

function buildSmoothPath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

  let path = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i];
    const p1 = points[i + 1];
    const midX = (p0.x + p1.x) / 2;
    path += ` C ${midX} ${p0.y}, ${midX} ${p1.y}, ${p1.x} ${p1.y}`;
  }
  return path;
}
