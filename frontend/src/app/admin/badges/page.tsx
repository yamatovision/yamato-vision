import { BadgeList } from "@/components/admin/badges/BadgeList";

export default function BadgesPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-[#2C3E50]">バッジ管理</h2>
        <button 
          onClick={() => window.location.href = '/admin/badges/new'} 
          className="px-4 py-2 bg-[#4A90E2] text-white rounded-md hover:bg-[#357ABD]"
        >
          新規バッジ作成
        </button>
      </div>
      <BadgeList />
    </div>
  );
}
