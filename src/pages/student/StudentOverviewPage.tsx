import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { studentPortalApi } from '../../api/studentPortalApi';
import { PageHeader } from '../../components/layout/PageHeader';
import { useToast } from '../../context/ToastContext';
import type { StudentPortalOverview } from '../../types/studentPortal';
import '../HomePage.css';
import '../PortalPages.css';

export function StudentOverviewPage() {
  const { showToast } = useToast();
  const [overview, setOverview] = useState<StudentPortalOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchOverview = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await studentPortalApi.getOverview();
      setOverview(response.data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load overview.';
      setError(message);
      showToast('error', message);
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  const stats = [
    { label: 'Grade', value: overview?.grade.className ?? '—', to: '/student/grade' },
    { label: 'Subjects', value: overview?.subjects.length ?? 0, to: '/student/subjects' },
    { label: 'Teachers', value: overview?.teachers.length ?? 0, to: '/student/teachers' },
  ];

  return (
    <div className="page-content portal-page">
      <PageHeader
        badge="Student Portal"
        title={overview ? `Welcome, ${overview.profile.name}` : 'Student Dashboard'}
        description="View your grade, subjects, and teachers."
        actions={
          <button type="button" className="btn btn--ghost" onClick={fetchOverview} disabled={loading}>
            Refresh
          </button>
        }
      />

      {error && <div className="portal-error">{error}</div>}

      <section className="portal-stats">
        {stats.map((stat) => (
          <Link key={stat.label} to={stat.to} className="portal-stat-card">
            <div className="portal-stat-card__label">{stat.label}</div>
            <div className="portal-stat-card__value">{loading ? '—' : stat.value}</div>
          </Link>
        ))}
      </section>

      {overview && (
        <section className="card">
          <div className="card__header">
            <div>
              <h2 className="card__title">Quick profile</h2>
              <p className="card__subtitle">{overview.profile.gradeName}</p>
            </div>
            <Link to="/student/profile" className="btn btn--ghost">
              View profile
            </Link>
          </div>
          <div className="portal-profile-grid">
            <div className="portal-profile-item">
              <span className="portal-profile-item__label">Email</span>
              <span className="portal-profile-item__value">{overview.profile.email}</span>
            </div>
            <div className="portal-profile-item">
              <span className="portal-profile-item__label">Phone</span>
              <span className="portal-profile-item__value">{overview.profile.phoneNo}</span>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
