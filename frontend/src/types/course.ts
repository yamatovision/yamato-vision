export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail?: string;
  gemCost: number;
  levelRequired?: number;
  rankRequired?: string;
  timeLimit?: number;
  passingScore: number;
  excellentScore: number;
  isPublished: boolean;
  isArchived: boolean;
  publishedAt?: Date;
  archivedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  chapters?: Chapter[];
  stage?: string;
  level?: string;
  progress?: number;
  lastAccessedChapterId?: string;
}

export interface ChapterContent {
  type: 'video' | 'audio';
  url: string;
  transcription?: string;
}

export interface Task {
  id?: string;  // Optional for creation
  description: string;
  systemMessage: string;
  referenceText: string;
  maxPoints: number;
  type: string;
}

export interface Chapter {
  id: string;
  courseId: string;
  title: string;
  subtitle?: string;
  content: ChapterContent;
  orderIndex: number;
  timeLimit?: number;
  waitTime?: number;
  releaseTime?: number;  // initialWaitをreleaseTimeに変更
  isVisible: boolean;
  isFinalExam: boolean;
  task: Task;
  createdAt: Date;
  updatedAt: Date;
}

export interface AttachmentFile {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
}

export interface CreateCourseDTO {
  title: string;
  description: string;
  thumbnail?: string;
  gemCost: number;
  levelRequired?: number;
  rankRequired?: string;
  timeLimit?: number;
  passingScore: number;
  excellentScore: number;
}

export interface UpdateCourseDTO {
  title?: string;
  description?: string;
  thumbnail?: string;
  gemCost?: number;
  levelRequired?: number;
  rankRequired?: string;
  timeLimit?: number;
  passingScore?: number;
  excellentScore?: number;
  isPublished?: boolean;
  isArchived?: boolean;
}
export interface CourseResponse {
  id: string;
  title: string;
  description: string;
  gemCost: number | null;
  levelRequired: number | null;
  rankRequired: string | null;
  thumbnail: string | null;
  status: 'unlocked' | 'available' | 'level_locked' | 'rank_locked' | 'complex';
  chapters: {
    id: string;
    title: string;
    orderIndex: number;
  }[];
}

export interface PurchaseResponse {
  success: boolean;
  error?: string;
  userCourse?: {
    id: string;
    courseId: string;
    progress: number;
    startedAt: Date;
  };
}

export interface CreateChapterDTO {
  title: string;
  subtitle?: string;
  content: ChapterContent;
  orderIndex: number;
  timeLimit?: number;
  waitTime?: number;
  releaseTime?: number;  // initialWaitをreleaseTimeに変更
  isVisible?: boolean;
  isFinalExam?: boolean;
  task: Omit<Task, 'id'>;
}

export interface UpdateChapterDTO {
  title?: string;
  subtitle?: string;
  content?: ChapterContent;
  orderIndex?: number;
  timeLimit?: number;
  waitTime?: number;
  releaseTime?: number;  // initialWaitをreleaseTimeに変更
  isVisible?: boolean;
  isFinalExam?: boolean;
  task?: Omit<Task, 'id'>;
}

export interface CourseResponse {
  data: Course[];
}

export interface SingleCourseResponse {
  data: Course;
}

export interface ChapterResponse {
  data: Chapter;
}
export interface CourseChapter {
  id: string;
  orderIndex: number;
  title: string;
}

export interface CurrentUserCourse {
  id: string;
  courseId: string;
  chapters: CourseChapter[];
  progress: number;
  startedAt: Date;
}

export type CourseStatus = 
  | 'unlocked'          // 購入済み（未開始）
  | 'available'         // 購入可能
  | 'level_locked'      // レベル制限
  | 'rank_locked'       // 階級制限
  | 'complex'           // 複合制限
  | 'active'           // 受講中
  | 'perfect'          // Perfect達成（無期限アクセス権）
  | 'completed_archive' // 完了（1週間限定アーカイブ）
  | 'repurchasable';    // 再購入必要

  export interface Course {
    id: string;
    title: string;
    description: string;
    status: CourseStatus;
    gemCost?: number;
    levelRequired?: number;
    rankRequired?: string;
    gradient?: string;
    archiveUntil?: string;  // 追加：アーカイブ期限
    completion?: {
      badges?: {
        completion?: boolean;
        excellence?: boolean;
      };
    };
  }

export interface CourseData {
  id: string;
  userId: string;
  courseId: string;
  isActive: boolean;
  status: CourseStatus;
  startedAt: string;
  completedAt: null | string;
  progress: number;
  course: {
    id: string;
    title: string;
    description: string;
    level: number;
    gemCost: number;
    rankRequired: string;
    levelRequired: number;
    timeLimit: number;
    chapters: Array<{
      id: string;
      courseId: string;
      title: string;
      subtitle: string;
      orderIndex: number;
      timeLimit: number;
      isVisible: boolean;
    }>;
  };
}
export interface TaskDescriptionProps {
  description: string;
  systemMessage: string;
  referenceText: string;
  maxPoints: number;
  type: string;
}