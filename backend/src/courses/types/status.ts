// Course Status
export type ChapterAvailabilityStatus = 
  | 'AVAILABLE'           // 利用可能
  | 'LOCKED_BY_PREVIOUS'  // 前のチャプターが未完了でロック
  | 'LOCKED_BY_RELEASE'   // 前チャプター完了済みだがリリース時期待ち
  | 'INVISIBLE'           // 非表示
  | 'COURSE_INACTIVE';    // コース非アクティブ

  // status.ts に追加
export interface ReleaseTimeStatus {
  isReleased: boolean;
  releaseDate: Date | null;
  remainingTime?: {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null;
}
  
export type CourseStatus = 
  | 'restricted'
  | 'blocked'      // 追加
  | 'available'
  | 'active'
  | 'completed'
  | 'perfect'
  | 'failed'

  export type ChapterProgressStatus = 
  | 'NOT_STARTED'
  | 'LESSON_IN_PROGRESS'
  | 'LESSON_COMPLETED'
  | 'TASK_IN_PROGRESS'
  | 'COMPLETED'
  | 'FAILED'



export type ChapterEvaluationStatus = 
  | 'PERFECT'    // 95点以上
  | 'GREAT'      // 85点以上
  | 'GOOD'       // 70点以上
  | 'PASS'       // 提出のみ
  | 'FAILED'     // タイムアウト

  export const CourseStatus = {
    RESTRICTED: 'restricted' as CourseStatus,
    BLOCKED: 'blocked' as CourseStatus,      // 追加
    AVAILABLE: 'available' as CourseStatus,
    ACTIVE: 'active' as CourseStatus,
    COMPLETED: 'completed' as CourseStatus,
    PERFECT: 'perfect' as CourseStatus,
    FAILED: 'failed' as CourseStatus,
  } as const;

// Chapter Status（重複を統合）
export type ChapterStatus = 
  | 'ready'             // 受講可能だが未開始
  | 'in_progress'       // 受講中
  | 'lesson_completed'  // レッスン完了
  | 'completed'         // チャプター完了
  | 'failed';           // 失敗（タイムアウトなど）

export const ChapterStatus = {
  READY: 'ready' as ChapterStatus,
  IN_PROGRESS: 'in_progress' as ChapterStatus,
  LESSON_COMPLETED: 'lesson_completed' as ChapterStatus,
  COMPLETED: 'completed' as ChapterStatus,
  FAILED: 'failed' as ChapterStatus,
} as const;

// User Rank
export type UserRank = 
  | 'お試し'
  | '初伝'
  | '中伝'
  | '奥伝'
  | '皆伝'
  | '管理者'
  | '退会者';

export const USER_RANKS: Record<UserRank, number> = {
  'お試し': 0,
  '初伝': 1,
  '中伝': 2,
  '奥伝': 3,
  '皆伝': 4,
  '管理者': 5,
  '退会者': -1
};
