// backend/src/users/profile/profileService.ts

import { PrismaClient } from '@prisma/client';
import { ProfileUpdateParams, ProfileResponse, ExpStatus } from './profileTypes';
import { v2 as cloudinary } from 'cloudinary';
import { TokenSyncService } from '../../sync/token/tokenSyncService';
import { LevelMessageService } from '../../levelMessages/levelMessageService';

const prisma = new PrismaClient();

export class ProfileService {
  private static readonly EXP_PER_LEVEL = 1000;
  private readonly levelMessageService: LevelMessageService;

  private readonly USER_SELECT = {
    id: true,
    email: true,
    name: true,
    nickname: true,
    careerIdentity: true, // この行を追加
    avatarUrl: true,
    rank: true,
    level: true,
    experience: true,
    gems: true,
    message: true,
    snsLinks: true,
    isRankingVisible: true,
    isProfileVisible: true,
    createdAt: true,
    badges: {
      select: {
        badge: {
          select: {
            id: true,
            title: true,
            iconUrl: true
          }
        },
        earnedAt: true
      }
    },
    tokenTracking: {
      select: {
        weeklyTokens: true,
        weeklyLimit: true,
        purchasedTokens: true,
        unprocessedTokens: true
      }
    }
  } as const;

  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET
    });
    this.levelMessageService = new LevelMessageService();
  }

  private calculateExpStatus(experience: number, level: number): ExpStatus {
    const currentLevelExp = experience % ProfileService.EXP_PER_LEVEL;
    
    return {
      currentExp: experience,
      currentLevelExp,
      expToNextLevel: ProfileService.EXP_PER_LEVEL,
      remainingExp: ProfileService.EXP_PER_LEVEL - currentLevelExp,
      levelProgress: (currentLevelExp / ProfileService.EXP_PER_LEVEL) * 100
    };
  }

  private async uploadImageToCloudinary(base64Image: string, userId: string): Promise<string> {
    try {
      const result = await cloudinary.uploader.upload(base64Image, {
        folder: 'avatars',
        public_id: `user_${userId}`,
        overwrite: true,
        transformation: [
          { width: 256, height: 256, crop: 'fill' },
          { quality: 'auto', fetch_format: 'auto' }
        ]
      });

      return result.secure_url;
    } catch (error) {
      console.error('Cloudinary upload failed:', error);
      throw new Error('画像のアップロードに失敗しました');
    }
  }

  private formatProfileResponse(
    user: any, 
    additional?: { 
      expGained?: number;
      levelUpData?: {
        oldLevel: number;
        newLevel: number;
        message: string | null;
      };
    }
  ): ProfileResponse {
    const baseResponse: ProfileResponse = {
      id: user.id,
      email: user.email,
      name: user.name,
      nickname: user.nickname,
      avatarUrl: user.avatarUrl,
      rank: user.rank,
      level: user.level,
      experience: user.experience,
      gems: user.gems,
      message: user.message,
      careerIdentity: user.careerIdentity, // この行を追加
      snsLinks: user.snsLinks as Record<string, string> | null,
      isRankingVisible: user.isRankingVisible,
      isProfileVisible: user.isProfileVisible,
      createdAt: user.createdAt,
      badges: user.badges.map((ub: any) => ({
        id: ub.badge.id,
        title: ub.badge.title,
        iconUrl: ub.badge.iconUrl,
        earnedAt: ub.earnedAt
      })),
      tokens: user.tokenTracking ? {
        weeklyTokens: user.tokenTracking.weeklyTokens,
        weeklyLimit: user.tokenTracking.weeklyLimit,
        purchasedTokens: user.tokenTracking.purchasedTokens,
        unprocessedTokens: user.tokenTracking.unprocessedTokens
      } : null,
      expStatus: this.calculateExpStatus(user.experience, user.level)
    };

    if (additional) {
      return {
        ...baseResponse,
        ...additional
      };
    }

    return baseResponse;
  }

  async getProfile(userId: string): Promise<ProfileResponse> {
    try {
      console.log('Getting profile for user:', userId);
      
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: this.USER_SELECT
      });

      if (!user) {
        throw new Error('ユーザーが見つかりません');
      }

      const unprocessedTokens = user.tokenTracking?.unprocessedTokens ?? 0;
      console.log('Current user state:', {
        experience: user.experience,
        level: user.level,
        unprocessedTokens,
        expStatus: this.calculateExpStatus(user.experience, user.level)
      });

      if (unprocessedTokens > 0) {
        const tokenSyncService = new TokenSyncService();
        const result = await tokenSyncService.processExperienceUpdate(userId, unprocessedTokens);
        
        const updatedUser = await prisma.user.findUnique({
          where: { id: userId },
          select: this.USER_SELECT
        });

        if (!updatedUser) {
          throw new Error('更新後のユーザーデータの取得に失敗しました');
        }

        const expGained = updatedUser.experience - user.experience;
        const hasLevelUp = updatedUser.level > user.level;

        console.log('Experience update result:', {
          previousExp: user.experience,
          newExp: updatedUser.experience,
          expGained,
          previousLevel: user.level,
          newLevel: updatedUser.level,
          hasLevelUp,
          expStatus: this.calculateExpStatus(updatedUser.experience, updatedUser.level)
        });

        let levelUpData;
        if (hasLevelUp) {
          const message = await this.levelMessageService.getMessageForLevel(updatedUser.level);
          levelUpData = {
            oldLevel: user.level,
            newLevel: updatedUser.level,
            message: message?.message || null
          };
          console.log('Level up data:', levelUpData);
        }

        return this.formatProfileResponse(updatedUser, {
          expGained: expGained > 0 ? expGained : 0,
          levelUpData
        });
      }

      return this.formatProfileResponse(user, {
        expGained: 0
      });

    } catch (error) {
      console.error('Failed to get profile:', error);
      throw new Error('プロフィールの取得に失敗しました');
    }
  }

  async updateAvatar(userId: string, base64Image: string): Promise<ProfileResponse> {
    try {
      const avatarUrl = await this.uploadImageToCloudinary(base64Image, userId);

      const user = await prisma.user.update({
        where: { id: userId },
        data: { avatarUrl },
        select: this.USER_SELECT
      });

      return this.formatProfileResponse(user);
    } catch (error) {
      console.error('Failed to update avatar:', error);
      throw new Error('アバターの更新に失敗しました');
    }
  }

  async updateProfile(userId: string, params: ProfileUpdateParams): Promise<ProfileResponse> {
    try {
      const user = await prisma.user.update({
        where: { id: userId },
        data: {
          nickname: params.nickname,
          avatarUrl: params.avatarUrl,
          careerIdentity: params.careerIdentity,  // 追加
          message: params.message,
          snsLinks: params.snsLinks as any,
          isRankingVisible: params.isRankingVisible,
          isProfileVisible: params.isProfileVisible
        },
        select: this.USER_SELECT
      });

      return this.formatProfileResponse(user);
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw new Error('プロフィールの更新に失敗しました');
    }
  }
}