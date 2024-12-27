// frontend/src/lib/hooks/useTokens.ts を新規作成
import { useToast } from '@/contexts/toast';
import { tokenAPI } from '@/lib/api/token';  // APIクライアントの実装が必要

export function useTokens() {
  const { showToast } = useToast();

  const processTokenUsage = async (tokenCount: number) => {
    try {
      const response = await tokenAPI.updateUsage(tokenCount);
      const { 
        currentLevel,
        oldLevel,
        levelUpMessage,
        experienceGained
      } = response.data;

      // レベルアップが発生した場合
      if (currentLevel > oldLevel) {
        showToast('', 'levelUp', {
          oldLevel,
          newLevel: currentLevel,
          message: levelUpMessage,
          experienceGained
        });
      }

      return response.data;
    } catch (error) {
      showToast('トークンの処理中にエラーが発生しました', 'error');
      throw error;
    }
  };

  return {
    processTokenUsage
  };
}