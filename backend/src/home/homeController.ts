import { Request, Response } from 'express';
import { homeService } from './homeService';

export class HomeController {
  async getHomePageData(req: Request, res: Response) {
    try {
      if (!req.user?.id) {
        return res.status(401).json({
          success: false,
          message: '認証が必要です'
        });
      }

      console.log('Fetching home page data for user:', req.user.id);
      const data = await homeService.getHomePageData(req.user.id);
      
      return res.status(200).json({
        success: true,
        data
      });
    } catch (error) {
      console.error('Error in getHomePageData:', error);
      return res.status(500).json({
        success: false,
        message: 'ホームページデータの取得に失敗しました'
      });
    }
  }
}

export const homeController = new HomeController();