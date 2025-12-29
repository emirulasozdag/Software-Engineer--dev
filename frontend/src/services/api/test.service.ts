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
  startPlacementTest: async (): Promise<{ testId: string; modules: TestModuleType[] }> => {
    const response = await apiClient.post('/api/placement-test/start');
    return response.data;
  },

  /**
   * Get questions for a specific test module
   */
  getModuleQuestions: async (testId: string, moduleType: TestModuleType): Promise<TestQuestion[]> => {
    const response = await apiClient.get(`/api/placement-test/${testId}/module/${moduleType}`);
    return response.data.questions;
  },

  /**
   * Submit answers for a test module
   */
  submitModule: async (
    testId: string,
    moduleType: TestModuleType,
    submissions: TestSubmission[]
  ): Promise<TestModuleResult> => {
    const response = await apiClient.post(`/api/placement-test/${testId}/module/${moduleType}/submit`, {
      submissions,
    });
    return response.data;
  },

  /**
   * Submit speaking test audio
   */
  submitSpeakingTest: async (testId: string, audioBlob: Blob, questionId: string): Promise<TestModuleResult> => {
    const formData = new FormData();
    formData.append('audio', audioBlob);
    formData.append('questionId', questionId);

    const response = await apiClient.post(`/api/placement-test/${testId}/module/speaking/submit-audio`, formData, {
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

  listActiveTests: async (): Promise<{ testId: number; currentStep: number; updatedAt: string }[]> => {
    const response = await apiClient.get('/api/placement-test/active');
    return response.data;
  },

  saveProgress: async (testId: string, currentStep: number, answers: Record<string, any>): Promise<void> => {
    await apiClient.post('/api/placement-test/save-progress', {
      testId: parseInt(testId),
      currentStep,
      answers,
    });
  },

  resumeTest: async (testId: string): Promise<{ testId: string; currentStep: number; answers: Record<string, any> }> => {
    const response = await apiClient.get(`/api/placement-test/${testId}/resume`);
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
