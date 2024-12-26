// backend/src/courses/user/userCourseTypes.ts
import { Course } from '@prisma/client';

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

export type CourseStatus = 
| 'active'      // 追加
  | 'unlocked' 
  | 'available' 
  | 'level_locked' 
  | 'rank_locked' 
  | 'complex';

export interface CourseWithStatus extends Course {
  status: CourseStatus;
}
export type ChapterProgressStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';

export interface PurchaseResult {
  error?: string;
  success?: boolean;
  userCourse?: any;
}