// 基本的なチャプターの内容定義
export interface ChapterContent {
  type: 'video' | 'audio';
  videoId?: string;
  url?: string;  // 追加
  id?: string;   // 追加
  transcription?: string;
  isFinalExam: boolean;     // 追加必要
  taskId?: string;          // 追加必要
  releaseTime?: number;     // 追加必要
  isPerfectOnly: boolean;   // 追加必要
  content: ChapterContent;  // optional (?)を削除
}
// タスクの定義
export interface Task {
  id?: string;
  materials?: string;
  task?: string;
  evaluationCriteria?: string;
  systemMessage: string;
  maxPoints?: number;
}

export interface ReferenceFile {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  uploadedAt: string;
}


// TaskContentの型定義を追加
export interface TaskContent {
  description: string;  // リッチテキスト形式の課題説明
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
  isPerfectOnly?: boolean;
  isFinalExam?: boolean;
  releaseTime?: number;
  content?: ChapterContent;  // この部分を修正
  taskContent?: TaskContent;
  referenceFiles?: ReferenceFile[];
  experienceWeight: number;
  task?: Task;
}

// ChapterContent型も修正
export interface ChapterContent {
  type: 'video' | 'audio';
  videoId?: string;
  url?: string;
  transcription?: string;
  id?: string;
}

// コースのステータス定義
export type CourseStatus = 
  | 'restricted'   // 条件未達成
  | 'available'    // 受講可能
  | 'active'       // 受講中
  | 'completed'    // 通常クリア
  | 'certified'    // 認証バッジ獲得
  | 'archived'      // パーフェクト達成
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
    content?: ChapterContent;
    taskContent?: TaskContent;  // 追加
    referenceFiles?: ReferenceFile[];  // 追加
    orderIndex: number;
    timeLimit: number;
    isVisible: boolean;
    experienceWeight?: number;
    releaseTime?: number;     // 追加必要
    isPerfectOnly?: boolean;  // 追加必要
    isFinalExam?: boolean;    // 追加必要
    task?: {
      title: string;
      materials?: string;
      task?: string;
      evaluationCriteria?: string;
      maxPoints: number;
    };
  }
// チャプター更新用DTO
export interface UpdateChapterDTO {
  title?: string;
  subtitle?: string;
  content?: ChapterContent;
  taskContent?: TaskContent;  // 追加
  referenceFiles?: ReferenceFile[];  // 追加
  orderIndex?: number;
  timeLimit?: number;
  waitTime?: number;
  releaseTime?: number;
  experienceWeight?: number;
  isVisible?: boolean;
  isFinalExam?: boolean;
  isPerfectOnly?: boolean;
  task?: {
    title: string;
    materials?: string;
    task?: string;
    evaluationCriteria?: string;
    maxPoints: number;
  };
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
      isPerfectOnly?: boolean;  // 追加必要
      isFinalExam?: boolean;    // 追加必要
      releaseTime?: number;     // 追加必要
      content: ChapterContent;
      lessonWatchRate: number;
      submission?: {
        score?: number;
        status?: string;
      };
    }>;
  };
}

// コンポーネントProps型定義
export interface TaskDescriptionProps {
  description: string;
  systemMessage: string;
  maxPoints: number;
}

// メインのコース型（BaseCourseとShopCourseの統合）
export type Course = ShopCourse;

