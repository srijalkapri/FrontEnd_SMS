export interface AuthUser {
  id: number;
  username: string;
  fullName: string;
  role: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  expiresAt: string;
  user: AuthUser;
}

export interface RegisterRequest {
  username: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  email: string;
}

export interface PendingUser {
  id: number;
  username: string;
  fullName: string;
  email: string;
  createdAt: string;
}

export type UserRole = 'Admin' | 'Teacher';

export interface ApproveUserRequest {
  role: UserRole;
}
