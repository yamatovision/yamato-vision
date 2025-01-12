// backend/src/courses/types/examination.ts

import { Prisma } from '@prisma/client';

// 試験セクションの定義
export interface ExamSection {
  id: string;
  title: string;
  content?: string;
  maxPoints: number;
}


export interface ExamSectionSubmission {
  sectionNumber: number;
  content: string;
}

export interface ExamSectionResponse {
  score: number;
  feedback: string;
  submittedAt: Date;
  isComplete: boolean;
}

// 試験結果の定義
export interface ExamResult {
  totalScore: number;
  grade: '秀' | '優' | '良' | '可' | '不可';
  gradePoint: number;
  feedback: string;
  sectionResults: SectionResult[];
  evaluatedAt: Date;
}

// セクション毎の結果
export interface SectionResult {
  sectionId: string;
  score: number;
  feedback: string;
  nextStep: string;
  submittedAt: Date;
}

export interface GetExamProgressParams {
  userId: string;
  courseId: string;
  chapterId: string;
}

// 試験の進捗状況
export interface ExamProgress {
  userId: string;
  chapterId: string;
  currentSection: number;
  startedAt: Date;
  timeLimit: number;
  isComplete: boolean;
  completedAt?: Date;
  sections: ExamSection[];
  sectionResults?: SectionResult[];
}

// 試験提出データ
export interface ExamSubmission {
  userId: string;
  chapterId: string;
  sectionId: string;
  content: string;
  submittedAt: Date;
}

// 成績評価基準
export const GRADE_CRITERIA = {
  SHU: { min: 90, point: 4.0, label: '秀' },
  YU: { min: 80, point: 3.0, label: '優' },
  RYO: { min: 70, point: 2.0, label: '良' },
  KA: { min: 60, point: 1.0, label: '可' },
  FUKA: { min: 0, point: 0.0, label: '不可' }
} as const;

// APIレスポンス型
export interface ExamResponse {
  examId: string;
  sections: ExamSection[];
  timeLimit: number; // 分単位
  startedAt: Date;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
  currentSection?: number;
  sectionResults?: SectionResult[];
}

// リクエスト型
export interface StartExamRequest {
  userId: string;
  chapterId: string;
}

export interface SubmitSectionRequest {
  userId: string;
  chapterId: string;
  sectionNumber: number; // sectionIdをnumberに変更
  content: string;
}

// エラー型
export class ExamError extends Error {
  constructor(
    message: string,
    public code: 'TIMEOUT' | 'INVALID_STATE' | 'NOT_FOUND' | 'UNAUTHORIZED'
  ) {
    super(message);
    this.name = 'ExamError';
  }
}