// backend/src/courses/examinations/examinationService.ts

import { PrismaClient, Prisma } from '@prisma/client';
import { evaluationService } from '../submissions/evaluationService';
import { claudeService } from '../submissions/claudeService';
import { finalExamEvaluationService } from '../submissions/finalExamEvaluationService';


import { CourseProgressManager } from '../progress/courseProgressManager';
import { courseStatusManager } from '../progress/courseStatusManager';


import {
  ExamError,
  ExamProgress,
  ExamResult,
  ExamSection,
  GRADE_CRITERIA,
  StartExamRequest,
  SubmitSectionRequest,
  ExamSectionResponse,
  GetExamProgressParams,  // これを追加
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
// examinationService.ts の修正版
async handleExamTimeout(
  tx: Prisma.TransactionClient,
  params: {
    userId: string;
    courseId: string;
    chapterId: string;
    timeOutAt: Date;
  }
): Promise<void> {
  const { userId, courseId, chapterId, timeOutAt } = params;

  // 1. 現在の試験進捗を取得
  const examProgress = await tx.userChapterProgress.findUnique({
    where: {
      userId_courseId_chapterId: {
        userId,
        courseId,
        chapterId
      }
    },
    include: {
      finalExam: true
    }
  });

  if (!examProgress) {
    throw new ExamError('試験進捗が見つかりません', 'NOT_FOUND');
  }

  // 2. 最終スコアの計算
  const totalScore = this.calculateTimeoutScore(examProgress.finalExam);

  // 3. 試験進捗の更新
  await tx.userChapterProgress.update({
    where: {
      id: examProgress.id
    },
    data: {
      status: 'COMPLETED',
      score: totalScore,
      isTimedOut: true,
      timeOutAt,
      completedAt: timeOutAt
    }
  });

  // 4. 最終試験進捗の更新
  if (examProgress.finalExam) {
    await tx.finalExamProgress.update({
      where: {
        id: examProgress.finalExam.id
      },
      data: {
        examCompletedAt: timeOutAt,
        totalScore,
        // isTimedOutを削除（スキーマに定義されていないフィールド）
      }
    });
  }

  // 5. コース完了処理を実行
  // handleCourseCompletionの引数を3つに修正
  await courseStatusManager.handleCourseCompletion(
    userId,
    courseId,
    totalScore  // 第3引数まで
  );
}

private calculateTimeoutScore(finalExam: any): number {
  if (!finalExam) return 0;

  let totalScore = 0;

  // 完了しているセクションのスコアを合算
  if (finalExam.section1Score !== null) {
    totalScore += finalExam.section1Score;
  }
  if (finalExam.section2Score !== null) {
    totalScore += finalExam.section2Score;
  }
  if (finalExam.section3Score !== null) {
    totalScore += finalExam.section3Score;
  }

  return totalScore;
}
  
  // examinationService.ts に追加
  async getExamResult({ userId, courseId, chapterId }: GetExamProgressParams): Promise<ExamResult> {
    return await this.prisma.$transaction(async (tx) => {
      // 1. 試験の進捗情報を取得
      const progress = await tx.userChapterProgress.findUnique({
        where: {
          userId_courseId_chapterId: {
            userId,
            courseId,
            chapterId
          }
        },
        include: {
          finalExam: true,
          bestSubmission: true
        }
      });
  
      if (!progress || !progress.finalExam) {
        throw new ExamError('試験結果が見つかりません', 'NOT_FOUND');
      }
  
      // 2. チャプター平均点を計算
      const chapterProgresses = await tx.userChapterProgress.findMany({
        where: {
          userId,
          courseId,
          chapter: {
            isFinalExam: false
          },
          NOT: {
            score: null
          }
        },
        select: {
          score: true
        }
      });
  
      const chapterAverage = chapterProgresses.length > 0
        ? chapterProgresses.reduce((sum, p) => sum + (p.score || 0), 0) / chapterProgresses.length
        : 0;
  
      // 3. 最終評価点を計算（チャプター平均70% + 試験30%）
      const examScore = progress.finalExam.totalScore || 0;
      const finalScore = Math.round((chapterAverage * 0.7) + (examScore * 0.3));
  
      // 4. 成績履歴を取得
      const gradeHistory = await tx.gradeHistory.findFirst({
        where: {
          userId,
          courseId,
        },
        orderBy: {
          completedAt: 'desc'
        }
      });
  
      if (!gradeHistory) {
        throw new ExamError('成績情報が見つかりません', 'NOT_FOUND');
      }
  
      // 5. セクション結果の作成
      const sectionResults: SectionResult[] = [];
    
      if (progress.finalExam.section1Score !== null && progress.finalExam.section1SubmittedAt) {
        sectionResults.push({
          sectionId: 'section-1',
          score: progress.finalExam.section1Score,
          feedback: progress.finalExam.section1Feedback || '',
          nextStep: '',
          submittedAt: progress.finalExam.section1SubmittedAt
        });
      }
  
      if (progress.finalExam.section2Score !== null && progress.finalExam.section2SubmittedAt) {
        sectionResults.push({
          sectionId: 'section-2',
          score: progress.finalExam.section2Score,
          feedback: progress.finalExam.section2Feedback || '',
          nextStep: '',
          submittedAt: progress.finalExam.section2SubmittedAt
        });
      }
  
      if (progress.finalExam.section3Score !== null && progress.finalExam.section3SubmittedAt) {
        sectionResults.push({
          sectionId: 'section-3',
          score: progress.finalExam.section3Score,
          feedback: progress.finalExam.section3Feedback || '',
          nextStep: '',
          submittedAt: progress.finalExam.section3SubmittedAt
        });
      }
  
      return {
        totalScore: examScore,
        finalScore: finalScore,        // 重み付け後の最終評価点
        grade: gradeHistory.grade as '秀' | '優' | '良' | '可' | '不可',
        gradePoint: gradeHistory.gradePoint,
        feedback: progress.bestFeedback || '',
        sectionResults, // 修正後の配列を使用
        evaluatedAt: progress.bestEvaluatedAt || progress.completedAt || new Date()
      };
    });
  }
async submitSection({ userId, chapterId, sectionNumber, content }: SubmitSectionRequest): Promise<ExamSectionResponse | null> {
  console.log('試験セクション提出処理を開始:', { userId, chapterId, sectionNumber });

  try {
    // トランザクション外で必要なデータを取得
    console.log('試験セクション情報を取得中...');
    const sections = await this.getExamSections(chapterId);
    const currentSection = sections[sectionNumber];
    console.log('セクション情報:', { セクション番号: sectionNumber, タイトル: currentSection?.title });

    if (!currentSection) {
      console.error('無効なセクション番号:', sectionNumber);
      throw new ExamError('無効なセクション番号です', 'INVALID_STATE');
    }

    // 評価の実行
    console.log('回答の評価を開始...');
    const evaluationResult = await finalExamEvaluationService.evaluateSection({
      sectionNumber: (sectionNumber + 1) as 1 | 2 | 3,
      title: sections[sectionNumber].title,
      materials: sections[sectionNumber].task.materials,
      task: sections[sectionNumber].task.task,
      evaluationCriteria: sections[sectionNumber].task.evaluationCriteria,
      submission: content
    });
    console.log('評価結果:', {
      得点: evaluationResult.evaluation.total_score,
      フィードバック存在: !!evaluationResult.evaluation.feedback
    });

    // トランザクション実行
    console.log('データベーストランザクションを開始...');
    return await this.prisma.$transaction(async (tx) => {
      console.log('進捗情報を検索中...');
      const progress = await tx.userChapterProgress.findUnique({
        where: {
          userId_courseId_chapterId: {
            userId,
            chapterId,
            courseId: (await tx.chapter.findUnique({ where: { id: chapterId } }))?.courseId!
          }
        },
        include: {
          chapter: true,
          finalExam: true
        }
      });
      console.log('進捗情報:', { 
        存在: !!progress,
        ステータス: progress?.status,
        開始日時: progress?.startedAt
      });

      if (!progress) {
        console.error('進捗情報が見つかりません:', { userId, chapterId });
        throw new ExamError('試験の進捗情報が見つかりません', 'NOT_FOUND');
      }

      // 時間制限チェック
      console.log('時間制限をチェック中...');
      const timeoutCheck = await timeoutService.checkChapterTimeout(userId, progress.courseId, chapterId);
      if (timeoutCheck.isTimedOut) {
        console.error('時間制限超過:', timeoutCheck);
        throw new ExamError('試験の制限時間を超過しています', 'TIMEOUT');
      }

      // 提出を保存
      console.log('回答を保存中...');
      const submission = await tx.submission.create({
        data: {
          userId,
          taskId: progress.chapter.taskId!,
          content,
          points: evaluationResult.evaluation.total_score,
          feedback: evaluationResult.evaluation.feedback,
          nextStep: evaluationResult.evaluation.next_step || null,
          submittedAt: new Date(),
          evaluatedAt: new Date()
        }
      });
      console.log('回答を保存完了:', { 
        提出ID: submission.id,
        得点: submission.points
      });

      // セクションスコアを更新
      console.log('セクションスコアを更新中...');
      const currentSectionScores = progress.sectionScores as Record<string, number> || {};
      currentSectionScores[sectionNumber] = submission.points;

      // FinalExamProgressの更新データを準備
      const sectionData = {
        [`section${sectionNumber + 1}Score`]: submission.points,
        [`section${sectionNumber + 1}Feedback`]: evaluationResult.evaluation.feedback,
        [`section${sectionNumber + 1}SubmittedAt`]: new Date(),
        [`section${sectionNumber + 1}Content`]: content,
      };

      // FinalExamProgressを更新または作成
      console.log('試験進捗データを更新中...');
      await tx.finalExamProgress.upsert({
        where: { progressId: progress.id },
        create: {
          progressId: progress.id,
          examStartedAt: progress.startedAt!,
          currentSection: sectionNumber + 1,
          section1Title: sections[0].title,
          section2Title: sections[1].title,
          section3Title: sections[2].title,
          ...sectionData,
        },
        update: {
          currentSection: sectionNumber + 1,
          ...sectionData,
        }
      });
      console.log('試験進捗データの更新完了');

      // 最後のセクションかどうかを確認
      const isLastSection = sectionNumber === sections.length - 1;
      console.log('セクション状態:', { 
        現在のセクション: sectionNumber + 1, 
        最終セクション: isLastSection 
      });
      if (isLastSection) {
        console.log('最終セクションの処理を開始...');
        
        // 試験の総合点を計算
        const examTotalScore = Object.values(currentSectionScores).reduce(
          (sum: number, score: number) => sum + score, 
          0
        );
        
        // 最終評価を計算（チャプター平均70% + 試験30%）
        const finalGrade = await this.calculateFinalGrade(
          tx,
          userId, 
          progress.courseId, 
          examTotalScore
        );
      
        console.log('最終評価:', { 
          試験総合点: examTotalScore,
          最終評価点: finalGrade.finalScore,
          評価: finalGrade.grade,
          GP: finalGrade.gradePoint 
        });
      
        // CourseStatusManager経由でコース完了処理を実行
        await courseStatusManager.handleCourseCompletion(
          userId,
          progress.courseId,
          finalGrade.finalScore  // 重み付け済みの最終評価点を渡す
        );
      
        // FinalExamProgressの最終更新
        await tx.finalExamProgress.update({
          where: { progressId: progress.id },
          data: {
            examCompletedAt: new Date(),
            totalScore: examTotalScore
          }
        });
      
        // 進捗状況を完了に更新
        await tx.userChapterProgress.update({
          where: { id: progress.id },
          data: {
            status: 'COMPLETED',
            completedAt: new Date(),
            bestSubmissionId: submission.id,
            bestTaskContent: content,
            bestFeedback: evaluationResult.evaluation.feedback,
            sectionScores: currentSectionScores,
            score: examTotalScore  // この行を追加
          }
        });
      }
     
     
      else {
        // 次のセクションへ進める
        console.log('次のセクションへ進める処理を実行中...');
        await tx.userChapterProgress.update({
          where: { id: progress.id },
          data: {
            currentSection: sectionNumber + 1,
            sectionScores: currentSectionScores
          }
        });
      }

      console.log('トランザクション処理が正常に完了');
      // レスポンスを返す
      return {
        sectionId: `section-${sectionNumber + 1}`,
        score: submission.points,
        feedback: evaluationResult.evaluation.feedback,
        nextStep: evaluationResult.evaluation.next_step || '',
        submittedAt: submission.submittedAt.toISOString(),
        isComplete: isLastSection
      };
    });
  } catch (error) {
    console.error('試験セクション提出処理でエラーが発生:', error);
    throw error;
  }
}

// src/courses/examinations/examinationService.ts に追加

async generateCertificate({ userId, courseId, chapterId }: GetExamProgressParams): Promise<{
  studentName: string;
  studentId: string;
  courseName: string;
  grade: string;
  score: number;
  completedAt: string;
  certificateId: string;
}> {
  return await this.prisma.$transaction(async (tx) => {
    // ユーザー情報を取得
    const user = await tx.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        studentId: true
      }
    });

    if (!user || !user.studentId) {
      throw new ExamError('ユーザー情報が見つかりません', 'NOT_FOUND');
    }

    // コース情報を取得
    const course = await tx.course.findUnique({
      where: { id: courseId },
      select: { title: true }
    });

    if (!course) {
      throw new ExamError('コース情報が見つかりません', 'NOT_FOUND');
    }

    // 試験結果を取得
    const examProgress = await tx.userChapterProgress.findUnique({
      where: {
        userId_courseId_chapterId: {
          userId,
          courseId,
          chapterId
        }
      },
      include: {
        finalExam: true
      }
    });

    if (!examProgress || !examProgress.finalExam || !examProgress.completedAt) {
      throw new ExamError('試験結果が見つかりません', 'NOT_FOUND');
    }

    // 成績情報を取得
    const gradeHistory = await tx.gradeHistory.findFirst({
      where: {
        userId,
        courseId
      },
      orderBy: {
        completedAt: 'desc'
      }
    });

    if (!gradeHistory) {
      throw new ExamError('成績情報が見つかりません', 'NOT_FOUND');
    }

    // 証明書IDを生成（ユニークな識別子）
    const certificateId = `CERT-${courseId.slice(-6)}-${userId.slice(-6)}-${Date.now().toString(36)}`;

    return {
      studentName: user.name || '名称未設定',
      studentId: user.studentId,
      courseName: course.title,
      grade: gradeHistory.grade,
      score: examProgress.finalExam.totalScore || 0,
      completedAt: examProgress.completedAt.toISOString(),
      certificateId
    };
  });
}
private async getChapterAverageScore(tx: Prisma.TransactionClient, userId: string, courseId: string): Promise<number> {
  const chapterProgresses = await tx.userChapterProgress.findMany({
    where: {
      userId,
      courseId,
      chapter: {
        isFinalExam: false
      },
      NOT: {
        score: null
      }
    },
    select: {
      score: true
    }
  });

  if (chapterProgresses.length === 0) return 0;

  const totalScore = chapterProgresses.reduce((sum, progress) => sum + (progress.score || 0), 0);
  return totalScore / chapterProgresses.length;
}


private async calculateFinalGrade(
  tx: Prisma.TransactionClient,
  userId: string, 
  courseId: string, 
  examScore: number
): Promise<{
  finalScore: number;
  grade: '秀' | '優' | '良' | '可' | '不可';
  gradePoint: number;
}> {
  // チャプターの平均点を取得
  const chapterAverage = await this.getChapterAverageScore(tx, userId, courseId);
  
  // 最終評価を計算（チャプター平均70% + 最終試験30%）
  const finalScore = Math.round((chapterAverage * 0.7) + (examScore * 0.3));

  console.log('成績計算詳細:', {
    チャプター平均点: chapterAverage,
    最終試験点数: examScore,
    チャプター評価割合: chapterAverage * 0.7,
    試験評価割合: examScore * 0.3,
    最終評価点: finalScore
  });

  const grade = this.getGrade(finalScore);
  return {
    finalScore,
    grade: grade.label,
    gradePoint: grade.point
  };
}


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
  
  // 試験の総合点を計算
  const totalScore = Object.values(sectionScores).reduce((sum, score) => sum + score, 0);

  // チャプター平均点を計算
  const chapterAverage = await this.getChapterAverageScore(prisma, userId, progress.courseId);
  
  // 最終評価点を計算（チャプター平均70% + 試験30%）
  const finalScore = Math.round((chapterAverage * 0.7) + (totalScore * 0.3));

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
    finalScore,  // 追加
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