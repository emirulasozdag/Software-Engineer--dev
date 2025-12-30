export type LanguageLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export type TestModuleType = 'reading' | 'writing' | 'listening' | 'speaking';

export interface PlacementTestResult {
  id: string;
  studentId: string;
  overallLevel: LanguageLevel;
  readingLevel: LanguageLevel;
  writingLevel: LanguageLevel;
  listeningLevel: LanguageLevel;
  speakingLevel: LanguageLevel;
  completedAt: string;
}

export interface TestQuestion {
  id: string;
  type: TestModuleType;
  question: string;
  options?: string[];
  audioUrl?: string;
  correctAnswer?: string;
}

export interface ListeningQuestion {
  id: string;
  question: string;
  options: string[];
}

export interface ListeningQuestionGroup {
  audioUrl: string;
  transcript?: string;
  questions: ListeningQuestion[];
}

export interface TestSubmission {
  questionId: string;
  answer: string;
  audioData?: Blob;
}

export interface TestModuleResult {
  moduleType: TestModuleType;
  level: LanguageLevel;
  score: number;
  feedback: string;
}
