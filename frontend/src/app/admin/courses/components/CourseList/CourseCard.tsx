'use client';

import { useTheme } from '@/contexts/theme';
import { Course } from '@/types/course';
import { formatDate } from '@/lib/utils/dateUtils';

interface CourseCardProps {
  course: Course;
  onEdit: (courseId: string) => void;
  onDelete: (courseId: string) => void;
  onPublish: (courseId: string) => void;
  onArchive: (courseId: string) => void;
}

export function CourseCard({
  course,
  onEdit,
  onDelete,
  onPublish,
  onArchive
}: CourseCardProps) {
  const { theme } = useTheme();

  const getStatusBadge = () => {
    if (course.isArchived) {
      return (
        <span className="bg-gray-500 text-white px-2 py-1 rounded-full text-xs">
          アーカイブ済み
        </span>
      );
    }
    if (course.isPublished) {
      return (
        <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs">
          公開中
        </span>
      );
    }
    return (
      <span className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs">
        下書き
      </span>
    );
  };

  return (
    <div className={`${
      theme === 'dark' ? 'bg-gray-800' : 'bg-white'
    } rounded-lg shadow-sm p-4 border ${
      theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
    }`}>
      <div className="flex justify-between items-start mb-4">
        <h3 className={`font-bold text-lg ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
          {course.title}
        </h3>
        {getStatusBadge()}
      </div>

      <p className={`text-sm mb-4 ${
        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
      }`}>
        {course.description}
      </p>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className={`text-xs ${
            theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
          }`}>
            必要ジェム
          </p>
          <p className={`font-bold ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
          }`}>
            {course.gemCost} 💎
          </p>
        </div>
        <div>
          <p className={`text-xs ${
            theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
          }`}>
            チャプター数
          </p>
          <p className={`font-bold ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
          }`}>
            {course.chapters?.length || 0}
          </p>
        </div>
      </div>

      <div className="border-t ${
        theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
      } pt-4">
        <div className="flex justify-between items-center">
          <div className="flex space-x-2">
            <button
              onClick={() => onEdit(course.id)}
              className="text-blue-500 hover:text-blue-600 text-sm"
            >
              編集
            </button>
            <button
              onClick={() => onDelete(course.id)}
              className="text-red-500 hover:text-red-600 text-sm"
            >
              削除
            </button>
          </div>
          <div className="flex space-x-2">
            {!course.isPublished && !course.isArchived && (
              <button
                onClick={() => onPublish(course.id)}
                className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-lg text-sm"
              >
                公開する
              </button>
            )}
            {!course.isArchived && (
              <button
                onClick={() => onArchive(course.id)}
                className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded-lg text-sm"
              >
                アーカイブ
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
