import { MissionService } from './missionService';

export class RewardService {
  private missionService: MissionService;

  constructor() {
    this.missionService = new MissionService();
  }

  async grantReward(userId: string, missionId: string): Promise<void> {
    try {
      const mission = await this.missionService.getMissionById(missionId);
      
      if (!mission) {
        throw new Error('ミッションが見つかりません');
      }

      if (!mission.reward) {
        throw new Error('報酬が設定されていません');
      }

      // TODO: 実際のユーザーサービスと連携
      await Promise.all([
        this.updateUserGems(userId, mission.reward.gems),
        this.updateUserExp(userId, mission.reward.exp)
      ]);
    } catch (error) {
      throw new Error(`報酬付与に失敗しました: ${error.message}`);
    }
  }

  private async updateUserGems(userId: string, amount: number): Promise<void> {
    // TODO: ユーザーサービスとの連携実装
    console.log(`ユーザー ${userId} に ${amount} ジェムを付与`);
  }

  private async updateUserExp(userId: string, amount: number): Promise<void> {
    // TODO: ユーザーサービスとの連携実装
    console.log(`ユーザー ${userId} に ${amount} 経験値を付与`);
  }
}
