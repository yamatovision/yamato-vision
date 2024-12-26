// backend/src/courses/user/userCourseService.ts
import { PrismaClient } from '@prisma/client';
import { CourseWithStatus, CourseStatus, USER_RANKS, PurchaseResult, UserRank } from './userCourseTypes';

const prisma = new PrismaClient();

export class UserCourseService {
  async getAvailableCourses(userId: string): Promise<CourseWithStatus[]> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        level: true,
        rank: true,
        gems: true,
        courses: {
          select: { courseId: true }
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
        status = 'unlocked';
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