import { LanguageLevel } from './test.types';

export interface LearningPlan {
  planId: number;
  studentId: number;
  recommendedLevel: LanguageLevel;
  isGeneral: boolean;
  strengths: string[];
  weaknesses: string[];
  topics: TopicRecommendation[];
  createdAt: string;
  updatedAt: string;
}

export interface TopicRecommendation {
  topicId?: number | null;
  name: string;
  category: string;
  difficulty: LanguageLevel;
  priority: number;
  reason: string;
  evidence?: string[];
}

export interface ContentItem {
  id: string;
  title: string;
  description: string;
  type: 'lesson' | 'exercise' | 'roleplay' | 'quiz';
  level: LanguageLevel;
  duration: number;
  isCompleted: boolean;
  rationale?: string;
}

export interface StudentProgress {
  id: string;
  studentId: string;
  completedLessons: string[];
  totalLessons: number;
  completionRate: number;
  streak: number;
  lastActivityDate: string;
  achievements: Achievement[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  badgeUrl: string;
  earnedAt: string;
}

export interface ProgressChart {
  date: string;
  score: number;
  level: LanguageLevel;
}
