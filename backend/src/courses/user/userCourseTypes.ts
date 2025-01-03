// userCourseTypes.ts
import { Course } from '@prisma/client';
// CourseStatusのインポートを追加
import { CourseStatus } from '../courseTypes';

export const USER_RANKS = {
  退会者: 0,
  お試し: 1,
  初伝: 2,
  中伝: 3,
  奥伝: 4,
  皆伝: 5,
  管理者: 6,
} as const;

export type UserRank = keyof typeof USER_RANKS;

// 古いCourseStatus定義を削除

export interface CourseWithStatus extends Course {
  status: CourseStatus;  // 新しいCourseStatusを使用
}

export type ChapterProgressStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';

export interface PurchaseResult {
  error?: string;
  success?: boolean;
  userCourse?: any;
}