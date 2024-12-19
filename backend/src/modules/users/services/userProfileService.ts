import { PrismaClient } from '@prisma/client';
import { ProfileUpdateData, ProfileResponse, ProfileServiceInterface } from '../types/profile.types';
import { MongoSyncService } from '../../admin/services/mongoSyncService';
import { createLogger } from '../../../config/logger';

const prisma = new PrismaClient();
const logger = createLogger('UserProfileService');

export class UserProfileService implements ProfileServiceInterface {
  async getProfile(userId: string): Promise<ProfileResponse> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        throw new Error('User not found');
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        nickname: user.nickname,
        level: user.level,
        experience: user.experience,
        rank: user.rank,
        gems: user.gems,
        message: user.message,
        snsLinks: user.snsLinks,
        isRankingVisible: user.isRankingVisible,
        isProfileVisible: user.isProfileVisible,
        status: user.status
      };
    } catch (error) {
      logger.error('Error getting user profile:', error);
      throw error;
    }
  }

  async updateProfile(userId: string, data: ProfileUpdateData): Promise<ProfileResponse> {
    try {
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          nickname: data.nickname,
          message: data.message,
          snsLinks: data.snsLinks,
          isRankingVisible: data.isRankingVisible,
          isProfileVisible: data.isProfileVisible
        }
      });

      return {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        nickname: updatedUser.nickname,
        level: updatedUser.level,
        experience: updatedUser.experience,
        rank: updatedUser.rank,
        gems: updatedUser.gems,
        message: updatedUser.message,
        snsLinks: updatedUser.snsLinks,
        isRankingVisible: updatedUser.isRankingVisible,
        isProfileVisible: updatedUser.isProfileVisible,
        status: updatedUser.status
      };
    } catch (error) {
      logger.error('Error updating user profile:', error);
      throw error;
    }
  }

  async syncWithMongo(userId: string): Promise<void> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true }
      });

      if (!user) {
        throw new Error('User not found');
      }

      // MongoDBとの同期
      await MongoSyncService.syncUserInfo(user.email);
      await MongoSyncService.syncTokenInfo(user.email);
    } catch (error) {
      logger.error('Error syncing with MongoDB:', error);
      throw error;
    }
  }
}

export const userProfileService = new UserProfileService();
