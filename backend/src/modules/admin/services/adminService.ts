import { PrismaClient } from '@prisma/client';
import { MongoSyncService } from './mongoSyncService';
import { UserDetails } from '../../../shared/types/admin.types';

const prisma = new PrismaClient();

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
      console.error('Error in getUsers:', error);
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
      console.error('Error in getUserDetails:', error);
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
      console.error('Error in assignBadgeToUser:', error);
      throw error;
    }
  }

  // ユーザーのニックネームを更新
  static async updateUserNickname(userId: string, nickname: string) {
    try {
      return await prisma.user.update({
        where: { id: userId },
        data: { nickname }
      });
    } catch (error) {
      console.error('Error in updateUserNickname:', error);
      throw error;
    }
  }

  // ユーザーの表示設定を更新
  static async updateUserVisibility(
    userId: string, 
    isProfileVisible: boolean, 
    isRankingVisible: boolean
  ) {
    try {
      return await prisma.user.update({
        where: { id: userId },
        data: {
          isProfileVisible,
          isRankingVisible
        }
      });
    } catch (error) {
      console.error('Error in updateUserVisibility:', error);
      throw error;
    }
  }
}
