import apiClient from './client';
import {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  PasswordResetRequest,
  PasswordResetConfirm,
  User,
} from '@/types/auth.types';

type BackendUserPublic = {
  userId: number;
  name: string;
  email: string;
  role: 'STUDENT' | 'TEACHER' | 'ADMIN';
  isVerified: boolean;
};

type BackendLoginResponse = {
  access_token: string;
  token_type: string;
  user: BackendUserPublic;
};

type BackendRegisterResponse = {
  user: BackendUserPublic;
  message: string;
  verification_token?: string | null;
};

type BackendVerifyEmailResponse = {
  verified: boolean;
};

function mapRoleToBackend(role: RegisterRequest['role']): BackendUserPublic['role'] {
  if (role === 'student') return 'STUDENT';
  if (role === 'teacher') return 'TEACHER';
  return 'STUDENT';
}

function mapUserFromBackend(u: BackendUserPublic): User {
  return {
    id: String(u.userId),
    email: u.email,
    name: u.name,
    role: u.role.toLowerCase() as User['role'],
    isEmailVerified: Boolean(u.isVerified),
  };
}

export const authService = {
  /**
   * Register a new user account
   */
  register: async (data: RegisterRequest): Promise<BackendRegisterResponse> => {
    const payload = { ...data, role: mapRoleToBackend(data.role) };
    const response = await apiClient.post<BackendRegisterResponse>('/api/auth/register', payload);
    return response.data;
  },

  /**
   * Login with email and password
   */
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<BackendLoginResponse>('/api/auth/login', data);
    return {
      access_token: response.data.access_token,
      token_type: response.data.token_type,
      user: mapUserFromBackend(response.data.user),
    };
  },

  /**
   * Logout current user
   */
  logout: async (): Promise<void> => {
    await apiClient.post('/api/auth/logout');
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
  },

  /**
   * Verify email with token
   */
  verifyEmail: async (token: string): Promise<{ message: string }> => {
    const response = await apiClient.post<BackendVerifyEmailResponse>('/api/auth/verify-email', { token });
    return { message: response.data.verified ? 'Email verified successfully!' : 'Email verification failed.' };
  },

  /**
   * Request password reset email
   */
  requestPasswordReset: async (data: PasswordResetRequest): Promise<{ message: string }> => {
    const response = await apiClient.post('/api/auth/forgot-password', data);
    return response.data;
  },

  /**
   * Reset password with token
   */
  resetPassword: async (data: PasswordResetConfirm): Promise<{ message: string }> => {
    const response = await apiClient.post('/api/auth/reset-password', data);
    return response.data;
  },

  /**
   * Get current user profile
   */
  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get<BackendUserPublic>('/api/auth/me');
    return mapUserFromBackend(response.data);
  },

  /**
   * Refresh access token
   */
  refreshToken: async (): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/api/auth/refresh');
    return response.data;
  },
};
