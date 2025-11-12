export interface FlowNode {
  id: string;
  type: string;
  data: Record<string, any>;
  position?: { x: number; y: number };
}

export interface FlowConnection {
  from: string;
  to: string;
  condition?: string;
}

export interface FlowJson {
  nodes: FlowNode[];
  connections: FlowConnection[];
}

export interface Flow {
  id: string;
  name: string;
  description?: string;
  json: FlowJson;
  isActive: boolean;
  isScheduled: boolean;
  schedule?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFlowRequest {
  name: string;
  description?: string;
  json: FlowJson;
  isScheduled?: boolean;
  schedule?: string;
  isActive?: boolean;
}

export interface Run {
  id: string;
  flowId: string;
  status: 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  startedAt?: string;
  completedAt?: string;
  error?: string;
  metadata?: Record<string, any>;
}

export interface NodeOutput {
  id: string;
  runId: string;
  nodeId: string;
  output: any;
  error?: string;
  executionTime?: number;
  createdAt: string;
}

export interface Credential {
  id: string;
  name: string;
  type: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCredentialRequest {
  name: string;
  type: string;
  data: string; // Encrypted JSON string
}

export interface NodeType {
  type: string;
  label: string;
  category: string;
  icon: string;
  color: string;
  description: string;
}

export interface ExecutionContext {
  runId: string;
  flowId: string;
  userId: string;
  nodeId: string;
}

export type FlowStatus = 'active' | 'paused' | 'failed' | 'scheduled' | 'draft';
