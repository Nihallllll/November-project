import type { Connection as SolanaConnection } from "@solana/web3.js";



// ========== FLOW DEFINITION TYPES ==========

export interface Node {
  id: string;
  type: string; // e.g., "http_request", "condition", "telegram_send"
  data: Record<string, any>; // Node-specific configuration
}

export interface Connection {
  from: string; // Source node ID
  to: string;   // Target node ID
  condition?: string; // Optional: for conditional branching
}

export interface Trigger {
  type: 'cron' | 'webhook' | 'onchain' | 'manual';
  config: Record<string, any>;
}

// The complete flow JSON structure (what users design)
export interface FlowJson {
  nodes: Node[];
  connections: Connection[];
  trigger: Trigger;
}

// ========== DATABASE MODEL TYPES ==========

export interface Flow {
  id: string;
  name: string;
  ownerId: string;
  json: FlowJson;
  status: 'active' | 'inactive' | 'draft';
  createdAt: Date;
  updatedAt: Date;
}

export interface Run {
  id: string;
  flowId: string;
  status: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';
  input: any;
  output?: any;
  error?: string;
  createdAt: Date;
  finishedAt?: Date;
}

export interface NodeOutput {
  id: string;
  runId: string;
  nodeId: string;
  output: any;
  error?: string;
  createdAt: Date;
}

// ========== EXECUTION CONTEXT ==========

// Context passed to node handlers during execution
export interface ExecutionContext {
  runId: string;
  flowId: string;
  userId: string;
  logger: (message: string) => void;
  saveNodeOutput: (nodeId: string, output: any) => Promise<void>;
  web3?: {
    solana : SolanaConnection
  }
  getCredential?: (credentialId: string) => Promise<any>;
  decryptCredential?: (encryptedData: any) => any;
}

// ========== API REQUEST/RESPONSE TYPES ==========

export interface CreateFlowRequest {
  name: string;
  flowJson: FlowJson;
}

export interface TriggerFlowRequest {
  input?: any;
}

export interface FlowTrigger {
  type: 'manual' | 'schedule' | 'webhook';  // ← Add 'schedule'
  config: {
    schedule?: string;  // ← NEW: Cron or interval
    [key: string]: any;
  };
}

export interface PostgresDBNodeData {
  credentialId: string;
  mode: 'READ' | 'WRITE' | 'BOTH';
  schema: PostgresSchema;
  useUserDBForMemory?: boolean;  // If true, AI stores memory here
  memoryTableName?: string;       // Table for AI memory (default: "ai_memory")
}

export interface PostgresSchema {
  tables: PostgresTable[];
}

export interface PostgresTable {
  name: string;
  columns: Record<string, PostgresColumn>;
}

export interface PostgresColumn {
  type: string;         // e.g., "varchar", "integer", "numeric", "timestamp"
  nullable?: boolean;
  default?: any;
  primaryKey?: boolean;
  unique?: boolean;
}

export interface PostgresQueryParams {
  query: string;
  params?: any[];
}

export interface PostgresWriteParams {
  table: string;
  data: Record<string, any>;
  operation: 'INSERT' | 'UPDATE' | 'DELETE';
  where?: Record<string, any>;  // For UPDATE/DELETE
}

export interface PostgresConnectionConfig {
  connectionUrl: string;  // Decrypted
  maxConnections?: number;
  idleTimeoutMillis?: number;
}
