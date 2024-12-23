import { PrismaClient } from '@prisma/client';
import { TokenUsageService } from './tokenUsageService';

const prisma = new PrismaClient();

export class TokenProcessingService {
  private static readonly TOKENS_PER_EXP = 10000;
  private static readonly EXP_PER_LEVEL = 500;

  static async processTokenConsumption(userId: string, tokenCount: number) {
    // 1. トークン使用可能性チェック
    const availability = await TokenUsageService.checkTokenAvailability(userId, tokenCount);
    if (!availability.isAvailable) {
      throw new Error('Insufficient tokens');
    }

    // 2. MONGOでのトークン消費処理
    const mongoUpdate = await TokenUsageService.updateTokenUsage(userId, tokenCount);

    // 3. Prismaの更新
    const tracking = await this.updatePrismaTracking(userId, tokenCount);

    // 4. 経験値の計算と更新
    await this.processExperiencePoints(userId);

    return {
      mongoUpdate,
      tracking,
      weeklyRemaining: availability.weeklyRemaining - tokenCount
    };
  }

  private static async updatePrismaTracking(userId: string, tokenCount: number) {
    return await prisma.tokenTracking.upsert({
      where: { userId },
      create: {
        userId,
        unprocessedTokens: tokenCount,
        weeklyTokens: 0
      },
      update: {
        unprocessedTokens: { increment: tokenCount },
        lastSyncedAt: new Date()
      }
    });
  }

  private static async processExperiencePoints(userId: string) {
    const tracking = await prisma.tokenTracking.findUnique({
      where: { userId }
    });

    if (!tracking) return;

    const expPoints = Math.floor(tracking.unprocessedTokens / this.TOKENS_PER_EXP);
    const remainingTokens = tracking.unprocessedTokens % this.TOKENS_PER_EXP;

    if (expPoints > 0) {
      // トランザクションで経験値更新
      await prisma.$transaction(async (tx) => {
        // 経験値とレベルの更新
        const user = await tx.user.update({
          where: { id: userId },
          data: {
            experience: { increment: expPoints },
            level: {
              set: Math.floor((tracking.unprocessedTokens / this.TOKENS_PER_EXP) / this.EXP_PER_LEVEL) + 1
            }
          }
        });

        // 未処理トークンの更新
        await tx.tokenTracking.update({
          where: { userId },
          data: {
            unprocessedTokens: remainingTokens
          }
        });

        return user;
      });
    }
  }

  // 定期同期処理
  static async performPeriodicSync() {
    const users = await prisma.user.findMany({
      select: { id: true, mongoId: true }
    });

    for (const user of users) {
      if (!user.mongoId) continue;

      try {
        const mongoUsage = await TokenUsageService.getUserTokenUsage(user.mongoId);
        await this.syncUserTokens(user.id, mongoUsage);
      } catch (error) {
        console.error(`Sync failed for user ${user.id}:`, error);
      }
    }
  }

  // 個別ユーザーの同期
  private static async syncUserTokens(userId: string, mongoUsage: any) {
    await prisma.tokenTracking.upsert({
      where: { userId },
      create: {
        userId,
        weeklyTokens: mongoUsage.weeklyUsage,
        lastSyncedAt: new Date()
      },
      update: {
        weeklyTokens: mongoUsage.weeklyUsage,
        lastSyncedAt: new Date()
      }
    });
  }
}
