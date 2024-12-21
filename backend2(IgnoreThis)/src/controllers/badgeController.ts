import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from '../shared/types/auth.types';

const prisma = new PrismaClient();

export class BadgeController {
  // バッジ一覧取得
  static async getBadges(_req: AuthenticatedRequest, res: Response) {
    try {
      const badges = await prisma.badge.findMany();
      res.json({ success: true, data: badges });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        error: 'バッジの取得に失敗しました' 
      });
    }
  }

  // バッジ作成
  static async createBadge(req: AuthenticatedRequest, res: Response) {
    try {
      const { title, description, iconUrl, condition } = req.body;
      
      const badge = await prisma.badge.create({
        data: {
          title,
          description,
          iconUrl,
          condition
        }
      });

      res.json({ success: true, data: badge });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        error: 'バッジの作成に失敗しました' 
      });
    }
  }
}
