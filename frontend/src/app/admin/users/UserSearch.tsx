'use client';

interface UserSearchProps {
  value: {
    query: string;
    searchBy: 'name' | 'email';
  };
  onChange: (params: { query: string; searchBy: 'name' | 'email' }) => void;
}

export function UserSearch({ value, onChange }: UserSearchProps) {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...value, query: e.target.value });
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({ ...value, searchBy: e.target.value as 'name' | 'email' });
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm">
      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>
          <input
            type="text"
            value={value.query}
            onChange={handleInputChange}
            placeholder={`${value.searchBy === 'name' ? '名前' : 'メールアドレス'}で検索...`}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="sm:w-48">
          <select
            value={value.searchBy}
            onChange={handleSelectChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          >
            <option value="name">名前で検索</option>
            <option value="email">メールアドレスで検索</option>
          </select>
        </div>
        {value.query && (
          <button
            onClick={() => onChange({ ...value, query: '' })}
            className="px-4 py-2 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            クリア
          </button>
        )}
      </div>
    </div>
  );
}
