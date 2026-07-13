import { useCallback, useEffect, useState } from 'react';
import { teacherPortalApi } from '../../api/teacherPortalApi';
import { PageHeader } from '../../components/layout/PageHeader';
import { useToast } from '../../context/ToastContext';
import type { TeacherPortalProfile } from '../../types/teacherPortal';
import '../PortalPages.css';

export function TeacherProfilePage() {
  const { showToast } = useToast();
  const [profile, setProfile] = useState<TeacherPortalProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      const response = await teacherPortalApi.getMe();
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
        badge="Teacher Portal"
        title="My Profile"
        description="Your teacher account details."
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
              <span className="portal-profile-item__label">Teacher ID</span>
              <span className="portal-profile-item__value">#{profile.id}</span>
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
}
