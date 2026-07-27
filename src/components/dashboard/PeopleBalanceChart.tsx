import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { AnimatedNumber } from './AnimatedNumber';
import './Dashboard.css';

interface PeopleBalanceChartProps {
  students: number;
  teachers: number;
}

function gcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x || 1;
}

function StudentIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5"
      />
    </svg>
  );
}

function TeacherIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
      />
    </svg>
  );
}

export function PeopleBalanceChart({ students, teachers }: PeopleBalanceChartProps) {
  const total = students + teachers;
  if (total === 0) return null;

  const studentPct = Math.round((students / total) * 100);
  const teacherPct = 100 - studentPct;
  const ratioDivisor = gcd(students, teachers);
  const ratioLabel = `${students / ratioDivisor}:${teachers / ratioDivisor}`;
  const perTeacher =
    teachers > 0 ? Math.round((students / teachers) * 10) / 10 : null;

  return (
    <div className="people-balance people-balance--animate" role="img" aria-label={`${students} students and ${teachers} teachers`}>
      <div className="people-balance__meters">
        <div
          className="people-balance__meter people-balance__meter--students"
          style={{ '--fill': `${studentPct}%` } as CSSProperties}
        >
          <div className="people-balance__meter-fill" />
          <div className="people-balance__meter-body">
            <span className="people-balance__icon people-balance__icon--students">
              <StudentIcon />
            </span>
            <div className="people-balance__meter-copy">
              <span className="people-balance__role">Students</span>
              <span className="people-balance__count">
                <AnimatedNumber value={students} duration={900} />
              </span>
            </div>
            <span className="people-balance__pct">{studentPct}%</span>
          </div>
          <Link to="/students" className="people-balance__link">
            View roster
          </Link>
        </div>

        <div
          className="people-balance__meter people-balance__meter--teachers"
          style={{ '--fill': `${teacherPct}%` } as CSSProperties}
        >
          <div className="people-balance__meter-fill" />
          <div className="people-balance__meter-body">
            <span className="people-balance__icon people-balance__icon--teachers">
              <TeacherIcon />
            </span>
            <div className="people-balance__meter-copy">
              <span className="people-balance__role">Teachers</span>
              <span className="people-balance__count">
                <AnimatedNumber value={teachers} duration={900} />
              </span>
            </div>
            <span className="people-balance__pct">{teacherPct}%</span>
          </div>
          <Link to="/teachers" className="people-balance__link">
            View faculty
          </Link>
        </div>
      </div>

      <div className="people-balance__bar-block">
        <div className="people-balance__bar" aria-hidden="true">
          <span
            className="people-balance__bar-seg people-balance__bar-seg--students"
            style={{ '--seg-width': `${studentPct}%` } as CSSProperties}
          />
          <span
            className="people-balance__bar-seg people-balance__bar-seg--teachers"
            style={{ '--seg-width': `${teacherPct}%` } as CSSProperties}
          />
        </div>
        <div className="people-balance__bar-labels">
          <span>Students · {students}</span>
          <span>Teachers · {teachers}</span>
        </div>
      </div>

      <div className="people-balance__insight">
        <div className="people-balance__insight-pill people-balance__insight-pill--ratio">
          <span className="people-balance__insight-label">Ratio</span>
          <span className="people-balance__insight-value">{ratioLabel}</span>
        </div>
        <div className="people-balance__insight-pill">
          <span className="people-balance__insight-label">Total people</span>
          <span className="people-balance__insight-value">
            <AnimatedNumber value={total} duration={800} />
          </span>
        </div>
        {perTeacher != null && (
          <div className="people-balance__insight-pill people-balance__insight-pill--accent">
            <span className="people-balance__insight-label">Per teacher</span>
            <span className="people-balance__insight-value">
              {perTeacher} student{perTeacher === 1 ? '' : 's'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
