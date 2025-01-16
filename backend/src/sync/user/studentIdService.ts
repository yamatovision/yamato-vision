// services/studentIdService.ts
import { PrismaClient } from '@prisma/client';

export class StudentIdService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  // 入学年度を決定するメソッドを追加
  determineEnrollmentYear(registrationDate: Date): number {
    return registrationDate.getFullYear();
  }

  async generateStudentId(year: number): Promise<string> {
    const counter = await this.prisma.studentIdCounter.upsert({
      where: { year },
      update: { currentCount: { increment: 1 } },
      create: {
        year,
        currentCount: 1
      }
    });

    const yearPrefix = (year % 100).toString(); // 2025 -> "25"
    const paddedCount = counter.currentCount.toString().padStart(5, '0');
    return `${yearPrefix}V${paddedCount}`;
  }

  async generateBulkStudentIds(year: number, count: number): Promise<string[]> {
    const counter = await this.prisma.studentIdCounter.upsert({
      where: { year },
      update: { currentCount: { increment: count } },
      create: {
        year,
        currentCount: count
      }
    });

    const yearPrefix = (year % 100).toString();
    const startCount = counter.currentCount - count + 1;
    
    return Array.from({ length: count }, (_, index) => {
      const paddedCount = (startCount + index).toString().padStart(5, '0');
      return `${yearPrefix}V${paddedCount}`;
    });
  }
}

export const studentIdService = new StudentIdService();