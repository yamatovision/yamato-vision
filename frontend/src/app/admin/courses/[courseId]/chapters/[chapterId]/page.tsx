// frontend/src/app/admin/courses/[courseId]/chapters/[chapterId]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Chapter } from '@/types/course';
import { courseApi } from '@/lib/api';
import { ChapterForm } from '../components/ChapterForm';
import { useRouter } from 'next/navigation';

export default function ChapterEditPage() {
  const params = useParams();
  const router = useRouter();
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
    router.push(`/admin/courses/${params.courseId}`);
  };

  const handleCancel = () => {
    router.push(`/admin/courses/${params.courseId}`);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto p-4">
      <ChapterForm
        courseId={params.courseId as string}
        initialData={chapter || undefined}
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </div>
  );
}