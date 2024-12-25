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
      const chapter = await chapterService.getChapter(req.params.chapterId);
      if (!chapter) {
        return res.status(404).json({ message: 'チャプターが見つかりません' });
      }
      return res.json(chapter);
    } catch (error) {
      console.error('Error fetching chapter:', error);
      return res.status(500).json({ message: 'チャプターの取得に失敗しました' });
    }
  }
  // コースのチャプター一覧取得
  async getChapters(
    req: Request<{ courseId: string }>,
    res: Response
  ) {
    try {
      const chapters = await chapterService.getChapters(req.params.courseId);
      return res.json(chapters);
    } catch (error) {
      console.error('Error fetching chapters:', error);
      return res.status(500).json({ message: 'チャプター一覧の取得に失敗しました' });
    }
  }
  // チャプター順序更新
  async updateChaptersOrder(
    req: Request<{ courseId: string }, {}, ChapterOrderItem[]>,
    res: Response
  ) {
    try {
      await chapterService.updateChaptersOrder(req.body);
      return res.status(200).json({ message: '順序を更新しました' });
    } catch (error) {
      console.error('Error updating chapter order:', error);
      return res.status(500).json({ message: 'チャプター順序の更新に失敗しました' });
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
