import { Tab } from '@headlessui/react';
import { RankingUser } from '@/types/ranking';
import { RankingItem } from './RankingItem';
import { useTheme } from '@/contexts/theme';

interface RankingTabsProps {
  activeUsers: RankingUser[];
  historicalUsers: RankingUser[];
  activeUserCount: number;
  selectedIndex: number;
  onChangeTab: (index: number) => void;
}

export function RankingTabs({ 
  activeUsers, 
  historicalUsers, 
  activeUserCount, 
  selectedIndex, 
  onChangeTab 
}: RankingTabsProps) {
  const { theme } = useTheme();

  return (
    <Tab.Group selectedIndex={selectedIndex} onChange={onChangeTab}>
      <Tab.List className="flex space-x-1 rounded-xl bg-blue-900/20 p-1 mb-4">
        <Tab className={({ selected }) =>
          `w-full rounded-lg py-2.5 text-sm font-medium leading-5
          ${selected 
            ? 'bg-white text-blue-700 shadow'
            : 'text-blue-500 hover:bg-white/[0.12] hover:text-blue-600'}`
        }>
          現役生ランキング
          <span className="ml-2 text-xs">({activeUserCount}人)</span>
        </Tab>
        <Tab className={({ selected }) =>
          `w-full rounded-lg py-2.5 text-sm font-medium leading-5
          ${selected 
            ? 'bg-white text-blue-700 shadow'
            : 'text-blue-500 hover:bg-white/[0.12] hover:text-blue-600'}`
        }>
          歴代ランキング
        </Tab>
      </Tab.List>

      <Tab.Panels>
        <Tab.Panel>
          {activeUsers.map((user, index) => (
            <RankingItem key={user.userId} user={user} rank={index + 1} />
          ))}
        </Tab.Panel>
        <Tab.Panel>
          {historicalUsers.map((user, index) => (
            <RankingItem key={user.userId} user={user} rank={index + 1} />
          ))}
        </Tab.Panel>
      </Tab.Panels>
    </Tab.Group>
  );
}
