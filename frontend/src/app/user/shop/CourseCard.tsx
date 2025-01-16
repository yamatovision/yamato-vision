'use client';

import { useTheme } from '@/contexts/theme';
import { Course, CourseStatus } from '@/types/course';
import { UserRank, USER_RANKS } from '@/types/status';  // 追加

interface CourseCardProps {
  course: Course;
  userRank: string;  // 追加
  userLevel: number; // 追加
  onCardClick: (id: string, status: CourseStatus) => void;
}

const StatusRibbon = ({ status, course, userRank, userLevel }: { 
  status: CourseStatus;
  course: Course;
  userRank: string;
  userLevel: number;
}) => {
  // 階級制限チェック
  if (course.rankRequired && USER_RANKS[userRank as UserRank] < USER_RANKS[course.rankRequired as UserRank]) {
    return (
      <div className={`
        absolute -right-12 top-6 
        w-40 text-center
        transform rotate-45
        bg-gray-500/80
        text-white text-sm font-medium
        py-1 px-10
        shadow-md
        z-10
      `}>
        階級制限
      </div>
    );
  }

  // レベル制限チェック
  if (course.levelRequired && userLevel < course.levelRequired) {
    return (
      <div className={`
        absolute -right-12 top-6 
        w-40 text-center
        transform rotate-45
        bg-gray-500/80
        text-white text-sm font-medium
        py-1 px-10
        shadow-md
        z-10
      `}>
        レベル制限
      </div>
    );
  }

  // 既存のステータス表示
  const statusConfig = {
    restricted: { color: 'bg-gray-500/80', text: '階級外' },
    blocked: { color: 'bg-red-500/80', text: 'ブロック中' },
    available: { color: 'bg-blue-500/80', text: '受講可' },
    active: { color: 'bg-green-500/80', text: '受講中' },
    completed: { color: 'bg-purple-500/80', text: '合格' },
    perfect: { color: 'bg-yellow-500/80', text: '秀' },
    failed: { color: 'bg-red-500/80', text: '不合格' }
  };

  return (
    <div className={`
      absolute -right-12 top-6 
      w-40 text-center
      transform rotate-45
      ${statusConfig[status].color}
      text-white text-sm font-medium
      py-1 px-10
      shadow-md
      z-10
    `}>
      {statusConfig[status].text}
    </div>
  );
};

export function CourseCard({ course, userRank, userLevel, onCardClick }: CourseCardProps) {
  const { theme } = useTheme();

  const getGradientStyle = () => {
    if (course.status === 'perfect') {
      return 'bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600';
    }
    return course.gradient;
  };

  const renderThumbnailOrGradient = () => {
    if (course.thumbnail) {
      return (
        <div className="relative h-40 w-full">
          <img
            src={course.thumbnail}
            alt={course.title}
            className="absolute inset-0 w-full h-full object-cover rounded-t-lg"
          />
          <div className="absolute inset-0 bg-black bg-opacity-20 rounded-t-lg" />
        </div>
      );
    }
    return (
      <div className={`h-40 ${getGradientStyle()} rounded-t-lg`} />
    );
  };

  const isClickable = !['restricted', 'blocked'].includes(course.status);

  return (
    <div
      onClick={() => isClickable && onCardClick(course.id, course.status)}
      className={`
        relative 
        ${theme === 'dark' ? 'bg-gray-800' : 'bg-white border border-[#DBEAFE]'} 
        rounded-lg overflow-hidden
        transition-all duration-200
        ${isClickable ? 'cursor-pointer hover:shadow-lg' : 'cursor-not-allowed opacity-90'}
        ${course.isCurrent ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
      `}
    >
      <StatusRibbon 
        status={course.status} 
        course={course} 
        userRank={userRank} 
        userLevel={userLevel}
      />
      {renderThumbnailOrGradient()}

      <div className="p-4">
        <h3 className={`font-bold text-lg mb-2 ${
          theme === 'dark' ? 'text-white' : 'text-[#1E40AF]'
        }`}>
          {course.title}
        </h3>
        <p className={`text-sm ${
          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
        }`}>
          {course.description}
        </p>

        {(course.levelRequired || course.rankRequired) && (
          <div className="mt-4 flex items-center space-x-2">
            {course.levelRequired && (
              <span className={`text-sm ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>
                Lv.{course.levelRequired}
              </span>
            )}
            {course.levelRequired && course.rankRequired && (
              <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                ・
              </span>
            )}
            {course.rankRequired && (
              <span className={`text-sm ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`}>
                {course.rankRequired}階級
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}