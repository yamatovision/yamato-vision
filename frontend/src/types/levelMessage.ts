// src/types/levelMessage.ts
export interface LevelMessage {
  id: string;
  level: number;
  message: string;
  isActive: boolean;
}

export interface LevelMessageFormData {
  level: number;
  message: string;
  isActive: boolean;
}