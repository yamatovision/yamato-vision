'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CourseCard } from './CourseCard';
import { Course } from '@/types/course';
import { courseApi } from '@/lib/api';
import { toast } from 'react-hot-toast';

export function CourseList() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setIsLoading(true);
      const response = await courseApi.getCourses();
      if (response.success && response.data) {
        setCourses(response.data);
      } else {
        throw new Error(response.error || 'Failed to fetch courses');
      }
    } catch (error) {
      toast.error('コースの取得に失敗しました');
      console.error('Failed to fetch courses:', error);
      setCourses([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (courseId: string) => {
    router.push(`/admin/courses/${courseId}`);
  };

  const handleDelete = async (courseId: string) => {
    if (!confirm('このコースを削除してもよろしいですか？\n※この操作は取り消せません。')) return;

    try {
      setIsProcessing(true);
      await courseApi.deleteCourse(courseId);
      toast.success('コースを削除しました');
      await fetchCourses();
    } catch (error) {
      toast.error('コースの削除に失敗しました');
      console.error('Failed to delete course:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePublish = async (courseId: string) => {
    try {
      setIsProcessing(true);
      await courseApi.publishCourse(courseId);
      toast.success('コースを公開しました');
      await fetchCourses();
    } catch (error) {
      toast.error('コースの公開に失敗しました');
      console.error('Failed to publish course:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // ローディング表示
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  // フィルタリングと並び替え（オプション）
  const sortedCourses = [...courses].sort((a, b) => {
    // 公開中のコースを優先
    if (a.isPublished && !b.isPublished) return -1;
    if (!a.isPublished && b.isPublished) return 1;
    // 次に作成日時の新しい順
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="space-y-6">
      {/* 処理中のローディングオーバーレイ */}
      {isProcessing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white" />
        </div>
      )}
      
      {/* コース一覧 */}
      {!courses || courses.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          コースがありません
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedCourses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onPublish={handlePublish}
            />
          ))}
        </div>
      )}
    </div>
  );
}