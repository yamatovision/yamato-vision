import { StatGrid } from './dashboard/StatGrid';

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#2C3E50]">ダッシュボード</h2>
      <StatGrid />
    </div>
  );
}
