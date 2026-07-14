import type { AuthUser, UserRole } from '../types/auth';

type RawAuthUser = {
  id?: number;
  Id?: number;
  username?: string;
  Username?: string;
  fullName?: string;
  FullName?: string;
  role?: string;
  Role?: string;
};

const USER_ROLES: UserRole[] = ['SuperAdmin', 'Teacher', 'Student'];

const LEGACY_ROLE_ALIASES: Record<string, UserRole> = {
  Admin: 'SuperAdmin',
  admin: 'SuperAdmin',
  ADMIN: 'SuperAdmin',
  superadmin: 'SuperAdmin',
  teacher: 'Teacher',
  student: 'Student',
};

export function normalizeRole(role: string | undefined | null): UserRole | string {
  if (!role) {
    return '';
  }

  const trimmed = role.trim();
  const legacy = LEGACY_ROLE_ALIASES[trimmed];
  if (legacy) {
    return legacy;
  }

  const matched = USER_ROLES.find(
    (knownRole) => knownRole.toLowerCase() === trimmed.toLowerCase(),
  );

  return matched ?? trimmed;
}

export function normalizeAuthUser(raw: RawAuthUser): AuthUser {
  return {
    id: raw.id ?? raw.Id ?? 0,
    username: raw.username ?? raw.Username ?? '',
    fullName: raw.fullName ?? raw.FullName ?? '',
    role: normalizeRole(raw.role ?? raw.Role),
  };
}

export function isSuperAdminRole(role: string | undefined | null): boolean {
  return parseUserRole(role) === 'SuperAdmin';
}

export function isTeacherRole(role: string | undefined | null): boolean {
  return parseUserRole(role) === 'Teacher';
}

export function isStudentRole(role: string | undefined | null): boolean {
  return parseUserRole(role) === 'Student';
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
  const normalized = normalizeRole(role);
  if (!normalized) {
    return null;
  }

  return USER_ROLES.includes(normalized as UserRole) ? (normalized as UserRole) : null;
}

export function roleMatches(role: string | undefined | null, allowed: UserRole[]): boolean {
  const parsed = parseUserRole(role);
  return parsed !== null && allowed.includes(parsed);
}
