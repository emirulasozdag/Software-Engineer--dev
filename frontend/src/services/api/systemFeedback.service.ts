import apiClient from './client';
import { SystemFeedback } from '@/types/admin.types';

export type SubmitSystemFeedbackRequest = {
  category: SystemFeedback['category'];
  title: string;
  description: string;
};

export const systemFeedbackService = {
  submit: async (payload: SubmitSystemFeedbackRequest): Promise<SystemFeedback> => {
    const response = await apiClient.post<SystemFeedback>('/api/system-feedback', payload);
    return response.data;
  },
};
