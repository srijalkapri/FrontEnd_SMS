import { scoreColor } from '../../utils/chartGeometry';
import './Dashboard.css';

interface RadialGaugeProps {
  value: number;
  label?: string;
  sublabel?: string;
  size?: number;
}

export function RadialGauge({ value, label = 'Score', sublabel, size = 180 }: RadialGaugeProps) {
  const clamped = Math.min(100, Math.max(0, value));
  const color = scoreColor(clamped);
  const cx = size / 2;
  const cy = size / 2;
  const radius = size / 2 - 14;
  const strokeWidth = 14;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div className="dashboard-gauge" role="img" aria-label={`${label}: ${clamped}%`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.9" />
            <stop offset="100%" stopColor={color} stopOpacity="1" />
          </linearGradient>
          <filter id="gaugeGlow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke="var(--color-border)"
          strokeWidth={strokeWidth}
          opacity="0.5"
        />
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke="url(#gaugeGrad)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${cx} ${cy})`}
          className="dashboard-gauge__arc"
          filter="url(#gaugeGlow)"
        />
        <text x={cx} y={cy - 6} textAnchor="middle" className="dashboard-gauge__value">
          {Math.round(clamped)}%
        </text>
        <text x={cx} y={cy + 16} textAnchor="middle" className="dashboard-gauge__label">
          {label}
        </text>
      </svg>
      {sublabel && <p className="dashboard-gauge__sublabel">{sublabel}</p>}
    </div>
  );
}
