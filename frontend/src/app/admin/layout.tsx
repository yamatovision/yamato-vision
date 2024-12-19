export default function AdminLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid h-screen" style={{ gridTemplateColumns: '280px 1fr' }}>
      {/* サイドバー */}
      <aside className="bg-white border-r">
        <div className="p-6">
          <h1 className="text-xl font-semibold text-[#2C3E50]">管理者ダッシュボード</h1>
        </div>
        <nav className="px-4">
          <a href="/admin" className="flex items-center gap-3 px-4 py-3 text-[#2C3E50] hover:bg-[#F0F4F8] rounded-md">
            <span>📊</span>
            <span>ダッシュボード</span>
          </a>
          <a href="/admin/notices" className="flex items-center gap-3 px-4 py-3 text-[#2C3E50] hover:bg-[#F0F4F8] rounded-md">
            <span>📢</span>
            <span>お知らせ管理</span>
          </a>
          <a href="/admin/users" className="flex items-center gap-3 px-4 py-3 text-[#2C3E50] hover:bg-[#F0F4F8] rounded-md">
            <span>👥</span>
            <span>ユーザー管理</span>
          </a>
          <a href="/admin/badges" className="flex items-center gap-3 px-4 py-3 text-[#2C3E50] hover:bg-[#F0F4F8] rounded-md">
            <span>🏆</span>
            <span>バッジ管理</span>
          </a>
          <a href="/admin/courses" className="flex items-center gap-3 px-4 py-3 text-[#2C3E50] hover:bg-[#F0F4F8] rounded-md">
            <span>📚</span>
            <span>コース管理</span>
          </a>
          <a href="/admin/events" className="flex items-center gap-3 px-4 py-3 text-[#2C3E50] hover:bg-[#F0F4F8] rounded-md">
            <span>🎮</span>
            <span>イベント管理</span>
          </a>
          <a href="/admin/forum" className="flex items-center gap-3 px-4 py-3 text-[#2C3E50] hover:bg-[#F0F4F8] rounded-md">
            <span>💬</span>
            <span>フォーラム管理</span>
          </a>
          <a href="/admin/shop" className="flex items-center gap-3 px-4 py-3 text-[#2C3E50] hover:bg-[#F0F4F8] rounded-md">
            <span>🛍</span>
            <span>ショップ管理</span>
          </a>
        </nav>
      </aside>

      {/* メインコンテンツ */}
      <main className="bg-[#F5F7FB] overflow-auto">
        <div className="h-16 bg-white border-b px-6 flex items-center justify-between">
          <div className="font-medium">{/* ページタイトル等 */}</div>
          <button className="px-4 py-2 bg-[#4A90E2] text-white rounded-md hover:bg-[#357ABD]">
            新規作成
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
