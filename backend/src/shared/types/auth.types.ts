import { Request } from 'express';

export interface JWTPayload {
  userId: string;
  email: string;
  userRank: string;
}

export interface AuthenticatedRequest extends Request {
  user?: JWTPayload;
}
