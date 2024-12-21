import { MissionRepository } from '../repositories/missionRepository';
import { Mission } from '../types/mission.types';
import { RewardSettings } from '../types/reward.types';

export class MissionService {
  private repository: MissionRepository;

  constructor() {
    this.repository = new MissionRepository();
  }

  async createMission(missionData: Omit<Mission, 'id'>, reward: RewardSettings): Promise<Mission> {
    try {
      const mission = await this.repository.create(missionData);
      if (mission.id) {
        await this.repository.createReward(mission.id, reward);
        return await this.repository.findById(mission.id) as Mission;
      }
      throw new Error('ミッションの作成に失敗しました');
    } catch (error) {
      throw new Error(`ミッションの作成に失敗しました: ${error.message}`);
    }
  }

  async getActiveMissions(): Promise<Mission[]> {
    try {
      return await this.repository.findActive();
    } catch (error) {
      throw new Error('アクティブなミッションの取得に失敗しました');
    }
  }

  async getMissionById(id: string): Promise<Mission | null> {
    try {
      return await this.repository.findById(id);
    } catch (error) {
      throw new Error(`ミッションの取得に失敗しました: ${error.message}`);
    }
  }

  async updateMission(
    id: string,
    missionData: Partial<Mission>,
    reward?: RewardSettings
  ): Promise<Mission> {
    try {
      const updated = await this.repository.update(id, missionData);
      if (reward && updated.id) {
        await this.repository.createReward(updated.id, reward);
      }
      return updated;
    } catch (error) {
      throw new Error(`ミッションの更新に失敗しました: ${error.message}`);
    }
  }

  async deleteMission(id: string): Promise<void> {
    try {
      await this.repository.delete(id);
    } catch (error) {
      throw new Error(`ミッションの削除に失敗しました: ${error.message}`);
    }
  }

  async checkMissionCompletion(
    missionId: string,
    progressData: Record<string, any>
  ): Promise<boolean> {
    try {
      const mission = await this.getMissionById(missionId);
      if (!mission) {
        return false;
      }
      return this.validateMissionCompletion(mission, progressData);
    } catch (error) {
      throw new Error(`ミッション達成確認に失敗しました: ${error.message}`);
    }
  }

  private validateMissionCompletion(mission: Mission, progressData: Record<string, any>): boolean {
    return mission.conditions.every(condition => {
      const progress = progressData[condition.type] || 0;
      return progress >= condition.target;
    });
  }
}
