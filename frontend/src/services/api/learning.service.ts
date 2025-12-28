import apiClient from './client';
import { LearningPlan, ContentItem, StudentProgress, ProgressChart } from '@/types/learning.types';
import { LanguageLevel } from '@/types/test.types';

export type BackendContentOut = {
  contentId: number;
  title: string;
  body: string;
  contentType: 'LESSON' | 'EXERCISE' | 'ROLEPLAY' | 'VOCABULARY' | 'GRAMMAR';
  level: LanguageLevel;
  createdBy: number;
  createdAt: string;
  isDraft: boolean;
};

export const learningService = {
  /**
   * Get personalized learning plan for current student
   */
  getMyLearningPlan: async (refresh: boolean = false): Promise<LearningPlan> => {
    const qs = refresh ? '?refresh=true' : '';
    const response = await apiClient.get(`/api/personal-plan/me${qs}`);
    return response.data;
  },

  /**
   * Dev helper: seed a demo test result so UC7 produces a personalized plan
   */
  seedUc7Demo: async (): Promise<{ message: string }> => {
    const response = await apiClient.post('/api/personal-plan/demo-seed');
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

  /**
   * UC8: Deliver next content for student (+ rationale)
   */
  deliverNextContent: async (payload: {
    studentId: number;
    level?: LanguageLevel;
    contentType?: 'LESSON' | 'EXERCISE' | 'ROLEPLAY' | 'VOCABULARY' | 'GRAMMAR';
    planTopics?: string[] | null;
  }): Promise<{ content: BackendContentOut; rationale: string }> => {
    const response = await apiClient.post('/api/content-delivery', {
      studentId: payload.studentId,
      level: payload.level ?? null,
      contentType: payload.contentType ?? 'LESSON',
      planTopics: payload.planTopics ?? null,
    });
    return response.data;
  },

  /**
   * UC9: Update content based on progress (+ rationale)
   */
  updateContentByProgress: async (payload: {
    studentId: number;
    correctAnswerRate: number; // 0..1
    planTopics?: string[] | null;
  }): Promise<{ updated: boolean; content: BackendContentOut; rationale: string }> => {
    const response = await apiClient.post('/api/content-update', {
      studentId: payload.studentId,
      progress: { correctAnswerRate: payload.correctAnswerRate },
      planTopics: payload.planTopics ?? null,
    });
    return response.data;
  },

  /**
   * UC8/UC9: Get delivered content by id (backend ContentOut shape)
   */
  getDeliveredContentById: async (contentId: string): Promise<BackendContentOut> => {
    const response = await apiClient.get(`/api/content-delivery/${contentId}`);
    return response.data;
  },
};
