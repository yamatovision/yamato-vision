// backend/src/courses/examinations/examinationService.ts

import { PrismaClient } from '@prisma/client';
import { evaluationService } from '../submissions/evaluationService';
import { claudeService } from '../submissions/claudeService';
import { finalExamEvaluationService } from '../submissions/finalExamEvaluationService';


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
  // examinationService.ts の修正箇所
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
  
    // セクション番号を明示的に追加
    return examSettings.sections.map((section, index) => ({
      number: index + 1 as 1 | 2 | 3, // 1, 2, 3 のいずれかになることを保証
      title: section.title,
      task: {
        materials: section.task.materials,
        task: section.task.task,
        evaluationCriteria: section.task.evaluationCriteria
      },
      maxPoints: 100 / examSettings.sections.length
    }));
  }

  // 試験開始処理
  async startExam({ userId, chapterId }: StartExamRequest): Promise<ExamProgress> {
    const chapter = await prisma.chapter.findUnique({
      where: { 
        id: chapterId,
        isFinalExam: true
      },
      include: { task: true }
    });
  
    if (!chapter) {
      throw new ExamError('試験が見つかりません', 'NOT_FOUND');
    }
  
    if (!chapter.examTimeLimit) {
      throw new ExamError('試験の制限時間が設定されていません', 'INVALID_STATE');
    }
  
    // 試験セクション情報の取得
    const sections = await this.getExamSections(chapterId);
  
    // 試験開始記録
    const progress = await prisma.userChapterProgress.upsert({
      where: {
        userId_courseId_chapterId: {
          userId,
          courseId: chapter.courseId,
          chapterId
        }
      },
      create: {
        userId,
        courseId: chapter.courseId,
        chapterId,
        status: 'IN_PROGRESS',
        startedAt: new Date(),
        currentSection: 0,
        sectionScores: {},
        bestTaskContent: '',
        bestFeedback: '',
        score: 0
      },
      update: {
        status: 'IN_PROGRESS',
        startedAt: new Date(),
        currentSection: 0,
        sectionScores: {},
        bestTaskContent: '',
        bestFeedback: '',
        score: 0
      }
    });
  
    return {
      userId,
      chapterId,
      currentSection: 0,
      startedAt: progress.startedAt!,
      examTimeLimit: chapter.examTimeLimit, // ExamProgress の型も修正が必要
      isComplete: false,
      sections: sections.map(section => ({
        id: `section-${section.number}`,
        title: section.title,
        content: '',
        maxPoints: section.maxPoints
      }))
    };
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