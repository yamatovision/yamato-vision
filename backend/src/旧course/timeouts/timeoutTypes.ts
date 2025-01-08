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
  totalDays: number;
  timeOutAt: string;
}

export const TIME_LIMITS = {
  chapter: {
    warningThreshold: 24 * 60 * 60,    // 24時間（秒）
    dangerThreshold: 6 * 60 * 60,      // 6時間（秒）
    defaultLimit: 48 * 60 * 60         // 2日（秒）
  },
  course: {
    warningThreshold: 15 * 24 * 60 * 60,  // 15日（秒）
    dangerThreshold: 3 * 24 * 60 * 60,    // 3日（秒）
    defaultLimit: 30 * 24 * 60 * 60       // 30日（秒）
  }
};

export interface TimeoutSettings {
  timeLimit: number;  // 日数単位
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
  warningThreshold: number;  // 日数単位
  dangerThreshold: number;   // 日数単位
}

// フロントエンド表示用の型
export interface TimeDisplay {
  formatted: string;
  warningLevel: TimeWarningLevel;
  timeOutDate: string;
  isExpired: boolean;
}

// 時間計算のオプション
export interface TimeCalculationOptions {
  includeSeconds?: boolean;
  roundUpDays?: boolean;format?: '24hour' | '12hour';
}

// 進行状況を含む拡張タイムアウト情報
export interface ExtendedTimeoutInfo extends TimeoutStatus {
  progress?: number;
  startDate: Date;
  expectedEndDate: Date;
  isPaused?: boolean;
  pauseDuration?: number;  // ミリ秒単位
}

// 時間関連の検証ルール
export const TIME_VALIDATION = {
  minTimeLimit: 1,          // 最小制限日数
  maxTimeLimit: 365,        // 最大制限日数
  minReleaseTime: 0,        // 最小解放日数
  maxReleaseTime: 30,       // 最大解放日数
};

// アーカイブ期間の定数
export const ARCHIVE_PERIOD = {
  days: 7,                  // アーカイブ期間（日数）
  milliseconds: 7 * 24 * 60 * 60 * 1000  // アーカイブ期間（ミリ秒）
};