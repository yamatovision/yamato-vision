import React from 'react';

interface CourseCardProps {
  title: string;
  description: string;
  status: 'unlocked' | 'available' | 'level_locked' | 'rank_locked' | 'complex';
  gemCost?: number;
  levelRequired?: number;
  rankRequired?: string;
  gradient: string;
  onUnlock: () => void;
}

export const CourseCard: React.FC<CourseCardProps> = ({
  title,
  description,
  status,
  gemCost,
  levelRequired,
  rankRequired,
  gradient,
  onUnlock,
}) => {
  const getStatusBadge = () => {
    const badges = {
      unlocked: { text: '解放済み', color: 'bg-green-500' },
      available: { text: 'ジェム解放可能', color: 'bg-yellow-500' },
      level_locked: { text: 'レベル制限', color: 'bg-purple-500' },
      rank_locked: { text: `${rankRequired}限定`, color: 'bg-red-500' },
      complex: { text: '特別コース', color: 'bg-green-500' },
    };
    const badge = badges[status];
    return (
      <span className={`absolute top-2 right-2 ${badge.color} text-xs px-2 py-1 rounded-full`}>
        {badge.text}
      </span>
    );
  };

  const getButton = () => {
    switch (status) {
      case 'unlocked':
        return (
          <button 
            className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded-lg"
            onClick={onUnlock}
          >
            受講開始
          </button>
        );
      case 'available':
        return (
          <button 
            className="w-full bg-yellow-600 hover:bg-yellow-700 py-2 rounded-lg"
            onClick={onUnlock}
          >
            ジェムで解放
          </button>
        );
      default:
        return (
          <button 
            className="w-full bg-gray-700 py-2 rounded-lg cursor-not-allowed" 
            disabled
          >
            {levelRequired ? `レベル${levelRequired}で解放` : `${rankRequired}にアップグレード`}
          </button>
        );
    }
  };

  return (
    <div className={`bg-gray-800 rounded-lg overflow-hidden ${status !== 'unlocked' && status !== 'available' ? 'opacity-75' : ''}`}>
      <div className={`h-40 ${gradient} relative`}>
        {getStatusBadge()}
      </div>
      <div className="p-4">
        <h3 className="font-bold text-lg mb-2 text-white">{title}</h3>
        <p className="text-sm text-gray-400 mb-4">
          {description}
        </p>
        {(gemCost || levelRequired || rankRequired) && (
          <div className="flex justify-between items-center mb-4">
            {levelRequired && (
              <div className="flex items-center space-x-2">
                <span className="text-blue-400">Lv.{levelRequired}</span>
                <span className="text-gray-400">必要</span>
              </div>
            )}
            {gemCost && (
              <div className="flex items-center space-x-2">
                <span className="text-yellow-400">💎</span>
                <span className="text-white">{gemCost}</span>
              </div>
            )}
            {rankRequired && (
              <span className="text-sm text-gray-400">または {rankRequired}階級</span>
            )}
          </div>
        )}
        {getButton()}
      </div>
    </div>
  );
};
