import { Request, Response } from 'express';
import { mediaService } from './mediaService';
import { PrismaClient } from '@prisma/client';
import { CourseProgressManager } from '../progress/courseProgressManager';

const prisma = new PrismaClient();
const progressManager = new CourseProgressManager();

export const mediaController = {
  async listMuxAssets(req: Request, res: Response) {
    try {
      const assets = await mediaService.listMuxAssets();
      res.json(assets);
    } catch (error) {
      console.error('Error in listMuxAssets:', error);
      res.status(500).json({ error: 'Failed to fetch assets' });
    }
  },

  async updateProgress(req: Request, res: Response): Promise<void> {
    try {
      const { videoId, courseId, chapterId, position, watchRate } = req.body;
      const userId = req.user?.id;

      console.log('【メディア進捗更新リクエスト受信】', {
        処理: 'updateProgress',
        ユーザーID: userId,
        コースID: courseId,
        チャプターID: chapterId,
        現在位置: position,
        視聴率: watchRate,
        タイムスタンプ: new Date().toISOString()
      });

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      // メディア進捗の更新
      await prisma.userChapterMediaProgress.upsert({
        where: {
          userId_chapterId: {
            userId,
            chapterId
          }
        },
        update: {
          position,
          updatedAt: new Date()
        },
        create: {
          userId,
          chapterId,
          position,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });

      // ウォッチレートが95%以上の場合、CourseProgressManagerを使用してチャプター進捗を更新
      if (watchRate >= 95) {
        console.log('【95%到達検知】CourseProgressManager呼び出し開始');
        await progressManager.updateChapterProgress(
          userId,
          courseId,
          chapterId,
          {
            lessonWatchRate: watchRate
          }
        );
      }

      res.json({ success: true });
    } catch (error) {
      console.error('【エラー】メディア進捗更新失敗:', error);
      res.status(500).json({ error: 'Failed to update progress' });
    }
  },
// mediaController.ts の updateAssetTitle メソッドを修正
async updateAssetTitle(req: Request, res: Response): Promise<void> {
  try {
    const { assetId } = req.params;
    const { title } = req.body;

    if (!assetId || !title) {
      res.status(400).json({ error: 'Asset ID and title are required' });
      return;
    }

    await mediaService.updateAssetTitle(assetId, title);
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating asset title:', error);
    res.status(500).json({ error: 'Failed to update asset title' });
  }
},

  async getProgress(req: Request, res: Response): Promise<void> {
    try {
      const { chapterId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const progress = await prisma.userChapterMediaProgress.findUnique({
        where: {
          userId_chapterId: {
            userId,
            chapterId
          }
        }
      });

      res.json(progress);
    } catch (error) {
      console.error('Error getting media progress:', error);
      res.status(500).json({ error: 'Failed to get progress' });
    }
  }
};