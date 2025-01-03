'use client';

import { useTheme } from '@/contexts/theme';
import { Course } from '@/types/course';

// 階級の優先順位を定義
const RANK_PRIORITIES = {
  'お試し': { value: 'お試し', label: 'お試し', priority: 1 },
  '初伝': { value: '初伝', label: '初伝', priority: 2 },
  '中伝': { value: '中伝', label: '中伝', priority: 3 },
  '奥伝': { value: '奥伝', label: '奥伝', priority: 4 },
  '皆伝': { value: '皆伝', label: '皆伝', priority: 5 }
} as const;

// 選択した階級以上のランクを取得する関数
const getHigherRanks = (selectedRank: string): string => {
  if (!selectedRank) return '';
  
  const priority = RANK_PRIORITIES[selectedRank as keyof typeof RANK_PRIORITIES]?.priority;
  if (priority === undefined) return '';

  return Object.entries(RANK_PRIORITIES)
    .filter(([_, rank]) => rank.priority >= priority)
    .map(([_, rank]) => rank.label)
    .join('、');
};

interface CourseCardProps {
  course: Course;
  onEdit: (courseId: string) => void;
  onDelete: (courseId: string) => void;
  onPublish: (courseId: string) => void;
}

export function CourseCard({
  course,
  onEdit,
  onDelete,
  onPublish,
}: CourseCardProps) {
  const { theme } = useTheme();

  const getStatusBadge = () => {
    if (course.isPublished) {
      return (
        <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs">
          公開中
        </span>
      );
    }
    return (
      <span className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs">
        下書き
      </span>
    );
  };

  const getRequirementText = () => {
    const requirements = [];
    
    if (course.levelRequired) {
      requirements.push(`レベル ${course.levelRequired} 以上`);
    }
    
    if (course.rankRequired) {
      const higherRanks = getHigherRanks(course.rankRequired);
    }

    if (requirements.length === 0) {
      return '条件なし';
    }

    return (
      <div className="space-y-1">
        {requirements.map((req, index) => (
          <p key={index}>{req}</p>
        ))}
        <p className="text-sm text-gray-500">
          {course.requirementType === 'AND' 
            ? 'すべての条件を満たす必要があります' 
            : 'いずれかの条件を満たす必要があります'}
        </p>
      </div>
    );
  };

  return (
    <div className={`${
      theme === 'dark' ? 'bg-gray-800' : 'bg-white'
    } rounded-lg shadow-sm overflow-hidden border ${
      theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
    }`}>
      {course.thumbnail && (
        <div className="w-full h-48 relative">
          <img
            src={course.thumbnail}
            alt={course.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="p-4">
        <div className="flex justify-between items-start mb-4">
          <h3 className={`font-bold text-lg ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            {course.title}
          </h3>
          {getStatusBadge()}
        </div>

        <p className={`text-sm mb-4 ${
          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
        }`}>
          {course.description}
        </p>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className={`text-xs ${
              theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
            }`}>
              受講条件
            </p>
            <div className={`font-medium ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              {getRequirementText()}
            </div>
          </div>
          <div>
            <p className={`text-xs ${
              theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
            }`}>
              チャプター数
            </p>
            <p className={`font-bold ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              {course.chapters?.length || 0}
            </p>
          </div>
        </div>

        <div className={`border-t ${
          theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
        } pt-4`}>
          <div className="flex justify-between items-center">
            <div className="flex space-x-2">
              <button
                onClick={() => onEdit(course.id)}
                className="text-blue-500 hover:text-blue-600 text-sm"
              >
                編集
              </button>
              <button
                onClick={() => onDelete(course.id)}
                className="text-red-500 hover:text-red-600 text-sm"
              >
                削除
              </button>
            </div>
            {!course.isPublished && (
              <button
                onClick={() => onPublish(course.id)}
                className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-lg text-sm"
              >
                公開する
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}