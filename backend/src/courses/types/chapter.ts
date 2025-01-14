import { 
  Chapter as PrismaChapter, 
  Task as PrismaTask,
  UserChapterProgress 
} from '@prisma/client';

// Prismaの基本型との統合
type PrismaJsonValue = string | number | boolean | null | { [key: string]: PrismaJsonValue } | PrismaJsonValue[];
// ChapterWithTask 型を修正
export type ChapterWithTask = Omit<PrismaChapter, 'content' | 'examSettings'> & {
  content: PrismaJsonValue;
  examSettings: ExamSettings | null;  // 明示的に ExamSettings 型を指定
  task: (Omit<PrismaTask, 'evaluationCriteria' | 'task'> & {
    evaluationCriteria: string | null;
    task: string | null;
  }) | null;
  userProgress?: UserChapterProgress[];
};

export interface ReferenceFile {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  uploadedAt: string;
}

// TaskContent型の定義を追加
export interface TaskContent {
  description: string;
  examSettings?: ExamSettings;  // 追加
}
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

// chapter.ts に追加
export interface VideoContent {
  type: 'video';
  videoId: string;
  transcription?: string;
}

export interface AudioContent {
  type: 'audio';
  videoId: string;
  thumbnailUrl?: string;
  transcription?: string;
}

export interface ExamContent {
  type: 'exam';
  thumbnailUrl?: string;
  sections?: ExamSection[];
}


// メディアコンテンツの定義
export interface ChapterContent {
  type: 'video' | 'audio' | 'exam';  // examを追加
  videoId?: string;  // optionalに変更
  transcription?: string;
  thumbnailUrl?: string;
  sections?: ExamSection[];  // 試験用に追加
}
export const isExamType = (content: ChapterContent): boolean => {
  return content.type === 'exam';
};

export interface ExamTaskSection {
  materials: string;
  task: string;
  evaluationCriteria: string;
}

export interface ExamSection {
  title: string;
  task: ExamTaskSection;
}

export interface ExamSettings {
  sections: ExamSection[];
  thumbnailUrl?: string; // 追加

}
// DTOs
export interface CreateChapterDTO {
  title: string;
  subtitle?: string;
  content?: ChapterContent;
  taskContent?: TaskContent;
  referenceFiles?: ReferenceFile[];
  timeLimit?: number;
  releaseTime?: number;
  orderIndex?: number;
  experienceWeight?: number;
  task?: {
    title: string;
    materials?: string;
    task?: string;
    evaluationCriteria?: string;
    maxPoints: number;
  };
}
export interface UpdateChapterDTO {
  title?: string;
  subtitle?: string;
  content?: ChapterContent;
  taskContent?: TaskContent;  // 変更
  referenceFiles?: ReferenceFile[];  // 追加
  timeLimit?: number;
  releaseTime?: number;
  isVisible?: boolean;
  isPerfectOnly?: boolean;
  task?: {
    title: string;
    materials?: string;
    task?: string;
    evaluationCriteria?: string;
    maxPoints: number;
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