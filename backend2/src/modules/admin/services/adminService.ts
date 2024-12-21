import { PrismaClient, UserStatus } from '@prisma/client';
import { MongoSyncService } from './mongoSyncService';
import { UserDetails } from '../../../shared/types/admin.types';
import { createLogger } from '../../../config/logger';

const prisma = new PrismaClient();
const logger = createLogger('AdminService');

export class AdminService {
  // ユーザー一覧を取得（ページネーション対応）
  static async getUsers(page: number = 1, limit: number = 10) {
    try {
      const skip = (page - 1) * limit;
      
      const [users, total] = await Promise.all([
        prisma.user.findMany({
          skip,
          take: limit,
          include: {
            badges: {
              include: {
                badge: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }),
        prisma.user.count()
      ]);

      // MongoDBからの追加データ取得
      const enrichedUsers = await Promise.all(
        users.map(async (user) => {
          const mongoData = await MongoSyncService.getUserInfo(user.email);
          return {
            ...user,
            mongoData: mongoData || undefined
          };
        })
      );

      return {
        users: enrichedUsers,
        total,
        pages: Math.ceil(total / limit),
        currentPage: page
      };
    } catch (error) {
      logger.error('Error in getUsers:', error);
      throw error;
    }
  }

  // ユーザー詳細を取得
  static async getUserDetails(userId: string): Promise<UserDetails> {
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

      const mongoData = await MongoSyncService.getUserInfo(user.email);

      return {
        ...user,
        mongoData: mongoData || undefined
      };
    } catch (error) {
      logger.error('Error in getUserDetails:', error);
      throw error;
    }
  }

  // バッジの付与
  static async assignBadgeToUser(userId: string, badgeId: string) {
    try {
      return await prisma.userBadge.create({
        data: {
          userId,
          badgeId
        },
        include: {
          badge: true,
          user: true
        }
      });
    } catch (error) {
      logger.error('Error in assignBadgeToUser:', error);
      throw error;
    }
  }

  // ジェム付与
  static async grantGemsToUser(userId: string, amount: number) {
    try {
      return await prisma.user.update({
        where: { id: userId },
        data: {
          gems: {
            increment: amount
          }
        }
      });
    } catch (error) {
      logger.error('Error in grantGemsToUser:', error);
      throw error;
    }
  }

  // ペナルティステータス更新
  static async updateUserPenaltyStatus(userId: string, isPenalty: boolean) {
    try {
      return await prisma.user.update({
        where: { id: userId },
        data: {
          status: isPenalty ? UserStatus.PENALTY : UserStatus.ACTIVE
        }
      });
    } catch (error) {
      logger.error('Error in updateUserPenaltyStatus:', error);
      throw error;
    }
  }

  // バッジ一覧取得
  static async getAllBadges() {
    try {
      return await prisma.badge.findMany({
        orderBy: {
          createdAt: 'desc'
        }
      });
    } catch (error) {
      logger.error('Error in getAllBadges:', error);
      throw error;
    }
  }
}

export default AdminService;
