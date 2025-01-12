// frontend/src/app/admin/courses/[courseId]/chapters/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTheme } from '@/contexts/theme';
import { Course, Chapter } from '@/types/course';
import { courseApi } from '@/lib/api';
import { ChapterList } from './components/ChapterList';  // パスを修正
import { toast } from 'react-hot-toast';
import Link from 'next/link';



export default function CourseChaptersPage() {
  const { theme } = useTheme();
  const params = useParams();
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

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

  const handleChapterDelete = async (chapterId: string) => {
    if (!confirm('このチャプターを削除してもよろしいですか？')) return;

    try {
      setIsProcessing(true);
      await courseApi.deleteChapter(params.courseId as string, chapterId);
      toast.success('チャプターを削除しました');
      await fetchCourse();
    } catch (error) {
      console.error('Failed to delete chapter:', error);
      toast.error('チャプターの削除に失敗しました');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleToggleVisibility = async (chapterId: string, isVisible: boolean) => {
    try {
      setIsProcessing(true);
      await courseApi.updateChapter(params.courseId as string, chapterId, { isVisible });
      await fetchCourse();
      toast.success(isVisible ? 'チャプターを表示に設定しました' : 'チャプターを非表示に設定しました');
    } catch (error) {
      console.error('Failed to toggle chapter visibility:', error);
      toast.error('設定の更新に失敗しました');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTogglePerfectOnly = async (chapterId: string, isPerfectOnly: boolean) => {
    try {
      setIsProcessing(true);
      await courseApi.updateChapter(params.courseId as string, chapterId, { isPerfectOnly });
      await fetchCourse();
      toast.success(isPerfectOnly ? 'Perfectユーザー専用に設定しました' : 'Perfect専用設定を解除しました');
    } catch (error) {
      console.error('Failed to toggle perfect only:', error);
      toast.error('設定の更新に失敗しました');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleChapterOrderUpdate = async (updatedChapters: Chapter[]) => {
    try {
      setIsProcessing(true);
      await courseApi.updateChaptersOrder(
        params.courseId as string,
        updatedChapters.map((chapter, index) => ({
          id: chapter.id,
          orderIndex: index
        }))
      );
      await fetchCourse();
      toast.success('チャプターの順序を更新しました');
    } catch (error) {
      console.error('Failed to update chapter order:', error);
      toast.error('チャプターの順序更新に失敗しました');
    } finally {
      setIsProcessing(false);
    }
  };
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="max-w-7xl mx-auto p-4 bg-gray-50">
        <div className="p-6 rounded-lg bg-white shadow-sm text-center">
          <p className="text-lg text-gray-600">
            コースが見つかりませんでした
          </p>
          <Link
            href="/admin/courses"
            className="mt-4 inline-block px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
          >
            コース一覧に戻る
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 bg-gray-50 min-h-screen">
      {isProcessing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white" />
        </div>
      )}

      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {course.title} - チャプター管理
            </h1>
            <p className="mt-2 text-gray-600">
              チャプターの追加、編集、並び替えができます
            </p>
          </div>
          <div className="flex items-center space-x-4">
  <Link
    href={`/admin/courses/${params.courseId}`}
    className="px-4 py-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 transition-colors shadow-sm"
  >
    コース基本情報へ戻る
  </Link>
  <Link
    href={`/admin/courses/${params.courseId}/chapters/new`}
    className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-sm"
  >
    通常チャプター作成
  </Link>
  <Link
    href={`/admin/courses/${params.courseId}/chapters/new?type=exam`}
    className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white transition-colors shadow-sm"
  >
    最終試験作成
  </Link>
</div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        {course.chapters && (
          <ChapterList
            chapters={course.chapters}
            onDelete={handleChapterDelete}
            onEdit={(chapterId) => {
              router.push(`/admin/courses/${params.courseId}/chapters/${chapterId}`);
            }}
            onOrderUpdate={handleChapterOrderUpdate}
            onToggleVisibility={handleToggleVisibility}
            onTogglePerfectOnly={handleTogglePerfectOnly}
            courseId={params.courseId as string}
          />
        )}
      </div>
    </div>
  );
}