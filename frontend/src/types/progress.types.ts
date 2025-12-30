export interface ProgressTimelinePoint {
  date: string; // ISO date
  correctAnswerRate: number;
  completedContentCount: number;
  cefrLevel: string | null;
}

export interface TopicProgress {
  topicName: string;
  progress: number; // 0.0 to 1.0
  completedCount: number;
  totalCount: number;
}

export interface ContentTypeProgress {
  contentType: string;
  completedCount: number;
}

export interface ProgressResponse {
  studentId: number;
  completedLessons: number[];
  completedTests: number[];
  correctAnswerRate: number;
  lastUpdated?: string | null;
  completionRate: number;
  timeline: ProgressTimelinePoint[];
  currentLevel: string | null;
  dailyStreak: number;
  totalPoints: number;
  completedContentCount: number;
  topicProgress: TopicProgress[];
  contentTypeProgress: ContentTypeProgress[];
}
