'use client';

import { useTheme } from '@/contexts/theme';

export function LoadingHome() {
  const { theme } = useTheme();
  
  return (
    <div className="space-y-6 animate-pulse">
      {/* プロフィールのスケルトン */}
      <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6`}>
        <div className="flex">
          {/* 左カラム: アバター、階級バッジのスケルトン */}
          <div className="flex flex-col items-center w-24">
            <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700 mb-4" />
            <div className="w-20 h-6 rounded-full bg-gray-200 dark:bg-gray-700" />
          </div>

          {/* 右カラム: ユーザー情報のスケルトン */}
          <div className="flex-grow pl-6">
            <div className="flex items-center w-full space-x-4 mb-4">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-40" />
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-700" />
                <div className="w-32 h-2 rounded-full bg-gray-200 dark:bg-gray-700" />
              </div>
            </div>

            {/* トークンゲージのスケルトン */}
            <div className="mb-6">
              <div className="flex justify-between mb-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32" />
              </div>
              <div className="h-3 rounded-full bg-gray-200 dark:bg-gray-700" />
            </div>

            {/* バッジとジェムのスケルトン */}
            <div className="flex justify-between items-center">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20" />
              <div className="flex-grow ml-6 h-12 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          </div>
        </div>
      </div>

      {/* グリッドのスケルトン */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 現在のコースのスケルトン */}
        <div className="lg:col-span-6 lg:order-2">
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6`}>
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-4" />
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-full" />
          </div>
        </div>

        {/* イベントとお知らせのスケルトン */}
        <div className="lg:col-span-3 lg:order-3 space-y-6">
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6`}>
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4" />
            <div className="space-y-4">
              <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          </div>
        </div>

        {/* ミッションとランキングのスケルトン */}
        <div className="lg:col-span-3 lg:order-1 space-y-6">
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6`}>
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4" />
            <div className="space-y-3">
              <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}