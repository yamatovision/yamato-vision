export interface UserChangeEventData {
  _id: string;
  email: string;
  name: string;
  userRank: string;
  password?: string;
  postgresSync?: {
    status: 'PENDING' | 'SYNCED' | 'FAILED';
    postgresId?: string;
  };
}

export interface UserMongoChangeEvent {
  operationType: 'insert' | 'update' | 'delete';
  fullDocument?: UserChangeEventData;
  documentKey: {
    _id: string;
  };
}

export interface UserSyncResult {
  success: boolean;
  mongoId: string;
  postgresId?: string;
  error?: string;
}

export interface RankUpdate {
  oldRank: string;
  newRank: string;
  updatedAt: Date;
}
