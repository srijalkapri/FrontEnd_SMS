import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getHomeRouteForRole, isPathAllowedForRole } from '../../utils/roles';
import './ProtectedRoute.css';

export function ProtectedRoute() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="auth-loading">
        <div className="auth-loading__spinner" aria-hidden="true" />
        <p>Checking session…</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (user && !isPathAllowedForRole(location.pathname, user.role)) {
    return <Navigate to={getHomeRouteForRole(user.role)} replace />;
  }

  return <Outlet />;
}
