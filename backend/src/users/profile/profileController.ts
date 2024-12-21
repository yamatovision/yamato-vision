import { Request, Response } from 'express';
import { ProfileService } from './profileService';
import { ProfileUpdateParams } from './profileTypes';

export class ProfileController {
  private profileService: ProfileService;

  constructor() {
    this.profileService = new ProfileService();
  }

  async getProfile(req: Request, res: Response): Promise<void> {
    try {
      console.log('Request user object:', req.user);

      if (!req.user?.id) {
        console.log('No user ID found in request');
        res.status(401).json({
          success: false,
          message: '認証が必要です'
        });
        return;
      }

      console.log('Attempting to fetch profile for user ID:', req.user.id);
      const profile = await this.profileService.getProfile(req.user.id);
      
      res.json({
        success: true,
        data: profile
      });
    } catch (error) {
      console.error('Failed to get profile:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'プロフィールの取得に失敗しました'
      });
    }
  }

  async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user?.id) {
        res.status(401).json({
          success: false,
          message: '認証が必要です'
        });
        return;
      }

      const updateParams: ProfileUpdateParams = {
        nickname: req.body.nickname,
        message: req.body.message,
        snsLinks: req.body.snsLinks,
        isRankingVisible: req.body.isRankingVisible,
        isProfileVisible: req.body.isProfileVisible
      };

      const updatedProfile = await this.profileService.updateProfile(
        req.user.id,
        updateParams
      );
      
      res.json({
        success: true,
        data: updatedProfile
      });
    } catch (error) {
      console.error('Failed to update profile:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'プロフィールの更新に失敗しました'
      });
    }
  }

  async updateAvatar(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user?.id) {
        res.status(401).json({
          success: false,
          message: '認証が必要です'
        });
        return;
      }

      const { avatarUrl } = req.body;
      
      if (!avatarUrl) {
        res.status(400).json({
          success: false,
          message: 'アバターURLが必要です'
        });
        return;
      }

      const updatedProfile = await this.profileService.updateAvatar(
        req.user.id,
        avatarUrl
      );
      
      res.json({
        success: true,
        data: updatedProfile
      });
    } catch (error) {
      console.error('Failed to update avatar:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'アバターの更新に失敗しました'
      });
    }
  }
}
