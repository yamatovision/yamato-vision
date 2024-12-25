'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/theme';
import { CourseCard } from './CourseCard';
import { courseApi } from '@/lib/api/courses';
import { useAuth } from '@/lib/hooks/useAuth';
import { Course, CourseStatus } from './types';
import { toast } from 'react-hot-toast';
import { ActivationModal } from './ActivationModal';

const LoadingSpinner = () => {
  return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );
};

export default function ShopPage() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [filter, setFilter] = useState<'all' | 'available' | 'new'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [activatingCourse, setActivatingCourse] = useState<string | null>(null);
  const [showActivationModal, setShowActivationModal] = useState(false);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await courseApi.getAvailableCourses();
        if (response.success) {
          const formattedCourses: Course[] = response.data.map((apiCourse: any) => ({
            id: apiCourse.id,
            title: apiCourse.title,
            description: apiCourse.description,
            status: apiCourse.status as CourseStatus,
            gemCost: apiCourse.gemCost || undefined,
            levelRequired: apiCourse.levelRequired || undefined,
            rankRequired: apiCourse.rankRequired || undefined,
            gradient: apiCourse.gradient || 'bg-gradient-to-r from-blue-500 to-purple-500',
            completion: apiCourse.completion || undefined,
          }));
          setCourses(formattedCourses);
        }
      } catch (error) {
        console.error('Failed to fetch courses:', error);
        toast.error('コースの取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const handleUnlock = async (courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    if (!course) return;

    if (course.status === 'unlocked') {
      setActivatingCourse(courseId);
      setShowActivationModal(true);
    } else if (course.status === 'available') {
      try {
        const result = await courseApi.purchaseCourse(courseId);
        if (result.success) {
          toast.success('コースを解放しました！');
          const response = await courseApi.getAvailableCourses();
          if (response.success) {
            const formattedCourses: Course[] = response.data.map((apiCourse: any) => ({
              id: apiCourse.id,
              title: apiCourse.title,
              description: apiCourse.description,
              status: apiCourse.status as CourseStatus,
              gemCost: apiCourse.gemCost || undefined,
              levelRequired: apiCourse.levelRequired || undefined,
              rankRequired: apiCourse.rankRequired || undefined,
              gradient: apiCourse.gradient || 'bg-gradient-to-r from-blue-500 to-purple-500',
              completion: apiCourse.completion || undefined,
            }));
            setCourses(formattedCourses);
          }
        }
      } catch (error: any) {
        toast.error(error.message || 'コースの解放に失敗しました');
      }
    }
  };

  const handleActivation = async () => {
    if (!activatingCourse) return;
    try {
      const result = await courseApi.purchaseCourse(activatingCourse);
      if (result.success) {
        toast.success('コースを開始しました！');
        const response = await courseApi.getAvailableCourses();
        if (response.success) {
          const formattedCourses: Course[] = response.data.map((apiCourse: any) => ({
            id: apiCourse.id,
            title: apiCourse.title,
            description: apiCourse.description,
            status: apiCourse.status as CourseStatus,
            gemCost: apiCourse.gemCost || undefined,
            levelRequired: apiCourse.levelRequired || undefined,
            rankRequired: apiCourse.rankRequired || undefined,
            gradient: apiCourse.gradient || 'bg-gradient-to-r from-blue-500 to-purple-500',
            completion: apiCourse.completion || undefined,
          }));
          setCourses(formattedCourses);
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'コースの開始に失敗しました');
    } finally {
      setShowActivationModal(false);
      setActivatingCourse(null);
    }
  };

  const filteredCourses = React.useMemo(() => {
    let filtered = courses;
    
    if (filter === 'available') {
      filtered = courses.filter(course => 
        ['unlocked', 'available'].includes(course.status));
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(term) ||
        course.description.toLowerCase().includes(term)
      );
    }

    return [...filtered].sort((a, b) => {
      const statusPriority: Record<CourseStatus, number> = {
        unlocked: 1,
        available: 2,
        perfect: 3,
        completed: 4,
        failed: 5,
        level_locked: 6,
        rank_locked: 7,
        complex: 8,
      };
      return (statusPriority[a.status] || 0) - (statusPriority[b.status] || 0);
    });
  }, [courses, filter, searchTerm]);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className={`max-w-6xl mx-auto p-4 ${theme === 'dark' ? 'bg-gray-900' : 'bg-[#F8FAFC]'}`}>
      <div className={theme === 'dark' ? 'bg-gray-800 rounded-lg p-4 mb-6' : 'bg-white rounded-lg p-4 mb-6 border border-[#DBEAFE] shadow-sm'}>
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="text-sm">
              <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>現在の階級：</span>
              <span className={theme === 'dark' ? 'text-purple-400 font-bold' : 'text-[#1E40AF] font-bold'}>
                {user?.rank}
              </span>
            </div>
            <div className="text-sm">
              <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>レベル：</span>
              <span className={theme === 'dark' ? 'text-blue-400 font-bold' : 'text-[#3B82F6] font-bold'}>
                {user?.level}
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-yellow-400 text-xl">💎</span>
              <span className={theme === 'dark' ? 'font-bold text-white' : 'font-bold text-[#1E40AF]'}>
                {user?.gems}
              </span>
              <span className={theme === 'dark' ? 'text-gray-400 text-sm' : 'text-gray-500 text-sm'}>ジェム</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => (
          <CourseCard
            key={course.id}
            {...course}
            onUnlock={() => handleUnlock(course.id)}
          />
        ))}
      </div>

      <ActivationModal
        isOpen={showActivationModal}
        onClose={() => {
          setShowActivationModal(false);
          setActivatingCourse(null);
        }}
        onConfirm={handleActivation}
        hasCurrentCourse={courses.some(c => c.status === 'unlocked' && c.completion?.badges?.completion)}
      />
    </div>
  );
}