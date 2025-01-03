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
  levelRequired?: number;
  rankRequired?: string;
  requirementType?: 'AND' | 'OR';
  timeLimit?: number;
  canEarnHigherStatus?: boolean;
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
  | 'restricted'     // すべて小文字
  | 'available'
  | 'active'
  | 'completed'
  | 'certified'
  | 'perfect'
  | 'failed';

// 定数として使用できるように追加
export const CourseStatus = {
  RESTRICTED: 'restricted' as CourseStatus,
  AVAILABLE: 'available' as CourseStatus,
  ACTIVE: 'active' as CourseStatus,
  COMPLETED: 'completed' as CourseStatus,
  CERTIFIED: 'certified' as CourseStatus,
  PERFECT: 'perfect' as CourseStatus,
  FAILED: 'failed' as CourseStatus,
} as const;

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
  certificationEligibility: boolean;  // 追加
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
  timeLimit?: number;
  startedAt?: Date;
  timeOutAt?: Date;
  lessonWatchRate?: number;
}
export interface CourseProgress {
  courseId: string;
  progress: number;
  currentChapterId?: string;
  startedAt?: Date;
  completedAt?: Date;
  timeLimit?: number;
  remainingDays?: number;
  lessonWatchRate?: number;
}



// 時間計算用のユーティリティ型
export interface TimeCalculation {
  days: number;
  hours: number;
  minutes: number;
  totalDays: number;
  timeOutAt: string;
}