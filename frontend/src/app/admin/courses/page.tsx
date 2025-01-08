// frontend/src/app/admin/courses/page.tsx

'use client';

import { CourseList } from './components/CourseList';
import Link from 'next/link';

export default function CoursesAdminPage() {
  return (
    <div className="max-w-7xl mx-auto p-4 bg-gray-50 min-h-screen">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            コース管理
          </h1>
          <p className="mt-2 text-gray-600">
            コースの作成、編集、公開設定ができます
          </p>
        </div>
        <Link
          href="/admin/courses/new"
          className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-sm flex items-center space-x-2"
        >
          <span>+</span>
          <span>新規コース作成</span>
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6">
          <CourseList />
        </div>
      </div>
    </div>
  );
}