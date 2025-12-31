import apiClient from './client';
import { ProgressResponse } from '@/types/progress.types';

export const progressService = {
  /**
   * UC10: Get current student's progress (data + timeline for charts)
   */
  getMyProgress: async (): Promise<ProgressResponse> => {
    const response = await apiClient.get('/api/progress/me');
    return response.data;
  },

  /**
   * UC10 (Teacher/Admin): Get a student's progress by id
   */
  getStudentProgress: async (studentId: number): Promise<ProgressResponse> => {
    const response = await apiClient.get(`/api/progress/${studentId}`);
    return response.data;
  },

  /**
   * UC11: Export current student's progress as CSV
   */
  exportMyProgressCsv: async (): Promise<Blob> => {
    const response = await apiClient.get('/api/export/progress/me.csv', {
      responseType: 'blob',
    });
    return response.data;
  },

  /**
   * Export current student's progress as PDF
   */
  exportMyProgressPdf: async (): Promise<Blob> => {
    const response = await apiClient.get('/api/export/progress/me.pdf', {
      responseType: 'blob',
    });
    return response.data;
  },

  /**
   * UC11 (Teacher/Admin): Export a student's progress as CSV
   */
  exportProgressCsv: async (studentId: number): Promise<Blob> => {
    const response = await apiClient.get(`/api/export/progress/${studentId}.csv`, {
      responseType: 'blob',
    });
    return response.data;
  },
};
