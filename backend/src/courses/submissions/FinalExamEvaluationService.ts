// FinalExamEvaluationService.ts
import { claudeService } from './claudeService';
interface SectionEvaluationResult {
  score: number;
  feedback: string;
}

interface FinalExamEvaluationResult {
  section1: SectionEvaluationResult;
  section2: SectionEvaluationResult;
  section3: SectionEvaluationResult;
  totalScore: number;
}
export class FinalExamEvaluationService {
  private static readonly SECTION_MAX_SCORES = {
    1: 30,
    2: 30,
    3: 40
  } as const;

  // 各セクション用の評価メッセージ
  private static getSectionSystemMessage(sectionNumber: 1 | 2 | 3) {
    const maxScore = FinalExamEvaluationService.SECTION_MAX_SCORES[sectionNumber];
    return `あなたは教育評価者です。最終試験のセクション${sectionNumber}を評価します。
このセクションの配点は${maxScore}点です。

提出内容を評価し、以下の形式で返してください：

{
  "evaluation": {
    "score": 0から${maxScore}までの整数値,
    "feedback": "評価フィードバック（箇条書き禁止。改行なし）"
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
  }) {
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
      const response = await claudeService.messages.create({
        system: FinalExamEvaluationService.getSectionSystemMessage(sectionNumber),
        messages,
        max_tokens: 1024
      });

      const result = this.parseSectionEvaluation(response.content[0].text, maxScore);
      return result;

    } catch (error) {
      console.error(`Section ${sectionNumber} evaluation failed:`, error);
      throw new Error(`セクション${sectionNumber}の評価に失敗しました`);
    }
  }

  private parseSectionEvaluation(responseText: string, maxScore: number) {
    try {
      const jsonMatch = responseText.match(/{[\s\S]*}/);
      if (!jsonMatch) {
        throw new Error('評価結果の解析に失敗しました');
      }

      const result = JSON.parse(jsonMatch[0]);
      
      if (!result.evaluation?.score || !result.evaluation?.feedback) {
        throw new Error('不完全な評価結果です');
      }

      // スコアの範囲チェックと整数化
      return {
        score: Math.min(maxScore, Math.round(result.evaluation.score)),
        feedback: result.evaluation.feedback.trim()
      };
    } catch (error) {
      console.error('Evaluation parsing failed:', error);
      throw new Error('評価結果の解析に失敗しました');
    }
  }
}