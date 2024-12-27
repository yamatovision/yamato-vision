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
  timeLimit?: number;
  passingScore?: number;
  excellentScore?: number;
}

export interface CreateChapterDTO {
  title: string;
  subtitle?: string;
  content: any;
  timeLimit?: number;
  releaseTime?: number;
  orderIndex: number;
}

export interface UpdateCourseDTO extends Partial<CreateCourseDTO> {
  isPublished?: boolean;
  isArchived?: boolean;
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
}

export interface CourseProgress {
  courseId: string;
  progress: number;
  currentChapterId?: string;
  startedAt?: Date;
  completedAt?: Date;
}