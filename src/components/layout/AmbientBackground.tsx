import type { CSSProperties } from 'react';
import './AmbientBackground.css';

export function AmbientBackground() {
  return (
    <div className="ambient-bg" aria-hidden="true">
      <div className="ambient-bg__base" />
      <span className="ambient-bg__aurora ambient-bg__aurora--1" />
      <span className="ambient-bg__aurora ambient-bg__aurora--2" />
      <span className="ambient-bg__orb ambient-bg__orb--1" />
      <span className="ambient-bg__orb ambient-bg__orb--2" />
      <span className="ambient-bg__orb ambient-bg__orb--3" />
      <span className="ambient-bg__orb ambient-bg__orb--4" />
      <span className="ambient-bg__grid" />
      <span className="ambient-bg__shine" />
      {Array.from({ length: 12 }).map((_, index) => (
        <span
          key={index}
          className="ambient-bg__spark"
          style={{ '--spark-i': index } as CSSProperties}
        />
      ))}
    </div>
  );
}
