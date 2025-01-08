// 既存の定義
export type ChapterProgressStatus = 
  | 'NOT_STARTED'
  | 'LESSON_IN_PROGRESS'
  | 'LESSON_COMPLETED'
  | 'TASK_IN_PROGRESS'
  | 'COMPLETED'
  | 'FAILED';

// 新しく追加
export type ChapterEvaluationStatus = 
  | 'PERFECT'    // 95点以上
  | 'GREAT'      // 85点以上
  | 'GOOD'       // 70点以上
  | 'PASS'       // 提出のみ
  | 'FAILED';    // タイムアウト