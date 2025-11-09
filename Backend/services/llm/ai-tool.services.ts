import { getNodeHandler } from '../../engine/registry';
import type{ ToolDefinition, AIToolCall } from '../../types/ai.types';
import { PostgresQueryService } from '../postgres-query.service';


export class AIToolService {
  // Generate tool definitions for available nodes
  static generateNodeTools(nodeIds: string[], flowContext: any): ToolDefinition[] {
    const tools: ToolDefinition[] = [];

    for (const nodeId of nodeIds) {
      const node = flowContext.nodes.find((n: any) => n.id === nodeId);
      if (!node) continue;

      // Generate tool definition based on node type
      tools.push({
        name: `node_${nodeId}`,
        description: `Execute node: ${node.type} (${nodeId})`,
        parameters: {
          type: 'object',
          properties: {
            input: {
              type: 'object',
              description: 'Input data for the node',
            },
          },
          required: ['input'],
        },
      });
    }

    return tools;
  }

  // Generate tool definitions for databases
  static generateDatabaseTools(dbCredentialIds: string[]): ToolDefinition[] {
    return dbCredentialIds.map((credId) => ({
      name: `db_query_${credId}`,
      description: `Query database ${credId}`,
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'SQL query to execute',
          },
          params: {
            type: 'array',
            description: 'Query parameters',
            items: { type: 'string' },
          },
        },
        required: ['query'],
      },
    }));
  }

  // Execute tool call
  static async executeTool(
    toolCall: AIToolCall,
    flowContext: any
  ): Promise<any> {
    if (toolCall.name.startsWith('node_')) {
      // Execute node
      const nodeId = toolCall.name.replace('node_', '');
      const node = flowContext.nodes.find((n: any) => n.id === nodeId);
      
      if (!node) {
        throw new Error(`Node ${nodeId} not found`);
      }

      const handler = getNodeHandler(node.type);
      return await handler.execute(node.data, toolCall.parameters.input, flowContext);
    }

    if (toolCall.name.startsWith('db_query_')) {
      // Execute database query
      const credId = toolCall.name.replace('db_query_', '');
      return await PostgresQueryService.executeQuery(credId, {
        query: toolCall.parameters.query,
        params: toolCall.parameters.params || [],
      });
    }

    throw new Error(`Unknown tool: ${toolCall.name}`);
  }
}
