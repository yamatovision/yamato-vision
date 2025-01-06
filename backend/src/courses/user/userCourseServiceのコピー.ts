import { PrismaClient } from '@prisma/client';
import { CourseStatus } from '../courseTypes';
import { GetPeerSubmissionsResponse, PeerSubmissionResponse } from './userCourseTypes';
import { 
  CourseWithStatus, 
  USER_RANKS, 
  UserRank,
} from './userCourseTypes';
import { timeoutService } from '../timeouts/timeoutService';
import { progressTrackingService } from '../progress/progressTrackingService';

const prisma = new PrismaClient();

export class UserCourseService {
  async getAvailableCourses(userId: string): Promise<CourseWithStatus[]> {
    console.log('=== Getting Available Courses ===');
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        level: true,
        rank: true,
        courses: {
          select: { 
            courseId: true,
            isActive: true,
            isTimedOut: true,
            status: true,
            certificationEligibility: true
          }
        }
      }
    });
  
    console.log('Found User:', {
      id: userId,
      rank: user?.rank,
      level: user?.level,
      rankValue: user ? USER_RANKS[user.rank as UserRank] : null
    });
    if (!user || user.rank === '退会者') {
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
      console.log(`\nProcessing Course: ${course.id}`);
      const userCourse = user.courses.find(uc => uc.courseId === course.id);
      
      console.log('Course Details:', {
        id: course.id,
        title: course.title,
        levelRequired: course.levelRequired,
        rankRequired: course.rankRequired,
        requirementType: course.requirementType
      });
  
      let status: CourseStatus;
      if (userCourse) {
        if (userCourse.isTimedOut) {
          status = 'failed';
        } else {
          status = userCourse.status as CourseStatus;
        }
      } else if (this.checkCourseRequirements(user, course)) {
        status = 'available';
      } else {
        status = 'restricted';
      }
  
      console.log('Determined Status:', {
        courseId: course.id,
        status,
        hasUserCourse: !!userCourse,
        userCourseStatus: userCourse?.status
      });
  
      return {
        ...course,
        status,
      };
    });
  }

  private checkCourseRequirements(
    user: { level: number; rank: string },
    course: { levelRequired?: number | null; rankRequired?: string | null; requirementType: string }
  ): boolean {
    console.log('=== Course Requirements Check ===');
    console.log('User Details:', {
      rank: user.rank,
      rankValue: USER_RANKS[user.rank as UserRank],
      level: user.level
    });

    console.log('Course Requirements:', {
      levelRequired: course.levelRequired,
      rankRequired: course.rankRequired,
      rankRequiredValue: course.rankRequired ? USER_RANKS[course.rankRequired as UserRank] : null,
      requirementType: course.requirementType
    });

    const levelCheck = !course.levelRequired || user.level >= course.levelRequired;
    const rankCheck = !course.rankRequired || 
      USER_RANKS[user.rank as UserRank] >= USER_RANKS[course.rankRequired as UserRank];

    console.log('Requirement Checks:', {
      levelCheck: {
        result: levelCheck,
        comparison: `${user.level} >= ${course.levelRequired}`
      },
      rankCheck: {
        result: rankCheck,
        comparison: `${USER_RANKS[user.rank as UserRank]} >= ${course.rankRequired ? USER_RANKS[course.rankRequired as UserRank] : 'N/A'}`
      }
    });

    const finalResult = course.requirementType === 'AND' 
      ? levelCheck && rankCheck 
      : levelCheck || rankCheck;

    console.log('Final Result:', {
      result: finalResult,
      logic: course.requirementType === 'AND' ? 'levelCheck && rankCheck' : 'levelCheck || rankCheck'
    });

    return finalResult;
  }
  async startCourse(userId: string, courseId: string) {
    return await prisma.$transaction(async (tx) => {
      console.log('Starting transaction for startCourse:', { userId, courseId });
  
      // 既存のアクティブなコースを検索
      const existingActiveCourse = await tx.userCourse.findFirst({
        where: {
          userId,
          isActive: true,
        },
      });
      console.log('Existing active course:', existingActiveCourse);
  
      // 既存のアクティブコースがある場合は失敗状態に
      if (existingActiveCourse) {
        try {
          console.log('Attempting to deactivate course:', existingActiveCourse.id);
          const deactivatedCourse = await tx.userCourse.update({
            where: { id: existingActiveCourse.id },
            data: { 
              isActive: false,
              status: 'failed',  // ここだけ小文字に変更
              certificationEligibility: false
            },
          });
          console.log('Successfully deactivated course:', deactivatedCourse);
        } catch (error) {
          console.error('Failed to deactivate existing course:', error);
          throw new Error('Failed to start course: Could not deactivate existing course');
        }
      }
  
      try {
        console.log('Creating/updating new course');
        const userCourse = await tx.userCourse.upsert({
          where: {
            userId_courseId: {
              userId,
              courseId,
            },
          },
          update: {
            isActive: true,
            startedAt: new Date(),
            status: 'active',  // ここだけ小文字に変更
            progress: 0,
            completedAt: null,
            isTimedOut: false,
            timeOutAt: null,
          },
          create: {
            userId,
            courseId,
            status: 'active',  // ここだけ小文字に変更
            isActive: true,
            startedAt: new Date(),
            certificationEligibility: true
          },
        });
        console.log('Successfully created/updated course:', userCourse);
  
        // 最初のチャプターの進捗を作成
        const firstChapter = await tx.chapter.findFirst({
          where: { courseId },
          orderBy: { orderIndex: 'asc' },
        });
  
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
  
          if (!existingProgress) {
            // 進捗が存在しない場合のみ作成
            await tx.userChapterProgress.create({
              data: {
                userId,
                courseId,
                chapterId: firstChapter.id,
                status: 'ready',  // ここだけ変更
                startedAt: null,  // ready状態なのでnull
                lessonWatchRate: 0
              },
            });
          } else {
            // 既存の進捗を更新
            await tx.userChapterProgress.update({
              where: {
                userId_courseId_chapterId: {
                  userId,
                  courseId,
                  chapterId: firstChapter.id
                }
              },
              data: {
                status: 'ready',  // ここだけ変更
                startedAt: null,  // ready状態なのでnull
                lessonWatchRate: 0
              }
            });
          }
        }
  
        return { success: true, data: userCourse };
      } catch (error) {
        console.error('Failed to create/update course:', error);
        throw error;
      }
    });
  }
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
      if (userCourse.courseId) {
        const timeoutCheck = await timeoutService.checkCourseTimeout(userId, userCourse.courseId);
        if (timeoutCheck.isTimedOut) {
          await this.handleTimeout(userId, userCourse.courseId);
          return null;
        }
      }
    }
  
    return userCourse;
  }

  async getActiveCourseUsers(courseId: string) {
    const activeUsers = await prisma.userCourse.findMany({
      where: {
        courseId,
        isActive: true,
        status: {
          in: ['active', 'ACTIVE']  // 両方のケースに対応
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true
          }
        }
      }
    });
  
    return activeUsers.map(uc => ({
      id: uc.user.id,
      name: uc.user.name,
      avatarUrl: uc.user.avatarUrl
    }));
  }
// userCourseService.ts の getChapterPeerSubmissions メソッドを修正
// backend/src/courses/user/userCourseService.ts
async getChapterPeerSubmissions(
  courseId: string,
  chapterId: string,
  currentUserId: string,
  page: number = 1,
  perPage: number = 10
): Promise<GetPeerSubmissionsResponse> {
  try {
    console.log('Getting peer submissions:', { courseId, chapterId, currentUserId });

    // 1. チャプターの存在確認とtaskIdの取得
    const chapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
      select: { 
        taskId: true,
        courseId: true
      }
    });

    if (!chapter || !chapter.taskId) {
      throw new Error('チャプターが見つかりません');
    }

    // courseIdの検証を削除し、実際のcourseIdを使用
    console.log('Found chapter:', {
      requestedCourseId: courseId,
      actualCourseId: chapter.courseId,
      chapterId,
      taskId: chapter.taskId
    });

    // 2. 提出一覧の取得
    const submissions = await prisma.submission.findMany({
      where: {
        taskId: chapter.taskId,
        userId: {
          not: currentUserId
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            rank: true
          }
        }
      },
      orderBy: [
        { points: 'desc' },
        { submittedAt: 'desc' }
      ],
      skip: (page - 1) * perPage,
      take: perPage
    });

    // 3. 総件数の取得
    const total = await prisma.submission.count({
      where: {
        taskId: chapter.taskId,
        userId: {
          not: currentUserId
        }
      }
    });

    console.log('Successfully retrieved submissions:', {
      total,
      returnedCount: submissions.length,
      page,
      perPage
    });

    return {
      submissions,
      total,
      page,
      perPage
    };

  } catch (error) {
    console.error('Error in getChapterPeerSubmissions:', error);
    throw error;
  }
}

  async getCurrentChapter(userId: string, courseId: string) {
    console.log('Getting current chapter for:', { userId, courseId });
  
    const userCourse = await prisma.userCourse.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId
        }
      }
    });
  
    if (!userCourse || !userCourse.isActive) {
      throw new Error('Active course not found');
    }
  
    const chapterProgress = await prisma.userChapterProgress.findMany({
      where: {
        userId,
        courseId,
      },
      include: {
        chapter: {
          include: {
            task: true
          }
        },
      },
      orderBy: {
        chapter: {
          orderIndex: 'asc',
        },
      },
    });
  
    const courseChapters = await prisma.chapter.findMany({
      where: {
        courseId,
      },
      include: {
        task: true,
      },
      orderBy: {
        orderIndex: 'asc',
      },
    });
  
    const nextChapter = courseChapters.find(chapter => {
      const progress = chapterProgress.find(p => p.chapterId === chapter.id);
      return !progress || progress.status !== 'COMPLETED';
    });
  
    if (!nextChapter) {
      return courseChapters[courseChapters.length - 1];
    }
  
    return {
      ...nextChapter,
      progress: chapterProgress.find(p => p.chapterId === nextChapter.id)
    };
  }

  async getUserCourses(userId: string) {
    return prisma.userCourse.findMany({
      where: { userId },
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
      },
      orderBy: {
        startedAt: 'desc'
      }
    });
  }
  private async handleTimeout(userId: string, courseId: string) {
    await prisma.userCourse.update({
      where: {
        userId_courseId: {
          userId,
          courseId
        }
      },
      data: {
        status: 'failed',
        isTimedOut: true,
        timeOutAt: new Date(),
        isActive: false,
        certificationEligibility: false
      }
    });
  }

  // calculateFinalStatus と updateCourseStatus をクラス内に正しく配置
  async calculateFinalStatus(
    userId: string,
    courseId: string,
    totalExperienceRate: number
  ): Promise<CourseStatus> {
    const userCourse = await prisma.userCourse.findUnique({
      where: {
        userId_courseId: { userId, courseId }
      }
    });

    if (!userCourse?.certificationEligibility) {
      return 'completed';
    }

    if (totalExperienceRate >= 95) {
      return 'perfect';
    } else if (totalExperienceRate >= 85) {
      return 'certified';
    } else {
      return 'completed';
    }
  }

  async updateCourseStatus(
    userId: string,
    courseId: string,
    totalExperienceRate: number
  ) {
    const finalStatus = await this.calculateFinalStatus(
      userId,
      courseId,
      totalExperienceRate
    );

    return await prisma.userCourse.update({
      where: {
        userId_courseId: { userId, courseId }
      },
      data: {
        status: finalStatus,
        completedAt: new Date(),
        isActive: false
      }
    });
  }
}

export const userCourseService = new UserCourseService();