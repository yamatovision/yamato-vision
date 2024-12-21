import { z } from 'zod';
import { ApiResponse } from '../../../shared/types/response.types';

export interface MissionReward {
  id?: string;
  missionId: string;
  gems: number;
  exp: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface MissionRewardResponse extends ApiResponse<MissionReward> {}

export const rewardSchema = z.object({
  gems: z.number().min(0, 'ジェムは0以上である必要があります'),
  exp: z.number().min(0, '経験値は0以上である必要があります')
});

export interface RewardSettings {
  gems: number;
  exp: number;
}

export const rewardSettingsSchema = rewardSchema;

export type RewardInput = z.infer<typeof rewardSchema>;
