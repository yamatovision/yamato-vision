// src/types/status.ts

// チャプターの進捗状態
export type ChapterProgressStatus = 
  | 'NOT_STARTED'
  | 'LESSON_IN_PROGRESS'
  | 'LESSON_COMPLETED'
  | 'TASK_IN_PROGRESS'
  | 'COMPLETED'
  | 'FAILED';

// チャプターの評価状態
export type ChapterEvaluationStatus = 
  | 'PERFECT'    // 95点以上
  | 'GREAT'      // 85点以上
  | 'GOOD'       // 70点以上
  | 'PASS'       // 提出のみ
  | 'FAILED';    // タイムアウト

// コースの状態
export const COURSE_STATUSES = {
  RESTRICTED: 'restricted',   // 条件未達成
  BLOCKED: 'blocked',        // 他のアクティブコース存在
  AVAILABLE: 'available',    // 受講可能
  ACTIVE: 'active',         // 受講中
  COMPLETED: 'completed',   // 通常クリア
  PERFECT: 'perfect',      // perfect評価
  FAILED: 'failed',        // 失敗
} as const;

export type CourseStatus = typeof COURSE_STATUSES[keyof typeof COURSE_STATUSES];

// コースのアクション
export const COURSE_ACTIONS = ['select', 'activate', 'format'] as const;
export type CourseAction = typeof COURSE_ACTIONS[number];

// 進捗情報の型
export interface ProgressInfo {
  status: 'not_started' | 'in_progress' | 'completed' | 'timeout';
  startedAt?: Date;
  completedAt?: Date;
}