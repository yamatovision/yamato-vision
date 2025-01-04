// backend/src/courses/progress/progressTypes.ts
import { MediaProgress } from '../media/mediaTypes';

export type ChapterStatus =
  | 'locked'
  | 'ready'
  | 'in_progress'
  | 'lesson_completed'
  | 'chapter_completed';

export const WATCH_RATE_THRESHOLDS = {
  FRAUD_DETECTION: 40,
  COMPLETION: 95
} as const;

export interface ChapterProgressDetails {
  status: ChapterStatus;
  lessonWatchRate: number;
  startedAt?: Date;  // nullではなくundefinedを使用
  completedAt?: Date;  // nullではなくundefinedを使用
  timeoutAt?: Date;  // nullではなくundefinedを使用
  isTimedOut: boolean;
  certification: {
    eligible: boolean;
    watchRateSufficient: boolean;
    hasValidSubmission: boolean;
  };
}

export interface ProgressTrackingResult {
  mediaProgress?: MediaProgress;
  previousStatus: ChapterStatus;
  newStatus: ChapterStatus;
  progress: ChapterProgressDetails;
  experienceGained?: number;
  isCompleted: boolean;
  nextChapterId?: string;
}