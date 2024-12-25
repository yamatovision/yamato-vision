// backend/src/courses/chapters/chapterTypes.ts
import { PrismaClient, Chapter as PrismaChapter, Task as PrismaTask } from '@prisma/client';

export type ChapterWithTask = PrismaChapter & {
  task: PrismaTask | null;
};

export interface ChapterContent {
  type: 'video' | 'audio';
  url: string;
  transcription?: string;
}

export interface CreateChapterDTO {
  title: string;
  subtitle?: string;
  content: ChapterContent;
  timeLimit?: number;
  releaseTime?: number;
  orderIndex: number;
  task: {
    description: string;
    systemMessage: string;
    referenceText?: string;
    maxPoints: number;
  };
}

export interface UpdateChapterDTO extends Partial<CreateChapterDTO> {
  isVisible?: boolean;
  isFinalExam?: boolean;
}

export interface ChapterOrderItem {
  id: string;
  orderIndex: number;
}

export interface ChapterAccessStatus {
  canAccess: boolean;
  message?: string;
  timePenalty?: boolean;
}

export interface ChapterProgress {
  isCompleted: boolean;
  hasSubmission: boolean;
  score?: number;
  submittedAt?: Date;
}
