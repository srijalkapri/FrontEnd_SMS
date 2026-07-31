import type { ReactNode } from 'react';
import './SearchFoundPanel.css';

export interface SearchFoundField {
  label: string;
  value: ReactNode;
  fullWidth?: boolean;
}

interface SearchFoundPanelProps {
  /** `found` = successful lookup, `details` = expanded details, `empty` = no match */
  status?: 'found' | 'details' | 'empty';
  title?: string;
  emptyMessage?: string;
  fields?: SearchFoundField[];
  children?: ReactNode;
}

function defaultTitle(status: 'found' | 'details' | 'empty'): string {
  if (status === 'empty') return 'Not found';
  if (status === 'details') return 'Search found';
  return 'Search found';
}

export function SearchFoundPanel({
  status = 'found',
  title,
  emptyMessage,
  fields = [],
  children,
}: SearchFoundPanelProps) {
  const heading = title ?? defaultTitle(status);

  if (status === 'empty') {
    return (
      <div className="search-found search-found--empty" role="status">
        <p className="search-found__title">{heading}</p>
        <p className="search-found__message">{emptyMessage ?? 'No matching record was found.'}</p>
      </div>
    );
  }

  return (
    <div className="search-found" role="region" aria-label={heading}>
      <div className="search-found__header">
        <p className="search-found__title">{heading}</p>
      </div>
      {fields.length > 0 && (
        <dl className="search-found__fields">
          {fields.map((field) => (
            <div
              key={field.label}
              className={`search-found__row${field.fullWidth ? ' search-found__row--full' : ''}`}
            >
              <dt className="search-found__label">{field.label}</dt>
              <dd className="search-found__value">{field.value}</dd>
            </div>
          ))}
        </dl>
      )}
      {children ? <div className="search-found__extra">{children}</div> : null}
    </div>
  );
}
