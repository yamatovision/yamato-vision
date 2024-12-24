// backend/src/users/profile/profileService.ts

import { PrismaClient } from '@prisma/client';
import { ProfileUpdateParams, ProfileResponse } from './profileTypes';
import { v2 as cloudinary } from 'cloudinary';

const prisma = new PrismaClient();

export class ProfileService {
  constructor() {
    // Cloudinaryの設定
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET
    });
  }

  // 新規: Base64画像をアップロードしてURLを取得
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

  // updateAvatarメソッドを修正
  async updateAvatar(userId: string, base64Image: string): Promise<ProfileResponse> {
    try {
      // Cloudinaryにアップロード
      const avatarUrl = await this.uploadImageToCloudinary(base64Image, userId);

      // プロフィール更新
      const user = await prisma.user.update({
        where: { id: userId },
        data: { avatarUrl },
        include: {
          badges: {
            include: {
              badge: true
            }
          },
          tokenTracking: true
        }
      });

      return this.formatProfileResponse(user);
    } catch (error) {
      console.error('Failed to update avatar:', error);
      throw new Error('アバターの更新に失敗しました');
    }
  }

  // ProfileResponseのフォーマット用ヘルパーメソッド
  private formatProfileResponse(user: any): ProfileResponse {
    return {
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
      } : null
    };
  }


    async getProfile(userId: string): Promise<ProfileResponse> {
      try {
        const user = await prisma.user.findUnique({
          where: { id: userId },
          include: {
            badges: {
              include: {
                badge: true
              }
            },
            tokenTracking: true  // トークン情報を含める
          }
        });
  
        if (!user) {
          throw new Error('ユーザーが見つかりません');
        }
  
        return {
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
          snsLinks: user.snsLinks as Record<string, string> | null,
          isRankingVisible: user.isRankingVisible,
          isProfileVisible: user.isProfileVisible,
          createdAt: user.createdAt,
          badges: user.badges.map(ub => ({
            id: ub.badge.id,
            title: ub.badge.title,
            iconUrl: ub.badge.iconUrl,
            earnedAt: ub.earnedAt
          })),
          // 追加: トークン情報
          tokens: user.tokenTracking ? {
            weeklyTokens: user.tokenTracking.weeklyTokens,
            weeklyLimit: user.tokenTracking.weeklyLimit,
            purchasedTokens: user.tokenTracking.purchasedTokens,
            unprocessedTokens: user.tokenTracking.unprocessedTokens
          } : null
        };
      } catch (error) {
        console.error('Failed to get profile:', error);
        throw new Error('プロフィールの取得に失敗しました');
      }
    }
    async updateProfile(userId: string, params: ProfileUpdateParams): Promise<ProfileResponse> {
      try {
        const user = await prisma.user.update({
          where: { id: userId },
          data: {
            nickname: params.nickname,
            avatarUrl: params.avatarUrl,
            message: params.message,
            snsLinks: params.snsLinks as any,
            isRankingVisible: params.isRankingVisible,
            isProfileVisible: params.isProfileVisible
          },
          include: {
            badges: {
              include: {
                badge: true
              }
            },
            tokenTracking: true  // 追加
          }
        });
    
        return {
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
          snsLinks: user.snsLinks as Record<string, string> | null,
          isRankingVisible: user.isRankingVisible,
          isProfileVisible: user.isProfileVisible,
          createdAt: user.createdAt,
          badges: user.badges.map(ub => ({
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
          } : null
        };
      } catch (error) {
        console.error('Failed to update profile:', error);
        throw new Error('プロフィールの更新に失敗しました');
      }
    }
  }