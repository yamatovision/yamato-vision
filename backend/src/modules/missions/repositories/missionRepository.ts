import { PrismaClient, Prisma } from '@prisma/client';
import { Mission, MissionType, MissionCondition } from '../types/mission.types';
import { MissionReward } from '../types/reward.types';

export class MissionRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  private transformPrismaData(data: any): Mission {
    return {
      id: data.id,
      title: data.title,
      description: data.description,
      missionType: data.missionType as MissionType,
      duration: data.duration ?? undefined,
      conditions: JSON.parse(data.conditions?.toString() ?? '[]') as MissionCondition[],
      isActive: data.isActive,
      startDate: data.startDate,
      endDate: data.endDate ?? undefined,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      reward: data.reward ? {
        id: data.reward.id,
        missionId: data.reward.missionId,
        gems: data.reward.gems,
        exp: data.reward.exp,
        createdAt: data.reward.createdAt,
        updatedAt: data.reward.updatedAt
      } : undefined
    };
  }

  async create(mission: Omit<Mission, 'id' | 'createdAt' | 'updatedAt'>): Promise<Mission> {
    try {
      const prismaData: Prisma.MissionCreateInput = {
        title: mission.title,
        description: mission.description,
        missionType: mission.missionType,
        duration: mission.duration,
        conditions: JSON.stringify(mission.conditions) as Prisma.InputJsonValue,
        isActive: mission.isActive,
        startDate: mission.startDate,
        endDate: mission.endDate
      };

      const created = await this.prisma.mission.create({
        data: prismaData,
        include: {
          reward: true
        }
      });

      return this.transformPrismaData(created);
    } catch (error) {
      console.error('Mission creation error:', error);
      throw new Error('ミッションの作成に失敗しました');
    }
  }

  async findById(id: string): Promise<Mission | null> {
    try {
      const mission = await this.prisma.mission.findUnique({
        where: { id },
        include: {
          reward: true
        }
      });

      return mission ? this.transformPrismaData(mission) : null;
    } catch (error) {
      console.error('Mission fetch error:', error);
      throw new Error('ミッションの取得に失敗しました');
    }
  }

  async findActive(): Promise<Mission[]> {
    try {
      const missions = await this.prisma.mission.findMany({
        where: {
          isActive: true,
          startDate: { lte: new Date() },
          OR: [
            { endDate: null },
            { endDate: { gte: new Date() } }
          ]
        },
        include: {
          reward: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      return missions.map(mission => this.transformPrismaData(mission));
    } catch (error) {
      console.error('Active missions fetch error:', error);
      throw new Error('アクティブなミッションの取得に失敗しました');
    }
  }

  async update(id: string, missionData: Partial<Mission>): Promise<Mission> {
    try {
      const updateData: Prisma.MissionUpdateInput = {};
      
      if (missionData.title) updateData.title = missionData.title;
      if (missionData.description) updateData.description = missionData.description;
      if (missionData.missionType) updateData.missionType = missionData.missionType;
      if (missionData.duration !== undefined) updateData.duration = missionData.duration;
      if (missionData.conditions) {
        updateData.conditions = JSON.stringify(missionData.conditions) as Prisma.InputJsonValue;
      }
      if (missionData.isActive !== undefined) updateData.isActive = missionData.isActive;
      if (missionData.startDate) updateData.startDate = missionData.startDate;
      if (missionData.endDate !== undefined) updateData.endDate = missionData.endDate;

      const updated = await this.prisma.mission.update({
        where: { id },
        data: updateData,
        include: {
          reward: true
        }
      });

      return this.transformPrismaData(updated);
    } catch (error) {
      console.error('Mission update error:', error);
      throw new Error('ミッションの更新に失敗しました');
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.prisma.mission.delete({
        where: { id }
      });
    } catch (error) {
      console.error('Mission deletion error:', error);
      throw new Error('ミッションの削除に失敗しました');
    }
  }

  async createReward(missionId: string, reward: Omit<MissionReward, 'id' | 'missionId' | 'createdAt' | 'updatedAt'>): Promise<MissionReward> {
    try {
      return await this.prisma.missionReward.create({
        data: {
          missionId,
          gems: reward.gems,
          exp: reward.exp
        }
      });
    } catch (error) {
      console.error('Reward creation error:', error);
      throw new Error('報酬の作成に失敗しました');
    }
  }

  async updateReward(missionId: string, reward: Partial<MissionReward>): Promise<MissionReward> {
    try {
      const updateData: Prisma.MissionRewardUpdateInput = {};
      if (reward.gems !== undefined) updateData.gems = reward.gems;
      if (reward.exp !== undefined) updateData.exp = reward.exp;

      return await this.prisma.missionReward.update({
        where: { missionId },
        data: updateData
      });
    } catch (error) {
      console.error('Reward update error:', error);
      throw new Error('報酬の更新に失敗しました');
    }
  }
}