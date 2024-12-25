'use client';

import { useTheme } from '@/contexts/theme';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Course } from '@/types/course';
import { courseApi } from '@/lib/api';
import { toast } from 'react-hot-toast';

export default function CoursesPage() {
  const { theme } = useTheme();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setIsLoading(true);
      const response = await courseApi.getCourses();
      setCourses(response.data);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
      toast.error('コースの取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className={`text-2xl font-bold mb-6 ${
        theme === 'dark' ? 'text-white' : 'text-[#1E40AF]'
      }`}>
        コース一覧
      </h1>

      <div className="space-y-4">
        {courses.length === 0 ? (
          <p className={`text-center py-8 ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          }`}>
            利用可能なコースがありません
          </p>
        ) : (
          courses.map((course) => (
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
                  {course.stage && <p className="text-blue-400">{course.stage}</p>}
                </div>
                {course.level && (
                  <span className={`px-2 py-1 rounded text-sm ${
                    theme === 'dark' 
                      ? 'bg-blue-900/50 text-blue-400' 
                      : 'bg-blue-100 text-blue-600'
                  }`}>
                    {course.level}
                  </span>
                )}
              </div>

              {course.progress !== undefined && course.progress > 0 && (
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
          ))
        )}
      </div>
    </div>
  );
}
