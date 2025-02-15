'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function AdminLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isCoursesExpanded, setIsCoursesExpanded] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    setIsCoursesExpanded(pathname?.includes('/admin/courses') ?? false);
  }, [pathname]);

  useEffect(() => {
    if (!loading && (!user || user.rank !== '管理者')) {
      router.push('/');
    }
  }, [user, router, loading]);

  // クライアントサイドレンダリングが開始されるまで何も表示しない
  if (!isClient) {
    return null;
  }

  // ローディング中は何も表示しない
  if (loading) {
    return null;
  }

  if (!user || user.rank !== '管理者') {
    return null;
  }


const courseId = pathname?.split('/courses/')?.[1]?.split('/')?.[0];
const isChaptersPage = pathname?.includes('/chapters');
  // アクティブなリンクのスタイル
  const isActive = (path: string) => {
    return pathname === path ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400' : '';
  };

  return (
    <div className="grid h-screen" style={{ gridTemplateColumns: '280px 1fr' }}>
      {/* サイドバー */}
      <aside className="bg-white border-r border-gray-200 overflow-y-auto">
        <div className="p-6">
          <h1 className="text-xl font-semibold text-gray-800">管理者ダッシュボード</h1>
        </div>
        <nav className="px-4">
          <Link 
            href="/admin" 
            className={`flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-md ${
              isActive('/admin') ? 'bg-gray-50 font-medium' : ''
            }`}
          >
            <span>📊</span>
            <span>ダッシュボード</span>
          </Link>
          
          {/* コース管理セクション */}
          <div className="mb-2">
            <button
              onClick={() => setIsCoursesExpanded(!isCoursesExpanded)}
              className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-md font-medium"
            >
              <span>📚</span>
              <span>コース管理</span>
              <span className="ml-auto">
                {isCoursesExpanded ? '▼' : '▶'}
              </span>
            </button>
            
            {isCoursesExpanded && (
              <div className="ml-4 space-y-1">
                <Link
                  href="/admin/courses"
                  className={`flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-md ${
                    isActive('/admin/courses') ? 'bg-gray-50 font-medium text-gray-900' : ''
                  }`}
                >
                  <span>📋</span>
                  <span>コース一覧</span>
                </Link>
                {pathname?.includes('/admin/courses') && !pathname?.includes('/admin/courses/new') && pathname !== '/admin/courses' && (
                  <>
                    <Link
                      href={pathname}
                      className={`flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-md ${
                        isActive(pathname) ? 'bg-gray-50 font-medium text-gray-900' : ''
                      }`}
                    >
                      <span>📖</span>
                      <span>基本情報</span>
                    </Link>
                    <Link
                      href={`${pathname}/chapters`}
                      className={`flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-md ${
                        isActive(`${pathname}/chapters`) ? 'bg-gray-50 font-medium text-gray-900' : ''
                      }`}
                    >
                      <span>📑</span>
                      <span>チャプター管理</span>
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>

          {/* その他のナビゲーションリンク */}
          {[
            { href: '/admin/level-messages', icon: '⚡', label: 'レベルメッセージ管理' },
            { href: '/admin/notices', icon: '📢', label: 'お知らせ管理' },
            { href: '/admin/users', icon: '👥', label: 'ユーザー管理' },
            { href: '/admin/badges', icon: '🏆', label: 'バッジ管理' },
            { href: '/admin/events', icon: '🎮', label: 'イベント管理' },
            { href: '/admin/forum', icon: '💬', label: 'フォーラム管理' },
            { href: '/admin/shop', icon: '🛍', label: 'ショップ管理' },
          ].map(({ href, icon, label }) => (
            <Link 
              key={href}
              href={href} 
              className={`flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-md ${
                isActive(href) ? 'bg-gray-50 font-medium' : ''
              }`}
            >
              <span>{icon}</span>
              <span>{label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* メインコンテンツ */}
      <main className="bg-gray-50 overflow-auto">
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}