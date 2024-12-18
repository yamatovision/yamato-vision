import { Request, Response } from 'express';
import { MissionService } from '../services/missionService';
import { RewardService } from '../services/rewardService';
import { missionSchema } from '../types/mission.types';
import { RewardSettings } from '../types/reward.types';

export class MissionController {
  private missionService: MissionService;
  private rewardService: RewardService;

  constructor() {
    this.missionService = new MissionService();
    this.rewardService = new RewardService();
  }

  createMission = async (req: Request, res: Response): Promise<void> => {
    try {
      const missionData = missionSchema.parse(req.body.mission);
      const reward: RewardSettings = {
        gems: req.body.reward.gems,
        exp: req.body.reward.exp
      };

      const mission = await this.missionService.createMission(missionData, reward);
      res.status(201).json({ success: true, data: mission });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : '無効なリクエストデータです'
      });
    }
  };

  getActiveMissions = async (_req: Request, res: Response): Promise<void> => {
    try {
      const missions = await this.missionService.getActiveMissions();
      res.status(200).json({ success: true, data: missions });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: '未完了のミッションの取得に失敗しました'
      });
    }
  };

  getMissionById = async (req: Request, res: Response): Promise<void> => {
    try {
      const mission = await this.missionService.getMissionById(req.params.id);
      if (!mission) {
        res.status(404).json({
          success: false,
          error: 'ミッションが見つかりません'
        });
        return;
      }
      res.status(200).json({ success: true, data: mission });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'ミッションの取得に失敗しました'
      });
    }
  };

  updateMission = async (req: Request, res: Response): Promise<void> => {
    try {
      const missionData = missionSchema.partial().parse(req.body.mission);
      let reward: RewardSettings | undefined;
      
      if (req.body.reward) {
        reward = {
          gems: req.body.reward.gems,
          exp: req.body.reward.exp
        };
      }

      const mission = await this.missionService.updateMission(
        req.params.id,
        missionData,
        reward
      );
      res.status(200).json({ success: true, data: mission });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: 'ミッションの更新に失敗しました'
      });
    }
  };

  deleteMission = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.missionService.deleteMission(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'ミッションの削除に失敗しました'
      });
    }
  };

  checkMissionCompletion = async (req: Request, res: Response): Promise<void> => {
    try {
      const { missionId } = req.params;
      const { userId } = req.params;
      const progressData = req.body;

      const isCompleted = await this.missionService.checkMissionCompletion(
        missionId,
        progressData
      );

      if (isCompleted) {
        await this.rewardService.grantReward(userId, missionId);
      }

      res.status(200).json({ success: true, data: { completed: isCompleted } });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: 'ミッション達成確認に失敗しました'
      });
    }
  };
}
