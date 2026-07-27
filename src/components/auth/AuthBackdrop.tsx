import type { CSSProperties } from 'react';
import './AuthBackdrop.css';

export function AuthBackdrop() {
  return (
    <div className="auth-backdrop" aria-hidden="true">
      <span className="auth-backdrop__orb auth-backdrop__orb--1" />
      <span className="auth-backdrop__orb auth-backdrop__orb--2" />
      <span className="auth-backdrop__orb auth-backdrop__orb--3" />
      <span className="auth-backdrop__grid" />
      {Array.from({ length: 8 }).map((_, index) => (
        <span
          key={index}
          className="auth-backdrop__spark"
          style={{ '--spark-i': index } as CSSProperties}
        />
      ))}
    </div>
  );
}
