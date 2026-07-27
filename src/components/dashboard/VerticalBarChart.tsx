import { useId } from 'react';
import type { ChartDatum } from '../../utils/dashboardCharts';
import {
  computeIntegerTicks,
  formatPercent,
  scaleMaxForTicks,
} from '../../utils/dashboardCharts';
import { lightenColor } from '../../utils/chartGeometry';
import './Dashboard.css';

interface VerticalBarChartProps {
  data: ChartDatum[];
  maxValue?: number;
  formatValue?: (value: number) => string;
  showGrid?: boolean;
  /** Use integer Y-axis for counts (students, sessions). Default 'percent' for scores. */
  mode?: 'percent' | 'count';
}

export function VerticalBarChart({
  data,
  maxValue,
  formatValue,
  showGrid = true,
  mode = 'percent',
}: VerticalBarChartProps) {
  const uid = useId().replace(/:/g, '');
  const rawMax = maxValue ?? Math.max(...data.map((d) => d.value), 0);

  const isCount = mode === 'count';
  const scaleMax = isCount
    ? scaleMaxForTicks(rawMax)
    : maxValue ?? Math.max(rawMax, 100);

  const valueFormatter =
    formatValue ?? (isCount ? (v: number) => String(Math.round(v)) : formatPercent);

  const gridTicks = isCount
    ? computeIntegerTicks(scaleMax)
    : null;

  const visibleData = data.filter((item) => item.value > 0 || isCount);

  if (visibleData.length === 0) return null;

  return (
    <div
      className={`dashboard-vbar-chart dashboard-vbar-chart--${mode}`}
      role="img"
      aria-label="Vertical bar chart"
    >
      {showGrid && (
        <div className="dashboard-vbar-chart__grid" aria-hidden="true">
          {(isCount ? gridTicks! : [100, 75, 50, 25, 0].map((t) => (t / 100) * scaleMax)).map(
            (tick) => (
              <div key={tick} className="dashboard-vbar-chart__grid-line">
                <span>{valueFormatter(tick)}</span>
              </div>
            ),
          )}
        </div>
      )}
      <div className="dashboard-vbar-chart__bars">
        {visibleData.map((item, index) => {
          const heightPct = scaleMax > 0 ? Math.min(100, (item.value / scaleMax) * 100) : 0;
          const color = item.color ?? '#6366f1';
          const showValueLabel = item.value > 0 || isCount;
          return (
            <div key={item.label} className="dashboard-vbar-chart__col">
              <span className="dashboard-vbar-chart__value">
                {showValueLabel ? valueFormatter(item.value) : ''}
              </span>
              <div className="dashboard-vbar-chart__track">
                <div
                  className={`dashboard-vbar-chart__fill${
                    item.value === 0 ? ' dashboard-vbar-chart__fill--zero' : ''
                  }`}
                  style={{
                    height: `${Math.max(item.value > 0 ? 4 : 2, heightPct)}%`,
                    background:
                      item.value > 0
                        ? `linear-gradient(180deg, ${lightenColor(color, 0.2)} 0%, ${color} 100%)`
                        : colorMixMuted(color),
                    boxShadow: item.value > 0 ? `0 4px 16px ${color}55` : 'none',
                    animationDelay: `${index * 0.07}s`,
                  }}
                />
              </div>
              <span className="dashboard-vbar-chart__label" title={item.label}>
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
      <svg width="0" height="0" aria-hidden="true">
        <defs>
          {data.map((item, index) => (
            <linearGradient
              key={`${uid}-${index}`}
              id={`vbar-${uid}-${index}`}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop offset="0%" stopColor={lightenColor(item.color ?? '#6366f1', 0.2)} />
              <stop offset="100%" stopColor={item.color ?? '#6366f1'} />
            </linearGradient>
          ))}
        </defs>
      </svg>
    </div>
  );
}

function colorMixMuted(color: string): string {
  return `color-mix(in srgb, ${color} 25%, var(--color-border))`;
}
