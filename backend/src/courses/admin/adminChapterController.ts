import { Request, Response } from 'express';
import { AdminChapterService } from './adminChapterService';

export class AdminChapterController {
  private chapterService: AdminChapterService;

  constructor() {
    this.chapterService = new AdminChapterService();
  }

  createChapter = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { courseId } = req.params;
      const chapter = await this.chapterService.createChapter(courseId, req.body);
      return res.json({
        success: true,
        data: chapter
      });
    } catch (error) {
      console.error('Error creating chapter:', error);
      return res.status(500).json({
        success: false,
        message: 'チャプターの作成に失敗しました'
      });
    }
  };

  resetChapterOrder = async (req: Request, res: Response) => {
    try {
      const { courseId } = req.params;
      await this.chapterService.resetOrderIndices(courseId);
      
      res.status(200).json({
        success: true,
        message: 'Chapter order indices reset successfully'
      });
    } catch (error) {
      console.error('Error resetting chapter order:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to reset chapter order'
      });
    }
  };


  getChapter = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { chapterId } = req.params;
      const chapter = await this.chapterService.getChapter(chapterId);
      
      if (!chapter) {
        return res.status(404).json({
          success: false,
          message: 'チャプターが見つかりません'
        });
      }

      return res.json({
        success: true,
        data: chapter
      });
    } catch (error) {
      console.error('Error getting chapter:', error);
      return res.status(500).json({
        success: false,
        message: 'チャプターの取得に失敗しました'
      });
    }
  };

  getChapters = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { courseId } = req.params;
      const chapters = await this.chapterService.getChapters(courseId);
      
      return res.json({
        success: true,
        data: chapters
      });
    } catch (error) {
      console.error('Error getting chapters:', error);
      return res.status(500).json({
        success: false,
        message: 'チャプター一覧の取得に失敗しました'
      });
    }
  };

  updateChapter = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { chapterId } = req.params;
      const chapter = await this.chapterService.updateChapter(chapterId, req.body);
      
      return res.json({
        success: true,
        data: chapter
      });
    } catch (error) {
      console.error('Error updating chapter:', error);
      return res.status(500).json({
        success: false,
        message: 'チャプターの更新に失敗しました'
      });
    }
  };

  deleteChapter = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { chapterId } = req.params;
      await this.chapterService.deleteChapter(chapterId);
      
      return res.json({
        success: true,
        message: 'チャプターを削除しました'
      });
    } catch (error) {
      console.error('Error deleting chapter:', error);
      return res.status(500).json({
        success: false,
        message: 'チャプターの削除に失敗しました'
      });
    }
  };

  updateChaptersOrder = async (req: Request, res: Response): Promise<Response> => {
    try {
      const orders = req.body;
      await this.chapterService.updateChaptersOrder(orders);
      
      return res.json({
        success: true,
        message: 'チャプターの順序を更新しました'
      });
    } catch (error) {
      console.error('Error updating chapters order:', error);
      return res.status(500).json({
        success: false,
        message: 'チャプターの順序更新に失敗しました'
      });
    }
  };

  updateVisibility = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { chapterId } = req.params;
      const { isVisible } = req.body;
      
      const chapter = await this.chapterService.updateChapter(chapterId, {
        isVisible
      });
      
      return res.json({
        success: true,
        data: chapter
      });
    } catch (error) {
      console.error('Error updating chapter visibility:', error);
      return res.status(500).json({
        success: false,
        message: '可視性の更新に失敗しました'
      });
    }
  };
  reorderChapters = async (req: Request, res: Response) => {
    try {
      const { courseId } = req.params;
      await this.chapterService.reorderAllChapters(courseId);
      
      res.status(200).json({
        success: true,
        message: 'Chapters reordered successfully'
      });
    } catch (error) {
      console.error('Error reordering chapters:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to reorder chapters'
      });
    }
  };


  updatePerfectOnly = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { chapterId } = req.params;
      const { isPerfectOnly } = req.body;
      
      const chapter = await this.chapterService.updateChapter(chapterId, {
        isPerfectOnly
      });
      
      return res.json({
        success: true,
        data: chapter
      });
    } catch (error) {
      console.error('Error updating perfect only setting:', error);
      return res.status(500).json({
        success: false,
        message: 'パーフェクトモード設定の更新に失敗しました'
      });
    }
  };
}