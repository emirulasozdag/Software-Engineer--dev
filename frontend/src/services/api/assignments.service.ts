import apiClient from './client';

export type AssignmentContentType = 'TEXT' | 'TEST';
export type QuestionType = 'MULTIPLE_CHOICE' | 'TRUE_FALSE';

export type QuestionOptionCreate = {
  optionLetter: string;
  optionText: string;
};

export type QuestionCreate = {
  questionType: QuestionType;
  questionText: string;
  questionOrder: number;
  points?: number | null;
  correctAnswer: string;
  options?: QuestionOptionCreate[];
};

export type QuestionOptionOut = {
  optionLetter: string;
  optionText: string;
};

export type QuestionOut = {
  questionId: number;
  questionType: QuestionType;
  questionText: string;
  questionOrder: number;
  points: number;
  options: QuestionOptionOut[];
};

export type QuestionWithAnswerOut = QuestionOut & {
  correctAnswer: string;
};

export type BackendAssignmentOut = {
  assignmentId: number;
  teacherUserId: number;
  title: string;
  description?: string | null;
  dueDate: string;
  assignmentType: string;
  contentType: AssignmentContentType;
  contentText?: string | null;
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

export type StudentAnswerOut = {
  questionId: number;
  answer: string;
  isCorrect?: boolean | null;
  pointsEarned?: number | null;
};

export type AssignmentWithAnswersOut = {
  assignment: BackendAssignmentOut;
  questions: QuestionWithAnswerOut[];
  studentAnswers: StudentAnswerOut[];
  totalScore?: number | null;
};

export const assignmentsService = {
  createAssignment: async (payload: {
    title: string;
    description?: string | null;
    dueDate: string;
    assignmentType: string;
    contentType: AssignmentContentType;
    contentText?: string | null;
    questions?: QuestionCreate[];
    studentUserIds?: number[];
  }): Promise<BackendAssignmentOut> => {
    const response = await apiClient.post('/api/assignments', {
      title: payload.title,
      description: payload.description ?? null,
      dueDate: payload.dueDate,
      assignmentType: payload.assignmentType,
      contentType: payload.contentType,
      contentText: payload.contentText ?? null,
      questions: payload.questions ?? [],
      studentUserIds: payload.studentUserIds ?? [],
    });
    return response.data;
  },

  getTeacherAssignments: async (): Promise<{ assignments: BackendAssignmentOut[] }> => {
    const response = await apiClient.get('/api/assignments/teacher/my-assignments');
    return response.data;
  },

  getMyAssignments: async (): Promise<{ assignments: BackendStudentAssignmentOut[] }> => {
    const response = await apiClient.get('/api/assignments/student/my-assignments');
    return response.data;
  },

  getAssignmentQuestions: async (assignmentId: number): Promise<QuestionOut[]> => {
    const response = await apiClient.get(`/api/assignments/${assignmentId}/questions`);
    return response.data;
  },

  getAssignmentDetails: async (studentAssignmentId: number): Promise<AssignmentWithAnswersOut> => {
    const response = await apiClient.get(`/api/assignments/student-assignments/${studentAssignmentId}/details`);
    return response.data;
  },

  submitMyAssignment: async (studentAssignmentId: number): Promise<{ updated: boolean; studentAssignmentId: number; status: string }> => {
    const response = await apiClient.post(`/api/assignments/student-assignments/${studentAssignmentId}/submit`);
    return response.data;
  },

  submitTestAnswers: async (
    studentAssignmentId: number,
    answers: { questionId: number; answer: string }[]
  ): Promise<{ updated: boolean; studentAssignmentId: number; status: string }> => {
    const response = await apiClient.post(`/api/assignments/student-assignments/${studentAssignmentId}/submit-test`, {
      answers,
    });
    return response.data;
  },
};



