import { PrismaClient } from '@prisma/client';
import { LevelMessageService } from '../levelMessages/levelMessageService';
import {
  ExperienceGainEvent,
  ExperienceCalcResult,
  ExperienceServiceResult,
  ExperienceStatusResponse
} from './experienceTypes';

export class ExperienceService {
  private static readonly EXP_PER_LEVEL = 1000;
  private prisma: PrismaClient;
  private levelMessageService: LevelMessageService;

  constructor() {
    this.prisma = new PrismaClient();
    this.levelMessageService = new LevelMessageService();
  }

  // experienceService.ts に追加するメソッド
  async addSubmissionExperience(params: {
    userId: string;
    score: number;
    previousBestScore?: number | null;
    chapterId: string;
  }): Promise<ExperienceServiceResult> {
    try {
      // スコア更新判定
      if (params.previousBestScore !== undefined && 
          params.previousBestScore !== null && 
          params.score <= params.previousBestScore) {
        
        // ユーザーの現在の状態を取得
        const user = await this.prisma.user.findUnique({
          where: { id: params.userId }
        });
  
        if (!user) {
          throw new Error('User not found');
        }
  
        // スコア更新なしの場合でも、現在の状態を含めた完全なレスポンスを返す
        return {
          success: true,
          data: {
            oldExp: user.experience,
            newExp: user.experience,
            oldLevel: user.level,
            newLevel: user.level,
            gainedExp: 0,
            isLevelUp: false,
            levelUpMessage: null
          }
        };
      }

    // 経験値計算（パーフェクトボーナス含む）
    const experienceToAdd = params.score === 100 
      ? params.score * 10  // パーフェクトスコアは10倍
      : params.score;      // 通常スコアは等倍

    console.log(`【経験値付与】チャプター完了: +${experienceToAdd}EXP（スコア: ${params.score}点）`);

    // 経験値の付与
    const result = await this.addExperience({
      userId: params.userId,
      amount: experienceToAdd,
      source: 'submission',
      metadata: {
        chapterId: params.chapterId,
        score: params.score
      }
    });

    if (result.data?.isLevelUp) {
      console.log(`【レベルアップ】 ${result.data.oldLevel} → ${result.data.newLevel}`);
    }

    return result;

  } catch (error) {
    console.error('経験値付与エラー:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

  async addExperience(event: ExperienceGainEvent): Promise<ExperienceServiceResult> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: event.userId }
      });

      if (!user) {
        throw new Error('User not found');
      }

      const oldLevel = user.level;
      const newExp = user.experience + event.amount;
      const newLevel = Math.floor(newExp / ExperienceService.EXP_PER_LEVEL) + 1;

      let levelUpMessage: string | null = null;
      if (newLevel > oldLevel) {
        const message = await this.levelMessageService.getMessageForLevel(newLevel);
        levelUpMessage = message?.message || null;
      }

      const updatedUser = await this.prisma.user.update({
        where: { id: event.userId },
        data: {
          experience: newExp,
          level: newLevel
        }
      });

      const result: ExperienceCalcResult = {
        oldExp: user.experience,
        newExp: updatedUser.experience,
        oldLevel,
        newLevel,
        gainedExp: event.amount,
        isLevelUp: newLevel > oldLevel,
        levelUpMessage
      };

      return {
        success: true,
        data: result
      };

    } catch (error) {
      console.error('Experience addition failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async getExperienceStatus(userId: string): Promise<ExperienceStatusResponse> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new Error('User not found');
    }

    const nextLevelExp = user.level * ExperienceService.EXP_PER_LEVEL;
    const currentLevelExp = (user.level - 1) * ExperienceService.EXP_PER_LEVEL;
    const progress = ((user.experience - currentLevelExp) / 
                     (nextLevelExp - currentLevelExp)) * 100;

    return {
      currentExp: user.experience,
      currentLevel: user.level,
      nextLevelExp,
      progress
    };
  }

  async calculateExperienceForTokens(tokenAmount: number): Promise<number> {
    return Math.floor(tokenAmount / 10000); // 10000トークンで1経験値
  }
}
