export interface ProgressTimelinePoint {
  date: string; // ISO date
  correctAnswerRate: number;
}

export interface ProgressResponse {
  studentId: number;
  completedLessons: number[];
  completedTests: number[];
  correctAnswerRate: number;
  lastUpdated?: string | null;
  completionRate: number;
  timeline: ProgressTimelinePoint[];
}
