import { z } from 'zod';
import { ApiResponse } from '../../../shared/types/response.types';
import { MissionReward } from './reward.types';

export const MissionTypeEnum = {
  DAILY: 'DAILY',
  MONTHLY: 'MONTHLY',
  ACHIEVEMENT: 'ACHIEVEMENT',
} as const;

export type MissionType = typeof MissionTypeEnum[keyof typeof MissionTypeEnum];

export const MissionConditionTypeEnum = {
  REPORT: 'REPORT',
  COMMENT: 'COMMENT',
  LIKE: 'LIKE',
  TASK_COMPLETE: 'TASK_COMPLETE',
  CUSTOM: 'CUSTOM',
} as const;

export type MissionConditionType = typeof MissionConditionTypeEnum[keyof typeof MissionConditionTypeEnum];

export interface MissionCondition {
  type: MissionConditionType;
  target: number;
  requirement: string;
}

export interface Mission {
  id?: string;
  title: string;
  description: string;
  missionType: MissionType;
  duration?: number;
  conditions: MissionCondition[];
  isActive: boolean;
  startDate: Date;
  endDate?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  reward?: MissionReward;  // 明示的にMissionRewardを含める
}

export interface MissionResponse extends ApiResponse<Mission> {}
export interface MissionsResponse extends ApiResponse<Mission[]> {}

export const missionSchema = z.object({
  title: z.string().min(1, '題名は必須です'),
  description: z.string().min(1, '説明は必須です'),
  missionType: z.enum([
    MissionTypeEnum.DAILY,
    MissionTypeEnum.MONTHLY,
    MissionTypeEnum.ACHIEVEMENT
  ] as const),
  duration: z.number().optional(),
  conditions: z.array(z.object({
    type: z.enum([
      MissionConditionTypeEnum.REPORT,
      MissionConditionTypeEnum.COMMENT,
      MissionConditionTypeEnum.LIKE,
      MissionConditionTypeEnum.TASK_COMPLETE,
      MissionConditionTypeEnum.CUSTOM
    ] as const),
    target: z.number(),
    requirement: z.string()
  })),
  isActive: z.boolean().default(true),
  startDate: z.date(),
  endDate: z.date().optional()
});
