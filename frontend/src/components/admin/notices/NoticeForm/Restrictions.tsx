interface Restrictions {
  ranks: string[];
  levelRange: {
    min: string;
    max: string;
  };
}

interface RestrictionsProps {
  value: Restrictions;
  onChange: (value: Restrictions) => void;
}

export function Restrictions({ value, onChange }: RestrictionsProps) {
  const ranks = ['初級', '中級', '上級', '超級']; // 仮の階級リスト

  const handleRankChange = (rank: string) => {
    const newRanks = value.ranks.includes(rank)
      ? value.ranks.filter(r => r !== rank)
      : [...value.ranks, rank];
    onChange({ ...value, ranks: newRanks });
  };

  return (
    <div>
      <h3 className="text-lg font-medium text-[#2C3E50]">表示制限設定</h3>
      <div className="mt-4 space-y-4">
        <div>
          <label className="text-sm font-medium text-[#2C3E50]">階級制限</label>
          <div className="mt-2 space-x-4">
            {ranks.map((rank) => (
              <label key={rank} className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={value.ranks.includes(rank)}
                  onChange={() => handleRankChange(rank)}
                  className="rounded border-gray-300 text-[#4A90E2] focus:ring-[#4A90E2]"
                />
                <span className="ml-2 text-sm text-[#2C3E50]">{rank}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-[#2C3E50]">レベル制限</label>
          <div className="mt-2 grid grid-cols-2 gap-4">
            <div>
              <input
                type="number"
                value={value.levelRange.min}
                onChange={(e) => onChange({
                  ...value,
                  levelRange: { ...value.levelRange, min: e.target.value }
                })}
                placeholder="最小レベル"
                className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#4A90E2] focus:outline-none focus:ring-1 focus:ring-[#4A90E2]"
              />
            </div>
            <div>
              <input
                type="number"
                value={value.levelRange.max}
                onChange={(e) => onChange({
                  ...value,
                  levelRange: { ...value.levelRange, max: e.target.value }
                })}
                placeholder="最大レベル"
                className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#4A90E2] focus:outline-none focus:ring-1 focus:ring-[#4A90E2]"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
