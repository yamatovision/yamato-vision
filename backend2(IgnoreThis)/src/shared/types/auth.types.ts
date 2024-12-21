import { Request } from 'express';

export interface JWTPayload {
  userId: string;      // MongoDB ID
  postgresId: string;  // PostgreSQL ID
  email: string;
  userRank: string;
}

export interface AuthenticatedRequest extends Request {
  user?: JWTPayload;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  data?: {
    token: string;
    user: {
      _id: string;
      email: string;
      userRank: string;
      name?: string;
      [key: string]: any;
    };
  };
  error?: string;
}
