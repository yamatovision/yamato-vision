'use client';

import { useState } from 'react';
import { Course } from '@/types/course';


export const useShop = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCourses = async (): Promise<Course[]> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/shop/courses');
      if (!response.ok) throw new Error('コースの取得に失敗しました');
      return await response.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : '予期せぬエラーが発生しました');
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const checkPurchaseStatus = async (courseId: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/shop/courses/${courseId}/status`);
      if (!response.ok) throw new Error('ステータスの確認に失敗しました');
      return await response.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : '予期せぬエラーが発生しました');
      return false;
    }
  };

  const unlockCourse = async (courseId: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/shop/courses/unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId }),
      });
      
      if (!response.ok) throw new Error('コースの解放に失敗しました');
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : '予期せぬエラーが発生しました');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    fetchCourses,
    checkPurchaseStatus,
    unlockCourse,
  };
};
