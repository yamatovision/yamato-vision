import { PrismaClient } from '@prisma/client';
import { 
  CreateCourseDTO, 
  UpdateCourseDTO, 
  CourseWithChapters,
  CreateChapterDTO 
} from './courseTypes';

const prisma = new PrismaClient();

export class CourseService {
  async createCourse(data: CreateCourseDTO): Promise<CourseWithChapters> {
    return prisma.course.create({
      data: {
        ...data,
        isPublished: false,
        isArchived: false,
      },
      include: {
        chapters: true
      }
    });
  }

  async updateCourse(id: string, data: UpdateCourseDTO): Promise<CourseWithChapters> {
    return prisma.course.update({
      where: { id },
      data: {
        ...data,
        publishedAt: data.isPublished ? new Date() : undefined,
        archivedAt: data.isArchived ? new Date() : undefined,
      },
      include: {
        chapters: true
      }
    });
  }

  async addChapter(courseId: string, data: CreateChapterDTO) {
    return prisma.chapter.create({
      data: {
        ...data,
        content: JSON.stringify(data.content),
        courseId,
        task: {
          create: {
            description: data.task.description,
            systemMessage: data.task.systemMessage,
            referenceText: data.task.referenceText,
            maxPoints: data.task.maxPoints,
            type: 'chapter'
          }
        }
      },
      include: {
        task: true
      }
    });
  }

  async getCourseById(id: string): Promise<CourseWithChapters | null> {
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
  }): Promise<CourseWithChapters[]> {
    return prisma.course.findMany({
      where: filter,
      include: {
        chapters: {
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

  async deleteCourse(id: string): Promise<void> {
    await prisma.course.delete({
      where: { id }
    });
  }
}

export const courseService = new CourseService();
