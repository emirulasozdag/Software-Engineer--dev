import apiClient from './client';
import { LearningPlan, ContentItem, StudentProgress, ProgressChart } from '@/types/learning.types';

export const learningService = {
  /**
   * Get personalized learning plan for current student
   */
  getMyLearningPlan: async (): Promise<LearningPlan> => {
    const response = await apiClient.get('/api/personal-plan');
    return response.data;
  },

  /**
   * Get AI-generated content for student
   */
  getAIContent: async (): Promise<ContentItem[]> => {
    const response = await apiClient.get('/api/ai-content');
    return response.data;
  },

  /**
   * Get specific content item
   */
  getContentItem: async (contentId: string): Promise<ContentItem> => {
    const response = await apiClient.get(`/api/content-delivery/${contentId}`);
    return response.data;
  },

  /**
   * Mark content as completed
   */
  completeContent: async (contentId: string): Promise<{ message: string }> => {
    const response = await apiClient.post(`/api/content-delivery/${contentId}/complete`);
    return response.data;
  },

  /**
   * Get student progress data
   */
  getProgress: async (): Promise<StudentProgress> => {
    const response = await apiClient.get('/api/progress');
    return response.data;
  },

  /**
   * Get progress chart data
   */
  getProgressCharts: async (): Promise<ProgressChart[]> => {
    const response = await apiClient.get('/api/progress/charts');
    return response.data;
  },

  /**
   * Export progress data
   */
  exportProgress: async (format: 'pdf' | 'csv'): Promise<Blob> => {
    const response = await apiClient.get(`/api/data-export?format=${format}`, {
      responseType: 'blob',
    });
    return response.data;
  },

  /**
   * Submit feedback for content
   */
  submitContentFeedback: async (
    contentId: string,
    rating: number,
    comment: string
  ): Promise<{ message: string }> => {
    const response = await apiClient.post(`/api/automatic-feedback`, {
      contentId,
      rating,
      comment,
    });
    return response.data;
  },

  /**
   * Request content update based on progress
   */
  requestContentUpdate: async (): Promise<{ message: string; updatedContent: ContentItem[] }> => {
    const response = await apiClient.post('/api/content-update');
    return response.data;
  },
};
