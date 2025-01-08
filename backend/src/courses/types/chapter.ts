import { 
  Chapter as PrismaChapter, 
  Task as PrismaTask,
  UserChapterProgress 
} from '@prisma/client';

// Prismaの基本型との統合
type PrismaJsonValue = string | number | boolean | null | { [key: string]: PrismaJsonValue } | PrismaJsonValue[];

export type ChapterWithTask = Omit<PrismaChapter, 'content'> & {
  content: PrismaJsonValue;
  task: (Omit<PrismaTask, 'evaluationCriteria'> & {
    evaluationCriteria: string | null;
  }) | null;
  userProgress?: UserChapterProgress[];
};
// JsonValue 型の定義も追加
type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };
  
interface Task extends PrismaTask {
  evaluationCriteria: string | null;  // この行を追加
}

// メディアコンテンツの定義
export interface ChapterContent {
  type: 'video' | 'audio';
  videoId: string;
  transcription?: string;
}

// DTOs
export interface CreateChapterDTO {
  title: string;
  subtitle?: string;
  content?: ChapterContent;
  taskContent?: {
    description: string;
  };
  timeLimit?: number;
  releaseTime?: number;
  orderIndex?: number;
  task?: {
    description?: string;
    systemMessage?: string;
    referenceText?: string;
    maxPoints?: number;
  };
}

export interface UpdateChapterDTO {
  title?: string;
  subtitle?: string;
  content?: ChapterContent;
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

export interface ChapterOrderItem {
  id: string;
  orderIndex: number;
}

// 時間設定
export interface ChapterTimeSettings {
  timeLimit?: number;
  releaseTime?: number;
}

export interface ChapterAccess {
  chapterId: string;
  canAccess: boolean;
  isCompleted: boolean;
  nextChapterId?: string;
}