import { StatCard } from './StatCard';

export function StatGrid() {
  const stats = [
    {
      title: '総ユーザー数',
      value: '1,234',
      icon: '👥',
      trend: {
        value: 12,
        label: '先月比'
      }
    },
    {
      title: '本日のアクティブユーザー',
      value: '456',
      icon: '📊',
      trend: {
        value: 5,
        label: '昨日比'
      }
    },
    {
      title: '新規登録者数',
      value: '78',
      icon: '📈',
      trend: {
        value: -3,
        label: '昨日比'
      }
    },
    {
      title: '投稿数',
      value: '892',
      icon: '📝',
      trend: {
        value: 8,
        label: '先週比'
      }
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  );
}
