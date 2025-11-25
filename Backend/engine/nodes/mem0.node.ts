import type { NodeHandler } from './node-handler.interface';
import axios from 'axios';

/**
 * MEM0 MEMORY NODE
 * ================
 * AI memory management using Mem0 Cloud API
 * 
 * Actions:
 * - add: Store new memories for AI context
 * - search: Semantic search through memories
 * - get_all: Retrieve all memories for user
 * - delete: Remove specific memory by ID
 * 
 * Configuration:
 * - action: 'add' | 'search' | 'get_all' | 'delete'
 * - messages: Array of conversation messages (for 'add')
 * - query: Search query string (for 'search')
 * - memory_id: Memory ID to delete (for 'delete')
 * 
 * Requires: MEM0_API_KEY in environment variables
 * Sign up: https://app.mem0.ai/
 */

const MEM0_BASE_URL = 'https://api.mem0.ai/v1';

export const mem0Node: NodeHandler = {
  type: 'mem0',
  
  execute: async (nodeData, input, context) => {
    const { action, messages, query, memory_id } = nodeData;
    
    // Get API key from environment
    const apiKey = process.env.MEM0_API_KEY;
    if (!apiKey) {
      throw new Error('MEM0_API_KEY not found in environment variables');
    }
    
    context.logger(`mem0: executing action "${action}" for user ${context.userId}`);
    
    try {
      const headers = {
        'Authorization': `Token ${apiKey}`,
        'Content-Type': 'application/json',
      };
      
      switch (action) {
        case 'add': {
          // Add new memories from conversation
          if (!messages || !Array.isArray(messages)) {
            throw new Error('messages array is required for "add" action');
          }
          
          const response = await axios.post(
            `${MEM0_BASE_URL}/memories/`,
            {
              messages,
              user_id: context.userId,
              metadata: {
                flow_id: context.flowId,
                run_id: context.runId,
              }
            },
            { headers }
          );
          
          context.logger(`mem0: added ${messages.length} messages to memory`);
          
          return {
            success: true,
            action: 'add',
            memory_id: response.data.id,
            memories: response.data.results || [],
            timestamp: new Date().toISOString(),
          };
        }
        
        case 'search': {
          // Semantic search through memories
          const searchQuery = query || (typeof input === 'string' ? input : JSON.stringify(input));
          
          if (!searchQuery) {
            throw new Error('query or input is required for "search" action');
          }
          
          const response = await axios.post(
            `${MEM0_BASE_URL}/memories/search/`,
            {
              query: searchQuery,
              user_id: context.userId,
            },
            { headers }
          );
          
          const memories = response.data.results || [];
          context.logger(`mem0: found ${memories.length} relevant memories`);
          
          return {
            success: true,
            action: 'search',
            query: searchQuery,
            memories,
            count: memories.length,
            timestamp: new Date().toISOString(),
          };
        }
        
        case 'get_all': {
          // Get all memories for user
          const response = await axios.get(
            `${MEM0_BASE_URL}/memories/`,
            {
              params: { user_id: context.userId },
              headers,
            }
          );
          
          const memories = response.data.results || [];
          context.logger(`mem0: retrieved ${memories.length} total memories`);
          
          return {
            success: true,
            action: 'get_all',
            memories,
            count: memories.length,
            timestamp: new Date().toISOString(),
          };
        }
        
        case 'delete': {
          // Delete specific memory
          if (!memory_id) {
            throw new Error('memory_id is required for "delete" action');
          }
          
          await axios.delete(
            `${MEM0_BASE_URL}/memories/${memory_id}/`,
            { headers }
          );
          
          context.logger(`mem0: deleted memory ${memory_id}`);
          
          return {
            success: true,
            action: 'delete',
            memory_id,
            timestamp: new Date().toISOString(),
          };
        }
        
        default:
          throw new Error(`Unknown action: ${action}. Valid actions: add, search, get_all, delete`);
      }
      
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message;
      context.logger(`mem0: error - ${errorMessage}`);
      
      return {
        success: false,
        action,
        error: errorMessage,
        timestamp: new Date().toISOString(),
      };
    }
  }
};