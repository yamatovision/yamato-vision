// src/lib/api/token.ts
import { APIResponse } from '@/types/api';

export interface TokenUpdateResponse {
  currentLevel: number;
  oldLevel: number;
  levelUpMessage: string | null;
  experienceGained: number;
  newTokens?: number;
}

export interface TokenBalance {
  balance: number;
}

class TokenAPI {
  async updateUsage(tokenCount: number): Promise<APIResponse<TokenUpdateResponse>> {
    try {
      const response = await fetch('/api/users/tokens/usage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tokenCount }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          data: null,
          error: data.message || 'Failed to update token usage'
        };
      }

      return data;
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async getBalance(): Promise<APIResponse<TokenBalance>> {
    try {
      const response = await fetch('/api/users/tokens/balance');
      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          data: null,
          error: data.message || 'Failed to fetch token balance'
        };
      }

      return data;
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
}

export const tokenAPI = new TokenAPI();