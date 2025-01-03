// userCourseTypes.ts
import { Course } from '@prisma/client';
// CourseStatusのインポートを追加
import { CourseStatus } from '../courseTypes';

export const USER_RANKS = {
  退会者: -1,    // 変更
  お試し: 0,     // 変更
  初伝: 1,       // 変更
  中伝: 2,       // 変更
  奥伝: 3,       // 変更
  皆伝: 4,       // 変更
  管理者: 5,     // 変更
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