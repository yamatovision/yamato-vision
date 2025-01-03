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
      return response.data;
    } catch (error) {
      console.error('Token counting failed:', error);
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
        
        return await anthropic.messages.create({
          model: CLAUDE_MODEL,
          max_tokens: params.max_tokens || 1024,
          system: params.system || systemMessage,
          messages: messages
        });
      } catch (error) {
        console.error('Error in create:', error);
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