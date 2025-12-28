import apiClient from './client';
import {
  PlacementTestResult,
  TestQuestion,
  TestSubmission,
  TestModuleResult,
  TestModuleType,
} from '@/types/test.types';

export const testService = {
  /**
   * Start a new placement test
   */
  startPlacementTest: async (): Promise<{ testId: string; questions: TestQuestion[] }> => {
    const response = await apiClient.post('/api/placement-test/start');
    return response.data;
  },

  /**
   * Get questions for a specific test module
   */
  getModuleQuestions: async (moduleType: TestModuleType): Promise<TestQuestion[]> => {
    const response = await apiClient.get(`/api/placement-test/module/${moduleType}`);
    return response.data;
  },

  /**
   * Submit answers for a test module
   */
  submitModule: async (
    moduleType: TestModuleType,
    submissions: TestSubmission[]
  ): Promise<TestModuleResult> => {
    const response = await apiClient.post(`/api/placement-test/module/${moduleType}/submit`, {
      submissions,
    });
    return response.data;
  },

  /**
   * Submit speaking test audio
   */
  submitSpeakingTest: async (audioBlob: Blob, questionId: string): Promise<TestModuleResult> => {
    const formData = new FormData();
    formData.append('audio', audioBlob);
    formData.append('questionId', questionId);

    const response = await apiClient.post('/api/speaking-test/submit', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Get listening test audio
   */
  getListeningAudio: async (questionId: string): Promise<Blob> => {
    const response = await apiClient.get(`/api/listening-test/audio/${questionId}`, {
      responseType: 'blob',
    });
    return response.data;
  },

  /**
   * Complete placement test and get results
   */
  completePlacementTest: async (testId: string): Promise<PlacementTestResult> => {
    const response = await apiClient.post(`/api/placement-test/${testId}/complete`);
    return response.data;
  },

  /**
   * Get test results by ID
   */
  getTestResults: async (testId: string): Promise<PlacementTestResult> => {
    const response = await apiClient.get(`/api/test-results/${testId}`);
    return response.data;
  },

  /**
   * Get all test results for current student
   */
  getStudentTestResults: async (): Promise<PlacementTestResult[]> => {
    const response = await apiClient.get('/api/test-results/my-results');
    return response.data;
  },
};
