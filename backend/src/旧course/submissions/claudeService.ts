// src/courses/submissions/claudeService.ts

import { Anthropic } from '@anthropic-ai/sdk';
import axios from 'axios';

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const CLAUDE_API_URL = 'https://api.anthropic.com/v1';
const CLAUDE_MODEL = "claude-3-5-sonnet-20241022" as const;

const anthropic = new Anthropic({
  apiKey: ANTHROPIC_API_KEY,
  defaultHeaders: {
    'anthropic-version': '2023-06-01',
    'content-type': 'application/json'
  }
});

interface SimpleMessage {
  role: "user" | "assistant";
  content: string;
}

class ClaudeService {
  private readonly defaultHeaders = {
    'x-api-key': ANTHROPIC_API_KEY,
    'anthropic-version': '2023-06-01',
    'anthropic-beta': 'token-counting-2024-11-01',
    'content-type': 'application/json'
  };

  async countTokens(messages: SimpleMessage[], systemMessage?: string) {
    try {
      console.log('\n=== トークン数計算リクエスト ===');
      console.log('システムメッセージ:', systemMessage);
      console.log('メッセージ数:', messages.length);

      const response = await axios.post(
        `${CLAUDE_API_URL}/messages/count_tokens`,
        {
          model: CLAUDE_MODEL,
          messages: messages,
          system: systemMessage
        },
        {
          headers: this.defaultHeaders
        }
      );

      console.log('トークン数計算結果:', response.data);
      console.log('========================\n');
      return response.data;
    } catch (error) {
      console.error('\n=== トークン数計算エラー ===');
      console.error('エラー詳細:', error);
      console.error('========================\n');
      throw new Error('トークン数の計算に失敗しました');
    }
  }

  messages = {
    create: async (params: {
      system?: string;
      messages: SimpleMessage[];
      max_tokens?: number;
    }) => {
      try {
        const { systemMessage, messages } = this.formatMessages(params.messages);
        
        // リクエストログ
        console.log('\n=== Claude APIリクエスト ===');
        console.log('システムメッセージ:');
        console.log(params.system || systemMessage);
        console.log('\nユーザーメッセージ:');
        messages.forEach((msg, index) => {
          console.log(`[メッセージ ${index + 1}]`);
          console.log(msg.content);
        });

        const response = await anthropic.messages.create({
          model: CLAUDE_MODEL,
          max_tokens: params.max_tokens || 1024,
          system: params.system || systemMessage,
          messages: messages
        });

        // レスポンスログ
        console.log('\n=== Claude APIレスポンス ===');
        if (response.content[0].type === 'text') {
          console.log('回答内容:');
          console.log(response.content[0].text);
        }
        console.log('\n=== トークン使用状況 ===');
        console.log(`入力トークン数: ${response.usage.input_tokens}`);
        console.log(`出力トークン数: ${response.usage.output_tokens}`);
        console.log(`合計トークン数: ${response.usage.input_tokens + response.usage.output_tokens}`);
        console.log('========================\n');

        return response;
      } catch (error) {
        console.error('\n=== Claude APIエラー ===');
        console.error('エラー詳細:', error);
        console.error('========================\n');
        throw error;
      }
    }
  };


  private formatMessages(messages: SimpleMessage[]): {
    systemMessage: string;
    messages: SimpleMessage[];
  } {
    let systemMessage = '';
    const formattedMessages = messages
      .filter(msg => {
        if (msg.role === "assistant") {
          return false;
        }
        return true;
      })
      .map(msg => ({
        role: msg.role,
        content: msg.content.trim()
      }))
      .filter(msg => msg.content !== '') as SimpleMessage[];

    return { systemMessage, messages: formattedMessages };
  }
}

export const claudeService = new ClaudeService();