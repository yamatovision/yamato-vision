// backend/src/levelMessages/levelMessageController.ts
import { Request, Response } from 'express';
import { LevelMessageService } from './levelMessageService';
const levelMessageService = new LevelMessageService();
export const levelMessageController = {
  // 全てのメッセージを取得
  async getAll(_req: Request, res: Response) {
    try {
      const messages = await levelMessageService.getAll();
      return res.json({ success: true, data: messages });
    } catch (error) {
      console.error('レベルメッセージ取得エラー:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'レベルメッセージの取得中にエラーが発生しました' 
      });
    }
  },
  // 特定のレベルのメッセージを取得
  async getByLevel(req: Request, res: Response) {
    try {
      const level = parseInt(req.params.level);
      const message = await levelMessageService.getMessageForLevel(level);
      if (!message) {
        return res.status(404).json({
          success: false,
          message: '指定されたレベルのメッセージが見つかりません'
        });
      }
      return res.json({ success: true, data: message });
    } catch (error) {
      console.error('レベルメッセージ取得エラー:', error);
      return res.status(500).json({
        success: false,
        message: 'レベルメッセージの取得中にエラーが発生しました'
      });
    }
  },
  // メッセージを作成
  async create(req: Request, res: Response) {
    try {
      const { level, message } = req.body;
      if (!level || !message) {
        return res.status(400).json({
          success: false,
          message: 'レベルとメッセージは必須です'
        });
      }
      // レベルが数値であることを確認
      const levelNum = parseInt(level);
      if (isNaN(levelNum)) {
        return res.status(400).json({
          success: false,
          message: 'レベルは数値である必要があります'
        });
      }
      // 既存のメッセージをチェック
      const existing = await levelMessageService.getMessageForLevel(levelNum);
      if (existing) {
        return res.status(400).json({
          success: false,
          message: '指定されたレベルのメッセージは既に存在します'
        });
      }
      const newMessage = await levelMessageService.create({
        level: levelNum,
        message: message.trim()
      });
      return res.json({ 
        success: true, 
        data: newMessage,
        message: 'レベルメッセージが正常に作成されました'
      });
    } catch (error) {
      console.error('レベルメッセージ作成エラー:', error);
      return res.status(500).json({
        success: false,
        message: 'レベルメッセージの作成中にエラーが発生しました'
      });
    }
  },
  // メッセージを更新
  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { message, isActive } = req.body;
      if (!message && isActive === undefined) {
        return res.status(400).json({
          success: false,
          message: '更新するデータが指定されていません'
        });
      }
      const updateData: {
        message?: string;
        isActive?: boolean;
      } = {};
      if (message) updateData.message = message.trim();
      if (isActive !== undefined) updateData.isActive = isActive;
      const updated = await levelMessageService.update(id, updateData);
      if (!updated) {
        return res.status(404).json({
          success: false,
          message: '指定されたメッセージが見つかりません'
        });
      }
      return res.json({ 
        success: true, 
        data: updated,
        message: 'レベルメッセージが正常に更新されました'
      });
    } catch (error) {
      console.error('レベルメッセージ更新エラー:', error);
      return res.status(500).json({
        success: false,
        message: 'レベルメッセージの更新中にエラーが発生しました'
      });
    }
  },
  // メッセージを削除
  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const deleted = await levelMessageService.delete(id);
      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: '指定されたメッセージが見つかりません'
        });
      }
      return res.json({
        success: true,
        message: 'レベルメッセージが正常に削除されました'
      });
    } catch (error) {
      console.error('レベルメッセージ削除エラー:', error);
      return res.status(500).json({
        success: false,
        message: 'レベルメッセージの削除中にエラーが発生しました'
      });
    }
  }
};