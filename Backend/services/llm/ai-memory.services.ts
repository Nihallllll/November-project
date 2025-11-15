import prisma from "../../config/database";
import { PostgresQueryService } from "../postgres-query.service";

export class AIMemoryService {
  // Save memory (hybrid approach)
  static async saveMemory(
    aiNodeId: string,
    runId: string,
    flowId: string,
    userId: string,
    data: any,
    config: {
      useUserDB: boolean;
      dbCredentialId?: string;
      tableName?: string;
    }
  ): Promise<void> {
    if (config.useUserDB && config.dbCredentialId && config.tableName) {
      // Save to user's database
      await PostgresQueryService.executeWrite(config.dbCredentialId, {
        table: config.tableName,
        operation: 'INSERT',
        data: {
          ai_node_id: aiNodeId,
          run_id: runId,
          flow_id: flowId,
          data: JSON.stringify(data),
          created_at: new Date(),
        },
      });
    } else {
      // Fallback: Save to AIMemory table (24hr TTL)
      // Note: aiNodeId might not exist in AINodeConfig table yet
      // This is a simple conversation log, not tied to specific config
      try {
        await prisma.aIMemory.create({
          data: {
            aiNodeId,
            runId,
            flowId,
            userId,
            data,
            summary: JSON.stringify(data).substring(0, 500),
          },
        });
      } catch (error: any) {
        // If aiNodeConfig doesn't exist, skip memory save (non-critical)
        console.warn(`Failed to save AI memory: ${error.message}`);
      }
    }
  }

  // Retrieve memory
  static async getMemory(
    aiNodeId: string,
    config: {
      useUserDB: boolean;
      dbCredentialId?: string;
      tableName?: string;
    }
  ): Promise<any[]> {
    if (config.useUserDB && config.dbCredentialId && config.tableName) {
      // Get from user's database
      return await PostgresQueryService.executeQuery(config.dbCredentialId, {
        query: `SELECT * FROM ${config.tableName} WHERE ai_node_id = $1 ORDER BY created_at DESC LIMIT 10`,
        params: [aiNodeId],
      });
    } else {
      // Fallback: Get from AIMemory table
      const memories = await prisma.aIMemory.findMany({
        where: { aiNodeId },
        orderBy: { createdAt: 'desc' },
        take: 10,
      });
      return memories.map((m) => m.data);
    }
  }
}
