// frontend/src/types/timeout.ts
export type TimeoutSeverity = 'normal' | 'warning' | 'danger';

export interface TimeConfig {
  chapter: {
    warningThreshold: number;  // 24時間 = 86400秒
    dangerThreshold: number;   // 6時間 = 21600秒
  };
  course: {
    warningThreshold: number;  // 15日 = 1296000秒
    dangerThreshold: number;   // 3日 = 259200秒
  };
}

export interface TimeRemainingProps {
  initialTime: number;         // 秒単位
  type: 'chapter' | 'course';
  onTimeout: () => void;
}