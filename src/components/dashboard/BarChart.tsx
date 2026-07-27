import type { ChartDatum } from '../../utils/dashboardCharts';
import { formatPercent } from '../../utils/dashboardCharts';
import { lightenColor } from '../../utils/chartGeometry';
import './Dashboard.css';

interface BarChartProps {
  data: ChartDatum[];
  maxValue?: number;
  formatValue?: (value: number) => string;
  variant?: 'horizontal' | 'pill';
}

export function BarChart({
  data,
  maxValue,
  formatValue = formatPercent,
  variant = 'horizontal',
}: BarChartProps) {
  const max = maxValue ?? Math.max(...data.map((d) => d.value), 1);

  return (
    <div
      className={`dashboard-bar-chart dashboard-bar-chart--${variant}`}
      role="img"
      aria-label="Bar chart"
    >
      {data.map((item, index) => {
        const widthPct = Math.min(100, (item.value / max) * 100);
        const color = item.color ?? '#6366f1';
        return (
          <div
            key={item.label}
            className="dashboard-bar-chart__row"
            style={{ animationDelay: `${index * 0.06}s` }}
          >
            <span className="dashboard-bar-chart__label" title={item.label}>
              <span
                className="dashboard-bar-chart__dot"
                style={{ background: color, boxShadow: `0 0 6px ${color}88` }}
              />
              {item.label}
            </span>
            <div className="dashboard-bar-chart__track">
              <div
                className="dashboard-bar-chart__fill"
                style={{
                  width: `${widthPct}%`,
                  background: `linear-gradient(90deg, ${color}, ${lightenColor(color, 0.18)})`,
                  boxShadow: `0 0 12px ${color}44`,
                }}
              />
            </div>
            <span className="dashboard-bar-chart__value">{formatValue(item.value)}</span>
          </div>
        );
      })}
    </div>
  );
}
