import { Request, Response } from 'express';
import { ExperienceService } from './experienceService';
import { ExperienceGainEvent } from './experienceTypes';

export class ExperienceController {
  private experienceService: ExperienceService;

  constructor() {
    this.experienceService = new ExperienceService();
  }

  handleExperienceGain = async (req: Request, res: Response) => {
    try {
      const event: ExperienceGainEvent = req.body;

      if (!event.userId || !event.amount || !event.source) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields'
        });
      }

      const result = await this.experienceService.addExperience(event);

      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: result.error || 'Failed to add experience'
        });
      }

      return res.json({
        success: true,
        data: result.data
      });
    } catch (error) {
      console.error('Experience gain handler error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };

  getExperienceStatus = async (req: Request, res: Response) => {
    try {
      const userId = req.params.userId || (req.user as any)?.id;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required'
        });
      }

      const status = await this.experienceService.getExperienceStatus(userId);

      return res.json({
        success: true,
        data: status
      });
    } catch (error) {
      console.error('Experience status error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to get experience status'
      });
    }
  };

  calculateTokenExperience = async (req: Request, res: Response) => {
    try {
      const { tokenAmount } = req.body;

      if (typeof tokenAmount !== 'number' || tokenAmount < 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid token amount'
        });
      }

      const experience = await this.experienceService.calculateExperienceForTokens(tokenAmount);

      return res.json({
        success: true,
        data: {
          tokenAmount,
          experience
        }
      });
    } catch (error) {
      console.error('Token experience calculation error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to calculate token experience'
      });
    }
  };
}