import { useCallback, useEffect, useState } from 'react';
import { studentPortalApi } from '../../api/studentPortalApi';
import { PageHeader } from '../../components/layout/PageHeader';
import { useToast } from '../../context/ToastContext';
import type { StudentPortalProfile } from '../../types/studentPortal';
import '../PortalPages.css';

export function StudentProfilePage() {
  const { showToast } = useToast();
  const [profile, setProfile] = useState<StudentPortalProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      const response = await studentPortalApi.getMe();
      setProfile(response.data);
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Failed to load profile.');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return (
    <div className="page-content portal-page">
      <PageHeader
        badge="Student Portal"
        title="My Profile"
        description="Your student account details."
      />

      <section className="card">
        {loading ? (
          <div className="table-loading">
            <div className="spinner" />
            <p>Loading profile…</p>
          </div>
        ) : profile ? (
          <div className="portal-profile-grid">
            <div className="portal-profile-item">
              <span className="portal-profile-item__label">Name</span>
              <span className="portal-profile-item__value">{profile.name}</span>
            </div>
            <div className="portal-profile-item">
              <span className="portal-profile-item__label">Email</span>
              <span className="portal-profile-item__value">{profile.email}</span>
            </div>
            <div className="portal-profile-item">
              <span className="portal-profile-item__label">Phone</span>
              <span className="portal-profile-item__value">{profile.phoneNo}</span>
            </div>
            <div className="portal-profile-item">
              <span className="portal-profile-item__label">Grade</span>
              <span className="portal-profile-item__value">{profile.gradeName}</span>
            </div>
            <div className="portal-profile-item">
              <span className="portal-profile-item__label">Student ID</span>
              <span className="portal-profile-item__value">#{profile.id}</span>
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
}
