import { PrismaClient } from '@prisma/client';
import { HomePageData } from './homeTypes';

const prisma = new PrismaClient();

export class HomeService {
  async getHomePageData(userId: string): Promise<HomePageData> {
    try {
      const [user, currentCourse, weeklyRanking] = await Promise.all([
        prisma.user.findUnique({
          where: { id: userId },
          include: {
            tokenTracking: true,
          },
        }),

        prisma.userCourse.findFirst({
          where: {
            userId,
            isActive: true,
          },
          include: {
            course: {
              include: {
                chapters: {
                  select: {
                    id: true,
                    orderIndex: true,
                    title: true,
                  },
                  orderBy: {
                    orderIndex: 'asc',
                  },
                },
              },
            },
          },
          orderBy: {
            startedAt: 'desc',
          },
        }),

        prisma.user.findMany({
          take: 3,
          orderBy: {
            experience: 'desc',
          },
          select: {
            id: true,
            name: true,
            nickname: true,
            avatarUrl: true,
            experience: true,
            rank: true,
          },
        }),
      ]);

      if (!user) {
        throw new Error('User not found');
      }

      return {
        profile: {
          id: user.id,
          name: user.name,
          nickname: user.nickname,
          rank: user.rank,
          level: user.level,
          experience: user.experience,
          gems: user.gems,
          avatarUrl: user.avatarUrl,
          message: user.message,
          tokens: user.tokenTracking ? {
            weeklyTokens: user.tokenTracking.weeklyTokens,
            weeklyLimit: user.tokenTracking.weeklyLimit,
            purchasedTokens: user.tokenTracking.purchasedTokens,
            unprocessedTokens: user.tokenTracking.unprocessedTokens,
          } : undefined,
        },
        currentCourse: currentCourse ? {
          id: currentCourse.id,
          courseId: currentCourse.courseId,
          title: currentCourse.course.title,
          progress: currentCourse.progress,
          startedAt: currentCourse.startedAt,
          timeLimit: currentCourse.course.timeLimit,
          chapters: currentCourse.course.chapters,
        } : undefined,
        weeklyRanking,
        notifications: [],  // 空配列を返す
        events: [],        // 空配列を返す
      };
    } catch (error) {
      console.error('Error in getHomePageData:', error);
      throw error;
    }
  }
}

export const homeService = new HomeService();