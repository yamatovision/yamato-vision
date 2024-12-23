import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class TokenUsageService {
  private static readonly WEEKLY_TOKEN_LIMIT = 100000;

  static async checkTokenAvailability(userId: string, requestedTokens: number) {
    // 実際のユーザーのトークン使用状況を確認
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static async updateTokenUsage(_userId: string, tokenCount: number) {
    // 実装予定: MONGOとの連携
    return {
      success: true,
      weeklyUsage: tokenCount
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static async getUserTokenUsage(_mongoId: string) {
    // 実装予定: MONGOとの連携
    return {
      weeklyUsage: 0
    };
  }
}
