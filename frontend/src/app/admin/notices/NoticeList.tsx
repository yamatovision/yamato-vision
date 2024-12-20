'use client';

export function NoticeList() {
  const notices = [
    {
      id: "1",
      title: "システムメンテナンスのお知らせ",
      startAt: "2024-02-01",
      endAt: "2024-02-28",
      restrictions: {
        ranks: ["初級", "中級"],
        levelRange: { min: 1, max: 10 }
      },
      updatedAt: "2024-01-15"
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-[#707F8C] uppercase tracking-wider">
              タイトル
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-[#707F8C] uppercase tracking-wider">
              表示期間
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-[#707F8C] uppercase tracking-wider">
              表示制限
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-[#707F8C] uppercase tracking-wider">
              最終更新
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-[#707F8C] uppercase tracking-wider">
              アクション
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {notices.map((notice) => (
            <tr key={notice.id}>
              <td className="px-6 py-4">
                <div className="text-sm font-medium text-[#2C3E50]">{notice.title}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-[#2C3E50]">
                  {notice.startAt} 〜 {notice.endAt}
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-[#2C3E50]">
                  {notice.restrictions.ranks.join(', ')}
                  <br />
                  Level {notice.restrictions.levelRange.min} - {notice.restrictions.levelRange.max}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-[#707F8C]">{notice.updatedAt}</div>
              </td>
              <td className="px-6 py-4 text-right text-sm">
                <a 
                  href={`/admin/notices/${notice.id}`}
                  className="text-[#4A90E2] hover:text-[#357ABD]"
                >
                  編集
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
