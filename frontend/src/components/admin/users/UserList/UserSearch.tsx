interface UserSearchProps {
  value: {
    query: string;
    searchBy: 'name' | 'email';
  };
  onChange: (value: { query: string; searchBy: 'name' | 'email' }) => void;
}

export function UserSearch({ value, onChange }: UserSearchProps) {
  return (
    <div className="flex items-center space-x-4">
      <div className="flex-1">
        <input
          type="text"
          value={value.query}
          onChange={(e) => onChange({ ...value, query: e.target.value })}
          placeholder={value.searchBy === 'name' ? 'ユーザー名で検索...' : 'メールアドレスで検索...'}
          className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm focus:border-[#4A90E2] focus:outline-none focus:ring-1 focus:ring-[#4A90E2]"
        />
      </div>
      <div className="flex items-center space-x-4">
        <label className="inline-flex items-center">
          <input
            type="radio"
            value="name"
            checked={value.searchBy === 'name'}
            onChange={(e) => onChange({ ...value, searchBy: 'name' })}
            className="text-[#4A90E2] focus:ring-[#4A90E2]"
          />
          <span className="ml-2 text-sm text-[#2C3E50]">名前</span>
        </label>
        <label className="inline-flex items-center">
          <input
            type="radio"
            value="email"
            checked={value.searchBy === 'email'}
            onChange={(e) => onChange({ ...value, searchBy: 'email' })}
            className="text-[#4A90E2] focus:ring-[#4A90E2]"
          />
          <span className="ml-2 text-sm text-[#2C3E50]">メールアドレス</span>
        </label>
      </div>
    </div>
  );
}
