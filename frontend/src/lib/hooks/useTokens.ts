import { useToast } from '@/contexts/toast';
import { tokenAPI } from '@/lib/api/token';
import type { TokenUpdateResponse } from '@/lib/api/token';
import type { LevelUpData } from '@/types/toast';  // toastから型をインポート

export function useTokens() {
  const { showToast } = useToast();
// src/lib/hooks/useTokens.ts
const processTokenUsage = async (tokenCount: number) => {
  try {
    const response = await tokenAPI.updateUsage(tokenCount);

    if (!response.success || !response.data) {
      showToast('トークンの処理中にエラーが発生しました', 'error');
      return null;
    }

    const { 
      currentLevel,    // newLevel → currentLevel に戻す
      oldLevel,
      levelUpMessage,
      experienceGained
    } = response.data;
    
    // レベルアップが発生した場合
    if (currentLevel > oldLevel && levelUpMessage) {
      const levelUpData: LevelUpData = {
        oldLevel,
        newLevel: currentLevel,  // currentLevelをnewLevelとして使用
        message: levelUpMessage,
        experienceGained
      };
      
      showToast('', 'levelUp', levelUpData);
    }
    // 経験値獲得通知
    if (experienceGained > 0) {
      showToast(`+${experienceGained} EXP を獲得!`, 'success');
    }

    return response.data;
  } catch (error) {
    console.error('Token processing error:', error);
    showToast('トークンの処理中にエラーが発生しました', 'error');
    throw error;
  }
};








  const checkTokenBalance = async (): Promise<number> => {
    try {
      const response = await tokenAPI.getBalance();
      if (!response.success || response.data === null) {
        throw new Error('Failed to fetch token balance');
      }
      return response.data.balance;
    } catch (error) {
      console.error('Token balance check error:', error);
      showToast('トークン残量の確認中にエラーが発生しました', 'error');
      throw error;
    }
  };

  return {
    processTokenUsage,
    checkTokenBalance
  };
}