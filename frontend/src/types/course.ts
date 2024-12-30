// 基本的なチャプターの内容定義
export interface ChapterContent {
  type: 'video' | 'audio';
  url: string;
  transcription?: string;
}

// タスクの定義
export interface Task {
  id?: string;
  description: string;
  systemMessage: string;
  referenceText: string;
  maxPoints: number;
  type: string;
}

// チャプターの定義
export interface Chapter {
  id: string;
  courseId: string;
  title: string;
  subtitle?: string;
  content: ChapterContent;
  orderIndex: number;
  timeLimit?: number;
  waitTime?: number;
  releaseTime?: number;
  isVisible: boolean;
  isFinalExam: boolean;
  isPerfectOnly: boolean; // 必須フィールドとして追加
  task: Task;
  createdAt: Date;
  updatedAt: Date;
}

// 添付ファイルの定義
export interface AttachmentFile {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
}

// コースのステータス定義
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



// 基本的なコース情報
export interface BaseCourse {
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

// ショップ表示用のコース情報
export interface ShopCourse extends Omit<BaseCourse, 'gemCost'> {
  status: CourseStatus;
  gemCost?: number;
  gradient?: string;
  archiveUntil?: string;
  completion?: {
    badges?: {
      completion?: boolean;
      excellence?: boolean;
    };
  };
}

// コース作成用DTO
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

// コース更新用DTO
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

// チャプター作成用DTO
export interface CreateChapterDTO {
  title: string;
  subtitle?: string;
  content: ChapterContent;
  orderIndex: number;
  timeLimit?: number;
  waitTime?: number;
  releaseTime?: number;
  isVisible?: boolean;
  isFinalExam?: boolean;
  task: Omit<Task, 'id'>;
}

// チャプター更新用DTO
export interface UpdateChapterDTO {
  title?: string;
  subtitle?: string;
  content?: ChapterContent;
  orderIndex?: number;
  timeLimit?: number;
  waitTime?: number;
  releaseTime?: number;
  isVisible?: boolean;
  isFinalExam?: boolean;
  isPerfectOnly?: boolean;
  task?: Omit<Task, 'id'>;
}

// API レスポンス用の型定義
export interface CourseResponse {
  data: Course[];
}

export interface SingleCourseResponse {
  data: Course;
}

export interface ChapterResponse {
  data: Chapter;
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

// ユーザーコース関連の型定義
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
export interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  totalDays: number;
  timeOutAt: string;
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
    timeRemaining?: TimeRemaining;
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

// コンポーネントProps型定義
export interface TaskDescriptionProps {
  description: string;
  systemMessage: string;
  referenceText: string;
  maxPoints: number;
  type: string;
}

// メインのコース型（BaseCourseとShopCourseの統合）
export type Course = ShopCourse;

