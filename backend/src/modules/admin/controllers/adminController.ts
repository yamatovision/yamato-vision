import { Response } from 'express';
import { AuthenticatedRequest } from '../../../shared/types/auth.types';
import { AdminService } from '../services/adminService';

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
      console.error('Failed to get users:', error);
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
      console.error('Failed to get user details:', error);
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
      const { userId, badgeId } = req.params;
      const result = await AdminService.assignBadgeToUser(userId, badgeId);

      res.json({
        success: true,
        data: result,
        message: 'バッジを付与しました'
      });
    } catch (error) {
      console.error('Failed to assign badge:', error);
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

  // ニックネーム更新
  static async updateNickname(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const { nickname } = req.body;

      const updatedUser = await AdminService.updateUserNickname(userId, nickname);

      res.json({
        success: true,
        data: updatedUser,
        message: 'ニックネームを更新しました'
      });
    } catch (error) {
      console.error('Failed to update nickname:', error);
      res.status(500).json({
        success: false,
        error: 'ニックネームの更新に失敗しました'
      });
    }
  }

  // 表示設定更新
  static async updateVisibility(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const { isProfileVisible, isRankingVisible } = req.body;

      const updatedUser = await AdminService.updateUserVisibility(
        userId,
        isProfileVisible,
        isRankingVisible
      );

      res.json({
        success: true,
        data: updatedUser,
        message: '表示設定を更新しました'
      });
    } catch (error) {
      console.error('Failed to update visibility:', error);
      res.status(500).json({
        success: false,
        error: '表示設定の更新に失敗しました'
      });
    }
  }
}

export default AdminController;
