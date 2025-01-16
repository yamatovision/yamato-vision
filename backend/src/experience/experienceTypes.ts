import { User } from '@prisma/client';

export type ExperienceSource = 'TOKEN' | 'TASK' | 'ACHIEVEMENT' | 'CREDITS_EARNED';
export interface ExperienceGainEvent {
  userId: string;
  amount: number;
  source: 'submission' | 'token' | string;  // ソースタイプを追加
  metadata?: {
    chapterId?: string;
    score?: number;
    [key: string]: any;  // その他のメタデータも許可
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
