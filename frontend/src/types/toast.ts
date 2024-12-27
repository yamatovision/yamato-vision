export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'levelUp';

export interface LevelUpData {
  oldLevel: number;
  newLevel: number;
  message: string | null;
  experienceGained?: number;
}

export interface ExpGainedData {
  amount: number;
}