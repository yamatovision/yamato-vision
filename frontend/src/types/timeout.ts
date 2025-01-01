// src/types/timeout.ts
export type TimeoutSeverity = 'normal' | 'warning' | 'danger';
export type TimeoutType = 'chapter' | 'course' | 'archive';

export interface TimeConfig {
  chapter: {
    warningThreshold: number;  // 24時間 = 86400秒
    dangerThreshold: number;   // 6時間 = 21600秒
  };
  course: {
    warningThreshold: number;  // 15日 = 1296000秒
    dangerThreshold: number;   // 3日 = 259200秒
  };
  archive: {
    warningThreshold: number;
    dangerThreshold: number;
  };
}

export interface TimeRemainingProps {
  timeLimit: number;
  type: TimeoutType;
  onTimeout?: () => void;
  startTime?: Date;
}

// 時間の検証用定数
export const TIME_VALIDATION = {
  minTimeLimit: 1,          // 最小制限日数
  maxTimeLimit: 365,        // 最大制限日数
  minReleaseTime: 0,        // 最小解放日数
  maxReleaseTime: 30,       // 最大解放日数
} as const;

// 警告レベルの定義
export type TimeWarningLevel = 'none' | 'warning' | 'danger';

// 時間計算の結果型
export interface TimeCalculation {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalDays: number;
  timeOutAt: string;
}