import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './useAuth';

const SAVE_INTERVAL = 15000; // 15秒

export const useMediaProgress = (courseId: string, chapterId: string) => {
  const { user } = useAuth();
  const [position, setPosition] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const lastSavedPosition = useRef(0);
  const timerRef = useRef<NodeJS.Timeout>();

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
        setPosition(data.position);
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
      if (position !== lastSavedPosition.current) {
        saveProgress(position);
      }
    }, SAVE_INTERVAL);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [user?.id, position, saveProgress]);

  // 初期ロード
  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  return {
    position,
    setPosition,
    isLoading,
    saveProgress,
  };
};
