'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/theme';
import { CourseCard } from './CourseCard';
import { courseApi } from '@/lib/api/courses';
import { useAuth } from '@/lib/hooks/useAuth';
import { Course, CourseStatus, CurrentCourseState } from '@/types/course';
import { toast } from 'react-hot-toast';
import api from '@/lib/api/auth';
import { useRouter } from 'next/navigation';
import { ShopCourse } from '@/types/course';

interface UserDetails {
  id: string;
  rank: string;
  level: number;
}

const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-screen">
    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
  </div>
);

export default function ShopPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const { user: authUser } = useAuth();
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [filter, setFilter] = useState<'all' | 'available' | 'new'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [courses, setCourses] = useState<Course[]>([]);
  const [userLoading, setUserLoading] = useState(true);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [currentState, setCurrentState] = useState<CurrentCourseState | null>(null);
  const [activeCourse, setActiveCourse] = useState<Course | null>(null);

  // モーダル状態管理
  const [activatingCourse, setActivatingCourse] = useState<string | null>(null);
  const [showActivationModal, setShowActivationModal] = useState(false);

  useEffect(() => {
    const fetchActiveCourse = async () => {
      try {
        const response = await courseApi.getAvailableCourses();
        if (response.success) {
          const active = response.data.find(course => course.status === 'active');
          setActiveCourse(active || null);
        }
      } catch (error) {
        console.error('Failed to fetch active course:', error);
      }
    };
    
    fetchActiveCourse();
  }, []);
  // ユーザー詳細情報の取得
  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        setUserLoading(true);
        const response = await api.get('/users/profile');
        const userData = response.data.data;
        if (userData) {
          setUserDetails({
            id: userData.id,
            rank: userData.rank,
            level: userData.level
          });
        }
      } catch (error) {
        console.error('Failed to fetch user details:', error);
        toast.error('ユーザー情報の取得に失敗しました');
      } finally {
        setUserLoading(false);
      }
    };

    if (authUser) {
      fetchUserDetails();
    }
  }, [authUser]);

  useEffect(() => {
    const fetchCurrentState = async () => {
      const response = await courseApi.getCurrentCourseState();
      if (response.success) {
        setCurrentState(response.data);
      }
    };
    
    fetchCurrentState();
  }, []);

  
  // コース一覧の取得
    useEffect(() => {
      const fetchCourses = async () => {
        try {
          setCoursesLoading(true);
          const response = await courseApi.getAvailableCourses();
          console.log('API レスポンス:', response.data);
  
          if (response.success) {
            const formattedCourses = response.data.map((apiCourse: any) => ({
              id: apiCourse.id,
              title: apiCourse.title,
              description: apiCourse.description,
              status: apiCourse.isActive ? 'active' : mapApiStatusToCourseStatus(apiCourse.status),
              levelRequired: apiCourse.levelRequired,
              rankRequired: apiCourse.rankRequired,
              gradient: apiCourse.gradient,
              thumbnail: apiCourse.thumbnail,
              completion: apiCourse.completion,
              isPublished: apiCourse.isPublished,
              isArchived: apiCourse.isArchived,
              createdAt: apiCourse.createdAt,
              updatedAt: apiCourse.updatedAt
            })) as ShopCourse[];
            setCourses(formattedCourses);
          }
        } catch (error) {
          console.error('Failed to fetch courses:', error);
          toast.error('コースの取得に失敗しました');
        } finally {
          setCoursesLoading(false);
        }
      };
      fetchCourses();
    }, []);

    const handleCourseAction = async (courseId: string, status: CourseStatus, action: 'select' | 'activate' | 'format') => {
      try {
        switch (action) {
          case 'activate':
            if (status !== 'available') {
              toast.error('このコースは開始できません');
              return;
            }
            const activateResult = await courseApi.activateCourse(courseId);
            if (activateResult.success) {
              toast.success('コースを開始しました');
              await refreshCourses();
            }
            break;
    
          case 'select':
            if (!['active', 'completed', 'perfect', 'failed'].includes(status)) {
              toast.error('このコースは選択できません');
              return;
            }
            const selectResult = await courseApi.selectCourse(courseId);
            if (selectResult.success) {
              toast.success('コースを選択しました');
              await refreshCourses();
            }
            break;
    
          case 'format':
            if (!['active', 'failed'].includes(status)) {
              toast.error('このコースは初期化できません');
              return;
            }
            const confirmed = window.confirm(
              'コースのデータを初期化します。\n' +
              '- 全進捗データが削除されます\n' +
              '- 最終試験データが削除されます\n' +
              '- 課題提出データが削除されます\n' +
              'よろしいですか？'
            );
            if (!confirmed) return;
            
            const formatResult = await courseApi.formatCourse(courseId);
            if (formatResult.success) {
              toast.success('コースを初期化しました');
              await refreshCourses();
            }
            break;
        }
      } catch (error) {
        console.error('Course action error:', error);
        toast.error('操作に失敗しました');
      }
    };

  // コース操作のハンドラー
  const handleUnlock = async (courseId: string) => {
    console.log('handleUnlock called with courseId:', courseId);
    const course = courses.find(c => c.id === courseId);
    console.log('Found course:', course);
    if (!course) return;
  
    switch (course.status) {
      case 'available':
      case 'failed':
        setActivatingCourse(courseId);
        setShowActivationModal(true);
        break;
  
      case 'active':
      case 'perfect':
      case 'completed':
        try {
          const response = await courseApi.getCurrentChapter(courseId);
          if (response.success && response.data) {
            router.push(`/user/courses/${courseId}/chapters/${response.data.chapterId}`);
          }
        } catch (error) {
          console.error('Error accessing course:', error);
          toast.error('コースへのアクセスに失敗しました');
        }
        break;
    }
  };

  // コース一覧の更新
  const refreshCourses = async () => {
    const response = await courseApi.getAvailableCourses();
    console.log('リフレッシュ API Response:', response.data);

    if (response.success) {
      const formattedCourses: ShopCourse[] = response.data.map((apiCourse: any) => ({
        id: apiCourse.id,
        title: apiCourse.title,
        description: apiCourse.description,
        status: apiCourse.isActive ? 'active' : mapApiStatusToCourseStatus(apiCourse.status),
        levelRequired: apiCourse.levelRequired,
        rankRequired: apiCourse.rankRequired,
        gradient: apiCourse.gradient || 'bg-gradient-to-r from-blue-500 to-purple-500',
        thumbnail: apiCourse.thumbnail,
        completion: apiCourse.completion,
        isPublished: apiCourse.isPublished,
        isArchived: apiCourse.isArchived,
        createdAt: new Date(apiCourse.createdAt),
        updatedAt: new Date(apiCourse.updatedAt)
      }));
      setCourses(formattedCourses);
    }
  };
  const mapApiStatusToCourseStatus = (apiStatus: string): CourseStatus => {
    // 大文字小文字の違いを吸収するため、小文字に統一
    const status = apiStatus?.toLowerCase();
    
    switch (status) {
      case 'active':
        return 'active';
      case 'available':
        return 'available';
      case 'completed':
        return 'completed';
      case 'perfect':
        return 'perfect';
      case 'failed':
        return 'failed';
      default:
        return 'restricted';
    }
  };

  // コースの並び替えとフィルタリング
  const filteredCourses = React.useMemo(() => {
    let filtered = courses;
    
    if (filter === 'available') {
      filtered = courses.filter(course =>
        ['available', 'active', 'completed', 'certified', 'perfect'].includes(course.status)
      );
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
        restricted: 6,
        available: 2,
        active: 0,
        completed: 5,
        blocked: 3,
        perfect: 4,
        failed: 1
      };

      return (statusPriority[a.status] || 0) - (statusPriority[b.status] || 0);
    });
  }, [courses, filter, searchTerm]);

  if (userLoading || coursesLoading || !userDetails) {
    return <LoadingSpinner />;
  }

  return (
    <div className={`max-w-6xl mx-auto p-4 ${theme === 'dark' ? 'bg-gray-900' : 'bg-[#F8FAFC]'}`}>
    <div className={theme === 'dark' ? 'bg-gray-800 rounded-lg p-4 mb-6' : 'bg-white rounded-lg p-4 mb-6 border border-[#DBEAFE] shadow-sm'}>
      <div className="flex flex-col space-y-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="text-sm">
              <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>現在の階級：</span>
              <span className={theme === 'dark' ? 'text-purple-400 font-bold' : 'text-[#1E40AF] font-bold'}>
                {userDetails.rank}
              </span>
            </div>
            <div className="text-sm">
              <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>レベル：</span>
              <span className={theme === 'dark' ? 'text-blue-400 font-bold' : 'text-[#3B82F6] font-bold'}>
                {userDetails.level}
              </span>
            </div>
          </div>
        </div>
        {activeCourse && (
          <div className="text-sm">
            <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
              現在受講中のコース：
            </span>
            <span className={`font-bold ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
              {activeCourse.title}
            </span>
          </div>
        )}
      </div>
    </div>
      {/* コース一覧 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredCourses.map((course) => (
 <CourseCard
 key={course.id}
 {...course}
 gradient={course.gradient || 'default-gradient'}
 status={course.status}
 onAction={(action) => {
   console.log('Action triggered:', action, course.id, course.status); // デバッグログ追加
   handleCourseAction(course.id, course.status, action);
 }}
/>
))}
      </div>

     
    </div>
  );
}