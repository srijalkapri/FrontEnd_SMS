import { PageTransition } from './PageTransition';
import { ThemeToggle } from './ThemeToggle';
import './AuthLayout.css';

export function AuthLayout() {
  return (
    <div className="auth-layout">
      <div className="auth-layout__theme">
        <ThemeToggle />
      </div>
      <PageTransition variant="auth" />
    </div>
  );
}