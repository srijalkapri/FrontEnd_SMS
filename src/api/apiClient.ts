import type { ApiResponse } from '../types/api';
import { clearAuthSession, getToken } from '../utils/authStorage';

function isLoginRequest(url: string): boolean {
  return url.includes('/api/Auth/Login');
}

function handleUnauthorized(url: string): void {
  if (isLoginRequest(url)) {
    return;
  }

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

export async function request<T>(url: string, options?: RequestInit): Promise<ApiResponse<T>> {
  const token = getToken();
  const headers: Record<string, string> = {
    Accept: '*/*',
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string> | undefined),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    handleUnauthorized(url);
    throw new Error(await parseErrorMessage(response));
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
