'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Chapter } from '@/types/course';
import { courseApi } from '@/lib/api';
import { ChapterForm } from '../components/ChapterForm';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/contexts/theme';

export default function ChapterEditPage() {
  const params = useParams();
  const router = useRouter();
  const { theme } = useTheme();
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (params.courseId && params.chapterId) {
      loadChapter();
    }
  }, [params.courseId, params.chapterId]);

  const loadChapter = async () => {
    try {
      const response = await courseApi.getChapter(
        params.courseId as string,
        params.chapterId as string
      );
      if (response.success && response.data) {
        setChapter(response.data);
      }
    } catch (error) {
      console.error('Failed to load chapter:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccess = () => {
    // チャプターリストページに遷移するように修正
    router.push(`/admin/courses/${params.courseId}/chapters`);
  };

  const handleCancel = () => {
    // キャンセル時もチャプターリストページに遷移
    router.push(`/admin/courses/${params.courseId}/chapters`);
  };

  if (isLoading) {
    return (
      <div className={`flex justify-center items-center min-h-screen ${
        theme === 'dark' ? 'bg-gray-900' : 'bg-gray-900'
      }`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500" />
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${
      theme === 'dark' ? 'bg-gray-900' : 'bg-gray-900'
    }`}>
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-white">
                チャプター編集
              </h1>
              <p className="mt-2 text-gray-400">
                チャプターの内容を編集できます
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-lg border border-gray-700 shadow-lg">
          <div className="p-6">
            <ChapterForm
              courseId={params.courseId as string}
              initialData={chapter || undefined}
              onSuccess={handleSuccess}
              onCancel={handleCancel}
            />
          </div>
        </div>
      </div>
    </div>
  );
}