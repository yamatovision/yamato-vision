import { PrismaClient, UserStatus, Prisma } from '@prisma/client';
import { AdminUserSearchParams, AdminUserUpdateParams, AdminUserData, AdminUserListResponse } from './adminUserTypes';

const prisma = new PrismaClient();

export class AdminUserService {
  async getUsers(params: AdminUserSearchParams): Promise<AdminUserListResponse> {
    try {
      const where: Prisma.UserWhereInput = {};
      
      if (params.search) {
        where.OR = [
          {
            name: {
              contains: params.search,
              mode: Prisma.QueryMode.insensitive
            }
          },
          {
            email: {
              contains: params.search,
              mode: Prisma.QueryMode.insensitive
            }
          }
        ];
      }

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          include: {
            badges: {
              include: {
                badge: true
              }
            }
          },
          orderBy: params.sortBy ? {
            [params.sortBy]: params.sortOrder || 'asc'
          } : undefined,
          skip: params.page ? (params.page - 1) * (params.limit || 10) : 0,
          take: params.limit || 10
        }),
        prisma.user.count({ where })
      ]);

      const limit = params.limit || 10;
      const totalPages = Math.ceil(total / limit);

      return {
        users: users.map(user => ({
          id: user.id,
          email: user.email,
          name: user.name,
          rank: user.rank,
          level: user.level,
          experience: user.experience,
          gems: user.gems,
          status: user.status,
          badges: user.badges.map(userBadge => ({
            id: userBadge.badge.id,
            title: userBadge.badge.title,
            iconUrl: userBadge.badge.iconUrl,
            earnedAt: userBadge.earnedAt
          }))
        })),
        pagination: {
          total,
          totalPages,
          currentPage: params.page || 1,
          limit
        }
      };
    } catch (error) {
      console.error('Failed to get users:', error);
      throw new Error('ユーザー一覧の取得に失敗しました');
    }
  }

  async updateUser(userId: string, params: AdminUserUpdateParams): Promise<AdminUserData> {
    try {
      const updates: Prisma.UserUpdateInput = {};
      
      if (params.status) {
        updates.status = params.status;
      }
      
      if (typeof params.gems === 'number') {
        updates.gems = {
          increment: params.gems
        };
      }

      const user = await prisma.user.update({
        where: { id: userId },
        data: updates,
        include: {
          badges: {
            include: {
              badge: true
            }
          }
        }
      });

      if (params.badgeIds?.length) {
        await prisma.userBadge.createMany({
          data: params.badgeIds.map(badgeId => ({
            userId,
            badgeId
          })),
          skipDuplicates: true
        });
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        rank: user.rank,
        level: user.level,
        experience: user.experience,
        gems: user.gems,
        status: user.status,
        badges: user.badges.map(userBadge => ({
          id: userBadge.badge.id,
          title: userBadge.badge.title,
          iconUrl: userBadge.badge.iconUrl,
          earnedAt: userBadge.earnedAt
        }))
      };
    } catch (error) {
      console.error('Failed to update user:', error);
      throw new Error('ユーザー情報の更新に失敗しました');
    }
  }

  async updateUserStatus(userId: string, status: UserStatus): Promise<AdminUserData> {
    try {
      const user = await prisma.user.update({
        where: { id: userId },
        data: { status },
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
        rank: user.rank,
        level: user.level,
        experience: user.experience,
        gems: user.gems,
        status: user.status,
        badges: user.badges.map(userBadge => ({
          id: userBadge.badge.id,
          title: userBadge.badge.title,
          iconUrl: userBadge.badge.iconUrl,
          earnedAt: userBadge.earnedAt
        }))
      };
    } catch (error) {
      console.error('Failed to update user status:', error);
      throw new Error('ユーザーステータスの更新に失敗しました');
    }
  }
}
