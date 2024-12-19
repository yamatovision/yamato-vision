interface Notice {
  id: string;
  title: string;
  startAt: string;
  endAt: string;
  restrictions: {
    ranks: string[];
    levelRange: {
      min: number;
      max: number;
    };
  };
  updatedAt: string;
}

interface NoticeItemProps {
  notice: Notice;
}

export function NoticeItem({ notice }: NoticeItemProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP');
  };

  const formatRestrictions = (restrictions: Notice['restrictions']) => {
    const parts = [];
    if (restrictions.ranks.length > 0) {
      parts.push(`階級: ${restrictions.ranks.join(', ')}`);
    }
    if (restrictions.levelRange.min || restrictions.levelRange.max) {
      parts.push(`レベル: ${restrictions.levelRange.min}-${restrictions.levelRange.max}`);
    }
    return parts.join(' / ') || 'なし';
  };

  return (
    <tr>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#2C3E50]">
        {notice.title}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#2C3E50]">
        {formatDate(notice.startAt)} 〜 {formatDate(notice.endAt)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#2C3E50]">
        {formatRestrictions(notice.restrictions)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#2C3E50]">
        {formatDate(notice.updatedAt)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
        <button className="text-[#4A90E2] hover:text-[#357ABD] mr-4">
          編集
        </button>
        <button className="text-[#F44336] hover:text-[#D32F2F]">
          削除
        </button>
      </td>
    </tr>
  );
}
