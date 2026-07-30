import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import './Dashboard.css';

interface ChartCardProps {
  title: string;
  subtitle?: ReactNode;
  headerExtra?: ReactNode;
  linkTo?: string;
  linkLabel?: string;
  empty?: boolean;
  emptyMessage?: string;
  emptyHint?: string;
  children?: ReactNode;
}

export function ChartCard({
  title,
  subtitle,
  headerExtra,
  linkTo,
  linkLabel = 'View all',
  empty = false,
  emptyMessage = 'No data yet',
  emptyHint,
  children,
}: ChartCardProps) {
  return (
    <section className="card dashboard-chart-card">
      <div className="dashboard-chart-card__header">
        <div className="dashboard-chart-card__heading">
          <h2 className="dashboard-chart-card__title">{title}</h2>
          {subtitle && <div className="dashboard-chart-card__subtitle">{subtitle}</div>}
          {headerExtra}
        </div>
        {linkTo && !empty && (
          <Link to={linkTo} className="dashboard-chart-card__link">
            {linkLabel}
          </Link>
        )}
      </div>
      {empty ? (
        <div className="dashboard-chart-empty">
          <p>{emptyMessage}</p>
          {emptyHint && <p className="dashboard-chart-empty__hint">{emptyHint}</p>}
        </div>
      ) : (
        children
      )}
    </section>
  );
}
