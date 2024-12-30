export type NotificationType = 'EXPERIENCE_GAIN' | 'LEVEL_UP';

export interface BaseNotification {
  type: NotificationType;
  userId: string;
  data: Record<string, any>;
}

export interface ExperienceGainNotification extends BaseNotification {
  type: 'EXPERIENCE_GAIN';
  data: {
    amount: number;
    source: string;
  };
}

export interface LevelUpNotification extends BaseNotification {
  type: 'LEVEL_UP';
  data: {
    oldLevel: number;
    newLevel: number;
    message: string | null;
    experienceGained: number;
  };
}

export type Notification = ExperienceGainNotification | LevelUpNotification;

export interface NotificationServiceResult {
  success: boolean;
  data?: Notification;
  error?: string;
}
