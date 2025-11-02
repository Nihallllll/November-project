import prisma from "../config/database";
import getConnection from "../config/web3";
import { RunRepositories } from "../repositories/run.repositories";
import type { FlowJson, Node } from "../types/flow.types";
import { getNodeHandler } from "./registry";

export async function executeFlow(runId: string) {
    try {
        console.log(`🚀 Starting execution for run: ${runId}`);
        
        // 1. Update run status to running
        await RunRepositories.updateStatus(runId, "running");
        
        // 2. Load the run with flow
        const run = await prisma.run.findUnique({
            where: { id: runId },
            include: { flow: true }
        });
        
        if (!run || !run.flow) {
            throw new Error("Run or Flow not found");
        }
        
        const flowJson = run.flow.json;
        
        console.log(`📋 Flow has ${flowJson.nodes.length} nodes`);
        
        // 3. Execute all nodes
        const result = await executeNodes(flowJson, runId);
        
        // 4. Mark as completed
        await RunRepositories.updateStatus(
            runId,
            "completed",
            result
        );
        
        console.log(`✅ Flow execution completed for run: ${runId}`);
        
    } catch (error: any) {
        console.error(`❌ Flow execution failed for run: ${runId}`, error);
        
        await RunRepositories.updateStatus(
            runId,
            "failed",
            undefined,
            error.message
        );
        
        throw error;
    }
}

async function executeNodes(flowJson: FlowJson, runId: string) {
    console.log("📝 Executing nodes...");
    
    const results: any[] = [];
    let previousOutput : any = null;
    // For now, execute nodes in order (we'll add connection logic later)
    for (const node of flowJson.nodes) {
        const nodeOutput = await executeNode(node, runId ,previousOutput);
        results.push(nodeOutput);
        previousOutput = nodeOutput ;
        // Simulate work
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    return {
        completed: true,
        nodeCount: flowJson.nodes.length,
        results
    };
}

async function executeNode(node: Node, runId: string, input?: any) {
  console.log(`  ⚙️ Executing node: ${node.type} (${node.id})`);
  
  try {
    // Get the handler for this node type
    const handler = getNodeHandler(node.type);
    
    // Create execution context
    const context = {
      runId,
      flowId: "unknown",  // We can get this from run if needed
      userId: "unknown",
      logger: (msg: string) => console.log(`    💬 ${msg}`),
      saveNodeOutput: async (nodeId: string, output: any) => {
        await RunRepositories.saveNodeOutput(runId, nodeId, output);
      },
      web3 : {
        solana  :getConnection()
      }
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
      failed: true
    });
    
    throw error;
  }
}