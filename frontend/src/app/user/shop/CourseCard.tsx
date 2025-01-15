'use client';

import Link from 'next/link';
import { Course } from '@/types/course';
import { CourseStatus } from '@/types/status'; // status.tsから正しくインポート

interface CourseCardProps {
  course: Course;
  onCardClick: (courseId: string, status: CourseStatus) => void;
}

export function CourseCard({ course, onCardClick }: CourseCardProps) {
  const handleClick = () => {
    onCardClick(course.id, course.status);
  };

  return (
    <div 
      className="relative bg-gray-900 rounded-lg overflow-hidden group cursor-pointer"
      onClick={handleClick}
    >
      {/* サムネイル画像 */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={course.thumbnail || '/default-course-thumbnail.jpg'}
          alt={course.title}
          className="w-full h-full object-cover"
        />
        {/* オーバーレイメニュー */}
        <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-4">
          <Link
            href={`/admin/courses/${course.id}`}
            className="px-4 py-2 bg-white bg-opacity-90 text-gray-900 rounded-md hover:bg-opacity-100 transition-all z-10"
          >
            コース管理
          </Link>
          <Link
            href={`/admin/courses/${course.id}/chapters`}
            className="px-4 py-2 bg-blue-500 bg-opacity-90 text-white rounded-md hover:bg-opacity-100 transition-all z-10"
          >
            チャプター管理
          </Link>
        </div>
      </div>

      {/* コース情報 */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-white">
            {course.title}
          </h3>
          <span className={`px-2 py-1 text-xs rounded-full ${
            course.isPublished 
              ? 'bg-green-100 text-green-800'
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {course.isPublished ? '公開中' : '下書き'}
          </span>
        </div>

        {/* 受講条件と情報 */}
        <div className="space-y-2 text-gray-300 text-sm">
          <p className="flex justify-between">
            <span>チャプター数</span>
            <span>{course.chapters?.length || 0}</span>
          </p>
          <p className="flex justify-between">
            <span>更新日</span>
            <span>{new Date(course.updatedAt).toLocaleDateString()}</span>
          </p>
        </div>
      </div>

      {/* カード全体をクリッカブルに */}
      <Link
        href={`/admin/courses/${course.id}`}
        className="absolute inset-0"
        aria-label={`${course.title}の詳細を表示`}
      />
    </div>
  );
}