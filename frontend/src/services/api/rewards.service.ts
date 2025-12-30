import apiClient from './client';
import { Achievement, AchievementNotification } from '@/types/rewards.types';

export const rewardsService = {
  async getMyAchievements(): Promise<Achievement[]> {
    const response = await apiClient.get<Achievement[]>('/api/rewards/my-achievements');
    return response.data;
  },

  async checkNewAchievements(lastCheck?: string): Promise<AchievementNotification> {
    const params = lastCheck ? { last_check: lastCheck } : {};
    const response = await apiClient.get<AchievementNotification>('/api/rewards/new-achievements', { params });
    return response.data;
  },

  async initializeAchievements(): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>('/api/rewards/initialize');
    return response.data;
  },
};
