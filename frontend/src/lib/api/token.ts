// src/lib/api/token.ts を新規作成
import { APIResponse } from '@/types/api';

interface TokenUpdateResponse {
  currentLevel: number;
  oldLevel: number;
  levelUpMessage: string | null;
  experienceGained?: number;
}

class TokenAPI {
  async updateUsage(tokenCount: number): Promise<APIResponse<TokenUpdateResponse>> {
    const response = await fetch('/api/users/tokens/usage', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tokenCount }),
    });

    const data = await response.json();
    return data;
  }
}

export const tokenAPI = new TokenAPI();