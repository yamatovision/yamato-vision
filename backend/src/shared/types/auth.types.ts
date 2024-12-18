import { Request } from 'express';

export interface JWTPayload {
  id: string;       // idを追加
  userId: string;
  email: string;    // emailも追加
  role: 'USER' | 'ADMIN';
  iat?: number;
  exp?: number;
}

export type AuthenticatedRequest = Request & {
  user?: JWTPayload;
}
