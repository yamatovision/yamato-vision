// userCourseTypes.ts
import { CourseStatus, ChapterProgressStatus } from '../courseTypes';
import { Course } from '@prisma/client';

export interface CourseWithStatus extends Course {
  status: CourseStatus;
}

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





export interface ChapterAccess {
  chapterId: string;
  canAccess: boolean;
  isCompleted: boolean;
  nextChapterId?: string;
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

export type ChapterStatus = 
  | 'ready'             // 受講可能だが未開始
  | 'in_progress'       // 受講中
  | 'lesson_completed'  // レッスン完了
  | 'completed'         // チャプター完了
  | 'failed';           // 失敗（タイムアウトなど）

export const ChapterStatus = {
  READY: 'ready' as ChapterStatus,
  IN_PROGRESS: 'in_progress' as ChapterStatus,
  LESSON_COMPLETED: 'lesson_completed' as ChapterStatus,
  COMPLETED: 'completed' as ChapterStatus,
  FAILED: 'failed' as ChapterStatus,
} as const;

export interface PeerSubmissionResponse {
  id: string;
  content: string;
  points: number;
  feedback: string;
  submittedAt: Date;
  user: {
    id: string;
    name: string | null; // nullを許容するように変更
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