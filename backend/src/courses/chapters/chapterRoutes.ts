// backend/src/courses/chapters/chapterRoutes.ts

import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { chapterController } from './chapterController';
import { authMiddleware } from '../../auth/authMiddleware';
import { userCourseService } from '../user/userCourseService';
import { timeoutService } from '../timeouts/timeoutService';
import { chapterService } from './chapterService';
import { 
  ChapterEvaluationStatus,
  ChapterProgressStatus 
} from './chapterTypes';

const router = Router({ mergeParams: true });
const prisma = new PrismaClient();
router.get('/progress', authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { courseId } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    // デバッグログを追加
    console.log('Fetching course and chapters:', { userId, courseId });

    const userCourse = await userCourseService.getCurrentUserCourse(userId, courseId);
    if (!userCourse) {
      return res.status(403).json({
        success: false,
        message: 'コースの受講権限がありません'
      });
    }

    const chapters = await prisma.chapter.findMany({
      where: { 
        courseId
      },
      include: {
        userProgress: {
          where: { userId }
        }
      },
      orderBy: {
        orderIndex: 'asc'
      }
    });

    console.log('Found chapters:', chapters.length);

    const chaptersWithAccess = await Promise.all(
      chapters.map(async (chapter, index) => {
        const chapterWithMetadata = await chapterService.getChapterWithMetadata(chapter);
        const progress = chapter.userProgress[0];
        
        // アクセス権限の計算
        const canAccess = await chapterService.calculateChapterAccess(
          chapter,
          chapters,
          index
        );

        console.log(`Processing chapter ${chapter.id}:`, {
          title: chapter.title,
          hasProgress: !!progress,
          status: progress?.status,
          canAccess
        });

        return {
          id: chapter.id,
          title: chapter.title,
          subtitle: chapter.subtitle,
          orderIndex: chapter.orderIndex,
          status: progress?.status || 'NOT_STARTED',
          evaluationStatus: calculateEvaluationStatus(progress),
          score: progress?.score,
          timeOutAt: progress?.timeOutAt,
          releaseTime: chapter.releaseTime,
          thumbnailUrl: chapterWithMetadata.metadata?.thumbnailUrl,
          lessonWatchRate: progress?.lessonWatchRate || 0,
          isLocked: !canAccess,
          canAccess,
          nextUnlockTime: null // 必要に応じて実装
        };
      })
    );

    return res.json({
      success: true,
      data: chaptersWithAccess
    });
  } catch (error) {
    console.error('Error fetching chapters progress:', error);
    return res.status(500).json({
      success: false,
      message: 'チャプター進捗の取得に失敗しました'
    });
  }
});

// 評価ステータスの計算ヘルパー関数
function calculateEvaluationStatus(
  progress: {
    score: number | null | undefined;
    isTimedOut: boolean | undefined;
  } | undefined
): ChapterEvaluationStatus {
  // progressがない場合
  if (!progress) return 'PASS';

  // タイムアウト時
  if (progress.isTimedOut && !progress.score) return 'FAILED';

  // スコアがない場合
  if (progress.score === null || progress.score === undefined) return 'PASS';

  // スコアに基づく評価
  if (progress.score >= 95) return 'PERFECT';
  if (progress.score >= 85) return 'GREAT';
  if (progress.score >= 70) return 'GOOD';
  return 'PASS';
}

// Prismaの型定義を拡張
type ChapterWithProgress = {
  id: string;
  courseId: string;
  title: string;
  subtitle: string | null;
  orderIndex: number;
  timeLimit: number | null;
  isVisible: boolean;
  content: any;
  releaseTime: number | null;
  isPerfectOnly: boolean;
  thumbnailUrl?: string;
  userProgress: Array<{
    id: string;
    userId: string;
    courseId: string;
    chapterId: string;
    status: string;
    startedAt: Date | null;
    completedAt: Date | null;
    score: number | null;
    isTimedOut: boolean;
    timeOutAt: Date | null;
    lessonWatchRate: number;
  }>;
};

// Admin routes
router.post('/', chapterController.createChapter.bind(chapterController));
router.put('/:chapterId', chapterController.updateChapter.bind(chapterController));
router.delete('/:chapterId', chapterController.deleteChapter.bind(chapterController));
router.put('/', chapterController.updateChaptersOrder.bind(chapterController));

// Public routes
router.get('/', chapterController.getChapters.bind(chapterController));
router.get('/:chapterId', authMiddleware, chapterController.getChapter.bind(chapterController));
router.get('/:chapterId/access', chapterController.checkChapterAccess.bind(chapterController));


// Current chapter endpoint
router.get('/current-chapter', authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { courseId } = req.params;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const currentChapter = await userCourseService.getCurrentChapter(userId, courseId);
    
    if (!currentChapter) {
      return res.status(404).json({ 
        success: false, 
        message: 'No available chapter found' 
      });
    }

    return res.json({ 
      success: true, 
      data: currentChapter 
    });
  } catch (error) {
    console.error('Error fetching current chapter:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch current chapter' 
    });
  }
});

// Chapter settings routes
router.patch('/:chapterId/visibility', 
  authMiddleware, 
  chapterController.updateVisibility.bind(chapterController)
);

router.patch('/:chapterId/perfect-only', 
  authMiddleware, 
  chapterController.updatePerfectOnly.bind(chapterController)
);

// Chapter progress routes
router.post('/:chapterId/start', 
  authMiddleware, 
  chapterController.startChapter.bind(chapterController)
);

// 新規追加: レッスン視聴進捗の更新ルート
router.patch('/:chapterId/watch-progress',
  authMiddleware,
  chapterController.updateWatchProgress.bind(chapterController)
);

// Complete chapter endpoint
router.post('/:chapterId/complete', authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { courseId, chapterId } = req.params;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const nextChapter = await chapterService.completeChapter(userId, courseId, chapterId);
    
    return res.json({ 
      success: true, 
      data: { nextChapter } 
    });
  } catch (error) {
    console.error('Error completing chapter:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to complete chapter' 
    });
  }
});


export { router as chapterRoutes };