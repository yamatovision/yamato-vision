export interface ChangeEventData {
  _id: string;
  userId: string;
  weeklyUsage?: {
    count: number;
    baseLimit: number;
  };
  purchasedTokens?: {
    amount: number;
  };
}

export interface MongoChangeEvent {
  operationType: 'insert' | 'update' | 'delete';
  fullDocument?: ChangeEventData;
  documentKey: {
    _id: string;
  };
}

export interface ExperienceUpdate {
  userId: string;
  amount: number;
  source: 'TOKEN' | 'TASK';
  metadata?: {
    tokenAmount?: number;
    taskId?: string;
  };
}

export interface SyncResult {
  success: boolean;
  userId: string;
  experienceGained?: number;
  levelUp?: {
    oldLevel: number;
    newLevel: number;
    message: string | null;
  };
  error?: string;
}

export interface TokenUpdate {
  weeklyTokens: number;
  weeklyLimit: number;
  purchasedTokens: number;
  unprocessedTokens: number;
}
