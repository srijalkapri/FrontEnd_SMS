import type { ReactNode } from 'react';
import { AnimatedNumber } from '../dashboard/AnimatedNumber';
import {
  resolveSectionIcon,
  SectionIcon,
  splitSectionTitle,
  type SectionIconName,
} from './sectionIcons';
import './PageHeader.css';

export interface PageHeaderStat {
  label: string;
  value: number;
  tone?: 'default' | 'alert' | 'success';
}

interface PageHeaderProps {
  title: string;
  description: string;
  badge?: string;
  /** Override auto-split title; shown as gradient accent line */
  titleAccent?: string;
  actions?: ReactNode;
  icon?: SectionIconName;
  stats?: PageHeaderStat[];
  hideIcon?: boolean;
}

export function PageHeader({
  title,
  description,
  badge,
  titleAccent,
  actions,
  icon,
  stats,
  hideIcon = false,
}: PageHeaderProps) {
  const resolvedIcon = icon ?? resolveSectionIcon(title, badge);
  const split = titleAccent
    ? { main: title, accent: titleAccent }
    : splitSectionTitle(title);

  return (
    <section className="page-header">
      <div className="page-header__content">
        {badge && (
          <span className="page-header__badge">
            <span className="page-header__badge-dot" />
            {badge}
          </span>
        )}

        <h1 className="page-header__title">
          {split.main && (
            <span className="page-header__title-line">{split.main}</span>
          )}
          {split.accent && (
            <span className="page-header__title-line page-header__title-line--accent">
              {split.accent}
            </span>
          )}
        </h1>

        <p className="page-header__description">{description}</p>

        {stats && stats.length > 0 && (
          <div className="page-header__stats">
            {stats.map((stat, index) => (
              <span
                key={stat.label}
                className={`page-header__stat page-header__stat--${stat.tone ?? 'default'}`}
                style={{ animationDelay: `${0.55 + index * 0.1}s` }}
              >
                <AnimatedNumber value={stat.value} className="page-header__stat-value" />
                <span className="page-header__stat-label">{stat.label}</span>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="page-header__aside">
        {!hideIcon && (
          <div className="page-header__icon-wrap" aria-hidden="true">
            <span className="page-header__ring page-header__ring--1" />
            <span className="page-header__ring page-header__ring--2" />
            <div className="page-header__icon">
              <SectionIcon name={resolvedIcon} />
            </div>
          </div>
        )}

        {actions && <div className="page-header__actions">{actions}</div>}
      </div>
    </section>
  );
}
