// backend/src/notices/noticeController.ts
import { Request, Response } from 'express';
import { NoticeService } from './noticeService';
import { CreateNoticeDto, UpdateNoticeDto } from './noticeTypes';

export class NoticeController {
  private noticeService: NoticeService;

  constructor() {
    this.noticeService = new NoticeService();
  }

  getNotice = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const notice = await this.noticeService.getNotice(id);
      
      if (!notice) {
        return res.status(404).json({
          success: false,
          message: 'Notice not found'
        });
      }

      return res.json({ success: true, data: notice });
    } catch (error) {
      console.error('Failed to get notice:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to get notice'
      });
    }
  };

  createNotice = async (req: Request, res: Response) => {
    try {
      const noticeData: CreateNoticeDto = req.body;
      const notice = await this.noticeService.createNotice(noticeData);
      return res.status(201).json({ success: true, data: notice });
    } catch (error) {
      console.error('Failed to create notice:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create notice'
      });
    }
  };

  getActiveNotices = async (req: Request, res: Response) => {
    try {
      const userRank = (req.user as any).rank;
      const userLevel = (req.user as any).level;
      const notices = await this.noticeService.getActiveNotices(userRank, userLevel);
      return res.json({ success: true, data: notices });
    } catch (error) {
      console.error('Failed to get notices:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to get notices'
      });
    }
  };

  getAllNotices = async (req: Request, res: Response) => {
    try {
      const notices = await this.noticeService.getAllNotices();
      return res.json({ success: true, data: notices });
    } catch (error) {
      console.error('Failed to get all notices:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to get all notices'
      });
    }
  };

  updateNotice = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const noticeData: UpdateNoticeDto = req.body;
      const notice = await this.noticeService.updateNotice(id, noticeData);
      return res.json({ success: true, data: notice });
    } catch (error) {
      console.error('Failed to update notice:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update notice'
      });
    }
  };

  deleteNotice = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await this.noticeService.deleteNotice(id);
      return res.json({ success: true, message: 'Notice deleted successfully' });
    } catch (error) {
      console.error('Failed to delete notice:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete notice'
      });
    }
  };
}