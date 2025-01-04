// src/types/token.ts を作成
export interface TokenUpdateResponse {
  newLevel: number;     // currentLevel → newLevel
  oldLevel: number;
  levelUpMessage: string | null;
  experienceGained: number;
  newTokens?: number;
}

export interface LevelUpData {
  oldLevel: number;
  newLevel: number;
  message: string;
  experienceGained: number;
}