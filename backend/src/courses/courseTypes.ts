import { Prisma } from '@prisma/client';

export type CourseWithChapters = Prisma.CourseGetPayload<{
  include: {
    chapters: {
      include: {
        task: true;
      }
    }
  }
}>;

export interface CreateCourseDTO {
  title: string;
  description: string;
  thumbnail?: string;       // 追加
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
  content: any;
  timeLimit?: number;
  initialWait?: number;
  waitTime?: number;
  orderIndex: number;
}

export interface UpdateCourseDTO extends Partial<CreateCourseDTO> {
  isPublished?: boolean;
  isArchived?: boolean;
}
