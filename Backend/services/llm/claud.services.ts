import Anthropic from '@anthropic-ai/sdk';
import { LLMService } from './llm.services';
import type{ LLMResponse, AIMessage, ToolDefinition } from '../../types/ai.types';

export class ClaudeService extends LLMService {
  private client: Anthropic;

  constructor(apiKey: string) {
    super();
    this.client = new Anthropic({ apiKey });
  }

  async sendMessage(
    messages: AIMessage[],
    tools: ToolDefinition[],
    options: {
      temperature?: number;
      maxTokens?: number;
      modelName: string;
    }
  ): Promise<LLMResponse> {
    try {
      // Convert messages to Claude format
      const claudeMessages = messages.map((msg) => ({
        role: (msg.role === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
        content: msg.content,
      }));

      // Convert tools to Claude format
      const claudeTools = tools.map((tool) => ({
        name: tool.name,
        description: tool.description,
        input_schema: tool.parameters,
      }));

      const response = await this.client.messages.create({
        model: options.modelName,
        max_tokens: options.maxTokens || 4000,
        temperature: options.temperature || 0.7,
        messages: claudeMessages,
        tools: claudeTools.length > 0 ? claudeTools : undefined,
      });

      // Parse response
      const content = response.content
        .filter((block: any) => block.type === 'text')
        .map((block: any) => block.text)
        .join('\n');

      const toolCalls = response.content
        .filter((block: any) => block.type === 'tool_use')
        .map((block: any) => ({
          id: block.id,
          type: 'node' as const,
          name: block.name,
          parameters: block.input,
        }));

      return {
        content,
        toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
        finishReason: response.stop_reason === 'end_turn' ? 'stop' : 'tool_use',
        usage: {
          inputTokens: response.usage.input_tokens,
          outputTokens: response.usage.output_tokens,
        },
      };
    } catch (error : any) {
      console.error('Claude API Error:', error);
      throw new Error(`Claude API failed: ${error.message}`);
    }
  }

  getProvider(): string {
    return 'ANTHROPIC';
  }
}
