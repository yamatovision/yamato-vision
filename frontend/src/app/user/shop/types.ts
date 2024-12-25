// frontend/src/app/user/shop/types.ts

export type CourseStatus = 
  | 'unlocked'// 未受講で開放可能
  | 'available'     //ジェムで解放可能
  | 'level_locked'  // レベル制限
  | 'rank_locked'   // ランク制限
  | 'complex'       // 複合条件
  | 'completed'     // 修了済み
  | 'perfect'       // Perfect達成
  | 'failed';       // 不合格/中断

export interface Course {
  id: string;
  title: string;
  description: string;
  status: CourseStatus;
  gemCost?: number;
  levelRequired?: number;
  rankRequired?: string;
  gradient: string;
  completion?: {
    badges?: {
      completion?: boolean;
      excellence?: boolean;
    };
  };
}

export interface CourseCompletion {
  status: 'completed' | 'perfect' | 'failed';
  badges: {
    completion: boolean;
    excellence: boolean;
  };
  completedAt: Date;
}