'use client';

import { useTheme } from '@/context/ThemeContext';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function SideNavigation() {
  const { theme } = useTheme();
  const pathname = usePathname();

  const navItems = [
    { icon: '🏠', href: '/', label: 'ホーム' },
    { icon: '📚', href: '/courses', label: 'コース' },
    { icon: '🏆', href: '/ranking', label: 'ランキング' },
    { icon: '💭', href: '/forum', label: 'フォーラム' },
  ];

  return (
    <nav className={`
      fixed left-0 top-0 bottom-0 w-20
      ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}
      border-r ${theme === 'dark' ? 'border-gray-700' : 'border-[#DBEAFE]'}
    `}>
      <div className="flex flex-col items-center py-6 space-y-8">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`
              w-12 h-12 rounded-xl flex items-center justify-center text-2xl
              transition-colors
              ${pathname === item.href
                ? theme === 'dark'
                  ? 'bg-blue-600'
                  : 'bg-[#3B82F6] text-white'
                : theme === 'dark'
                  ? 'bg-gray-700 text-gray-400'
                  : 'bg-[#DBEAFE] text-gray-600'
              }
            `}
          >
            <span role="img" aria-label={item.label}>{item.icon}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
