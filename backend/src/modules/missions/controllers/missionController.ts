import { Response } from 'express';
import { AuthenticatedRequest } from '../../../shared/types/auth.types';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class MissionController {
  // ミッション一覧取得
  static async getMissions(_req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const missions = await prisma.mission.findMany({
        where: { isActive: true },
        include: {
          reward: true
        }
      });

      res.json({
        success: true,
        data: missions
      });
    } catch (error) {
      console.error('Failed to get missions:', error);
      res.status(500).json({
        success: false,
        error: 'ミッション一覧の取得に失敗しました'
      });
    }
  }

  // 個別ミッション取得
  static async getMissionById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { missionId } = req.params;
      const mission = await prisma.mission.findUnique({
        where: { id: missionId },
        include: {
          reward: true
        }
      });

      if (!mission) {
        res.status(404).json({
          success: false,
          error: 'ミッションが見つかりません'
        });
        return;
      }

      res.json({
        success: true,
        data: mission
      });
    } catch (error) {
      console.error('Failed to get mission:', error);
      res.status(500).json({
        success: false,
        error: 'ミッションの取得に失敗しました'
      });
    }
  }

  // ミッション完了処理
  static async completeMission(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { missionId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: '認証が必要です'
        });
        return;
      }

      // ミッションの存在確認
      const mission = await prisma.mission.findUnique({
        where: { id: missionId },
        include: { reward: true }
      });

      if (!mission) {
        res.status(404).json({
          success: false,
          error: 'ミッションが見つかりません'
        });
        return;
      }

      // ユーザー情報の更新（経験値とジェムの付与）
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          experience: { increment: mission.reward?.exp || 0 },
          gems: { increment: mission.reward?.gems || 0 }
        }
      });

      res.json({
        success: true,
        data: {
          mission,
          updatedUser
        },
        message: 'ミッションを完了しました'
      });
    } catch (error) {
      console.error('Failed to complete mission:', error);
      res.status(500).json({
        success: false,
        error: 'ミッション完了処理に失敗しました'
      });
    }
  }

  // ミッション作成（管理者用）
  static async createMission(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { title, description, missionType, duration, conditions, reward } = req.body;

      const newMission = await prisma.mission.create({
        data: {
          title,
          description,
          missionType,
          duration,
          conditions,
          startDate: new Date(),
          reward: {
            create: reward
          }
        },
        include: {
          reward: true
        }
      });

      res.status(201).json({
        success: true,
        data: newMission
      });
    } catch (error) {
      console.error('Failed to create mission:', error);
      res.status(500).json({
        success: false,
        error: 'ミッションの作成に失敗しました'
      });
    }
  }

  // ミッション更新（管理者用）
  static async updateMission(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { missionId } = req.params;
      const { title, description, missionType, duration, conditions, reward } = req.body;

      const updatedMission = await prisma.mission.update({
        where: { id: missionId },
        data: {
          title,
          description,
          missionType,
          duration,
          conditions,
          reward: reward ? {
            update: reward
          } : undefined
        },
        include: {
          reward: true
        }
      });

      res.json({
        success: true,
        data: updatedMission
      });
    } catch (error) {
      console.error('Failed to update mission:', error);
      res.status(500).json({
        success: false,
        error: 'ミッションの更新に失敗しました'
      });
    }
  }

  // ミッション削除（管理者用）
  static async deleteMission(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { missionId } = req.params;

      await prisma.mission.delete({
        where: { id: missionId }
      });

      res.json({
        success: true,
        message: 'ミッションを削除しました'
      });
    } catch (error) {
      console.error('Failed to delete mission:', error);
      res.status(500).json({
        success: false,
        error: 'ミッションの削除に失敗しました'
      });
    }
  }
}
