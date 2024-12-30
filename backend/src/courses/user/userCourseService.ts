import { PrismaClient } from '@prisma/client';
import { 
  CourseWithStatus, 
  CourseStatus, 
  USER_RANKS, 
  PurchaseResult, 
  UserRank,
  ChapterProgressStatus
} from './userCourseTypes';
import { timeoutService } from '../timeouts/timeoutService';

const prisma = new PrismaClient();

export class UserCourseService {
  // getAvailableCoursesメソッドを更新
  async getAvailableCourses(userId: string): Promise<CourseWithStatus[]> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        level: true,
        rank: true,
        gems: true,
        courses: {
          select: { 
            courseId: true,
            isActive: true,
            isTimedOut: true,
            status: true,
            archiveUntil: true
          }
        }
      }
    });

    if (!user) {
      throw new Error('User not found');
    }

    if (user.rank === '退会者') {
      return [];
    }

    const courses = await prisma.course.findMany({
      where: {
        isPublished: true,
        isArchived: false,
      },
      include: {
        chapters: true,
      },
    });

    return courses.map(course => {
      const userCourse = user.courses.find(uc => uc.courseId === course.id);
      
      let status: CourseStatus;
      if (userCourse) {
        if (userCourse.isTimedOut) {
          status = 'repurchasable';
        } else if (userCourse.status === 'COMPLETED') {
          if (userCourse.archiveUntil && userCourse.archiveUntil > new Date()) {
            status = 'completed_archive';
          } else {
            status = 'repurchasable';
          }
        } else if (userCourse.isActive) {
          status = 'active';
        } else {
          status = 'unlocked';
        }
      } else if (
        (!course.levelRequired || user.level >= course.levelRequired) &&
        (!course.rankRequired || USER_RANKS[user.rank as UserRank] >= USER_RANKS[course.rankRequired as UserRank]) &&
        (!course.gemCost || user.gems >= course.gemCost)
      ) {
        status = 'available';
      } else if (course.levelRequired && user.level < course.levelRequired) {
        status = 'level_locked';
      } else if (course.rankRequired && USER_RANKS[user.rank as UserRank] < USER_RANKS[course.rankRequired as UserRank]) {
        status = 'rank_locked';
      } else {
        status = 'complex';
      }

      return {
        ...course,
        status,
      };
    });
  }






  async startCourse(userId: string, courseId: string) {
    return await prisma.$transaction(async (tx) => {
      // 既存のアクティブなコースを確認
      const existingActiveCourse = await tx.userCourse.findFirst({
        where: {
          userId,
          isActive: true,
        },
      });
  
      // 購入済みコースの確認と詳細取得
      const purchasedCourse = await tx.userCourse.findUnique({
        where: {
          userId_courseId: {
            userId,
            courseId,
          },
        },
        include: {
          course: true
        }
      });
  
      // コース未購入チェック
      if (!purchasedCourse) {
        return { error: 'Course not purchased' };
      }
  
      // タイムアウトチェック
      if (purchasedCourse.isTimedOut) {
        return { error: 'Course has timed out. Please repurchase.' };
      }
  
      // 最初のチャプターを取得
      const firstChapter = await tx.chapter.findFirst({
        where: {
          courseId,
        },
        orderBy: {
          orderIndex: 'asc',
        },
      });
      
      // 最初のチャプターの進捗を作成
      if (firstChapter) {
        await tx.userChapterProgress.create({
          data: {
            userId,
            courseId,
            chapterId: firstChapter.id,
            status: 'IN_PROGRESS',
            startedAt: new Date(),
            isTimedOut: false,
          },
        });
      }
  
      // 既存のアクティブコースを非アクティブに設定
      if (existingActiveCourse) {
        await tx.userCourse.update({
          where: { id: existingActiveCourse.id },
          data: { 
            isActive: false
          },
        });
      }
  
      // 開始日時とタイムアウト日時の設定
      const startedAt = new Date();
      let timeOutAt: Date | null = null;
  
      // コースに制限時間が設定されている場合、タイムアウト日時を計算
      if (purchasedCourse.course.timeLimit) {
        timeOutAt = new Date(startedAt);
        timeOutAt.setDate(timeOutAt.getDate() + purchasedCourse.course.timeLimit); // 日単位での計算
      }
  
      // コースの状態を更新
      const updatedCourse = await tx.userCourse.update({
        where: {
          userId_courseId: {
            userId,
            courseId,
          },
        },
        data: {
          isActive: true,
          startedAt: startedAt,
          isTimedOut: false,
          timeOutAt: timeOutAt, // 計算したタイムアウト日時または null
          status: 'ACTIVE'
        },
        include: {
          course: {
            include: {
              chapters: {
                orderBy: {
                  orderIndex: 'asc'
                }
              }
            }
          },
        },
      });
  
      // コース開始ログの記録（オプション）
      await tx.experienceLog.create({
        data: {
          userId,
          amount: 0, // コース開始時の経験値付与がある場合は適切な値に変更
          source: 'COURSE_START',
          detail: {
            courseId,
            courseTitle: purchasedCourse.course.title,
            startedAt: startedAt.toISOString(),
            timeOutAt: timeOutAt?.toISOString() || null
          }
        }
      });
  
      return { 
        success: true, 
        data: {
          ...updatedCourse,
          timeOutAt: timeOutAt, // タイムアウト日時を明示的に含める
          startedAt: startedAt // 開始日時を明示的に含める
        }
      };
    });
  }







  

  // getCurrentUserCourseメソッドを更新
  async getCurrentUserCourse(userId: string, courseId?: string) {
    const whereClause: any = {
      userId,
      isActive: true,
      isTimedOut: false
    };
  
    if (courseId) {
      whereClause.courseId = courseId;
    }
  
    const userCourse = await prisma.userCourse.findFirst({
      where: whereClause,
      include: {
        course: {
          include: {
            chapters: {
              orderBy: {
                orderIndex: 'asc'
              }
            }
          }
        }
      }
    });
  
    if (userCourse) {
      // タイムアウトチェック
      if (userCourse.courseId) {
        const timeoutCheck = await timeoutService.checkCourseTimeout(userId, userCourse.courseId);
        if (timeoutCheck.isTimedOut) {
          return null;
        }
      }
    }
  
    return userCourse;
  }

  // repurchaseCourseメソッドを追加
  async repurchaseCourse(userId: string, courseId: string): Promise<PurchaseResult> {
    return await prisma.$transaction(async (tx) => {
      const userCourse = await tx.userCourse.findUnique({
        where: {
          userId_courseId: {
            userId,
            courseId,
          }
        },
        include: {
          course: true
        }
      });

      if (!userCourse) {
        return { error: 'Course not found' };
      }

      const repurchasePrice = Math.floor(userCourse.course.gemCost * 0.1);
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { gems: true }
      });

      if (!user || user.gems < repurchasePrice) {
        return { error: 'Insufficient gems for repurchase' };
      }

      // ジェムを消費して再購入
      await tx.user.update({
        where: { id: userId },
        data: { gems: user.gems - repurchasePrice }
      });

      // コース状態をリセット
      const updatedCourse = await tx.userCourse.update({
        where: {
          userId_courseId: {
            userId,
            courseId,
          }
        },
        data: {
          isTimedOut: false,
          timeOutAt: null,
          status: 'UNLOCKED',
          progress: 0,
          startedAt: null,
          completedAt: null,
          isActive: false
        }
      });

      // 関連するチャプター進捗をすべて削除
      await tx.userChapterProgress.deleteMany({
        where: {
          userId,
          courseId
        }
      });

      return { success: true, userCourse: updatedCourse };
    });
  }


  async purchaseCourse(userId: string, courseId: string): Promise<PurchaseResult> {
    return await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: {
          level: true,
          rank: true,
          gems: true,
        }
      });

      const course = await tx.course.findUnique({
        where: { id: courseId }
      });

      if (!user || !course) {
        return { error: 'User or course not found' };
      }

      if (user.rank === '退会者') {
        return { error: 'Retired users cannot purchase courses' };
      }

      if (course.levelRequired && user.level < course.levelRequired) {
        return { error: 'Level requirement not met' };
      }
      if (course.rankRequired && USER_RANKS[user.rank as UserRank] < USER_RANKS[course.rankRequired as UserRank]) {
        return { error: 'Rank requirement not met' };
      }
      if (course.gemCost && user.gems < course.gemCost) {
        return { error: 'Insufficient gems' };
      }

      const existingPurchase = await tx.userCourse.findUnique({
        where: {
          userId_courseId: {
            userId,
            courseId,
          }
        }
      });

      if (existingPurchase) {
        return { error: 'Course already purchased' };
      }

      if (course.gemCost) {
        await tx.user.update({
          where: { id: userId },
          data: { gems: user.gems - course.gemCost }
        });
      }

      const userCourse = await tx.userCourse.create({
        data: {
          userId,
          courseId,
          progress: 0,
        }
      });

      return { success: true, userCourse };
    });
  }


  async getCurrentChapter(userId: string, courseId: string) {
    // Get all chapter progress for this course
    const chapterProgress = await prisma.userChapterProgress.findMany({
      where: {
        userId,
        courseId,
      },
      include: {
        chapter: true,
      },
      orderBy: {
        chapter: {
          orderIndex: 'asc',
        },
      },
    });
  
    // Get all chapters for this course
    const courseChapters = await prisma.chapter.findMany({
      where: {
        courseId,
      },
      orderBy: {
        orderIndex: 'asc',
      },
    });
  
    // Find the first incomplete chapter
    const nextChapter = courseChapters.find(chapter => {
      const progress = chapterProgress.find(p => p.chapterId === chapter.id);
      return !progress || progress.status !== 'COMPLETED';  // 文字列リテラルのままで問題ありません
    });
  
    // If all chapters are completed, return the last chapter
    return nextChapter || courseChapters[courseChapters.length - 1];
  }

  async expireArchiveAccess(userId: string, courseId: string) {
    return await prisma.userCourse.update({
      where: {
        userId_courseId: {
          userId,
          courseId
        }
      },
      data: {
        status: 'repurchasable',
        archiveUntil: null
      }
    });
  }

  async getUserCourses(userId: string) {
    return prisma.userCourse.findMany({
      where: { userId },
      include: {
        course: {
          include: {
            chapters: true,
          }
        }
      }
    });
  }
}

export const userCourseService = new UserCourseService();