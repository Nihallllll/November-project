import prisma from "../../config/database";
import { PostgresQueryService } from "../postgres-query.service";

export class AIMemoryService {
  // Save memory (hybrid approach)
  static async saveMemory(
    nodeId: string,        // Flow node ID (e.g., "ai-1763363760913")
    flowId: string,
    runId: string,
    userId: string,
    data: any,
    config: {
      useUserDB: boolean;
      dbCredentialId?: string;
      tableName?: string;
    },
    aiConfig?: {           // AI configuration for creating AINodeConfig if needed
      provider: 'OPENAI' | 'GOOGLE';
      credentialId: string;
      modelName: string;
      systemPrompt: string;
      userGoal: string;
      temperature: number;
      maxTokens: number;
    }
  ): Promise<void> {
    if (config.useUserDB && config.dbCredentialId && config.tableName) {
      // Save to user's database
      await PostgresQueryService.executeWrite(config.dbCredentialId, {
        table: config.tableName,
        operation: 'INSERT',
        data: {
          ai_node_id: nodeId,
          run_id: runId,
          flow_id: flowId,
          data: JSON.stringify(data),
          created_at: new Date(),
        },
      });
    } else {
      // Fallback: Save to AIMemory table (24hr TTL)
      try {
        // Find or create AINodeConfig using compound unique key (flowId + nodeId)
        let aiNodeConfig = await prisma.aINodeConfig.findUnique({
          where: { 
            flowId_nodeId: {
              flowId,
              nodeId,
            }
          },
        });

        // If config doesn't exist and we have the data, create it
        if (!aiNodeConfig && aiConfig) {
          aiNodeConfig = await prisma.aINodeConfig.create({
            data: {
              nodeId,
              flowId,
              userId,
              provider: aiConfig.provider,
              credentialId: aiConfig.credentialId,
              modelName: aiConfig.modelName,
              systemPrompt: aiConfig.systemPrompt,
              userGoal: aiConfig.userGoal,
              temperature: aiConfig.temperature,
              maxTokens: aiConfig.maxTokens,
            },
          });
          console.log(`Created AINodeConfig for ${nodeId}`);
        }

        if (!aiNodeConfig) {
          console.warn(`AINodeConfig not found for ${nodeId}, skipping memory save`);
          return;
        }
        
        // Now save the memory with the proper aiNodeId
        await prisma.aIMemory.create({
          data: {
            aiNodeId: aiNodeConfig.id,  // Use the UUID from AINodeConfig
            runId,
            flowId,
            userId,
            data,
            summary: JSON.stringify(data).substring(0, 500),
          },
        });
      } catch (error: any) {
        // If memory save fails, don't crash (non-critical)
        console.warn(`Failed to save AI memory: ${error.message}`);
        throw error;  // Re-throw so the AI node can log it
      }
    }
  }

  // Retrieve memory
  static async getMemory(
    nodeId: string,       // Flow node ID
    flowId: string,
    config: {
      useUserDB: boolean;
      dbCredentialId?: string;
      tableName?: string;
    }
  ): Promise<any[]> {
    try {
      if (config.useUserDB && config.dbCredentialId && config.tableName) {
        // Get from user's database
        return await PostgresQueryService.executeQuery(config.dbCredentialId, {
          query: `SELECT * FROM ${config.tableName} WHERE ai_node_id = $1 ORDER BY created_at DESC LIMIT 10`,
          params: [nodeId],
        });
      } else {
        // Fallback: Get from AIMemory table
        // Validate inputs
        if (!nodeId || !flowId) {
          console.warn(`getMemory called with invalid params: nodeId=${nodeId}, flowId=${flowId}`);
          return [];
        }

        // Find the AINodeConfig first using compound key
        const aiNodeConfig = await prisma.aINodeConfig.findUnique({
          where: { 
            flowId_nodeId: {
              flowId,
              nodeId,
            }
          },
        });

        if (!aiNodeConfig) {
          console.log(`No AINodeConfig found for nodeId=${nodeId}, flowId=${flowId}, returning empty memory`);
          return [];
        }

        const memories = await prisma.aIMemory.findMany({
          where: { aiNodeId: aiNodeConfig.id },  // Use the UUID
          orderBy: { createdAt: 'desc' },
          take: 10,
        });
        return memories.map((m) => m.data);
      }
    } catch (error: any) {
      console.error(`Failed to retrieve AI memory: ${error.message}`);
      return [];  // Return empty array on error (non-critical)
    }
  }
}
