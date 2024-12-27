import { Request, Response } from 'express';
import { chapterService } from './chapterService';
import { CreateChapterDTO, UpdateChapterDTO, ChapterOrderItem } from './chapterTypes';
export class ChapterController {
  // チャプター作成
  async createChapter(
    req: Request<{ courseId: string }, {}, CreateChapterDTO>,
    res: Response
  ) {
    try {
      const chapter = await chapterService.createChapter(
        req.params.courseId,
        req.body
      );
      return res.status(201).json(chapter);
    } catch (error) {
      console.error('Error creating chapter:', error);
      return res.status(500).json({ message: 'チャプターの作成に失敗しました' });
    }
  }
  // チャプター更新
  async updateChapter(
    req: Request<{ courseId: string; chapterId: string }, {}, UpdateChapterDTO>,
    res: Response
  ) {
    try {
      const chapter = await chapterService.updateChapter(
        req.params.chapterId,
        req.body
      );
      return res.json(chapter);
    } catch (error) {
      console.error('Error updating chapter:', error);
      return res.status(500).json({ message: 'チャプターの更新に失敗しました' });
    }
  }
  // チャプター削除
  async deleteChapter(
    req: Request<{ courseId: string; chapterId: string }>,
    res: Response
  ) {
    try {
      await chapterService.deleteChapter(req.params.chapterId);
      return res.status(204).send();
    } catch (error) {
      console.error('Error deleting chapter:', error);
      return res.status(500).json({ message: 'チャプターの削除に失敗しました' });
    }
  }
  // チャプター取得
  async getChapter(
    req: Request<{ courseId: string; chapterId: string }>,
    res: Response
  ) {
    try {
      // デバッグログ：リクエストパラメータ
      console.log('GetChapter Request:', {
        courseId: req.params.courseId,
        chapterId: req.params.chapterId,
        userId: req.user?.id
      });
  
      const chapter = await chapterService.getChapter(req.params.chapterId);
      
      // デバッグログ：サービスからの結果
      console.log('Chapter Service Result:', {
        found: !!chapter,
        chapterId: req.params.chapterId
      });
  
      if (!chapter) {
        console.log('Chapter not found:', req.params.chapterId);
        return res.status(404).json({
          success: false,
          message: 'チャプターが見つかりません'
        });
      }
  
      // content文字列のパース
      const parsedChapter = {
        ...chapter,
        content: typeof chapter.content === 'string' 
          ? JSON.parse(chapter.content) 
          : chapter.content
      };
  
      // デバッグログ：レスポンスデータ
      console.log('Sending chapter response:', {
        chapterId: parsedChapter.id,
        title: parsedChapter.title
      });
  
      return res.status(200).json({
        success: true,
        data: parsedChapter
      });
    } catch (error) {
      console.error('Error in getChapter:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        chapterId: req.params.chapterId,
        stack: error instanceof Error ? error.stack : undefined
      });
  
      return res.status(500).json({
        success: false,
        message: 'チャプターの取得に失敗しました'
      });
    }
  }
// chapterController.tsに追加
async updateVisibility(
  req: Request<{ courseId: string; chapterId: string }>,
  res: Response
) {
  try {
    const chapter = await chapterService.updateChapterVisibility(
      req.params.chapterId,
      req.body.isVisible
    );
    return res.json({ success: true, data: chapter });
  } catch (error) {
    console.error('Error updating chapter visibility:', error);
    return res.status(500).json({ message: '表示設定の更新に失敗しました' });
  }
}

async updatePerfectOnly(
  req: Request<{ courseId: string; chapterId: string }>,
  res: Response
) {
  try {
    const chapter = await chapterService.updateChapterPerfectOnly(
      req.params.chapterId,
      req.body.isPerfectOnly
    );
    return res.json({ success: true, data: chapter });
  } catch (error) {
    console.error('Error updating chapter perfect only status:', error);
    return res.status(500).json({ message: 'Perfect専用設定の更新に失敗しました' });
  }
}
  async updateChaptersOrder(
    req: Request<{ courseId: string }, {}, Array<{ id: string; orderIndex: number }>>,
    res: Response
  ) {
    try {
      console.log('Updating chapter order:', {
        courseId: req.params.courseId,
        updates: req.body
      });

      await chapterService.updateChaptersOrder(req.body);

      return res.status(200).json({
        success: true,
        message: '順序を更新しました'
      });
    } catch (error) {
      console.error('Error updating chapter order:', error);
      return res.status(500).json({
        success: false,
        message: 'チャプター順序の更新に失敗しました'
      });
    }
  }

  // backend/src/courses/chapters/chapterController.ts
async startChapter(req: Request, res: Response) {
  try {
    const { courseId, chapterId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const result = await chapterService.startChapter(
      userId,
      courseId,
      chapterId
    );

    return res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error starting chapter:', error);
    return res.status(500).json({ message: 'Failed to start chapter' });
  }
}

  // チャプター一覧取得メソッドを追加
  async getChapters(
    req: Request<{ courseId: string }>,
    res: Response
  ) {
    try {
      console.log('Fetching chapters for course:', {
        courseId: req.params.courseId
      });

      const chapters = await chapterService.getChapters(req.params.courseId);

      return res.status(200).json({
        success: true,
        data: chapters
      });
    } catch (error) {
      console.error('Error fetching chapters:', error);
      return res.status(500).json({
        success: false,
        message: 'チャプター一覧の取得に失敗しました'
      });
    }
  }


  // チャプターアクセス状態チェック
  async checkChapterAccess(
    req: Request<{ courseId: string; chapterId: string }>,
    res: Response
  ) {
    try {
      const accessStatus = await chapterService.checkChapterAccess(
        req.body.userId, // フロントエンドからユーザーIDを送信する形に変更
        req.params.courseId,
        req.params.chapterId
      );
      return res.json(accessStatus);
    } catch (error) {
      console.error('Error checking chapter access:', error);
      return res.status(500).json({ message: 'アクセス状態の確認に失敗しました' });
    }
  }
}
export const chapterController = new ChapterController();
