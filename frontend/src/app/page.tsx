import { HomeProfile } from '@/components/home/HomeProfile';
import { CurrentCourse } from '@/components/home/CurrentCourse';
import { WeeklyRanking } from '@/components/home/WeeklyRanking';
import { DailyMissions } from '@/components/home/DailyMissions';
import { EventInfo } from '@/components/home/EventInfo';
import { Notifications } from '@/components/home/Notifications';

export default function HomePage() {
  return (
    <div className="space-y-6">
      <HomeProfile />
      
      {/* レスポンシブ対応のグリッド */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 現在のコース - モバイルで最初に表示 */}
        <div className="lg:col-span-6 lg:order-2">
          <CurrentCourse />
        </div>

        {/* イベントとお知らせ - モバイルで2番目に表示 */}
        <div className="lg:col-span-3 lg:order-3 space-y-6">
          <EventInfo />
          <Notifications />
        </div>

        {/* ランキングとミッション - モバイルで最後に表示 */}
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
