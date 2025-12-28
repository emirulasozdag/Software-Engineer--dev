import apiClient from './client';

export type BackendAssignmentOut = {
  assignmentId: number;
  teacherUserId: number;
  title: string;
  description?: string | null;
  dueDate: string;
  assignmentType: string;
  createdAt: string;
};

export type BackendStudentAssignmentOut = {
  studentAssignmentId: number;
  assignmentId: number;
  studentUserId: number;
  status: 'PENDING' | 'SUBMITTED' | 'GRADED' | 'LATE';
  submittedAt?: string | null;
  score?: number | null;
  assignment?: BackendAssignmentOut | null;
};

export const assignmentsService = {
  // UC15 teacher: create + optionally assign to students (by userId)
  createAssignment: async (payload: {
    title: string;
    description?: string | null;
    dueDate: string; // ISO datetime
    assignmentType: string;
    studentUserIds?: number[];
  }): Promise<BackendAssignmentOut> => {
    const response = await apiClient.post('/api/assignments', {
      title: payload.title,
      description: payload.description ?? null,
      dueDate: payload.dueDate,
      assignmentType: payload.assignmentType,
      studentUserIds: payload.studentUserIds ?? [],
    });
    return response.data;
  },

  getTeacherAssignments: async (): Promise<{ assignments: BackendAssignmentOut[] }> => {
    const response = await apiClient.get('/api/assignments/teacher/my-assignments');
    return response.data;
  },

  // UC15 student: list my assignments
  getMyAssignments: async (): Promise<{ assignments: BackendStudentAssignmentOut[] }> => {
    const response = await apiClient.get('/api/assignments/student/my-assignments');
    return response.data;
  },

  submitMyAssignment: async (studentAssignmentId: number): Promise<{ updated: boolean; studentAssignmentId: number; status: string }> => {
    const response = await apiClient.post(`/api/assignments/student-assignments/${studentAssignmentId}/submit`);
    return response.data;
  },
};


