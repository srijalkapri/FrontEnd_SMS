import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import type { UserRole } from '../../types/auth';
import { getHomeRouteForRole, roleMatches } from '../../utils/roles';
import './ProtectedRoute.css';

interface RoleRouteProps {
  allowedRoles: UserRole[];
}

export function RoleRoute({ allowedRoles }: RoleRouteProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="auth-loading">
        <div className="auth-loading__spinner" aria-hidden="true" />
        <p>Checking session…</p>
      </div>
    );
  }

  if (!user || !roleMatches(user.role, allowedRoles)) {
    return <Navigate to={getHomeRouteForRole(user?.role)} replace />;
  }

  return <Outlet />;
}
