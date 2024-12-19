import { Response } from 'express';
import { AuthenticatedRequest } from '../../../shared/types/auth.types';
import { userProfileService } from '../services/userProfileService';
import { createLogger } from '../../../config/logger';

const logger = createLogger('UserProfileController');

export class UserProfileController {
  async getProfile(req: AuthenticatedRequest, res: Response): Promise<Response | void> {
    try {
      const userId = req.user?.userId;  // id を userId に変更
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const profile = await userProfileService.getProfile(userId);
      await userProfileService.syncWithMongo(userId);

      return res.json({ success: true, data: profile });
    } catch (error) {
      logger.error('Error getting profile:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async updateProfile(req: AuthenticatedRequest, res: Response): Promise<Response | void> {
    try {
      const userId = req.user?.userId;  // id を userId に変更
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const updateData = req.body;
      const updatedProfile = await userProfileService.updateProfile(userId, updateData);

      return res.json({ success: true, data: updatedProfile });
    } catch (error) {
      logger.error('Error updating profile:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export const userProfileController = new UserProfileController();
