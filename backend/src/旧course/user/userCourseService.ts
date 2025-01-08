import { PrismaClient } from '@prisma/client';
import { CourseStatus } from '../courseTypes';
import { GetPeerSubmissionsResponse, PeerSubmissionResponse } from './userCourseTypes';
import { ChapterStatus } from './userCourseTypes';

import { 
  CourseWithStatus, 
  USER_RANKS, 
  UserRank,
} from './userCourseTypes';
import { timeoutService } from '../timeouts/timeoutService';

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
              status: 'failed',
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
            status: 'active',
            progress: 0,
            completedAt: null,
            isTimedOut: false,
            timeOutAt: null,
          },
          create: {
            userId,
            courseId,
            status: 'active',
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
                status: 'ready',
                startedAt: null,
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
                status: 'ready',
                startedAt: null,
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

  async updateChapterStatus(userId: string, courseId: string, chapterId: string, status: ChapterStatus) {
    return await prisma.$transaction(async (tx) => {
      // タイムアウトチェック
      const timeoutCheck = await timeoutService.checkChapterTimeout(userId, courseId, chapterId);
      if (timeoutCheck.isTimedOut) {
        return this.handleChapterTimeout(tx, userId, courseId, chapterId);
      }

      // 進捗更新
      const progress = await tx.userChapterProgress.upsert({
        where: {
          userId_courseId_chapterId: {
            userId,
            courseId,
            chapterId
          }
        },
        update: {
          status,
          startedAt: status === 'in_progress' ? new Date() : undefined,
          completedAt: status === 'completed' ? new Date() : undefined
        },
        create: {
          userId,
          courseId,
          chapterId,
          status,
          startedAt: status === 'in_progress' ? new Date() : null,
          lessonWatchRate: 0
        }
      });

      // 完了状態の場合、次のチャプターを解放
      if (status === 'completed') {
        await this.unlockNextChapter(tx, userId, courseId, chapterId);
      }

      return progress;
    });
  }

  private async updateCourseCompletion(
    tx: any,
    userId: string,
    courseId: string
  ) {
    const allChapterProgress = await tx.userChapterProgress.findMany({
      where: {
        userId,
        courseId
      },
      include: {
        chapter: true
      }
    });
  
    // 型を明示的に指定
    const totalScore = allChapterProgress.reduce((sum: number, progress: { score: number | null }) => 
      sum + (progress.score || 0), 0);
    const averageScore = totalScore / allChapterProgress.length;
  
    // 新しいステータスの決定
    let newStatus: CourseStatus = 'failed';
    if (averageScore >= 95) newStatus = 'perfect';
    else if (averageScore >= 85) newStatus = 'certified';
    else if (averageScore >= 70) newStatus = 'completed';
  
    // コースステータスの更新
    await tx.userCourse.update({
      where: {
        userId_courseId: {
          userId,
          courseId
        }
      },
      data: {
        status: newStatus,
        completedAt: new Date(),
        isActive: false
      }
    });
  
    return newStatus;
  }

  

  private async unlockNextChapter(tx: any, userId: string, courseId: string, currentChapterId: string) {
    // 現在のチャプターの情報を取得
    const currentChapter = await tx.chapter.findUnique({
      where: { id: currentChapterId },
      select: { orderIndex: true }
    });

    // 次のチャプターを検索
    const nextChapter = await tx.chapter.findFirst({
      where: {
        courseId,
        orderIndex: {
          gt: currentChapter.orderIndex
        }
      },
      orderBy: {
        orderIndex: 'asc'
      }
    });

    if (nextChapter) {
      // 次のチャプターの進捗レコードを作成
      await tx.userChapterProgress.upsert({
        where: {
          userId_courseId_chapterId: {
            userId,
            courseId,
            chapterId: nextChapter.id
          }
        },
        update: {
          status: 'ready'
        },
        create: {
          userId,
          courseId,
          chapterId: nextChapter.id,
          status: 'ready',
          lessonWatchRate: 0
        }
      });

      return nextChapter;
    }

    // 最終チャプター完了時はコースのステータスを更新
    return this.updateCourseCompletion(tx, userId, courseId);
  }
  private async handleChapterTimeout(tx: any, userId: string, courseId: string, chapterId: string) {
    const progress = await tx.userChapterProgress.update({
      where: {
        userId_courseId_chapterId: {
          userId,
          courseId,
          chapterId
        }
      },
      data: {
        status: 'failed',
        isTimedOut: true,
        timeOutAt: new Date()
      }
    });

    return progress;
  }

  async canAccessChapter(
    userId: string,
    courseId: string,
    chapterId: string
  ): Promise<boolean> {
    const progress = await prisma.userChapterProgress.findUnique({
      where: {
        userId_courseId_chapterId: {
          userId,
          courseId,
          chapterId
        }
      },
      include: {
        chapter: {
          select: {
            orderIndex: true
          }
        }
      }
    });

    if (!progress) return false;
    if (progress.status === 'failed') return false;
    
    // completedならいつでもアクセス可能
    if (progress.status === 'completed') return true;

    // タイムアウトチェック
    const timeoutCheck = await timeoutService.checkChapterTimeout(
      userId,
      courseId,
      chapterId
    );
    
    return !timeoutCheck.isTimedOut;
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
          in: ['active', 'ACTIVE']
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

  async getChapterPeerSubmissions(
    courseId: string,
    chapterId: string,
    currentUserId: string,
    page: number = 1,
    perPage: number = 10
  ): Promise<GetPeerSubmissionsResponse> {
    try {
      console.log('Getting peer submissions:', { courseId, chapterId, currentUserId });

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

      console.log('Found chapter:', {
        requestedCourseId: courseId,
        actualCourseId: chapter.courseId,
        chapterId,
        taskId: chapter.taskId
      });

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

      const total = await prisma.submission.count({
        where: {
          taskId: chapter.taskId,
          userId: {
            not: currentUserId
          }
        }
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
      return !progress || progress.status !== 'completed';
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