'use client';

import { HomeProfile } from './components/HomeProfile';
import { CurrentCourse } from './components/CurrentCourse';
import { WeeklyRanking } from './components/WeeklyRanking';
import { Notifications } from './components/Notifications';

export default function HomePage() {
  return (
    <div className="space-y-6">
      <HomeProfile />
      
      {/* レスポンシブ対応のグリッド */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 lg:order-1">
          <CurrentCourse />
        </div>

        <div className="lg:col-span-4 lg:order-2 space-y-6">
          <WeeklyRanking />
          <Notifications />
        </div>
      </div>
    </div>
  );
}