import { Prisma, Course } from '@prisma/client';
import { CourseStatus } from './status';

// Prismaの型定義
export type CourseWithChapters = Prisma.CourseGetPayload<{
  include: {
    chapters: {
      include: {
        task: true;
      }
    }
  }
}>;




// User Course Types
export interface CourseWithStatus extends Course {
  status: CourseStatus;
}




// DTOs
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

export interface UpdateCourseDTO extends Partial<CreateCourseDTO> {
  isPublished?: boolean;
  isArchived?: boolean;
}

// Response Types
export interface CourseResponse {
  id: string;
  title: string;
  description: string;
  status: CourseStatus;
  gemCost?: number;
  levelRequired?: number;
  rankRequired?: string;
  timeLimit?: number;
  timeInfo?: CourseTimeInfo;
  certificationEligibility: boolean;
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

// Time Management
export interface CourseTimeInfo {
  timeLimit: number;
  startedAt?: Date;
  timeOutAt?: Date;
  remainingDays?: number;
}

export interface TimeSettings {
  timeLimit?: number;
  releaseTime?: number;
}

// Purchase
export interface PurchaseResult {
  success?: boolean;
  error?: string;
  userCourse?: any;
}

export interface CourseWithStatus extends Course {
    status: CourseStatus;
  }
  
  export interface CourseProgressManagement {
    currentChapterId: string;
    completedChapterIds: string[];
    completedCount: number;
    status: CourseStatus;
    timeoutStatus: {
      isTimedOut: boolean;
      timeOutAt?: Date;
    };
  }
  
  // Peer Submission Types
  export interface PeerSubmissionResponse {
    id: string;
    content: string;
    points: number;
    feedback: string;
    submittedAt: Date;
    user: {
      id: string;
      name: string | null;
      avatarUrl: string | null;
      rank: string;
    };
  }
  
  export interface GetPeerSubmissionsResponse {
    submissions: PeerSubmissionResponse[];
    total: number;
    page: number;
    perPage: number;
  }