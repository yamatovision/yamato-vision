import { PrismaClient } from '@prisma/client';
import {
  Notification,
  NotificationServiceResult,
  ExperienceGainNotification,
  LevelUpNotification
} from './notificationTypes';

export class NotificationService {
  private prisma: PrismaClient;
  private static readonly EXPERIENCE_NOTIFICATION_DURATION = 3000; // 3秒
  private static readonly NOTIFICATION_QUEUE: Map<string, Notification[]> = new Map();

  constructor() {
    this.prisma = new PrismaClient();
  }

  private getQueue(): Map<string, Notification[]> {
    return NotificationService.NOTIFICATION_QUEUE;
  }

  async createNotification(notification: Notification): Promise<NotificationServiceResult> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: notification.userId }
      });

      if (!user) {
        throw new Error('User not found');
      }

      // 通知タイプに基づく処理
      switch (notification.type) {
        case 'EXPERIENCE_GAIN':
          return this.handleExperienceGainNotification(notification as ExperienceGainNotification);
        case 'LEVEL_UP':
          return this.handleLevelUpNotification(notification as LevelUpNotification);
        default:
          throw new Error('Invalid notification type');
      }

    } catch (error) {
      console.error('Notification creation failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async handleExperienceGainNotification(
    notification: ExperienceGainNotification
  ): Promise<NotificationServiceResult> {
    try {
      // 経験値獲得通知の場合は、既存の通知があれば集約
      const existingNotifications = this.getQueue().get(notification.userId) || [];
      const existingExpNotification = existingNotifications.find(
        (n: Notification) => n.type === 'EXPERIENCE_GAIN'
      ) as ExperienceGainNotification | undefined;

      if (existingExpNotification) {
        // 既存の通知に新しい経験値を追加
        existingExpNotification.data.amount += notification.data.amount;
      } else {
        // 新しい通知をキューに追加
        existingNotifications.push(notification);
        this.getQueue().set(notification.userId, existingNotifications);

        // 3秒後に自動で削除
        setTimeout(() => {
          const notifications = this.getQueue().get(notification.userId) || [];
          const filteredNotifications = notifications.filter((n: Notification) => n !== notification);
          if (filteredNotifications.length > 0) {
            this.getQueue().set(notification.userId, filteredNotifications);
          } else {
            this.getQueue().delete(notification.userId);
          }
        }, NotificationService.EXPERIENCE_NOTIFICATION_DURATION);
      }

      return {
        success: true,
        data: notification
      };
    } catch (error) {
      console.error('Experience gain notification handling failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async handleLevelUpNotification(
    notification: LevelUpNotification
  ): Promise<NotificationServiceResult> {
    try {
      // レベルアップ通知は常に新規追加（集約しない）
      const existingNotifications = this.getQueue().get(notification.userId) || [];
      existingNotifications.push(notification);
      this.getQueue().set(notification.userId, existingNotifications);

      return {
        success: true,
        data: notification
      };
    } catch (error) {
      console.error('Level up notification handling failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async getPendingNotifications(userId: string): Promise<Notification[]> {
    return this.getQueue().get(userId) || [];
  }

  async removeNotification(userId: string, notificationType: string): Promise<void> {
    const notifications = this.getQueue().get(userId) || [];
    const filteredNotifications = notifications.filter((n: Notification) => n.type !== notificationType);
    
    if (filteredNotifications.length > 0) {
      this.getQueue().set(userId, filteredNotifications);
    } else {
      this.getQueue().delete(userId);
    }
  }

  // レベルアップ通知の順次処理用
  async processLevelUpNotifications(userId: string): Promise<LevelUpNotification[]> {
    const notifications = this.getQueue().get(userId) || [];
    const levelUpNotifications = notifications
      .filter((n: Notification) => n.type === 'LEVEL_UP')
      .map((n: Notification) => n as LevelUpNotification)
      .sort((a: LevelUpNotification, b: LevelUpNotification) => a.data.newLevel - b.data.newLevel);

    return levelUpNotifications;
  }

  // 経験値通知の集約処理
  async consolidateExperienceNotifications(userId: string): Promise<ExperienceGainNotification | null> {
    const notifications = this.getQueue().get(userId) || [];
    const expNotifications = notifications
      .filter((n: Notification) => n.type === 'EXPERIENCE_GAIN')
      .map((n: Notification) => n as ExperienceGainNotification);

    if (expNotifications.length === 0) {
      return null;
    }

    // 経験値を合算
    const totalExp = expNotifications.reduce((sum: number, n: ExperienceGainNotification) => sum + n.data.amount, 0);

    return {
      type: 'EXPERIENCE_GAIN',
      userId,
      data: {
        amount: totalExp,
        source: 'multiple'
      }
    };
  }
}