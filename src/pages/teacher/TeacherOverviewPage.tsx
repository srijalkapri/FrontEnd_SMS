import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { teacherPortalApi } from '../../api/teacherPortalApi';
import { PageHeader } from '../../components/layout/PageHeader';
import { useToast } from '../../context/ToastContext';
import type { TeacherPortalOverview } from '../../types/teacherPortal';
import '../HomePage.css';
import '../PortalPages.css';

export function TeacherOverviewPage() {
  const { showToast } = useToast();
  const [overview, setOverview] = useState<TeacherPortalOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchOverview = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await teacherPortalApi.getOverview();
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
    { label: 'Classes', value: overview?.classes.length ?? 0, to: '/teacher/classes' },
    { label: 'Students', value: overview?.students.length ?? 0, to: '/teacher/students' },
    { label: 'Subjects', value: overview?.subjects.length ?? 0, to: '/teacher/subjects' },
  ];

  return (
    <div className="page-content portal-page">
      <PageHeader
        badge="Teacher Portal"
        title={overview ? `Welcome, ${overview.profile.name}` : 'Teacher Dashboard'}
        description="View your classes, students, and assigned subjects."
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
              <p className="card__subtitle">{overview.profile.email}</p>
            </div>
            <Link to="/teacher/profile" className="btn btn--ghost">
              View profile
            </Link>
          </div>
          <div className="portal-profile-grid">
            <div className="portal-profile-item">
              <span className="portal-profile-item__label">Phone</span>
              <span className="portal-profile-item__value">{overview.profile.phoneNo}</span>
            </div>
            <div className="portal-profile-item">
              <span className="portal-profile-item__label">Classes assigned</span>
              <span className="portal-profile-item__value">{overview.classes.length}</span>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
