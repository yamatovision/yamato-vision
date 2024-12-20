'use client';

import { useTheme } from '@/contexts/theme';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function BottomNavigation() {
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();

  const navItems = [
    { icon: '🏠', href: '/user/home', label: 'ホーム' },
    { icon: '📚', href: '/user/courses', label: 'コース' },
    { icon: '🏆', href: '/user/ranking', label: 'ランキング' },
    { icon: '💭', href: '/user/forum', label: 'フォーラム' },
    { icon: '🛍️', href: '/user/shop', label: 'ショップ' }
  ];

  const baseClasses = theme === 'dark' 
    ? 'fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700'
    : 'fixed bottom-0 left-0 right-0 bg-white border-t border-[#DBEAFE] shadow-lg';

  return (
    <nav className={baseClasses}>
      <div className="max-w-2xl mx-auto flex justify-between items-center p-4">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`text-2xl ${
              pathname === item.href
                ? theme === 'dark' ? 'text-blue-400' : 'text-[#3B82F6]'
                : theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            } hover:opacity-80 transition-opacity`}
          >
            <span role="img" aria-label={item.label}>{item.icon}</span>
          </Link>
        ))}
        
        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className={`text-2xl ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          } hover:opacity-80 transition-opacity`}
        >
          {theme === 'dark' ? '🌙' : '☀️'}
        </button>
      </div>
    </nav>
  );
}
