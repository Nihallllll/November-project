import prisma from "../config/database";
import getConnection from "../config/web3";
import { RunRepositories } from "../repositories/run.repositories";
import type { FlowJson, Node } from "../types/flow.types";
import { getNodeHandler } from "./registry";

export async function 
executeFlow(runId: string, userId: string) {
  try {
    console.log(`🚀 Starting execution for run: ${runId}`);

    // 1. Update run status to running
    await RunRepositories.updateStatus(runId, "RUNNING");

    // 2. Load the run with flow
    const run = await prisma.run.findUnique({
      where: { id: runId },
      include: { flow: true },
    });

    if (!run || !run.flow) {
      throw new Error("Run or Flow not found");
    }
    if (run.flow.userId !== userId) {
      throw new Error("Unauthorized: User does not own this flow");
    }
    const flowJson = run.flow.json as unknown as FlowJson;

    console.log(`📋 Flow has ${flowJson?.nodes.length} nodes`);

    // 3. Execute all nodes
    const result = await executeNodes(flowJson, runId , userId);

    // 4. Mark as completed
    await RunRepositories.updateStatus(runId, "COMPLETED", result);

    console.log(`✅ Flow execution completed for run: ${runId}`);
    return result;
  } catch (error: any) {
    console.error(`❌ Flow execution failed for run: ${runId}`, error);

    await RunRepositories.updateStatus(
      runId,
      "FAILED",
      undefined,
      error.message
    );

    throw error;
  }
}

async function executeNodes(flowJson: FlowJson, runId: string , userId : string) {
  console.log("📝 Executing nodes with graph-based execution...");

  // ========== VALIDATION: Check flowJson structure ==========
  if (!flowJson || !flowJson.nodes || !Array.isArray(flowJson.nodes)) {
    throw new Error(`Invalid flow JSON: nodes array is missing or invalid. Got: ${JSON.stringify(flowJson)}`);
  }
  
  if (!flowJson.connections || !Array.isArray(flowJson.connections)) {
    console.warn(`⚠️ No connections found in flow, initializing empty array`);
    flowJson.connections = [];
  }

  const results: any[] = [];
  const nodeOutputs = new Map<string, any>();  // Store all node outputs
  const executedNodes = new Set<string>();     // Track executed nodes
  
  // ========== STEP 1: BUILD DEPENDENCY GRAPH ==========
  const graph = buildDependencyGraph(flowJson.nodes, flowJson.connections);
  
  console.log(`  📊 Graph built: ${flowJson.nodes.length} nodes, ${flowJson.connections.length} connections`);
  
  // ========== STEP 2: FIND START NODES (NO DEPENDENCIES) ==========
  const startNodes = flowJson.nodes.filter(node => {
    const incomingConnections = getIncomingConnections(node.id, flowJson.connections);
    return incomingConnections.length === 0;
  });
  
  if (startNodes.length === 0) {
    throw new Error('Flow has no start nodes! Every node has incoming connections (possible cycle).');
  }
  
  console.log(`  🚀 Found ${startNodes.length} start node(s): ${startNodes.map(n => n.id).join(', ')}`);
  
  // ========== STEP 3: EXECUTE NODES IN DEPENDENCY ORDER ==========
  // Use topological sort + BFS traversal
  const queue: string[] = startNodes.map(n => n.id);
  
  while (queue.length > 0) {
    const nodeId = queue.shift()!;
    
    // Skip if already executed
    if (executedNodes.has(nodeId)) {
      continue;
    }
    
    // Get node data
    const node = flowJson.nodes.find(n => n.id === nodeId);
    if (!node) {
      console.log(`  ⚠️ Node ${nodeId} not found, skipping`);
      continue;
    }
    
    // ========== CHECK: ARE ALL DEPENDENCIES READY? ==========
    const parentNodes = getParentNodeIds(nodeId, flowJson.connections);
    const allParentsExecuted = parentNodes.every(parentId => executedNodes.has(parentId));
    
    if (!allParentsExecuted) {
      // Not ready yet, add back to queue (will retry later)
      queue.push(nodeId);
      continue;
    }
    
    // ========== CONDITIONAL BRANCHING: CHECK CONDITIONS ==========

    
    const shouldExecute = await checkIfNodeShouldExecute(node, flowJson.connections, nodeOutputs);
    
    if (!shouldExecute) {
      console.log(`  ⏭️ Skipping node ${node.id} (${node.type}) - condition not met`);
      executedNodes.add(nodeId);
      
      // Add child nodes to queue anyway (they might have other parents)
      const childNodes = getChildNodeIds(nodeId, flowJson.connections);
      queue.push(...childNodes);
      
      continue;
    }
    
    // ========== PREPARE INPUT ==========
    let input: any = null;
    
    if (isMergeNode(node)) {
      // MERGE NODE: Collect ALL parent outputs
      input = await getMergedInputFromParents(node.id, flowJson.connections, nodeOutputs);
      console.log(`  🔀 Merge node ${node.id}: combining ${Object.keys(input || {}).length} inputs`);
    } else {
      // REGULAR NODE: Get output from last parent
      input = getInputFromLastParent(node.id, flowJson.connections, nodeOutputs);
    }
    
    // ========== EXECUTE NODE ==========
    console.log(`  ⚙️ Executing: ${node.type} (${node.id})`);
    
    const nodeOutput = await executeNode(node, runId, userId, input);
    
    // Store output
    nodeOutputs.set(node.id, nodeOutput);
    executedNodes.add(nodeId);
    results.push(nodeOutput);
    
    // ========== ADD CHILD NODES TO QUEUE ==========
    const childNodes = getChildNodeIds(nodeId, flowJson.connections);
    queue.push(...childNodes);
    
    // Simulate work
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  console.log(`  ✅ Execution complete: ${executedNodes.size}/${flowJson.nodes.length} nodes executed`);

  return {
    completed: true,
    nodeCount: flowJson.nodes.length,
    executedCount: executedNodes.size,
    skippedCount: flowJson.nodes.length - executedNodes.size,
    results,
  };
}

async function executeNode(node: Node, runId: string,userId : string, input?: any) {
  console.log(`  ⚙️ Executing node: ${node.type} (${node.id})`);

  try {
    // Get the handler for this node type
    const handler = getNodeHandler(node.type);

    // Create execution context
    const context = {
      runId,
      flowId: "unknown", // We can get this from run if needed
      userId: userId,
      nodeId : node.id ,
      logger: (msg: string) => console.log(`    💬 ${msg}`),
      saveNodeOutput: async (nodeId: string, output: any) => {
        await RunRepositories.saveNodeOutput(runId, nodeId, output);
      },
      web3: {
        solana: getConnection(),
      },
    };

    // Execute the node!
    const output = await handler.execute(node.data, input, context);

    // Save output to database
    await RunRepositories.saveNodeOutput(runId, node.id, output);

    console.log(`    ✅ Node completed`);

    return output;
  } catch (error: any) {
    console.error(`    ❌ Node failed: ${error.message}`);

    // Save error to database
    await RunRepositories.saveNodeOutput(runId, node.id, {
      error: error.message,
      nodeId: node.id,
      failed: true,
    });

    throw error;
  }
}

// ========== HELPER FUNCTIONS ==========

/**
 * Build dependency graph from nodes and connections
 */
function buildDependencyGraph(nodes: Node[], connections: any[]): Map<string, string[]> {
  const graph = new Map<string, string[]>();
  
  // Initialize graph with all nodes
  for (const node of nodes) {
    graph.set(node.id, []);
  }
  
  // Add edges (dependencies)
  for (const conn of connections) {
    const children = graph.get(conn.from) || [];
    children.push(conn.to);
    graph.set(conn.from, children);
  }
  
  return graph;
}

/**
 * Get all incoming connections for a node
 */
function getIncomingConnections(nodeId: string, connections: any[]): any[] {
  return connections.filter(conn => conn.to === nodeId);
}

/**
 * Get all parent node IDs for a given node
 */
function getParentNodeIds(nodeId: string, connections: any[]): string[] {
  return getIncomingConnections(nodeId, connections).map(conn => conn.from);
}

/**
 * Get all child node IDs for a given node
 */
function getChildNodeIds(nodeId: string, connections: any[]): string[] {
  return connections.filter(conn => conn.from === nodeId).map(conn => conn.to);
}

/**
 * Check if a node is a merge node
 * AI nodes automatically merge multiple inputs
 */
function isMergeNode(node: Node): boolean {
  return node.type === 'merge' || node.type === 'ai';
}

/**
 * Check if a node should execute based on conditions
 * This implements CONDITIONAL BRANCHING logic
 */
async function checkIfNodeShouldExecute(
  node: Node,
  connections: any[],
  nodeOutputs: Map<string, any>
): Promise<boolean> {
  // Find incoming connections to this node
  const incomingConnections = getIncomingConnections(node.id, connections);
  
  // If no incoming connections, always execute (start node)
  if (incomingConnections.length === 0) {
    return true;
  }
  
  // Check each incoming connection for conditions
  for (const conn of incomingConnections) {
    const parentOutput = nodeOutputs.get(conn.from);
    
    // If parent hasn't executed yet, can't evaluate condition
    if (parentOutput === undefined) {
      continue;
    }
    
    // If connection has a condition, evaluate it
    if (conn.condition) {
      const conditionMet = evaluateConnectionCondition(conn.condition, parentOutput);
      
      if (!conditionMet) {
        console.log(`    ⛔ Connection condition failed: ${conn.condition}`);
        return false;
      }
    }
    
    // Special case: If parent is a condition node, check if it passed
    const parentNode = nodeOutputs.get(conn.from);
    if (parentNode && parentNode.passed === false) {
      console.log(`    ⛔ Parent condition node failed`);
      return false;
    }
  }
  
  // All conditions passed (or no conditions), execute the node
  return true;
}

/**
 * Evaluate a connection condition (simple boolean check)
 * Examples: "passed == true", "price > 100"
 */
function evaluateConnectionCondition(condition: string, parentOutput: any): boolean {
  try {
    // Simple condition evaluation
    // For production, use the same expr-eval library as condition node
    
    // Check for "passed" field (from condition node)
    if (condition === 'passed' || condition === 'passed == true') {
      return parentOutput.passed === true;
    }
    
    if (condition === '!passed' || condition === 'passed == false') {
      return parentOutput.passed === false;
    }
    
    // For other conditions, assume true for now
    // TODO: Implement full expression evaluation with expr-eval
    console.log(`    ⚠️ Connection condition "${condition}" not fully implemented, assuming true`);
    return true;
    
  } catch (error) {
    console.log(`    ⚠️ Error evaluating condition: ${error}`);
    return false;
  }
}

/**
 * Get outputs from multiple parent nodes and merge them
 */
async function getMergedInputFromParents(
  nodeId: string,
  connections: any[],
  nodeOutputs: Map<string, any>
): Promise<any> {
  const parentNodeIds = getParentNodeIds(nodeId, connections);
  
  if (parentNodeIds.length === 0) {
    return null;
  }
  
  // For merge nodes, collect ALL parent outputs with friendly names
  const merged: Record<string, any> = {};
  
  for (const parentId of parentNodeIds) {
    const parentOutput = nodeOutputs.get(parentId);
    if (parentOutput !== undefined) {
      // Extract node type from ID (e.g., "pyth_price-123" -> "pythPrice")
      const nodeType = parentId.split('-')[0]?.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase()) || parentId;
      merged[nodeType] = parentOutput;
    }
  }
  
  return merged;
}

/**
 * Get input from the last parent node (for regular nodes)
 */
function getInputFromLastParent(
  nodeId: string,
  connections: any[],
  nodeOutputs: Map<string, any>
): any {
  const parentNodeIds = getParentNodeIds(nodeId, connections);
  
  if (parentNodeIds.length === 0) {
    return null;
  }
  
  // Return output from the last parent
  const lastParentId = parentNodeIds[parentNodeIds.length - 1];
  if (!lastParentId) {
    return null;
  }
  return nodeOutputs.get(lastParentId) || null;
}
