import { Outlet, useLocation } from 'react-router-dom';

interface PageTransitionProps {
  variant?: 'default' | 'auth';
}

export function PageTransition({ variant = 'default' }: PageTransitionProps) {
  const { pathname } = useLocation();
  const className =
    variant === 'auth' ? 'page-transition page-transition--auth' : 'page-transition';

  return (
    <div key={pathname} className={className}>
      <Outlet />
    </div>
  );
}
