import OpenAI from 'openai';
import { LLMService } from './llm.services';
import type { LLMResponse, AIMessage, ToolDefinition } from '../../types/ai.types';

export class OpenAIService extends LLMService {
  private client: OpenAI;

  constructor(apiKey: string) {
    super();
    this.client = new OpenAI({ apiKey });
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
      // Convert messages to OpenAI format
      const openaiMessages = messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      // Convert tools to OpenAI format
      const openaiTools = tools.map((tool) => ({
        type: 'function' as const,
        function: {
          name: tool.name,
          description: tool.description,
          parameters: tool.parameters,
        },
      }));

      const response = await this.client.chat.completions.create({
        model: options.modelName,
        max_tokens: options.maxTokens || 4000,
        temperature: options.temperature || 0.7,
        messages: openaiMessages,
        tools: openaiTools.length > 0 ? openaiTools : undefined,
      });

      const message = response.choices[0]?.message;

      const toolCalls = message!.tool_calls?.map((call: any) => ({
        id: call.id,
        type: 'node' as const,
        name: call.function.name,
        parameters: JSON.parse(call.function.arguments),
      }));

      return {
        content: message!.content || '',
        toolCalls: toolCalls,
        finishReason: response.choices?.[0]?.finish_reason === 'stop' ? 'stop' : 'tool_use',
        usage: {
          inputTokens: response.usage?.prompt_tokens || 0,
          outputTokens: response.usage?.completion_tokens || 0,
        },
      };
    } catch (error : any) {
      console.error('OpenAI API Error:', error);
      throw new Error(`OpenAI API failed: ${error.message}`);
    }
  }

  getProvider(): string {
    return 'OPENAI';
  }
}
