import type { NodeHandler } from './node-handler.interface';
import type { AINodeData, AIMessage, AIConversation, LLMResponse } from '../../types/ai.types';
import { ClaudeService } from '../../services/llm/claud.services';
import { OpenAIService } from '../../services/llm/openai.services';
import { LLMService } from '../../services/llm/llm.services';
import { AIToolService } from '../../services/llm/ai-tool.services';
import { AIMemoryService } from '../../services/llm/ai-memory.services';
import { CredentialService } from '../../services/credentail.service';

export const aiNode: NodeHandler = {
  type: 'ai',
  
  // ✅ FIX 1: Changed parameter type to match NodeHandler interface
  execute: async (nodeData: Record<string, any>, input: any, context: any) => {
    // ✅ Cast nodeData to AINodeData for type safety
    const data = nodeData as AINodeData;
    
    const {
      credentialId,
      provider,
      modelName,
      systemPrompt,
      userGoal,
      temperature,
      maxTokens,
      maxRetries = 5,
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
      
      // ✅ FIX 2: Cast credential.data to string (Prisma Json type)
      const apiKey = CredentialService.decrypt(credential.data as string).apiKey;

      // 2. Initialize LLM service
      const llmService: LLMService =
        provider === 'ANTHROPIC'
          ? new ClaudeService(apiKey)
          : new OpenAIService(apiKey);

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

      // 4. Build conversation with system + memory + user goal
      const conversation: AIConversation = {
        messages: [
          {
            role: 'system',
            content: `${systemPrompt}\n\nPrevious context:\n${JSON.stringify(previousMemories, null, 2)}`,
          },
          {
            role: 'user',
            content: userGoal,
          },
        ],
        metadata: {
          nodeOutputs: {},
          dbQueryResults: [],
        },
      };

      // 5. Generate tool definitions
      const nodeTools = AIToolService.generateNodeTools(availableNodes, context);
      const dbTools = AIToolService.generateDatabaseTools(availableDBs);
      const allTools = [...nodeTools, ...dbTools];

      context.logger(`ai: ${allTools.length} tools available`);

      // 6. Agentic loop (multi-turn with tool use)
      let attempts = 0;
      let finalResponse: LLMResponse | null = null;

      while (attempts < maxRetries) {
        attempts++;
        context.logger(`ai: attempt ${attempts}/${maxRetries}`);

        // Send message to LLM
        const response = await llmService.sendMessage(
          conversation.messages,
          allTools,
          { temperature, maxTokens, modelName }
        );

        finalResponse = response;

        // Check if we're done
        if (response.finishReason === 'stop') {
          context.logger(`ai: completed successfully`);
          break;
        }

        // Execute tool calls
        if (response.toolCalls && response.toolCalls.length > 0) {
          context.logger(`ai: executing ${response.toolCalls.length} tool calls`);

          const toolResults = [];
          for (const toolCall of response.toolCalls) {
            context.logger(`ai: calling tool ${toolCall.name}`);

            try {
              const result = await AIToolService.executeTool(toolCall, context);
              toolResults.push({
                toolCallId: toolCall.id,
                result,
                success: true,
              });

              // Store in metadata
              if (toolCall.name.startsWith('node_')) {
                const nodeId = toolCall.name.replace('node_', '');
                conversation.metadata!.nodeOutputs![nodeId] = result;
              } else if (toolCall.name.startsWith('db_query_')) {
                conversation.metadata!.dbQueryResults!.push(result);
              }
            } catch (error: any) {
              context.logger(`ai: tool ${toolCall.name} failed - ${error.message}`);
              toolResults.push({
                toolCallId: toolCall.id,
                error: error.message,
                success: false,
              });
            }
          }

          // Add assistant message + tool results to conversation
          conversation.messages.push({
            role: 'assistant',
            content: response.content,
            toolCalls: response.toolCalls,
            toolResults,
          });

          // Add user message with tool results
          conversation.messages.push({
            role: 'user',
            content: `Tool execution results:\n${JSON.stringify(toolResults, null, 2)}`,
          });
        } else {
          // No tool calls but not finished
          break;
        }
      }

      if (!finalResponse) {
        throw new Error('AI execution failed - no response from LLM');
      }

      // 7. Save conversation to memory
      await AIMemoryService.saveMemory(
        context.currentNodeId,
        context.runId,
        context.flowId,
        context.userId,
        {
          conversation: conversation.messages,
          metadata: conversation.metadata,
          finalResponse: finalResponse.content,
        },
        memoryConfig
      );

      context.logger(`ai: execution complete (${attempts} attempts, ${finalResponse.usage?.inputTokens || 0} input tokens, ${finalResponse.usage?.outputTokens || 0} output tokens)`);

      // 8. Return final result
      return {
        response: finalResponse.content,
        toolsUsed: Object.keys(conversation.metadata?.nodeOutputs || {}).length,
        dbQueriesRun: conversation.metadata?.dbQueryResults?.length || 0,
        tokensUsed: {
          input: finalResponse.usage?.inputTokens || 0,
          output: finalResponse.usage?.outputTokens || 0,
        },
        nodeOutputs: conversation.metadata?.nodeOutputs,
        conversationLength: conversation.messages.length,
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
