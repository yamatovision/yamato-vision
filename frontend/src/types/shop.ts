import { Course } from './course';

export type CourseStatus = 
  | 'unlocked'
  | 'available'
  | 'level_locked'
  | 'rank_locked'
  | 'complex'
  | 'perfect'
  | 'completed'
  | 'failed';

export interface ShopCourse extends Course {
  status: CourseStatus;
}

export interface CourseCardProps {
  title: string;
  description: string;
  status: CourseStatus;
  gemCost?: number;
  levelRequired?: number;
  rankRequired?: string;
  gradient: string;
  onUnlock: () => void;
  completion?: {
    badges?: {
      completion?: boolean;
      excellence?: boolean;
    };
  };
}
