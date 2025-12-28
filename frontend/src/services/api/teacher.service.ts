import apiClient from './client';
import { Assignment, StudentOverview, TeacherDirective } from '@/types/teacher.types';

export const teacherService = {
  /**
   * Get all students assigned to teacher
   */
  getMyStudents: async (): Promise<StudentOverview[]> => {
    const response = await apiClient.get('/api/users/teacher/students');
    return response.data;
  },

  /**
   * Get detailed student information
   */
  getStudentDetails: async (studentId: string): Promise<StudentOverview> => {
    const response = await apiClient.get(`/api/users/student/${studentId}`);
    return response.data;
  },

  /**
   * Get student test results
   */
  getStudentTestResults: async (studentId: string) => {
    const response = await apiClient.get(`/api/test-results/student/${studentId}`);
    return response.data;
  },

  /**
   * Get student progress
   */
  getStudentProgress: async (studentId: string) => {
    const response = await apiClient.get(`/api/progress/${studentId}`);
    return response.data;
  },

  /**
   * Create new assignment
   */
  createAssignment: async (assignment: Omit<Assignment, 'id' | 'createdAt'>): Promise<Assignment> => {
    const response = await apiClient.post('/api/assignments', assignment);
    return response.data;
  },

  /**
   * Get all assignments created by teacher
   */
  getMyAssignments: async (): Promise<Assignment[]> => {
    const response = await apiClient.get('/api/assignments/teacher/my-assignments');
    return response.data;
  },

  /**
   * Update assignment
   */
  updateAssignment: async (assignmentId: string, data: Partial<Assignment>): Promise<Assignment> => {
    const response = await apiClient.put(`/api/assignments/${assignmentId}`, data);
    return response.data;
  },

  /**
   * Delete assignment
   */
  deleteAssignment: async (assignmentId: string): Promise<{ message: string }> => {
    const response = await apiClient.delete(`/api/assignments/${assignmentId}`);
    return response.data;
  },

  /**
   * Send directive to AI engine for student
   */
  sendAIDirective: async (directive: TeacherDirective): Promise<{ message: string }> => {
    const response = await apiClient.post('/api/ai-content/teacher-directive', directive);
    return response.data;
  },

  /**
   * Export student progress
   */
  exportStudentProgress: async (studentId: string, format: 'pdf' | 'csv'): Promise<Blob> => {
    const response = await apiClient.get(
      `/api/data-export/student/${studentId}?format=${format}`,
      {
        responseType: 'blob',
      }
    );
    return response.data;
  },
};
