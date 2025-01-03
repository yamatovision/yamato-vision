import { PrismaClient, Prisma } from '@prisma/client';
import { CreateCourseDTO, UpdateCourseDTO, CourseStatus } from './courseTypes';

const prisma = new PrismaClient();

export class CourseService {
  async createCourse(data: CreateCourseDTO) {
    const courseData: Prisma.CourseCreateInput = {
      title: data.title,
      description: data.description,
      level: 1,
      levelRequired: data.levelRequired,
      rankRequired: data.rankRequired,
      requirementType: data.requirementType || 'OR',
      canEarnHigherStatus: data.canEarnHigherStatus ?? true,
      isPublished: false,
      isArchived: false,
      timeLimit: data.timeLimit,
      thumbnail: data.thumbnail
    };

    return prisma.course.create({
      data: courseData,
      include: {
        chapters: true
      }
    });
  }

  async updateCourse(id: string, data: UpdateCourseDTO) {
    const updateData: Prisma.CourseUpdateInput = {
      ...(data.title && { title: data.title }),
      ...(data.description && { description: data.description }),
      ...(typeof data.levelRequired === 'number' && { levelRequired: data.levelRequired }),
      ...(data.rankRequired && { rankRequired: data.rankRequired }),
      ...(data.requirementType && { requirementType: data.requirementType }),
      ...(typeof data.canEarnHigherStatus === 'boolean' && { 
        canEarnHigherStatus: data.canEarnHigherStatus 
      }),
      ...(typeof data.timeLimit === 'number' && { timeLimit: data.timeLimit }),
      ...(data.thumbnail && { thumbnail: data.thumbnail }),
      ...(typeof data.isPublished !== 'undefined' && {
        isPublished: data.isPublished,
        publishedAt: data.isPublished ? new Date() : null
      }),
      ...(typeof data.isArchived !== 'undefined' && {
        isArchived: data.isArchived,
        archivedAt: data.isArchived ? new Date() : null
      })
    };

    return prisma.course.update({
      where: { id },
      data: updateData,
      include: {
        chapters: {
          include: {
            task: true
          }
        }
      }
    });
  }
// courseService.ts内の計算部分を簡略化
async calculateCourseAchievementRate(courseId: string, userId: string) {
  const chapters = await prisma.chapter.findMany({
    where: { courseId },
    include: {
      userProgress: {
        where: { userId }
      },
      task: {
        include: {
          submissions: {
            where: { userId },
            orderBy: { submittedAt: 'desc' },
            take: 1
          }
        }
      }
    }
  });

  let totalPossibleExp = 0;
  let totalEarnedExp = 0;

  for (const chapter of chapters) {
    const progress = chapter.userProgress[0];
    const submission = chapter.task?.submissions[0];

    if (progress && submission?.points) {
      // チャプターで設定された経験値の重みを使用
      totalPossibleExp += chapter.experienceWeight || 100; // デフォルト値として100を使用
      totalEarnedExp += (submission.points / 100) * (chapter.experienceWeight || 100);
    }
  }

  // 達成率を計算（0-100の範囲）
  const achievementRate = totalPossibleExp > 0 
    ? (totalEarnedExp / totalPossibleExp) * 100 
    : 0;

  return {
    achievementRate,
    totalPossibleExp,
    totalEarnedExp
  };
}
async getCourseById(id: string) {
  return prisma.course.findUnique({
    where: { id },
    include: {
      chapters: {
        include: {
          task: true
        },
        orderBy: {
          orderIndex: 'asc'
        }
      }
    }
  });
}


  async getCourses(filter?: {
    isPublished?: boolean;
    isArchived?: boolean;
  }) {
    const where: Prisma.CourseWhereInput = {
      ...(filter?.isPublished !== undefined && { isPublished: filter.isPublished }),
      ...(filter?.isArchived !== undefined && { isArchived: filter.isArchived })
    };

    return prisma.course.findMany({
      where,
      include: {
        chapters: {
          include: {
            task: true
          },
          orderBy: {
            orderIndex: 'asc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  async deleteCourse(id: string) {
    await prisma.course.delete({
      where: { id }
    });
  }

  // チャプター関連のメソッドは残すが、シンプル化
  async addChapter(courseId: string, data: any) {
    return prisma.course.update({
      where: { id: courseId },
      data: {
        chapters: {
          create: {
            title: data.title,
            subtitle: data.subtitle,
            content: JSON.stringify(data.content),
            orderIndex: data.orderIndex,
            timeLimit: data.timeLimit,
            releaseTime: data.releaseTime,
            isVisible: true,
            isFinalExam: data.isFinalExam || false
          }
        }
      },
      include: {
        chapters: {
          include: {
            task: true
          }
        }
      }
    });
  }
}

export const courseService = new CourseService();
