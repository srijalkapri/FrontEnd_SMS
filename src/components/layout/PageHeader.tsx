import type { ReactNode } from 'react';
import './PageHeader.css';

interface PageHeaderProps {
  title: string;
  description: string;
  badge?: string;
  actions?: ReactNode;
}

export function PageHeader({ title, description, badge, actions }: PageHeaderProps) {
  return (
    <div className="page-header">
      <div className="page-header__content">
        {badge && <span className="page-header__badge">{badge}</span>}
        <h1 className="page-header__title">{title}</h1>
        <p className="page-header__description">{description}</p>
      </div>
      {actions && <div className="page-header__actions">{actions}</div>}
    </div>
  );
}
