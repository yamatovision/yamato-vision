// src/types/shop.ts

// CourseStatusの再定義を避け、courseから型をインポート
import type { BaseCourse } from './course';

// CourseStatusの定義（既存の定義を拡張）
export type CourseStatus = 
  | 'unlocked'          // 購入済み（未開始）
  | 'available'         // 購入可能
  | 'level_locked'      // レベル制限
  | 'rank_locked'       // 階級制限
  | 'complex'           // 複合制限
  | 'active'           // 受講中
  | 'perfect'          // Perfect達成
  | 'completed_archive' // 完了（アーカイブ）
  | 'repurchasable'     // 再購入必要
  | 'completed'        // 完了
  | 'failed';          // 失敗

// ShopCourse interfaceの定義
export interface ShopCourse extends BaseCourse {
  status: CourseStatus;
  gradient: string;
  archiveUntil?: string;
}

// CourseCardPropsの定義
export interface CourseCardProps {
  id: string;           // 追加：必須のid
  title: string;
  description: string;
  status: CourseStatus;
  gemCost?: number;
  levelRequired?: number;
  rankRequired?: string;
  gradient: string;
  thumbnail?: string;   // 追加：オプショナルのサムネイル
  onUnlock: () => Promise<void>;  // Promise<void>に修正
  completion?: {
    badges?: {
      completion?: boolean;
      excellence?: boolean;
    };
  };
  lastAccessedChapterId?: string;
  archiveUntil?: string;  // 追加：アーカイブ期限
}

// ステータスに応じたバッジ設定
export const badges: Record<CourseStatus, { text: string; color: string }> = {
  active: { text: '受講中', color: 'primary' },
  unlocked: { text: '未開始', color: 'secondary' },
  available: { text: '購入可能', color: 'success' },
  level_locked: { text: 'レベル制限', color: 'warning' },
  rank_locked: { text: 'ランク制限', color: 'warning' },
  complex: { text: '条件あり', color: 'warning' },
  perfect: { text: 'Perfect達成', color: 'info' },
  completed_archive: { text: 'アーカイブ', color: 'dark' },
  repurchasable: { text: '再購入可能', color: 'info' },
  completed: { text: '完了', color: 'success' },
  failed: { text: '失敗', color: 'danger' }
};

// ステータスの優先順位定義
export const statusPriority: Record<CourseStatus, number> = {
  active: 1,
  unlocked: 2,
  available: 3,
  perfect: 4,
  completed_archive: 5,
  repurchasable: 6,
  level_locked: 7,
  rank_locked: 8,
  complex: 9,
  completed: 10,
  failed: 11
};

// 利用可能なステータスの配列
export const availableStatuses: CourseStatus[] = [
  'unlocked',
  'available',
  'perfect',
  'completed_archive',
  'repurchasable',
  'active',
  'level_locked',
  'rank_locked',
  'complex',
  'completed',
  'failed'
];