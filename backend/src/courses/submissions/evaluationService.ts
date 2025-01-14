// backend/src/courses/submissions/evaluationService.ts
import { claudeService } from './claudeService';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface EvaluationResponse {
  evaluation: {
    total_score: number;
    feedback: string;
    next_step: string;
  }
}

export class EvaluationService {
  private static generateSystemMessage(careerIdentity?: string): string {
    const nextStepMessage = careerIdentity
      ? `今回の課題で得た知見がどう${careerIdentity}として成長するのに役立つかを伝え、プロフェッショナルとしてのアドバイスをする`
      : "今回の課題で得た知見がどう資産家になるのに役立つかを伝え、資産家としてのアドバイスをする";

    return `あなたは教育評価者です。以下のXMLタグで区切られた情報を評価してください：

<materials>: 講座内容
<task>: 課題内容 
<evaluation_criteria>: 評価基準
<submission>: 受講者の回答

評価結果は以下の形式で返してください：

{
  "evaluation": {
    "total_score": 整数値 (0-100の整数値で評価してください),
    "feedback": "評価コメント：
※箇条書き禁止。最も重要なポイントを簡潔な文章で伝えること。
※学習意欲を高め、基準の維持・向上につながる表現を使用すること。",
    "next_step": "${nextStepMessage}：
※具体的な提案を1つだけ記載すること。
※複数の提案は禁止。"
  }
}`;
  }

  async evaluateSubmission(params: {
    materials: string;
    task: string;
    evaluationCriteria: string;
    submission: string;
    userId?: string;  // オプショナルパラメータとして追加
  }) {
    try {
      let systemMessage = EvaluationService.generateSystemMessage();

      // ユーザーIDが提供された場合、キャリアアイデンティティを取得
      if (params.userId) {
        try {
          const user = await prisma.user.findUnique({
            where: { id: params.userId },
            select: { careerIdentity: true }
          });
          if (user?.careerIdentity) {
            systemMessage = EvaluationService.generateSystemMessage(user.careerIdentity);
          }
        } catch (error) {
          console.warn('Failed to fetch career identity:', error);
          // エラーが発生してもデフォルトのメッセージで続行
        }
      }

      const messages = [
        {
          role: "user" as const,
          content: `<materials>${params.materials}</materials><task>${params.task}</task><evaluation_criteria>${params.evaluationCriteria}</evaluation_criteria><submission>${params.submission}</submission>`
        }
      ];

      // オプションでトークン数を事前確認
      try {
        const tokenCount = await claudeService.countTokens(messages, systemMessage);
        console.log('Submission token count:', tokenCount);
      } catch (error) {
        console.warn('Token counting failed:', error);
      }

      const response = await claudeService.messages.create({
        system: systemMessage,
        messages: messages,
        max_tokens: 1024
      });

      const responseText = response.content[0].type === 'text' 
        ? response.content[0].text 
        : '';
    
      const result = this.parseResponse(responseText);
      return result;

    } catch (error) {
      console.error('Evaluation failed:', error);
      throw new Error('課題の評価に失敗しました');
    }
  }

  private parseResponse(responseText: string): EvaluationResponse {
    try {
      // JSON部分の抽出と解析
      const jsonMatch = responseText.match(/{[\s\S]*}/);
      if (!jsonMatch) {
        throw new Error('レスポンスの解析に失敗しました');
      }

      const result: EvaluationResponse = JSON.parse(jsonMatch[0]);

      // バリデーション - total_scoreが0の場合も有効とする
      if (!result.evaluation || 
          typeof result.evaluation.total_score !== 'number' ||  // 数値型チェック
          !result.evaluation.feedback ||
          !result.evaluation.next_step) {
        throw new Error('不完全なレスポンス形式です');
      }

      // スコアの範囲チェック
      result.evaluation.total_score = Math.max(0, Math.min(100, 
        Math.round(result.evaluation.total_score)
      ));

      return result;

    } catch (error) {
      console.error('Response parsing failed:', error);
      throw new Error('評価結果の解析に失敗しました');
    }
  }
}

export const evaluationService = new EvaluationService();