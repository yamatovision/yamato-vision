'use client';

import { useTheme } from '@/contexts/theme';
import Link from 'next/link';
import { Course } from '@/types/course';

export default function CoursesPage() {
  const { theme } = useTheme();
  
  const courses: Course[] = [
    {
      id: '1',
      title: 'プロンプトエンジニアリング基礎',
      stage: 'STAGE 2-1',
      level: '初級',
      progress: 45,
    },
    {
      id: '2',
      title: 'AIチャットボット開発',
      stage: 'STAGE 1-1',
      level: '中級',
      progress: 0,
    },
  ];

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className={`text-2xl font-bold mb-6 ${
        theme === 'dark' ? 'text-white' : 'text-[#1E40AF]'
      }`}>
        コース一覧
      </h1>

      <div className="space-y-4">
        {courses.map((course) => (
          <Link
            key={course.id}
            href={`/user/courses/${course.id}`}
            className={`block ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            } rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow`}
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <h2 className={`font-bold mb-1 ${
                  theme === 'dark' ? 'text-white' : 'text-[#1E40AF]'
                }`}>{course.title}</h2>
                <p className="text-blue-400">{course.stage}</p>
              </div>
              <span className={`px-2 py-1 rounded text-sm ${
                theme === 'dark' 
                  ? 'bg-blue-900/50 text-blue-400' 
                  : 'bg-blue-100 text-blue-600'
              }`}>
                {course.level}
              </span>
            </div>

            {course.progress > 0 && (
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className={
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }>進捗状況</span>
                  <span className={
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }>{course.progress}%</span>
                </div>
                <div className={`w-full ${
                  theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                } rounded-full h-2`}>
                  <div 
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${course.progress}%` }}
                  />
                </div>
              </div>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
