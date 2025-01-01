// backend/src/courses/user/userCourseTypes.ts

import { Prisma } from '@prisma/client';

export type CourseWithChapters = Prisma.CourseGetPayload<{
  include: {
    chapters: {
      include: {
        task: true;
      }
    }
  }
}>;

export interface CreateCourseDTO {
  title: string;
  description: string;
  thumbnail?: string;
  gemCost: number;
  levelRequired?: number;
  rankRequired?: string;
  timeLimit?: number;  // 日数単位
  passingScore?: number;
  excellentScore?: number;
}

export interface CreateChapterDTO {
  title: string;
  subtitle?: string;
  content: any;
  timeLimit?: number;  // 日数単位
  releaseTime?: number;  // コース開始からの経過日数
  orderIndex: number;
}

export interface TimeSettings {
  timeLimit?: number;  // 日数単位
  releaseTime?: number;  // コース開始からの経過日数
}

export interface UpdateCourseDTO extends Partial<CreateCourseDTO> {
  isPublished?: boolean;
  isArchived?: boolean;
}

export interface CourseTimeInfo {
  timeLimit: number;  // 日数単位
  startedAt?: Date;
  timeOutAt?: Date;
  remainingDays?: number;
}

export type CourseStatus = 
  | 'unlocked'          // 購入済み（未開始）
  | 'available'         // 購入可能
  | 'level_locked'      // レベル制限
  | 'rank_locked'       // 階級制限
  | 'complex'           // 複合制限
  | 'active'            // 受講中
  | 'perfect'           // Perfect達成（無期限アクセス権）
  | 'completed_archive' // 完了（1週間限定アーカイブ）
  | 'repurchasable';    // 再購入必要

export interface CourseResponse {
  id: string;
  title: string;
  description: string;
  status: CourseStatus;
  gemCost?: number;
  levelRequired?: number;
  rankRequired?: string;
  timeLimit?: number;  // 日数単位
  timeInfo?: CourseTimeInfo;  // 時間関連の詳細情報
  gradient?: string;
  archiveUntil?: string;
  completion?: {
    badges?: {
      completion?: boolean;
      excellence?: boolean;
    };
  };
  lastAccessedChapterId?: string;
}

export interface PurchaseResult {
  success?: boolean;
  error?: string;
  userCourse?: any;
}

export type UserRank = 
  | 'お試し'
  | '初伝'
  | '中伝'
  | '奥伝'
  | '皆伝'
  | '管理者'
  | '退会者';

export const USER_RANKS: Record<UserRank, number> = {
  'お試し': 0,
  '初伝': 1,
  '中伝': 2,
  '奥伝': 3,
  '皆伝': 4,
  '管理者': 5,
  '退会者': -1
};

export interface ChapterProgressStatus {
  completed: boolean;
  score?: number;
  submittedAt?: Date;
  timeLimit?: number;  // 日数単位
  startedAt?: Date;
  timeOutAt?: Date;
}

export interface CourseProgress {
  courseId: string;
  progress: number;
  currentChapterId?: string;
  startedAt?: Date;
  completedAt?: Date;
  timeLimit?: number;  // 日数単位
  remainingDays?: number;
}

// 時間計算用のユーティリティ型
export interface TimeCalculation {
  days: number;
  hours: number;
  minutes: number;
  totalDays: number;
  timeOutAt: string;
}