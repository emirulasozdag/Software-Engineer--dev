import apiClient from './client';
import {
  SystemStats,
  UserAccount,
  MaintenanceMode,
  SystemFeedback,
} from '@/types/admin.types';

type BackendAdminUserOut = {
  userId: number;
  name: string;
  email: string;
  role: 'STUDENT' | 'TEACHER' | 'ADMIN';
  isVerified: boolean;
  createdAt: string;
  lastLogin?: string | null;
};

type BackendAdminUserListResponse = {
  users: BackendAdminUserOut[];
};

type BackendMaintenanceStatus = {
  enabled: boolean;
  reason?: string | null;
  startedAt?: string | null;
};

function mapUser(u: BackendAdminUserOut): UserAccount {
  return {
    userId: Number(u.userId),
    name: u.name,
    email: u.email,
    role: u.role.toLowerCase() as UserAccount['role'],
    isVerified: Boolean(u.isVerified),
    createdAt: u.createdAt,
    lastLogin: u.lastLogin ?? null,
  };
}

export const adminService = {
  /**
   * Get system statistics
   */
  getSystemStats: async (): Promise<SystemStats> => {
    const response = await apiClient.get('/api/admin/stats');
    return response.data;
  },

  /**
   * Get all user accounts
   */
  getAllUsers: async (): Promise<UserAccount[]> => {
    const response = await apiClient.get<BackendAdminUserListResponse>('/api/admin/users');
    return (response.data.users ?? []).map(mapUser);
  },

  updateUserRole: async (userId: number, role: UserAccount['role']): Promise<UserAccount> => {
    const backendRole = role.toUpperCase() as BackendAdminUserOut['role'];
    const response = await apiClient.patch<BackendAdminUserOut>(`/api/admin/users/${userId}/role`, { role: backendRole });
    return mapUser(response.data);
  },

  setUserVerified: async (userId: number, isVerified: boolean): Promise<UserAccount> => {
    const response = await apiClient.patch<BackendAdminUserOut>(`/api/admin/users/${userId}/verified`, { isVerified });
    return mapUser(response.data);
  },

  /**
   * Get maintenance mode status
   */
  getMaintenanceMode: async (): Promise<MaintenanceMode> => {
    const response = await apiClient.get<BackendMaintenanceStatus>('/api/admin/maintenance');
    return response.data;
  },

  /**
   * Set maintenance mode
   */
  setMaintenanceMode: async (data: MaintenanceMode): Promise<MaintenanceMode> => {
    const response = await apiClient.post<BackendMaintenanceStatus>('/api/admin/maintenance', data);
    return response.data;
  },

  /**
   * Get all system feedback
   */
  getAllFeedback: async (): Promise<SystemFeedback[]> => {
    const response = await apiClient.get('/api/system-feedback');
    return response.data;
  },

  /**
   * Update feedback status
   */
  updateFeedbackStatus: async (
    feedbackId: string,
    status: 'pending' | 'in-progress' | 'resolved'
  ): Promise<SystemFeedback> => {
    const response = await apiClient.patch(`/api/system-feedback/${feedbackId}`, { status });
    return response.data;
  },
};
