import type { LanguageLevel } from './test.types';

export interface Assignment {
  id: string;
  teacherId: string;
  studentIds: string[];
  title: string;
  description: string;
  type: 'homework' | 'test' | 'activity';
  dueDate: string;
  createdAt: string;
  status: 'pending' | 'submitted' | 'graded';
}

import type { LanguageLevel } from './test.types';

export interface StudentOverview {
  id: string;
  name: string;
  email: string;
  currentLevel: LanguageLevel;
  strengths: string[];
  weaknesses: string[];
  completionRate: number;
  lastActivity: string;
}

export interface TeacherDirective {
  studentId: string;
  contentType: string;
  focusAreas: string[];
  instructions: string;
}

export type { LanguageLevel } from './test.types';
