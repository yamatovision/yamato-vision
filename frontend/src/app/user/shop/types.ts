export type CourseStatus = 'unlocked' | 'available' | 'level_locked' | 'rank_locked' | 'complex';

export interface Course {
  id: string;
  title: string;
  description: string;
  status: CourseStatus;
  gemCost?: number;
  levelRequired?: number;
  rankRequired?: string;
  gradient: string;
}

export type ProductType = 'COURSE' | 'GEM_PACKAGE' | 'SPECIAL_ITEM';

export interface Product {
  id: string;
  name: string;
  description: string;
  type: ProductType;
  price: number;
  gemAmount?: number;
  courseId?: string;
  rankRequired?: string;
  levelRequired?: number;
  isActive: boolean;
}