/**
 * ================================================================
 * AI NODE - LANGCHAIN.JS V1.0 (NOVEMBER 2025)
 * ================================================================
 * 
 * Using LangChain.js v1.0 with:
 * - Universal model support (OpenRouter, OpenAI, Anthropic, etc.)
 * - Built-in tool calling
 * - Conversation memory
 * - Agent capabilities
 * 
 * Docs: https://docs.langchain.com/
 * 
 * @version 7.0.0 - PRODUCTION READY
 * @date November 2025
 * ================================================================
 */

import type { NodeHandler } from './node-handler.interface';
import type { AINodeData } from '../../types/ai.types';
import { AIMemoryService } from '../../services/llm/ai-memory.services';
import { CredentialService } from '../../services/credentail.service';

// LangChain imports
import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage, SystemMessage, AIMessage } from '@langchain/core/messages';
import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';

/**
 * AI NODE - Universal support via LangChain
 */
export const aiNode: NodeHandler = {
  type: 'ai',

  execute: async (nodeData: Record<string, any>, input: any, context: any) => {
    const data = nodeData as AINodeData;
    
    const {
      credentialId,
      provider,
      modelName,
      systemPrompt,
      userGoal,
      temperature = 0.7,
      maxTokens = 2048,
      useUserDBForMemory = false,
      memoryTableName,
      memoryDBCredentialId,
      availableNodes = [],
      availableDBs = [],
    } = data;

    context.logger(`ai: starting AI execution (provider: ${provider}, model: ${modelName})`);

    try {
      // 1. Get LLM credentials
      const credential = await CredentialService.getCredential(
        credentialId,
        context.userId
      );

      const creds = CredentialService.decrypt(credential.data as string);
      const apiKey = creds.apiKey;
      const providerLower = (provider || creds.provider || 'openai').toLowerCase();
      const model = modelName || creds.modelName || getDefaultModel(providerLower);

      context.logger(`ai: using provider '${providerLower}' with model '${model}'`);

      // 2. Initialize LangChain model (works with OpenRouter!)
      const llm = createLangChainModel(providerLower, apiKey, model, temperature, maxTokens);

      // 3. Load previous memory
      const memoryConfig = {
        useUserDB: useUserDBForMemory,
        dbCredentialId: memoryDBCredentialId,
        tableName: memoryTableName,
      };

      const previousMemories = await AIMemoryService.getMemory(
        context.currentNodeId,
        memoryConfig
      );

      // 4. Build conversation messages
      const messages = [
        new SystemMessage(`${systemPrompt}\n\n### Previous Context:\n${JSON.stringify(previousMemories, null, 2)}`),
        new HumanMessage(`Input data:\n${JSON.stringify(input, null, 2)}\n\n### Task:\n${userGoal}`),
      ];

      // 5. Create tools if needed
      const tools = createTools(availableNodes, availableDBs, context);

      // 6. Call AI (with or without tools)
      let response;
      
      if (tools.length > 0) {
        // ✅ With tools (agent mode)
        context.logger(`ai: calling ${providerLower} with ${tools.length} tools...`);
        const llmWithTools = llm.bindTools(tools); // ✅ LangChain standardized tool calling
        response = await llmWithTools.invoke(messages);
      } else {
        // Without tools (simple chat)
        context.logger(`ai: calling ${providerLower} API...`);
        response = await llm.invoke(messages);
      }

      const responseText = response.content as string;
      const toolCalls = response.tool_calls || [];

      // 7. Execute tool calls if any
      let toolResults: any[] = [];
      if (toolCalls.length > 0) {
        context.logger(`ai: executing ${toolCalls.length} tool calls...`);
        
        for (const toolCall of toolCalls) {
          const tool = tools.find((t) => t.name === toolCall.name);
          if (tool) {
            try {
              const result = await tool.invoke(toolCall.args);
              toolResults.push({
                tool: toolCall.name,
                result,
                success: true,
              });
            } catch (error: any) {
              toolResults.push({
                tool: toolCall.name,
                error: error.message,
                success: false,
              });
            }
          }
        }
      }

      // 8. Get token usage (if available)
      const usage = (response as any).response_metadata?.usage || {};
      const promptTokens = usage.prompt_tokens || 0;
      const completionTokens = usage.completion_tokens || 0;

      context.logger(
        `ai: execution complete (${promptTokens} input tokens, ${completionTokens} output tokens)`
      );

      // 9. Save conversation to memory
      await AIMemoryService.saveMemory(
        context.currentNodeId,
        context.runId,
        context.flowId,
        context.userId,
        {
          conversation: [
            ...messages.map((m) => ({ role: m._getType(), content: m.content })),
            { role: 'assistant', content: responseText },
          ],
          metadata: {
            model,
            provider: providerLower,
            toolCalls: toolResults,
          },
          finalResponse: responseText,
        },
        memoryConfig
      );

      // 10. Return final result
      return {
        status: 'success',
        response: responseText,
        provider: providerLower,
        model,
        toolsUsed: toolCalls.length,
        toolResults,
        tokensUsed: {
          input: promptTokens,
          output: completionTokens,
        },
      };
    } catch (error: any) {
      context.logger(`ai: error - ${error.message}`);

      return {
        status: 'error',
        error: error.message,
        provider,
        modelName,
      };
    }
  },
};

// ================================================================
// HELPER FUNCTIONS
// ================================================================

/**
 * Create LangChain model (supports OpenRouter!)
 * Docs: https://docs.langchain.com/docs/integrations/chat/
 */
function createLangChainModel(
  provider: string,
  apiKey: string,
  model: string,
  temperature: number,
  maxTokens: number
): ChatOpenAI {
  const config: any = {
    apiKey,
    model,
    temperature,
    maxTokens,
  };

  // ✅ OpenRouter support via ChatOpenAI with custom baseURL
  // Source: https://docs.langchain.com/docs/integrations/chat/#chat-completions-api
  if (provider === 'openrouter') {
    config.configuration = {
      baseURL: 'https://openrouter.ai/api/v1',
      defaultHeaders: {
        'HTTP-Referer': 'https://your-app.com',
        'X-Title': 'Solana Automation Platform',
      },
    };
  } else if (provider === 'groq') {
    config.configuration = {
      baseURL: 'https://api.groq.com/openai/v1',
    };
  } else if (provider === 'together') {
    config.configuration = {
      baseURL: 'https://api.together.xyz/v1',
    };
  }

  return new ChatOpenAI(config);
}

/**
 * Get default model for each provider
 */
function getDefaultModel(provider: string): string {
  const defaults: Record<string, string> = {
    openai: 'gpt-3.5-turbo',
    openrouter: 'anthropic/claude-3.5-sonnet',
    groq: 'llama-3.1-70b-versatile',
    together: 'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo',
  };

  return defaults[provider] || 'gpt-3.5-turbo';
}

/**
 * Create LangChain tools from available nodes and DBs
 * Docs: https://docs.langchain.com/docs/modules/model_io/chat/function_calling/
 * 
 * NOTE: Tool execution is currently DISABLED for safety reasons.
 * Enabling AI to execute arbitrary nodes/queries requires:
 * 1. Proper permission system (which nodes can AI execute?)
 * 2. Rate limiting (prevent AI from spamming expensive operations)
 * 3. Cost tracking (executing nodes may incur costs)
 * 4. Cycle prevention (AI calling itself recursively)
 * 5. User approval workflow (for sensitive operations like transfers)
 * 
 * Current Implementation: Returns descriptive placeholders
 * Future: Import getNodeHandler and PostgresQueryService for real execution
 */
function createTools(
  availableNodes: any[],
  availableDBs: any[],
  context: any
): DynamicStructuredTool[] {
  const tools: DynamicStructuredTool[] = [];

  // ========== NODE EXECUTION TOOLS ==========
  // Currently disabled - see NOTE above
  
  for (const node of availableNodes) {
    tools.push(
      new DynamicStructuredTool({
        name: `execute_node_${node.id}`,
        description: `Execute node: ${node.type} (${node.id}). Use this to trigger ${node.type} node with custom inputs.`,
        schema: z.object({
          nodeId: z.string().describe('The ID of the node to execute'),
          inputs: z.record(z.string(), z.any()).describe('Input data for the node'),
        }),
        func: async ({ nodeId, inputs }) => {
          context.logger(`ai: tool attempting to execute node ${nodeId}`);
          
          // ⚠️ SAFETY: Node execution is disabled pending permission system
          // To enable: Uncomment and implement proper checks
          
          // // Import dynamically to avoid circular dependencies
          // const { getNodeHandler } = await import('../registry');
          // const handler = getNodeHandler(node.type);
          // 
          // // Execute with safety checks
          // if (!canAIExecuteNode(node.type, context.userId)) {
          //   throw new Error(`AI is not permitted to execute ${node.type} nodes`);
          // }
          // 
          // const result = await handler.execute(node.data, inputs, context);
          // return { success: true, nodeId, result };

          return {
            success: false,
            nodeId,
            message: 'Node execution via AI tools is currently disabled for safety',
            reason: 'Requires permission system, rate limiting, and approval workflow',
            nodeType: node.type,
            suggestion: 'Use node outputs already available in the flow instead',
          };
        },
      })
    );
  }

  // ========== DATABASE QUERY TOOLS ==========
  // Currently disabled - see NOTE above
  
  for (const db of availableDBs) {
    tools.push(
      new DynamicStructuredTool({
        name: `query_database_${db.id}`,
        description: `Query database: ${db.name} (${db.id}). Use this to run READ-ONLY SQL queries.`,
        schema: z.object({
          query: z.string().describe('SQL SELECT query to execute (READ-ONLY)'),
        }),
        func: async ({ query }) => {
          context.logger(`ai: tool attempting to query database ${db.id}`);
          
          // ⚠️ SAFETY: DB queries are disabled pending permission system
          // To enable: Uncomment and implement proper checks
          
          // // Import dynamically
          // const { PostgresQueryService } = await import('../../services/postgres-query.service');
          // 
          // // Validate READ-ONLY (prevent DELETE, UPDATE, DROP)
          // const queryUpper = query.trim().toUpperCase();
          // if (!queryUpper.startsWith('SELECT') && !queryUpper.startsWith('WITH')) {
          //   throw new Error('AI can only execute SELECT queries');
          // }
          // 
          // // Execute with row limit
          // const rows = await PostgresQueryService.executeQuery(db.credentialId, {
          //   query: query + ' LIMIT 100', // Force row limit
          //   params: []
          // });
          // 
          // return { success: true, rows, count: rows.length };

          return {
            success: false,
            databaseId: db.id,
            message: 'Database queries via AI tools are currently disabled for safety',
            reason: 'Requires SQL injection prevention, query cost limits, and audit logging',
            suggestion: 'Use postgres_db node in your flow instead',
          };
        },
      })
    );
  }

  return tools;
}

/**
 * Future: Permission check for AI node execution
 * Determines which node types AI is allowed to execute autonomously
 */
// function canAIExecuteNode(nodeType: string, userId: string): boolean {
//   // Whitelist of safe node types AI can execute
//   const safeNodeTypes = [
//     'http_request',  // External API calls
//     'log',           // Logging
//     'delay',         // Waiting
//   ];
//   
//   // Blacklist of dangerous node types AI should NEVER execute
//   const dangerousNodeTypes = [
//     'jupiter',       // Token swaps (money!)
//     'token_program', // Token transfers (money!)
//     'webhook',       // External notifications (spam risk)
//     'telegram',      // Messaging (spam risk)
//     'email',         // Email (spam risk)
//   ];
//   
//   if (dangerousNodeTypes.includes(nodeType)) {
//     return false;
//   }
//   
//   if (safeNodeTypes.includes(nodeType)) {
//     return true;
//   }
//   
//   // Default: require user approval
//   return false;
// }
