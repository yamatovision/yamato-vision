interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
  trend?: {
    value: number;
    label: string;
  };
}

export function StatCard({ title, value, icon, trend }: StatCardProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-2xl">{icon}</span>
      </div>
      <h3 className="mt-4 text-lg font-medium text-[#707F8C]">{title}</h3>
      <p className="mt-2 text-3xl font-semibold text-[#2C3E50]">{value}</p>
      {trend && (
        <div className="mt-4 flex items-center text-sm">
          <span className={trend.value >= 0 ? "text-[#4CAF50]" : "text-[#F44336]"}>
            {trend.value >= 0 ? "+" : ""}{trend.value}%
          </span>
          <span className="ml-2 text-[#707F8C]">{trend.label}</span>
        </div>
      )}
    </div>
  );
}
