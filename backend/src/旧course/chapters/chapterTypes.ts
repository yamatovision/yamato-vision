// backend/src/courses/chapters/chapterTypes.ts
import { 
  PrismaClient, 
  Chapter as PrismaChapter, 
  Task as PrismaTask,
  UserChapterProgress 
} from '@prisma/client';

// Prismaの基本型との統合
export type ChapterWithTask = PrismaChapter & {
  task: PrismaTask | null;
  userProgress?: UserChapterProgress[];
};

// メディアコンテンツの定義
export interface ChapterContent {
  type: 'video' | 'audio';
  videoId: string;  // urlの代わりにvideoIdに変更
  transcription?: string;
}

// 時間設定の専用インターフェース
export interface ChapterTimeSettings {
  timeLimit?: number;  // 日数単位
  releaseTime?: number;  // コース開始からの経過日数
}

// チャプター作成用DTO
export interface CreateChapterDTO {
  title: string;
  subtitle?: string;
  content?: ChapterContent;
  taskContent?: {
    description: string;
  };
  timeLimit?: number;  // 日数単位
  releaseTime?: number;  // コース開始からの経過日数（日単位）
  orderIndex?: number;
  task?: {
    description?: string;
    systemMessage?: string;
    referenceText?: string;
    maxPoints?: number;
  };
}

// チャプター更新用DTO
// chapterTypes.ts
export interface UpdateChapterDTO {
  title?: string;
  subtitle?: string;
  content?: {
    type: 'video' | 'audio';
    videoId: string;
    transcription?: string;
  };
  taskContent?: {
    description: string;
  };
  timeLimit?: number;
  releaseTime?: number;
  isVisible?: boolean;
  isFinalExam?: boolean;
  isPerfectOnly?: boolean;
  task?: {
    description?: string;
    systemMessage?: string;
    referenceText?: string;
    maxPoints?: number;
  };
}
// チャプター順序設定
export interface ChapterOrderItem {
  id: string;
  orderIndex: number;
}

// アクセス状態の定義
export interface ChapterAccessStatus {
  canAccess: boolean;
  message?: string;
  timePenalty?: boolean;
  mode?: 'normal' | 'perfect' | 'archive';
  timeInfo?: {
    remainingDays?: number;  // 残り日数
    releaseDate?: Date;      // 解放予定日
    timeOutDate?: Date;      // タイムアウト予定日
  };
}

// 進捗状態の定義
export interface ChapterProgress {
  isCompleted: boolean;
  hasSubmission: boolean;
  score?: number;
  submittedAt?: Date;
  lessonWatchRate: number;  // 追加
  timeStatus?: {
    startedAt: Date;
    timeLimit: number;  // 日数単位
    remainingDays: number;
    isTimedOut: boolean;
    timeOutAt?: Date;
  };
}

// 時間計算用のユーティリティ型
export interface TimeCalculation {
  days: number;
  hours: number;
  minutes: number;
  totalDays: number;
  timeOutAt: string;
}

// タイムアウト状態の定義
export interface ChapterTimeoutStatus {
  isTimedOut: boolean;
  startedAt?: Date;
  timeOutAt?: Date;
  remainingDays?: number;warningLevel?: 'none' | 'warning' | 'danger';
}



export type ChapterProgressStatus = 
  | 'NOT_STARTED'
  | 'LESSON_IN_PROGRESS'
  | 'LESSON_COMPLETED'
  | 'TASK_IN_PROGRESS'
  | 'COMPLETED'

export type ChapterEvaluationStatus = 
  | 'PERFECT'    // 95点以上
  | 'GREAT'      // 85点以上
  | 'GOOD'       // 70点以上
  | 'PASS'       // 提出のみ
  | 'FAILED'     // タイムアウト

export interface SubmissionVisibilityState {
  canViewContent: boolean;
  canViewPoints: boolean;
  canViewAiFeedback: boolean;
}

export interface ChapterProgressWithVisibility extends ChapterProgress {
  visibility: SubmissionVisibilityState;
}