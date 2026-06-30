import { Outlet } from 'react-router-dom';
import { ThemeToggle } from './ThemeToggle';
import './AuthLayout.css';

export function AuthLayout() {
  return (
    <div className="auth-layout">
      <div className="auth-layout__theme">
        <ThemeToggle />
      </div>
      <Outlet />
    </div>
  );
}
