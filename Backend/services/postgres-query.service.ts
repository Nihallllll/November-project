import { Pool } from 'pg';
import { PostgresConnectionService } from './postgres-connection.service';
import type { PostgresQueryParams, PostgresWriteParams } from '../types/flow.types';


export class PostgresQueryService {
  static async executeQuery(
    credentialId: string,
    params: PostgresQueryParams
  ): Promise<any[]> {
    const pool = await PostgresConnectionService.getPool(credentialId);
    
    try {
      const result = await pool.query(params.query, params.params || []);
      return result.rows;
    } catch (error :any) {
      throw new Error(`Query execution failed: ${error.message}`);
    }
  }

  static async executeWrite(
    credentialId: string,
    params: PostgresWriteParams
  ): Promise<any> {
    const pool = await PostgresConnectionService.getPool(credentialId);
    
    let query: string;
    let values: any[] = [];

    switch (params.operation) {
      case 'INSERT':
        const columns = Object.keys(params.data);
        const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
        values = Object.values(params.data);
        query = `INSERT INTO ${params.table} (${columns.join(', ')}) VALUES (${placeholders}) RETURNING *`;
        break;

      case 'UPDATE':
        if (!params.where) {
          throw new Error('WHERE clause required for UPDATE');
        }
        const setClauses = Object.keys(params.data).map((key, i) => `${key} = $${i + 1}`);
        const whereClause = Object.keys(params.where)
          .map((key, i) => `${key} = $${Object.keys(params.data).length + i + 1}`)
          .join(' AND ');
        values = [...Object.values(params.data), ...Object.values(params.where)];
        query = `UPDATE ${params.table} SET ${setClauses.join(', ')} WHERE ${whereClause} RETURNING *`;
        break;

      case 'DELETE':
        if (!params.where) {
          throw new Error('WHERE clause required for DELETE');
        }
        const deleteWhereClause = Object.keys(params.where)
          .map((key, i) => `${key} = $${i + 1}`)
          .join(' AND ');
        values = Object.values(params.where);
        query = `DELETE FROM ${params.table} WHERE ${deleteWhereClause} RETURNING *`;
        break;

      default:
        throw new Error(`Unknown operation: ${params.operation}`);
    }

    try {
      const result = await pool.query(query, values);
      return result.rows;
    } catch (error : any) {
      throw new Error(`Write operation failed: ${error.message}`);
    }
  }

  static async introspectSchema(credentialId: string): Promise<any> {
    const pool = await PostgresConnectionService.getPool(credentialId);
    
    const query = `
      SELECT 
        table_name,
        column_name,
        data_type,
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_schema = 'public'
      ORDER BY table_name, ordinal_position;
    `;

    try {
      const result = await pool.query(query);
      
      // Group by table
      const tables: Record<string, any> = {};
      for (const row of result.rows) {
        if (!tables[row.table_name]) {
          tables[row.table_name] = { name: row.table_name, columns: {} };
        }
        tables[row.table_name].columns[row.column_name] = {
          type: row.data_type,
          nullable: row.is_nullable === 'YES',
          default: row.column_default,
        };
      }

      return { tables: Object.values(tables) };
    } catch (error : any) {
      throw new Error(`Schema introspection failed: ${error.message}`);
    }
  }
}
