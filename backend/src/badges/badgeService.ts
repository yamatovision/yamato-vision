import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class AdminBadgeService {
  async getBadges() {
    try {
      const badges = await prisma.badge.findMany({
        orderBy: {
          title: 'asc'
        }
      });

      return badges.map(badge => ({
        id: badge.id,
        title: badge.title,
        description: badge.description,
        iconUrl: badge.iconUrl,
        condition: badge.condition,
        createdAt: badge.createdAt
      }));
    } catch (error) {
      console.error('Failed to get badges:', error);
      throw new Error('バッジ一覧の取得に失敗しました');
    }
  }
}
