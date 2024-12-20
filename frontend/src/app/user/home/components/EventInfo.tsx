'use client';

import { useTheme } from '@/contexts/theme';  // パスを修正

export function EventInfo() {
  const { theme } = useTheme();
  
  const events = [
    {
      title: "AIチャレンジコンテスト",
      date: "2024/01/20 開催",
      tag: "コンテスト",
      description: "優秀な成績を収めた方には特別なバッジを進呈！",
      status: "参加受付中"
    },
    {
      title: "週末特別セミナー",
      date: "2024/01/27 14:00~",
      tag: "セミナー",
      description: "AI業界の第一線で活躍する講師陣によるライブセッション",
      status: "予約受付中"
    }
  ];

  return (
    <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6`}>
      <h2 className={`text-xl font-bold mb-4 ${
        theme === 'dark' ? 'text-white' : 'text-[#1E40AF]'
      }`}>イベント情報</h2>
      
      <div className="space-y-4">
        {events.map((event, index) => (
          <div 
            key={index}
            className={`${
              theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'
            } rounded-lg p-4 hover:transform hover:scale-[1.02] transition-transform cursor-pointer`}
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className={`font-bold ${
                  theme === 'dark' ? 'text-white' : 'text-[#1E40AF]'
                }`}>{event.title}</h3>
                <p className={`text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}>{event.date}</p>
              </div>
              <span className={`px-2 py-1 rounded text-xs ${
                theme === 'dark' 
                  ? 'bg-blue-900/50 text-blue-400' 
                  : 'bg-blue-100 text-blue-600'
              }`}>
                {event.tag}
              </span>
            </div>
            <p className={`text-sm mb-2 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              {event.description}
            </p>
            <div className="flex justify-between items-center">
              <span className={`text-xs ${
                theme === 'dark' ? 'text-green-400' : 'text-green-600'
              }`}>
                {event.status}
              </span>
              <button className={`px-3 py-1 rounded text-sm ${
                theme === 'dark'
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-blue-400 hover:bg-blue-500 text-white'
              } transition-colors`}>
                詳細を見る
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
