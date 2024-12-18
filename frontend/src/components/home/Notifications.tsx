'use client';

import { useTheme } from '@/context/ThemeContext';

export function Notifications() {
  const { theme } = useTheme();
  
  const notifications = [
    {
      title: "新コース追加",
      date: "2024/01/15",
      type: "info",
      borderColor: "border-blue-500"
    },
    {
      title: "メンテナンス予定",
      date: "2024/01/20",
      type: "maintenance",
      borderColor: "border-yellow-500"
    },
    {
      title: "アップデート完了",
      date: "2024/01/14",
      type: "success",
      borderColor: "border-green-500"
    }
  ];

  return (
    <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6`}>
      <h2 className={`text-xl font-bold mb-4 ${
        theme === 'dark' ? 'text-white' : 'text-[#1E40AF]'
      }`}>お知らせ</h2>
      
      <div className="space-y-3">
        {notifications.map((notification, index) => (
          <div 
            key={index}
            className={`border-l-4 ${notification.borderColor} pl-3 py-2`}
          >
            <div className={`font-bold ${
              theme === 'dark' ? 'text-white' : 'text-[#1E40AF]'
            }`}>{notification.title}</div>
            <div className={`text-sm ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`}>{notification.date}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
