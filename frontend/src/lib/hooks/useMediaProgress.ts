import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';

interface UseMediaProgressProps {
  videoId: string;
  courseId: string;
  chapterId: string;
}

export function useMediaProgress({ videoId, courseId, chapterId }: UseMediaProgressProps) {
  const [position, setPosition] = useState(0);
  const [watchRate, setWatchRate] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  // 保存された進捗位置の取得
  const loadProgress = useCallback(async () => {
    try {
      const response = await api.get(`/media/progress/${chapterId}`);
      if (response.data?.position) {
        setPosition(response.data.position);
      }
    } catch (error) {
      console.error('Failed to load media progress:', error);
    }
  }, [chapterId]);

  // 進捗の保存
  const saveProgress = useCallback(async (currentTime: number, duration: number) => {
    try {
      const progress = Math.floor((currentTime / duration) * 100);
      setWatchRate(progress);

      await api.post('/media/progress', {
        videoId,
        courseId,
        chapterId,
        position: Math.floor(currentTime),
        watchRate: progress
      });

      if (progress >= 95 && !isCompleted) {
        setIsCompleted(true);
        // コース進捗の更新
        await api.post(`/courses/${courseId}/chapters/${chapterId}/progress`, {
          lessonWatchRate: progress
        });
      }
    } catch (error) {
      console.error('Failed to save media progress:', error);
    }
  }, [videoId, courseId, chapterId, isCompleted]);

  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  return {
    position,
    watchRate,
    isCompleted,
    saveProgress
  };
}