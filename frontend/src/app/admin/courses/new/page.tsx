'use client';

import { useTheme } from '@/contexts/theme';
import { CourseForm } from '../components/CourseForm';

export default function NewCoursePage() {
  const { theme } = useTheme();

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className={`text-2xl font-bold mb-8 ${
        theme === 'dark' ? 'text-white' : 'text-gray-900'
      }`}>
        新規コース作成
      </h1>
      
      <div className={`p-6 rounded-lg ${
        theme === 'dark' ? 'bg-gray-800' : 'bg-white'
      } shadow-sm`}>
        <CourseForm />
      </div>
    </div>
  );
}
