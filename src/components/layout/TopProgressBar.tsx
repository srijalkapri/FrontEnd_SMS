import './TopProgressBar.css';

interface TopProgressBarProps {
  visible: boolean;
  progress: number;
  completing: boolean;
}

export function TopProgressBar({ visible, progress, completing }: TopProgressBarProps) {
  if (!visible && !completing) return null;

  return (
    <div
      className={`top-progress${completing ? ' top-progress--done' : ''}`}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progress)}
      aria-hidden={!visible}
    >
      <div
        className="top-progress__bar"
        style={{ transform: `scaleX(${Math.max(0, Math.min(100, progress)) / 100})` }}
      />
      <div className="top-progress__glow" style={{ left: `${Math.max(0, Math.min(100, progress))}%` }} />
    </div>
  );
}
