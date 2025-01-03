// 基本的なチャプターの内容定義
export interface ChapterContent {
  type: 'video' | 'audio';
  videoId?: string;  // URLの代わりにvideoIdを保存
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
  | 'restricted'   // 条件未達成
  | 'available'    // 受講可能
  | 'active'       // 受講中
  | 'completed'    // 通常クリア
  | 'certified'    // 認証バッジ獲得
  | 'perfect'      // パーフェクト達成
  | 'failed';      // 失敗



// 基本的なコース情報
export interface BaseCourse {
  id: string;
  title: string;
  description: string;
  thumbnail?: string;
  levelRequired?: number;
  rankRequired?: string;
  timeLimit?: number;
  isPublished: boolean;
  isArchived: boolean;
  publishedAt?: Date;
  archivedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  chapters?: Chapter[];
  lastAccessedChapterId?: string;
}

// ショップ表示用のコース情報
export interface ShopCourse extends Omit<BaseCourse, 'gemCost'> {
  status: CourseStatus;
  gradient?: string;
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
  levelRequired?: number;
  rankRequired?: string;
  timeLimit?: number;
  // 削除: gemCost, passingScore, excellentScore
}
// コース更新用DTO
export interface UpdateCourseDTO {
  title?: string;
  description?: string;
  thumbnail?: string;
  levelRequired?: number;
  rankRequired?: string;
  timeLimit?: number;
  isPublished?: boolean;
  isArchived?: boolean;
  // 削除: gemCost, passingScore, excellentScore
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

