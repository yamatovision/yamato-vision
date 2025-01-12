// FinalExamEvaluationService.ts

import { claudeService } from './claudeService';

interface SectionEvaluationResponse {
  evaluation: {
    total_score: number;
    feedback: string;
    next_step?: string;
  }
}

export class FinalExamEvaluationService {
  private static readonly SECTION_MAX_SCORES = {
    1: 30,
    2: 30,
    3: 40
  } as const;

  private static getSectionSystemMessage(sectionNumber: 1 | 2 | 3) {
    const maxScore = FinalExamEvaluationService.SECTION_MAX_SCORES[sectionNumber];
    return `あなたは教育評価者です。最終試験のセクション${sectionNumber}を評価します。
このセクションの配点は${maxScore}点です。

提出内容を評価し、以下の形式で返してください：

{
  "evaluation": {
    "total_score": 0から${maxScore}までの整数値,
    "feedback": "評価フィードバック（箇条書き禁止。改行なし）",
    "next_step": "今後の学習アドバイス（具体的な提案を1つだけ記載）"
  }
}`;
  }

  async evaluateSection(params: {
    sectionNumber: 1 | 2 | 3;
    title: string;
    materials: string;
    task: string;
    evaluationCriteria: string;
    submission: string;
  }): Promise<SectionEvaluationResponse> {
    const { sectionNumber, title, materials, task, evaluationCriteria, submission } = params;
    const maxScore = FinalExamEvaluationService.SECTION_MAX_SCORES[sectionNumber];

    const messages = [
      {
        role: "user" as const,
        content: `
セクション${sectionNumber}: ${title}
配点: ${maxScore}点

<materials>${materials}</materials>
<task>${task}</task>
<evaluation_criteria>${evaluationCriteria}</evaluation_criteria>
<submission>${submission}</submission>`
      }
    ];

    try {
      // オプションでトークン数を事前確認
      try {
        const tokenCount = await claudeService.countTokens(messages, 
          FinalExamEvaluationService.getSectionSystemMessage(sectionNumber));
        console.log('Section evaluation token count:', tokenCount);
      } catch (error) {
        console.warn('Token counting failed:', error);
      }

      const response = await claudeService.messages.create({
        system: FinalExamEvaluationService.getSectionSystemMessage(sectionNumber),
        messages,
        max_tokens: 1024
      });

      const responseText = response.content[0].type === 'text' 
        ? response.content[0].text 
        : '';

      return this.parseResponse(responseText, maxScore);

    } catch (error) {
      console.error(`Section ${sectionNumber} evaluation failed:`, error);
      throw new Error(`セクション${sectionNumber}の評価に失敗しました`);
    }
  }

  private parseResponse(responseText: string, maxScore: number): SectionEvaluationResponse {
    try {
      const jsonMatch = responseText.match(/{[\s\S]*}/);
      if (!jsonMatch) {
        throw new Error('レスポンスの解析に失敗しました');
      }

      const result: SectionEvaluationResponse = JSON.parse(jsonMatch[0]);

      if (!result.evaluation || 
          typeof result.evaluation.total_score !== 'number' ||
          !result.evaluation.feedback) {
        throw new Error('不完全なレスポンス形式です');
      }

      // スコアの範囲チェックと整数化
      result.evaluation.total_score = Math.max(0, Math.min(maxScore, 
        Math.round(result.evaluation.total_score)
      ));

      return result;

    } catch (error) {
      console.error('Response parsing failed:', error);
      throw new Error('評価結果の解析に失敗しました');
    }
  }
}

export const finalExamEvaluationService = new FinalExamEvaluationService();