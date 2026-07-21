const TOKEN_KEY = 'sm_auth_token';
const EXPIRES_KEY = 'sm_auth_expires_at';
const REFRESH_TOKEN_KEY = 'sm_auth_refresh_token';
const REFRESH_EXPIRES_KEY = 'sm_auth_refresh_expires_at';

export interface AuthSessionTokens {
  token: string;
  expiresAt: string;
  refreshToken: string;
  refreshTokenExpiresAt: string;
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getTokenExpiresAt(): string | null {
  return localStorage.getItem(EXPIRES_KEY);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function getRefreshTokenExpiresAt(): string | null {
  return localStorage.getItem(REFRESH_EXPIRES_KEY);
}

export function setAuthSession({
  token,
  expiresAt,
  refreshToken,
  refreshTokenExpiresAt,
}: AuthSessionTokens): void {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(EXPIRES_KEY, expiresAt);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  localStorage.setItem(REFRESH_EXPIRES_KEY, refreshTokenExpiresAt);
}

export function clearAuthSession(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(EXPIRES_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(REFRESH_EXPIRES_KEY);
}

function isExpired(isoDate: string | null): boolean {
  if (!isoDate) {
    return true;
  }

  return new Date(isoDate).getTime() <= Date.now();
}

export function isTokenExpired(): boolean {
  return isExpired(getTokenExpiresAt());
}

export function isRefreshTokenExpired(): boolean {
  return isExpired(getRefreshTokenExpiresAt());
}

export function hasStoredSession(): boolean {
  const token = getToken();
  const refreshToken = getRefreshToken();

  if (token && !isTokenExpired()) {
    return true;
  }

  return Boolean(refreshToken && !isRefreshTokenExpired());
}
