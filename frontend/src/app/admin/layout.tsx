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
      <aside className="bg-white border-r overflow-y-auto">
        <div className="p-6">
          <h1 className="text-xl font-semibold text-[#2C3E50]">管理者ダッシュボード</h1>
        </div>
        <nav className="px-4">
          <Link 
            href="/admin" 
            className={`flex items-center gap-3 px-4 py-3 text-[#2C3E50] hover:bg-[#F0F4F8] rounded-md ${isActive('/admin')}`}
          >
            <span>📊</span>
            <span>ダッシュボード</span>
          </Link>
          
          {/* コース管理セクション */}
          <div className="mb-2">
            <button
              onClick={() => setIsCoursesExpanded(!isCoursesExpanded)}
              className="w-full flex items-center gap-3 px-4 py-3 text-[#1A365D] hover:bg-[#F0F4F8] rounded-md font-medium"
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
      className={`flex items-center gap-2 px-4 py-2 text-sm text-[#1A365D] hover:bg-[#F0F4F8] rounded-md ${
        pathname === '/admin/courses' ? 'bg-[#F0F4F8] font-medium' : ''
      }`}
    >
      <span>📋</span>
      <span>コース一覧</span>
    </Link>
    {courseId && courseId !== 'new' && (
      <>
        <Link
          href={`/admin/courses/${courseId}`}
          className={`flex items-center gap-2 px-4 py-2 text-sm text-[#1A365D] hover:bg-[#F0F4F8] rounded-md ${
            pathname === `/admin/courses/${courseId}` ? 'bg-[#F0F4F8] font-medium' : ''
          }`}
        >
          <span>📖</span>
          <span>基本情報</span>
        </Link>
        <Link
          href={`/admin/courses/${courseId}/chapters`}
          className={`flex items-center gap-2 px-4 py-2 text-sm text-[#1A365D] hover:bg-[#F0F4F8] rounded-md ${
            isChaptersPage ? 'bg-[#F0F4F8] font-medium' : ''
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

          <Link 
            href="/admin/level-messages" 
            className={`flex items-center gap-3 px-4 py-3 text-[#2C3E50] hover:bg-[#F0F4F8] rounded-md ${isActive('/admin/level-messages')}`}
          >
            <span>⚡</span>
            <span>レベルメッセージ管理</span>
          </Link>    
          
          <Link 
            href="/admin/notices" 
            className={`flex items-center gap-3 px-4 py-3 text-[#2C3E50] hover:bg-[#F0F4F8] rounded-md ${isActive('/admin/notices')}`}
          >
            <span>📢</span>
            <span>お知らせ管理</span>
          </Link>
          
          <Link 
            href="/admin/users" 
            className={`flex items-center gap-3 px-4 py-3 text-[#2C3E50] hover:bg-[#F0F4F8] rounded-md ${isActive('/admin/users')}`}
          >
            <span>👥</span>
            <span>ユーザー管理</span>
          </Link>
          
          <Link 
            href="/admin/badges" 
            className={`flex items-center gap-3 px-4 py-3 text-[#2C3E50] hover:bg-[#F0F4F8] rounded-md ${isActive('/admin/badges')}`}
          >
            <span>🏆</span>
            <span>バッジ管理</span>
          </Link>
          
          <Link 
            href="/admin/events" 
            className={`flex items-center gap-3 px-4 py-3 text-[#2C3E50] hover:bg-[#F0F4F8] rounded-md ${isActive('/admin/events')}`}
          >
            <span>🎮</span>
            <span>イベント管理</span>
          </Link>
          
          <Link 
            href="/admin/forum" 
            className={`flex items-center gap-3 px-4 py-3 text-[#2C3E50] hover:bg-[#F0F4F8] rounded-md ${isActive('/admin/forum')}`}
          >
            <span>💬</span>
            <span>フォーラム管理</span>
          </Link>
          
          <Link 
            href="/admin/shop" 
            className={`flex items-center gap-3 px-4 py-3 text-[#2C3E50] hover:bg-[#F0F4F8] rounded-md ${isActive('/admin/shop')}`}
          >
            <span>🛍</span>
            <span>ショップ管理</span>
          </Link>
        </nav>
      </aside>

      {/* メインコンテンツ */}
      <main className="bg-[#F5F7FB] overflow-auto">
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}