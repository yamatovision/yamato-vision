import { Request, Response } from 'express';
import { RankingService } from './rankingService';

const rankingService = new RankingService();

export class RankingController {
  async getCourseRanking(req: Request, res: Response) {
    try {
      const { courseId } = req.params;
      
      // courseIdの存在チェック
      if (!courseId) {
        return res.status(400).json({
          success: false,
          error: 'Course ID is required'
        });
      }

      const ranking = await rankingService.getCourseRanking(courseId);
      
      // 正しいレスポンス形式で返す
      return res.status(200).json({
        success: true,
        data: {
          activeUsers: ranking.activeUsers,
          historicalUsers: ranking.historicalUsers,
          activeUserCount: ranking.activeUserCount
        }
      });
    } catch (error) {
      console.error('Error in getCourseRanking controller:', error);
      
      // エラーレスポンスの形式を統一
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch course ranking',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}