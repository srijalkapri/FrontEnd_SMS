const TOKEN_KEY = 'sm_auth_token';
const EXPIRES_KEY = 'sm_auth_expires_at';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getTokenExpiresAt(): string | null {
  return localStorage.getItem(EXPIRES_KEY);
}

export function setAuthSession(token: string, expiresAt: string): void {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(EXPIRES_KEY, expiresAt);
}

export function clearAuthSession(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(EXPIRES_KEY);
}

export function isTokenExpired(): boolean {
  const expiresAt = getTokenExpiresAt();
  if (!expiresAt) {
    return false;
  }

  return new Date(expiresAt).getTime() <= Date.now();
}

export function hasStoredSession(): boolean {
  const token = getToken();
  if (!token) {
    return false;
  }

  return !isTokenExpired();
}
