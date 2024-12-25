// src/types/progress.ts
export interface CourseProgress {
  id: string;
  userId: string;
  courseId: string;
  startedAt: Date;
  lastAccessedAt: Date;
  completedAt?: Date;
  timeSpent: number;        // 分単位
  currentChapterId?: string;
  totalProgress: number;    // パーセンテージ
  status: 'ongoing' | 'completed' | 'expired';
  chapters: ChapterProgress[];
}

export interface ChapterProgress {
  id: string;
  chapterId: string;
  startedAt: Date;
  completedAt?: Date;
  timeSpent: number;        // 分単位
  materialsProgress: MaterialProgress[];
  taskProgress?: TaskProgress;
  status: 'locked' | 'available' | 'in_progress' | 'completed';
}

export interface MaterialProgress {
  id: string;
  materialId: string;
  completed: boolean;
  lastAccessedAt: Date;
  timeSpent: number;        // 分単位
}

export interface TaskProgress {
  id: string;
  taskId: string;
  status: 'not_started' | 'in_progress' | 'submitted' | 'evaluated';
  submittedAt?: Date;
  evaluatedAt?: Date;
  score?: number;
  timeSpent: number;        // 分単位
  submissions: TaskSubmission[];
}

export interface TaskSubmission {
  id: string;
  taskProgressId: string;
  content: string;
  submittedAt: Date;
  evaluatedAt?: Date;
  score?: number;
  feedback?: string;
}
