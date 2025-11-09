export interface AINodeData {
  credentialId: string;               // LLM API credential
  provider: 'ANTHROPIC' | 'OPENAI';
  modelName: string;                  // e.g., "claude-sonnet-4", "gpt-4-turbo"
  systemPrompt: string;
  userGoal: string;
  temperature?: number;
  maxTokens?: number;
  maxRetries?: number;
  
  // Hybrid Memory Config
  useUserDBForMemory?: boolean;
  memoryTableName?: string;
  memoryDBCredentialId?: string;
  
  // Available Tools
  availableNodes?: string[];          // Node IDs AI can use
  availableDBs?: string[];            // DB credential IDs AI can query
}

export interface AIToolCall {
  id: string;
  type: 'node' | 'database' | 'memory';
  name: string;
  parameters: any;
}

export interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  toolCalls?: AIToolCall[];
  toolResults?: any[];
}

export interface AIConversation {
  messages: AIMessage[];
  metadata?: {
    nodeOutputs?: Record<string, any>;
    dbQueryResults?: any[];
  };
}

export interface LLMResponse {
  content: string;
  toolCalls?: AIToolCall[];
  finishReason: 'stop' | 'tool_use' | 'length' | 'error';
  usage?: {
    inputTokens: number;
    outputTokens: number;
  };
}

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, any>;
    required?: string[];
  };
}
