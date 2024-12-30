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
