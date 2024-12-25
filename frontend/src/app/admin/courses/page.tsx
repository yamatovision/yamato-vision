'use client';

import { useTheme } from '@/contexts/theme';
import { CourseList } from './components/CourseList';
import Link from 'next/link';

export default function CoursesAdminPage() {
  const { theme } = useTheme();

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="mb-8 flex justify-between items-center">
        <h1 className={`text-2xl font-bold ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
          コース管理
        </h1>
        <Link
          href="/admin/courses/new"
          className={`px-4 py-2 rounded-lg ${
            theme === 'dark' 
              ? 'bg-blue-600 hover:bg-blue-700' 
              : 'bg-blue-500 hover:bg-blue-600'
          } text-white transition-colors`}
        >
          新規コース作成
        </Link>
      </div>

      <div className="mb-6">
        <div className={`p-4 rounded-lg ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        } shadow-sm`}>
          <CourseList />
        </div>
      </div>
    </div>
  );
}
