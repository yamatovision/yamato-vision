import { 
  Chapter as PrismaChapter, 
  Task as PrismaTask,
  UserChapterProgress 
} from '@prisma/client';

// Prismaの基本型との統合
type PrismaJsonValue = string | number | boolean | null | { [key: string]: PrismaJsonValue } | PrismaJsonValue[];

export type ChapterWithTask = Omit<PrismaChapter, 'content'> & {
  content: PrismaJsonValue;
  task: (Omit<PrismaTask, 'evaluationCriteria' | 'task'> & {
    evaluationCriteria: string | null;
    task: string | null;  // このフィールドを明示的に追加
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

// メディアコンテンツの定義
export interface ChapterContent {
  type: 'video' | 'audio';
  videoId: string;
  transcription?: string;
}

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
  isFinalExam?: boolean;  // 追加
  examSettings?: ExamSettings;  // 追加
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
  examSettings?: ExamSettings;  // 追加
  releaseTime?: number;
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