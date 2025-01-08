import { 
  ChapterProgressStatus, 
  ChapterEvaluationStatus 
} from './status';

export interface CurrentChapterData {
  chapterId: string;  // 現在のチャプターID
}

// フロントエンド用の基本型定義
export interface ChapterContent {
  type: 'video' | 'audio';
  videoId: string;
  transcription?: string;
}

export interface ChapterTask {
  title: string;
  materials?: string;
  task?: string;
  evaluationCriteria?: string;
  maxPoints: number;
}

// プレビュー表示用の型定義
export interface ChapterPreviewData {
  id: string;
  title: string;
  subtitle?: string;
  orderIndex: number;
  status: ChapterProgressStatus;
  evaluationStatus?: ChapterEvaluationStatus;
  score?: number;
  timeOutAt?: Date | null;
  releaseTime?: Date | null;
  thumbnailUrl?: string;
  lessonWatchRate: number;
  isLocked: boolean;
  canAccess: boolean;
  nextUnlockTime?: Date;
}

// 学習継続用の現在のチャプター情報の型定義
export interface CurrentChapterData {
  chapterId: string;
  courseId: string;
  nextUrl: string;
  chapter: {
    id: string;
    title: string;
    subtitle?: string;
    content: ChapterContent;
    orderIndex: number;
    timeLimit?: number;
    task?: ChapterTask;
  };
}