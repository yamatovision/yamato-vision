import { Task as PrismaTask } from '@prisma/client';

export interface TaskWithSubmissions extends PrismaTask {
  submissions?: {
    id: string;
    content: string;
    points?: number;
    submittedAt: Date;
  }[];
}

export interface CreateTaskDTO {
  title: string;          // 追加：必須フィールド
  description: string;
  systemMessage: string;  // AI採点用の指示
  referenceText?: string; // 採点の参考テキスト
  maxPoints: number;
}

export interface UpdateTaskDTO extends Partial<CreateTaskDTO> {
  isVisible?: boolean;
}

export interface TaskEvaluationResult {
  points: number;
  feedback: string;
  detail?: {
    reasoning: string;
    breakdowns?: {
      category: string;
      score: number;
      comment: string;
    }[];
  };
}

// AI採点用のインターフェース
export interface EvaluationContext {
  systemMessage: string;   // AI向けの採点指示
  referenceText: string;   // 参考テキスト
  submission: string;      // 提出内容
  maxPoints: number;       // 最大得点
}
