import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class TokenUsageService {
  private static readonly WEEKLY_TOKEN_LIMIT = 100000; // 週間制限の例

  static async checkTokenAvailability(userId: string, requestedTokens: number) {
    const tracking = await prisma.tokenTracking.findUnique({
      where: { userId }
    });

    const weeklyUsage = tracking?.weeklyTokens || 0;
    const weeklyRemaining = this.WEEKLY_TOKEN_LIMIT - weeklyUsage;

    return {
      isAvailable: weeklyRemaining >= requestedTokens,
      weeklyRemaining
    };
  }

  static async updateTokenUsage(userId: string, tokenCount: number) {
    // 実際のMONGOとの連携はここに実装
    // 現在はモックとして実装
    return {
      success: true,
      weeklyUsage: tokenCount
    };
  }

  static async getUserTokenUsage(mongoId: string) {
    // 実際のMONGOとの連携はここに実装
    // 現在はモックとして実装
    return {
      weeklyUsage: 0
    };
  }
}
