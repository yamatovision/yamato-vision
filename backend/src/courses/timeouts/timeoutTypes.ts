export interface TimeoutCheckResult {
  isTimedOut: boolean;
  type: 'chapter' | 'course' | null;
  message?: string;
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
