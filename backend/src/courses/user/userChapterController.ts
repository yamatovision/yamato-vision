import { Request, Response } from 'express';
import { UserChapterService } from './userChapterService';

export class UserChapterController {
  private chapterService: UserChapterService;

  constructor() {
    this.chapterService = new UserChapterService();
  }

  getCurrentChapter = async (req: Request, res: Response) => {
    try {
      const { courseId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const chapter = await this.chapterService.getCurrentChapter(userId, courseId);
      res.json({ success: true, data: chapter });
    } catch (error) {
      console.error('Error getting current chapter:', error);
      res.status(500).json({ success: false, message: 'Failed to get current chapter' });
    }
  };

  getChapterDetails = async (req: Request, res: Response) => {
    try {
      const { courseId, chapterId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const chapter = await this.chapterService.getChapterDetails(userId, courseId, chapterId);
      res.json({ success: true, data: chapter });
    } catch (error) {
      console.error('Error getting chapter details:', error);
      res.status(500).json({ success: false, message: 'Failed to get chapter details' });
    }
  };

  updateWatchProgress = async (req: Request, res: Response) => {
    try {
      const { courseId, chapterId } = req.params;
      const { watchRate } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const progress = await this.chapterService.updateWatchProgress(
        userId,
        courseId,
        chapterId,
        watchRate
      );

      res.json({ success: true, data: progress });
    } catch (error) {
      console.error('Error updating watch progress:', error);
      res.status(500).json({ success: false, message: 'Failed to update watch progress' });
    }
  };

  recordSubmission = async (req: Request, res: Response) => {
    try {
      const { courseId, chapterId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const result = await this.chapterService.recordSubmission(
        userId,
        courseId,
        chapterId,
        req.body
      );

      res.json({ success: true, data: result });
    } catch (error) {
      console.error('Error recording submission:', error);
      res.status(500).json({ success: false, message: 'Failed to record submission' });
    }
  };

  getChapterPeerSubmissions = async (req: Request, res: Response) => {
    try {
      const { courseId, chapterId } = req.params;
      const { page, perPage } = req.query;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const submissions = await this.chapterService.getChapterPeerSubmissions(
        courseId,
        chapterId,
        userId,
        Number(page) || 1,
        Number(perPage) || 10
      );

      res.json({ success: true, data: submissions });
    } catch (error) {
      console.error('Error getting peer submissions:', error);
      res.status(500).json({ success: false, message: 'Failed to get peer submissions' });
    }
  };

  checkAccess = async (req: Request, res: Response) => {
    try {
      const { courseId, chapterId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const accessStatus = await this.chapterService.checkAccess(
        userId,
        courseId,
        chapterId
      );

      res.json({ success: true, data: accessStatus });
    } catch (error) {
      console.error('Error checking chapter access:', error);
      res.status(500).json({ success: false, message: 'Failed to check chapter access' });
    }
  };

  getPeerSubmissionDetails = async (req: Request, res: Response): Promise<void> => {
    try {
      const { submissionId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized'
        });
        return;
      }

      const submissionDetails = await this.chapterService.getPeerSubmissionDetails(
        submissionId,
        userId
      );

      res.json({
        success: true,
        data: submissionDetails
      });
    } catch (error) {
      console.error('Error getting peer submission details:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get submission details'
      });
    }
  };
}

