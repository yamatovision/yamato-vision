'use client';

import { useEffect, useState } from 'react';
import { useTheme } from '@/contexts/theme';
import { Course } from '@/types/course';
import { courseApi } from '@/lib/api';
import { CourseForm } from '../components/CourseForm';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

interface CourseEditPageProps {
  params: {
    courseId: string;
  };
}

export default function CourseEditPage({ params }: CourseEditPageProps) {
  const { theme } = useTheme();
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchCourse();
  }, [params.courseId]);

  const fetchCourse = async () => {
    try {
      setIsLoading(true);
      const response = await courseApi.getCourse(params.courseId);
      setCourse(response.data);
    } catch (error) {
      console.error('Failed to fetch course:', error);
      toast.error('コースの取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePublishToggle = async () => {
    if (!course) return;

    try {
      setIsProcessing(true);
      if (course.isPublished) {
        await courseApi.unpublishCourse(params.courseId);
        toast.success('コースを非公開にしました');
      } else {
        if (!course.chapters?.length) {
          toast.error('チャプターを追加してから公開してください');
          return;
        }
        await courseApi.publishCourse(params.courseId);
        toast.success('コースを公開しました');
      }
      await fetchCourse();
    } catch (error) {
      console.error('Failed to toggle publish status:', error);
      toast.error('コースの公開状態の変更に失敗しました');
    } finally {
      setIsProcessing(false);
    }
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
      {isProcessing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white" />
        </div>
      )}

      <div className="mb-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className={`text-2xl font-bold ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              {course.title} - 基本情報編集
            </h1>
            <p className={`mt-2 ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              コースの基本情報を編集できます
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              href={`/admin/courses/${params.courseId}/chapters`}
              className={`px-4 py-2 rounded-lg ${
                theme === 'dark'
                  ? 'bg-gray-700 hover:bg-gray-600'
                  : 'bg-gray-100 hover:bg-gray-200'
              } transition-colors`}
            >
              チャプター管理へ
            </Link>
            <span className={`px-3 py-1 rounded-full text-sm ${
              course.isPublished
                ? 'bg-green-100 text-green-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {course.isPublished ? '公開中' : '下書き'}
            </span>
            <button
              onClick={handlePublishToggle}
              className={`px-4 py-2 rounded-lg ${
                course.isPublished
                  ? theme === 'dark'
                    ? 'bg-yellow-600 hover:bg-yellow-700'
                    : 'bg-yellow-500 hover:bg-yellow-600'
                  : theme === 'dark'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-green-500 hover:bg-green-600'
              } text-white transition-colors`}
            >
              {course.isPublished ? '非公開にする' : '公開する'}
            </button>
          </div>
        </div>
      </div>

      <div className={`p-6 rounded-lg ${
        theme === 'dark' ? 'bg-gray-800' : 'bg-white'
      } shadow-sm`}>
        <CourseForm
          initialData={course}
          isEdit
        />
      </div>
    </div>
  );
}