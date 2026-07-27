import type { CSSProperties } from 'react';
import { useId } from 'react';
import type { ChartDatum } from '../../utils/dashboardCharts';
import { buildPieSlices, describePieSlice, lightenColor } from '../../utils/chartGeometry';
import { AnimatedNumber } from './AnimatedNumber';
import './Dashboard.css';

interface PieChartProps {
  data: ChartDatum[];
  size?: number;
  formatLabel?: (label: string) => string;
  centerLabel?: string;
  centerValue?: string | number;
}

export function PieChart({
  data,
  size = 220,
  formatLabel,
  centerLabel,
  centerValue,
}: PieChartProps) {
  const uid = useId().replace(/:/g, '');
  const slices = buildPieSlices(data);
  const total = data.reduce((sum, item) => sum + item.value, 0);
  if (total === 0) return null;

  const cx = size / 2;
  const cy = size / 2;
  const radius = size / 2 - 8;

  return (
    <div className="dashboard-pie-chart dashboard-pie-chart--animate">
      <div className="dashboard-pie-chart__visual">
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="dashboard-pie-chart__svg"
          role="img"
          aria-label="Pie chart"
        >
          <defs>
            <filter id={`pieGlow-${uid}`} x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            {slices.map((slice, index) => (
              <linearGradient
                key={`grad-${slice.label}`}
                id={`pieGrad-${uid}-${index}`}
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor={lightenColor(slice.color ?? '#6366f1', 0.15)} />
                <stop offset="100%" stopColor={slice.color ?? '#6366f1'} />
              </linearGradient>
            ))}
          </defs>

          {slices.map((slice, index) => {
            const sliceSpan = slice.endAngle - slice.startAngle;
            return (
              <g
                key={slice.label}
                transform={`rotate(${slice.startAngle}, ${cx}, ${cy})`}
              >
                <g
                  className="dashboard-pie-chart__slice-wrap"
                  style={
                    {
                      transformOrigin: `${cx}px ${cy}px`,
                      animationDelay: `${index * 0.1}s`,
                      '--slice-color': slice.color ?? '#6366f1',
                    } as CSSProperties
                  }
                >
                  <path
                    d={describePieSlice(cx, cy, radius, 0, sliceSpan)}
                    fill={`url(#pieGrad-${uid}-${index})`}
                    className="dashboard-pie-chart__slice"
                    filter={`url(#pieGlow-${uid})`}
                  />
                </g>
              </g>
            );
          })}

          <circle
            cx={cx}
            cy={cy}
            r={radius * 0.38}
            className="dashboard-pie-chart__center-hole"
          />
        </svg>

        {(centerValue !== undefined || centerLabel) && (
          <div
            className="dashboard-pie-chart__center"
            style={{ width: size, height: size }}
          >
            {centerValue !== undefined && (
              typeof centerValue === 'number' ? (
                <AnimatedNumber
                  value={centerValue}
                  className="dashboard-pie-chart__center-value"
                />
              ) : (
                <span className="dashboard-pie-chart__center-value">{centerValue}</span>
              )
            )}
            {centerLabel && (
              <span className="dashboard-pie-chart__center-label">{centerLabel}</span>
            )}
          </div>
        )}
      </div>

      <div className="dashboard-pie-chart__legend">
        {slices.map((slice, index) => (
          <div
            key={slice.label}
            className="dashboard-legend-item dashboard-legend-item--pie"
            style={{ animationDelay: `${0.25 + index * 0.08}s` }}
          >
            <span
              className="dashboard-legend-item__dot dashboard-legend-item__dot--pop"
              style={{
                background: slice.color,
                boxShadow: `0 0 8px ${slice.color}66`,
                animationDelay: `${0.3 + index * 0.08}s`,
              }}
            />
            <span className="dashboard-legend-item__label">
              {formatLabel ? formatLabel(slice.label) : slice.label}
            </span>
            <span className="dashboard-legend-item__bar-track">
              <span
                className="dashboard-legend-item__bar-fill dashboard-legend-item__bar-fill--grow"
                style={
                  {
                    '--bar-target': `${slice.percent}%`,
                    background: slice.color,
                    animationDelay: `${0.35 + index * 0.08}s`,
                  } as CSSProperties
                }
              />
            </span>
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
