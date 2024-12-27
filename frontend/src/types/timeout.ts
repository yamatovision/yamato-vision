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