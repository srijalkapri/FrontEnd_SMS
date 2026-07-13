import type { ApiResponse } from '../types/api';
import { clearAuthSession, getToken } from '../utils/authStorage';

const inFlightGetRequests = new Map<string, Promise<ApiResponse<unknown>>>();

function isPublicAuthRequest(url: string): boolean {
  return url.includes('/api/Auth/Login') || url.includes('/api/Auth/Register');
}

function handleUnauthorized(url: string): void {
  if (isPublicAuthRequest(url)) {
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

async function executeRequest<T>(url: string, options?: RequestInit): Promise<ApiResponse<T>> {
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

  if (method === 'GET') {
    const existing = inFlightGetRequests.get(url);
    if (existing) {
      return existing as Promise<ApiResponse<T>>;
    }

    const promise = executeRequest<T>(url, options);
    inFlightGetRequests.set(url, promise as Promise<ApiResponse<unknown>>);
    promise.finally(() => {
      inFlightGetRequests.delete(url);
    });
    return promise;
  }

  return executeRequest<T>(url, options);
}
