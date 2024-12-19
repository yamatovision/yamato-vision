export function AdminSidebar() {
  const menuItems = [
    { label: 'ダッシュボード', icon: '📊', path: '/admin' },
    { label: 'お知らせ管理', icon: '📢', path: '/admin/notices' },
    { label: 'ユーザー管理', icon: '👥', path: '/admin/users' },
    { label: 'バッジ管理', icon: '🏆', path: '/admin/badges' },
    { label: 'コース管理', icon: '📚', path: '/admin/courses' },
    { label: 'イベント管理', icon: '🎮', path: '/admin/events' },
    { label: 'フォーラム管理', icon: '💬', path: '/admin/forum' },
    { label: 'ショップ管理', icon: '🛍', path: '/admin/shop' },
  ];

  return (
    <aside className="w-64 bg-white shadow-sm min-h-[calc(100vh-4rem)]">
      <nav className="p-4 h-full">
        {menuItems.map((item) => (
          <a
            key={item.path}
            href={item.path}
            className="flex items-center gap-3 px-4 py-3 text-[#2C3E50] hover:bg-[#F0F4F8] rounded-md"
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </a>
        ))}
      </nav>
    </aside>
  );
}
