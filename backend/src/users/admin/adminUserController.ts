import { Request, Response } from 'express';
import { AdminUserService } from './adminUserService';
import { AdminUserSearchParams } from './adminUserTypes';
import { UserStatus } from '@prisma/client';

export class AdminUserController {
  private adminUserService: AdminUserService;

  constructor() {
    this.adminUserService = new AdminUserService();
  }

  async getUsers(req: Request, res: Response): Promise<void> {
    try {
      const params: AdminUserSearchParams = {
        search: req.query.search as string,
        sortBy: req.query.sortBy as string,
        sortOrder: req.query.sortOrder as 'asc' | 'desc',
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10
      };

      const result = await this.adminUserService.getUsers(params);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Failed to get users:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'ユーザー一覧の取得に失敗しました'
      });
    }
  }

  async grantGems(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.params.userId;
      const amount = Number(req.body.amount);

      if (isNaN(amount) || amount <= 0) {
        res.status(400).json({
          success: false,
          message: '有効なジェム数を指定してください'
        });
        return;
      }

      const user = await this.adminUserService.updateUser(userId, { gems: amount });
      
      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      console.error('Failed to grant gems:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'ジェムの付与に失敗しました'
      });
    }
  }

  async grantBadge(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.params.userId;
      const { badgeId } = req.body;

      if (!badgeId) {
        res.status(400).json({
          success: false,
          message: 'バッジIDが必要です'
        });
        return;
      }

      const user = await this.adminUserService.updateUser(userId, { 
        badgeIds: [badgeId]
      });
      
      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      console.error('Failed to grant badge:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'バッジの付与に失敗しました'
      });
    }
  }

  async togglePenalty(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.params.userId;
      const { isPenalty } = req.body;

      const status = isPenalty ? UserStatus.PENALTY : UserStatus.ACTIVE;
      const user = await this.adminUserService.updateUserStatus(userId, status);
      
      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      console.error('Failed to toggle penalty:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'ペナルティ状態の更新に失敗しました'
      });
    }
  }
}
