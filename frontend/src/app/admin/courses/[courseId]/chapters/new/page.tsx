'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTheme } from '@/contexts/theme';
import { Course } from '@/types/course';
import { courseApi } from '@/lib/api';
import { ChapterForm } from '../components/ChapterForm';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

export default function NewChapterPage() {
  const params = useParams();
  const router = useRouter();
  const { theme } = useTheme();
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCourse();
  }, [params.courseId]);

  const fetchCourse = async () => {
    try {
      setIsLoading(true);
      const response = await courseApi.getCourse(params.courseId as string);
      setCourse(response.data);
    } catch (error) {
      console.error('Failed to fetch course:', error);
      toast.error('コースの取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccess = () => {
    toast.success('チャプターを作成しました');
    router.push(`/admin/courses/${params.courseId}/chapters`);
  };

  const handleCancel = () => {
    router.push(`/admin/courses/${params.courseId}/chapters`);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="max-w-7xl mx-auto p-4">
        <div className={`p-6 rounded-lg ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        } shadow-sm text-center`}>
          <p className={`text-lg ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            コースが見つかりませんでした
          </p>
          <Link
            href="/admin/courses"
            className={`mt-4 inline-block px-4 py-2 rounded-lg ${
              theme === 'dark' 
                ? 'bg-blue-600 hover:bg-blue-700' 
                : 'bg-blue-500 hover:bg-blue-600'
            } text-white transition-colors`}
          >
            コース一覧に戻る
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className={`text-2xl font-bold ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              {course.title} - 新規チャプター作成
            </h1>
            <p className={`mt-2 ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              新しいチャプターを作成します
            </p>
          </div>
          <Link
            href={`/admin/courses/${params.courseId}/chapters`}
            className={`px-4 py-2 rounded-lg ${
              theme === 'dark'
                ? 'bg-gray-700 hover:bg-gray-600'
                : 'bg-gray-100 hover:bg-gray-200'
            } transition-colors`}
          >
            チャプター一覧へ戻る
          </Link>
        </div>
      </div>

      <div className={`p-6 rounded-lg ${
        theme === 'dark' ? 'bg-gray-800' : 'bg-white'
      } shadow-sm`}>
        <ChapterForm
          courseId={params.courseId as string}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
}