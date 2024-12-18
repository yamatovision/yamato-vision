'use client';

import { useTheme } from '@/context/ThemeContext';

export function DailyMissions() {
  const { theme } = useTheme();
  
  const missions = [
    {
      title: 'コメント投稿',
      progress: '1/3',
      reward: 5
    },
    {
      title: '課題提出',
      progress: '0/1',
      reward: 10
    },
    {
      title: 'フォーラム閲覧',
      progress: '4/5',
      reward: 3
    }
  ];

  return (
    <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6`}>
      <h2 className={`text-xl font-bold mb-4 ${
        theme === 'dark' ? 'text-white' : 'text-[#1E40AF]'
      }`}>デイリーミッション</h2>
      
      <div className="space-y-3">
        {missions.map((mission, index) => (
          <div 
            key={index}
            className={`${
              theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
            } rounded-lg p-3`}
          >
            <div className="flex justify-between items-center">
              <div>
                <div className={`font-bold ${
                  theme === 'dark' ? 'text-white' : 'text-[#1E40AF]'
                }`}>{mission.title}</div>
                <div className={`text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}>{mission.progress} 完了</div>
              </div>
              <div className="flex items-center space-x-1">
                <span className="text-yellow-400">💎</span>
                <span className={`${
                  theme === 'dark' ? 'text-white' : 'text-[#1E40AF]'
                }`}>+{mission.reward}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

  
    </div>
  );
}
