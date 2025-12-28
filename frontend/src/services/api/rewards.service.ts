import apiClient from './client';
import { RewardSummary } from '@/types/rewards.types';

export const rewardsService = {
    getMySummary: async (): Promise<RewardSummary> => {
        const response = await apiClient.get('/api/rewards/me/summary');
        return response.data;
    },
};
