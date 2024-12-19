import { NoticeList } from "@/components/admin/notices/NoticeList";

export default function NoticesPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-[#2C3E50]">お知らせ管理</h2>
        <button className="px-4 py-2 bg-[#4A90E2] text-white rounded-md hover:bg-[#357ABD]">
          新規作成
        </button>
      </div>
      <NoticeList />
    </div>
  );
}
