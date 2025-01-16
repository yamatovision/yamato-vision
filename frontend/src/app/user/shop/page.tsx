'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/theme';
import { CourseCard } from './CourseCard';
import { courseApi } from '@/lib/api/courses';
import { useAuth } from '@/lib/hooks/useAuth';
import { Course, CourseStatus, CourseAction } from '@/types/course';
import { toast } from 'react-hot-toast';
import api from '@/lib/api/auth';
import { useRouter } from 'next/navigation';
import { Modal } from '@/app/user/shop/Modal';
import { USER_RANKS, UserRank } from '@/types/status';


interface UserDetails {
  id: string;
  rank: string;
  level: number;
}

const statusModals = {
  active: {
    title: 'コースの操作を選択',
    message: '現在受講中のコースです。',
    buttons: [
      {
        label: 'コースを選択',
        action: 'select' as CourseAction,
        description: 'このコースの学習を続けます'
      },
      {
        label: 'コースアウトする',
        action: 'format' as CourseAction,
        description: '進捗データがリセットされこのコースとブロック状態のコースが受講可能になります'
      }
    ]
  },
  available: {
    title: 'コースを開始しますか？',
    message: 'このコースを開始すると、他のコースは一時的にブロックされます。',
    buttons: [{
      label: '開始する',
      action: 'activate' as CourseAction,
      description: 'コースを開始します'
    }]
  },
  completed: {
    title: 'コースを選択',
    message: '合格済みのコースです。復習として選択できます。',
    buttons: [{
      label: '選択する',
      action: 'select' as CourseAction,
      description: 'このコースを選択します'
    }]
  },
  perfect: {
    title: 'コースを選択',
    message: '最高成績評価を獲得したコースです。復習として選択できます。',
    buttons: [{
      label: '選択する',
      action: 'select' as CourseAction,
      description: 'このコースを選択します'
    }]
  },
  failed: {
    title: 'コースの操作を選択',
    message: '不合格のコースです。以下の操作を選択できます。',
    buttons: [
      {
        label: '復習として選択',
        action: 'select' as CourseAction,
        description: '現在の状態で復習を行います'
      },
      {
        label: 'データをリセット',
        action: 'format' as CourseAction,
        description: '全データを初期化して最初からやり直します'
      }
    ]
  },
  restricted: {
    title: '受講条件未達成',
    message: (course: Course, userRank: string, userLevel: number) => {
      if (course.rankRequired && USER_RANKS[userRank as UserRank] < USER_RANKS[course.rankRequired as UserRank]) {
        return `必要条件：${course.rankRequired}階級以上`;
      }
      if (course.levelRequired && userLevel < course.levelRequired) {
        return `必要条件：レベル${course.levelRequired}以上`;
      }
      return '受講条件を満たしていません';
    },
    buttons: [{
      label: '閉じる',
      action: null,
      description: null
    }]
  },
  blocked: {
    title: '現在受講できません',
    message: '他のコースが進行中のため、このコースは一時的にブロックされています。コースが完了あるいはコースアウトを選択することで受講可能になります',
    buttons: [{
      label: '閉じる',
      action: null,
      description: null
    }]
  }
};

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
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
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
      }
    };

    const fetchCourses = async () => {
      try {
        const response = await courseApi.getAvailableCourses();
        if (response.success) {
          setCourses(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch courses:', error);
        toast.error('コースの取得に失敗しました');
      }
    };

    const initialize = async () => {
      setLoading(true);
      if (authUser) {
        await Promise.all([fetchUserDetails(), fetchCourses()]);
      }
      setLoading(false);
    };

    initialize();
  }, [authUser]);

  const handleCardClick = (courseId: string, status: CourseStatus) => {
    const course = courses.find(c => c.id === courseId);
    if (!course) return;

    setSelectedCourse(course);
    setShowModal(true);
  };

  const handleModalAction = async (action: CourseAction) => {
    if (!selectedCourse) return;

    try {
      switch (action) {
        case 'select':
          if (!['active', 'completed', 'perfect', 'failed'].includes(selectedCourse.status)) {
            toast.error('このコースは選択できません');
            return;
          }
          const selectResult = await courseApi.selectCourse(selectedCourse.id);
          if (selectResult.success) {
            toast.success('コースを選択しました');
            router.push('/user/home');  // 正確なホームパスに修正
          }
          break;

        case 'activate':
          if (selectedCourse.status !== 'available') {
            toast.error('このコースは開始できません');
            return;
          }
          const activateResult = await courseApi.activateCourse(selectedCourse.id);
          if (activateResult.success) {
            toast.success('コースを開始しました');
            router.push('/user/home');  // 正確なホームパスに修正
          }
          break;

        case 'format':
          if (!['active', 'failed'].includes(selectedCourse.status)) {
            toast.error('このコースは初期化できません');
            return;
          }
          const formatResult = await courseApi.formatCourse(selectedCourse.id);
          if (formatResult.success) {
            toast.success('コースをリセットしました');
            await refreshCourses();
          }
          break;
      }

      setShowModal(false);
      setSelectedCourse(null);
      await refreshCourses();

    } catch (error) {
      console.error('Course action error:', error);
      toast.error('操作に失敗しました');
    }
  };

  const refreshCourses = async () => {
    try {
      const response = await courseApi.getAvailableCourses();
      if (response.success) {
        setCourses(response.data);
      }
    } catch (error) {
      console.error('Refresh courses error:', error);
      toast.error('コース情報の更新に失敗しました');
    }
  };

  if (loading || !userDetails) {
    return <LoadingSpinner />;
  }

  return (
    <div className={`max-w-6xl mx-auto p-4 ${theme === 'dark' ? 'bg-gray-900' : 'bg-[#F8FAFC]'}`}>
    <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg p-4 mb-6 shadow-sm`}>
      <div className="flex flex-col space-y-3">
        {/* ユーザー情報行 */}
        <div className="flex items-center space-x-4">
          <div className="text-sm">
            <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
              現在の階級：
            </span>
            <span className={`font-bold ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`}>
              {userDetails.rank}
            </span>
          </div>
          <div className="text-sm">
            <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
              レベル：
            </span>
            <span className={`font-bold ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>
              {userDetails.level}
            </span>
          </div>
        </div>

        {/* アクティブコース情報行 */}
        {courses.some(course => course.status === 'active') && (
          <div className="text-sm border-t border-gray-200 dark:border-gray-700 pt-3">
            <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
              受講中のコース：
            </span>
            <span className={`font-bold ${theme === 'dark' ? 'text-green-400' : 'text-green-600'} ml-2`}>
              {courses.find(course => course.status === 'active')?.title}
            </span>
          </div>
        )}

        {/* 現在選択中のコース情報行 */}
        {courses.some(course => course.isCurrent) && (
          <div className="text-sm border-t border-gray-200 dark:border-gray-700 pt-3">
            <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
              現在選択中のコース：
            </span>
            <span className={`font-bold ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'} ml-2`}>
              {courses.find(course => course.isCurrent)?.title}
            </span>
          </div>
        )}
      </div>
    </div>
        

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <CourseCard
            key={course.id}
            course={course}
            userRank={userDetails?.rank || 'お試し'}
            userLevel={userDetails?.level || 1}
            onCardClick={handleCardClick}
          />
        ))}
      </div>

      {showModal && selectedCourse && userDetails && (
        <Modal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setSelectedCourse(null);
          }}
          title={statusModals[selectedCourse.status].title}
          content={
            selectedCourse.status === 'restricted'
              ? statusModals.restricted.message(
                  selectedCourse,
                  userDetails.rank,
                  userDetails.level
                )
              : statusModals[selectedCourse.status].message
          }
          buttons={statusModals[selectedCourse.status].buttons}
          onAction={handleModalAction}
        />
      )}
    </div>
  );
}

