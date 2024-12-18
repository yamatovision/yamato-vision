import { FC } from 'react';
import Link from 'next/link';

const Header: FC = () => {
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-gray-900">
              大和ViSiON
            </Link>
          </div>
          <nav className="flex items-center space-x-4">
            <Link href="/profile" className="text-gray-600 hover:text-gray-900">
              プロフィール
            </Link>
            <Link href="/courses" className="text-gray-600 hover:text-gray-900">
              コース一覧
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
