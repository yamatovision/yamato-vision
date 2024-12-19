export function AdminHeader() {
  return (
    <header className="w-full bg-white shadow-sm z-10">
      <div className="px-6 h-16 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-[#2C3E50]">
          管理者ダッシュボード
        </h1>
        <div className="flex items-center gap-4">
          <button className="px-4 py-2 bg-[#4A90E2] text-white rounded-md hover:bg-[#357ABD]">
            新規作成
          </button>
        </div>
      </div>
    </header>
  );
}
