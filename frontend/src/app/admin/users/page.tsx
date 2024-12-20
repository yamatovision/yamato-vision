import { UserList } from './UserList';

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#2C3E50]">ユーザー管理</h2>
      <UserList />
    </div>
  );
}
