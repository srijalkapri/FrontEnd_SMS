import { formatPercent } from '../../utils/dashboardCharts';
import { lightenColor } from '../../utils/chartGeometry';
import './Dashboard.css';

export interface GroupedBarSeries {
  name: string;
  color: string;
  /** Value per category index; null = no data / absent */
  values: (number | null)[];
}

interface GroupedBarChartProps {
  categories: string[];
  series: GroupedBarSeries[];
  maxValue?: number;
}

export function GroupedBarChart({
  categories,
  series,
  maxValue = 100,
}: GroupedBarChartProps) {
  if (categories.length === 0 || series.length === 0) return null;

  const scaleMax = Math.max(maxValue, 1);
  const ticks = [100, 75, 50, 25, 0].map((t) => (t / 100) * scaleMax);

  return (
    <div className="dashboard-gbar" role="img" aria-label="Grouped bar chart comparing subjects across exams">
      <div className="dashboard-gbar__legend">
        {series.map((item) => (
          <span key={item.name} className="dashboard-gbar__legend-item">
            <span
              className="dashboard-gbar__legend-swatch"
              style={{ background: item.color }}
              aria-hidden="true"
            />
            <span className="dashboard-gbar__legend-label" title={item.name}>
              {item.name}
            </span>
          </span>
        ))}
      </div>

      <div className="dashboard-gbar__plot">
        <div className="dashboard-gbar__grid" aria-hidden="true">
          {ticks.map((tick) => (
            <div key={tick} className="dashboard-gbar__grid-line">
              <span>{formatPercent(tick)}</span>
            </div>
          ))}
        </div>

        <div className="dashboard-gbar__groups">
          {categories.map((category, categoryIndex) => (
            <div key={category} className="dashboard-gbar__group">
              <div className="dashboard-gbar__cluster">
                {series.map((item, seriesIndex) => {
                  const raw = item.values[categoryIndex];
                  const value = raw ?? 0;
                  const hasValue = raw != null;
                  const heightPct = hasValue
                    ? Math.min(100, (value / scaleMax) * 100)
                    : 0;

                  return (
                    <div
                      key={`${item.name}-${category}`}
                      className="dashboard-gbar__bar-wrap"
                      title={
                        hasValue
                          ? `${category} · ${item.name}: ${formatPercent(value)}`
                          : `${category} · ${item.name}: No mark`
                      }
                    >
                      <span className="dashboard-gbar__value">
                        {hasValue ? formatPercent(value) : '—'}
                      </span>
                      <div className="dashboard-gbar__track">
                        <div
                          className={`dashboard-gbar__fill${
                            hasValue ? '' : ' dashboard-gbar__fill--empty'
                          }`}
                          style={{
                            height: `${hasValue ? Math.max(4, heightPct) : 2}%`,
                            background: hasValue
                              ? `linear-gradient(180deg, ${lightenColor(item.color, 0.18)} 0%, ${item.color} 100%)`
                              : undefined,
                            animationDelay: `${(categoryIndex * series.length + seriesIndex) * 0.05}s`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              <span className="dashboard-gbar__category" title={category}>
                {category}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
