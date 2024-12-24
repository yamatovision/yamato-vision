// backend/src/token/tokenUsageService.ts
import { PrismaClient } from '@prisma/client';
import { LevelMessageService } from '../levelMessages/levelMessageService';

const prisma = new PrismaClient();

export class TokenUsageService {
  private static readonly WEEKLY_TOKEN_LIMIT = 100000;
  private static readonly TOKENS_PER_EXP = 10000;
  private levelMessageService: LevelMessageService;

  constructor() {
    this.levelMessageService = new LevelMessageService();
  }

  async checkTokenAvailability(userId: string, requestedTokens: number) {
    const tracking = await prisma.tokenTracking.findUnique({
      where: { userId }
    });

    const weeklyUsage = tracking?.weeklyTokens || 0;
    const weeklyRemaining = TokenUsageService.WEEKLY_TOKEN_LIMIT - weeklyUsage;

    return {
      isAvailable: weeklyRemaining >= requestedTokens,
      weeklyRemaining
    };
  }

  async updateTokenUsage(userId: string, tokenCount: number) {
    const tracking = await prisma.tokenTracking.findUnique({
      where: { userId }
    });

    if (!tracking) {
      throw new Error('Token tracking not found');
    }

    // 未処理トークンの計算
    const newUnprocessedTokens = (tracking.unprocessedTokens || 0) + tokenCount;
    const expToAdd = Math.floor(newUnprocessedTokens / TokenUsageService.TOKENS_PER_EXP);
    const remainingTokens = newUnprocessedTokens % TokenUsageService.TOKENS_PER_EXP;

    // トランザクションで処理
    const [updatedUser, updatedTracking] = await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({ where: { id: userId } });
      if (!user) throw new Error('User not found');

      const oldLevel = user.level;
      const newExp = user.experience + expToAdd;
      const newLevel = Math.floor(newExp / 1000) + 1;

      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          experience: newExp,
          level: newLevel
        }
      });

      const updatedTracking = await tx.tokenTracking.update({
        where: { userId },
        data: {
          weeklyTokens: tracking.weeklyTokens + tokenCount,
          unprocessedTokens: remainingTokens
        }
      });

      // レベルアップ時のメッセージを取得
      let levelUpMessage = null;
      if (newLevel > oldLevel) {
        const message = await this.levelMessageService.getMessageForLevel(newLevel);
        levelUpMessage = message?.message;
      }

      return [updatedUser, updatedTracking, levelUpMessage];
    });

    return {
      success: true,
      weeklyUsage: updatedTracking.weeklyTokens,
      experienceGained: expToAdd,
      currentLevel: updatedUser.level,
      levelUpMessage: levelUpMessage
    };
  }

  async getUserTokenUsage(userId: string) {
    const tracking = await prisma.tokenTracking.findUnique({
      where: { userId }
    });

    return {
      weeklyUsage: tracking?.weeklyTokens || 0,
      weeklyLimit: TokenUsageService.WEEKLY_TOKEN_LIMIT,
      unprocessedTokens: tracking?.unprocessedTokens || 0
    };
  }
}