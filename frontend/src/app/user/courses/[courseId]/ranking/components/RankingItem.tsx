import { RankingUser } from '@/types/ranking';
import { useTheme } from '@/contexts/theme';

interface RankingItemProps {
  user: RankingUser;
  rank: number;
}

export function RankingItem({ user, rank }: RankingItemProps) {
  const { theme } = useTheme();

  return (
    <div className={`${
      rank === 1
        ? theme === 'dark' 
          ? 'bg-gradient-to-r from-yellow-900 to-yellow-700' 
          : 'bg-gradient-to-r from-blue-50 via-blue-100 to-indigo-100 border border-blue-200'
        : theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
    } rounded-lg p-4 mb-3`}>
      <div className="flex items-center space-x-3">
        <div className={`${
          rank === 1
            ? theme === 'dark'
              ? 'text-yellow-400'
              : 'bg-blue-500/10 text-blue-600'
            : theme === 'dark'
              ? 'bg-gray-600 text-gray-300'
              : 'bg-gray-200 text-gray-600'
        } w-6 h-6 rounded-full flex items-center justify-center font-bold text-sm`}>
          {rank}
        </div>
        <img 
          src={user.avatarUrl || "https://placehold.jp/30x30.png"} 
          className="w-8 h-8 rounded-full" 
          alt={user.name || "ユーザー"}
        />
        <div>
          <div className={`font-bold ${
            theme === 'dark' ? 'text-white' : 'text-[#1E40AF]'
          }`}>{user.name}</div>
          <div className="flex items-center space-x-2">
            <span className={`text-sm ${
              theme === 'dark' ? 'text-gray-300' : 'text-blue-600'
            }`}>{user.averageScore.toFixed(1)} pts</span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              theme === 'dark'
                ? 'bg-gray-600 text-gray-300'
                : 'bg-gray-200 text-gray-600'
            }`}>{user.submissionCount} 回</span>
          </div>
        </div>
      </div>
    </div>
  );
}
