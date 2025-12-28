import apiClient from './client';
import {
  SystemStats,
  UserAccount,
  MaintenanceMode,
  SystemFeedback,
} from '@/types/admin.types';

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
    const response = await apiClient.get('/api/admin/users');
    return response.data;
  },

  /**
   * Get user by ID
   */
  getUserById: async (userId: string): Promise<UserAccount> => {
    const response = await apiClient.get(`/api/admin/users/${userId}`);
    return response.data;
  },

  /**
   * Update user account
   */
  updateUser: async (userId: string, data: Partial<UserAccount>): Promise<UserAccount> => {
    const response = await apiClient.put(`/api/admin/users/${userId}`, data);
    return response.data;
  },

  /**
   * Delete user account
   */
  deleteUser: async (userId: string): Promise<{ message: string }> => {
    const response = await apiClient.delete(`/api/admin/users/${userId}`);
    return response.data;
  },

  /**
   * Toggle user active status
   */
  toggleUserStatus: async (userId: string): Promise<UserAccount> => {
    const response = await apiClient.patch(`/api/admin/users/${userId}/toggle-status`);
    return response.data;
  },

  /**
   * Get maintenance mode status
   */
  getMaintenanceMode: async (): Promise<MaintenanceMode> => {
    const response = await apiClient.get('/api/admin/maintenance');
    return response.data;
  },

  /**
   * Set maintenance mode
   */
  setMaintenanceMode: async (data: MaintenanceMode): Promise<MaintenanceMode> => {
    const response = await apiClient.post('/api/admin/maintenance', data);
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
