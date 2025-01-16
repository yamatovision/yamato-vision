import { User } from '@prisma/client';

export type ExperienceSource = 'TOKEN' | 'TASK' | 'ACHIEVEMENT' | 'CREDITS_EARNED';

export interface ExperienceGainEvent {
  userId: string;
  amount: number;
  source: ExperienceSource;
  metadata?: {
    tokenAmount?: number;
    taskId?: string;
    score?: number;
    // 単位取得用に追加
    courseId?: string;
    credits?: number;
    grade?: string;
  };
}

export interface ExperienceCalcResult {
  oldExp: number;
  newExp: number;
  oldLevel: number;
  newLevel: number;
  gainedExp: number;
  isLevelUp: boolean;
  levelUpMessage?: string | null;
}

export interface ExperienceServiceResult {
  success: boolean;
  data?: ExperienceCalcResult;
  error?: string;
}

export interface ExperienceStatusResponse {
  currentExp: number;
  currentLevel: number;
  nextLevelExp: number;
  progress: number;
}
