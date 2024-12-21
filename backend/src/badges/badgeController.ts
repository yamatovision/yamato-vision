import { Request, Response } from 'express';
import { AdminBadgeService } from './badgeService';

export class AdminBadgeController {
  private badgeService: AdminBadgeService;

  constructor() {
    this.badgeService = new AdminBadgeService();
  }

  async getBadges(_req: Request, res: Response): Promise<void> {
    try {
      const badges = await this.badgeService.getBadges();
      res.json({
        success: true,
        data: badges
      });
    } catch (error) {
      console.error('Failed to get badges:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'バッジ一覧の取得に失敗しました'
      });
    }
  }
}
