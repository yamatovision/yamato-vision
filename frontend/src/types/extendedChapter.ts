import { 
  Chapter as BaseChapter,
  ChapterContent as BaseChapterContent,
  ExamSettings as BaseExamSettings,
} from './chapter';

import {
  ChapterProgressStatus,
  ChapterEvaluationStatus
} from './status';

export interface ExamTaskSection {
  materials: string;
  task: string;
  evaluationCriteria: string;
}

export interface ExamSection {
  number: 1 | 2 | 3;
  title: string;
  task: ExamTaskSection;
}

// 試験設定用のDTO
export interface CreateExamChapterDTO {
  title: string;
  subtitle?: string;
  timeLimit: number;
  releaseTime?: number;
  isFinalExam: boolean;
  examSettings: {
    sections: ExamSection[];
    thumbnailUrl?: string;
    maxPoints: number;
    timeLimit: number;
    type: 'exam';
  };
}

export interface UpdateExamChapterDTO extends Omit<CreateExamChapterDTO, 'releaseTime'> {
  id: string;
  releaseTime?: number; // 更新時はオプショナルに
}

// 拡張されたChapterContent型
export interface ExtendedChapterContent extends BaseChapterContent {
  thumbnailUrl?: string;
  lessonWatchRate?: number;
  submission?: {
    score?: number;
    status?: string;
  };
  progress?: {
    startedAt: string | null;
    completedAt: string | null;
  };
}

// 拡張されたExamSettings型
export interface ExtendedExamSettings extends BaseExamSettings {
  sections: ExamSection[];
  thumbnailUrl?: string;
  maxPoints: number;
  timeLimit: number;
  type: 'exam';
}

// 拡張されたChapter型
export interface ExtendedChapter extends Omit<BaseChapter, 'content'> {
  content: ExtendedChapterContent;
  status: ChapterProgressStatus;
  evaluationStatus?: ChapterEvaluationStatus;
  score?: number;
  timeOutAt?: string;
  thumbnailUrl?: string;
  lessonWatchRate: number;
  isLocked: boolean;
  canAccess: boolean;
  nextUnlockTime?: number;
  taskContent?: {
    description: string;
  };
  task?: {
    title: string;
    materials: string;
    task: string;
    evaluationCriteria: string;
    maxPoints: number;
  };
  referenceFiles?: Array<{
    id: string;
    name: string;
    url: string;
    type: string;
    size: number;
    uploadedAt: string;
  }>;
}

// DTOの型定義
export interface CreateExamChapterDTO {
  title: string;
  subtitle?: string;
  timeLimit: number;
  releaseTime?: number;
  isFinalExam: boolean;
  examSettings: {
    sections: ExamSection[];
    thumbnailUrl?: string;
    maxPoints: number;
    timeLimit: number;
    type: 'exam';
  };
}

export interface UpdateExamChapterDTO extends CreateExamChapterDTO {
  id: string;
}