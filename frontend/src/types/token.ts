// src/types/token.ts を作成
export interface TokenUpdateResponse {
  currentLevel: number;
  oldLevel: number;
  levelUpMessage: string;
  experienceGained: number;
  newTokens?: number;
}

export interface LevelUpData {
  oldLevel: number;
  newLevel: number;
  message: string;
  experienceGained: number;
}