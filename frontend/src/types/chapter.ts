

import { ChapterProgressStatus, ChapterEvaluationStatus, ProgressInfo } from './status';
export type {
  ChapterProgressStatus,
  ChapterEvaluationStatus
};
// コンテンツ関連の型定義
export interface VideoContent {
  type: 'video';
  videoId: string;
  transcription?: string;
}

export interface TaskContent {
  description: string;  // リッチテキスト形式の課題説明
}

export interface AudioContent {
  type: 'audio';
  videoId: string;
  thumbnailUrl?: string;
  transcription?: string;
}
export interface ChapterWithUserProgress {
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
  content: ChapterContent;
  taskContent?: TaskContent;
  task?: ChapterTask;
  status: ChapterProgressStatus;
  progress: {
    startedAt: string | null;
    completedAt: string | null;
    lessonWatchRate: number;
    score?: number;
  };
}

export interface ExamTaskSection {
  materials: string;
  task: string;
  evaluationCriteria: string;
}

export interface ExamSection {
  number: 1 | 2 | 3;
  title: string;
  task: ExamTaskSection;
}

export interface ExamContent {
  type: 'exam';
  thumbnailUrl?: string;
  sections?: ExamSection[];
}

export interface ExamSettings {
  sections: ExamSection[];
  thumbnailUrl?: string;
  maxPoints: number;
  timeLimit: number;
  type: 'exam';
}

// 統合されたChapterContent型
export interface ChapterContent {
  type: 'video' | 'audio' | 'exam';
  videoId?: string;
  transcription?: string;
  thumbnailUrl?: string;
  sections?: ExamSection[];
  lessonWatchRate?: number;  // 追加
  submission?: {  // 追加
    score?: number;
    status?: string;
  };
  progress?: {  // 追加
    startedAt: string | null;
    completedAt: string | null;
  };
}

export interface UserChapterDetails extends Chapter {
  progress?: {
    status: ChapterProgressStatus;
    startedAt: string | null;
    completedAt: string | null;
    lessonWatchRate: number;
    score?: number;
  };
  taskContent?: TaskContent;
  task?: ChapterTask;
}

// 管理画面用の拡張型
export interface AdminChapterDetails extends Chapter {
  taskContent?: TaskContent;
  task?: ChapterTask;
  referenceFiles?: ReferenceFile[];
}




// 型ガード関数
export const isVideoContent = (content: ChapterContent): content is VideoContent => {
  return content.type === 'video';
}

export const isAudioContent = (content: ChapterContent): content is AudioContent => {
  return content.type === 'audio';
}

export const isExamContent = (content: ChapterContent): content is ExamContent => {
  return content.type === 'exam';
}

// タスク関連の型定義
export interface ChapterTask {
  title: string;
  materials?: string;
  task?: string;
  evaluationCriteria?: string;
  maxPoints: number;
}

// 試験セクションの評価結果
export interface ExamSectionResult {
  sectionId: string;
  sectionNumber: number;
  score: number;
  feedback: string;
  nextStep: string;
  submittedAt: string;
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
  releaseTime?: number;  // 同様にnumber型に
  thumbnailUrl?: string;
  lessonWatchRate: number;
  isLocked: boolean;
  canAccess: boolean;
  nextUnlockTime?: number;  // 同様にnumber型に
  isFinalExam: boolean;
  content?: ChapterContent;  // ChapterContent型を使用
  examSettings?: ExamSettings;  // ExamSettings型を使用
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

// 学習継続用の現在のチャプター情報の型定義
export interface CurrentChapterData {
  id: string;
  userId: string;
  courseId: string;
  chapterId: string;
  status: ChapterProgressStatus;
  startedAt: Date | null;
  completedAt: Date | null;
  score?: number;
  lessonWatchRate: number;
  isTimedOut: boolean;
  timeOutAt: Date | null;
  chapter: {
    id: string;
    title: string;
    subtitle?: string;
    content: ChapterContent;
    orderIndex: number;
    timeLimit?: number;
    task?: ChapterTask;
    isFinalExam?: boolean;
  };
}

export interface ReferenceFile {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  uploadedAt: string;
}


export interface ExamSettings {
  sections: ExamSection[];
  thumbnailUrl?: string;
  maxPoints: number;  // 追加
  timeLimit: number;  // 追加
}

export interface UserChapterDetails extends Omit<Chapter, 'progress'> {
  content: ChapterContent;
  taskContent?: TaskContent;
  task?: ChapterTask;
  progress?: {
    status: ChapterProgressStatus;
    startedAt: string | null;
    completedAt: string | null;
    lessonWatchRate: number;
    score?: number;
  };
  navigation?: {
    previous?: {
      id: string;
      title: string;
      isCompleted: boolean;
    };
    next?: {
      id: string;
      title: string;
      isLocked: boolean;
    };
  };
  accessInfo?: {
    canAccess: boolean;
    message?: string;
  };
}


// 11. チャプター関連の型
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
  content: ChapterContent;
  status: ChapterProgressStatus;  // 必須に変更
  evaluationStatus?: ChapterEvaluationStatus;
  score?: number;
  timeOutAt?: string;
  thumbnailUrl?: string;
  lessonWatchRate: number;
  isLocked: boolean;
  canAccess: boolean;
  nextUnlockTime?: number;
  examSettings?: ExamSettings;
  submission?: {
    score?: number;
    status?: string;
  };
  progress?: {
    startedAt: string | null;
    completedAt: string | null;
  };
}

export interface ExtendedChapter extends Chapter {
  taskContent?: TaskContent;
  referenceFiles?: ReferenceFile[];
  task?: ChapterTask;
}
// 12. 進捗関連の型
export interface UserChapterProgress {
  id: string;
  userId: string;
  chapterId: string;
  courseId: string;
  status: ChapterProgressStatus;
  startedAt: Date | null;
  completedAt: Date | null;
  score?: number;
  lessonWatchRate: number;
  isTimedOut: boolean;
  timeOutAt: Date | null;
  bestTaskContent?: string;
  bestFeedback?: string;
  bestNextStep?: string;
  bestEvaluatedAt?: Date;
  isCurren?: boolean | null;  // 追加
}
export interface ChapterProgressInfo {
  status: 'not_started' | 'in_progress' | 'completed' | 'timeout';
  startedAt?: Date;
  completedAt?: Date;
}
