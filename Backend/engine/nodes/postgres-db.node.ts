import { PostgresQueryService } from '../../services/postgres-query.service';
import type { PostgresQueryParams, PostgresWriteParams } from '../../types/flow.types';
import type { NodeHandler } from './node-handler.interface';


export const postgresDBNode: NodeHandler = {
  type: 'postgres_db',
  
  execute: async (nodeData, input, context) => {
    const { credentialId, mode, action } = nodeData;

    context.logger(`postgres_db: starting ${action} operation (mode: ${mode})`);

    // Validate mode
    if (!['READ', 'WRITE', 'BOTH'].includes(mode)) {
      context.logger(`postgres_db: invalid mode ${mode}`);
      return { status: 'error', error: `Invalid mode: ${mode}` };
    }

    try {
      // Handle different actions
      if (action === 'introspect') {
        const schema = await PostgresQueryService.introspectSchema(credentialId);
        context.logger(`postgres_db: introspected schema with ${schema.tables.length} tables`);
        return { status: 'success', schema };
      }

      if (action === 'query') {
        // Check mode
        if (mode === 'WRITE') {
          throw new Error('Node mode is WRITE-only, cannot perform READ query');
        }

        const queryParams: PostgresQueryParams = {
          query: nodeData.query,
          params: nodeData.queryParams || []
        };

        const rows = await PostgresQueryService.executeQuery(credentialId, queryParams);
        context.logger(`postgres_db: query returned ${rows.length} rows`);
        return { status: 'success', rows, count: rows.length };
      }

      if (action === 'write') {
        // Check mode
        if (mode === 'READ') {
          throw new Error('Node mode is READ-only, cannot perform WRITE operation');
        }

        const writeParams: PostgresWriteParams = {
          table: nodeData.table,
          data: nodeData.data,
          operation: nodeData.operation, // INSERT | UPDATE | DELETE
          where: nodeData.where
        };

        const result = await PostgresQueryService.executeWrite(credentialId, writeParams);
        context.logger(`postgres_db: ${nodeData.operation} affected ${result.length} rows`);
        return { status: 'success', operation: nodeData.operation, affected: result.length, data: result };
      }

      throw new Error(`Unknown action: ${action}`);

    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      context.logger(`postgres_db: error - ${msg}`);
      return { status: 'error', error: msg };
    }
  }
};
