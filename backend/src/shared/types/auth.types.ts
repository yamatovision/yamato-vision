import { Request } from 'express';

export interface JWTPayload {
  id: string;
  email: string;
  mongoId?: string;
  rank: string;
  status: 'ACTIVE' | 'INACTIVE';
  role?: 'USER' | 'ADMIN';  // roleを追加
}

export interface AuthenticatedRequest extends Request {
  user?: JWTPayload;
}
