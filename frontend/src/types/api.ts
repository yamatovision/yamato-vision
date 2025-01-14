// src/types/api.ts の修正
export interface APIError {
  message: string;
  details?: unknown;
}

export interface APIResponse<T> {
  success: boolean;
  data: T | null;  // null を許容するように変更
  message?: string;
  error?: string;  // エラー18を解決
  isComplete?: boolean;  // オプショナルプロパティとして追加
}

export interface StartExamResponse {
  startedAt: string;
  timeLimit: number;
}

export interface ExamResult {
  totalScore: number;
  finalScore: number;
  grade: '秀' | '優' | '良' | '可' | '不可';
  gradePoint: number;
  feedback: string;
  sectionResults: {
    sectionId: string;
    score: number;
    feedback: string;
    nextStep: string;
    submittedAt: Date;
  }[];
  evaluatedAt: Date;
}

