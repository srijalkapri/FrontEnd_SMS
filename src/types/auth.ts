export type UserRole = 'SuperAdmin' | 'Teacher' | 'Student';

export interface AuthUser {
  id: number;
  username: string;
  fullName: string;
  role: UserRole | string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  expiresAt: string;
  refreshToken: string;
  refreshTokenExpiresAt: string;
  user: AuthUser;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface LogoutRequest {
  refreshToken: string;
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

export type ApproveUserRequest =
  | { role: 'SuperAdmin' }
  | { role: 'Teacher'; teacherId: number }
  | { role: 'Teacher'; phoneNo: string }
  | { role: 'Student'; studentId: number }
  | { role: 'Student'; gradeId: number; phoneNo: string };
