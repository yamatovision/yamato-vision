

import {
  ChapterContent,
  VideoContent,
  AudioContent,
  ExamContent,
  ExamSection,
  ExamSettings,
  ExamTaskSection,
  ChapterTask,
  Chapter,
  CurrentChapterData,
  TaskContent,
  UserChapterProgress
} from './chapter';

import {
  CourseStatus,
  CourseAction,
  ChapterProgressStatus
} from './status';

export type {
  Chapter,
  ChapterContent,
  VideoContent,
  AudioContent,
  ExamContent,
  ExamSection,
  ExamSettings,
  ExamTaskSection,
  ChapterTask,
  CurrentChapterData,
  TaskContent,
  UserChapterProgress,
  FinalExamChapterDTO  // 追加
};

export type {
  CourseStatus,
  CourseAction,
  ChapterProgressStatus
};


export interface CourseChapter {
  id: string;
  orderIndex: number;
  title: string;
  content?: ChapterContent;
  subtitle?: string;
  timeLimit?: number;
  isVisible?: boolean;
}


// 1. 基本エンティティ定義
interface BaseEntity {
  id: string;
  createdAt: Date;  // optional を削除
  updatedAt: Date;  // optional を削除
}

interface BaseTask {
  title: string;
  materials?: string;
  task?: string;
  evaluationCriteria?: string;
}


export interface Task extends BaseTask {
  maxPoints: number;
}

interface FinalExamChapterDTO {
  title: string;
  subtitle?: string;
  timeLimit: number;
  releaseTime: number;
  isFinalExam: boolean;
  examSettings: {
    sections: ExamSection[];
    thumbnailUrl?: string;
    maxPoints: number;
    timeLimit: number;
    type: 'exam';
  };
}

// 4. 基本コース定義
export interface BaseCourse extends BaseEntity {
  title: string;
  description: string;
  thumbnail?: string;
  levelRequired?: number;
  rankRequired?: string;
  timeLimit?: number;
  credits?: number;
  isPublished: boolean;
  isArchived: boolean;
  publishedAt?: Date;
  archivedAt?: Date;
}

// 5. チャプター付きコース
export interface CourseWithChapters extends BaseCourse {
  chapters?: Chapter[];
  lastAccessedChapterId?: string;
}

// 6. ショップ表示用コース
export interface ShopCourse extends Omit<BaseCourse, 'gemCost'> {
  status: CourseStatus;
  gradient?: string;
  requirementType?: 'AND' | 'OR';
  stage?: string;
  level?: number;
  progress?: number;
  isCurrent?: boolean;  // 追加
  completion?: {
    badges?: {
      completion?: boolean;
      excellence?: boolean;
    };
  };
}

// 7. 完全なコース型
export type Course = ShopCourse & CourseWithChapters;



export interface ReferenceFile {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  uploadedAt: string;
}

export interface SubmissionResponse {
  submission: {
    id: string;
    content: string;
    points: number;
    feedback: string;
    nextStep: string | null;
    submittedAt: Date;
  };
  progress: {
    score: number;
    bestFeedback: string | null;
    bestNextStep: string | null;
    bestEvaluatedAt: Date | null;
  };
}


// 14. コースデータ型
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
      isPerfectOnly?: boolean;
      isFinalExam?: boolean;
      releaseTime?: number;
      nextUnlockTime?: number;  // 追加: Unix timestamp として定義
      content: ChapterContent;
      lessonWatchRate: number;
      submission?: {
        score?: number;
        status?: string;
      };
      score?: number;
      status?: ChapterProgressStatus;
      startedAt?: string;
      isTimedOut?: boolean;
      examSettings?: ExamSettings;
      taskContent?: TaskContent;
      userProgress?: Array<{  // 追加: オプショナルな新しいプロパティ
        isCurrent?: boolean | null;  // 追加: オプショナルな新しいプロパティ
      }>;
    }>;
  };
}
// 15. API DTO
export interface CreateCourseDTO {
  title: string;
  description: string;
  thumbnail?: string;
  levelRequired?: number;
  rankRequired?: string;
  timeLimit?: number;
}

export interface UpdateCourseDTO {
  title?: string;
  description?: string;
  thumbnail?: string;
  levelRequired?: number;
  rankRequired?: string;
  timeLimit?: number;
  isPublished?: boolean;
  isArchived?: boolean;
  credits?: number;
}

export interface CreateChapterDTO {
  title: string;
  subtitle?: string;
  content?: ChapterContent;
  taskContent?: TaskContent;
  referenceFiles?: ReferenceFile[];
  orderIndex: number;
  timeLimit: number;
  isVisible: boolean;
  task?: BaseTask;  // maxPointsとsystemMessageはバックエンドで設定
  releaseTime?: number;  // 追加
  isPerfectOnly?: boolean;  // 追加

}

export interface UpdateChapterDTO {
  title?: string;
  subtitle?: string;
  content?: ChapterContent;
  taskContent?: TaskContent;
  referenceFiles?: ReferenceFile[];
  orderIndex?: number;
  timeLimit?: number;
  isVisible?: boolean;
  task?: BaseTask;  // maxPointsとsystemMessageはバックエンドで設定
  releaseTime?: number;  // 追加
  isPerfectOnly?: boolean;  // 追加
}










// 16. APIレスポンス型
export interface CourseResponse {
  data: Course[];
}

export interface SingleCourseResponse {
  data: Course;
}

export interface ChapterResponse {
  data: Chapter;
}


export interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  totalDays: number;
  timeOutAt: string;
}



export interface CurrentUserCourse {
  id: string;
  courseId: string;
  chapters: CourseChapter[];
  progress: number;
  startedAt: Date;
}


// 19. 現在のコース状態
export interface CurrentCourseState {
  courseId: string;
  status: CourseStatus;
  currentChapter: {
    id: string;
    status: ChapterProgressStatus;
    lastAccessedAt: Date;
  } | null;
  timeInfo: {
    timeRemaining?: number;
    isTimedOut: boolean;
    timeOutAt?: Date;
  };
}

// 20. コンポーネントProps型
export interface TaskDescriptionProps {
  description?: string;      // 課題の説明
  systemMessage?: string;    // システムメッセージ
  maxPoints?: number;        // 配点
  materials?: string;        // 講座内容
  evaluationCriteria?: string;  // 評価基準
  referenceText?: string;    // 参考資料


}






