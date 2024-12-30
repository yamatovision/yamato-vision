import { User } from '@prisma/client';

export type ExperienceSource = 'TOKEN' | 'TASK' | 'ACHIEVEMENT';

export interface ExperienceGainEvent {
  userId: string;
  amount: number;
  source: ExperienceSource;
  metadata?: {
    tokenAmount?: number;
    taskId?: string;
    score?: number;
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
