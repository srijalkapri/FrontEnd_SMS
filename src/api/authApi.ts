import type { AuthUser, LoginRequest, LoginResponse } from '../types/auth';
import { request } from './apiClient';

const BASE_URL = '/api/Auth';

export const authApi = {
  login: (data: LoginRequest) =>
    request<LoginResponse>(`${BASE_URL}/Login`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  me: () => request<AuthUser>(`${BASE_URL}/Me`),

  logout: () =>
    request<null>(`${BASE_URL}/Logout`, {
      method: 'POST',
    }),
};
