import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { createLogger } from '../../../config/logger';

const prisma = new PrismaClient();
const logger = createLogger('AdminUserController');

export const adminUserController = {
  // ユーザー一覧取得
   // ユーザー一覧取得
   async getUsers(req: Request, res: Response) {
    try {
      const { 
        page = 1, 
        limit = 10, 
        search = '', 
        searchBy = 'name',
        sortBy = 'createdAt',
        order = 'desc'
      } = req.query;

      const skip = (Number(page) - 1) * Number(limit);
      const whereClause = search
        ? {
            [searchBy as string]: {
              contains: search as string,
              mode: 'insensitive'
            }
          }
        : {};

      // PostgreSQLからユーザー総数の取得
      const total = await prisma.user.count({ where: whereClause });

      // PostgreSQLからユーザー一覧の取得
      const users = await prisma.user.findMany({
        where: whereClause,
        take: Number(limit),
        skip,
        orderBy: {
          [sortBy as string]: order
        },
        include: {
          badges: true
        }
      });

      res.json({
        success: true,
        data: {
          users,
          pagination: {
            total,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(total / Number(limit))
          }
        }
      });
    } catch (error) {
      logger.error('Get users error:', error);
      res.status(500).json({
        success: false,
        error: 'ユーザー一覧の取得に失敗しました'
      });
    }
  },

  // ペナルティ設定/解除
  async togglePenalty(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { isPenalty } = req.body;

      const user = await prisma.user.update({
        where: { id: userId },
        data: {
          status: isPenalty ? 'PENALTY' : 'ACTIVE'
        }
      });

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      logger.error('Toggle penalty error:', error);
      res.status(500).json({
        success: false,
        error: 'ペナルティステータスの更新に失敗しました'
      });
    }
  },

  // バッジ付与
  async grantBadge(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { badgeId } = req.body;

      const userBadge = await prisma.userBadge.create({
        data: {
          userId,
          badgeId
        },
        include: {
          badge: true
        }
      });

      res.json({
        success: true,
        data: userBadge
      });
    } catch (error) {
      logger.error('Grant badge error:', error);
      res.status(500).json({
        success: false,
        error: 'バッジの付与に失敗しました'
      });
    }
  },

  // ジェム付与
  async grantGems(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { amount } = req.body;

      if (amount <= 0) {
        res.status(400).json({
          success: false,
          error: '付与するジェム数は1以上である必要があります'
        });
        return;
      }

      const user = await prisma.user.update({
        where: { id: userId },
        data: {
          gems: {
            increment: amount
          }
        }
      });

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      logger.error('Grant gems error:', error);
      res.status(500).json({
        success: false,
        error: 'ジェムの付与に失敗しました'
      });
    }
  }
};
