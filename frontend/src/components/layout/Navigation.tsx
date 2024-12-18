import { FC } from 'react';
import Link from 'next/link';

const Navigation: FC = () => {
  return (
    <nav className="w-64 bg-white shadow-sm h-screen p-4">
      <div className="space-y-4">
        <Link 
          href="/dashboard" 
          className="block px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-md"
        >
          ダッシュボード
        </Link>
        <Link 
          href="/courses" 
          className="block px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-md"
        >
          学習コース
        </Link>
        <Link 
          href="/forum" 
          className="block px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-md"
        >
          フォーラム
        </Link>
        <Link 
          href="/shop" 
          className="block px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-md"
        >
          ショップ
        </Link>
      </div>
    </nav>
  );
};

export default Navigation;
