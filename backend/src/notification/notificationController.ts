import { Request, Response } from 'express';
import { NotificationService } from './notificationService';
import { Notification } from './notificationTypes';

export class NotificationController {
  private notificationService: NotificationService;

  constructor() {
    this.notificationService = new NotificationService();
  }

  getPendingNotifications = async (req: Request, res: Response) => {
    try {
      const userId = req.params.userId || (req.user as any)?.id;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required'
        });
      }

      // 経験値通知の集約
      const consolidatedExp = await this.notificationService.consolidateExperienceNotifications(userId);
      
      // レベルアップ通知の取得（順序付け済み）
      const levelUpNotifications = await this.notificationService.processLevelUpNotifications(userId);

      // 通知の組み合わせ
      const notifications: Notification[] = [
        ...(consolidatedExp ? [consolidatedExp] : []),
        ...levelUpNotifications
      ];

      return res.json({
        success: true,
        data: notifications
      });

    } catch (error) {
      console.error('Failed to get notifications:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to get notifications'
      });
    }
  };

  removeNotification = async (req: Request, res: Response) => {
    try {
      const userId = req.params.userId || (req.user as any)?.id;
      const { type } = req.body;

      if (!userId || !type) {
        return res.status(400).json({
          success: false,
          message: 'User ID and notification type are required'
        });
      }

      await this.notificationService.removeNotification(userId, type);

      return res.json({
        success: true,
        message: 'Notification removed successfully'
      });

    } catch (error) {
      console.error('Failed to remove notification:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to remove notification'
      });
    }
  };

  handleExperienceGain = async (req: Request, res: Response) => {
    try {
      const { userId, amount, source } = req.body;

      if (!userId || !amount || !source) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields'
        });
      }

      const notification = {
        type: 'EXPERIENCE_GAIN' as const,
        userId,
        data: {
          amount,
          source
        }
      };

      const result = await this.notificationService.createNotification(notification);

      return res.json(result);

    } catch (error) {
      console.error('Failed to handle experience gain:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to handle experience gain'
      });
    }
  };

  handleLevelUp = async (req: Request, res: Response) => {
    try {
      const { userId, oldLevel, newLevel, message, experienceGained } = req.body;

      if (!userId || !oldLevel || !newLevel) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields'
        });
      }

      const notification = {
        type: 'LEVEL_UP' as const,
        userId,
        data: {
          oldLevel,
          newLevel,
          message,
          experienceGained
        }
      };

      const result = await this.notificationService.createNotification(notification);

      return res.json(result);

    } catch (error) {
      console.error('Failed to handle level up:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to handle level up'
      });
    }
  };
}