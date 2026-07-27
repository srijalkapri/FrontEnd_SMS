import type { CSSProperties } from 'react';
import { useId, useMemo, useState } from 'react';
import type { ChartDatum } from '../../utils/dashboardCharts';
import { buildPieSlices, lightenColor, polarToCartesian } from '../../utils/chartGeometry';
import { AnimatedNumber } from './AnimatedNumber';
import './Dashboard.css';

interface PieChartProps {
  data: ChartDatum[];
  size?: number;
  formatLabel?: (label: string) => string;
  centerLabel?: string;
  centerValue?: string | number;
  /** Unit word for hover copy, e.g. "subject" → "2 subjects". */
  valueUnit?: string;
}

function describeArc(
  cx: number,
  cy: number,
  radius: number,
  startAngle: number,
  endAngle: number,
): string {
  const span = endAngle - startAngle;
  if (span >= 359.99) {
    const top = polarToCartesian(cx, cy, radius, 0);
    return `M ${top.x} ${top.y} A ${radius} ${radius} 0 1 1 ${top.x - 0.01} ${top.y} A ${radius} ${radius} 0 1 1 ${top.x} ${top.y}`;
  }

  const start = polarToCartesian(cx, cy, radius, endAngle);
  const end = polarToCartesian(cx, cy, radius, startAngle);
  const largeArc = span <= 180 ? '0' : '1';
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 0 ${end.x} ${end.y}`;
}

function pluralize(count: number, unit: string): string {
  if (count === 1) return `1 ${unit}`;
  if (unit.endsWith('s')) return `${count} ${unit}`;
  return `${count} ${unit}s`;
}

export function PieChart({
  data,
  size = 240,
  formatLabel,
  centerLabel = 'total',
  centerValue,
  valueUnit = 'entry',
}: PieChartProps) {
  const uid = useId().replace(/:/g, '');
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const slices = useMemo(() => buildPieSlices(data, 3.5), [data]);
  const total = useMemo(() => data.reduce((sum, item) => sum + item.value, 0), [data]);
  const leadingIndex = useMemo(() => {
    if (slices.length === 0) return -1;
    let best = 0;
    for (let i = 1; i < slices.length; i += 1) {
      if (slices[i].value > slices[best].value) best = i;
    }
    return best;
  }, [slices]);

  if (total === 0) return null;

  const cx = size / 2;
  const cy = size / 2;
  const ringWidth = Math.max(18, size * 0.11);
  const radius = size / 2 - ringWidth / 2 - 10;
  const trackRadius = radius;
  const active = activeIndex != null ? slices[activeIndex] : null;
  const activeLabel = active
    ? formatLabel
      ? formatLabel(active.label)
      : active.label
    : null;
  const displayValue =
    active != null
      ? active.value
      : typeof centerValue === 'number'
        ? centerValue
        : centerValue ?? total;
  const displayLabel = activeLabel ?? centerLabel;

  return (
    <div className="dashboard-pie-chart dashboard-pie-chart--advanced dashboard-pie-chart--animate">
      <div className="dashboard-pie-chart__visual">
        <span className="dashboard-pie-chart__aura" aria-hidden="true" />
        <span className="dashboard-pie-chart__pulse" aria-hidden="true" />

        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="dashboard-pie-chart__svg"
          role="img"
          aria-label="Distribution chart"
        >
          <defs>
            <filter id={`pieGlow-${uid}`} x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id={`pieSoftGlow-${uid}`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="6" result="blur" />
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
                <stop offset="0%" stopColor={lightenColor(slice.color ?? '#6366f1', 0.22)} />
                <stop offset="100%" stopColor={slice.color ?? '#6366f1'} />
              </linearGradient>
            ))}
          </defs>

          <circle
            cx={cx}
            cy={cy}
            r={radius + ringWidth / 2 + 6}
            fill="none"
            stroke="var(--color-border)"
            strokeWidth="1"
            strokeDasharray="2 8"
            className="dashboard-pie-chart__orbit"
            opacity="0.4"
          />

          <circle
            cx={cx}
            cy={cy}
            r={trackRadius}
            fill="none"
            stroke="color-mix(in srgb, var(--color-border) 70%, transparent)"
            strokeWidth={ringWidth}
            className="dashboard-pie-chart__track"
          />

          {slices.map((slice, index) => {
            const midAngle = (slice.startAngle + slice.endAngle) / 2;
            const isActive = activeIndex === index;
            const isDimmed = activeIndex !== null && !isActive;
            const pop = polarToCartesian(0, 0, isActive ? 5 : 0, midAngle);

            return (
              <g
                key={slice.label}
                className={[
                  'dashboard-pie-chart__slice-pop',
                  isActive ? 'dashboard-pie-chart__slice-pop--active' : '',
                  isDimmed ? 'dashboard-pie-chart__slice-pop--dimmed' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                style={
                  {
                    '--pop-x': `${pop.x}px`,
                    '--pop-y': `${pop.y}px`,
                    '--slice-color': slice.color ?? '#6366f1',
                  } as CSSProperties
                }
                onMouseEnter={() => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
              >
                <title>
                  {[
                    formatLabel ? formatLabel(slice.label) : slice.label,
                    `${slice.percent}%`,
                    ...(slice.details ?? []),
                  ].join(' · ')}
                </title>
                <path
                  d={describeArc(cx, cy, radius, slice.startAngle, slice.endAngle)}
                  fill="none"
                  stroke={`url(#pieGrad-${uid}-${index})`}
                  strokeWidth={isActive ? ringWidth + 4 : ringWidth}
                  strokeLinecap="round"
                  pathLength={1}
                  className="dashboard-pie-chart__arc"
                  filter={`url(#${isActive ? `pieSoftGlow-${uid}` : `pieGlow-${uid}`})`}
                  style={
                    {
                      animationDelay: `${0.12 + index * 0.14}s`,
                    } as CSSProperties
                  }
                />
              </g>
            );
          })}
        </svg>

        <div className="dashboard-pie-chart__center" style={{ width: size, height: size }}>
          <div
            key={active ? active.label : 'total'}
            className={`dashboard-pie-chart__center-stack${active ? ' dashboard-pie-chart__center-stack--focus' : ''}`}
          >
            {typeof displayValue === 'number' ? (
              <AnimatedNumber value={displayValue} className="dashboard-pie-chart__center-value" />
            ) : (
              <span className="dashboard-pie-chart__center-value">{displayValue}</span>
            )}
            <span className="dashboard-pie-chart__center-label">{displayLabel}</span>
          </div>
        </div>

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

      <div className="dashboard-pie-chart__legend dashboard-pie-chart__legend--rich">
        {slices.map((slice, index) => {
          const label = formatLabel ? formatLabel(slice.label) : slice.label;
          const isActive = activeIndex === index;
          const isLeading = index === leadingIndex;

          return (
            <button
              key={slice.label}
              type="button"
              className={[
                'dashboard-pie-legend-card',
                isActive ? 'dashboard-pie-legend-card--active' : '',
                activeIndex !== null && !isActive ? 'dashboard-pie-legend-card--dimmed' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              style={
                {
                  '--slice-color': slice.color ?? '#6366f1',
                  animationDelay: `${0.35 + index * 0.08}s`,
                } as CSSProperties
              }
              onMouseEnter={() => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
              onFocus={() => setActiveIndex(index)}
              onBlur={() => setActiveIndex(null)}
            >
              <span className="dashboard-pie-legend-card__accent" />
              <span className="dashboard-pie-legend-card__top">
                <span className="dashboard-pie-legend-card__identity">
                  <span
                    className="dashboard-pie-legend-card__dot"
                    style={{ background: slice.color, boxShadow: `0 0 10px ${slice.color}88` }}
                  />
                  <span className="dashboard-pie-legend-card__label">{label}</span>
                </span>
                {isLeading && <span className="dashboard-pie-legend-card__badge">Leading</span>}
              </span>

              <span className="dashboard-pie-legend-card__stats">
                <span className="dashboard-pie-legend-card__value">
                  <AnimatedNumber value={slice.value} duration={750} />
                </span>
              </span>

              <span className="dashboard-pie-legend-card__bar">
                <span
                  className="dashboard-pie-legend-card__bar-fill"
                  style={
                    {
                      '--bar-target': `${slice.percent}%`,
                      background: `linear-gradient(90deg, ${lightenColor(slice.color ?? '#6366f1', 0.2)}, ${slice.color})`,
                      animationDelay: `${0.45 + index * 0.08}s`,
                    } as CSSProperties
                  }
                />
              </span>

              <span className="dashboard-pie-legend-card__hint">
                {isActive
                  ? `${slice.percent}% of total`
                  : pluralize(slice.value, valueUnit)}
              </span>

              {isActive && slice.details && slice.details.length > 0 && (
                <ul className="dashboard-pie-legend-card__details">
                  {slice.details.map((detail) => (
                    <li key={detail}>{detail}</li>
                  ))}
                </ul>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
