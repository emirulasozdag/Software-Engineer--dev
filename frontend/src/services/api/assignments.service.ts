import apiClient from './client';

export type AssignmentType = 'TEXT' | 'TEST' | string;
export type QuestionType = 'MULTIPLE_CHOICE' | 'TRUE_FALSE';

export type AssignmentQuestionCreate = {
  questionType: QuestionType;
  prompt: string;
  options?: string[];
  correctAnswer: string; // 'A'|'B'|'C'|'D' or 'TRUE'|'FALSE'
  points?: number | null;
};

export type BackendAssignmentOut = {
  assignmentId: number;
  teacherUserId: number;
  title: string;
  description?: string | null;
  dueDate: string;
  assignmentType: AssignmentType;
  createdAt: string;
  textContent?: string | null;
};

export type BackendAssignmentQuestionOut = {
  questionId: number;
  questionIndex: number;
  questionType: QuestionType | string;
  prompt: string;
  options: string[];
  points: number;
  correctAnswer?: string | null;
};

export type BackendStudentAssignmentDetailOut = {
  studentAssignmentId: number;
  assignmentId: number;
  studentUserId: number;
  status: 'PENDING' | 'SUBMITTED' | 'GRADED' | 'LATE';
  submittedAt?: string | null;
  score?: number | null;
  maxScore?: number | null;
  assignment: BackendAssignmentOut;
  questions: BackendAssignmentQuestionOut[];
  studentAnswers: { questionId: number; answer: string }[];
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
    assignmentType: AssignmentType;
    textContent?: string | null;
    questions?: AssignmentQuestionCreate[];
    studentUserIds?: number[];
  }): Promise<BackendAssignmentOut> => {
    const response = await apiClient.post('/api/assignments', {
      title: payload.title,
      description: payload.description ?? null,
      dueDate: payload.dueDate,
      assignmentType: payload.assignmentType,
      textContent: payload.textContent ?? null,
      questions: payload.questions ?? [],
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

  getStudentAssignmentDetail: async (studentAssignmentId: number): Promise<BackendStudentAssignmentDetailOut> => {
    const response = await apiClient.get(`/api/assignments/student-assignments/${studentAssignmentId}`);
    return response.data;
  },

  submitTestAnswers: async (
    studentAssignmentId: number,
    answers: { questionId: number; answer: string }[],
  ): Promise<{ updated: boolean; studentAssignmentId: number; status: string; score: number; maxScore: number; breakdown: any[] }> => {
    const response = await apiClient.post(`/api/assignments/student-assignments/${studentAssignmentId}/submit-test`, {
      answers,
    });
    return response.data;
  },
};


