'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/theme';
import { CourseCard } from './CourseCard';
import { courseApi } from '@/lib/api/courses';
import { useAuth } from '@/lib/hooks/useAuth';
import { Course, CourseStatus } from '@/types/course';
import { toast } from 'react-hot-toast';
import { ActivationModal } from './ActivationModal';
import { PurchaseSuccessModal } from './PurchaseSuccessModal';
import { RepurchaseConfirmModal } from './RepurchaseConfirmModal';
import api from '@/lib/api/auth';
import { useRouter } from 'next/navigation';
import { ShopCourse } from '@/types/course';



interface UserDetails {
  id: string;
  rank: string;
  level: number;
  gems: number;
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
  
  // モーダル状態管理
  const [activatingCourse, setActivatingCourse] = useState<string | null>(null);
  const [showActivationModal, setShowActivationModal] = useState(false);
  const [showPurchaseSuccess, setShowPurchaseSuccess] = useState(false);
  const [purchasedCourse, setPurchasedCourse] = useState<Course | null>(null);
  const [showRepurchaseModal, setShowRepurchaseModal] = useState(false);
  const [repurchasingCourse, setRepurchasingCourse] = useState<Course | null>(null);

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
            level: userData.level,
            gems: userData.gems || 0
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

  // コース一覧の取得
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setCoursesLoading(true);
        const response = await courseApi.getAvailableCourses();
        if (response.success) {
          const formattedCourses = response.data.map((apiCourse: any) => ({
            id: apiCourse.id,
            title: apiCourse.title,
            description: apiCourse.description,
            status: mapApiStatusToCourseStatus(apiCourse.status), // ここを修正
            gemCost: apiCourse.gemCost,
            levelRequired: apiCourse.levelRequired,
            rankRequired: apiCourse.rankRequired,
            gradient: apiCourse.gradient,
            thumbnail: apiCourse.thumbnail,
            completion: apiCourse.completion,
            archiveUntil: apiCourse.archiveUntil,
            // ShopCourse の必須フィールドを追加
            createdAt: apiCourse.createdAt,
            updatedAt: apiCourse.updatedAt,
            passingScore: apiCourse.passingScore,
            excellentScore: apiCourse.excellentScore,
            isPublished: apiCourse.isPublished,
            isArchived: apiCourse.isArchived
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
  // コース操作のハンドラー
  const handleUnlock = async (courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    if (!course) return;
  
    switch (course.status) {
      case 'available':
        try {
          const result = await courseApi.purchaseCourse(courseId);
          if (result.success) {
            setPurchasedCourse(course);
            setShowPurchaseSuccess(true);
            await refreshCourses();
          }
        } catch (error: any) {
          toast.error(error.message || 'コースの解放に失敗しました');
        }
        break;


      case 'available':
        setActivatingCourse(courseId);
        setShowActivationModal(true);
        break;

      case 'active':
      case 'perfect':
      case 'completed':
        case 'certified': // certified ステータスを追加
        try {
          const response = await courseApi.getCurrentChapter(courseId);
          if (response.success && response.data) {
            router.push(`/user/courses/${courseId}/chapters/${response.data.id}`);
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
  if (response.success) {
    const formattedCourses: ShopCourse[] = response.data.map((apiCourse: any) => ({
      id: apiCourse.id,
      title: apiCourse.title,
      description: apiCourse.description,
      // status の変換処理を追加
      status: mapApiStatusToCourseStatus(apiCourse.status),
      gemCost: apiCourse.gemCost,
      levelRequired: apiCourse.levelRequired,
      rankRequired: apiCourse.rankRequired,
      gradient: apiCourse.gradient || 'bg-gradient-to-r from-blue-500 to-purple-500',
      completion: apiCourse.completion,
      archiveUntil: apiCourse.archiveUntil,
      // ShopCourse必須フィールドの追加
      passingScore: apiCourse.passingScore || 0,
      excellentScore: apiCourse.excellentScore || 0,
      isPublished: apiCourse.isPublished || false,
      isArchived: apiCourse.isArchived || false,
      createdAt: new Date(apiCourse.createdAt),
      updatedAt: new Date(apiCourse.updatedAt)
    }));
    setCourses(formattedCourses);
  }
};

// ステータスマッピング用の関数を追加
const mapApiStatusToCourseStatus = (apiStatus: string): CourseStatus => {
  switch (apiStatus) {
    case 'unlocked':
    case 'available':
      return 'available';
    case 'active':
      return 'active';
    case 'completed':
    case 'completed_archive':
      return 'completed';
    case 'certified':
      return 'certified';
    case 'perfect':
      return 'perfect';
    case 'failed':
      return 'failed';
    case 'level_locked':
    case 'rank_locked':
    case 'complex':
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
        restricted: 6,   // 条件未達成
        available: 2,    // 受講可能
        active: 0,       // 受講中
        completed: 4,    // 通常クリア
        certified: 3,    // 認証バッジ獲得
        perfect: 1,      // パーフェクト達成
        failed: 5        // 失敗
      };
      return (statusPriority[a.status] || 0) - (statusPriority[b.status] || 0);
    });
  }, [courses, filter, searchTerm]);

  if (userLoading || coursesLoading || !userDetails) {
    return <LoadingSpinner />;
  }

  return (
    <div className={`max-w-6xl mx-auto p-4 ${theme === 'dark' ? 'bg-gray-900' : 'bg-[#F8FAFC]'}`}>
      {/* ユーザー情報パネル */}
      <div className={theme === 'dark' ? 'bg-gray-800 rounded-lg p-4 mb-6' : 'bg-white rounded-lg p-4 mb-6 border border-[#DBEAFE] shadow-sm'}>
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
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-yellow-400 text-xl">💎</span>
              <span className={theme === 'dark' ? 'font-bold text-white' : 'font-bold text-[#1E40AF]'}>
                {userDetails.gems}
              </span>
              <span className={theme === 'dark' ? 'text-gray-400 text-sm' : 'text-gray-500 text-sm'}>ジェム</span>
            </div>
          </div>
        </div>
      </div>

      {/* コース一覧 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => (
         <CourseCard
         key={course.id}
         {...course}
         gradient={course.gradient || 'default-gradient'} // デフォルト値を設定
         status={course.status}
         onUnlock={() => handleUnlock(course.id)}
       />
        ))}
      </div>

      {/* モーダル群 */}
      <ActivationModal
  isOpen={showActivationModal}
  onClose={() => {
    setShowActivationModal(false);
    setActivatingCourse(null);
  }}
  onConfirm={async () => {
    if (!activatingCourse) return;
    try {
      const result = await courseApi.startCourse(activatingCourse);
      if (result.success) {
        toast.success('コースを開始しました！');
        await refreshCourses();
        
        // 現在のチャプターを取得して直接そこにリダイレクト
        const currentChapterResponse = await courseApi.getCurrentChapter(activatingCourse);
        if (currentChapterResponse.success && currentChapterResponse.data) {
          router.push(`/user/courses/${activatingCourse}/chapters/${currentChapterResponse.data.chapterId}`);
        } else {
          throw new Error('Failed to get current chapter');
        }
      }
    } catch (error: any) {
      console.error('Error starting course:', error);
      toast.error(error.message || 'コースの開始に失敗しました');
    } finally {
      setShowActivationModal(false);
      setActivatingCourse(null);
    }
  }}
  hasCurrentCourse={courses.some(c => c.status === 'active')}
/>
{purchasedCourse && (
  <PurchaseSuccessModal
    isOpen={showPurchaseSuccess}
    onClose={() => setShowPurchaseSuccess(false)}
    courseTitle={purchasedCourse.title}
    onStart={() => {
      setShowPurchaseSuccess(false);
      // アクティベーションモーダルを表示
      setActivatingCourse(purchasedCourse.id);
      setShowActivationModal(true);
    }}
  />
)}

      {repurchasingCourse && (
        <RepurchaseConfirmModal
          isOpen={showRepurchaseModal}
          onClose={() => {
            setShowRepurchaseModal(false);
            setRepurchasingCourse(null);
          }}
          courseTitle={repurchasingCourse.title}
          gemCost={Math.floor((repurchasingCourse.gemCost || 0) / 10)}
          onConfirm={async () => {
            if (!activatingCourse) return;
            try {
              const result = await courseApi.startCourse(activatingCourse);
              if (result.success) {
                toast.success('コースを開始しました！');
                await refreshCourses();
                
                // 現在のチャプターを取得して直接そこにリダイレクト
                const currentChapterResponse = await courseApi.getCurrentChapter(activatingCourse);
                console.log('Current chapter response:', currentChapterResponse); // デバッグ用
          
                if (currentChapterResponse.success && currentChapterResponse.data?.chapter?.id) {
                  router.push(`/user/courses/${activatingCourse}/chapters/${currentChapterResponse.data.chapter.id}`);
                } else {
                  throw new Error('Failed to get current chapter');
                }
              }
            } catch (error: any) {
              console.error('Error starting course:', error);
              toast.error(error.message || 'コースの開始に失敗しました');
            } finally {
              setShowActivationModal(false);
              setActivatingCourse(null);
            }
          }}
        />
      )}
    </div>
  );
}