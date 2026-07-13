import type { AuthUser, UserRole } from '../types/auth';

type RawAuthUser = AuthUser & {
  Role?: string;
};

const USER_ROLES: UserRole[] = ['SuperAdmin', 'Teacher', 'Student'];

export function normalizeAuthUser(raw: RawAuthUser): AuthUser {
  const role = (raw.role ?? raw.Role ?? '') as UserRole | string;
  return {
    id: raw.id,
    username: raw.username,
    fullName: raw.fullName,
    role,
  };
}

export function isSuperAdminRole(role: string | undefined | null): boolean {
  return role?.trim() === 'SuperAdmin';
}

export function isTeacherRole(role: string | undefined | null): boolean {
  return role?.trim() === 'Teacher';
}

export function isStudentRole(role: string | undefined | null): boolean {
  return role?.trim() === 'Student';
}

export function getHomeRouteForRole(role: string | undefined | null): string {
  if (isSuperAdminRole(role)) return '/';
  if (isTeacherRole(role)) return '/teacher';
  if (isStudentRole(role)) return '/student';
  return '/login';
}

function isPortalRoot(pathname: string, base: string): boolean {
  return pathname === base || pathname.startsWith(`${base}/`);
}

export function isPathAllowedForRole(pathname: string, role: string | undefined | null): boolean {
  if (isSuperAdminRole(role)) {
    return !isPortalRoot(pathname, '/teacher') && !isPortalRoot(pathname, '/student');
  }
  if (isTeacherRole(role)) {
    return isPortalRoot(pathname, '/teacher');
  }
  if (isStudentRole(role)) {
    return isPortalRoot(pathname, '/student');
  }
  return false;
}

export function parseUserRole(role: string | undefined | null): UserRole | null {
  if (!role) return null;
  return USER_ROLES.includes(role as UserRole) ? (role as UserRole) : null;
}

export function roleMatches(role: string | undefined | null, allowed: UserRole[]): boolean {
  const parsed = parseUserRole(role);
  return parsed !== null && allowed.includes(parsed);
}
