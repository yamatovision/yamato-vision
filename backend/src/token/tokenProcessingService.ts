import { PrismaClient } from '@prisma/client';
import { TokenUsageService } from './tokenUsageService';

const prisma = new PrismaClient();
const tokenUsageService = new TokenUsageService(); // インスタンスを1つ作成

export class TokenProcessingService {
  private static readonly EXP_PER_LEVEL = 500;        // 500経験値で1レベルアップ
  private static readonly EXP_THRESHOLD = 30;          // NEW: 30経験値で自動変換
  public static readonly TOKEN_THRESHOLD = 300000;
  public static readonly TOKENS_PER_EXP = 10000;
  
  private static readonly tokenService = new TokenUsageService();

  static async processTokenConsumption(userId: string, tokenCount: number) {
    // 1. トークン使用可能性チェック
    const availability = await this.tokenService.checkTokenAvailability(userId, tokenCount);
    if (!availability.isAvailable) {
      throw new Error('Insufficient tokens');
    }

    // 2. MONGOでのトークン消費処理
    const mongoUpdate = await this.tokenService.updateTokenUsage(userId, tokenCount);

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

  public static async processExperiencePoints(userId: string) {
    const tracking = await prisma.tokenTracking.findUnique({
      where: { userId }
    });
  
    if (!tracking) return;
  
    // 閾値チェックを追加
    if (tracking.unprocessedTokens < this.TOKEN_THRESHOLD) {
      return;  // 30経験値に満たない場合は変換しない
    }
  
    const expPoints = Math.floor(tracking.unprocessedTokens / this.TOKENS_PER_EXP);
    const remainingTokens = tracking.unprocessedTokens % this.TOKENS_PER_EXP;
  
    // 以下は既存の処理を維持
    if (expPoints > 0) {
      await prisma.$transaction(async (tx) => {
        const user = await tx.user.update({
          where: { id: userId },
          data: {
            experience: { increment: expPoints },
            level: {
              set: Math.floor((tracking.unprocessedTokens / this.TOKENS_PER_EXP) / this.EXP_PER_LEVEL) + 1
            }
          }
        });
  
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
        const mongoUsage = await this.tokenService.getUserTokenUsage(user.mongoId);
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