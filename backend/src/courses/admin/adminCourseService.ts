// backend/src/courses/admin/adminCourseService.ts

import { PrismaClient, Prisma } from '@prisma/client';
import { CourseProgressManager } from '../progress/courseProgressManager';
import { CreateCourseDTO, UpdateCourseDTO, CourseWithChapters } from '../types/course';

export class AdminCourseService {
  private prisma: PrismaClient;
  private progressManager: CourseProgressManager;

  constructor() {
    this.prisma = new PrismaClient();
    this.progressManager = new CourseProgressManager();
  }

  async createCourse(data: CreateCourseDTO): Promise<CourseWithChapters> {
    return await this.prisma.$transaction(async (tx) => {
      const course = await tx.course.create({
        data: {
          title: data.title,
          description: data.description,
          level: 1,
          levelRequired: data.levelRequired,
          rankRequired: data.rankRequired,
          canEarnHigherStatus: data.canEarnHigherStatus ?? true,
          isPublished: false,
          isArchived: false,
          timeLimit: data.timeLimit,
          thumbnail: data.thumbnail,
          credits: data.credits ?? 1,  // 追加：デフォルト1単位
        },
        include: {
          chapters: {
            include: {
              task: true
            }
          }
        }
      });

      await this.progressManager.handleCourseStateChange({
        courseId: course.id,
        changes: {
          timeLimit: data.timeLimit
        }
      });

      return course;
    });
  }

  async updateCourse(id: string, data: UpdateCourseDTO): Promise<CourseWithChapters> {
    return await this.prisma.$transaction(async (tx) => {
      const course = await tx.course.update({
        where: { id },
        data: {
          ...(data.title && { title: data.title }),
          ...(data.description && { description: data.description }),
          ...(typeof data.levelRequired === 'number' && { levelRequired: data.levelRequired }),
          ...(data.rankRequired && { rankRequired: data.rankRequired }),
          ...(typeof data.canEarnHigherStatus === 'boolean' && { 
            canEarnHigherStatus: data.canEarnHigherStatus 
          }),
          ...(typeof data.timeLimit === 'number' && { timeLimit: data.timeLimit }),
          ...(data.thumbnail && { thumbnail: data.thumbnail }),
          ...(typeof data.credits === 'number' && { credits: data.credits }), // 追加：単位数の更新
          ...(typeof data.isPublished !== 'undefined' && {
            isPublished: data.isPublished,
            publishedAt: data.isPublished ? new Date() : null
          }),
          ...(typeof data.isArchived !== 'undefined' && {
            isArchived: data.isArchived,
            archivedAt: data.isArchived ? new Date() : null
          }),
          updatedAt: new Date()
        },
        include: {
          chapters: {
            include: {
              task: true
            }
          }
        }
      });

      // コース設定変更時のプログレス管理通知
      if (data.timeLimit !== undefined || data.isPublished !== undefined || data.isArchived !== undefined) {
        await this.progressManager.handleCourseStateChange({
          courseId: course.id,
          changes: {
            timeLimit: data.timeLimit,
            isPublished: data.isPublished,
            isArchived: data.isArchived
          }
        });
      }

      return course;
    });
  }

  async getCourseById(id: string): Promise<CourseWithChapters | null> {
    return this.prisma.course.findUnique({
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
// AdminCourseService.ts
async getCourses(filter?: { isPublished?: boolean }): Promise<CourseWithChapters[]> {
  try {
    console.log('Fetching courses with filter:', filter);

    const where: Prisma.CourseWhereInput = {
      // filterが指定されている場合のみisPublishedを条件に含める
      ...(filter?.isPublished !== undefined && { isPublished: filter.isPublished })
    };

    const courses = await this.prisma.course.findMany({
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

    console.log(`Found ${courses.length} courses`);
    return courses;
  } catch (error) {
    console.error('Error in getCourses:', error);
    throw error;
  }
}


  async deleteCourse(id: string): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      // 関連するすべてのデータを削除
      await tx.userChapterProgress.deleteMany({
        where: { courseId: id }
      });

      await tx.userCourse.deleteMany({
        where: { courseId: id }
      });

      await tx.chapter.deleteMany({
        where: { courseId: id }
      });

      await tx.course.delete({
        where: { id }
      });
    });
  }
}