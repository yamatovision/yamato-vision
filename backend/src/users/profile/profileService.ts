import { PrismaClient } from '@prisma/client';
import { ProfileUpdateParams, ProfileResponse } from './profileTypes';

const prisma = new PrismaClient();

export class ProfileService {
  async getProfile(userId: string): Promise<ProfileResponse> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          badges: {
            include: {
              badge: true
            }
          }
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
        }))
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
          }
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
        }))
      };
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw new Error('プロフィールの更新に失敗しました');
    }
  }

  async updateAvatar(userId: string, avatarUrl: string): Promise<ProfileResponse> {
    try {
      const user = await prisma.user.update({
        where: { id: userId },
        data: {
          avatarUrl
        },
        include: {
          badges: {
            include: {
              badge: true
            }
          }
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
        }))
      };
    } catch (error) {
      console.error('Failed to update avatar:', error);
      throw new Error('アバターの更新に失敗しました');
    }
  }
}
