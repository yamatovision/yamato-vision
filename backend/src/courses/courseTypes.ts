import { Course as PrismaCourse, Chapter } from '@prisma/client';

export interface CourseWithChapters extends PrismaCourse {
  chapters: Chapter[];
}

export interface CreateCourseDTO {
  title: string;
  description: string;
  thumbnail?: string;
  gemCost: number;
  levelRequired?: number;
  rankRequired?: string;
  timeLimit?: number;
  passingScore?: number;
  excellentScore?: number;
}

export interface CreateChapterDTO {
  title: string;
  subtitle?: string;
  content: {
    type: 'video' | 'audio';
    url: string;
    transcription?: string;
  };
  timeLimit?: number;
  initialWait?: number;
  waitTime?: number;
  orderIndex: number;
  task: {
    description: string;
    systemMessage: string;
    referenceText: string;
    maxPoints: number;
  };
}

export interface UpdateCourseDTO extends Partial<CreateCourseDTO> {
  isPublished?: boolean;
  isArchived?: boolean;
}

export interface CourseStatusResponse {
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  progress?: number;
  timeRemaining?: number;
  currentChapter?: {
    id: string;
    title: string;
    orderIndex: number;
  };
}

export interface SubmissionResult {
  points: number;
  feedback: string;
  experienceGained: number;
}

export interface CourseCompletionStatus {
  isCompleted: boolean;
  isPerfect: boolean;
  totalScore: number;
  experienceGained: number;
  earnedBadges: string[];
}
