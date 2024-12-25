import { Course } from '@prisma/client';

export type CourseStatus = 
  | 'unlocked' 
  | 'available' 
  | 'level_locked' 
  | 'rank_locked' 
  | 'complex';

export interface CourseWithStatus extends Course {
  status: CourseStatus;
}

export interface PurchaseResult {
  error?: string;
  success?: boolean;
  userCourse?: any;
}
