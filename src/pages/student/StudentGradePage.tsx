import { useCallback, useEffect, useState } from 'react';
import { studentPortalApi } from '../../api/studentPortalApi';
import { PageHeader } from '../../components/layout/PageHeader';
import { useToast } from '../../context/ToastContext';
import type { Grade } from '../../types/grade';
import '../PortalPages.css';

export function StudentGradePage() {
  const { showToast } = useToast();
  const [grade, setGrade] = useState<Grade | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchGrade = useCallback(async () => {
    setLoading(true);
    try {
      const response = await studentPortalApi.getGrade();
      setGrade(response.data);
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Failed to load grade.');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchGrade();
  }, [fetchGrade]);

  return (
    <div className="page-content portal-page">
      <PageHeader
        badge="Student Portal"
        title="My Grade"
        description="Your enrolled grade and class teacher."
      />

      <section className="card">
        {loading ? (
          <div className="table-loading">
            <div className="spinner" />
            <p>Loading grade…</p>
          </div>
        ) : grade ? (
          <div className="portal-profile-grid">
            <div className="portal-profile-item">
              <span className="portal-profile-item__label">Class</span>
              <span className="portal-profile-item__value">{grade.className}</span>
            </div>
            <div className="portal-profile-item">
              <span className="portal-profile-item__label">Grade ID</span>
              <span className="portal-profile-item__value">#{grade.id}</span>
            </div>
            <div className="portal-profile-item">
              <span className="portal-profile-item__label">Class Teacher</span>
              <span className="portal-profile-item__value">
                {typeof grade.classTeacher === 'object' && grade.classTeacher
                  ? grade.classTeacher.name
                  : '—'}
              </span>
            </div>
            {typeof grade.classTeacher === 'object' && grade.classTeacher && (
              <>
                <div className="portal-profile-item">
                  <span className="portal-profile-item__label">Teacher Email</span>
                  <span className="portal-profile-item__value">{grade.classTeacher.email}</span>
                </div>
                <div className="portal-profile-item">
                  <span className="portal-profile-item__label">Teacher Phone</span>
                  <span className="portal-profile-item__value">{grade.classTeacher.phoneNo}</span>
                </div>
              </>
            )}
          </div>
        ) : null}
      </section>
    </div>
  );
}
