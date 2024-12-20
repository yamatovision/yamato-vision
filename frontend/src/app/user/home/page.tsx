'use client';

import { HomeProfile } from './components/HomeProfile';
import { CurrentCourse } from './components/CurrentCourse';
import { WeeklyRanking } from './components/WeeklyRanking';
import { DailyMissions } from './components/DailyMissions';
import { EventInfo } from './components/EventInfo';
import { Notifications } from './components/Notifications';

export default function HomePage() {
  return (
    <div className="space-y-6">
      <HomeProfile />
      
      {/* レスポンシブ対応のグリッド */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 lg:order-2">
          <CurrentCourse />
        </div>

        <div className="lg:col-span-3 lg:order-3 space-y-6">
          <EventInfo />
          <Notifications />
        </div>

        <div className="lg:col-span-3 lg:order-1 space-y-6">
          <div className="order-2 lg:order-1">
            <DailyMissions />
          </div>
          <div className="order-1 lg:order-2">
            <WeeklyRanking />
          </div>
        </div>
      </div>
    </div>
  );
}
