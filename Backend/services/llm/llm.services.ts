import type{ LLMResponse, AIMessage, ToolDefinition } from '../../types/ai.types';

export abstract class LLMService {
  abstract sendMessage(
    messages: AIMessage[],
    tools: ToolDefinition[],
    options: {
      temperature?: number;
      maxTokens?: number;
      modelName: string;
    }
  ): Promise<LLMResponse>;
  
  abstract getProvider(): string;
}
