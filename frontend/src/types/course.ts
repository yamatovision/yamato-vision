// 基本的なチャプターの内容定義
export interface ChapterContent {
  type: 'video' | 'audio';
  videoId?: string;
  url?: string;  // 追加
  id?: string;   // 追加
  transcription?: string;
}
// タスクの定義
export interface Task {
  id?: string;
  description: string;
  materials: string;        // required に変更
  task: string;            // required に変更
  evaluationCriteria: string;  // required に変更
  maxPoints: number;
  systemMessage: string;
  referenceText: string;
}

// チャプターの定義
export interface Chapter {
  id: string;
  courseId: string;
  title: string;
  subtitle: string;
  orderIndex: number;
  timeLimit: number;
  isVisible: boolean;
  content?: {
    type: 'video' | 'audio';
    videoId?: string;
    url?: string;
    transcription?: string;
    id?: string;
  };
  task?: {
    description: string;
    systemMessage: string;
    referenceText: string;
    maxPoints: number;
  };
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
  requirementType?: 'AND' | 'OR';
  stage?: string;
  level?: number;
  progress?: number;
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
}

export interface ChapterProgressInfo {
  status: 'not_started' | 'in_progress' | 'completed' | 'timeout';
  startedAt?: Date;
  completedAt?: Date;
}


// チャプター作成用DTO
export interface CreateChapterDTO {
  title: string;
  subtitle?: string;
  content?: string;
  orderIndex: number;
  timeLimit: number;
  isVisible: boolean;
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
  experienceWeight?: number;
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
  content?: ChapterContent;  // 追加
  subtitle?: string;         // 追加
  timeLimit?: number;        // 追加
  isVisible?: boolean;       // 追加
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
}

// メインのコース型（BaseCourseとShopCourseの統合）
export type Course = ShopCourse;

