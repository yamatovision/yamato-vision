import { PrismaClient } from '@prisma/client';
import { ProfileUpdateData, ProfileResponse, ProfileServiceInterface, SnsLink } from '../types/profile.types';
import { createLogger } from '../../../config/logger';
import { uploadImage } from '../../../config/cloudinary';

const prisma = new PrismaClient();
const logger = createLogger('UserProfileService');

export class UserProfileService implements ProfileServiceInterface {
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
        snsLinks: user.snsLinks ? (user.snsLinks as any as SnsLink[]) : null,
        avatarUrl: user.avatarUrl,
        badges: user.badges.map(ub => ({
          id: ub.badge.id,
          title: ub.badge.title,
          iconUrl: ub.badge.iconUrl
        })),
        status: user.status,
        mongoId: user.mongoId
      };
    } catch (error) {
      logger.error('Error getting user profile:', error);
      throw error;
    }
  }

  async updateProfile(
    userId: string,
    data: ProfileUpdateData,
    avatarFile?: Express.Multer.File
  ): Promise<ProfileResponse> {
    try {
      let avatarUrl;
      if (avatarFile) {
        avatarUrl = await uploadImage(avatarFile);
      }

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          nickname: data.nickname,
          message: data.message,
          snsLinks: data.snsLinks ? data.snsLinks as any : undefined,
          ...(avatarUrl && { avatarUrl })
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
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        nickname: updatedUser.nickname,
        level: updatedUser.level,
        experience: updatedUser.experience,
        rank: updatedUser.rank,
        gems: updatedUser.gems,
        message: updatedUser.message,
        snsLinks: updatedUser.snsLinks ? (updatedUser.snsLinks as any as SnsLink[]) : null,
        avatarUrl: updatedUser.avatarUrl,
        badges: updatedUser.badges.map(ub => ({
          id: ub.badge.id,
          title: ub.badge.title,
          iconUrl: ub.badge.iconUrl
        })),
        status: updatedUser.status,
        mongoId: updatedUser.mongoId
      };
    } catch (error) {
      logger.error('Error updating user profile:', error);
      throw error;
    }
  }
}

export const userProfileService = new UserProfileService();
