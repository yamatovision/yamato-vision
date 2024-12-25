import { Request, Response } from 'express';
import { taskService } from './taskService';
import { CreateTaskDTO, UpdateTaskDTO } from './taskTypes';

interface EvaluateSubmissionBody {
  content: string;
  userId: string;  // 追加：必須フィールド
}

export class TaskController {
  // 課題作成
  async createTask(
    req: Request<{ courseId: string; chapterId: string }, {}, CreateTaskDTO>,
    res: Response
  ) {
    try {
      const task = await taskService.createTask(
        req.params.chapterId,
        req.params.courseId,
        req.body
      );
      return res.status(201).json({ data: task });
    } catch (error) {
      console.error('Error creating task:', error);
      return res.status(500).json({ message: '課題の作成に失敗しました' });
    }
  }

  // 課題更新
  async updateTask(
    req: Request<{ taskId: string }, {}, UpdateTaskDTO>,
    res: Response
  ) {
    try {
      const task = await taskService.updateTask(
        req.params.taskId,
        req.body
      );
      return res.json({ data: task });
    } catch (error) {
      console.error('Error updating task:', error);
      return res.status(500).json({ message: '課題の更新に失敗しました' });
    }
  }

  // 課題取得
  async getTask(
    req: Request<{ taskId: string }>,
    res: Response
  ) {
    try {
      const task = await taskService.getTask(req.params.taskId);
      if (!task) {
        return res.status(404).json({ message: '課題が見つかりません' });
      }
      return res.json({ data: task });
    } catch (error) {
      console.error('Error fetching task:', error);
      return res.status(500).json({ message: '課題の取得に失敗しました' });
    }
  }

  // 課題削除
  async deleteTask(
    req: Request<{ taskId: string }>,
    res: Response
  ) {
    try {
      await taskService.deleteTask(req.params.taskId);
      return res.status(204).send();
    } catch (error) {
      console.error('Error deleting task:', error);
      return res.status(500).json({ message: '課題の削除に失敗しました' });
    }
  }

  // 課題の採点
  async evaluateSubmission(
    req: Request<{ taskId: string }, {}, EvaluateSubmissionBody>,
    res: Response
  ) {
    try {
      const task = await taskService.getTask(req.params.taskId);
      if (!task) {
        return res.status(404).json({ message: '課題が見つかりません' });
      }

      const evaluationResult = await taskService.evaluateSubmission({
        systemMessage: task.systemMessage,
        referenceText: task.referenceText || '',
        submission: req.body.content,
        maxPoints: task.maxPoints
      });

      // 採点結果を保存
      const submission = await taskService.saveEvaluation(
        task.id,
        req.body.userId,
        evaluationResult,
        req.body.content
      );

      return res.json({
        data: {
          submission,
          evaluation: evaluationResult
        }
      });
    } catch (error) {
      console.error('Error evaluating submission:', error);
      return res.status(500).json({ message: '課題の評価に失敗しました' });
    }
  }

  // 課題の統計情報取得
  async getTaskStatistics(
    req: Request<{ taskId: string }>,
    res: Response
  ) {
    try {
      const statistics = await taskService.getTaskStatistics(req.params.taskId);
      return res.json({ data: statistics });
    } catch (error) {
      console.error('Error fetching task statistics:', error);
      return res.status(500).json({ message: '統計情報の取得に失敗しました' });
    }
  }
}

export const taskController = new TaskController();
