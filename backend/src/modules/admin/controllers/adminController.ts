import { Response } from 'express';
import { AuthenticatedRequest } from '../../../shared/types/auth.types';
import { AdminService } from '../services/adminService';
import { createLogger } from '../../../config/logger';

const logger = createLogger('AdminController');

export class AdminController {
  // ユーザー一覧取得（ページネーション対応）
  static async getUsers(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const usersData = await AdminService.getUsers(page, limit);

      res.json({
        success: true,
        data: usersData
      });
    } catch (error) {
      logger.error('Failed to get users:', error);
      res.status(500).json({
        success: false,
        error: 'ユーザー一覧の取得に失敗しました'
      });
    }
  }

  // ユーザー詳細取得
  static async getUserDetails(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const userDetails = await AdminService.getUserDetails(userId);

      res.json({
        success: true,
        data: userDetails
      });
    } catch (error) {
      logger.error('Failed to get user details:', error);
      if (error.message === 'User not found') {
        res.status(404).json({
          success: false,
          error: 'ユーザーが見つかりません'
        });
        return;
      }
      res.status(500).json({
        success: false,
        error: 'ユーザー詳細の取得に失敗しました'
      });
    }
  }

  // バッジ付与
  static async assignBadge(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const { badgeId } = req.body;
      const result = await AdminService.assignBadgeToUser(userId, badgeId);

      res.json({
        success: true,
        data: result,
        message: 'バッジを付与しました'
      });
    } catch (error) {
      logger.error('Failed to assign badge:', error);
      if (error.code === 'P2002') {
        res.status(400).json({
          success: false,
          error: 'すでに付与されているバッジです'
        });
        return;
      }
      res.status(500).json({
        success: false,
        error: 'バッジの付与に失敗しました'
      });
    }
  }

  // ジェム付与
  static async grantGems(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const { amount } = req.body;

      if (!amount || amount <= 0) {
        res.status(400).json({
          success: false,
          error: '有効なジェム数を指定してください'
        });
        return;
      }

      const result = await AdminService.grantGemsToUser(userId, amount);

      res.json({
        success: true,
        data: result,
        message: 'ジェムを付与しました'
      });
    } catch (error) {
      logger.error('Failed to grant gems:', error);
      res.status(500).json({
        success: false,
        error: 'ジェムの付与に失敗しました'
      });
    }
  }

  // ペナルティステータス更新
  static async updatePenaltyStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const { isPenalty } = req.body;

      const result = await AdminService.updateUserPenaltyStatus(userId, isPenalty);

      res.json({
        success: true,
        data: result,
        message: isPenalty ? 'ペナルティを設定しました' : 'ペナルティを解除しました'
      });
    } catch (error) {
      logger.error('Failed to update penalty status:', error);
      res.status(500).json({
        success: false,
        error: 'ペナルティステータスの更新に失敗しました'
      });
    }
  }

  // バッジ一覧取得
  static async getBadges(_req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const badges = await AdminService.getAllBadges();

      res.json({
        success: true,
        data: badges
      });
    } catch (error) {
      logger.error('Failed to get badges:', error);
      res.status(500).json({
        success: false,
        error: 'バッジ一覧の取得に失敗しました'
      });
    }
  }
}
