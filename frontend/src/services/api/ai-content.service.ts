import apiClient from './client';
import type { LanguageLevel } from '@/types/test.types';

export type TeacherDraftContentOut = {
  contentId: number;
  title: string;
  body: string;
  contentType: 'LESSON' | 'EXERCISE' | 'ROLEPLAY' | 'VOCABULARY' | 'GRAMMAR';
  level: LanguageLevel;
  createdBy: number;
  createdAt: string;
  isDraft: boolean;
};

export const aiContentService = {
  listMyDrafts: async (): Promise<{ drafts: TeacherDraftContentOut[] }> => {
    const response = await apiClient.get('/api/ai-content/teacher/my-drafts');
    return response.data;
  },

  createDraft: async (payload: {
    title: string;
    instructions: string;
    contentType?: TeacherDraftContentOut['contentType'];
    level?: LanguageLevel;
  }): Promise<{ content: TeacherDraftContentOut; rationale: string }> => {
    const response = await apiClient.post('/api/ai-content/teacher/draft', {
      title: payload.title,
      instructions: payload.instructions,
      contentType: payload.contentType ?? 'LESSON',
      level: payload.level ?? 'A1',
    });
    return response.data;
  },

  regenerateDraft: async (contentId: number, payload: { title: string; instructions: string }): Promise<{ content: TeacherDraftContentOut; rationale: string }> => {
    const response = await apiClient.post(`/api/ai-content/teacher/draft/${contentId}/regenerate`, {
      title: payload.title,
      instructions: payload.instructions,
      contentType: 'LESSON',
      level: 'A1',
    });
    return response.data;
  },

  publishDraft: async (contentId: number): Promise<TeacherDraftContentOut> => {
    const response = await apiClient.post(`/api/ai-content/teacher/draft/${contentId}/publish`);
    return response.data;
  },
};


