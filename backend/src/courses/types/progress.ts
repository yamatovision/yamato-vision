import { ChapterStatus } from './status';

// Progress Types
export interface ChapterProgressStatus {
  completed: boolean;
  score?: number;
  submittedAt?: Date;
  timeLimit?: number;
  startedAt?: Date;
  timeOutAt?: Date;
  lessonWatchRate?: number;
}

export interface ChapterProgressWithStatus extends ChapterProgressStatus {
  currentStatus: ChapterStatus;
}

export interface CourseProgress {
  courseId: string;
  progress: number;
  currentChapterId?: string;
  startedAt?: Date;
  completedAt?: Date;
  timeLimit?: number;
  remainingDays?: number;
  lessonWatchRate?: number;
}

// Time Calculation
export interface TimeCalculation {
  days: number;
  hours: number;
  minutes: number;
  totalDays: number;
  timeOutAt: string;
}

export interface ChapterProgress {
    isCompleted: boolean;
    hasSubmission: boolean;
    score?: number;
    submittedAt?: Date;
    lessonWatchRate: number;
    timeStatus?: {
      startedAt: Date;
      timeLimit: number;
      remainingDays: number;
      isTimedOut: boolean;
      timeOutAt?: Date;
    };
  }
  
  export interface ChapterProgressWithVisibility extends ChapterProgress {
    visibility: SubmissionVisibilityState;
  }
  
  export interface SubmissionVisibilityState {
    canViewContent: boolean;
    canViewPoints: boolean;
    canViewAiFeedback: boolean;
  }
  
  export interface ChapterTimeoutStatus {
    isTimedOut: boolean;
    startedAt?: Date;
    timeOutAt?: Date;
    remainingDays?: number;
    warningLevel?: 'none' | 'warning' | 'danger';
  }
  
  // Access Status
  export interface ChapterAccessStatus {
    canAccess: boolean;
    message?: string;
    timePenalty?: boolean;
    mode?: 'normal' | 'perfect' | 'archive';
    timeInfo?: {
      remainingDays?: number;
      releaseDate?: Date;
      timeOutDate?: Date;
    };
  }