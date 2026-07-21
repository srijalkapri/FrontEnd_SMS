import type {
  ApproveUserRequest,
  AuthUser,
  LoginRequest,
  LoginResponse,
  LogoutRequest,
  PendingUser,
  RefreshTokenRequest,
  RegisterRequest,
} from '../types/auth';
import { request } from './apiClient';

const BASE_URL = '/api/Auth';

export const authApi = {
  login: (data: LoginRequest) =>
    request<LoginResponse>(`${BASE_URL}/Login`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  register: (data: RegisterRequest) =>
    request<string>(`${BASE_URL}/Register`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  refresh: (data: RefreshTokenRequest) =>
    request<LoginResponse>(`${BASE_URL}/Refresh`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  me: () => request<AuthUser>(`${BASE_URL}/Me`),

  logout: (data: LogoutRequest) =>
    request<null>(`${BASE_URL}/Logout`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getPendingUsers: () => request<PendingUser[]>(`${BASE_URL}/PendingUsers`),

  approveUser: (userId: number, data: ApproveUserRequest) =>
    request<null>(`${BASE_URL}/Approve/${userId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  rejectUser: (userId: number) =>
    request<null>(`${BASE_URL}/Reject/${userId}`, {
      method: 'POST',
    }),
};
