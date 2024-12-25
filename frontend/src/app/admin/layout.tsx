'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AdminLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isCoursesExpanded, setIsCoursesExpanded] = useState(false);

  useEffect(() => {
    // パスに基づいてコースメニューの展開状態を設定
    setIsCoursesExpanded(pathname?.includes('/admin/courses') ?? false);
  }, [pathname]);

  useEffect(() => {
    if (!user || user.rank !== '管理者') {
      router.push('/');
    }
  }, [user, router]);

  if (!user || user.rank !== '管理者') {
    return null;
  }

  // アクティブなリンクのスタイル
  const isActive = (path: string) => {
    return pathname === path ? 'bg-[#F0F4F8]' : '';
  };

  return (
    <div className="grid h-screen" style={{ gridTemplateColumns: '280px 1fr' }}>
      {/* サイドバー */}
      <aside className="bg-white border-r overflow-y-auto">
        <div className="p-6">
          <h1 className="text-xl font-semibold text-[#2C3E50]">管理者ダッシュボード</h1>
        </div>
        <nav className="px-4">
          <a 
            href="/admin" 
            className={`flex items-center gap-3 px-4 py-3 text-[#2C3E50] hover:bg-[#F0F4F8] rounded-md ${isActive('/admin')}`}
          >
            <span>📊</span>
            <span>ダッシュボード</span>
          </a>
          
          {/* コース管理セクション */}
          <div className="mb-2">
        
  <button
    onClick={() => setIsCoursesExpanded(!isCoursesExpanded)}
    className="w-full flex items-center gap-3 px-4 py-3 text-[#2C3E50] hover:bg-[#F0F4F8] rounded-md"
  >
    <span>📚</span>
    <span>コース管理</span>
    <span className="ml-auto">
      {isCoursesExpanded ? '▼' : '▶'}
    </span>
  </button>
  
  {isCoursesExpanded && (
    <div className="ml-4 space-y-1">
      <a
        href="/admin/courses"
        className={`flex items-center gap-2 px-4 py-2 text-sm text-[#2C3E50] hover:bg-[#F0F4F8] rounded-md ${isActive('/admin/courses')}`}
      >
        <span>📋</span>
        <span>コース一覧</span>
      </a>
      <a
        href="/admin/courses/new"
        className={`flex items-center gap-2 px-4 py-2 text-sm text-[#2C3E50] hover:bg-[#F0F4F8] rounded-md ${isActive('/admin/courses/new')}`}
      >
        <span>✨</span>
        <span>新規コース作成</span>
      </a>
      {pathname?.includes('/admin/courses') && !pathname?.includes('/admin/courses/new') && pathname !== '/admin/courses' && (
  <>
    <a
      href={`${pathname}`}
      className={`flex items-center gap-2 px-4 py-2 text-sm text-[#2C3E50] hover:bg-[#F0F4F8] rounded-md ${isActive(pathname)}`}
    >
      <span>📖</span>
      <span>コース詳細</span>
    </a>
    <a
      href={`${pathname}/chapters`}
      className={`flex items-center gap-2 px-4 py-2 text-sm text-[#2C3E50] hover:bg-[#F0F4F8] rounded-md ${isActive(`${pathname}/chapters`)}`}
    >
      <span>📑</span>
      <span>チャプター管理</span>
    </a>
  </>
)}
    </div>
  )}
</div>

          <a 
            href="/admin/level-messages" 
            className={`flex items-center gap-3 px-4 py-3 text-[#2C3E50] hover:bg-[#F0F4F8] rounded-md ${isActive('/admin/level-messages')}`}
          >
            <span>⚡</span>
            <span>レベルメッセージ管理</span>
          </a>    
          
          <a 
            href="/admin/notices" 
            className={`flex items-center gap-3 px-4 py-3 text-[#2C3E50] hover:bg-[#F0F4F8] rounded-md ${isActive('/admin/notices')}`}
          >
            <span>📢</span>
            <span>お知らせ管理</span>
          </a>
          
          <a 
            href="/admin/users" 
            className={`flex items-center gap-3 px-4 py-3 text-[#2C3E50] hover:bg-[#F0F4F8] rounded-md ${isActive('/admin/users')}`}
          >
            <span>👥</span>
            <span>ユーザー管理</span>
          </a>
          
          <a 
            href="/admin/badges" 
            className={`flex items-center gap-3 px-4 py-3 text-[#2C3E50] hover:bg-[#F0F4F8] rounded-md ${isActive('/admin/badges')}`}
          >
            <span>🏆</span>
            <span>バッジ管理</span>
          </a>
          
          <a 
            href="/admin/events" 
            className={`flex items-center gap-3 px-4 py-3 text-[#2C3E50] hover:bg-[#F0F4F8] rounded-md ${isActive('/admin/events')}`}
          >
            <span>🎮</span>
            <span>イベント管理</span>
          </a>
          
          <a 
            href="/admin/forum" 
            className={`flex items-center gap-3 px-4 py-3 text-[#2C3E50] hover:bg-[#F0F4F8] rounded-md ${isActive('/admin/forum')}`}
          >
            <span>💬</span>
            <span>フォーラム管理</span>
          </a>
          
          <a 
            href="/admin/shop" 
            className={`flex items-center gap-3 px-4 py-3 text-[#2C3E50] hover:bg-[#F0F4F8] rounded-md ${isActive('/admin/shop')}`}
          >
            <span>🛍</span>
            <span>ショップ管理</span>
          </a>
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