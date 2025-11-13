/**
 * Node Connection Validation Rules
 * Inspired by n8n's connection validation system
 * Defines which node types can connect to each other and through which handles
 */

export interface HandleConfig {
  id: string;
  type: 'source' | 'target';
  position: 'top' | 'bottom' | 'left' | 'right';
  label?: string;
  dataType?: string[];
  acceptsFrom?: string[];
  maxConnections?: number;
}

export interface NodeConnectionConfig {
  inputs: HandleConfig[];
  outputs: HandleConfig[];
  category: 'trigger' | 'action' | 'data' | 'ai' | 'logic' | 'output';
}

/**
 * Data type definitions for smart connection validation
 */
export const DataTypes = {
  ANY: 'any',
  BLOCKCHAIN: 'blockchain',
  DATABASE: 'database',
  AI_CONTEXT: 'ai_context',
  CONDITION: 'condition',
  TRIGGER: 'trigger',
  HTTP: 'http',
  NOTIFICATION: 'notification',
} as const;

/**
 * Node connection configurations
 * Defines inputs, outputs, and validation rules for each node type
 */
export const nodeConnectionConfigs: Record<string, NodeConnectionConfig> = {
  // TRIGGER NODES
  schedule: {
    category: 'trigger',
    inputs: [],
    outputs: [
      { id: 'output', type: 'source', position: 'right', dataType: [DataTypes.TRIGGER, DataTypes.ANY] }
    ],
  },
  webhook: {
    category: 'trigger',
    inputs: [],
    outputs: [
      { id: 'output', type: 'source', position: 'right', dataType: [DataTypes.TRIGGER, DataTypes.HTTP, DataTypes.ANY] }
    ],
  },
  watchWallet: {
    category: 'trigger',
    inputs: [],
    outputs: [
      { id: 'output', type: 'source', position: 'right', dataType: [DataTypes.TRIGGER, DataTypes.BLOCKCHAIN, DataTypes.ANY] }
    ],
  },

  // AI NODES
  ai: {
    category: 'ai',
    inputs: [
      { 
        id: 'input', 
        type: 'target', 
        position: 'left', 
        label: 'Data In',
        dataType: [DataTypes.ANY],
      },
      { 
        id: 'database', 
        type: 'target', 
        position: 'bottom', 
        label: 'Database',
        dataType: [DataTypes.DATABASE],
        acceptsFrom: ['postgresDB'],
      },
    ],
    outputs: [
      { id: 'output', type: 'source', position: 'right', dataType: [DataTypes.AI_CONTEXT, DataTypes.ANY] }
    ],
  },

  // DATA NODES
  postgresDB: {
    category: 'data',
    inputs: [
      { id: 'input', type: 'target', position: 'left', dataType: [DataTypes.ANY] }
    ],
    outputs: [
      { id: 'output', type: 'source', position: 'right', dataType: [DataTypes.DATABASE, DataTypes.ANY] }
    ],
  },
  httpRequest: {
    category: 'data',
    inputs: [
      { id: 'input', type: 'target', position: 'left', dataType: [DataTypes.ANY] }
    ],
    outputs: [
      { id: 'output', type: 'source', position: 'right', dataType: [DataTypes.HTTP, DataTypes.ANY] }
    ],
  },
  solanaRPC: {
    category: 'data',
    inputs: [
      { id: 'input', type: 'target', position: 'left', dataType: [DataTypes.ANY] }
    ],
    outputs: [
      { id: 'output', type: 'source', position: 'right', dataType: [DataTypes.BLOCKCHAIN, DataTypes.ANY] }
    ],
  },
  walletBalance: {
    category: 'data',
    inputs: [
      { id: 'input', type: 'target', position: 'left', dataType: [DataTypes.ANY] }
    ],
    outputs: [
      { id: 'output', type: 'source', position: 'right', dataType: [DataTypes.BLOCKCHAIN, DataTypes.ANY] }
    ],
  },
  heliusIndexer: {
    category: 'data',
    inputs: [
      { id: 'input', type: 'target', position: 'left', dataType: [DataTypes.ANY] }
    ],
    outputs: [
      { id: 'output', type: 'source', position: 'right', dataType: [DataTypes.BLOCKCHAIN, DataTypes.ANY] }
    ],
  },
  pythPrice: {
    category: 'data',
    inputs: [
      { id: 'input', type: 'target', position: 'left', dataType: [DataTypes.ANY] }
    ],
    outputs: [
      { id: 'output', type: 'source', position: 'right', dataType: [DataTypes.BLOCKCHAIN, DataTypes.ANY] }
    ],
  },

  // LOGIC NODES
  condition: {
    category: 'logic',
    inputs: [
      { id: 'input', type: 'target', position: 'top', dataType: [DataTypes.ANY] }
    ],
    outputs: [
      { id: 'true', type: 'source', position: 'bottom', label: 'True', dataType: [DataTypes.CONDITION, DataTypes.ANY] },
      { id: 'false', type: 'source', position: 'bottom', label: 'False', dataType: [DataTypes.CONDITION, DataTypes.ANY] }
    ],
  },
  merge: {
    category: 'logic',
    inputs: [
      { 
        id: 'input', 
        type: 'target', 
        position: 'left', 
        dataType: [DataTypes.ANY],
        maxConnections: 999, // Unlimited
      }
    ],
    outputs: [
      { id: 'output', type: 'source', position: 'right', dataType: [DataTypes.ANY] }
    ],
  },
  delay: {
    category: 'logic',
    inputs: [
      { id: 'input', type: 'target', position: 'left', dataType: [DataTypes.ANY] }
    ],
    outputs: [
      { id: 'output', type: 'source', position: 'right', dataType: [DataTypes.ANY] }
    ],
  },

  // ACTION NODES (Blockchain)
  jupiter: {
    category: 'action',
    inputs: [
      { id: 'input', type: 'target', position: 'left', dataType: [DataTypes.ANY] }
    ],
    outputs: [
      { id: 'output', type: 'source', position: 'right', dataType: [DataTypes.BLOCKCHAIN, DataTypes.ANY] }
    ],
  },
  tokenProgram: {
    category: 'action',
    inputs: [
      { id: 'input', type: 'target', position: 'left', dataType: [DataTypes.ANY] }
    ],
    outputs: [
      { id: 'output', type: 'source', position: 'right', dataType: [DataTypes.BLOCKCHAIN, DataTypes.ANY] }
    ],
  },

  // OUTPUT NODES (Can have outputs for chaining)
  telegram: {
    category: 'output',
    inputs: [
      { id: 'input', type: 'target', position: 'left', dataType: [DataTypes.ANY] }
    ],
    outputs: [
      { id: 'output', type: 'source', position: 'right', dataType: [DataTypes.NOTIFICATION, DataTypes.ANY] }
    ],
  },
  email: {
    category: 'output',
    inputs: [
      { id: 'input', type: 'target', position: 'left', dataType: [DataTypes.ANY] }
    ],
    outputs: [
      { id: 'output', type: 'source', position: 'right', dataType: [DataTypes.NOTIFICATION, DataTypes.ANY] }
    ],
  },
  log: {
    category: 'output',
    inputs: [
      { id: 'input', type: 'target', position: 'left', dataType: [DataTypes.ANY] }
    ],
    outputs: [
      { id: 'output', type: 'source', position: 'right', dataType: [DataTypes.ANY] }
    ],
  },
};

/**
 * Validates if a connection between two nodes is allowed
 * Uses smart validation based on data types and node categories
 */
export function isValidConnection(
  sourceNodeType: string,
  sourceHandleId: string,
  targetNodeType: string,
  targetHandleId: string,
  existingEdges?: any[]
): { valid: boolean; reason?: string } {
  const sourceConfig = nodeConnectionConfigs[sourceNodeType];
  const targetConfig = nodeConnectionConfigs[targetNodeType];

  // Allow connections if node types aren't configured (backward compatibility)
  if (!sourceConfig || !targetConfig) {
    return { valid: true };
  }

  // Find the specific handles
  const sourceHandle = sourceConfig.outputs.find(h => h.id === sourceHandleId);
  const targetHandle = targetConfig.inputs.find(h => h.id === targetHandleId);

  if (!sourceHandle || !targetHandle) {
    return { valid: false, reason: 'Invalid handle configuration' };
  }

  // Check if target has specific node type restrictions
  if (targetHandle.acceptsFrom && targetHandle.acceptsFrom.length > 0) {
    if (!targetHandle.acceptsFrom.includes(sourceNodeType)) {
      return { 
        valid: false, 
        reason: `${targetHandle.label || 'This input'} only accepts connections from: ${targetHandle.acceptsFrom.join(', ')}` 
      };
    }
  }

  // Check data type compatibility
  if (sourceHandle.dataType && targetHandle.dataType) {
    const hasCompatibleType = sourceHandle.dataType.some(sourceType => 
      targetHandle.dataType!.includes(sourceType) || 
      sourceType === DataTypes.ANY || 
      targetHandle.dataType!.includes(DataTypes.ANY)
    );

    if (!hasCompatibleType) {
      return { 
        valid: false, 
        reason: `Incompatible data types: ${sourceHandle.dataType.join(', ')} → ${targetHandle.dataType.join(', ')}` 
      };
    }
  }

  // Check max connections for target handle
  if (targetHandle.maxConnections && existingEdges) {
    const existingConnectionsToTarget = existingEdges.filter(
      edge => edge.target === targetNodeType && edge.targetHandle === targetHandleId
    ).length;

    if (existingConnectionsToTarget >= targetHandle.maxConnections) {
      return { 
        valid: false, 
        reason: `Maximum ${targetHandle.maxConnections} connection(s) allowed for this input` 
      };
    }
  }

  return { valid: true };
}

/**
 * Gets all valid target handles for a given source handle
 * Useful for UI hints and connection suggestions
 */
export function getValidTargets(
  sourceNodeType: string,
  sourceHandleId: string
): string[] {
  const sourceConfig = nodeConnectionConfigs[sourceNodeType];
  if (!sourceConfig) return [];

  const sourceHandle = sourceConfig.outputs.find(h => h.id === sourceHandleId);
  if (!sourceHandle) return [];

  const validTargets: string[] = [];

  Object.entries(nodeConnectionConfigs).forEach(([nodeType, config]) => {
    config.inputs.forEach(targetHandle => {
      const validation = isValidConnection(sourceNodeType, sourceHandleId, nodeType, targetHandle.id);
      if (validation.valid) {
        validTargets.push(nodeType);
      }
    });
  });

  return [...new Set(validTargets)];
}

/**
 * Gets connection validation rules for display in UI
 */
export function getConnectionRules(nodeType: string): string[] {
  const config = nodeConnectionConfigs[nodeType];
  if (!config) return [];

  const rules: string[] = [];

  config.inputs.forEach(input => {
    if (input.acceptsFrom && input.acceptsFrom.length > 0) {
      rules.push(`${input.label || input.id}: Only from ${input.acceptsFrom.join(', ')}`);
    }
    if (input.maxConnections && input.maxConnections < 999) {
      rules.push(`${input.label || input.id}: Max ${input.maxConnections} connection(s)`);
    }
  });

  return rules;
}
