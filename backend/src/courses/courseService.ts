import { PrismaClient, Prisma } from '@prisma/client';
import { CreateCourseDTO, UpdateCourseDTO, CreateChapterDTO } from './courseTypes';

const prisma = new PrismaClient();

export class CourseService {
  async createCourse(data: CreateCourseDTO) {
    const courseData: Prisma.CourseCreateInput = {
      title: data.title,
      description: data.description,
      gemCost: data.gemCost,
      level: 1,
      levelRequired: data.levelRequired,
      rankRequired: data.rankRequired,
      isPublished: false,
      isArchived: false,
      timeLimit: data.timeLimit,
      passingScore: data.passingScore || 60,
      excellentScore: data.excellentScore || 95,
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
      ...(typeof data.gemCost === 'number' && { gemCost: data.gemCost }), // 0も含めて数値として扱う
      // ...
      ...(data.title && { title: data.title }),
      ...(data.description && { description: data.description }),
      ...(typeof data.levelRequired === 'number' && { levelRequired: data.levelRequired }),
      ...(data.rankRequired && { rankRequired: data.rankRequired }),
      ...(typeof data.timeLimit === 'number' && { timeLimit: data.timeLimit }),
      ...(typeof data.passingScore === 'number' && { passingScore: data.passingScore }),
      ...(typeof data.excellentScore === 'number' && { excellentScore: data.excellentScore }),
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

  async addChapter(courseId: string, data: CreateChapterDTO) {
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
            isFinalExam: false
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
}

export const courseService = new CourseService();
