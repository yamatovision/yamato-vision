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
    console.log('Starting course with:', { userId, courseId });
    
    return await prisma.$transaction(async (tx) => {
      try {
        // 既存のアクティブなコースを確認
        const existingActiveCourse = await tx.userCourse.findFirst({
          where: {
            userId,
            isActive: true,
          },
        });
        console.log('Existing active course:', existingActiveCourse);
  
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
        console.log('Purchased course:', purchasedCourse);
  
        if (!purchasedCourse) {
          console.log('Course not purchased');
          return { error: 'Course not purchased' };
        }
  
        if (purchasedCourse.isTimedOut) {
          console.log('Course is timed out');
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
        console.log('First chapter:', firstChapter);
  
        if (firstChapter) {
          // 既存の進捗を確認
          const existingProgress = await tx.userChapterProgress.findUnique({
            where: {
              userId_courseId_chapterId: {
                userId,
                courseId,
                chapterId: firstChapter.id
              }
            }
          });
  
          // 進捗が存在しない場合のみ作成
          if (!existingProgress) {
            const chapterProgress = await tx.userChapterProgress.create({
              data: {
                userId,
                courseId,
                chapterId: firstChapter.id,
                status: 'IN_PROGRESS',
                startedAt: new Date(),
                isTimedOut: false,
              },
            });
            console.log('Created chapter progress:', chapterProgress);
          } else {
            console.log('Chapter progress already exists');
          }
        }
  
        // 既存のアクティブコースを非アクティブに設定
        if (existingActiveCourse) {
          await tx.userCourse.update({
            where: { id: existingActiveCourse.id },
            data: { isActive: false },
          });
          console.log('Deactivated existing course');
        }
  
        // 新しいコースをアクティブに設定
        const updatedCourse = await tx.userCourse.update({
          where: {
            userId_courseId: {
              userId,
              courseId,
            },
          },
          data: {
            isActive: true,
            startedAt: new Date(),
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
        console.log('Updated course:', updatedCourse);
  
        return { success: true, data: updatedCourse };
      } catch (error) {
        console.error('Error in startCourse transaction:', error);
        throw error;
      }
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
    console.log('userCourseService.getCurrentChapter called with:', { userId, courseId });
  
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
    console.log('Chapter progress found:', chapterProgress);
  
    // Get all chapters for this course
    const courseChapters = await prisma.chapter.findMany({
      where: {
        courseId,
      },
      orderBy: {
        orderIndex: 'asc',
      },
    });
    console.log('Course chapters found:', courseChapters);
  
    // Find the first incomplete chapter
    const nextChapter = courseChapters.find(chapter => {
      const progress = chapterProgress.find(p => p.chapterId === chapter.id);
      return !progress || progress.status !== 'COMPLETED';
    });
    console.log('Next chapter found:', nextChapter);
  
    // If all chapters are completed, return the last chapter
    const resultChapter = nextChapter || courseChapters[courseChapters.length - 1];
    console.log('Returning chapter:', resultChapter);
  
    return resultChapter;
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