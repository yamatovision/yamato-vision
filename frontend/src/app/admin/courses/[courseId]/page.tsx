'use client';

import { useEffect, useState } from 'react';
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
      <div className="flex justify-center items-center min-h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="max-w-7xl mx-auto p-4 bg-gray-900">
        <div className="p-6 rounded-lg bg-gray-800/50 border border-gray-700 text-center">
          <p className="text-lg text-gray-300">
            コースが見つかりませんでした
          </p>
          <Link
            href="/admin/courses"
            className="mt-4 inline-block px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white transition-colors"
          >
            コース一覧に戻る
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {isProcessing && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white" />
        </div>
      )}

      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-2xl font-bold text-white">
                {course.title} - 基本情報編集
              </h1>
              <p className="mt-2 text-gray-400">
                コースの基本情報を編集できます
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href={`/admin/courses/${params.courseId}/chapters`}
                className="px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 hover:bg-gray-700 text-gray-200 transition-colors"
              >
                チャプター管理へ
              </Link>
              <div className="flex items-center space-x-3">
                <span className={`px-3 py-1 rounded-full text-sm ${
                  course.isPublished
                    ? 'bg-green-900/50 text-green-300 border border-green-700'
                    : 'bg-yellow-900/50 text-yellow-300 border border-yellow-700'
                }`}>
                  {course.isPublished ? '公開中' : '下書き'}
                </span>
                <button
                  onClick={handlePublishToggle}
                  className={`px-4 py-2 rounded-lg ${
                    course.isPublished
                      ? 'bg-yellow-600 hover:bg-yellow-700'
                      : 'bg-green-600 hover:bg-green-700'
                  } text-white transition-colors`}
                >
                  {course.isPublished ? '非公開にする' : '公開する'}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-lg border border-gray-700 shadow-lg">
          <div className="p-6">
            <CourseForm
              initialData={course}
              isEdit
            />
          </div>
        </div>
      </div>
    </div>
  );
}