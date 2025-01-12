import { 
  ChapterProgressStatus, 
  ChapterEvaluationStatus 
} from './status';

// 試験セクションの評価結果
export interface ExamSectionResult {
  sectionId: string;
  sectionNumber: number;
  score: number;
  feedback: string;
  nextStep: string;
  submittedAt: string;
}

// 試験モード用の拡張データ
export interface ExamChapterData extends ChapterPreviewData {
  isFinalExam: true;
  sections: {
    id: string;
    title: string;
    task: ChapterTask;
  }[];
  timeLimit: number;  // 分単位
  sectionResults?: ExamSectionResult[];
  currentSection?: number;
  startedAt?: Date;
}

// フロントエンド用の基本型定義（既存）
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

// プレビュー表示用の型定義（isFinalExam追加）
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
  isFinalExam: boolean;  // 追加
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
    isFinalExam?: boolean;  // 追加
  };
}