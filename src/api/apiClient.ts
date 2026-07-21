import type { ApiResponse } from '../types/api';
import type { LoginResponse } from '../types/auth';
import {
  clearAuthSession,
  getRefreshToken,
  getToken,
  isRefreshTokenExpired,
  setAuthSession,
} from '../utils/authStorage';

const inFlightGetRequests = new Map<string, Promise<ApiResponse<unknown>>>();

/** Production: set VITE_API_URL=https://your-api.onrender.com (no trailing slash). Dev: leave empty to use Vite proxy. */
const API_BASE = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') ?? '';

type RawLoginPayload = LoginResponse & {
  Token?: string;
  ExpiresAt?: string;
  RefreshToken?: string;
  RefreshTokenExpiresAt?: string;
};

let refreshPromise: Promise<boolean> | null = null;

function resolveUrl(url: string): string {
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  return `${API_BASE}${url.startsWith('/') ? url : `/${url}`}`;
}

function isPublicAuthRequest(url: string): boolean {
  return (
    url.includes('/api/Auth/Login') ||
    url.includes('/api/Auth/Register') ||
    url.includes('/api/Auth/Refresh')
  );
}

function isLogoutRequest(url: string): boolean {
  return url.includes('/api/Auth/Logout');
}

function normalizeLoginPayload(raw: RawLoginPayload): LoginResponse {
  return {
    token: raw.token ?? raw.Token ?? '',
    expiresAt: raw.expiresAt ?? raw.ExpiresAt ?? '',
    refreshToken: raw.refreshToken ?? raw.RefreshToken ?? '',
    refreshTokenExpiresAt: raw.refreshTokenExpiresAt ?? raw.RefreshTokenExpiresAt ?? '',
    user: raw.user,
  };
}

function handleUnauthorized(): void {
  clearAuthSession();

  if (window.location.pathname !== '/login') {
    window.location.href = '/login';
  }
}

async function parseErrorMessage(response: Response): Promise<string> {
  try {
    const result = (await response.json()) as Partial<ApiResponse<unknown>>;

    if (result.errors?.length) {
      return result.errors.join(', ');
    }

    if (result.message) {
      return result.message;
    }
  } catch {
    // Response body was not JSON.
  }

  return `Request failed with status ${response.status}`;
}

async function refreshAccessToken(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken || isRefreshTokenExpired()) {
    return false;
  }

  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const response = await fetch(resolveUrl('/api/Auth/Refresh'), {
          method: 'POST',
          headers: {
            Accept: '*/*',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refreshToken }),
        });

        if (!response.ok) {
          return false;
        }

        const result = (await response.json()) as ApiResponse<RawLoginPayload>;
        if (!result.success || !result.data) {
          return false;
        }

        const payload = normalizeLoginPayload(result.data);
        if (!payload.token || !payload.refreshToken) {
          return false;
        }

        setAuthSession(payload);
        return true;
      } catch {
        return false;
      } finally {
        refreshPromise = null;
      }
    })();
  }

  return refreshPromise;
}

async function executeRequest<T>(
  url: string,
  options?: RequestInit,
  retried = false,
): Promise<ApiResponse<T>> {
  const token = getToken();
  const headers: Record<string, string> = {
    Accept: '*/*',
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string> | undefined),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(resolveUrl(url), {
    ...options,
    headers,
  });

  if (response.status === 401) {
    const canRefresh =
      !retried && !isPublicAuthRequest(url) && !isLogoutRequest(url);

    if (canRefresh && (await refreshAccessToken())) {
      return executeRequest<T>(url, options, true);
    }

    if (!isPublicAuthRequest(url)) {
      handleUnauthorized();
    }

    throw new Error(await parseErrorMessage(response));
  }

  if (response.status === 403) {
    const message = await parseErrorMessage(response);
    throw new Error(
      message === 'Request failed with status 403'
        ? 'Access denied. Your account role may not have permission for this action.'
        : message,
    );
  }

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  const result: ApiResponse<T> = await response.json();

  if (!result.success) {
    const errorMessage =
      result.errors?.length > 0
        ? result.errors.join(', ')
        : result.message || 'An unknown error occurred';
    throw new Error(errorMessage);
  }

  return result;
}

export async function request<T>(url: string, options?: RequestInit): Promise<ApiResponse<T>> {
  const method = (options?.method ?? 'GET').toUpperCase();
  const resolved = resolveUrl(url);

  if (method === 'GET') {
    const existing = inFlightGetRequests.get(resolved);
    if (existing) {
      return existing as Promise<ApiResponse<T>>;
    }

    const promise = executeRequest<T>(url, options);
    inFlightGetRequests.set(resolved, promise as Promise<ApiResponse<unknown>>);
    promise.finally(() => {
      inFlightGetRequests.delete(resolved);
    });
    return promise;
  }

  return executeRequest<T>(url, options);
}
