import type { AuthUser } from '../types/auth';

type RawAuthUser = AuthUser & {
  Role?: string;
};

export function normalizeAuthUser(raw: RawAuthUser): AuthUser {
  return {
    id: raw.id,
    username: raw.username,
    fullName: raw.fullName,
    role: raw.role ?? raw.Role ?? '',
  };
}

export function isAdminRole(role: string | undefined | null): boolean {
  if (!role) return false;
  return role.trim().toLowerCase().includes('admin');
}
