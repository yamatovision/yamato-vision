import { Request, Response } from 'express';
import { ProfileService } from './profileService';
import { ProfileUpdateParams } from './profileTypes';

export class ProfileController {
  private profileService: ProfileService;

  constructor() {
    this.profileService = new ProfileService();
  }


  async getTranscript(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user?.id) {
        res.status(401).json({
          success: false,
          message: '認証が必要です'
        });
        return;
      }

      const transcriptData = await this.profileService.getTranscriptData(req.user.id);
      res.json({
        success: true,
        data: transcriptData
      });
    } catch (error) {
      console.error('Failed to get transcript:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : '成績証明書の取得に失敗しました'
      });
    }
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
// profileController.ts の updateProfile メソッドに以下のログを追加
async updateProfile(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user?.id) {
      res.status(401).json({
        success: false,
        message: '認証が必要です'
      });
      return;
    }

    console.log('Update profile request body:', req.body); // リクエストボディのログ

    const updateParams: ProfileUpdateParams = {
      nickname: req.body.nickname,
      message: req.body.message,
      snsLinks: req.body.snsLinks,
      isRankingVisible: req.body.isRankingVisible,
      isProfileVisible: req.body.isProfileVisible,
      careerIdentity: req.body.careerIdentity
    };

    console.log('Update params:', updateParams); // 更新パラメータのログ

    const updatedProfile = await this.profileService.updateProfile(
      req.user.id,
      updateParams
    );
    
    console.log('Updated profile:', updatedProfile); // 更新後のプロフィールのログ

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
  
      const { base64Image } = req.body;
      
      if (!base64Image || !base64Image.startsWith('data:image/')) {
        res.status(400).json({
          success: false,
          message: '有効な画像データが必要です'
        });
        return;
      }
  
      const updatedProfile = await this.profileService.updateAvatar(
        req.user.id,
        base64Image
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