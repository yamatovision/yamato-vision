export type NotificationType = 'EXPERIENCE_GAIN' | 'LEVEL_UP';

export interface ExperienceGainNotification {
  type: 'EXPERIENCE_GAIN';
  amount: number;
}

export interface LevelUpNotification {
  type: 'LEVEL_UP';
  oldLevel: number;
  newLevel: number;
  message: string | null;
  experienceGained: number;
}

export type Notification = ExperienceGainNotification | LevelUpNotification;
