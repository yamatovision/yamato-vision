// types/toast.ts
export type ToastType = 'success' | 'error' | 'info' | 'warning' | 'levelUp' | 'experienceGain';

export interface LevelUpData {
  currentLevel: number;
  newLevel: number;
  message?: string | null;
  experienceGained?: number;
}

export interface ExperienceGainData {
  amount: number;
  source?: string;
}
export interface ToastMessage {
  id: number;
  message: string;
  type: ToastType;
  levelUpData?: LevelUpData;
  experienceData?: ExperienceGainData;
}