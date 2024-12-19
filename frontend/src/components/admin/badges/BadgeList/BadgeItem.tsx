'use client';
import Image from 'next/image';

interface BadgeCondition {
  type: 'achievement' | 'level' | 'course' | 'likes';
  value: number;
  description: string;
}

interface Badge {
  id: string;
  name: string;
  description: string;
  iconUrl: string;
  conditions: BadgeCondition[];
  createdAt: string;
  isActive: boolean;
}

interface BadgeItemProps {
  badge: Badge;
}

export function BadgeItem({ badge }: BadgeItemProps) {
  const handleEdit = () => {
    window.location.href = `/admin/badges/${badge.id}/edit`;
  };

  const handleToggleStatus = async () => {
    // ステータス切り替えのAPI呼び出し
    console.log(`Toggle status for badge ${badge.id}`);
  };

  const handleDelete = async () => {
    if (confirm('このバッジを削除してもよろしいですか？')) {
      // 削除のAPI呼び出し
      console.log(`Delete badge ${badge.id}`);
    }
  };

  const getConditionText = (condition: BadgeCondition) => {
    switch (condition.type) {
      case 'achievement':
        return `達成条件: ${condition.description}`;
      case 'level':
        return `レベル${condition.value}到達`;
      case 'course':
        return `${condition.value}コース完了`;
      case 'likes':
        return `いいね${condition.value}件獲得`;
      default:
        return condition.description;
    }
  };

  return (
    <tr>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10 relative">
            {badge.iconUrl && (
              <Image
                src={badge.iconUrl}
                alt={badge.name}
                layout="fill"
                className="rounded-full"
              />
            )}
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-[#2C3E50]">
              {badge.name}
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="text-sm text-[#2C3E50]">{badge.description}</div>
      </td>
      <td className="px-6 py-4">
        <div className="text-sm text-[#2C3E50]">
          {badge.conditions.map((condition, index) => (
            <div key={index} className="mb-1">
              {getConditionText(condition)}
            </div>
          ))}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span
          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
            badge.isActive
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {badge.isActive ? '有効' : '無効'}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
        <button
          onClick={handleEdit}
          className="text-[#4A90E2] hover:text-[#357ABD] mr-3"
        >
          編集
        </button>
        <button
          onClick={handleToggleStatus}
          className="text-[#4A90E2] hover:text-[#357ABD] mr-3"
        >
          {badge.isActive ? '無効化' : '有効化'}
        </button>
        <button
          onClick={handleDelete}
          className="text-[#F44336] hover:text-[#D32F2F]"
        >
          削除
        </button>
      </td>
    </tr>
  );
}
