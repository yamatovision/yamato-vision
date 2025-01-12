// backend/src/timeouts/timeoutTypes.ts

export interface TimeoutCheckResult {
  isTimedOut: boolean;
  type: 'chapter' | 'course' | null;
  message?: string;
}

export type TimeWarningLevel = 'none' | 'warning' | 'danger';

export interface TimeCalculation {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalHours: number;        // totalDaysからtotalHoursに変更
  timeOutAt: string;
}

export const TIME_LIMITS = {
  chapter: {
    warningThreshold: 24,    // 24時間
    dangerThreshold: 6,      // 6時間
    defaultLimit: 48         // 48時間
  },
  course: {
    warningThreshold: 360,   // 15日 * 24時間
    dangerThreshold: 72,     // 3日 * 24時間
    defaultLimit: 720        // 30日 * 24時間
  }
};

export interface TimeoutSettings {
  timeLimit: number;  // 時間単位
  startedAt: Date;
  timeOutAt?: Date;
}

export interface TimeoutStatus {
  isTimedOut: boolean;
  warningLevel: TimeWarningLevel;
  remainingTime: TimeCalculation;
  message?: string;
}

export interface TimeoutConfig {
  enableWarnings: boolean;
  warningThreshold: number;  // 時間単位
  dangerThreshold: number;   // 時間単位
}

export interface TimeDisplay {
  formatted: string;
  warningLevel: TimeWarningLevel;
  timeOutDate: string;
  isExpired: boolean;
}

export interface TimeCalculationOptions {
  includeSeconds?: boolean;
  roundUpHours?: boolean;    // roundUpDaysをroundUpHoursに変更
  format?: '24hour' | '12hour';
}

export interface ExtendedTimeoutInfo extends TimeoutStatus {
  progress?: number;
  startDate: Date;
  expectedEndDate: Date;
  isPaused?: boolean;
  pauseDuration?: number;  // ミリ秒単位
}

export const TIME_VALIDATION = {
  minTimeLimit: 24,         // 最小制限時間（1日）
  maxTimeLimit: 8760,       // 最大制限時間（365日）
  minReleaseTime: 0,        // 最小解放時間
  maxReleaseTime: 720,      // 最大解放時間（30日）
};

export const ARCHIVE_PERIOD = {
  hours: 168,               // アーカイブ期間（7日 * 24時間）
  milliseconds: 7 * 24 * 60 * 60 * 1000  // アーカイブ期間（ミリ秒）
};

// 時間単位の変換ヘルパー
export const TIME_CONVERSIONS = {
  HOURS_PER_DAY: 24,
  MINUTES_PER_HOUR: 60,
  SECONDS_PER_MINUTE: 60,
  MILLISECONDS_PER_SECOND: 1000,
  
  // 変換ヘルパーメソッド
  hoursToMilliseconds: (hours: number) => 
    hours * 60 * 60 * 1000,
  
  millisecondsToHours: (ms: number) => 
    Math.floor(ms / (60 * 60 * 1000)),
  
  daysToHours: (days: number) => 
    days * 24,
  
  hoursToDays: (hours: number) => 
    Math.floor(hours / 24)
};

// 警告しきい値の定義
export const WARNING_THRESHOLDS = {
  chapter: {
    warning: 24,  // 24時間前に警告
    danger: 6     // 6時間前に危険警告
  },
  course: {
    warning: 72,  // 3日（72時間）前に警告
    danger: 24    // 1日（24時間）前に危険警告
  },
  exam: {
    warning: 0.5, // 30分前に警告
    danger: 0.25  // 15分前に危険警告
  }
};