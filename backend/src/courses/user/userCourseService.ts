import { PrismaClient } from '@prisma/client';
import { CourseWithStatus, CourseStatus } from './userCourseTypes';

const prisma = new PrismaClient();

export class UserCourseService {
  async getAvailableCourses(userId: string): Promise<CourseWithStatus[]> {
    // ユーザー情報を取得
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

    // 公開済みの全コースを取得
    const courses = await prisma.course.findMany({
      where: {
        isPublished: true,
        isArchived: false,
      },
      include: {
        chapters: true,
      },
    });

    // コースのステータスを判定して返却
    return courses.map(course => {
      const userCourse = user.courses.find(uc => uc.courseId === course.id);
      
      let status: CourseStatus;
      if (userCourse) {
        status = 'unlocked';
      } else if (
        (!course.levelRequired || user.level >= course.levelRequired) &&
        (!course.rankRequired || user.rank === course.rankRequired) &&
        (!course.gemCost || user.gems >= course.gemCost)
      ) {
        status = 'available';
      } else if (course.levelRequired && user.level < course.levelRequired) {
        status = 'level_locked';
      } else if (course.rankRequired && user.rank !== course.rankRequired) {
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

  async purchaseCourse(userId: string, courseId: string) {
    // トランザクションを開始
    return await prisma.$transaction(async (tx) => {
      // ユーザーとコースの情報を取得
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

      // 購入条件のチェック
      if (course.levelRequired && user.level < course.levelRequired) {
        return { error: 'Level requirement not met' };
      }
      if (course.rankRequired && user.rank !== course.rankRequired) {
        return { error: 'Rank requirement not met' };
      }
      if (course.gemCost && user.gems < course.gemCost) {
        return { error: 'Insufficient gems' };
      }

      // 既に購入済みかチェック
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

      // 購入処理
      if (course.gemCost) {
        await tx.user.update({
          where: { id: userId },
          data: { gems: user.gems - course.gemCost }
        });
      }

      // UserCourseレコードを作成
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