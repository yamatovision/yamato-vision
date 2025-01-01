import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './useAuth';

const SAVE_INTERVAL = 15000; // 15秒
const COMPLETION_THRESHOLD = 0.95; // 95%で完了とみなす

interface MediaProgressState {
  position: number;
  duration: number;
  isCompleted: boolean;
}

export const useMediaProgress = (courseId: string, chapterId: string) => {
  const { user } = useAuth();
  const [state, setState] = useState<MediaProgressState>({
    position: 0,
    duration: 0,
    isCompleted: false
  });
  const [isLoading, setIsLoading] = useState(true);
  const lastSavedPosition = useRef(0);
  const timerRef = useRef<NodeJS.Timeout>();

  // 視聴完了判定
  const checkCompletion = useCallback((position: number, duration: number) => {
    if (duration > 0 && position >= duration * COMPLETION_THRESHOLD) {
      return true;
    }
    return false;
  }, []);

  // 進捗状態の更新
  const setProgress = useCallback((position: number, duration: number) => {
    const isCompleted = checkCompletion(position, duration);
    setState(prev => ({
      ...prev,
      position,
      duration,
      isCompleted
    }));
  }, [checkCompletion]);

  // 完了状態の保存
  const saveCompletion = useCallback(async () => {
    if (!user?.id) return;

    try {
      await fetch(`/api/users/courses/${courseId}/chapters/${chapterId}/completion`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          completed: true
        }),
      });
    } catch (error) {
      console.error('Failed to save completion:', error);
    }
  }, [user?.id, courseId, chapterId]);

  // 進捗の保存
  const saveProgress = useCallback(async (currentPosition: number) => {
    if (!user?.id || Math.abs(currentPosition - lastSavedPosition.current) < 3000) {
      return; // 3秒未満の変更は保存しない
    }

    try {
      await fetch(`/api/user/courses/${courseId}/chapters/${chapterId}/progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          position: currentPosition,
          deviceId: window.navigator.userAgent,
        }),
      });
      lastSavedPosition.current = currentPosition;
    } catch (error) {
      console.error('Failed to save progress:', error);
    }
  }, [user?.id, courseId, chapterId]);

  // 進捗の読み込み
  const loadProgress = useCallback(async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/user/courses/${courseId}/chapters/${chapterId}/progress`);
      const data = await response.json();
      if (data.success) {
        setState(prev => ({
          ...prev,
          position: data.position,
          isCompleted: data.completed || false
        }));
        lastSavedPosition.current = data.position;
      }
    } catch (error) {
      console.error('Failed to load progress:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, courseId, chapterId]);

  // 定期保存の設定
  useEffect(() => {
    if (!user?.id) return;

    timerRef.current = setInterval(() => {
      if (state.position !== lastSavedPosition.current) {
        saveProgress(state.position);
      }
    }, SAVE_INTERVAL);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [user?.id, state.position, saveProgress]);

  // 完了状態の監視
  useEffect(() => {
    if (state.isCompleted) {
      saveCompletion();
    }
  }, [state.isCompleted, saveCompletion]);

  // 初期ロード
  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  return {
    position: state.position,
    duration: state.duration,
    isCompleted: state.isCompleted,
    isLoading,
    setProgress,
    saveProgress,
  };
};