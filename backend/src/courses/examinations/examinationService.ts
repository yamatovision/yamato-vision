// backend/src/courses/examinations/examinationService.ts

import { PrismaClient, Prisma } from '@prisma/client';
import { evaluationService } from '../submissions/evaluationService';
import { claudeService } from '../submissions/claudeService';
import { finalExamEvaluationService } from '../submissions/finalExamEvaluationService';
import { CourseProgressManager } from '../progress/courseProgressManager';


import {
  ExamError,
  ExamProgress,
  ExamResult,
  ExamSection,
  GRADE_CRITERIA,
  StartExamRequest,
  SubmitSectionRequest
} from '../types/examination';
import { timeoutService } from '../timeouts/timeoutService';

const prisma = new PrismaClient();

interface SectionResult {
  sectionId: string;
  score: number;
  feedback: string;
  nextStep: string;
  submittedAt: Date;
}

interface FinalExamProgress {
  section1Score: number | null;
  section1Feedback: string | null;
  section1SubmittedAt: Date | null;
  section2Score: number | null;
  section2Feedback: string | null;
  section2SubmittedAt: Date | null;
  section3Score: number | null;
  section3Feedback: string | null;
  section3SubmittedAt: Date | null;
  currentSection: number;
}

interface ExamSectionConfig {
  number: number;
  title: string;
  task: {
    materials: string;
    task: string;
    evaluationCriteria: string;
  };
  maxPoints: number;
}



interface ExamSettings {
  sections: {
    title: string;
    task: {
      materials: string;
      task: string;
      evaluationCriteria: string;
    };
  }[];
}

interface ExamSectionConfig {
  number: number;  // 追加
  title: string;
  task: {
    materials: string;
    task: string;
    evaluationCriteria: string;
  };
  maxPoints: number;
}

export class ExaminationService {
  private prisma: PrismaClient;
  private progressManager: CourseProgressManager;

  constructor() {
    this.prisma = new PrismaClient();
    this.progressManager = new CourseProgressManager();
  }



  private async getExamSections(chapterId: string): Promise<ExamSectionConfig[]> {
    const chapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
      include: {
        task: true
      }
    });
  
    if (!chapter) {
      throw new ExamError('チャプターが見つかりません', 'NOT_FOUND');
    }
  
    // examSettingsの型を明示的に指定
    const examSettingsData = chapter.examSettings as unknown;
    const examSettings = examSettingsData as ExamSettings | null;
  
    if (!examSettings) {
      throw new ExamError('試験設定が見つかりません', 'NOT_FOUND');
    }
  
    // セクションごとの配点を定義
    const sectionPoints = {
      1: 30, // セクション1: 30点
      2: 30, // セクション2: 30点
      3: 40  // セクション3: 40点
    };
  
    return examSettings.sections.map((section, index) => ({
      number: (index + 1) as 1 | 2 | 3,
      title: section.title,
      task: {
        materials: section.task.materials,
        task: section.task.task,
        evaluationCriteria: section.task.evaluationCriteria
      },
      maxPoints: sectionPoints[index + 1 as 1 | 2 | 3]
    }));
  }

  async getExamProgress({ userId, courseId, chapterId }: {
    userId: string;
    courseId: string;
    chapterId: string;
  }): Promise<ExamProgress> {
    return await this.prisma.$transaction(async (tx) => {
      // チャプターの存在確認と試験設定の取得
      const chapter = await tx.chapter.findUnique({
        where: { 
          id: chapterId,
          isFinalExam: true
        },
        include: { task: true }
      });

      if (!chapter) {
        throw new ExamError('試験が見つかりません', 'NOT_FOUND');
      }

      // 進捗状態の取得
      const progress = await tx.userChapterProgress.findUnique({
        where: {
          userId_courseId_chapterId: {
            userId,
            courseId,
            chapterId
          }
        },
        include: {
          finalExam: true  // 試験固有のデータを取得
        }
      });

      // 試験セクション情報の取得
      const sections = await this.getExamSections(chapterId);

      if (!progress) {
        // 未開始の場合は基本情報のみ返す
        return {
          userId,
          chapterId,
          currentSection: 0,
          startedAt: new Date(),  // この時点では仮の日時
          timeLimit: chapter.timeLimit || 2,
          isComplete: false,
          sections: sections.map(section => ({
            id: `section-${section.number}`, // section.id を section.number を使用した文字列に変更
            title: section.title,
            maxPoints: section.maxPoints,
            task: section.task
          }))
        };
      }

      // 進行中または完了済みの場合
      return {
        userId,
        chapterId,
        currentSection: progress.finalExam?.currentSection ?? 0,
        startedAt: progress.startedAt!,
        timeLimit: chapter.timeLimit || 2,
        isComplete: progress.status === 'COMPLETED',
        completedAt: progress.completedAt || undefined,
        sections: sections.map(section => ({
          id: `section-${section.number}`, // section.id を section.number を使用した文字列に変更
          title: section.title,
          maxPoints: section.maxPoints,
          task: section.task
        })),
        sectionResults: progress.finalExam ? this.formatSectionResults(progress.finalExam) : []
      };
    });
  }
  private formatSectionResults(finalExam: FinalExamProgress): SectionResult[] {
    const results: SectionResult[] = [];
    
    // 各セクションのデータが存在する場合のみ結果に追加
    if (finalExam.section1Score !== null && finalExam.section1SubmittedAt) {
      results.push({
        sectionId: 'section-1',
        score: finalExam.section1Score,
        feedback: finalExam.section1Feedback || '',
        nextStep: '',
        submittedAt: finalExam.section1SubmittedAt
      });
    }
  
    if (finalExam.section2Score !== null && finalExam.section2SubmittedAt) {
      results.push({
        sectionId: 'section-2',
        score: finalExam.section2Score,
        feedback: finalExam.section2Feedback || '',
        nextStep: '',
        submittedAt: finalExam.section2SubmittedAt
      });
    }
  
    if (finalExam.section3Score !== null && finalExam.section3SubmittedAt) {
      results.push({
        sectionId: 'section-3',
        score: finalExam.section3Score,
        feedback: finalExam.section3Feedback || '',
        nextStep: '',
        submittedAt: finalExam.section3SubmittedAt
      });
    }
  
    return results;
  }

  // 試験開始処理
  async startExam({ userId, chapterId }: StartExamRequest): Promise<ExamProgress> {
    return await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // 1. チャプター情報の取得
      const chapter = await tx.chapter.findUnique({
        where: { 
          id: chapterId,
          isFinalExam: true
        },
        include: { task: true }
      });

      if (!chapter) {
        throw new ExamError('試験が見つかりません', 'NOT_FOUND');
      }

      // 2. CourseProgressManager経由で進捗管理を行う
      const progress = await this.progressManager.handleFirstAccess(
        tx,
        userId,
        chapter.courseId,
        chapterId
      );

      if (!progress || !progress.startedAt) {
        throw new ExamError('試験の開始に失敗しました', 'INVALID_STATE');
      }

      // 3. 試験セクション情報の取得
      const sections = await this.getExamSections(chapterId);

      // 4. レスポンスの形成
      return {
        userId,
        chapterId,
        currentSection: 0,
        startedAt: progress.startedAt!,
        timeLimit: chapter.timeLimit || 2, // デフォルト2時間
        isComplete: false,
        sections: sections.map(section => ({
          id: `section-${section.number}`,
          title: section.title,
          task: section.task,
          maxPoints: section.maxPoints
        }))
      };
    });
  }
  
  // セクション提出処理
  async submitSection({ userId, chapterId, sectionNumber, content }: SubmitSectionRequest): Promise<ExamResult | null> {
    const progress = await prisma.userChapterProgress.findUnique({
      where: {
        userId_courseId_chapterId: {
          userId,
          chapterId,
          courseId: (await prisma.chapter.findUnique({ where: { id: chapterId } }))?.courseId!
        }
      },
      include: {
        chapter: true
      }
    });

    if (!progress || progress.status !== 'IN_PROGRESS') {
      throw new ExamError('無効な試験状態です', 'INVALID_STATE');
    }

    // セクション情報の取得
    const sections = await this.getExamSections(chapterId);
    const currentSection = sections[sectionNumber];

    if (!currentSection) {
      throw new ExamError('無効なセクション番号です', 'INVALID_STATE');
    }

    // 時間制限チェック
    const timeoutCheck = await timeoutService.checkChapterTimeout(userId, progress.courseId, chapterId);
    const isTimeOut = timeoutCheck.isTimedOut;

    // 提出を評価
    const evaluationResult = await finalExamEvaluationService.evaluateSection({
      sectionNumber: (sectionNumber + 1) as 1 | 2 | 3,
      title: sections[sectionNumber].title,
      materials: sections[sectionNumber].task.materials,
      task: sections[sectionNumber].task.task,
      evaluationCriteria: sections[sectionNumber].task.evaluationCriteria,
      submission: content
    });
  

    // セクション結果を保存
    const submission = await prisma.submission.create({
      data: {
        userId,
        taskId: progress.chapter.taskId!,
        content,
        points: isTimeOut ? Math.floor(evaluationResult.evaluation.total_score * 0.8) : evaluationResult.evaluation.total_score,
        feedback: evaluationResult.evaluation.feedback,
        nextStep: evaluationResult.evaluation.next_step || null,
        submittedAt: new Date(),
        evaluatedAt: new Date()
      }
    });

    // セクションスコアを更新
    const currentSectionScores = progress.sectionScores as Record<string, number> || {};
    currentSectionScores[sectionNumber] = submission.points;

    // 全セクション完了チェック
    const isLastSection = sectionNumber === sections.length - 1;

    if (isLastSection) {
      await prisma.userChapterProgress.update({
        where: { id: progress.id },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
          bestSubmissionId: submission.id,
          bestTaskContent: content,
          bestFeedback: evaluationResult.evaluation.feedback,
          sectionScores: currentSectionScores
        }
      });
      
      return await this.finalizeExam(userId, chapterId);
    }

    // 次のセクションへ
    await prisma.userChapterProgress.update({
      where: { id: progress.id },
      data: {
        currentSection: sectionNumber + 1,
        sectionScores: currentSectionScores
      }
    });

    return null;
  }

  // 試験の最終評価
  private async finalizeExam(userId: string, chapterId: string): Promise<ExamResult> {
    const progress = await prisma.userChapterProgress.findUnique({
      where: {
        userId_courseId_chapterId: {
          userId,
          chapterId,
          courseId: (await prisma.chapter.findUnique({ where: { id: chapterId } }))?.courseId!
        }
      }
    });

    if (!progress) {
      throw new ExamError('試験データが見つかりません', 'NOT_FOUND');
    }

    const sections = await this.getExamSections(chapterId);
    const sectionScores = progress.sectionScores as Record<string, number>;
    
    // 未回答のセクションは0点として計算
    const totalScore = Math.round(
      sections.map((_, index) => sectionScores[index] || 0)
        .reduce((sum, score) => sum + score, 0) / sections.length
    );

    const grade = this.getGrade(totalScore);

    // 成績履歴を作成
    await prisma.gradeHistory.create({
      data: {
        userId,
        courseId: progress.courseId,
        grade: grade.label,
        gradePoint: grade.point,
        credits: 1,
        completedAt: new Date()
      }
    });

    return {
      totalScore,
      grade: grade.label,
      gradePoint: grade.point,
      feedback: await this.generateFinalFeedback(sectionScores, sections),
      sectionResults: sections.map((section, index) => ({
        sectionId: `section${index + 1}`,
        score: sectionScores[index] || 0,
        feedback: section.title,
        nextStep: '',
        submittedAt: progress.completedAt!
      })),
      evaluatedAt: new Date()
    };
  }

  // 最終フィードバック生成（実際の実装ではAI生成を使用）
  private async generateFinalFeedback(
    sectionScores: Record<string, number>,
    sections: ExamSectionConfig[]
  ): Promise<string> {
    try {
      // システムメッセージの構築
      const evaluationData = sections.map((section, index) => ({
        title: section.title,
        score: sectionScores[index] || 0,
        maxPoints: section.maxPoints
      }));
  
      const message = {
        role: "user" as const,
        content: `
  以下の最終試験の結果に基づいて、総合的なフィードバックを生成してください：
  ${JSON.stringify(evaluationData, null, 2)}
  
  以下の点を含めて、簡潔かつ具体的なフィードバックを作成してください：
  1. 全体的な強み
  2. 改善が必要な分野
  3. 今後の学習アドバイス
  `
      };
  
      // Claude APIを使用してフィードバックを生成
      const response = await claudeService.messages.create({
        system: `あなたは教育評価の専門家として、試験結果に基づく建設的なフィードバックを提供します。
  フィードバックは具体的で、学習意欲を高めるような内容にしてください。`,
        messages: [message],
        max_tokens: 1000
      });
  
      if (response.content[0].type === 'text') {
        return response.content[0].text;
      }
  
      return '試験結果に基づくフィードバックの生成に失敗しました。';
    } catch (error) {
      console.error('Feedback generation error:', error);
      return '試験お疲れ様でした。各セクションの評価結果に基づいて、さらなる学習を進めてください。';
    }
  }

  // 成績評価の計算（変更なし）
  private getGrade(score: number) {
    if (score >= GRADE_CRITERIA.SHU.min) return { label: '秀' as const, point: GRADE_CRITERIA.SHU.point };
    if (score >= GRADE_CRITERIA.YU.min) return { label: '優' as const, point: GRADE_CRITERIA.YU.point };
    if (score >= GRADE_CRITERIA.RYO.min) return { label: '良' as const, point: GRADE_CRITERIA.RYO.point };
    if (score >= GRADE_CRITERIA.KA.min) return { label: '可' as const, point: GRADE_CRITERIA.KA.point };
    return { label: '不可' as const, point: GRADE_CRITERIA.FUKA.point };
  }
}

export const examinationService = new ExaminationService();