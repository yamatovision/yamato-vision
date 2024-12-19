'use client';
import { useState } from 'react';
import { UserActions } from '../UserActions';

interface User {
  id: string;
  name: string;
  email: string;
  rank: string;
  gems: number;
  badges: string[];
  registeredAt: string;
  lastLoginAt: string;
}

interface UserItemProps {
  user: User;
}

export function UserItem({ user }: UserItemProps) {
  const [isActionsOpen, setIsActionsOpen] = useState(false);

  return (
    <tr>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-[#2C3E50]">{user.name}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-[#2C3E50]">{user.email}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-[#2C3E50]">{user.rank}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-[#2C3E50]">{user.gems}</div>
      </td>
      <td className="px-6 py-4">
        <div className="flex flex-wrap gap-2">
          {user.badges.map((badge, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[#F0F4F8] text-[#4A90E2]"
            >
              {badge}
            </span>
          ))}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
        <button
          onClick={() => setIsActionsOpen(true)}
          className="text-[#4A90E2] hover:text-[#357ABD]"
        >
          操作
        </button>
        {isActionsOpen && (
          <UserActions
            userId={user.id}
            onClose={() => setIsActionsOpen(false)}
          />
        )}
      </td>
    </tr>
  );
}
